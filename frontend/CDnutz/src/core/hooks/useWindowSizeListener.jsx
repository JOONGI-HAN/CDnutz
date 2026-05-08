import { useEffect } from "react"


function useWindowSizeListener({ size, actionFN, state }) {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= size) actionFN(false);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
}

export default useWindowSizeListener
