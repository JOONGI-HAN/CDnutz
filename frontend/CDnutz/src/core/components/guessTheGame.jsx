import { useState, useEffect } from "react";

import { useSearchParams } from "react-router";

export default function GuessTheGame() {
    const [gameDifficulty, setGameDifficulty]  = useState("easy");
    const [data, setData]                         = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userGuess, setUserGuess] = useState("");

    const [searchParams] = useSearchParams();
    const difficulty = searchParams.get("difficulty");

    async function getData() {

        try {
            const response = await fetch("/cdnutz/api/guess-the-game");
            if (!response.ok) {
                setError(`HTTP error ${response.status}`);
                return;
            }

            const result = await response.json();

            setData(result);
            setLoading(false);
        }
        catch (error) {
            console.error(`HTTP request failed ${error}`);
            setLoading(false);
            setError(true);
        }

    }

    useEffect(
        () => {
            getData()
        },
        [difficulty]
    )

    return (
        <div>
            <input value = {userGuess} onChange = {(e) => setUserGuess(e.value)} />
        </div>
    )
}