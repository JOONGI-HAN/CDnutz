import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

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
            emailAddress    : {
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

    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


    const registerUser = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8000/cdnutz/auth/register/",
                {
                        method  : "POST",
                        headers : {"Content-Type" : "application/json"},
                        body    : JSON.stringify(
                      {
                                first_name       : registerForm.firstName,
                                last_name        : registerForm.lastName,
                                username         : registerForm.username.value,
                                email_address    : registerForm.emailAddress.value,
                                password         : registerForm.password.value,
                                confirm_password : registerForm.confirmPassword.value
                            }
                        )
                    }
            )

            if (!response.ok) {
                setLoading(false);
                new Error(`HTTP request failed: ${response.status}`)
            }

            const result = await response.json()

            if (response.status === 200) {
                navigate("/")
            } else {
                setLoading(false)

                if (typeof result == 'object' && result != null && !Array.isArray(result)) {
                    const updatedRegisterForm = {...registerForm}

                    Object.entries(result).forEach(([key, value]) => {
                        let snakeToCamel = key.toLowerCase().replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase())
                        if (snakeToCamel in registerForm) {
                            updatedRegisterForm[snakeToCamel] = {
                                ...updatedRegisterForm[snakeToCamel], error : String(value)
                            }
                        } else {
                            setError(true)
                        }
                })
                    setRegisterForm(updatedRegisterForm);
                }
            }

        } catch (err) {
            setLoading(false)
            setError(err)
        }
    }


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
                        value       : registerForm.emailAddress.value,
                        error       : registerForm.emailAddress.error,
                        onChange    : (value) => {
                            setRegisterForm((prev) => ({
                                ...prev,
                                emailAddress: { value, error: emailValidator(value) }
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
                onSubmit    = {registerUser}
                loading     = {loading}
                error       = {error}
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