
function ActionButton({ icon: Icon, label }) {
  return (
    <button
      className = "flex items-center gap-3 w-full rounded-lg
                   bg-[var(--surface-card)] border border-[var(--surface-card-border)]
                   hover:bg-[var(--surface-card-hover)] hover:border-[var(--surface-card-border-hover)]
                   transition-colors px-4 py-3 group"
    >
      <Icon
        className = "w-5 h-5 text-[var(--color-subtle)] group-hover:text-[var(--accent-bright)]
                     transition-colors flex-shrink-0"
      />
      <span className = "text-sm text-[var(--color-text-soft)] tracking-wide">{label}</span>
    </button>
  );
}

export default ActionButton;
