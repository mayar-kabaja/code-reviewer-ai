/** Escape text for safe HTML display (works in browser and Node/SSR) */
export function escapeHtml(text: string): string {
  if (typeof document === "undefined") {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function generateSessionId(): string {
  return "s_" + Math.random().toString(36).slice(2);
}

/** API base URL: use backend when NEXT_PUBLIC_API_URL is set, else same origin (Next.js API routes) */
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_API_URL ?? "") || "";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}
