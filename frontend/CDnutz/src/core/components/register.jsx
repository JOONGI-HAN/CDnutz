import { useState } from "react";
import {NavLink} from "react-router-dom";

import AuthForm from "./ui/duplicate/authForm";

import useRevealPassword from "../hooks/useRevealPassword";

export default function Register({ showMobileToggle, mobile }) {
    const [registerForm, setRegisterForm] = useState(
        {
            firstNameInput       : "",
            lastNameInput        : "",
            emailInput           : "",
            passwordInput        : "",
            confirmPasswordInput : "",
        }
    )

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const {isVisible:isPasswordVisible, setIsVisible:setIsPasswordVisible} = useRevealPassword();
    const {isVisible:isConfirmPasswordVisible, setIsVisible:setIsConfirmPasswordVisible} = useRevealPassword();


    return (
        <div className = {`w-full px-4 sm:px-6 flex flex-col h-full ${mobile ? "py-6" : ""}`}>
            <AuthForm
                title  = "Create Account"
                fields = {[
                    [
                        {
                            id          : "firstName",
                            type        : "text",
                            placeholder : "First name",
                            value       : registerForm.firstNameInput,
                            onChange    : (value) => {setRegisterForm((prev) => ({...prev, firstNameInput: value}))}
                        },
                        {
                            id          : "lastName",
                            type        : "text",
                            placeholder : "Last name",
                            value       : registerForm.lastNameInput,
                            onChange    : (value) => {setRegisterForm((prev) => ({...prev, lastNameInput: value}))}
                        }
                    ],
                    {
                        id          : "email",
                        type        : "email",
                        placeholder : "xyz@example.com",
                        value       : registerForm.emailInput,
                        onChange    : (value) => {setRegisterForm((prev) => ({...prev, emailInput: value}))}
                    },
                    {
                        id                 : "password",
                        placeholder        : "Password",
                        value              : registerForm.passwordInput,
                        onChange           : (value) => {setRegisterForm((prev) => ({...prev, passwordInput: value}))},
                        isPassword         : true,
                        visible            : isPasswordVisible,
                        setPasswordVisible : setIsPasswordVisible
                    },
                    {
                        id                 : "confirmPassword",
                        placeholder        : "Confirm password",
                        value              : registerForm.confirmPasswordInput,
                        onChange           : (value) => {setRegisterForm((prev) => ({...prev, confirmPasswordInput: value}))},
                        isPassword         : true,
                        visible            : isConfirmPasswordVisible,
                        setPasswordVisible : setIsConfirmPasswordVisible
                    },
                ]}
                submitLabel = "Register"
                loading = {loading}
                error = {error}
            />
            {showMobileToggle && (
                <NavLink
                  to = "/authenticate/login"
                  className = "text-[13px] font-medium text-[var(--color-subtle)] hover:text-[var(--accent-bright)]
                               transition-colors hover:underline underline-offset-4 text-center mt-6 pb-2"
                >
                  Already have an account? Sign in
                </NavLink>
            )}
        </div>
    );
}