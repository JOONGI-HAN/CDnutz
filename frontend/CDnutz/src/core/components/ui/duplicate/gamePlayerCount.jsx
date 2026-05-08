
function StatusButton({ icon: Icon, label, count, hoverColor }) {
  return (
    <button
      className = "flex-1 flex flex-col items-center gap-1 rounded-lg
                   bg-[var(--surface-card)] border border-[var(--surface-card-border)]
                   hover:bg-[var(--surface-card-hover)] hover:border-[var(--surface-card-border-hover)]
                   transition-colors py-2.5 px-2 group"
    >
      <Icon className = {`w-5 h-5 text-[var(--color-subtle)] transition-colors ${hoverColor}`} />
      <span className = "text-[0.6rem] uppercase tracking-widest text-[var(--color-muted)]">{label}</span>
      <span className = "text-xs font-medium text-[var(--color-text-soft)]">{count ?? 0}</span>
    </button>
  );
}

export default StatusButton;
