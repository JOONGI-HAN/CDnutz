from datetime import datetime, timedelta
from pathlib import Path
import logging
import re


log_dir = Path("logs")
log_dir.mkdir(exist_ok = True)


def self_destruct():
    current_date = datetime.now()

    for f in log_dir.iterdir():
        if f.is_file():
            match = re.search(r'\d+(?:_\d+)+', f.name)

            if match:
                file_date = datetime.strptime(match.group(), "%Y%m%d_%H%M%S")

                if file_date < current_date - timedelta(days = 7):
                    f.unlink()



def setup_logger(name):

    self_destruct()

    timestamp    = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file     = log_dir / f"sync_{timestamp}.log"

    logger       = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    formatter    = logging.Formatter(
        "%(asctime)s | %(name)s | %(levelname)s | %(message)s"
    )

    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)

    return logger
