interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  iconBg?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  iconBg,
}: EmptyStateProps) {
  return (
    <div
      className="empty"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        textAlign: "center",
      }}
    >
      <div
        className="empty-icon"
        style={{ background: iconBg ?? "var(--bg-2)" }}
      >
        {icon}
      </div>
      <div className="empty-title">{title}</div>
      {description && <div className="empty-desc">{description}</div>}
    </div>
  );
}
