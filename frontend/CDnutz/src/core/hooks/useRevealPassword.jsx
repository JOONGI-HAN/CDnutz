import { useState } from "react";

export default function useRevealPassword() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        {
            isVisible    : showPassword,
            setIsVisible : () => setShowPassword((prev) => !prev)
        }
    )
}