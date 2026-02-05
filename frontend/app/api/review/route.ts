import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid code" },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual review backend (e.g. Groq, OpenAI).
    // This stub returns a mock report so the UI works without a backend.
    const report = getMockReport(code, language);
    return NextResponse.json({ success: true, report });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

function getMockReport(code: string, _language?: string): Record<string, unknown> {
  const lines = code.split("\n").length;
  return {
    health_score: 62,
    summary: {
      critical: 2,
      high: 1,
      medium: 2,
      low: 1,
      by_category: { bugs: 1, security: 2, performance: 2, style: 1 },
    },
    context: {
      language: "Python",
      purpose: "Sample code with intentional issues",
    },
    issues: [
      {
        severity: "critical",
        category: "security",
        type: "SQL Injection",
        line: 2,
        description: "Concatenating user input into SQL allows injection.",
        impact: "Attackers can read or modify database data.",
        suggestion: "Use parameterized queries: cursor.execute(\"SELECT * FROM users WHERE id = %s\", (id,))",
        code_snippet: 'query = "SELECT * FROM users WHERE id = " + id',
      },
      {
        severity: "critical",
        category: "security",
        type: "Hardcoded secrets",
        line: 12,
        description: "Secrets should not be stored in source code.",
        suggestion: "Use environment variables or a secrets manager.",
        code_snippet: 'password = "admin123"',
      },
      {
        severity: "high",
        category: "performance",
        type: "Inefficient nested loop",
        line: 6,
        description: "O(n²) loop can be replaced with a set or single pass.",
        suggestion: "Use result = list(dict.fromkeys(items)) or a set for deduplication.",
      },
      {
        severity: "medium",
        category: "bugs",
        type: "Unsafe division",
        line: 15,
        description: "No check for zero divisor.",
        suggestion: "Check y != 0 or use try/except ZeroDivisionError.",
      },
    ],
    refactored_code: `def get_user(id):
    return db.execute("SELECT * FROM users WHERE id = %s", (id,))

def process(items):
    return list(dict.fromkeys(items))

# Use env: os.environ.get("PASSWORD"), os.environ.get("API_KEY")

def divide(x, y):
    if y == 0:
        raise ValueError("Division by zero")
    return x / y
`,
  };
}
