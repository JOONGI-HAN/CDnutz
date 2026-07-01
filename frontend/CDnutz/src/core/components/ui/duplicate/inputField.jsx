import { Search } from "lucide-react";

import { useState, useRef, useEffect } from "react";

import GameCover from "./gameCover";

function InputField({value, onChange, expanded, onExpand, results, loading,
    placeholder = "Search...", collapsible = false, showIcon = true,
}) {
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef(null);

    const visibility = collapsible ?
        (expanded ? "flex" : "hidden xsm:flex")
        : "flex";

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item) => {
        onChange(item.title);
        setShowDropdown(false);
    };

    return (
        <>
            <div
                ref       = {containerRef}
                className = {`relative items-center w-full max-w-[420px] ${visibility}`}
            >
                {showIcon && (
                    <Search className = "absolute left-3 w-4 h-4 text-[var(--color-primary)] pointer-events-none" />
                )}

                <input
                    value       = {value}
                    onChange    = {(e) => {
                        setShowDropdown(true);
                        onChange(e.target.value);
                    }}
                    onFocus     ={() => setShowDropdown(true)}
                    placeholder = {placeholder}
                    name        = "search--bar"
                    className   = {`w-full bg-[var(--interractive-background)] text-white
                                   ${showIcon ? "pl-8" : "pl-4"} pr-4 py-2 text-[13px] font-semibold rounded-full
                                   border border-[var(--border)]
                                   placeholder:text-[var(--color-primary)]
                                   outline-none`}
                    autoComplete = "off"
                />

                {!loading && results && results.length > 0 && showDropdown && (
                    <div className     = "absolute top-full left-0 w-full mt-2 z-50 box-border bg-[var(--secondary-background)]
                                          border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
                        <div className = "flex flex-col max-h-[320px] overflow-y-auto rounded-2xl [&::-webkit-scrollbar]:w-1.5
                                          [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--border)]
                                          [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[var(--color-primary)]">
                            {results.map((item, index) => (
                                <div
                                    key       = {index}
                                    className = "flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-[var(--interractive-background)]
                                                 border-b border-[var(--border)] last:border-0"
                                    onClick   = {() => handleSelect(item)}
                                >
                                    <GameCover
                                        data      = {item}
                                        loading   = {false}
                                        className = "w-10 aspect-[4/5]"
                                    />

                                    <div className      = "flex flex-col xsm:flex-row xsm:items-center justify-between flex-1 min-w-0 gap-1 xsm:gap-4">
                                        <span className = "text-[13px] font-semibold text-white truncate">
                                            {item?.title}
                                        </span>
                                        <span className = "text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)]
                                                           bg-[var(--interractive-background)] px-2.5 py-0.5 rounded-full shrink-0 self-start xsm:self-auto">
                                            {item?.game_type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {!expanded && onExpand && (
                <button
                    type       = "button"
                    onClick    = {onExpand}
                    className  = "flex xsm:hidden px-5 py-2 rounded-lg
                                 text-[var(--color-primary)]
                                 bg-[var(--interractive-background)]"
                    aria-label = "Open search"
                >
                    <Search className = "w-5 h-5" />
                </button>
            )}
        </>
    );
}

export default InputField;