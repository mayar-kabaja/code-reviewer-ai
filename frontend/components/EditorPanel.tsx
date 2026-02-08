"use client";

import { type MutableRefObject } from "react";
import { CodeEditor } from "./CodeEditor";
import { Button } from "./ui/Button";
import type { ReviewReport } from "@/lib/types";

interface EditorPanelProps {
  code: string;
  language: string;
  report: ReviewReport | null;
  loading: boolean;
  editorKey?: number;
  getEditorValueRef?: MutableRefObject<() => string>;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  onLoadSample?: () => void;
}

export function EditorPanel({
  code,
  language,
  report,
  loading,
  editorKey = 0,
  getEditorValueRef,
  onCodeChange,
  onLanguageChange,
  onAnalyze,
  onClear,
  onLoadSample,
}: EditorPanelProps) {
  return (
    <div className="panel panelLeft">
      <CodeEditor
        key={editorKey}
        value={code}
        language={language}
        report={report}
        getEditorValueRef={getEditorValueRef}
        onCodeChange={onCodeChange}
        onLanguageChange={onLanguageChange}
      />
      <div className="actions">
        <Button
          variant="primary"
          onClick={onAnalyze}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner"
                style={{
                  width: 16,
                  height: 16,
                  borderWidth: 2,
                  margin: 0,
                }}
              />
              Analyzing…
            </>
          ) : (
            <>🔍 Analyze Code</>
          )}
        </Button>
        <Button variant="secondary" onClick={onClear}>
          🗑️ Clear
        </Button>
        <div style={{ flex: 1 }} />
        <Button
          variant="ghost"
          className="btn-orange"
          onClick={() => onLoadSample?.()}
        >
          Load Sample
        </Button>
      </div>
    </div>
  );
}
