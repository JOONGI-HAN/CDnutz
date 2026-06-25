import bootstrap
from CDnutz_core.models import AgeRating

"""One-time script to map the age rating orgs & cats composite
   to the appropriate covers; since the api does not return such
   data in a nice format or does not provide them at all."""


def ageRatingCoverMap():
    age_ratings_raw = AgeRating.objects.all()
    paths = []

    for r in age_ratings_raw:
        r.cover = f"age_ratings/{r.age_rating_org.name}/{r.age_rating_cat.name}.png".replace(" ", "")
        paths.append(r)

    AgeRating.objects.bulk_update(
        paths,
        ["cover"]
    )
