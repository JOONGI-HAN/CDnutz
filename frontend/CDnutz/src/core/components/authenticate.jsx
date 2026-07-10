import { Eye, EyeOff } from "lucide-react";

import { useState } from "react"


export default function Authenticate(authenticationSetter) {
    const [identifierInput, setIdentifierInput] = useState("");
    const [passwordInput, setPasswordInput]     = useState("");

    const [isPasswordHidden, setIsPasswordHidden]      = useState(true);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    const authenticateUser = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const response = await fetch(
                "cdnutz/auth/login/",
                {
                        method  : "POST",
                        headers : {"Content-Type" : "application/json"},
                        body    : JSON.stringify(
                            {
                                identifier : identifierInput,
                                password   : passwordInput
                            }
                        )
                    }
            )

            if (!response.ok) {
                setLoading(false);
                new Error(`HTTP request failed: ${response.status}`)
            }

            const result = await response.json()

            if (result.status === 200) {
                ;
            } else {
                setLoading(false)
                setError(result.result)
            }

        } catch (err) {
            setLoading(false)
            setError(err)
        }
    }
}
