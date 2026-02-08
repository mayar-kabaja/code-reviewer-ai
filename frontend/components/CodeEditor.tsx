"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { ReviewReport } from "@/lib/types";

interface EditorViewLike {
  state: { doc: { toString(): string } };
}

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
  typescript: () => import("@codemirror/lang-javascript").then((m) => (m as { typescript?: () => unknown }).typescript?.() ?? (m as { javascript: () => unknown }).javascript()),
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
  /** Ref to a function that returns the current editor content (used when clicking Analyze). */
  getEditorValueRef?: MutableRefObject<() => string>;
}

export function CodeEditor({
  value,
  language,
  onLanguageChange,
  onCodeChange,
  getEditorValueRef,
}: CodeEditorProps) {
  const [extensions, setExtensions] = useState<unknown[]>([]);
  const mode = language || "python";
  const viewRef = useRef<EditorViewLike | null>(null);

  useEffect(() => {
    const loader = LANG_LOADERS[mode] || LANG_LOADERS.python;
    loader().then((ext) => setExtensions([ext]));
  }, [mode]);

  const onCreateEditor = useCallback(
    (view: EditorViewLike) => {
      viewRef.current = view;
      if (getEditorValueRef) {
        getEditorValueRef.current = () =>
          viewRef.current?.state.doc.toString() ?? "";
      }
    },
    [getEditorValueRef]
  );

  const handleChange = useCallback(
    (v: string) => {
      onCodeChange(v);
    },
    [onCodeChange]
  );

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
          extensions={extensions as any}
          onChange={handleChange}
          onCreateEditor={onCreateEditor}
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
