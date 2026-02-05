export function Header() {
  return (
    <header
      className="app-header"
      style={{
        background: "var(--bg-2)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 1.5rem",
        height: 60,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        className="logo logo-title"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "1.25rem",
          fontWeight: 700,
        }}
      >
        <div
          className="logo-icon"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⚡
        </div>
        Code<span className="logo-gradient">Review</span> AI
      </div>
      <div
        className="badge"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 100,
          fontSize: "0.75rem",
          color: "var(--success)",
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            background: "var(--success)",
            borderRadius: "50%",
            animation: "pulse 2s infinite",
          }}
        />
        Powered by Groq
      </div>
    </header>
  );
}
