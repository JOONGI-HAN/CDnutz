import GameCover from "./gameCover";

import { useNavigate } from "react-router-dom";


export default function SearchResults({setShowResults, inputFieldChange, browsingMode, results}) {

    const navigate = useNavigate();

    const handleSelect = (item) => {
        inputFieldChange(item.title);
        setShowResults(false);

        if (browsingMode) {
            navigate(`/game/${item.id}`);
            }
    };

    return (
        <div className = "absolute top-full left-0 w-full mt-2 z-50 box-border bg-[var(--secondary-background)]
                                          border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
            <div className = "flex flex-col max-h-[320px] overflow-y-auto rounded-2xl [&::-webkit-scrollbar]:w-1.5
                                          [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--border)]
                                          [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[var(--color-primary)]">
                {results.map((item, index) => (
                    <div
                        key = {index}
                        className = "flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-[var(--interractive-background)]
                                                 border-b border-[var(--border)] last:border-0"
                        onClick = {() => handleSelect(item)}
                    >
                        <GameCover
                            data = {item}
                            loading = {false}
                            className = "w-10 aspect-[4/5]"
                        />

                        <div
                            className = "flex flex-col xsm:flex-row xsm:items-center justify-between flex-1 min-w-0 gap-1 xsm:gap-4">
                                        <span className="text-[13px] font-semibold text-white truncate">
                                            {item.title}
                                        </span>
                            <span className = "text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)]
                                                           bg-[var(--interractive-background)] px-2.5 py-0.5 rounded-full shrink-0 self-start xsm:self-auto">
                                            {item.game_type}
                                        </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

}