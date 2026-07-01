import { Lightbulb } from 'lucide-react';

import GameCard from './ui/duplicate/gameCard';
import ActionButton from './ui/duplicate/gameDetailsActions';
import GuessBar from './ui/duplicate/inputField.jsx';

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'react-router-dom';

import useDebounce from "../hooks/useDebounce";


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

    const [isFetchingHint, setIsFetchingHint] = useState(false);
    const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

    const [totalHints, setTotalHints] = useState(3);

    const { results, _ } = useDebounce('/cdnutz/api/game/search/', userGuess);

    const gameOver = useRef(false);


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
                setLoading(false);
                setError(true)
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

        if (isSubmittingAnswer) return

        setIsSubmittingAnswer(true);
        const response = await fetch(
            '/cdnutz/api/guess-the-game/',
            {
                method  : "POST",
                headers : {"Content-Type" : "application/json"},
                body    : JSON.stringify({guess : userGuess})
            }
            )

        const result = await response.json();

        {/* Game Over; win || lose => reveal full metadata and full cover */}
        if (result.over === true || result.over === false) {
             setData(result.payload);
             setCover(result.payload.cover);
             setIsSubmittingAnswer(false);

             gameOver.current = true
        }
        else { // user still has guesses left; we just update the cover
            setCover(result.payload);
            setIsSubmittingAnswer(false);
        }

        setUserGuess("")
    }

    async function obtainHint(elem, hintIdx) {
        if (totalHints <= 0 || isFetchingHint) return

        const path= Array.isArray(elem) ? elem : [elem]

        setIsFetchingHint(true)

        try {
            const response = await fetch(
            '/cdnutz/api/guess-the-game/',
            {
                method  : "POST",
                headers : {"Content-Type" : "application/json"},
                body    : JSON.stringify({
                    category : path,
                    index    : hintIdx === undefined ? null : hintIdx
                })
                }
            )

            const result = await response.json();

            if (response.ok) {
                setData(result.payload);
                setTotalHints((prev) => prev - 1)
            }
        } catch (e) {
            console.log(`Failed to fetch hint ${e}`)
        } finally {
            setIsFetchingHint(false)
        }

    }

    const handleRandomHint = () => {
        if (totalHints <= 0 || isFetchingHint || gameOver.current) return;

        let unrevealedPool = []

        Object.entries(data)
            .forEach(([key, value]) => {
                const result = recursiveTraversal([key], value)

                if (result.length > 0) unrevealedPool.push(result)
        })

        const randomHint = unrevealedPool.flat()[Math.floor(Math.random() * unrevealedPool.flat().length)]

        console.log(randomHint)

        obtainHint(randomHint[0])
    }

    const recursiveTraversal = (path, data) => {
        let collected = []

        if (Array.isArray(data)) {
            data.forEach((elem) => {
                if (elem.revealed === false) {
                    collected.push([path, elem])
                }
            })
            return collected
        }

        if (data !== null && typeof data === "object") {
            Object.entries(data).forEach(([key, value]) => {
                const result = recursiveTraversal([...path, key], value)
                collected.push(...result)
            })
        }

        return collected
    }


    return (
        <div className = "h-vh my-8 flex flex-col gap-4 w-full max-w-6xl mx-auto px-6">
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
                            <GameCard data = {{ ...data, cover: cover }} coverLoading = { coverLoading } redacted = { true } standalone = { true } hintRequest = {obtainHint} />
                        </div>
                    </div>

                    <form className = "flex gap-2 flex-col xsm:flex-row items-center justify-center flex-wrap"
                          onSubmit = {submitAnswer}>
                        <div className = "w-full xsm:w-[420px]">
                            <GuessBar value = {userGuess} placeholder = {"Guess..."} onChange = {setUserGuess} showIcon = {false} results = {results} loading = {loading} />
                        </div>
                        <div className     ="flex gap-2 justify-center items-center">
                            <div className ="relative flex flex-col items-center">
                                <ActionButton icon    = {Lightbulb} label = {"Random Hint"} type = {"button"}
                                              onClick = {handleRandomHint} disable = {totalHints <= 0 || isFetchingHint} />
                                <span className       = "absolute -bottom-5 text-xs uppercase tracking-widest text-[var(--color-text-medium)]">
                                    Hints left: {totalHints}
                                </span>
                            </div>

                            <ActionButton label = {"Guess"} type = "submit"/>
                        </div>
                    </form>
                </>
            }
        </div>
    )
}