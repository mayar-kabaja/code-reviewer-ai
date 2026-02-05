"use client";

import { CodeEditor } from "./CodeEditor";
import { Button } from "./ui/Button";
import { SAMPLE_CODE } from "@/lib/constants";
import type { ReviewReport } from "@/lib/types";

interface EditorPanelProps {
  code: string;
  language: string;
  report: ReviewReport | null;
  loading: boolean;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
}

export function EditorPanel({
  code,
  language,
  report,
  loading,
  onCodeChange,
  onLanguageChange,
  onAnalyze,
  onClear,
}: EditorPanelProps) {
  return (
    <div className="panel panelLeft">
      <CodeEditor
        value={code}
        language={language}
        report={report}
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
          onClick={() => onCodeChange(SAMPLE_CODE)}
        >
          Load Sample
        </Button>
      </div>
    </div>
  );
}
