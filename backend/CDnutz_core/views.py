from .models import (VideoGame,
                     Platform, Region, Company, Language, Franchise,
                     GameCompany, GameRelease, GameLanguage, AgeRating,
                     MediaContent)
from .enums import PopularityType, MediaType, ArtworkType
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import DashboardSerializer, VideoGameDetailsSerializer
from django.db.models import Prefetch
from django.db.models import Q
from datetime import datetime


@api_view (['GET'])
def dashboard(request):
    top_5_steam_peak = VideoGame.objects.prefetch_related(
        Prefetch("media", queryset = MediaContent.objects.filter(
            Q(media_type = MediaType.SCREENSHOT) |
            Q(media_type = MediaType.ARTWORK, artwork_type__in = [ArtworkType.KEY_ART_NO_LOGO, ArtworkType.ARTWORK])
        )), Prefetch("game_companies", queryset = GameCompany.objects.filter(
                developer = True
            ).select_related("company")),
            Prefetch("game_releases", queryset = GameRelease.objects.select_related("platform"))
            ).filter(
                game_popularity__popularity_type = PopularityType.STEAM_PEAK_PLAYERS
        ).order_by("-game_popularity__value")[:5]

    serialized_top_5 = DashboardSerializer(top_5_steam_peak, many = True)


    statistics = {
        "total games"      : VideoGame.objects.count(),
        "total franchises" : Franchise.objects.count(),
        "total companies"  : Company.objects.count(),
        "total media"      : MediaContent.objects.count(),
        "upcoming titles"  : VideoGame.objects.filter(game_releases__release_date__gt = datetime.now()).distinct().count()
    }


    data = {
        "trending" : serialized_top_5.data,
        "stats"    : statistics,
    }

    return Response(data)


@api_view(['GET'])
def gameDetails(request, id):
    try:

        video_game = VideoGame.objects.prefetch_related(
            Prefetch("game_companies", queryset = GameCompany.objects.select_related("company")),
            Prefetch("game_releases", queryset  = GameRelease.objects.select_related("platform", "region")),
            Prefetch("game_languages", queryset = GameLanguage.objects.select_related("language")),
            Prefetch("age_ratings", queryset    = AgeRating.objects.select_related("age_rating_org", "age_rating_cat")),
            "genres", "modes", "media",
        ).select_related("franchise").get(id = id)

        serialized_game_details = VideoGameDetailsSerializer(video_game)

        return Response(serialized_game_details.data)

    except VideoGame.DoesNotExist:
        return Response({"error": "Game not found"}, status = 404)
