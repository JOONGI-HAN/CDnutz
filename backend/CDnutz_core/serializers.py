from rest_framework import serializers
from .enums import MediaType, ArtworkType
from .models import (VideoGame, Genre, Mode, AgeRatingCategory, AgeRatingOrganization,
    Platform, Region, Company, Language, GameCompany, GameRelease, GameLanguage,
    AgeRating
)
import CDnutz_core.utils as utils

import re


class VideoGameSerializer(serializers.ModelSerializer):
    cover     = serializers.SerializerMethodField()
    game_type = serializers.CharField(source = 'get_game_type_display')

    def get_cover(self, obj):
        return utils.construct_igdb_url(obj.cover, "cover_small")
    class Meta:
        model = VideoGame
        fields = ["id", "title", "cover", "game_type"]


class DashboardSerializer(serializers.ModelSerializer):
    cover      = serializers.SerializerMethodField()
    developers = serializers.SerializerMethodField()
    platforms  = serializers.SerializerMethodField()

    def get_cover(self, obj):
        priority_map = {
            (MediaType.ARTWORK,    ArtworkType.KEY_ART_NO_LOGO) : 1,
            (MediaType.ARTWORK,    ArtworkType.ARTWORK)          : 2,
            (MediaType.SCREENSHOT, None)                         : 3,
        }

        chosen          = None
        chosen_priority = float('inf')

        for m in obj.media.all():
            key = (m.media_type, m.artwork_type)
            if key in priority_map:
                p = priority_map[key]
                if p < chosen_priority:
                    chosen          = m
                    chosen_priority = p
                    if p == 1:
                        break

        return chosen.url if chosen else None

    def get_developers(self, obj):
        return [gc.company.name for gc in obj.game_companies.all()]

    def get_platforms(self, obj):
        return {gr.platform.name for gr in obj.game_releases.all()}

    class Meta:
        model  = VideoGame
        fields = ["id", "title", "cover", "developers", "platforms"]


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Genre
        fields = ["id", "name"]


class ModeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Mode
        fields = ["id", "name"]


class AgeRatingOrgSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AgeRatingOrganization
        fields = ["id", "name"]


class AgeRatingCatSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AgeRatingCategory
        fields = ["id", "name"]


class AgeRatingSerializer(serializers.ModelSerializer):
    age_rating_org = AgeRatingOrgSerializer()
    age_rating_cat = AgeRatingCatSerializer()

    class Meta:
        model  = AgeRating
        fields = ["id", "age_rating_org", "age_rating_cat", "cover"]


class PlatformSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Platform
        fields = ["id", "name"]


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Region
        fields = ["id", "name"]


class ReleaseSerializer(serializers.ModelSerializer):
    platform = PlatformSerializer()
    region   = RegionSerializer()
    date     = serializers.ReadOnlyField(source = 'formatted_release_date')

    class Meta:
        model  = GameRelease
        fields = ["id", "platform", "region", "date"]


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Company
        fields = ["id", "name", "website"]


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Language
        fields = ["id", "name"]


class VideoGameDetailsSerializer(serializers.ModelSerializer):
    genres        = GenreSerializer(many     = True)
    modes         = ModeSerializer(many      = True)
    age_ratings   = AgeRatingSerializer(many = True)
    releases = ReleaseSerializer(source      = 'game_releases', many = True)

    release_date  = serializers.SerializerMethodField()
    cover         = serializers.SerializerMethodField()
    wallpaper     = serializers.SerializerMethodField()
    trailer       = serializers.SerializerMethodField()
    media         = serializers.SerializerMethodField()
    companies     = serializers.SerializerMethodField()
    languages     = serializers.SerializerMethodField()

    game_type     = serializers.CharField(source = 'get_game_type_display')

    _logo_types = {
        ArtworkType.GAME_LOGO_WHITE,
        ArtworkType.GAME_LOGO_BLACK,
        ArtworkType.GAME_LOGO_COLOR,
    }

    _key_art_types = {
        ArtworkType.KEY_ART_NO_LOGO,
        ArtworkType.KEY_ART_WITH_LOGO,
    }

    def _partition_media(self, obj):
        cache_key = f'_media_{obj.pk}'
        if hasattr(self, cache_key):
            return getattr(self, cache_key)

        screenshots    = []
        artworks       = []
        logos          = []
        key_arts       = []
        videos         = []
        wallpaper      = None
        trailer        = None
        fallback_video = None

        for m in obj.media.all():
            if m.media_type == MediaType.SCREENSHOT:
                screenshots.append({"id": m.id, "url": m.url})

            elif m.media_type == MediaType.ARTWORK:
                item = {"id": m.id, "title": m.title, "url": m.url}
                if m.artwork_type in self._logo_types:
                    logos.append(item)
                elif m.artwork_type in self._key_art_types:
                    key_arts.append(item)
                    if wallpaper is None and m.artwork_type == ArtworkType.KEY_ART_NO_LOGO and not m.animated:
                        wallpaper = {"id": m.id, "url": m.url}
                else:
                    artworks.append(item)

            elif m.media_type == MediaType.VIDEO:
                videos.append({"id": m.id, "title": m.title, "url": m.url})
                if trailer is None and m.title and re.search(r"trailer", m.title, re.IGNORECASE):
                    trailer = m.url
                if fallback_video is None:
                    fallback_video = m.url

        result = {
            "wallpaper" : wallpaper,
            "trailer"   : trailer or fallback_video,
            "media"     : {
                "screenshots" : screenshots,
                "artworks"    : artworks,
                "logos"       : logos,
                "key_arts"    : key_arts,
                "videos"      : videos,
            },
        }

        setattr(self, cache_key, result)
        return result

    def get_release_date(self, obj):
        dates = [d.formatted_release_date for d in obj.game_releases.all() if d.formatted_release_date]
        return min(dates) if dates else None

    def get_cover(self, obj):
        return utils.construct_igdb_url(obj.cover)

    def get_wallpaper(self, obj):
        return self._partition_media(obj)["wallpaper"]

    def get_trailer(self, obj):
        return self._partition_media(obj)["trailer"]

    def get_media(self, obj):
        return self._partition_media(obj)["media"]

    def get_companies(self, obj):
        companies = {
            "developers" : [],
            "publishers" : [],
        }
        for gc in obj.game_companies.all():
            if gc.developer:
                companies["developers"].append({"id": gc.company.id, "name": gc.company.name, "website": gc.company.website})
            if gc.publisher:
                companies["publishers"].append({"id": gc.company.id, "name": gc.company.name, "website": gc.company.website})
        return companies

    def get_languages(self, obj):
        languages = {
            "audio"     : [],
            "subtitle"  : [],
            "interface" : [],
        }
        for gl in obj.game_languages.all():
            lang = {"id": gl.language.id, "name": gl.language.name}
            if gl.audio:
                languages["audio"].append(lang)
            if gl.subtitle:
                languages["subtitle"].append(lang)
            if gl.interface:
                languages["interface"].append(lang)
        return languages

    class Meta:
        model  = VideoGame
        fields = [
            "id", "title", "cover", "wallpaper", "trailer", "summary", "release_date", "game_type",
            "score", "genres", "modes", "age_ratings", "releases", "languages",
            "companies", "media",
        ]


class GuessTheGameSerializer(serializers.ModelSerializer):
    genres        = GenreSerializer(many     = True)
    release_date  = serializers.SerializerMethodField()
    companies     = serializers.SerializerMethodField()
    cover         = serializers.SerializerMethodField()
    game_type     = serializers.CharField(source = 'get_game_type_display')

    def get_cover(self, obj):
        return utils.construct_igdb_url(obj.cover)

    def get_release_date(self, obj):
        dates = [d.formatted_release_date for d in obj.game_releases.all() if d.formatted_release_date]
        return min(dates) if dates else None

    def get_companies(self, obj):
        companies = {
            "developers" : [],
            "publishers" : [],
        }
        for gc in obj.game_companies.all():
            if gc.developer:
                companies["developers"].append({"id": gc.company.id, "name": gc.company.name, "website": gc.company.website})
            if gc.publisher:
                companies["publishers"].append({"id": gc.company.id, "name": gc.company.name, "website": gc.company.website})
        return companies

    class Meta:
        model  = VideoGame
        fields = ["id", "title", "cover", "summary", "release_date", "game_type", "genres", "companies"]