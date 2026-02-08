"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { EditorPanel } from "@/components/EditorPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ConsolePanel, type ConsoleMessage } from "@/components/ConsolePanel";
import { VerticalResizeHandle } from "@/components/ResizeHandle";
import toast from "react-hot-toast";
import { SAMPLE_CODES } from "@/lib/constants";
import { generateSessionId, getApiUrl } from "@/lib/utils";
import type { ReviewReport, ChatMessage, Issue } from "@/lib/types";

const CONSOLE_DEFAULT_HEIGHT = 180;
const LEFT_PANEL_DEFAULT_PCT = 50;

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef("");
  const getEditorValueRef = useRef<() => string>(() => "");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refactorLoading, setRefactorLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [consoleHeight, setConsoleHeight] = useState(CONSOLE_DEFAULT_HEIGHT);
  const [leftPanelPct, setLeftPanelPct] = useState(LEFT_PANEL_DEFAULT_PCT);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const handleCodeChange = useCallback((newCode: string) => {
    codeRef.current = newCode;
    setCode(newCode);
  }, []);

  const addConsoleMessage = useCallback((type: ConsoleMessage["type"], text: string) => {
    setConsoleMessages((prev) => [
      ...prev,
      { id: "c-" + Date.now() + "-" + Math.random().toString(36).slice(2), type, text },
    ]);
  }, []);

  const runReviewWithCode = useCallback(
    async (codeToReview: string, lang?: string) => {
      if (!codeToReview.trim()) return;
      setLoading(true);
      setReport(null);
      setRefactoredCode(null);
      setConsoleMessages([]); // show only this run's result
      try {
        const res = await fetch(`${getApiUrl()}/api/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codeToReview, language: lang || undefined }),
        });
        const data = await res.json();
        if (data.success) {
          const report = data.report as ReviewReport;
          setReport(report);
          setRefactoredCode(report?.refactored_code ?? null);
          const issueCount = report?.issues?.length ?? 0;
          addConsoleMessage("info", `Analysis complete. ${issueCount} issue(s) found. Score: ${report?.health_score ?? "—"}`);
          report?.issues?.forEach((issue: Issue, i: number) => {
            addConsoleMessage("info", `[${i + 1}] ${issue.severity ?? "issue"}: ${issue.description ?? ""}`);
          });
        } else {
          const err = data.error ?? "Unknown error";
          addConsoleMessage("error", `Review failed: ${err}`);
          setReport(null);
          setRefactoredCode(null);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Connection failed";
        addConsoleMessage("error", msg);
        setReport(null);
        setRefactoredCode(null);
      } finally {
        setLoading(false);
      }
    },
    [addConsoleMessage]
  );

  const runReview = useCallback(async () => {
    const fromEditor = getEditorValueRef.current?.();
    const currentCode = (typeof fromEditor === "string" ? fromEditor : codeRef.current ?? "").trim();
    if (!currentCode) {
      toast.error("Please paste some code");
      return;
    }
    await runReviewWithCode(currentCode, language);
  }, [language, runReviewWithCode]);

  const handleClear = useCallback(() => {
    codeRef.current = "";
    setCode("");
    setReport(null);
    setRefactoredCode(null);
  }, []);

  const loadRandomSample = useCallback(() => {
    const sample = SAMPLE_CODES[Math.floor(Math.random() * SAMPLE_CODES.length)];
    codeRef.current = sample.code;
    setCode(sample.code);
    setLanguage(sample.language);
    setEditorKey((k) => k + 1);
  }, []);

  const runRefactor = useCallback(async () => {
    const fromEditor = getEditorValueRef.current?.();
    const currentCode = (typeof fromEditor === "string" ? fromEditor : codeRef.current ?? "").trim();
    if (!currentCode) {
      toast.error("Please paste some code");
      return;
    }
    setRefactorLoading(true);
    setRefactoredCode(null);
    try {
      const res = await fetch(`${getApiUrl()}/api/refactor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: currentCode, language: language || undefined }),
      });
      const data = await res.json();
      if (data.success && data.refactored_code != null) {
        setRefactoredCode(data.refactored_code);
      } else {
        addConsoleMessage("error", data.error ?? "Refactor failed");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Connection failed";
      addConsoleMessage("error", msg);
    } finally {
      setRefactorLoading(false);
    }
  }, [language, addConsoleMessage]);

  const handleCopyRefactored = useCallback(() => {
    const toCopy = refactoredCode ?? report?.refactored_code;
    if (toCopy) {
      navigator.clipboard.writeText(toCopy);
      toast.success("Copied!");
    }
  }, [refactoredCode, report]);

  const handleApplyRefactored = useCallback(() => {
    const toApply = refactoredCode ?? report?.refactored_code;
    if (toApply) {
      codeRef.current = toApply;
      setCode(toApply);
      setEditorKey((k) => k + 1);
      runReviewWithCode(toApply, language);
    }
  }, [refactoredCode, report, language, runReviewWithCode]);

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
            code: getEditorValueRef.current?.() || codeRef.current || "",
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
    [sessionId, addConsoleMessage]
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
            editorKey={editorKey}
            getEditorValueRef={getEditorValueRef}
            onCodeChange={handleCodeChange}
            onLanguageChange={setLanguage}
            onAnalyze={runReview}
            onClear={handleClear}
            onLoadSample={loadRandomSample}
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
            refactoredCode={refactoredCode}
            refactorLoading={refactorLoading}
            loading={loading}
            chatMessages={chatMessages}
            chatLoading={chatLoading}
            onSendChat={sendChat}
            onRefactor={runRefactor}
            onCopyRefactored={handleCopyRefactored}
            onApplyRefactored={handleApplyRefactored}
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
