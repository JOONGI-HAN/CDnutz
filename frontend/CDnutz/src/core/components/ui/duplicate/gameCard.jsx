import GameCover from "./gameCover.jsx";
import GameDescriptors from "./gameDescriptors.jsx";

function GameCard({ data, coverLoading, standalone = false, redacted = false }) {
    return (
        <div className = {`grid gap-4 ${
            standalone
                ? "grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)]"
                : "grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-1"
        }`}>

            {/* Game cover image + Sub-metadata in GuessTheGame mode */}
            <div className="flex flex-col gap-3">
                <GameCover data = {data} redacted = {redacted} />

                {/* Desktop: under cover | Mobile: Hidden (handled inline in Descriptors/Details) */}
                {redacted && (
                    <div className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--color-muted)] px-1">
                        {data.game_type && <span>{data.game_type}</span>}
                        {data.game_type && data.release_date && <span>•</span>}
                        {data.release_date && <span>{data.release_date}</span>}
                    </div>
                )}
            </div>

            {/* Game Descriptors */}
            <div className = {`min-w-0 ${standalone ? "flex" : "hidden md:flex xl:hidden"}`}>
                <GameDescriptors data = {data} variant = "card" redacted = {redacted} />
            </div>

        </div>
    )
}

export default GameCard;