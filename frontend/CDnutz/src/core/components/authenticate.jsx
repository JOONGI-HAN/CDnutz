import purpleMoon from "../assets/purple-moon.jpg";
import fallingAstronaut from "../assets/falling-astronaut.jpg";

import Login from "./login";
import Register from "./register";

import { NavLink, useLocation } from "react-router-dom";

import useWindowSizeListener from "../hooks/useWindowSizeListener";

import {Breakpoints} from "../enums.js"
import {useState} from "react";

export default function Authenticate() {
    const location = useLocation();
    const isRegisterActive = location.pathname.includes("register");

    const [isMobileLayout, setIsMobileLayout] = useState(false);

    useWindowSizeListener({
        query        : Breakpoints.MD,
        actionFN     : setIsMobileLayout,
        matchState   : false,
        unmatchState : true
    })

    return (
        <>
            <link rel = "preconnect" href = "https://fonts.googleapis.com" />
            <link rel = "preconnect" href = "https://fonts.gstatic.com" crossOrigin = "true" />
            <link
                href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
                rel  = "stylesheet"
            />

            <div className = "relative min-h-[calc(100vh-var(--nav-height))] w-full flex items-center justify-center px-4 py-8 font-[Poppins,sans-serif] antialiased">
            {/* Main Card Container */}
                <div className = "relative z-10 w-full rounded-[28px] overflow-hidden
                                   bg-[var(--secondary-background)]
                                   shadow-[0_0_0_1px_var(--shadow-card-ring),0_25px_70px_-15px_var(--shadow-card-glow),0_15px_35px_-10px_var(--shadow-card-depth)]
                                   max-w-[420px] pb-8 pt-3
                                   md:max-w-[1024px] md:min-h-[580px] md:pb-0 md:pt-0"
                >

                    <div className = "absolute inset-0 bg-gradient-to-b from-[var(--surface-card)] via-transparent to-[var(--auth-card-shade)] pointer-events-none" />

                    {/* Mobile Layout (below md breakpoint) */}
                    {isMobileLayout ? (
                        <div
                            className = {`flex h-full w-full transition-transform duration-500 ease-in-out
                                          ${isRegisterActive ? "-translate-x-full" : "translate-x-0"}`}
                        >
                            <div className = "w-full shrink-0 flex items-center justify-center">
                                <Login showMobileToggle = {true} />
                            </div>

                            <div className = "w-full shrink-0 flex items-center justify-center">
                                <Register showMobileToggle = {true} mobile = {true} />
                            </div>
                        </div>
                    )

                    : (
                        <>
                            {/* Desktop Layout (md breakpoint and up) */}
                            {/* Login Form Container (Left) */}
                            <div
                                className = {`absolute top-0 left-0 h-full w-1/2 transition-all duration-700 ease-in-out z-10 flex items-center justify-center ${
                                isRegisterActive ? "opacity-0 translate-x-[20%] pointer-events-none" : "opacity-100 translate-x-0"
                            }`}>
                                <Login />
                            </div>

                            {/* Register Form Container (Right) */}
                            <div className = {`absolute top-0 right-0 h-full w-1/2 transition-all duration-700 ease-in-out z-10 flex items-center justify-center ${
                                isRegisterActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-[20%] pointer-events-none"
                            }`}>
                                <Register />
                            </div>

                            {/* Sliding Overlay Container */}
                            <div className = {`absolute top-0 left-1/2 w-1/2 h-full z-20 overflow-hidden transition-transform duration-700 ease-in-out ${
                                isRegisterActive ? "-translate-x-full" : "translate-x-0"
                            }`}>
                                {/* Inner Sliding Strip (200% width) */}
                                <div className = {`absolute top-0 left-0 w-[200%] h-full text-white transition-transform duration-700 ease-in-out ${
                                    isRegisterActive ? "translate-x-0" : "-translate-x-1/2"
                                }`}>

                                    {/* Login Prompt Side (Left half of inner strip) */}
                                    <div className = "absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center text-center px-10">
                                        <div className = "absolute inset-0 bg-cover bg-center" style = {{ backgroundImage: `url(${purpleMoon})` }} />
                                        <div className = "absolute inset-0 bg-gradient-to-t from-[var(--auth-photo-overlay-start)] via-[var(--auth-photo-overlay-mid)] to-transparent" />
                                        <div className = "relative z-10">
                                            <h1 className = "text-[36px] font-semibold tracking-tight leading-[1.15] mb-4
                                                              bg-gradient-to-br from-white via-[var(--auth-heading-gradient-mid)] to-[var(--auth-heading-gradient-end)] bg-clip-text text-transparent">
                                                Welcome back
                                            </h1>
                                            <p className = "text-[14px] font-normal text-[var(--auth-subtext)] leading-relaxed mb-7 max-w-[240px] mx-auto">
                                                Already have an account? Sign in to pick up right where you left off.
                                            </p>
                                            <NavLink
                                                to = "/authenticate/login"
                                                className = {({ isActive }) => `inline-block border-2 border-white rounded-full
                                                                                                px-9 py-3 text-[12px] font-medium uppercase tracking-[1.5px] transition-colors
                                                                                                ${isActive ? "bg-[var(--surface-card-border-hover)]" : "hover:bg-[var(--surface-card-hover)]"}`}
                                            >
                                                Sign In
                                            </NavLink>
                                        </div>
                                    </div>

                                    {/* Register Prompt Side (Right half of inner strip) */}
                                    <div className = "absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center text-center px-10">
                                        <div className = "absolute inset-0 bg-cover bg-center" style = {{ backgroundImage: `url(${fallingAstronaut})` }} />
                                        <div className = "absolute inset-0 bg-gradient-to-t from-[var(--auth-photo-overlay-start)] via-[var(--auth-photo-overlay-mid)] to-transparent" />
                                        <div className = "relative z-10">
                                            <h1 className = "text-[36px] font-semibold tracking-tight leading-[1.15] mb-4
                                                              bg-gradient-to-br from-white via-[var(--auth-heading-gradient-mid)] to-[var(--auth-heading-gradient-end)] bg-clip-text text-transparent">
                                                Hello there
                                            </h1>
                                            <p className  = "text-[14px] font-normal text-[var(--auth-subtext)] leading-relaxed mb-7 max-w-[240px] mx-auto">
                                                Don't have an account yet? Join us and start your journey today.
                                            </p>
                                            <NavLink
                                                to = "/authenticate/register"
                                                className = {({ isActive }) => `inline-block border-2 border-white rounded-full
                                                                                                px-9 py-3 text-[12px] font-medium uppercase tracking-[1.5px] transition-colors
                                                                                                ${isActive ? "bg-[var(--surface-card-border-hover)]" : "hover:bg-[var(--surface-card-hover)]"}`}
                                            >
                                                Sign Up
                                            </NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                    }
            </div>
        </div>
        </>
    );
}