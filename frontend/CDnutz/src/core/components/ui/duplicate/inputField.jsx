import { Search } from "lucide-react";

import { useState, useRef, useEffect } from "react";

import SearchResults from "./searchResults";

function InputField({value, onChange, expanded, onExpand, results, loading, browsingMode = false,
    placeholder = "Search...", collapsible = false, showIcon = true, basic = true
}) {
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef(null);

    const visibility = collapsible ?
        (expanded ? "flex" : "hidden xsm:flex")
        : "flex";

    useEffect(() => {
        if (basic) return; // basic means it is just a static input field, won't be used to search for data, in that case, don't set up any event listeners
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [basic]);

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
                    <SearchResults setShowResults = {setShowDropdown} inputFieldChange = {onChange} browsingMode = {browsingMode} results = {results} />
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