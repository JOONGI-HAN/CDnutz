from datetime import datetime

# For the sake of instantiating objects before sending them to be saved
from CDnutz_core.models import (
    VideoGame,
    AgeRatingOrganization, AgeRatingCategory, Franchise,
    Company, Genre, Platform, Language, Mode, Region
)
from CDnutz_core.enums import MediaType


class Cleaner:

    def process_data(self, data, type = "games"):

        if type == "popularity":

            return {
                "igdb_id"           : data["id"],
                "game_id"           : data["game_id"],
                "popularity_type"   : data["popularity_type"]["id"],
                "value"             : data["value"],
            }

        else:

            return {
                "game"          : self._extract_game(data),
                "genres"        : self._extract_genres(data),
                "modes"         : self._extract_modes(data),
                "media"         : self._extract_media(data),
                "age_ratings"   : self._extract_age_ratings(data),
                "releases"      : self._extract_releases(data),
                "companies"     : self._extract_companies(data),
                "languages"     : self._extract_languages(data),
                "bundles"       : self._extract_bundles(data),
                "franchises"    : self._extract_franchises(data)
            }

    def _extract_game(self, data):

        score = data.get("total_rating")

        if score is not None:
            score = round(float(score), 2)

        return (VideoGame(
            igdb_id         = data["id"],
            title           = data.get("name"),
            summary         = data.get("summary"),
            game_type       = data.get("game_type"),
            score           = score,
            cover           = data.get("cover", {}).get("image_id"),
        ), data.get("parent_game")) # will need to resolve parent_game's PK upon saving to DB

    def _extract_bundles(self, data):

        return data.get("bundles", [])

    def _extract_franchises(self, data):

        return [
            Franchise(
                igdb_id = f["id"],
                name    = f["name"]
            )
            for f in data.get("collections", [])
        ]

    def _extract_genres(self, data):

        return [
            Genre(
                igdb_id = g["id"],
                name    = g["name"]
            )
            for g in data.get("genres", [])
        ]

    def _extract_modes(self, data):

        return [
            Mode(
                igdb_id = m["id"],
                name    = m["name"]
            )
            for m in data.get("game_modes", [])
        ]

    def _extract_media(self, data):

        media = []

        for ss in data.get("screenshots", []):

            media.append({
                "igdb_id"   : ss["id"],
                "url"       : ss["image_id"],
                "type"      : MediaType.SCREENSHOT,
                "animated"  : ss.get("animated", False)
            })

        for art in data.get("artworks", []):

            media.append({
                "igdb_id"   : art["id"],
                "url"       : art["image_id"],
                "title"     : art.get("name"),
                "type"      : MediaType.ARTWORK,
                "art_type"  : art.get("artwork_type"),
                "animated"  : art.get("animated", False)
            })

        for video in data.get("videos", []):

            media.append({
                "igdb_id"   : video["id"],
                "url"       : video["video_id"],
                "title"     : video.get("name"),
                "type"      : MediaType.VIDEO
            })

        return media

    def _extract_age_ratings(self, data):

        ratings = []

        for r in data.get("age_ratings", []):

            org = AgeRatingOrganization(
                igdb_id = r["organization"]["id"],
                name    = r["organization"]["name"]
            )

            cat = AgeRatingCategory(
                igdb_id = r["rating_category"]["id"],
                name    = r["rating_category"]["rating"]
            )

            ratings.append({
                "igdb_id"       : r["id"],
                "organization"  : org,
                "category"      : cat
            })

        return ratings

    def _extract_releases(self, data):

        releases = []

        for r in data.get("release_dates", []):

            date, precision = None, None

            if r.get("human"):
                date, precision = self._fix_date(r["human"])

            platform = Platform(
                igdb_id = r["platform"]["id"],
                name    = r["platform"]["name"]
            )

            region = Region(
                igdb_id = r["release_region"]["id"],
                name    = r["release_region"]["region"]
            )

            releases.append({
                "igdb_id"       : r["id"],
                "platform"      : platform,
                "region"        : region,
                "release_date"  : date,
                "precision"     : precision
            })

        return releases

    def _extract_companies(self, data):

        companies = []

        for c in data.get("involved_companies", []):

            company_data = c.get("company")

            if not company_data:      # Guarding against missing company data
                continue

            website = None

            try:
                website = c["company"]["websites"][0]["url"]
            except (KeyError, IndexError):
                pass

            company = Company(
                igdb_id = company_data["id"],
                name    = company_data["name"],
                website = website
            )

            companies.append({
                "igdb_id"   : c["id"],
                "company"   : company,
                "developer" : c.get("developer", False),
                "publisher" : c.get("publisher", False)
            })

        return companies

    def _extract_languages(self, data):

        languages = {}

        for l in data.get("language_supports", []):

            lang_id     = l["language"]["id"]
            lang_name   = l["language"]["name"]
            support     = l["language_support_type"]["name"]

            if lang_id not in languages:

                languages[lang_id] = {
                    "igdb_id"   : l["id"],
                    "language"  : Language(
                        igdb_id = lang_id,
                        name    = lang_name
                    ),
                    "audio"     : False,
                    "subtitle"  : False,
                    "interface" : False,
                }

            if support == "Audio":
                languages[lang_id]["audio"] = True

            elif support == "Subtitles":
                languages[lang_id]["subtitle"] = True

            elif support == "Interface":
                languages[lang_id]["interface"] = True

        return list(languages.values())


    @staticmethod
    def _fix_date(date_str):

        if not date_str or date_str == "TBD":
            return (None, None)

        formats = [
            ("%b %d, %Y", "YYYY-MM-DD"),
            ("%b, %Y", "YYYY-MM"),
            ("%Y", "YYYY"),
        ]

        for fmt, precision in formats:

            try:
                return (
                    datetime.strptime(date_str, fmt).date().isoformat(),
                    precision
                )

            except ValueError:
                continue

        return (None, None)
