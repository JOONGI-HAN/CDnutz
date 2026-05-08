
/* Variants : Card || Row
   Styles vary depending on which
*/

function GameDescriptors({ data, variant = 'row' }) {
  const isCard = variant === 'card';

  const wrapperClass = isCard
    ? "flex flex-col gap-3 w-full"
    : "flex flex-col gap-2";

  const labelClass = isCard
    ? "text-[0.6rem] uppercase tracking-widest text-[var(--color-muted)] mb-1"
    : "text-[0.65rem] uppercase tracking-widest text-[var(--color-muted)] shrink-0";

  const typeValueClass = isCard
    ? "text-sm font-medium text-[var(--color-text-medium)]"
    : "text-sm text-[var(--color-text-soft)]";

  const summaryValueClass = isCard
    ? "text-xs text-[var(--color-subtle)] leading-relaxed"
    : "text-sm text-[var(--color-subtle)] leading-relaxed";

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

  const Field = ({ children }) => isCard
  ? <div className = {`rounded-lg bg-[var(--surface-card)] border border-[var(--surface-card-border)]
                       backdrop-blur-sm px-3 py-2`}
    >
      {children}
    </div>
    : <div className = "flex items-baseline gap-2">{children}</div>;

  return (
    <div className = {wrapperClass}>

      {data.game_type && (
        <Field>
          <p className = {labelClass}>Type</p>
          <p className = {typeValueClass}>{data.game_type}</p>
        </Field>
      )}

      {data.genres?.length > 0 && (
        <Field>
          <p className = {`${labelClass} ${isCard ? 'mb-2' : ''}`}>Genres</p>
          <div className = "flex flex-wrap gap-1.5">
            {data.genres.map((genre) => (
              <span key = {genre.name} className = {genrePillClass}>
                {genre.name}
              </span>
            ))}
          </div>
        </Field>
      )}

      {data.game_releases?.length > 0 && (
        <Field>
          <p className = {`${labelClass} ${isCard ? 'mb-2' : ''}`}>Platforms</p>
          <div className = "flex flex-wrap gap-1.5">
            {data.game_releases.map((release) => (
              <span key = {release.id} className = {platformPillClass}>
                {release.platform.name}
              </span>
            ))}
          </div>
        </Field>
      )}

      {data.summary && (
        <Field>
          <p className = {labelClass}>Overview</p>
          <p className = {summaryValueClass}>{data.summary}</p>
        </Field>
      )}

    </div>
  );
}

export default GameDescriptors;
