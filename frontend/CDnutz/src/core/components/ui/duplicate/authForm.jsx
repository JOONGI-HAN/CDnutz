// authForm.jsx
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import InputField from "./inputField";
import ActionButton from "./actionButton";
import Spinner from "./spinner";

const GoogleIcon = (props) => (
    <svg viewBox = "0 0 24 24" xmlns = "http://www.w3.org/2000/svg" {...props}>
        <path d = "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill = "#4285F4"/>
        <path d = "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill = "#34A853"/>
        <path d = "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill = "#FBBC05"/>
        <path d = "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill = "#EA4335"/>
    </svg>
);

function AuthForm({ title, subtitle, fields, extra, onSubmit, submitLabel, loading = false, error = false, showSocial = true, compact = false }) {
    const [revealed, setRevealed] = useState({});

    const toggleReveal = (id) => {
        setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const renderField = (field) => (
        <div key = {field.id} className = "relative w-full">
            <InputField
                value       = {field.value}
                onChange    = {field.onChange}
                icon        = {field.icon}
                showIcon    = {!!field.icon}
                placeholder = {field.placeholder}
                name        = {field.id}
                type        = {field.type === "password" && revealed[field.id] ? "text" : field.type}
                basic       = {true}
            />
            {field.type === "password" && (
                <ActionButton
                    type      = "button"
                    icon      = {revealed[field.id] ? EyeOff : Eye}
                    onClick   = {() => toggleReveal(field.id)}
                    className = "group absolute right-3 top-1/2 -translate-y-1/2 p-0 bg-transparent border-0 cursor-pointer"
                />
            )}
        </div>
    );

    return (
        <form
            onSubmit  = {onSubmit}
            className = {`flex flex-col items-center w-full h-full text-center ${compact ? "pt-4 md:pt-9" : "pt-5 md:pt-10"}`}
        >
            <div className = {`w-full max-w-[340px] ${compact ? "mb-5" : "mb-6"}`}>
                <h1 className = "text-[32px] font-semibold tracking-tight leading-[1.15] mb-2
                                  bg-gradient-to-br from-white via-[#EDE4FF] to-[#C9A9FF] bg-clip-text text-transparent">
                    {title}
                </h1>
                {subtitle && (
                    <p className = "text-[14px] font-normal text-[var(--color-subtle)] leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className = {`flex flex-col w-full max-w-[320px] ${compact ? "gap-2.5" : "gap-3"}`}>
                {fields.map((item, idx) =>
                    Array.isArray(item) ? (
                        <div key = {`row-${idx}`} className = "flex gap-2 w-full">
                            {item.map((field) => renderField(field))}
                        </div>
                    ) : (
                        renderField(item)
                    )
                )}
            </div>

            {extra && <div className = "w-full max-w-[320px] mt-3">{extra}</div>}

            {error && (
                <p className = "text-[12px] font-medium text-[var(--color-destructive)] mt-3 max-w-[320px]">
                    {typeof error === "string" ? error : "Something went wrong. Please try again."}
                </p>
            )}

            <div className = {`relative w-full max-w-[320px] ${compact ? "mt-5" : "mt-6"}`}>
                <ActionButton
                    type = "submit"
                    label = {loading ? "" : submitLabel}
                    disable = {loading}
                    className = {`w-full flex items-center justify-center rounded-full py-3 bg-[image:var(--accent-color)]
                                text-white text-sm font-semibold tracking-wide transition-all hover:brightness-110 focus-visible:outline
                                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-bright)]
                                shadow-[0_10px_30px_-8px_rgba(168,85,247,0.55)] hover:shadow-[0_14px_34px_-8px_rgba(168,85,247,0.7)]
                                hover:-translate-y-[1px] active:translate-y-0
                                ${loading ? "cursor-wait opacity-90" : "cursor-pointer"}`}
                />
                {loading && (
                    <div className = "absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Spinner size = {20} color = "#fff" />
                    </div>
                )}
            </div>

            {showSocial && (
                <div className = {`w-full max-w-[320px] flex flex-col items-center ${compact ? "mt-5" : "mt-6"}`}>
                    <div className = "flex items-center gap-3 w-full mb-4">
                        <span className = "flex-1 h-px bg-[var(--border)]" />
                        <span className = "text-[11px] font-medium uppercase tracking-[2px] text-[var(--color-muted)]">
                            or
                        </span>
                        <span className = "flex-1 h-px bg-[var(--border)]" />
                    </div>

                    <ActionButton
                        type      = "button"
                        icon      = {GoogleIcon}
                        label     = "Continue with Google"
                        className = "w-full flex items-center justify-center gap-2.5 rounded-full py-2.5
                                     bg-white/[0.04] text-[13px] font-medium text-[var(--color-text-soft)]
                                     shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_2px_10px_-2px_rgba(0,0,0,0.35)]
                                     hover:bg-white/[0.07] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_4px_16px_-2px_rgba(0,0,0,0.4)]
                                     transition-all cursor-pointer"
                    />
                </div>
            )}
        </form>
    );
}
export default AuthForm;