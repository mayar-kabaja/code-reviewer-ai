"use client";

export interface ConsoleMessage {
  id: string;
  type: "error" | "log" | "warn";
  text: string;
}

interface ConsolePanelProps {
  messages: ConsoleMessage[];
  height: number;
  onResize: (height: number) => void;
  onClear: () => void;
}

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 400;

export function ConsolePanel({
  messages,
  height,
  onResize,
  onClear,
}: ConsolePanelProps) {
  const handleMouseDown = () => {
    const handleMove = (e: MouseEvent) => {
      const y = e.clientY;
      const newHeight = Math.max(
        MIN_HEIGHT,
        Math.min(MAX_HEIGHT, window.innerHeight - y)
      );
      onResize(newHeight);
    };

    const handleUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  return (
    <div
      className="console-panel"
      style={{ height: `${height}px` }}
    >
      <div
        className="console-resize-handle"
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      >
        <span className="console-resize-dots">⋮⋮⋮</span>
      </div>
      <div className="console-header">
        <span className="console-title">
          <span className="console-icon">▤</span>
          Console Messages
        </span>
        <button
          type="button"
          className="console-clear-btn"
          onClick={onClear}
        >
          Clear
        </button>
      </div>
      <div className="console-messages">
        {messages.length === 0 ? (
          <div className="console-placeholder">No messages yet.</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`console-msg console-msg--${msg.type}`}
            >
              <span className="console-msg-icon">
                {msg.type === "error" ? "✕" : msg.type === "warn" ? "⚠" : "○"}
              </span>
              <span className="console-msg-text">{msg.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
