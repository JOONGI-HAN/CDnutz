
function ActionButton({ className, icon: Icon, label, onClick, type, disable = false }) {
  return (
    <button
      className = {`${className || `flex items-center gap-3 rounded-lg
                   bg-[var(--surface-card)] border border-[var(--surface-card-border)]
                   hover:bg-[var(--surface-card-hover)] hover:border-[var(--surface-card-border-hover)]
                   transition-colors px-4 py-3 group text-nowrap`}
                   ${disable ? `disabled:opacity-50
                   disabled:cursor-not-allowed`: "cursor-pointer"}`}
      disabled  = {disable}
      onClick   = {onClick} type = {type}
    >
      {Icon &&
        <Icon
          className = "w-5 h-5 text-[var(--color-subtle)] group-hover:text-[var(--accent-bright)]
                       transition-colors flex-shrink-0"
        />
      }
      <span className = "text-sm text-[var(--color-text-soft)] tracking-wide">{label}</span>
    </button>
  );
}

export default ActionButton;
