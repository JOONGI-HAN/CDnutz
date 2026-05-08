from django.db import models
from .enums import (DataType, PopularityType, MediaType, ArtworkType, GameType)
from .utils import construct_igdb_url, construct_youtube_url


class Genre(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)
    name        = models.CharField(max_length = 255, unique = True)

    def __str__(self):
        return self.name


class Platform(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)
    name        = models.CharField(max_length = 255, unique = True)

    def __str__(self):
        return self.name


class Region(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)
    name        = models.CharField(max_length = 255, unique = True)

    def __str__(self):
        return self.name


class AgeRatingOrganization(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)
    name        = models.CharField(max_length = 255, null = True)

    def __str__(self):
        return self.name


class AgeRatingCategory(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)
    name        = models.CharField(max_length = 255, null = True)

    def __str__(self):
        return self.name


# Intermediate model needed to mirror igdb api architecture [could be done differently]
class AgeRating(models.Model):

    age_rating_org   = models.ForeignKey(
        AgeRatingOrganization,
        on_delete    = models.CASCADE,
        related_name = "age_rating"
    )

    age_rating_cat   = models.ForeignKey(
        AgeRatingCategory,
        on_delete    = models.CASCADE,
        related_name = "age_rating"
    )

    cover            = models.CharField(max_length = 255, null = True) # serving static local files

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields  = ["age_rating_org", "age_rating_cat"],
                name    = "unique_agerating_pair"
            )
        ]


class Company(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)
    name        = models.CharField(max_length = 255)
    website     = models.CharField(max_length = 255, null = True)

    def __str__(self):
        return self.name


class Language(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)
    name        = models.CharField(max_length = 255, null = True)

    def __str__(self):
        return self.name


class Mode(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)
    name        = models.CharField(max_length = 255)

    def __str__(self):
        return self.name


class VideoGame(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)  # Unique ID obtained from the api [used to preserve data intergrity upon DB sync]
    title       = models.CharField(max_length = 255)
    cover       = models.CharField(max_length = 255, null = True)
    summary     = models.TextField(null = True)
    score       = models.DecimalField(max_digits = 5, decimal_places = 2, null = True)
    game_type   = models.IntegerField(choices = GameType.choices)

    genres      = models.ManyToManyField(Genre, related_name = "games")
    modes       = models.ManyToManyField(Mode, related_name = "games")

    parent_game = models.ForeignKey(
        "self",
        null         = True,
        on_delete    = models.SET_NULL,
        related_name = "addons"
    ) # Self-referencing field [Everything is a video game entity]

    franchise = models.ForeignKey(
        "Franchise",
        null         = True,
        on_delete    = models.SET_NULL,
        related_name = "games"
    )

    bundle = models.ManyToManyField(
        "self",
        symmetrical  = False,
        related_name = "bundled_in"
    )

    age_ratings = models.ManyToManyField(
        AgeRating,
        through      = "GameAgeRating",
        related_name = "games"
    )

    platforms = models.ManyToManyField(
        Platform,
        through      = "GameRelease",
        related_name = "games"
    )

    companies = models.ManyToManyField(
        Company,
        through      = "GameCompany",
        related_name = "games"
    )

    languages = models.ManyToManyField(
        Language,
        through      = "GameLanguage",
        related_name = "games"
    )

    @property
    def url(self):
        return construct_igdb_url(self.cover)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class Franchise(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)
    name        = models.CharField(max_length = 255)

    def __str__(self):
        return self.name


class GameRelease(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)  # api ID also helps in through tables to keep relationships in sync
    game        = models.ForeignKey(VideoGame, on_delete = models.CASCADE, related_name = "game_releases")
    platform    = models.ForeignKey(Platform, on_delete = models.CASCADE)
    region      = models.ForeignKey(Region, on_delete = models.CASCADE)

    release_date    = models.DateField(null = True)
    date_precision  = models.CharField(
        max_length = 255,
        null       = True
    )  # In case of partial dates

    @property
    def formatted_release_date(self):
        if not self.release_date or not self.date_precision:
            return None

        formats = {1: "%Y", 2: "%Y-%m"}
        precision_count = len(self.date_precision.split("-"))
        fmt = formats.get(precision_count, "%Y-%m-%d")

        return self.release_date.strftime(fmt)


class GameCompany(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)
    game        = models.ForeignKey(VideoGame, on_delete = models.CASCADE, related_name = "game_companies")
    company     = models.ForeignKey(Company, on_delete = models.CASCADE)

    developer   = models.BooleanField()
    publisher   = models.BooleanField()


class GameLanguage(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)
    game        = models.ForeignKey(VideoGame, on_delete = models.CASCADE, related_name = "game_languages")
    language    = models.ForeignKey(Language, on_delete = models.CASCADE)

    audio       = models.BooleanField()
    subtitle    = models.BooleanField()
    interface   = models.BooleanField()


class GameAgeRating(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)
    game        = models.ForeignKey(VideoGame, on_delete = models.CASCADE, related_name = "game_age_ratings")
    age_rating  = models.ForeignKey(AgeRating, on_delete = models.CASCADE)


class PopularityScore(models.Model):

    igdb_id     = models.BigIntegerField(unique = True)

    video_game  = models.ForeignKey(
        VideoGame,
        on_delete    = models.CASCADE,
        related_name = "game_popularity"
    )

    popularity_type = models.IntegerField(
        choices = PopularityType.choices
    )

    value = models.DecimalField(
        max_digits       = 16,
        decimal_places   = 14
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields  = ["video_game", "popularity_type"],
                name    = "unique_popularity_type_per_game"
            )
        ]


class MediaContent(models.Model):

    igdb_id    = models.BigIntegerField()  # cant be unique here since artwork and screenshots can have the same igdb id

    video_game = models.ForeignKey(
        VideoGame,
        on_delete    = models.CASCADE,
        related_name = "media"
    )

    title            = models.CharField(max_length = 255, null = True)

    media_type     = models.CharField(
        max_length = 255,
        choices    = MediaType.choices
    )

    artwork_type   = models.IntegerField(
        null       = True,
        choices    = ArtworkType.choices)

    animated      = models.BooleanField(default = False)

    media_content = models.CharField(null       = True)

    @property
    def url(self):
        if self.media_type == MediaType.VIDEO:
            return construct_youtube_url(self.media_content)
        return construct_igdb_url(self.media_content)

    class Meta:
        constraints       = [
            models.UniqueConstraint(
                fields  = ["igdb_id", "media_type"],
                name    = "unique_media_per_type"
            )
        ]

    def __str__(self):
        return f"{self.video_game.title} | {self.media_content}"


# to sync stored data with igdb api periodically (could use a webhook, but this won't go to production)
class SyncData(models.Model):

    data = models.CharField(
        max_length = 255,
        choices    = DataType.choices
    )

    synced_at   = models.DateTimeField(auto_now = True)
    timestamp   = models.BigIntegerField()

    def __str__(self):
        return str(self.synced_at)


# to store igdb api key securely, & any other possible future service key
class ServiceKeys(models.Model):

    service        = models.CharField(max_length = 255, unique = True)
    access_token   = models.CharField(max_length = 255)
    expiry_date    = models.DateTimeField()

    def __str__(self):
        return self.service
