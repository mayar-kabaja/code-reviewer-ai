export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Category = "bug" | "bugs" | "security" | "performance" | "style";

export interface Issue {
  severity: Severity;
  category: Category;
  type?: string;
  issue_type?: string;
  vulnerability_type?: string;
  line?: number;
  description: string;
  impact?: string;
  suggestion: string;
  code_snippet?: string;
}

export interface ReportContext {
  language?: string;
  framework?: string;
  purpose?: string;
}

export interface ReportSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  by_category: {
    bugs: number;
    security: number;
    performance: number;
    style: number;
  };
}

export interface ReviewReport {
  health_score: number;
  summary: ReportSummary;
  context: ReportContext;
  issues: Issue[];
  refactored_code?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
}
