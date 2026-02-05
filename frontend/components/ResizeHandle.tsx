"use client";

interface VerticalResizeHandleProps {
  onResize: (percent: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  minPercent?: number;
  maxPercent?: number;
}

export function VerticalResizeHandle({
  onResize,
  containerRef,
  minPercent = 20,
  maxPercent = 80,
}: VerticalResizeHandleProps) {
  const handleMouseDown = () => {
    const handleMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(minPercent, Math.min(maxPercent, (x / rect.width) * 100));
      onResize(percent);
    };

    const handleUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  return (
    <div
      className="resize-handle resize-handle--vertical"
      onMouseDown={handleMouseDown}
      title="Drag to resize"
    >
      <span className="resize-handle-dots" />
    </div>
  );
}
