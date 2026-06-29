import { useEffect, useState } from "react";

export default function useDebounce(url, input, delay = 500) {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        {/* Clear results and stop loading if the input is empty */}
        if (!input || input.trim() === "") {
            setResults(null);
            setLoading(false);
            return;
        }

        async function apiCall() {
            setLoading(true);
            try {
                const response = await fetch(`${url}?q=${input}`);
                if (!response.ok) {
                    throw new Error(`HTTP request failed ${response.status}`);
                }

                const result = await response.json();
                setResults(result || []);

            } catch (e) {
                console.log(`request failed ${e}`);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }

        const search = setTimeout(apiCall, delay);

        return () => clearTimeout(search);
    }, [input, url, delay]);

    return { results, loading };
}