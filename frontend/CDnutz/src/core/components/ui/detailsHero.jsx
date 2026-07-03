import { Star, CircleCheck, CirclePlay, Gamepad2, HeartPlus, Pencil, Plus } from 'lucide-react';

import StarRating      from './duplicate/starRating';
import StatusButton    from './duplicate/gamePlayerCount';
import ActionButton    from './duplicate/gameDetailsActions';
import GameDescriptors from './duplicate/gameDescriptors';
import GameCard        from './duplicate/gameCard';

import {useState} from "react"

import useWindowSizeListener          from "../../hooks/useWindowSizeListener";
import {GameDescriptorsVariants, Breakpoints} from "../../enums.js";

{/* Determine which GameDescriptors variant to show based on current viewport */}
function getInitialVariant() {
  if (window.matchMedia(Breakpoints.XL).matches) return GameDescriptorsVariants.ROW;
  if (window.matchMedia(Breakpoints.MD).matches) return GameDescriptorsVariants.CARD;
  return GameDescriptorsVariants.ROW;
}


function DetailsHero({ data }) {

  const [descriptorVariant, setDescriptorVariant] = useState(getInitialVariant);

  {/* Crossing md: entering the CARD zone */}
  useWindowSizeListener({
    query        : Breakpoints.MD,
    actionFN     : setDescriptorVariant,
    matchState   : GameDescriptorsVariants.CARD,
    unmatchState : GameDescriptorsVariants.ROW,
  });

  {/* Crossing xl: entering the ROW zone */}
  useWindowSizeListener({
    query        : Breakpoints.XL,
    actionFN     : setDescriptorVariant,
    matchState   : GameDescriptorsVariants.ROW,
    unmatchState : GameDescriptorsVariants.CARD,
  });

  const showCardDescriptors = descriptorVariant === GameDescriptorsVariants.CARD;

  return (
      <div>
        <div
          className = "bg-cover w-full bg-[var(--accent-bright)]"
          style     = {data.wallpaper ? { backgroundImage: `url(${data.wallpaper.url})` } : {}}
        >
          <div className = "bg-gradient-to-b from-black/60 via-black/80 to-black py-4
                            flex flex-col items-center justify-center h-full">
            <div className = "w-full max-w-6xl px-6">
              <div className = "flex flex-wrap items-baseline gap-2 mb-1">
                <h1 className = "text-4xl lg:text-6xl font-black tracking-wide uppercase leading-none text-balance">
                  {data.title}
                </h1>
                {data.release_date && (
                  <span className = "text-xs tracking-widest text-[var(--color-subtle)]
                                     border border-[var(--color-text-dim)] rounded px-1.5 py-0.5">
                    {data.release_date}
                  </span>
                )}
              </div>

              <div className="w-[50%] flex flex-wrap gap-x-3 gap-y-1 mb-6">
                {(() => {
                  const seen= new Set()
                  const pubFrequencies = data.companies.publishers.reduce((accumulator, company) => {

                          if (accumulator.has(company.id)) {
                            const count = accumulator.get(company.id)
                            accumulator.set(company.id, count + 1)
                          } else {
                            accumulator.set(company.id, 1)
                          }

                          return accumulator
                      }
                      , new Map())

                  return (
                    <>
                      {data.companies.developers.map((company) => {

                        if (seen.has(company.id)) {
                          return
                        }

                        seen.add(company.id)
                        const isAlso = pubFrequencies.has(company.id)

                        return (
                          <span
                            key       = {company.id}
                            className = {`text-[0.7rem] uppercase tracking-widest pb-px ${
                            isAlso
                              ? "inline-block text-white/70 border-b border-[var(--color-rating)]" +
                                " after:block after:h-px after:bg-white/20"
                              : "text-[var(--color-rating)] border-b border-[var(--color-rating)]"
                            }`}
                          >
                            {company.name}
                          </span>
                        )
                      })}

                      {data.companies.publishers.map((company) => {
                        if (seen.has(company.id)) return
                        return (
                          <span
                            key       = {company.id}
                            className = "text-[0.7rem] uppercase tracking-widest border-b pb-px
                                         text-white/70 border-white/20"
                          >
                            {company.name}
                          </span>
                        )
                      })}
                    </>
                  )
                })()}
              </div>

              <div className = "grid xl:grid-cols-[250px_minmax(0,500px)_minmax(max-content,auto)] gap-6">

                <GameCard data = {data} showDescriptors = {showCardDescriptors} />

                {/* Trailer video */}
                <div className = "w-full max-w-2xl mx-auto rounded-xl overflow-hidden
                                  border border-[var(--border)] bg-[var(--surface-dark)]
                                  shadow-2xl relative aspect-video self-center">
                  {data.trailer ? (
                    <iframe
                      className    = "w-full h-full"
                      src          = {data.trailer}
                      allow        = "accelerometer; autoplay; clipboard-write;
                                      encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className = "absolute inset-0 flex flex-col items-center
                                      justify-center gap-3 text-[var(--color-text-dim)]">
                      <CirclePlay className = "w-12 h-12" />
                      <span className       = "text-sm uppercase tracking-widest text-center px-4">
                        No trailer available
                      </span>
                    </div>
                  )}
                </div>

                <div className = "grid grid-cols-[auto_auto] max-sm:grid-cols-1 xl:grid-cols-1 gap-2 lg:gap-4 self-center">

                  {/* Rating and status panel */}
                  <div className = "rounded-lg bg-[var(--surface-card)] border border-[var(--surface-card-border)]
                                    backdrop-blur-sm p-4 flex flex-col gap-4 h-fit">

                    <div className          = "flex flex-col gap-3">
                      <div className        = "flex flex-col gap-2">
                        <div className      = "flex items-center justify-between">
                          <div className    = "flex items-center gap-1.5">
                            <Star className = "w-6 h-6 text-[var(--color-muted)]" />
                            <span className = "text-[0.6rem] uppercase tracking-widest text-[var(--color-muted)]">
                              User ratings
                            </span>
                          </div>
                          <span className   = "text-xs text-[var(--color-subtle)]">N/A</span>
                        </div>
                        <div className      = "flex items-center justify-between">
                          <div className    = "flex items-center gap-1.5">
                            <Star className = "w-6 h-6 text-[var(--color-rating)]" />
                            <span className = "text-[0.6rem] uppercase tracking-widest text-[var(--color-muted)]">
                              External rating
                            </span>
                          </div>
                          <span className = "text-xs font-medium text-[var(--color-rating)]">
                            {data.score ?? 'N/A'}
                          </span>
                        </div>
                      </div>

                      <StarRating className = "self-center max-sm:hidden" />
                    </div>

                    {/* Status buttons */}
                    <div className = "flex gap-2 border-t pt-4 border-[var(--surface-card-border)] max-sm:hidden">
                      <StatusButton icon = {HeartPlus}   label = "Want"    hoverColor = "group-hover:text-[var(--color-status-want)]" />
                      <StatusButton icon = {Gamepad2}    label = "Playing" hoverColor = "group-hover:text-[var(--color-status-playing)]" />
                      <StatusButton icon = {CircleCheck} label = "Played"  hoverColor = "group-hover:text-[var(--color-status-played)]" />
                    </div>

                  </div>

                  <div className = "flex flex-col gap-2 max-sm:hidden xl:hidden self-end">
                    <ActionButton icon = {Pencil} label = "Add to a playlist" />
                    <ActionButton icon = {Plus}   label = "Write a review" />
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Meta data row; small screens and xl+ only */}
        {descriptorVariant === GameDescriptorsVariants.ROW && (
          <div className   = "bg-[var(--surface-meta-row)] border-t border-[var(--surface-card-border)]">
            <div className = "w-full max-w-6xl mx-auto px-6 py-4">
              <GameDescriptors data = {data} variant = {GameDescriptorsVariants.ROW} />
            </div>
          </div>
        )}

      </div>
  );
}

export default DetailsHero;
