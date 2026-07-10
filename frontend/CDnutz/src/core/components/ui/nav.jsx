import { ArrowLeft, Menu, Moon } from "lucide-react";

import logo from "../../assets/CDnav.png";

import SearchBar   from "./duplicate/inputField";
import LoginButton from "./duplicate/actionButton";

import { useState } from "react";

import useWindowSizeListener from "../../hooks/useWindowSizeListener";
import useDebounce from "../../hooks/useDebounce";

import { Breakpoints }       from "../../enums.js";


function Nav({ toggleMenu }) {

  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { results, loading } = useDebounce('/cdnutz/api/game/search/', searchQuery);

  useWindowSizeListener({ query: Breakpoints.XSM, actionFN: setSearchExpanded, matchState: false });


  const loginButtonStyle = `px-4 py-2 text-[12px] font-semibold tracking-[0.8px] text-white
                                   rounded-full cursor-pointer border border-[var(--accent-bright)]
                                   bg-[image:var(--accent-color)] whitespace-nowrap hidden md:flex`


  return (

    <nav
      className = {`sticky top-0 flex items-center h-[var(--nav-height)] px-4 gap-4
                    bg-[var(--secondary-background)] z-30 w-full`}
    >

      {searchExpanded ? (
        <>

          <div className = "flex items-center flex-shrink-0">
            <div
              className = "text-[var(--color-primary)] bg-[var(--interractive-background)]
                           cursor-pointer px-3 py-2 rounded-lg"
              onClick   = {() => setSearchExpanded(false)}
            >
              <ArrowLeft className = "w-5 h-5" />
            </div>
          </div>

          <div className = "flex-1 flex items-center">
            <SearchBar expanded = {searchExpanded} value = {searchQuery} onChange = {setSearchQuery} results = {results} loading = {loading} browsingMode = {true} />
          </div>

        </>
      ) : (
        <>

          <div className = "flex items-center gap-2 flex-shrink-0">
            <button
              className  = "text-[var(--color-primary)] cursor-pointer p-1 rounded"
              onClick    = {toggleMenu}
              aria-label = "Toggle sidebar"
            >
              <Menu className = "w-5 h-5" />
            </button>

            <img
              src       = {logo}
              className = "w-20 shrink-0 cursor-pointer"
              alt       = "Logo"
              loading   = "lazy"
            />
          </div>

          <div className = "flex-1 flex items-center justify-center max-xsm:justify-end">
            <SearchBar
              value        = {searchQuery}
              onChange     = {setSearchQuery}
              expanded     = {searchExpanded}
              onExpand     = {() => setSearchExpanded(true)}
              collapsible  = {true}
              results      = {results}
              loading      = {loading}
              browsingMode = {true}
            />
          </div>

          <div className = "flex items-center gap-3 flex-shrink-0">
            <LoginButton className = {loginButtonStyle} label = "LOGIN TO ACCOUNT" />
            <Moon className = "text-[var(--color-primary)] cursor-pointer w-5 h-5" />
          </div>

        </>
      )}

    </nav>
  );
}

export default Nav;
