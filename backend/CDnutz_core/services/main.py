import bootstrap  # Django injection
from traffic import TrafficPolice
import map


class Gate:

    def __init__(self):

        self.leecher = TrafficPolice()

    def run(self, game_updated = None, popscore_updated = None, log_interval = 10000):

        self._sync_games(
            updated_after = game_updated,
            log_interval  = log_interval
        )

        self._sync_popularity(
            updated_after = popscore_updated,
            log_interval  = log_interval
        )

    def _sync_games(self, updated_after, log_interval):

        game_query = """
            fields name, summary, total_rating, total_rating_count, hypes, cover.image_id, game_type, bundles, genres.name, release_dates.human,
            release_dates.platform.name, release_dates.release_region.region, age_ratings.rating_category.rating,
            age_ratings.organization.name, screenshots.image_id, screenshots.animated, artworks.image_id, artworks.artwork_type,
            artworks.animated, videos.video_id, videos.name, involved_companies.company.name,
            involved_companies.developer, involved_companies.publisher, involved_companies.company.websites.url,
            language_supports.language.name, language_supports.language_support_type.name, game_modes.name,
            collections.name, parent_game;
        """

        self.leecher.fetch_data(
            game_query,
            log_interval,
            updated_after = updated_after
        )

    def _sync_popularity(self, updated_after, log_interval):

        popscore_query = """
            fields game_id, popularity_type.name, value;
        """

        self.leecher.fetch_data(
            popscore_query,
            log_interval,
            endpoint      = "popularity_primitives",
            updated_after = updated_after
        )


if __name__ == "__main__":

    entry = Gate()
    entry.run()

    map.ageRatingCoverMap()
