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


function GameDescriptors({ data, hintRequest, variant = GameDescriptorsVariants.ROW, redacted = false, disable = false }) {
  const isCard = variant === GameDescriptorsVariants.CARD;

  const redactionClass = (isRevealed) => {
    return isRevealed === false
      ? `${disable ? "cursor-not-allowed" : "cursor-pointer"}
       bg-black border-black text-transparent select-none break-all rounded-sm`
      : "";
  };

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

  const handleHintClick = (category, index, isRevealed) => {
    if (disable) return;

    if (isRevealed === false) {
      hintRequest(category, index);
    }
  };

  return (
    <div className = {wrapperClass}>

      {/* On smaller screens, display vertically with the rest */}
      {redacted && (data.game_type || data.release_date) && (
        <Field isCard = {isCard} className = "sm:hidden">
          <div className = "flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--color-muted)]">
            {data.game_type && <span className = "font-medium text-[var(--color-text-medium)]">{data.game_type}</span>}
            {data.game_type && data.release_date && <span>•</span>}
            {data.release_date && <span>{data.release_date}</span>}
          </div>
        </Field>
      )}

      {/* Normal mode display */}
      {data.game_type && (
        <Field isCard  = {isCard}>
          <p className = {labelClass}>Type</p>
          <p className = {typeValueClass}>{data.game_type}</p>
        </Field>
      )}

      {/* Guess The Game mode flat corporate rendering */}
      {redacted && data.companies && (
        <>
          {data.companies.developers?.length > 0 && (
            <Field isCard  = {isCard}>
              <p className = {labelClass}>Developers</p>
              <p className = {companyValueClass}>
                {data.companies.developers.map((c, i, arr) => (
                    <span key = {i}>
                      <span className = {redactionClass(c.revealed)} onClick = {() => {handleHintClick(["companies", "developers"], i, c.revealed)}}>
                        {c.name}
                      </span>
                      {i < arr.length - 1 && ", "}
                    </span>
                ))}
              </p>
            </Field>
          )}
          {data.companies.publishers?.length > 0 && (
            <Field isCard = {isCard}>
              <p className = {labelClass}>Publishers</p>
              <p className = {companyValueClass}>
                {data.companies.publishers.map((c, i, arr) => (
                    <span key = {i}>
                      <span className = {redactionClass(c.revealed)} onClick = {() => {handleHintClick(["companies", "publishers"], i, c.revealed)}}>
                        {c.name}
                      </span>
                      {i < arr.length - 1 && ", "}
                    </span>
                ))}
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
                    <span key = {i} className = {`${genrePillClass} ${redactionClass(genre.revealed)}`} onClick = {() => {handleHintClick("genres", i, genre.revealed)}}>
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
              <p className = {summaryValueClass}>
                {data.summary.map((chunk, index) => {
                  {/* revealed chunks with game title in them are independent spans that cannot be interacted with */}
                  if (chunk.revealed && chunk.sensitive_spans?.length > 0) {
                    const pieces = [];
                    let cursor = 0;

                    chunk.sensitive_spans.forEach(([start, end], spanIndex) => {
                      if (start > cursor) {
                        pieces.push(chunk.text.slice(cursor, start));
                      }
                      pieces.push(
                        <span key = {`hidden-${index}-${spanIndex}`} className = "bg-gradient-to-r from-[var(--color-trending)]
                                                                                  to-amber-500 bg-clip-text text-transparent font-bold drop-shadow-sm">
                          {chunk.text.slice(start, end)}
                        </span>
                      );
                      cursor = end;
                    });

                    if (cursor < chunk.text.length) {
                      pieces.push(chunk.text.slice(cursor));
                    }

                    return <span key = {index}>{pieces} {" "}</span>;
                  }

                  return (
                    <span key = {index} className = {redactionClass(chunk.revealed)} onClick = {() => {handleHintClick("summary", index, chunk.revealed)}}>
                      {chunk.text} {" "}
                    </span>
                  );
                })}
              </p>
          ) : (
              <p className = {`${summaryValueClass} ${redactionClass(data.summary.revealed)}`}>
                {data.summary}
              </p>
          )}
        </Field>
      )}

    </div>
  );
}

export default GameDescriptors;