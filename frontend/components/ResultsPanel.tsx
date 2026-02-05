"use client";

import { useState } from "react";
import { OverviewTab } from "./OverviewTab";
import { IssuesTab } from "./IssuesTab";
import { RefactoredTab } from "./RefactoredTab";
import { ChatTab } from "./ChatTab";
import { EmptyState } from "./ui/EmptyState";
import { LoadingState } from "./ui/LoadingSpinner";
import { TABS } from "@/lib/constants";
import type { ReviewReport, ChatMessage } from "@/lib/types";

interface ResultsPanelProps {
  report: ReviewReport | null;
  loading: boolean;
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  onSendChat: (message: string) => void;
  onCopyRefactored: () => void;
}

export function ResultsPanel({
  report,
  loading,
  chatMessages,
  chatLoading,
  onSendChat,
  onCopyRefactored,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const issueCount = report?.issues?.length ?? 0;

  return (
    <div className="panel">
      <div className="tabs-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
            {t.id === "issues" && issueCount > 0 && (
              <span className="tab-badge">{issueCount}</span>
            )}
          </button>
        ))}
      </div>

      <div
        id="overview"
        className={`tab-content ${activeTab === "overview" ? "active" : ""}`}
      >
        {loading ? (
          <LoadingState />
        ) : report ? (
          <OverviewTab report={report} />
        ) : (
          <div className="scroll">
            <EmptyState
              icon="🔍"
              title="Ready to analyze"
              description='Paste your code and click "Analyze Code" to get comprehensive feedback'
            />
          </div>
        )}
      </div>

      <div
        id="issues"
        className={`tab-content ${activeTab === "issues" ? "active" : ""}`}
      >
        {loading ? (
          <LoadingState />
        ) : (
          <IssuesTab issues={report?.issues} />
        )}
      </div>

      <div
        id="refactored"
        className={`tab-content ${activeTab === "refactored" ? "active" : ""}`}
      >
        {loading ? (
          <LoadingState />
        ) : (
          <RefactoredTab
            refactoredCode={report?.refactored_code}
            onCopy={onCopyRefactored}
          />
        )}
      </div>

      <div
        id="chat"
        className={`tab-content ${activeTab === "chat" ? "active" : ""}`}
      >
        <ChatTab
          messages={chatMessages}
          loading={chatLoading}
          onSend={onSendChat}
        />
      </div>
    </div>
  );
}
