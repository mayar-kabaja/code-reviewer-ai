import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Code review – replace with your LLM (e.g. Groq/OpenAI)
app.post("/api/review", (req, res) => {
  const { code, language } = req.body ?? {};
  if (!code) {
    return res.status(400).json({ success: false, error: "Missing code" });
  }
  // TODO: call your review model, return { success: true, report: {...} }
  res.json({
    success: true,
    report: {
      health_score: 0,
      summary: { critical: 0, high: 0, medium: 0, low: 0, by_category: { bugs: 0, security: 0, performance: 0, style: 0 } },
      context: { language: language ?? "Unknown", purpose: "N/A" },
      issues: [],
      refactored_code: code,
    },
  });
});

// Chat – replace with your LLM
app.post("/api/chat", (req, res) => {
  const { session_id, message, code } = req.body ?? {};
  if (!message) {
    return res.status(400).json({ success: false, error: "Missing message" });
  }
  // TODO: call your chat model with session + message + code
  res.json({
    success: true,
    response: `Echo: ${message}. Connect your LLM in backend/src/index.ts`,
  });
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
