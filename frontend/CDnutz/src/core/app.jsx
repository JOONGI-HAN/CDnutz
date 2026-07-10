import Sidebar from "./components/ui/side";
import Nav from "./components//ui/nav"

import { Outlet } from 'react-router-dom';
import { useState } from 'react';


function CDnutz() {

  const [darkTheme, setDarkTheme] = useState(false);

  const [menuOpen , setMenuOpen]   = useState(() => window.innerWidth >= 1024);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className  = {`${menuOpen ? "lg:pl-[var(--side-width)]" : "pl-0"} h-full bg-black
                       transition-all duration-300 ease-in-out overflow-x-hidden`}>

      <Nav menuOpen    = {menuOpen} toggleMenu  = {() => setMenuOpen(prev => !prev)} />

      <Sidebar menuOpen    = {menuOpen} menuClose   = {() => setMenuOpen(false)} />

      <Outlet /> {/* Always keep sidebar / topnav; only change insert different content here*/}

    </div>
  );
}

export default CDnutz;
