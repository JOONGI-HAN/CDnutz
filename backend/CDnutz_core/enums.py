from django.db import models
from enum import IntEnum


class DataType(models.TextChoices):
    GAMES       = "games", "Games"
    POPSCORES   = "popscores", "PopScores"


class MediaType(models.TextChoices):
    SCREENSHOT  = "screenshot", "Screenshot"
    ARTWORK     = "artwork", "Artwork"
    VIDEO       = "video", "Video"


class ArtworkType(models.IntegerChoices):
    ARTWORK                    = 1, "Artwork"
    KEY_ART_NO_LOGO            = 2, "Key art without logo"
    KEY_ART_WITH_LOGO          = 3, "Key art with logo"
    CONCEPT_ART                = 4, "Concept art"
    GAME_LOGO_WHITE            = 5, "Game logo (white)"
    GAME_LOGO_BLACK            = 6, "Game logo (black)"
    GAME_LOGO_COLOR            = 7, "Game logo (color)"
    INFOGRAPHIC                = 8, "Infographic"
    ALTERNATIVE_COVER          = 9, "Alternative cover"
    HISTORICAL_COVER           = 10, "Historical cover"
    

class PopularityType(models.IntegerChoices): # According to the IGDB api
    STEAM_REVIEWS       = 6, "Steam reviews"
    STEAM_PEAK_PLAYERS  = 5, "Steam peak players"
    IGDB_WANTS          = 2, "IGDB wants"


class GameType(models.IntegerChoices):  # According to the IGDB API
    MAIN            = 0, "Main Game"
    DLC             = 1, "DLC Addon"
    EXPANSION       = 2, "Expansion"
    BUNDLE          = 3, "Bundle"
    STD_EXPANSION   = 4, "Standalone Expansion"
    MOD             = 5, "Mod"
    EPISODE         = 6, "Episode"
    SEASON          = 7, "Season"
    REMAKE          = 8, "Remake"
    REMASTER        = 9, "Remaster"
    EXPANDED_GAME   = 10, "Expanded Game"
    PORT            = 11, "Port"
    FORK            = 12, "Fork"
    PACK            = 13, "Pack"
    UPDATE          = 14, "Update"
