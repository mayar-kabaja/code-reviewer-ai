"use client";

import { EmptyState } from "./ui/EmptyState";
import { Button } from "./ui/Button";
import { escapeHtml } from "@/lib/utils";

interface RefactoredTabProps {
  refactoredCode: string | null | undefined;
  onCopy: () => void;
}

export function RefactoredTab({ refactoredCode, onCopy }: RefactoredTabProps) {
  if (!refactoredCode) {
    return (
      <div className="scroll">
        <EmptyState
          icon="✨"
          title="Improved code"
          description="Run an analysis to get an improved version"
        />
      </div>
    );
  }

  return (
    <div className="scroll">
      <div className="refactored">
        <div className="refactored-head">
          <div style={{ fontWeight: 600 }}>✨ Improved Code</div>
          <Button variant="secondary" onClick={onCopy}>
            📋 Copy
          </Button>
        </div>
        <pre
          className="refactored-code"
          dangerouslySetInnerHTML={{ __html: escapeHtml(refactoredCode) }}
        />
      </div>
    </div>
  );
}
