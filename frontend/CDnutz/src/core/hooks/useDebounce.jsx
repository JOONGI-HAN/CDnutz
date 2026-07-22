import { useEffect } from "react";

import useRequest from "./useRequest";

export default function useDebounce(url, input, delay = 500) {
    const { request, data: results, dataSetter, loading } = useRequest();

    useEffect(() => {
        {/* Clear results and stop loading if the input is empty */}
        if (!input || input.trim() === "") {
            dataSetter(null);
            return;
        }

        const search = setTimeout(() => {
            request(`${url}?q=${input}`)
                .then((result) => {
                    if (!result) dataSetter([]);
                })
                .catch((e) => {
                    console.log(`request failed ${e}`);
                    dataSetter([]);
                });
        }, delay);

        return () => clearTimeout(search);
    }, [input, url, delay]);

    return { results, loading };
}