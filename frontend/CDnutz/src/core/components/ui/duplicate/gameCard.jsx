import GameCover from "./gameCover.jsx";
import GameDescriptors from "./gameDescriptors.jsx";

import {GameDescriptorsVariants} from "../../../enums.js";

function GameCard({ data, coverLoading, hintRequest, standalone = false, redacted = false, showDescriptors = false,  disable = false }) {

    {/* GuessTheGame/Standalone mode descriptors always visible | In hero mode: descriptors only mounted when DetailsHero signals CARD layout */}
    const showCardDescriptors = standalone || showDescriptors;

    return (
        <div className = {`grid gap-4 ${
            standalone
                ? "grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)]"
                : showDescriptors 
                    ? "grid-cols-[200px_minmax(0,1fr)]"
                    : "grid-cols-1"
        }`}>

            {/* Game cover image + Sub-metadata in GuessTheGame mode */}
            <div className="flex flex-col gap-3">
                <GameCover data = {data} redacted = {redacted} loading = {coverLoading} />

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
            {showCardDescriptors && (
                <div className = "min-w-0 flex">
                    <GameDescriptors data = {data} variant = {GameDescriptorsVariants.CARD} redacted = {redacted} hintRequest = {hintRequest} disable = {disable} />
                </div>
            )}

        </div>
    )
}

export default GameCard;