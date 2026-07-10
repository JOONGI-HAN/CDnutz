import { CircleCheck, Gamepad2, HeartPlus, Pencil, Plus } from 'lucide-react';

import StarRating   from './duplicate/starRating';
import StatusButton from './duplicate/gamePlayerCount';
import ActionButton from './duplicate/actionButton.jsx';

function ActionsModal({ open, toggle }) {
  return (
    <>
      {open && (
        <div className = "fixed top-auto bottom-0 left-0 right-0 z-50 flex flex-col">

          <div
            className = "fixed inset-0 bg-[var(--surface-overlay)]"
            onClick   = {() => toggle(false)}
          />

          <div className = "relative rounded-t-lg bg-[var(--surface-dark-mid)]/95
                            border-t border-[var(--surface-card-border)]
                            backdrop-blur-sm p-5 flex flex-col gap-4">

            <div className = "w-10 h-1 rounded-full bg-[var(--surface-card-hover)] self-center mb-1" />

            <StarRating className = "self-center [&_svg]:w-7 [&_svg]:h-7" />

            <div className = "flex gap-2">
              <StatusButton icon = {HeartPlus}   label = "Want"    hoverColor = "group-hover:text-[var(--color-status-want)]" />
              <StatusButton icon = {Gamepad2}    label = "Playing" hoverColor = "group-hover:text-[var(--color-status-playing)]" />
              <StatusButton icon = {CircleCheck} label = "Played"  hoverColor = "group-hover:text-[var(--color-status-played)]" />
            </div>

            <div className = "flex flex-col gap-2 border-t border-[var(--surface-card-border)] pt-4">
              <ActionButton icon = {Pencil} label = "Add to a playlist" />
              <ActionButton icon = {Plus}   label = "Write a review" />
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default ActionsModal;
