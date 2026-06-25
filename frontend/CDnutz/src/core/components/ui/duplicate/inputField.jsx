import { Search } from "lucide-react";

function inputField({ value, onChange, expanded, onExpand, placeholder = "Search...", collapsible = false, showIcon = true}) {

    const visibility = collapsible ?
        (expanded ? "flex" : "hidden xsm:flex")
        : "flex";

    return (
        <>
            <div className = {`relative items-center w-full max-w-[420px]
                              ${visibility}`}
            >
                {showIcon && (
                    <Search className = "absolute left-3 w-4 h-4 text-[var(--color-primary)] pointer-events-none" />
                )}

                <input
                    value       = {value}
                    onChange    = {(e) => onChange?.(e.target.value)}
                    placeholder = {placeholder}
                    name        = "search--bar"
                    className   = {`w-full bg-[var(--interractive-background)] text-white
                                   ${showIcon ? "pl-8" : "pl-4"} pr-4 py-2 text-[13px] font-semibold rounded-full
                                   border border-[var(--border)]
                                   placeholder:text-[var(--color-primary)]
                                   outline-none`}
                />
            </div>

            {/* Only visible on mobile when collapsed */}
            {!expanded && onExpand && (
                <button
                    type      = "button"
                    onClick   = {onExpand}
                    className = "flex xsm:hidden px-5 py-2 rounded-lg
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

export default inputField;