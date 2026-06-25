import { Lightbulb } from 'lucide-react';

import GameCard from './ui/duplicate/gameCard';
import ActionButton from './ui/duplicate/gameDetailsActions';
import GuessBar from './ui/duplicate/inputField.jsx';

import { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';


export default function GuessTheGame() {
    const [data, setData]                         = useState({});
    const [cover, setCover]         = useState(null);

    const [coverLoading, setCoverLoading] = useState(true);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [userGuess, setUserGuess] = useState("");

    const [searchParams] = useSearchParams();
    const difficulty = searchParams.get("difficulty");
    const dlcs = searchParams.get("dlcs");

    useEffect(() => {
        async function loadGame() {
            setLoading(true);
            setCoverLoading(true);
            setCover(null);

            try {
                const gameRes = await fetch(`/cdnutz/api/guess-the-game?difficulty=${difficulty}&dlcs=${dlcs}`);
                if (!gameRes.ok) { setError(`HTTP error ${gameRes.status}`); setLoading(false); return; }
                const gameData = await gameRes.json();
                setData(gameData);
                setLoading(false);
            } catch {
                setError(true);
                setLoading(false);
                return; // no need to fetch cover if game failed to return
            }

            try {
                const coverRes  = await fetch('/cdnutz/api/guess-the-game/cover');
                const coverData = await coverRes.json();
                if (coverData.cover) setCover(coverData.cover);
            } catch (e) {
                console.error("Cover fetch failed", e);
            } finally {
                setCoverLoading(false);
            }
        }

        loadGame();
    }, [difficulty, dlcs]);


    async function submitAnswer(e) {
        e.preventDefault();

        const response = await fetch(
            '/cdnutz/api/guess-the-game/',
            {
                method  : "POST",
                headers : {"Content-Type" : "application/json"},
                body    : JSON.stringify({guess : userGuess})
            }
            )

        const result = await response.json();

        if (result.status === "OK" || result.status === "KO") {
             setData(result.payload);
             setCover(result.payload.cover);
        }
        else setCover(result.payload); // user still has guesses left; we just update the cover
    }


    return (
        <div className = "h-vh my-8 flex flex-col gap-2 w-full max-w-6xl mx-auto px-6">
            {
                !loading && !error &&
                <>
                    <div className = "flex flex-col items-center gap-6">
                        <div className = "flex gap-4">
                            <div className = "w-[7vw] min-w-22 aspect-square bg-[var(--interractive-background)] rounded-full" />
                            <div className = "w-[7vw] min-w-22 aspect-square bg-[var(--interractive-background)] rounded-full" />
                            <div className = "w-[7vw] min-w-22 aspect-square bg-[var(--interractive-background)] rounded-full" />
                        </div>

                        <div className = "w-full">
                            <GameCard data = {{ ...data, cover: cover }} coverLoading = { coverLoading } redacted = { true } standalone = { true } />
                        </div>
                    </div>

                    <form className = "flex gap-2 flex-col xsm:flex-row items-center justify-center"
                          onSubmit = {submitAnswer}>
                        <div className = "w-full xsm:w-[420px]">
                            <GuessBar value = {userGuess} placeholder = {"Guess..."} onChange = {setUserGuess} showIcon = {false} />
                        </div>
                        <div className = "flex gap-2 justify-center">
                            <ActionButton icon  = {Lightbulb} label = {"Hint"}/>
                            <ActionButton label = {"Guess"} type = "submit" />
                        </div>
                    </form>
                </>
            }
        </div>
    )
}