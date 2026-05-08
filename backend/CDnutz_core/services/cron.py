import bootstrap
from middleman import Middleman
from CDnutz_core.enums import DataType
from main import Gate



def cron():
    middleman = Middleman()
    gate = Gate()

    game_timestamp      = middleman.obtain_entry(DataType.GAMES)
    popscore_timestamp  = middleman.obtain_entry(DataType.POPSCORES)

    gate.run(
        game_updated        = game_timestamp,
        popscore_updated    = popscore_timestamp,
        log_interval        = 1000
    )


if __name__ == "__main__":
    cron()
