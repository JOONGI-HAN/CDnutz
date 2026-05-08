import { Search } from "lucide-react";



function SearchBar({ expanded, onExpand }) {

  return (
    <>

      {/* Always visible on desktop, only visible on mobile when expanded */}
      <div className      = {`relative items-center w-full max-w-[420px]
                              ${expanded ? "flex" : "hidden xsm:flex"}`}
      >
        <Search className = "absolute left-3 w-4 h-4 text-[var(--color-primary)] pointer-events-none" />
        <input
          placeholder     = "Search..."
          name            = "search--bar"
          className       = "w-full bg-[var(--interractive-background)] text-white
                             pl-8 pr-4 py-2 text-[13px] font-semibold rounded-full
                             border border-[var(--border)] placeholder:text-[var(--color-primary)]"
        />
      </div>

      {/* Only visible on mobile when collapsed */}
      {!expanded && (
        <div
          onClick   = {onExpand}
          className = "flex xsm:hidden px-5 py-2 rounded-lg text-[var(--color-primary)]
                       bg-[var(--interractive-background)]"
        >
          <Search className = "w-5 h-5" />
        </div>
      )}

    </>
  );
}

export default SearchBar;
