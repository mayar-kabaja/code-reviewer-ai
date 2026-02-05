"use client";

import { useState } from "react";
import { EmptyState } from "./ui/EmptyState";
import { escapeHtml } from "@/lib/utils";
import { CATEGORY_ICONS } from "@/lib/constants";
import type { Issue } from "@/lib/types";

interface IssuesTabProps {
  issues: Issue[] | null | undefined;
}

function IssueItem({ issue, index }: { issue: Issue; index: number }) {
  const [open, setOpen] = useState(false);
  const icon = CATEGORY_ICONS[issue.category] ?? "📌";

  return (
    <div className="issue">
      <div className="issue-head" onClick={() => setOpen((o) => !o)}>
        <div className={`sev-bar ${issue.severity}`} />
        <div className="issue-info">
          <div className="issue-tags">
            <span className={`sev-tag ${issue.severity}`}>{issue.severity}</span>
            <span className="cat-tag">
              {icon} {issue.category}
            </span>
          </div>
          <div className="issue-type">
            {issue.type ?? issue.issue_type ?? issue.vulnerability_type ?? "Issue"}
          </div>
          <div className="issue-line">Line {issue.line ?? "N/A"}</div>
        </div>
        <button type="button" className="issue-toggle">
          {open ? "▲" : "▼"}
        </button>
      </div>
      {open && (
        <div className="issue-body open">
          <div className="issue-desc">{issue.description}</div>
          {issue.impact && (
            <div className="issue-desc">
              <strong>Impact:</strong> {issue.impact}
            </div>
          )}
          <div className="suggestion">
            <div className="suggestion-label">💡 Suggestion</div>
            <div className="suggestion-text">{issue.suggestion}</div>
          </div>
          {issue.code_snippet && (
            <div
              className="code-block"
              dangerouslySetInnerHTML={{ __html: escapeHtml(issue.code_snippet) }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function IssuesTab({ issues }: IssuesTabProps) {
  if (!issues?.length) {
    return (
      <div className="scroll">
        <EmptyState
          icon="✅"
          title="No issues found!"
          description="Your code looks clean"
          iconBg="rgba(34,197,94,0.15)"
        />
      </div>
    );
  }

  return (
    <div className="scroll">
      {issues.map((issue, i) => (
        <IssueItem key={i} issue={issue} index={i} />
      ))}
    </div>
  );
}
