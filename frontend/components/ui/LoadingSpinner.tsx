interface LoadingSpinnerProps {
  size?: "sm" | "md";
  className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const dim = size === "sm" ? 16 : 40;
  const border = size === "sm" ? 2 : 3;
  return (
    <div
      className={className}
      style={{
        width: dim,
        height: dim,
        border: `${border}px solid var(--border)`,
        borderTopColor: "var(--accent)",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
  );
}

export function LoadingState({ text = "Analyzing your code..." }: { text?: string }) {
  return (
    <div className="loading">
      <div className="spinner" />
      <div className="loading-text">{text}</div>
    </div>
  );
}
