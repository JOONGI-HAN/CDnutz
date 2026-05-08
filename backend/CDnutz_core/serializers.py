from rest_framework import serializers
from .enums import PopularityType, MediaType, ArtworkType
from .models import (VideoGame, Genre, Mode, AgeRatingCategory, AgeRatingOrganization,
    Platform, Region, Company, Language, GameCompany, GameRelease, GameLanguage,
    AgeRating, MediaContent,
)
import re


class DashboardSerializer(serializers.ModelSerializer):
    cover = serializers.SerializerMethodField()
    developers = serializers.SerializerMethodField()
    platforms = serializers.SerializerMethodField()

    def get_cover(self, obj):
        priority_map = {
            (MediaType.ARTWORK, ArtworkType.KEY_ART_NO_LOGO) : 1,
            (MediaType.ARTWORK, ArtworkType.ARTWORK)         : 2,
            (MediaType.SCREENSHOT, None)                     : 3,
        }

        chosen = None
        chosen_priority = float('inf')

        for m in obj.media.all():
            key = (m.media_type, m.artwork_type)
            if key in priority_map:
                p = priority_map[key]
                if p < chosen_priority:
                    chosen = m
                    chosen_priority = p
                    if p == 1:
                        break

        return chosen.url if chosen else None

    def get_developers(self, obj):
        return [gc.company.name for gc in obj.game_companies.all()]

    def get_platforms(self, obj):
        return {gr.platform.name for gr in obj.game_releases.all()} # deduplicate platform names

    class Meta:
        model = VideoGame
        fields = ["id", "title", "cover", "developers", "platforms"]


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]


class ModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mode
        fields = ["id", "name"]


class AgeRatingOrgSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgeRatingOrganization
        fields = ["id", "name"]


class AgeRatingCatSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgeRatingCategory
        fields = ["id", "name"]


class AgeRatingSerializer(serializers.ModelSerializer):
    age_rating_org = AgeRatingOrgSerializer()
    age_rating_cat = AgeRatingCatSerializer()

    class Meta:
        model = AgeRating
        fields = ["id", "age_rating_org", "age_rating_cat", "cover"]


class PlatformSerializer(serializers.ModelSerializer):
    class Meta:
        model = Platform
        fields = ["id", "name"]


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ["id", "name"]


class ReleaseSerializer(serializers.ModelSerializer):
    platform = PlatformSerializer()
    region   = RegionSerializer()
    date     = serializers.ReadOnlyField(source = 'formatted_release_date')

    class Meta:
        model = GameRelease
        fields = ["id", "platform", "region", "date"]


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name", "website"]


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ["id", "name"]


class GameCompaniesSerializer(serializers.ModelSerializer):
    company = CompanySerializer()

    class Meta:
        model = GameCompany
        fields = ["id", "company", "developer", "publisher"]


class GameLanguagesSerializer(serializers.ModelSerializer):
    language = LanguageSerializer()

    class Meta:
        model = GameLanguage
        fields = ["id", "language", "audio", "subtitle", "interface"]


class VideoGameDetailsSerializer(serializers.ModelSerializer):
    genres         = GenreSerializer(many = True)
    modes          = ModeSerializer(many = True)
    age_ratings    = AgeRatingSerializer(many = True)
    game_releases  = ReleaseSerializer(many = True)
    game_companies = GameCompaniesSerializer(many = True)
    game_languages = GameLanguagesSerializer(many = True)

    release_date   = serializers.SerializerMethodField()
    cover          = serializers.SerializerMethodField()
    wallpaper      = serializers.SerializerMethodField()
    trailer        = serializers.SerializerMethodField()
    media          = serializers.SerializerMethodField()

    game_type = serializers.CharField(source='get_game_type_display')


    def get_release_date(self, obj):
        dates = [d.formatted_release_date for d in obj.game_releases.all() if d.formatted_release_date]
        return min(dates) if dates else None

    def get_cover(self, obj):
        return obj.url

    def get_wallpaper(self, obj):
        media = next(
            (
                m for m in obj.media.all()
                if m.media_type == MediaType.ARTWORK
                and m.artwork_type == ArtworkType.KEY_ART_NO_LOGO
                and not m.animated
            ),
            None,
        )

        if not media:
            return None

        return {
            "id": media.id,
            "url": media.url,
        }

    def get_trailer(self, obj):
        videos = [m for m in obj.media.all() if m.media_type == MediaType.VIDEO]
        chosen_video = None

        for v in videos:
            if v.title:
                match = re.search(r"trailer", v.title, re.IGNORECASE)
                if match:
                    return v.url
            if not chosen_video:
                chosen_video = v.url
        if chosen_video:
            return chosen_video
        return None


    def get_media(self, obj):
        media_data = {
            "screenshots": [],
            "artworks": [],
            "logos": [],
            "key_arts": [],
            "videos": [],
        }

        logo_types = {
            ArtworkType.GAME_LOGO_WHITE,
            ArtworkType.GAME_LOGO_BLACK,
            ArtworkType.GAME_LOGO_COLOR,
        }

        key_art_types = {
            ArtworkType.KEY_ART_NO_LOGO,
            ArtworkType.KEY_ART_WITH_LOGO,
        }

        for m in obj.media.all():
            if m.media_type == MediaType.SCREENSHOT:
                media_data["screenshots"].append({"id": m.id, "url": m.url})

            elif m.media_type == MediaType.ARTWORK:
                item = {"id": m.id, "title": m.title, "url": m.url}
                if m.artwork_type in logo_types:
                    media_data["logos"].append(item)
                elif m.artwork_type in key_art_types:
                    media_data["key_arts"].append(item)
                else:
                    media_data["artworks"].append(item)

            elif m.media_type == MediaType.VIDEO:
                media_data["videos"].append({"id": m.id, "title": m.title, "url": m.url})

        return media_data

    class Meta:
        model = VideoGame
        fields = [
            "id", "title", "cover", "wallpaper", "trailer", "summary", "release_date", "game_type",
            "score", "genres", "modes", "age_ratings", "game_releases", "game_languages",
            "game_companies", "media",
        ]
