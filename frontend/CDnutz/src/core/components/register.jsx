import { useState } from "react";
import {NavLink} from "react-router-dom";

import AuthForm from "./ui/duplicate/authForm";

export default function Register({ showMobileToggle, mobile }) {
    const [firstNameInput, setFirstNameInput] = useState("");
    const [lastNameInput, setLastNameInput] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [confirmPasswordInput, setConfirmPasswordInput] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);


    return (
        <div className = {`w-full px-4 sm:px-6 flex flex-col h-full ${mobile ? "py-6" : ""}`}>
            <AuthForm
                title  = "Create Account"
                fields = {[
                    [
                        { id: "firstName", type: "text", placeholder: "First name", value: firstNameInput, onChange: setFirstNameInput },
                        { id: "lastName", type: "text", placeholder: "Last name", value: lastNameInput, onChange: setLastNameInput }
                    ],
                    { id: "email", type: "email", placeholder: "xyz@example.com", value: emailInput, onChange: setEmailInput },
                    { id: "password", type: "password", placeholder: "Password", value: passwordInput, onChange: setPasswordInput },
                    { id: "confirmPassword", type: "password", placeholder: "Confirm password", value: confirmPasswordInput, onChange: setConfirmPasswordInput },
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