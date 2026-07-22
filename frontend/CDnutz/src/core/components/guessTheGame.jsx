import { Lightbulb, X, RotateCcw } from 'lucide-react';

import confetti from "../assets/confetti.svg";

import GameCard from './ui/duplicate/gameCard';
import ActionButton from './ui/duplicate/actionButton';
import GuessBar from './ui/duplicate/inputField';

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from 'react-router-dom';

import useDebounce from "../hooks/useDebounce";
import useRequest from "../hooks/useRequest";


export default function GuessTheGame() {
    const [data, setData]                         = useState({});
    const [cover, setCover]         = useState(null);

    const [userGuess, setUserGuess] = useState("");

    const [searchParams] = useSearchParams();
    const difficulty = searchParams.get("difficulty");
    const dlcs = searchParams.get("dlcs");

    const [totalHints, setTotalHints] = useState(null);

    const [guessesRemaining, setGuessesRemaining] = useState(null);

    const [isWinner, setIsWinner] = useState(false);

    const { results, _ } = useDebounce('/cdnutz/api/game/search/', userGuess);

    const { request: fetchGame,   error: gameError,  loading: gameLoading  } = useRequest();
    const { request: fetchCover,                     loading: coverLoading } = useRequest();
    const { request: postAnswer,                     loading: answerLoading } = useRequest();
    const { request: postHint,                       loading: hintLoading  } = useRequest();

    const totalGuesses = useRef(null); // we use this to render the circles
    const gameOver = useRef(false);

    {/*  doing this mainly to guard against a scenario where users have more hints than necessary, we want to disable their ability to ask for a random hint */}
    const unrevealedPool = useMemo(() => {
        if (!data || Object.keys(data).length === 0) return [];

        let pool = [];
        Object.entries(data).forEach(([key, value]) => {
            const result = recursiveTraversal([key], value);
            if (result.length > 0) pool.push(result);
        });

        return pool.flat();
    }, [data]);


    const init = () => {
        setCover(null);
        setGuessesRemaining(null);
        setTotalHints(null);
        setIsWinner(false);

        gameOver.current     = false;
    }

    const loadGame = async () => {

        init();

        try {
            const gameData = await fetchGame(`/cdnutz/api/guess-the-game?difficulty=${difficulty}&dlcs=${dlcs}`);

            setData(gameData);
            setGuessesRemaining(gameData.guesses_left)
            setTotalHints(gameData.hints_left)

            totalGuesses.current = gameData.guesses_left

        } catch {
            return; // no need to fetch cover if game failed to return
        }

        try {
            const coverData = await fetchCover('/cdnutz/api/guess-the-game/cover');
            if (coverData.cover) setCover(coverData.cover);
        } catch (e) {
            console.error("Cover fetch failed", e);
        }
    }


    useEffect(() => {
        loadGame();
    }, [difficulty, dlcs]);


    async function submitAnswer(e) {
        e.preventDefault();

        if (answerLoading || gameOver.current) return

        try {
            const result = await postAnswer(
                '/cdnutz/api/guess-the-game/',
                {
                        method  : "POST",
                        headers : {"Content-Type" : "application/json"},
                        body    : {guess : userGuess}
                    }
            )

            {/* Game Over; win || lose => reveal full metadata and full cover */}
            if (result.over === true) {
                 setData(result.payload);
                 setCover(result.payload.cover);

                 {/* Render the final X wrong guess icon */}
                 if (result.guesses_left !== undefined) {
                      setGuessesRemaining(result.guesses_left);
                 }

                 if (result.win === true) {
                    setIsWinner(true);
                 }

                 gameOver.current = true;
            }
            else { // user still has guesses left; we just update the cover
                setGuessesRemaining((prev) => prev - 1);
                setCover(result.payload);
            }

            setUserGuess("")

        } catch (e) {
            console.error("Failed to submit answer", e)
        }
    }

    useEffect(() => {
        if (!isWinner) return

        const newGame = setTimeout(() => {loadGame()}, 3000)

        return () => {clearTimeout(newGame)}

        },
        [isWinner, loadGame]
    )

    async function obtainHint(elem, hintIdx) {
        if (totalHints <= 0 || hintLoading) return

        const path= Array.isArray(elem) ? elem : [elem]

        try {
            const result = await postHint(
                '/cdnutz/api/guess-the-game/',
                {
                        method  : "POST",
                        headers : {"Content-Type" : "application/json"},
                        body    : {
                            category : path,
                            index    : hintIdx === undefined ? null : hintIdx
                        }
                    }
            )

            setData(result.payload);
            setTotalHints((prev) => prev - 1)

        } catch (e) {
            console.log(`Failed to fetch hint ${e}`)
        }

    }

    const handleRandomHint = () => {
        if (totalHints <= 0 || hintLoading || gameOver.current || unrevealedPool.length === 0) return;

        const randomHint = unrevealedPool[Math.floor(Math.random() * unrevealedPool.length)];

        obtainHint(randomHint[0]);
    }


    return (
        <div className = "h-screen my-8 relative isolate flex flex-col gap-4 w-full max-w-6xl mx-auto px-6">
            <div className = {`absolute inset-0 -z-10 bg-no-repeat bg-[length:contain] bg-left-bottom
                               transition-opacity duration-200 ease-in
                               ${isWinner ? "opacity-100 animate-sparkle" : "opacity-0"}`}
                 style = {{
                    backgroundImage: `url(${confetti})`,
                    backgroundColor: `var(--dark-transparent-background)`
                 }}
            />

            {!isWinner && gameOver.current &&
                <>
                    <div className = "fixed inset-0 z-40 bg-[var(--surface-overlay)] backdrop-blur-sm" />

                    <div className = "fixed inset-0 z-50 flex items-center justify-center px-6">
                        <div className = "flex flex-col items-center gap-4 text-center">
                            <h1 className = "text-4xl lg:text-6xl font-black tracking-wide uppercase leading-none text-balance
                                             text-[var(--color-destructive)] drop-shadow-[0_0_30px_var(--color-destructive)]">
                                Game over
                            </h1>

                            <p className = "text-[1.2rem] uppercase tracking-widest text-[var(--color-muted)] mb-1">
                                Answer:{" "}
                                <span className = "text-[1.5rem] uppercase tracking-wider text-[var(--color-text-soft)] bg-[var(--surface-card)]
                                                   border border-[var(--surface-card-border)] rounded px-1.5 py-0.5">
                                    {data.title}
                                </span>
                            </p>

                            <ActionButton icon={RotateCcw} label={"Try again"} type={"button"} onClick={loadGame} />
                        </div>
                    </div>
                </>
            }

            {
                !gameLoading && !gameError &&
                <>
                    <div className = "flex flex-col items-center gap-6">

                        <div className = "flex gap-4 flex-nowrap justify-center w-full">
                            {[...Array(totalGuesses.current)].map((_, index) => {
                                const isWrong = index < (totalGuesses.current - guessesRemaining);

                                return (
                                    <div key = {index}
                                         className = {`flex-1 min-w-0 max-w-30 aspect-square rounded-full flex items-center justify-center transition-all duration-300
                                         ${isWrong
                                             ? "bg-destructive shadow-[0_0_20px_var(--color-destructive)] scale-105"
                                             : "bg-[var(--interractive-background)]"}`}>
                                        {isWrong && (
                                            <X className = "w-3/5 h-3/5 text-white stroke-[4] drop-shadow-md animate-in zoom-in duration-300"/>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className = "w-full">
                            <GameCard data = {{...data, cover: cover}} coverLoading={coverLoading} redacted={true}
                                      standalone={true} hintRequest={obtainHint} disable={totalHints <= 0}/>
                        </div>
                    </div>

                    <form className = "flex gap-2 flex-col xsm:flex-row items-center justify-center flex-wrap"
                          onSubmit  = {submitAnswer}>
                        <div className = "w-full xsm:w-[420px]">
                            <GuessBar value = {userGuess} placeholder = {"Guess..."} onChange = {setUserGuess}
                                      showIcon = {false} results = {results} loading = {gameLoading} basic = {false} />
                        </div>
                        <div className = "flex gap-2 justify-center items-center">
                            <div className = "relative flex flex-col items-center">
                                <ActionButton icon    = {Lightbulb} label={"Random Hint"} type={"button"}
                                              onClick = {handleRandomHint}
                                              disable = {totalHints <= 0 || hintLoading || unrevealedPool.length === 0}/>
                                <span
                                    className = "absolute -bottom-5 text-xs uppercase tracking-widest text-[var(--color-text-medium)]">
                                    Hints left: {totalHints}
                                </span>
                            </div>

                            <ActionButton label = {"Guess"} type = "submit" disable={answerLoading}/>
                        </div>
                    </form>
                </>
            }
        </div>
    )
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