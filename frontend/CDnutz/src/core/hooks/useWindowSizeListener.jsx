import { useEffect } from "react"


function useWindowSizeListener({ query, actionFN, matchState, unmatchState }) {
  useEffect(() => {
    const mql = window.matchMedia(query);

    const handler = (e) => {
      if (e.matches) actionFN(matchState);
      else if (unmatchState !== undefined) actionFN(unmatchState);
    };

    handler(mql);

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query, actionFN, matchState, unmatchState]);
}

export default useWindowSizeListener