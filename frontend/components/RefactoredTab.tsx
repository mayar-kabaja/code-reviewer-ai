"use client";

import { Button } from "./ui/Button";
import { EmptyState } from "./ui/EmptyState";
import { escapeHtml } from "@/lib/utils";

interface RefactoredTabProps {
  refactoredCode: string | null | undefined;
  hasReport: boolean;
  refactorLoading: boolean;
  onRefactor: () => void;
  onCopy: () => void;
  onApply: () => void;
}

export function RefactoredTab({
  refactoredCode,
  hasReport,
  refactorLoading,
  onRefactor,
  onCopy,
  onApply,
}: RefactoredTabProps) {
  if (!refactoredCode) {
    return (
      <div className="scroll">
        <EmptyState
          icon="✨"
          title={hasReport ? "Ready to improve" : "Analyze first"}
          description={
            hasReport
              ? "Click Refactor to get an improved version of your code"
              : "Run analysis to enable Refactor"
          }
          iconBg="rgba(250, 204, 21, 0.15)"
          action={
            <Button
              variant="primary"
              onClick={onRefactor}
              disabled={!hasReport || refactorLoading}
              title={!hasReport ? "Analyze code first" : undefined}
            >
              {refactorLoading ? "Refactoring…" : "Refactor"}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="scroll">
      <div className="refactored">
        <div className="refactored-head">
          <div className="refactored-head-title">
            <div className="refactored-head-icon">✨</div>
            <span style={{ fontWeight: 600 }}>Improved Code</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="primary" onClick={onApply}>
              ✨ Apply to editor
            </Button>
            <Button variant="secondary" onClick={onCopy}>
              📋 Copy
            </Button>
          </div>
        </div>
        <pre
          className="refactored-code"
          dangerouslySetInnerHTML={{ __html: escapeHtml(refactoredCode) }}
        />
      </div>
    </div>
  );
}
