from django.db import transaction
from datetime import datetime
from CDnutz_core.models import (
    ServiceKeys, SyncData, VideoGame, MediaContent,
    AgeRatingOrganization, AgeRatingCategory, AgeRating,
    Company, Genre, Platform, Language, Mode, Region, Franchise,
    GameAgeRating, GameLanguage, GameCompany, GameRelease, PopularityScore
)
from collections import defaultdict

class Middleman:

    def __init__(self):
        # Caching small, static model objects in memory for reduced database lookup hits
        self.genres_cache       = {}
        self.modes_cache        = {}
        self.platforms_cache    = {}
        self.regions_cache      = {}
        self.languages_cache    = {}
        self.orgs_cache         = {}
        self.cats_cache         = {}
        self.pending_parents    = defaultdict(set)
        self.pending_bundles    = defaultdict(set)

    def write_secret(self, service, secret, expiry):

        ServiceKeys.objects.update_or_create(
            service  = service,
            defaults = {
                "access_token": secret,
                "expiry_date": expiry
            }
        )

    def read_secret(self, service):

        return (
            ServiceKeys.objects
            .filter(service=service)
            .values_list("access_token", flat=True)
            .first()
        )

    def record_entry(self, data_type):

        SyncData.objects.create(
            data=data_type,
            timestamp=int(datetime.now().timestamp())
        )

    def obtain_entry(self, data_type):

        return (
            SyncData.objects
            .filter(data=data_type)
            .order_by("-timestamp")
            .values_list("timestamp", flat=True)
            .first()
        )


    def _cache_lookup(self, model, ids, cache):

        obj_ids     = set(ids)
        missing_ids = obj_ids - cache.keys()
        objs        =  []

        if missing_ids:
            objs = model.objects.filter(igdb_id__in = missing_ids)

        for obj in objs:

            cache[obj.igdb_id] = obj

        return {i: cache.get(i) for i in ids}


    def _bulk_upsert(self, model, objects, update_fields, unique_fields = ("igdb_id",)):

        if not objects:
            return

        model.objects.bulk_create(
            objects,
            update_conflicts    = True,
            update_fields       = update_fields,
            unique_fields       = unique_fields
        )


    def _obj_lookup(self, model, key, field_name = "igdb_id"):

        return model.objects.in_bulk(
            key,
            field_name = field_name
        )


    def bulk_save(self, data, type = "games"):


        if type == "popularity":
            return self.save_popularity(data)

        with transaction.atomic():

            entities            = self.collect_entities(data) # Gather entities the cleaner returned into their own data structures

            self.upsert_base_entities(entities) # Insert independent entities [No relationship]

            lookups             = self.build_lookup_maps(entities) # Get back data in bulk for relationship mapping

            self.link_parents(entities, lookups)  # After obtaining GameID PK, link game to parent using PK

            resolved_bundles, resolved_parents = self.resolve_pending_relations(entities["games"]) # Resolve parent/bundle relations on hold

            self.link_franchises(entities, lookups) # After obtaining GameID PK & FranchiseID, link together

            ratings_db          = self.build_age_ratings(entities, lookups) # Building age rating pair [Org + Cat]

            relation_objects    = self.build_relation_objects(
                entities,
                lookups,
                ratings_db
            ) # Building relationships between models

            self.upsert_relations(relation_objects) # Pushing the relationships

            pending_parent_children = {child for children in self.pending_parents.values() for child in children}
            pending_bundle_children = {child for children in self.pending_bundles.values() for child in children}
            total_pending           = len(pending_parent_children | pending_bundle_children) # Games that are waiting for either relation [The union]

            return (len(entities["games"]), len(resolved_bundles), len(resolved_parents), total_pending)


    def save_popularity(self, data):

        skipped             = 0

        game_ids            = [p["game_id"] for p in data]

        games_db            = self._obj_lookup(VideoGame, game_ids)

        popularity_objects  = []

        for p in data:

            game = games_db.get(p["game_id"])

            if not game: # Game not in our DB at all
                skipped += 1
                continue

            popularity_objects.append(
                PopularityScore(
                    igdb_id         = p["igdb_id"],
                    video_game      = game,
                    popularity_type = p["popularity_type"],
                    value           = p["value"]
                )
            )

        self._bulk_upsert(
            PopularityScore,
            popularity_objects,
            ["value"],
            ("video_game", "popularity_type")
        )

        return (len(popularity_objects), skipped)


    def collect_entities(self, data):

        games           = []
        parents         = []

        # Using dicts to avoid object duplication in memory & facilitate bulk upserting
        franchises      = {}
        genres          = {}
        modes           = {}
        platforms       = {}
        regions         = {}
        companies       = {}
        languages       = {}
        rating_orgs     = {}
        rating_cats     = {}

        # Raw data: (game_igdbID, model object) for modelling & creating relationships
        genres_raw      = []
        modes_raw       = []
        franchises_raw  = []
        bundles_raw     = []
        releases_raw    = []
        companies_raw   = []
        languages_raw   = []
        age_ratings_raw = []
        media_raw       = []

        for entry in data:

            game, parent = entry["game"] # get the game and its parent, if any
            games.append(game)

            if parent:
                parents.append((game.igdb_id, parent)) # game_id + parent_id

            if entry["bundles"]:
                for b in entry["bundles"]:

                    bundles_raw.append((game.igdb_id, b))

            for g in entry["genres"]:
                genres[g.igdb_id] = g
                genres_raw.append((game.igdb_id, g))

            for m in entry["modes"]:
                modes[m.igdb_id] = m
                modes_raw.append((game.igdb_id, m))

            for f in entry["franchises"]:
                franchises[f.igdb_id] = f
                franchises_raw.append((game.igdb_id, f))

            for r in entry["age_ratings"]:
                rating_orgs[r["organization"].igdb_id]  = r["organization"]
                rating_cats[r["category"].igdb_id]      = r["category"]
                age_ratings_raw.append((game.igdb_id, r))

            for rel in entry["releases"]:
                platforms[rel["platform"].igdb_id]  = rel["platform"]
                regions[rel["region"].igdb_id]      = rel["region"]
                releases_raw.append((game.igdb_id, rel))

            for c in entry["companies"]:
                companies[c["company"].igdb_id] = c["company"]
                companies_raw.append((game.igdb_id, c))

            for l in entry["languages"]:
                languages[l["language"].igdb_id] = l["language"]
                languages_raw.append((game.igdb_id, l))

            for m in entry["media"]:
                media_raw.append((game.igdb_id, m))

        return {
            "games"             : games,
            "parents"           : parents,
            "franchises"        : franchises,
            "genres"            : genres,
            "modes"             : modes,
            "platforms"         : platforms,
            "regions"           : regions,
            "companies"         : companies,
            "languages"         : languages,
            "rating_orgs"       : rating_orgs,
            "rating_cats"       : rating_cats,
            "genres_raw"        : genres_raw,
            "modes_raw"         : modes_raw,
            "franchises_raw"    : franchises_raw,
            "bundles_raw"       : bundles_raw,
            "releases_raw"      : releases_raw,
            "companies_raw"     : companies_raw,
            "languages_raw"     : languages_raw,
            "age_ratings_raw"   : age_ratings_raw,
            "media_raw"         : media_raw
        }


    def upsert_base_entities(self, e):

        self._bulk_upsert(VideoGame, e["games"],
            ["title", "cover", "summary", "score", "game_type"])

        self._bulk_upsert(Franchise, e["franchises"].values(), ["name"])
        self._bulk_upsert(Genre, e["genres"].values(), ["name"])
        self._bulk_upsert(Mode, e["modes"].values(), ["name"])
        self._bulk_upsert(Platform, e["platforms"].values(), ["name"])
        self._bulk_upsert(Region, e["regions"].values(), ["name"])
        self._bulk_upsert(Company, e["companies"].values(), ["name", "website"])
        self._bulk_upsert(Language, e["languages"].values(), ["name"])

        self._bulk_upsert(
            AgeRatingOrganization,
            e["rating_orgs"].values(),
            ["name"]
        )

        self._bulk_upsert(
            AgeRatingCategory,
            e["rating_cats"].values(),
            ["name"]
        )


    def build_lookup_maps(self, e):

        games_db = self._obj_lookup(
            VideoGame,
            [g.igdb_id for g in e["games"]]
        )

        franchises_db = self._obj_lookup(
            Franchise,
            [f for f in e["franchises"].keys()]
        )

        companies_db = self._obj_lookup(
            Company,
            e["companies"].keys()
        )

        genres_db    = self._cache_lookup(
            Genre,
            e["genres"].keys(),
            self.genres_cache
        )

        modes_db     = self._cache_lookup(
            Mode,
            e["modes"].keys(),
            self.modes_cache
        )

        platforms_db = self._cache_lookup(
            Platform,
            e["platforms"].keys(),
            self.platforms_cache
        )

        regions_db = self._cache_lookup(
            Region,
            e["regions"].keys(),
            self.regions_cache
        )

        languages_db = self._cache_lookup(
            Language,
            e["languages"].keys(),
            self.languages_cache
        )

        orgs_db = self._cache_lookup(
            AgeRatingOrganization,
            e["rating_orgs"].keys(),
            self.orgs_cache
        )

        cats_db = self._cache_lookup(
            AgeRatingCategory,
            e["rating_cats"].keys(),
            self.cats_cache
        )

        return {
            "games_db"       : games_db,
            "genres_db"      : genres_db,
            "modes_db"       : modes_db,
            "franchises_db"  : franchises_db,
            "platforms_db"   : platforms_db,
            "regions_db"     : regions_db,
            "companies_db"   : companies_db,
            "languages_db"   : languages_db,
            "orgs_db"        : orgs_db,
            "cats_db"        : cats_db
        }


    def link_parents(self, e, lookups):

        parent_updates  = []
        games_db        = lookups["games_db"]

        missing_parent_ids = {
            parent_id
            for _, parent_id in e["parents"]
            if parent_id not in games_db
        } # Parent games not available in current batch

        if missing_parent_ids: # If any missing parent ids from current batch, look them up in DB
            parent_lookup = self._obj_lookup(VideoGame, list(missing_parent_ids))
            games_db.update(parent_lookup) # If missing parents found in DB, add them to our current batch of games

        for child_id, parent_id in e["parents"]:

            child   = games_db.get(child_id)
            parent  = games_db.get(parent_id)

            if not parent:
                self.pending_parents[parent_id].add(child_id) # Resolve it later
                continue

            child.parent_game = parent
            parent_updates.append(child)


        if parent_updates: # Update game to point to its parent
            VideoGame.objects.bulk_update(
                parent_updates,
                ["parent_game"]
            )


    def link_franchises(self, e, lookups):

        franchise_updates   = []
        games_db            = lookups["games_db"]
        franchise_db        = lookups["franchises_db"]

        for g, f in e["franchises_raw"]:

            game            = games_db[g]
            franchise       = franchise_db[f.igdb_id]

            game.franchise  = franchise
            franchise_updates.append(game)

        VideoGame.objects.bulk_update(
            franchise_updates,
            ["franchise"]
        ) # Update game to point to its franchise


    def build_age_ratings(self, e, lookups):

        rating_pairs = {}

        for _, r in e["age_ratings_raw"]:

            org = lookups["orgs_db"][r["organization"].igdb_id]
            cat = lookups["cats_db"][r["category"].igdb_id]

            key = (org.pk, cat.pk)

            if key not in rating_pairs:

                rating_pairs[key]   = AgeRating(
                    age_rating_org  = org,
                    age_rating_cat  = cat
                )

        AgeRating.objects.bulk_create(
            rating_pairs.values(),
            ignore_conflicts=True
        )

        ratings_db = {
            (r.age_rating_org_id, r.age_rating_cat_id): r
            for r in AgeRating.objects.filter(
                age_rating_org_id__in = [o.pk for o in lookups["orgs_db"].values()],
                age_rating_cat_id__in = [c.pk for c in lookups["cats_db"].values()]
            )
        }

        return ratings_db


    def build_relation_objects(self, e, lookups, ratings_db):

        game_genres_objects     = []
        game_modes_objects      = []
        game_bundle_objects     = []
        game_age_rating_objects = []
        release_objects         = []
        company_objects         = []
        language_objects        = []
        media_objects           = []


        missing_bundle_ids = {
            bundle_id
            for _, bundle_id in e["bundles_raw"]
            if bundle_id not in lookups["games_db"]
        }

        if missing_bundle_ids:
            extra = self._obj_lookup(VideoGame, list(missing_bundle_ids))
            lookups["games_db"].update(extra)


        for game_id, g in e["genres_raw"]:

            game_genres_objects.append(
                VideoGame.genres.through(
                    videogame_id = lookups["games_db"][game_id].pk,
                    genre_id     = lookups["genres_db"][g.igdb_id].pk,
                )
            )


        for game_id, m in e["modes_raw"]:

            game_modes_objects.append(
                VideoGame.modes.through(
                    videogame_id = lookups["games_db"][game_id].pk,
                    mode_id     = lookups["modes_db"][m.igdb_id].pk,
                )
            )


        for game_id, bundle_id in e["bundles_raw"]:

            game   = lookups["games_db"].get(game_id)
            bundle = lookups["games_db"].get(bundle_id)

            if game and bundle:
                game_bundle_objects.append((game, bundle))

            else:
                self.pending_bundles[bundle_id].add(game_id) # bundle not in current batch/DB yet, wait for future batches to resolve


        for game_id, r in e["age_ratings_raw"]:

            game = lookups["games_db"][game_id]
            org  = lookups["orgs_db"][r["organization"].igdb_id]
            cat  = lookups["cats_db"][r["category"].igdb_id]

            rating = ratings_db[(org.pk, cat.pk)]

            game_age_rating_objects.append(
                GameAgeRating(
                    igdb_id     = r["igdb_id"],
                    game        = game,
                    age_rating  = rating
                )
            )

        for game_id, rel in e["releases_raw"]:

            release_objects.append(
                GameRelease(
                    igdb_id         = rel["igdb_id"],
                    game            = lookups["games_db"][game_id],
                    platform        = lookups["platforms_db"][rel["platform"].igdb_id],
                    region          = lookups["regions_db"][rel["region"].igdb_id],
                    release_date    = rel["release_date"],
                    date_precision  = rel["precision"]
                )
            )

        for game_id, c in e["companies_raw"]:

            company_objects.append(
                GameCompany(
                    igdb_id         = c["igdb_id"],
                    game            = lookups["games_db"][game_id],
                    company         = lookups["companies_db"][c["company"].igdb_id],
                    developer       = c["developer"],
                    publisher       = c["publisher"]
                )
            )

        for game_id, l in e["languages_raw"]:

            language_objects.append(
                GameLanguage(
                    igdb_id         = l["igdb_id"],
                    game            = lookups["games_db"][game_id],
                    language        = lookups["languages_db"][l["language"].igdb_id],
                    audio           = l["audio"],
                    subtitle        = l["subtitle"],
                    interface       = l["interface"]
                )
            )

        for game_id, m in e["media_raw"]:

            media_objects.append(
                MediaContent(
                    igdb_id         = m["igdb_id"],
                    video_game      = lookups["games_db"][game_id],
                    media_type      = m["type"],
                    title           = m.get("title"),
                    media_content   = m["url"],
                    animated        = m.get("animated", False),
                    artwork_type    = m.get("art_type")
                )
            )

        return {
            "game_genres_objects"       : game_genres_objects,
            "game_modes_objects"        : game_modes_objects,
            "game_bundle_objects"       : game_bundle_objects,
            "game_age_rating_objects"   : game_age_rating_objects,
            "release_objects"           : release_objects,
            "company_objects"           : company_objects,
            "language_objects"          : language_objects,
            "media_objects"             : media_objects
        }


    def upsert_relations(self, r):

        if r["game_bundle_objects"]:
            Through = VideoGame.bundle.through

            bundle_links = [
                Through( # Django's auto-generated through table
                    from_videogame_id = game.pk,
                    to_videogame_id   = bundle.pk
                )
                for game, bundle in r["game_bundle_objects"]
            ]

            Through.objects.bulk_create(
                bundle_links,
                ignore_conflicts = True
            )

        VideoGame.genres.through.objects.bulk_create(
            r["game_genres_objects"],
            ignore_conflicts = True
        )

        VideoGame.modes.through.objects.bulk_create(
            r["game_modes_objects"],
            ignore_conflicts = True
        )

        self._bulk_upsert(
            GameAgeRating,
            r["game_age_rating_objects"],
            ["game", "age_rating"]
        )

        self._bulk_upsert(
            GameRelease,
            r["release_objects"],
            ["release_date", "date_precision"]
        )

        self._bulk_upsert(
            GameCompany,
            r["company_objects"],
            ["developer", "publisher"]
        )

        self._bulk_upsert(
            GameLanguage,
            r["language_objects"],
            ["audio", "subtitle", "interface"]
        )

        self._bulk_upsert(
            MediaContent,
            r["media_objects"],
            ["title", "media_content", "media_type", "animated", "artwork_type"],
            ("igdb_id", "media_type")
        )


    def resolve_pending_relations(self, new_games):

        if not self.pending_bundles and not self.pending_parents:
            return [], []

        new_ids = {g.igdb_id for g in new_games}

        resolved_bundles = []
        resolved_parents = []

        # Collect ALL pending IDs, not just ones in new_ids
        all_pending_bundle_ids  = set(self.pending_bundles.keys())
        all_pending_parent_ids  = set(self.pending_parents.keys())

        # Look up which ones already exist in DB (arrived in earlier batches)
        existing_bundles = set(
            self._obj_lookup(VideoGame, list(all_pending_bundle_ids)).keys()
        )
        existing_parents = set(
            self._obj_lookup(VideoGame, list(all_pending_parent_ids)).keys()
        )

        # Resolve against new batch AND anything already in DB
        resolvable_bundles  = all_pending_bundle_ids & (new_ids | existing_bundles)
        resolvable_parents  = all_pending_parent_ids & (new_ids | existing_parents)

        for bundle_id in list(resolvable_bundles):

            game_ids = self.pending_bundles[bundle_id]
            ids      = set(game_ids) | {bundle_id}
            games_db = self._obj_lookup(VideoGame, list(ids))
            bundle   = games_db.get(bundle_id)

            if not bundle:
                continue

            for game_id in game_ids:

                game = games_db.get(game_id)

                if game:
                    resolved_bundles.append((game.pk, bundle.pk))

            del self.pending_bundles[bundle_id]

        for parent_id in list(resolvable_parents):

            child_ids = self.pending_parents[parent_id]
            ids       = set(child_ids) | {parent_id}
            games_db  = self._obj_lookup(VideoGame, list(ids))
            parent    = games_db.get(parent_id)

            if not parent:
                continue

            for child_id in child_ids:

                child = games_db.get(child_id)
                if child:
                    child.parent_game = parent
                    resolved_parents.append(child)

            del self.pending_parents[parent_id]

        if resolved_bundles:
            Through = VideoGame.bundle.through
            Through.objects.bulk_create(
                [Through(from_videogame_id=g, to_videogame_id=b) for g, b in resolved_bundles],
                ignore_conflicts=True
            )

        if resolved_parents:
            VideoGame.objects.bulk_update(resolved_parents, ["parent_game"])

        return resolved_bundles, resolved_parents
