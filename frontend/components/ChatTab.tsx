"use client";

import { useRef, useEffect } from "react";
import { Button } from "./ui/Button";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { escapeHtml } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

interface ChatTabProps {
  messages: ChatMessage[];
  loading: boolean;
  hasReport: boolean;
  onSend: (message: string) => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "agent",
  content:
    "Hi! I'm your code review assistant. Run an analysis first, then ask me questions about the issues found.",
};

export function ChatTab({ messages, loading, hasReport, onSend }: ChatTabProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayMessages = [INITIAL_MESSAGE, ...messages];
  const chatDisabled = !hasReport || loading;

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, loading]);

  const handleSubmit = () => {
    const value = inputRef.current?.value?.trim();
    if (!value || chatDisabled) return;
    onSend(value);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-wrap">
      <div className="chat-msgs" ref={scrollRef}>
        {displayMessages.map((msg) => (
          <div key={msg.id} className="chat-msg">
            <div className={`chat-avatar ${msg.role}`}>
              {msg.role === "user" ? "👤" : "🤖"}
            </div>
            <div className="chat-content">
              <div className="chat-name">
                {msg.role === "user" ? "You" : "CodeReview AI"}
              </div>
              <div
                className="chat-bubble"
                dangerouslySetInnerHTML={{ __html: escapeHtml(msg.content) }}
              />
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg">
            <div className="chat-avatar agent">🤖</div>
            <div className="chat-content">
              <div className="chat-name">CodeReview AI</div>
              <div className="chat-bubble">
                <span style={{ display: "inline-block", verticalAlign: "middle", marginRight: 8 }}>
                  <LoadingSpinner size="sm" />
                </span>
                Thinking…
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="chat-input-wrap">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder={
            hasReport ? "Ask about your code..." : "Run analysis first to ask questions"
          }
          rows={1}
          onKeyDown={handleKeyDown}
          disabled={chatDisabled}
          title={!hasReport ? "Run analysis first" : undefined}
        />
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={chatDisabled}
          title={!hasReport ? "Run analysis first" : undefined}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
