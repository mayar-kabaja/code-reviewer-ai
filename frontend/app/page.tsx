"use client";

import { useState, useCallback, useRef } from "react";
import { Header } from "@/components/Header";
import { EditorPanel } from "@/components/EditorPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ConsolePanel, type ConsoleMessage } from "@/components/ConsolePanel";
import { VerticalResizeHandle } from "@/components/ResizeHandle";
import { SAMPLE_CODE } from "@/lib/constants";
import { generateSessionId, getApiUrl } from "@/lib/utils";
import type { ReviewReport, ChatMessage } from "@/lib/types";

const CONSOLE_DEFAULT_HEIGHT = 180;
const LEFT_PANEL_DEFAULT_PCT = 50;

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [consoleHeight, setConsoleHeight] = useState(CONSOLE_DEFAULT_HEIGHT);
  const [leftPanelPct, setLeftPanelPct] = useState(LEFT_PANEL_DEFAULT_PCT);

  const addConsoleMessage = useCallback((type: ConsoleMessage["type"], text: string) => {
    setConsoleMessages((prev) => [
      ...prev,
      { id: "c-" + Date.now() + "-" + Math.random().toString(36).slice(2), type, text },
    ]);
  }, []);

  const runReview = useCallback(async () => {
    if (!code.trim()) {
      alert("Please paste some code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: language || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
      } else {
        const err = data.error ?? "Unknown error";
        addConsoleMessage("error", `Review failed: ${err}`);
        setReport(null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      addConsoleMessage("error", msg);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [code, language, addConsoleMessage]);

  const handleClear = useCallback(() => {
    setCode("");
    setReport(null);
  }, []);

  const handleCopyRefactored = useCallback(() => {
    if (report?.refactored_code) {
      navigator.clipboard.writeText(report.refactored_code);
      alert("Copied!");
    }
  }, [report]);

  const sendChat = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      setChatMessages((prev: ChatMessage[]) => [
        ...prev,
        { id: "u-" + Date.now(), role: "user", content: message },
      ]);
      setChatLoading(true);
      try {
        const res = await fetch(`${getApiUrl()}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            message,
            code,
          }),
        });
        const data = await res.json();
        setChatMessages((prev: ChatMessage[]) => [
          ...prev,
          {
            id: "a-" + Date.now(),
            role: "agent",
            content: data.success ? data.response : "Error occurred",
          },
        ]);
      } catch {
        addConsoleMessage("error", "Chat: Connection failed");
        setChatMessages((prev: ChatMessage[]) => [
          ...prev,
          { id: "a-" + Date.now(), role: "agent", content: "Connection failed" },
        ]);
      } finally {
        setChatLoading(false);
      }
    },
    [sessionId, code, addConsoleMessage]
  );

  return (
    <div className="app-content">
      <Header />
      <div
        ref={mainRef}
        className="main main--resizable"
        style={{ "--left-panel-pct": leftPanelPct } as React.CSSProperties}
      >
        <div className="main-left">
          <EditorPanel
            code={code}
            language={language}
            report={report}
            loading={loading}
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
            onAnalyze={runReview}
            onClear={handleClear}
          />
        </div>
        <VerticalResizeHandle
          containerRef={mainRef}
          onResize={setLeftPanelPct}
          minPercent={25}
          maxPercent={75}
        />
        <div className="main-right">
          <ResultsPanel
            report={report}
            loading={loading}
            chatMessages={chatMessages}
            chatLoading={chatLoading}
            onSendChat={sendChat}
            onCopyRefactored={handleCopyRefactored}
          />
        </div>
      </div>
      <ConsolePanel
        messages={consoleMessages}
        height={consoleHeight}
        onResize={setConsoleHeight}
        onClear={() => setConsoleMessages([])}
      />
    </div>
  );
}
