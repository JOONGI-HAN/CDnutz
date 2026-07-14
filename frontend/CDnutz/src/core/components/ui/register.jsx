import { useState } from "react";
import {NavLink} from "react-router-dom";

import AuthForm from "./duplicate/authForm.jsx";

import useRevealPassword from "../../hooks/useRevealPassword.jsx";

import {usernameValidator, emailValidator, passwordValidator, confirmPasswordValidator} from "../../utils/validators.js";

export default function Register({ showMobileToggle, mobile }) {
    const [registerForm, setRegisterForm] = useState(
        {
            firstName       : "",
            lastName        : "",
            username        : {
                value: "",
                error: ""
            },
            email           : {
                value: "",
                error: ""
            },
            password        : {
                value: "",
                error: ""
            },
            confirmPassword : {
                value: "",
                error: ""
            },
        }
    )

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
                            value       : registerForm.firstName,
                            onChange    : (value) => {
                                setRegisterForm((prev) => ({...prev, firstName: value}))
                            }
                        },
                        {
                            id          : "lastName",
                            type        : "text",
                            placeholder : "Last name",
                            value       : registerForm.lastName,
                            onChange    : (value) => {
                                setRegisterForm((prev) => ({...prev, lastName: value}))
                            }
                        }
                    ],
                    {
                        id          : "username",
                        type        : "text",
                        placeholder : "Username",
                        value       : registerForm.username.value,
                        error       : registerForm.username.error,
                        onChange    : (value) => {
                            setRegisterForm((prev) => ({
                                ...prev,
                                username: { value, error: usernameValidator(value) }
                            }))
                        }
                    },
                    {
                        id          : "email",
                        type        : "email",
                        placeholder : "xyz@example.com",
                        value       : registerForm.email.value,
                        error       : registerForm.email.error,
                        onChange    : (value) => {
                            setRegisterForm((prev) => ({
                                ...prev,
                                email: { value, error: emailValidator(value) }
                            }))
                        }
                    },
                    {
                        id                 : "password",
                        placeholder        : "Password",
                        value              : registerForm.password.value,
                        error              : registerForm.password.error,
                        onChange           : (value) => {
                            setRegisterForm((prev) => ({
                                ...prev,
                                password: { value, error: passwordValidator(value) }
                            }))
                        },
                        isPassword         : true,
                        visible            : isPasswordVisible,
                        setPasswordVisible : setIsPasswordVisible
                    },
                    {
                        id                 : "confirmPassword",
                        placeholder        : "Confirm password",
                        value              : registerForm.confirmPassword.value,
                        error              : registerForm.confirmPassword.error,
                        onChange           : (value) => {
                            setRegisterForm((prev) => ({
                                ...prev,
                                confirmPassword: { value, error: confirmPasswordValidator(prev.password.value, value) }
                            }))
                        },
                        isPassword         : true,
                        visible            : isConfirmPasswordVisible,
                        setPasswordVisible : setIsConfirmPasswordVisible
                    },
                ]}
                submitLabel = "Register"
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