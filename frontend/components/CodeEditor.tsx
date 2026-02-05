"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ReviewReport } from "@/lib/types";

const CodeMirrorEditor = dynamic(
  () => import("@uiw/react-codemirror").then((m) => m.default),
  { ssr: false }
);

const LANG_OPTIONS = [
  { value: "", label: "Auto-detect" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "sql", label: "SQL" },
];

const LANG_LOADERS: Record<string, () => Promise<unknown>> = {
  python: () => import("@codemirror/lang-python").then((m) => m.python()),
  javascript: () => import("@codemirror/lang-javascript").then((m) => m.javascript()),
  typescript: () => import("@codemirror/lang-javascript").then((m) => m.typescript()),
  java: () => import("@codemirror/lang-java").then((m) => m.java()),
  cpp: () => import("@codemirror/lang-cpp").then((m) => m.cpp()),
  go: () => import("@codemirror/lang-go").then((m) => m.go()),
  rust: () => import("@codemirror/lang-rust").then((m) => m.rust()),
  php: () => import("@codemirror/lang-php").then((m) => m.php()),
  sql: () => import("@codemirror/lang-sql").then((m) => m.sql()),
};

interface CodeEditorProps {
  value: string;
  language: string;
  onLanguageChange: (lang: string) => void;
  onCodeChange: (code: string) => void;
  report: ReviewReport | null;
}

export function CodeEditor({
  value,
  language,
  onLanguageChange,
  onCodeChange,
}: CodeEditorProps) {
  const [extensions, setExtensions] = useState<unknown[]>([]);
  const mode = language || "python";

  useEffect(() => {
    const loader = LANG_LOADERS[mode] || LANG_LOADERS.python;
    loader().then((ext) => setExtensions([ext]));
  }, [mode]);

  return (
    <>
      <div className="panelHeader">
        <div className="panelTitle">📝 Source Code</div>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="langSelect"
        >
          {LANG_OPTIONS.map((opt) => (
            <option key={opt.value || "auto"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="editorWrap">
        <CodeMirrorEditor
          value={value}
          height="100%"
          extensions={extensions}
          onChange={(v) => onCodeChange(v)}
          theme="dark"
          basicSetup={{
            lineNumbers: true,
            indentOnInput: true,
            tabSize: 4,
          }}
          style={{ fontFamily: "var(--font-mono), monospace", fontSize: "13px" }}
        />
      </div>
    </>
  );
}
