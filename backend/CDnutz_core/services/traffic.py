from CDnutz_core.enums import DataType, PopularityType
from middleman import Middleman
from laundry import Cleaner
from client import Wrapper
import logger
import time


logger = logger.setup_logger(__name__)


class TrafficPolice:

    def __init__(self):

        self.client     = Wrapper()
        self.cleaner    = Cleaner()
        self.middleman  = Middleman()

    def fetch_data(
        self,
        query,
        log_interval,
        updated_after,
        endpoint   = "games",
        batch_size = 500
    ):

        is_popularity   = endpoint == "popularity_primitives"

        record_type     = (
            DataType.POPSCORES
            if is_popularity
            else DataType.GAMES
        )

        entity_name     = "popScoreID" if is_popularity else "GameID"

        start = time.time()

        logger.info(f"STARTING IMPORT SHIFT; DATASET => {record_type.value}")

        offset        = 0
        count         = 0
        success       = 0
        fail          = 0
        total_skipped = 0 # Popscore metric
        skipped       = 0 # Games metric

        try:

            while True:

                paging_query = self._build_query(
                    query,
                    endpoint       = endpoint,
                    limit          = batch_size,
                    offset         = offset,
                    updated_after  = updated_after
                )

                response = self.client.IGDB_request(
                    endpoint    = endpoint,
                    query       = paging_query
                )

                if not response:

                    logger.info(f"API exhausted -- total processed: {count}")
                    break

                batch = []

                for data in response:

                    count += 1

                    try:

                        cleaned = (
                            self.cleaner.process_data(data, type = "popularity")
                            if is_popularity
                            else self.cleaner.process_data(data)
                        )

                        batch.append(cleaned)

                    except Exception:

                        fail += 1

                        logger.exception(
                            f"FAIL: Cleaning {entity_name} #{data.get('id')}"
                        )

                try:

                    if is_popularity:

                        saved, skipped = self.middleman.bulk_save(
                            batch,
                            type = "popularity"
                        )

                        total_skipped += skipped

                    else:

                        saved, resolved_bundles, resolved_parents, skipped = self.middleman.bulk_save(batch)

                    success += saved

                except Exception:

                    logger.exception(
                        f"CRITICAL: Bulk save failed at offset {offset}"
                    )

                    raise

                skip_part = (
                    f"total skipped={total_skipped}"
                    if is_popularity
                    else f"resolved bundles={resolved_bundles}, resolved parents={resolved_parents}, pending relations={skipped}"
                )

                if count % log_interval == 0:

                    logger.info(
                        f"Progress: processed={count} "
                        f"success={success} "
                        f"fail={fail} "
                        f"{skip_part}"
                    )

                offset += len(response)

                time.sleep(0.5)

            self.middleman.record_entry(record_type)

            end = time.time()

            total_time = time.strftime(
                "%H:%M:%S",
                time.gmtime(end - start)
            )

            orphaned = (
                total_skipped
                if is_popularity
                else skipped
            )

            logger.info(
                f"SHIFT ENDED -- SUCCESS: {success}, "
                f"FAIL: {fail}, ORPHANED: {orphaned}, "
                f"TOTAL TIME: {total_time}\n\n\n\n"
            )

        except Exception:

            logger.exception("IMPORT SHIFT CRASHED")
            raise


    @staticmethod
    def _build_query(query, endpoint, limit, offset, updated_after):

        formatted = query.strip()

        conditions = []

        if endpoint == "popularity_primitives":

            types = ",".join(map(str, PopularityType.values))

            conditions.append(
                f"popularity_type = ({types})"
            )

        if updated_after is not None:

            if endpoint == "popularity_primitives":

                conditions.append(
                    f"calculated_at > {updated_after}"
                )

            else:

                conditions.append(
                    f"updated_at > {updated_after}"
                )

        if conditions:

            formatted += " where " + " & ".join(conditions) + ";"

        formatted += f" limit {limit};"
        formatted += f" offset {offset};"

        return formatted
