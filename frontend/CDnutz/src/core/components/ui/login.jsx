import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import AuthForm from "./duplicate/authForm";

import useRevealPassword from "../../hooks/useRevealPassword";
import useRequest from "../../hooks/useRequest";

export default function Login({ showMobileToggle }) {
    const [loginForm, setLoginForm] = useState(
        {
            identifierInput : "",
            passwordInput   : "",
        }
    )

    const {isVisible, setIsVisible} = useRevealPassword()
    const {request, error, loading} = useRequest();

    const navigate = useNavigate();

    const authenticateUser = async (e) => {
        e.preventDefault();

        try {
            const data = await request(
                "http://localhost:8000/cdnutz/auth/login/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: {
                        identifier: loginForm.identifierInput,
                        password: loginForm.passwordInput
                    }
                }
            )

            localStorage.setItem("JWTauth", JSON.stringify({
                    "access": data.access,
                    "refresh": data.refresh,
                })
            )

            navigate("/")

        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className  = "w-full px-4 sm:px-6 flex flex-col h-full">
            <AuthForm
                title   = "Sign In"
                compact = {true}
                fields  = {[
                    {
                        id          : "identifier",
                        type        : "email",
                        placeholder : "xyz@example.com",
                        value       : loginForm.identifierInput,
                        onChange    : (value) => {
                            setLoginForm((prev) => ({...prev, identifierInput: value}))
                        }
                    },
                    {
                        id                 : "password",
                        placeholder        : "Password",
                        value              : loginForm.passwordInput,
                        onChange           : (value) => {
                            setLoginForm((prev) => ({...prev, passwordInput: value}))
                        },
                        isPassword         : true,
                        visible            : isVisible,
                        setPasswordVisible : setIsVisible
                    },
                ]}
                extra = {
                    <div className = "flex items-center justify-between w-full text-[12.5px] font-medium text-[var(--color-subtle)]">
                        <label className = "flex items-center gap-2 cursor-pointer select-none group">
                            <div className = "relative flex items-center justify-center w-[14px] h-[14px] rounded-[3px]
                                              border border-[var(--border)] group-hover:border-[var(--accent-bright)] transition-colors">
                                <input type = "checkbox" className = "peer absolute w-full h-full opacity-0 cursor-pointer" />
                                <div className = "absolute inset-0 rounded-[2px] bg-[var(--accent-bright)] opacity-0
                                                  peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                                    <svg className = "w-2.5 h-2.5 text-white" fill = "none" viewBox = "0 0 24 24" stroke = "currentColor" strokeWidth = {3.5}>
                                        <path strokeLinecap = "round" strokeLinejoin = "round" d = "M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            Remember me
                        </label>
                        <a href = "#" className = "hover:text-[var(--accent-bright)] transition-colors">
                            Forgot password?
                        </a>
                    </div>
                }
                onSubmit = {authenticateUser}
                submitLabel = "Login"
                loading = {loading}
                error   = {error?.data}
            />

            {showMobileToggle && (
                <NavLink
                  to = "/authenticate/register"
                  className = "text-[13px] font-medium text-[var(--color-subtle)] hover:text-[var(--accent-bright)]
                               transition-colors hover:underline underline-offset-4 text-center mt-5 pb-2"
                >
                  New here? Create an account
                </NavLink>
            )}
        </div>
    );
}