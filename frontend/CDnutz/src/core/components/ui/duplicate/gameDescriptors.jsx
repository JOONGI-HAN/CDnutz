/* Variants : Card || Row
   Styles vary depending on which

   redacted indicates we are in Guess The Game mode ==> add a redaction filter, and possibly alter the layout a little
*/

import {GameDescriptorsVariants} from "../../../enums.js";

function Field({ children, className = "", isCard }) {
  if (isCard) {
    return (
      <div className = {`rounded-lg bg-[var(--surface-card)] border border-[var(--surface-card-border)] backdrop-blur-sm px-3 py-2 min-w-0 overflow-hidden ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className = {`flex items-baseline gap-2 min-w-0 ${className}`}>
      {children}
    </div>
  );
}


function GameDescriptors({ data, variant = GameDescriptorsVariants.ROW, redacted = false }) {
  const isCard = variant === GameDescriptorsVariants.CARD;

  const wrapperClass = isCard
    ? "flex flex-col gap-3 w-full min-w-0"
    : "flex flex-col gap-2 min-w-0";

  const labelClass = isCard
    ? "text-[0.6rem] uppercase tracking-widest text-[var(--color-muted)] mb-1"
    : "text-[0.65rem] uppercase tracking-widest text-[var(--color-muted)] shrink-0";

  const typeValueClass = isCard
    ? "text-sm font-medium text-[var(--color-text-medium)] break-words"
    : "text-sm text-[var(--color-text-soft)] break-words";

  const summaryValueClass = isCard
    ? "text-xs text-[var(--color-subtle)] leading-relaxed break-words"
    : "text-sm text-[var(--color-subtle)] leading-relaxed break-words";

  const companyValueClass = isCard
    ? "text-xs font-medium text-[var(--color-text-medium)] break-words"
    : "text-xs text-[var(--color-text-soft)] break-words";

  const genrePillClass = `
    text-[0.65rem] uppercase tracking-wider
    text-[var(--color-rating)]/80
    bg-[var(--color-rating-bg)]/10
    border border-[var(--color-rating-bg)]/20
    rounded px-1.5 py-0.5
  `;

  const platformPillClass = `
    text-[0.65rem] uppercase tracking-wider
    text-[var(--color-text-soft)]
    bg-[var(--surface-card)]
    border border-[var(--surface-card-border)]
    rounded px-1.5 py-0.5
  `;

  return (
    <div className = {wrapperClass}>

      {/* On smaller screens: display back to the right of the cover inline */}
      {redacted && (data.game_type || data.release_date) && (
        <Field isCard = {isCard} className = "sm:hidden">
          <div className = "flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--color-muted)]">
            {data.game_type && <span className = "font-medium text-[var(--color-text-medium)]">{data.game_type}</span>}
            {data.game_type && data.release_date && <span>•</span>}
            {data.release_date && <span>{data.release_date}</span>}
          </div>
        </Field>
      )}

      {/* Normal mode display (Only if not hidden by Guess The Game configurations) */}
      {!redacted && data.game_type && (
        <Field isCard = {isCard}>
          <p className = {labelClass}>Type</p>
          <p className = {typeValueClass}>{data.game_type}</p>
        </Field>
      )}

      {/* Guess The Game mode flat corporate rendering */}
      {redacted && data.companies && (
        <>
          {data.companies.developers?.length > 0 && (
            <Field isCard = {isCard}>
              <p className = {labelClass}>Developers</p>
              <p className = {companyValueClass}>
                {data.companies.developers.map(c => c.name).join(", ")}
              </p>
            </Field>
          )}
          {data.companies.publishers?.length > 0 && (
            <Field isCard = {isCard}>
              <p className = {labelClass}>Publishers</p>
              <p className = {companyValueClass}>
                {data.companies.publishers.map(c => c.name).join(", ")}
              </p>
            </Field>
          )}
        </>
      )}

      {data.genres?.length > 0 && (
        <Field isCard = {isCard}>
          <p className = {`${labelClass} ${isCard ? 'mb-2' : ''}`}>Genres</p>
          <div className = "flex flex-wrap gap-1.5">
            {data.genres.map((genre, i) => (
              <span key = {i} className = {genrePillClass}>
                {genre.name}
              </span>
            ))}
          </div>
        </Field>
      )}

      {data.releases?.length > 0 && (
        <Field isCard = {isCard}>
          <p className = {`${labelClass} ${isCard ? 'mb-2' : ''}`}>Platforms</p>
          <div className = "flex flex-wrap gap-1.5">
            {data.releases.map((release, i) => (
              <span key = {i} className = {platformPillClass}>
                {release.platform.name}
              </span>
            ))}
          </div>
        </Field>
      )}

      {data.summary && (
        <Field isCard = {isCard}>
          <p className = {labelClass}>Overview</p>

          {Array.isArray(data.summary) ? (
            data.summary.map((chunk, index) => (
              <p key = {index} className = {summaryValueClass}>
                {chunk.text}
              </p>
            ))
          ) : (
            <p className = {summaryValueClass}>
              {data.summary}
            </p>
          )}
        </Field>
      )}

    </div>
  );
}

export default GameDescriptors;