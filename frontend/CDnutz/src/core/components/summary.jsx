
function Summary({ data, loading, error }) {
  return (

    <div className = "px-6 md:px-12 lg:px-20 py-20">

      <div className = "flex flex-col xl:grid xl:grid-cols-[6fr_4fr] gap-8">

        <div className = "text-white flex flex-col items-center lg:col-span-2">
          <div className = "italic font-['Georgia',_serif] text-lg px-8">
            <h2 className = "relative w-fit before:content-['“'] before:text-7xl before:text-[var(--accent-bright)]
                             before:absolute before:-top-6 before:-left-10 before:opacity-50">
              <span>person 1: </span>Have you seen that new website called CD?</h2>
            <h2><span>person 2: </span>CD what?</h2>
            <h2 className = "relative w-fit after:content-['”'] after:text-7xl after:text-[var(--accent-bright)]
                             after:absolute after:-bottom-6 after:-right-10 after:opacity-50">
              <span>person 1: </span>CD...NUTZ! HA!</h2>
          </div>
          <p className = "text-sm text-[var(--color-secondary)]">— Based on a real conversation excerpt</p>
        </div>

        <div className = "box-border text-justify text-md lg:text-lg text-[var(--color-primary)] leading-relaxed font-light]">
          <p className = "mb-5">
            Let’s be real—your gaming library is more than just a list of titles; it’s a legacy.
             But between different launchers, consoles, and retro backlogs,
             keeping track of your journey shouldn't feel like a final boss battle.
          </p>
          <p>
            <span className = "text-white font-semibold italic">CDnutz</span>,
            the most comprehensive video game database and tracking ecosystem designed by gamers, for gamers.
            We’ve stripped away the clutter to deliver a seamless, high-octane UI and a user experience so intuitive it feels like second nature.
          </p>
        </div>

        <div className = "flex flex-wrap gap-2">
          {
            Object.entries(data).map(([key, value], i) => (
              <div
                key = {i}
                className = "border border-[var(--interractive-background)] rounded-lg p-4 flex-1 min-w-[200px]"
              >
                <p className = "text-[var(--accent-bright)] text-4xl font-bold leading-tight mb-2 whitespace-nowrap">{value}</p>
                <p className = "text-sm font-bold text-[var(--color-primary)] tracking-[0.2em] uppercase whitespace-nowrap">{key}</p>
              </div>
            ))
          }
        </div>

      </div>

    </div>
  )
}

export default Summary
