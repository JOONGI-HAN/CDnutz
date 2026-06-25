import { TrendingUp, Play } from "lucide-react";

import { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';


function Hero({ data, loading, error }) {

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused]           = useState(false);
  const [progress, setProgress]       = useState(0);

  const progressRef = useRef(0);

  const carousselUpdateTime = 5000
  const progressIncrement   = Math.floor(carousselUpdateTime / 100)


  useEffect(() => {
    if (data.length === 0) return
    setActiveIndex(0)
  }, [data])

  useEffect(() => {
    progressRef.current = 0
  }, [activeIndex])

  useEffect(() => {
    if (paused || data.length === 0) return;

    const heroInterval = setInterval(() => {
      progressRef.current += 1;
      if (progressRef.current >= 100) {
        setActiveIndex(prev => (prev + 1) % data.length);
        progressRef.current = 0;
      }
      setProgress(progressRef.current);
    }, progressIncrement);

    return () => clearInterval(heroInterval);
  }, [paused, data.length])


  return (

    <div className = "relative h-[calc(100vh-var(--nav-height))]">

      {data.map((item, i) => (
        <div
          key       = {i}
          className = {`h-full absolute inset-0 ${i === activeIndex ? "opacity-100" : "opacity-0"} transition-opacity duration-1000`}
        >

          <div className = "absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black z-10" />

          <img
            src       = {item.cover}
            alt       = "trending now"
            className = "w-full h-full object-cover"
          />

          <div
            className    = "absolute bottom-8 lg:bottom-20 w-full px-6 pb-8 md:px-12 lg:px-20
                            flex flex-col text-white z-20 md:pb-0"
            onMouseEnter = {() => setPaused(true)}
            onMouseLeave = {() => setPaused(false)}
          >

            <div className = "flex flex-row flex-wrap items-center gap-2 mb-4">

              <div className = "flex items-center gap-1 bg-[var(--color-trending-bg)] text-[var(--color-trending)]
                                text-xs font-semibold uppercase px-3 py-1 rounded-full">
                <TrendingUp className = "w-4 h-4" />
                <span>Trending Now</span>
              </div>

              {item.developers.map((dev, i) => (
                <div
                  key       = {i}
                  className = "text-xs font-semibold uppercase text-[var(--color-hero-dev-text)]
                               bg-[var(--color-hero-dev-bg)] px-3 py-1 rounded-full"
                >
                  {dev}
                </div>
              ))}
            </div>

            <h1 className = "text-4xl lg:text-7xl font-extrabold leading-tight mb-3">
              {item.title}
            </h1>

            <div className = "text-xs font-semibold uppercase text-[var(--color-hero-platform)] mb-6 flex flex-wrap">
              {item.platforms.map((platform, i) => (
                <span key = {i} className = "whitespace-nowrap">
                  {platform}
                  {i < item.platforms.length - 1 && (
                    <span className = "mx-2">|</span>
                  )}
                </span>
              ))}
            </div>

            <div>
              <Link
                to        = {`/game/${item.id}`}
                className = "inline-flex items-center gap-3 bg-white text-black font-semibold uppercase
                             px-6 py-3 rounded-full transition-all duration-200
                             hover:bg-[var(--color-hero-hover-bg)] text-sm lg:text-base"
              >
                <Play className = "w-5 h-5" />
                <span>View Details</span>
              </Link>
            </div>

          </div>

        </div>
      ))}

      <div className = "absolute bottom-2 w-full z-20 flex gap-3 justify-center">
        {data.map((_, i) => (
          <button
            key       = {i}
            onClick   = {() => setActiveIndex(i)}
            className = {`h-12 ${i === activeIndex ? "w-12" : "w-4"} transition-all duration-500 cursor-pointer`}
          >
            <div className = "relative h-[3px] bg-white/20 rounded-full overflow-hidden">
              {i === activeIndex && (
                <div
                  className = "absolute inset-y-0 left-0 bg-[var(--color-rating)] rounded-full"
                  style     = {{ width: `${progress}%` }}
                />
              )}
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}

export default Hero;
