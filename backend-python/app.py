import ast
import json
import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from groq import Groq
from pydantic import BaseModel

load_dotenv()

# Allow any localhost origin (any port) for local dev.
def _is_local_origin(origin: str) -> bool:
    if not origin:
        return False
    return (
        origin.startswith("http://localhost:") or origin.startswith("http://127.0.0.1:")
    )


def _cors_headers_for_origin(origin: str) -> dict:
    if not _is_local_origin(origin):
        origin = "http://localhost:3000"
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
    }


app = FastAPI()

# CORS for POST/GET responses (allow any localhost port)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Run first (added last): handle OPTIONS before any other middleware or routing.
class OptionsPreflightMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http" and scope.get("method") == "OPTIONS":
            origin = "http://localhost:3000"
            for name, value in scope.get("headers", []):
                if name == b"origin":
                    origin = value.decode("latin-1")
                    break
            headers = _cors_headers_for_origin(origin)
            headers_list = [(k.encode(), v.encode()) for k, v in headers.items()]
            await send({"type": "http.response.start", "status": 200, "headers": headers_list})
            await send({"type": "http.response.body", "body": b""})
            return
        await self.app(scope, receive, send)


app.add_middleware(OptionsPreflightMiddleware)

# --- Constants ---
GROQ_API_KEY_ENV = "GROQ_API_KEY"
MODEL = "llama-3.1-8b-instant"
MAX_TOKENS_REVIEW = 2048
MAX_TOKENS_CHAT = 1024
CODE_LIMIT_REVIEW = 8000
CODE_LIMIT_CHAT = 4000
MAX_CHAT_HISTORY = 10  # last N messages sent to the model (user + assistant)

# In-memory chat history per session_id. Key: session_id, Value: list of {"role": "user"|"assistant", "content": str}
_chat_history: dict[str, list[dict]] = {}


# --- Request models ---
class ReviewRequest(BaseModel):
    code: str
    language: Optional[str] = None


class ChatRequest(BaseModel):
    session_id: str
    message: str
    code: Optional[str] = None


class RefactorRequest(BaseModel):
    code: str
    language: Optional[str] = None


# --- Helpers ---
def _detect_language(code: str) -> str:
    """Guess language from code when user does not select one. Returns a short label for the prompt."""
    s = (code or "")[:4000].strip()
    if not s:
        return "unknown"
    s_lower = s.lower()
    # Order matters: more specific first
    if "<?php" in s or "$_" in s and ("echo " in s_lower or "function " in s_lower):
        return "php"
    if "#include" in s or "int main(" in s or "void main(" in s or "printf(" in s or "cout " in s or "std::" in s:
        return "c/c++"
    if "package main" in s_lower or "func " in s_lower and "import (" in s_lower:
        return "go"
    if "fn " in s_lower or "fn main" in s_lower or "let mut " in s_lower or "impl " in s_lower:
        return "rust"
    if "public class " in s_lower or "private " in s_lower and "void " in s_lower or "System.out" in s or "import java." in s_lower:
        return "java"
    if "def " in s_lower or "import " in s_lower or "from " in s_lower or "print(" in s_lower or "if __name__" in s_lower or "lambda " in s_lower or "try:" in s or "except:" in s:
        return "python"
    if "function " in s_lower or "=>" in s or "const " in s_lower or "let " in s_lower or "var " in s_lower or "console.log" in s_lower or "import " in s_lower or "export " in s_lower or "async " in s_lower:
        return "javascript"
    if "def " in s_lower and ("end" in s_lower or "puts " in s_lower):
        return "ruby"
    return "unknown"


def _get_api_key() -> Optional[str]:
    return os.environ.get(GROQ_API_KEY_ENV) or None


def _call_groq(api_key: str, messages: list[dict], max_tokens: int) -> tuple[Optional[str], Optional[str]]:
    """Call Groq API. Returns (content, None) on success or (None, error_message) on failure."""
    try:
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=max_tokens,
            temperature=0,  # same input → same output (reproducible reviews)
        )
        content = (completion.choices[0].message.content or "").strip()
        return (content, None)
    except Exception as e:
        return (None, str(e))


def _default_report(language: str, raw_fallback: str = "") -> dict:
    """Report shape the frontend expects when we have no AI result."""
    return {
        "health_score": 0,
        "summary": {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
            "by_category": {"bugs": 0, "security": 0, "performance": 0, "style": 0},
        },
        "context": {"language": language or "unknown", "purpose": "N/A"},
        "issues": [
            {
                "severity": "info",
                "category": "style",
                "description": raw_fallback or "No review generated.",
                "suggestion": "Try again or check your API key.",
            }
        ],
        "refactored_code": None,
    }


def _check_python_syntax(code: str) -> Optional[dict]:
    """If code has a Python syntax error, return an issue dict with traceback-style output; else return None."""
    try:
        ast.parse(code)
        return None
    except SyntaxError as e:
        msg = e.msg or "invalid syntax"
        line = e.lineno or 0
        line_content = (e.text or "").rstrip("\n").strip()
        if line and line_content:
            description = f"  Line {line}\n    {line_content}\nSyntaxError: {msg}"
        elif line:
            description = f"  Line {line}\nSyntaxError: {msg}"
        else:
            description = f"SyntaxError: {msg}"
        return {
            "severity": "critical",
            "category": "bug",
            "description": description,
            "suggestion": "Fix the syntax so the code can be parsed (e.g. check missing quotes, colons, or keywords like 'for', 'in').",
        }


def _parse_review_response(raw: str, lang: str) -> dict:
    """Strip optional markdown fence, parse JSON, fill missing keys. Raises on parse error."""
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    report = json.loads(raw)
    report.setdefault("health_score", 70)
    report.setdefault("summary", _default_report(lang)["summary"])
    report.setdefault("context", {"language": lang, "purpose": "N/A"})
    report.setdefault("issues", [])
    report.setdefault("refactored_code", None)
    return report


# --- Routes ---
@app.get("/")
def root():
    return {"message": "CodeReview AI API"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/review")
def review(body: ReviewRequest):
    if not (body.code or "").strip():
        return {"success": False, "error": "Missing code"}

    api_key = _get_api_key()
    if not api_key:
        return {"success": False, "error": f"{GROQ_API_KEY_ENV} not set in .env"}

    code = body.code.strip()[:CODE_LIMIT_REVIEW]
    lang = (body.language or "").strip() or _detect_language(code)

    system_prompt = """You are a code reviewer. Given code, respond with a short JSON object only (no markdown, no extra text) with this shape:
{
  "health_score": <0-100>,
  "summary": { "critical": 0, "high": 0, "medium": 0, "low": 0, "by_category": { "bugs": 0, "security": 0, "performance": 0, "style": 0 } },
  "context": { "language": "<lang>", "purpose": "<brief purpose or N/A>" },
  "issues": [ { "severity": "critical|high|medium|low|info", "category": "bug|security|performance|style", "description": "...", "suggestion": "..." } ],
  "refactored_code": "<improved code or null>"
}
Review for bugs, security, performance, and style. Keep issues list short (e.g. 1-5 items)."""

    user_prompt = f"Language: {lang}\n\nCode:\n```\n{code}\n```"

    content, err = _call_groq(
        api_key,
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        MAX_TOKENS_REVIEW,
    )
    if err:
        return {"success": False, "error": err}

    try:
        report = _parse_review_response(content, lang)
        if lang in ("python", "Python") or "python" in lang.lower():
            syntax_issue = _check_python_syntax(code)
            if syntax_issue:
                report.setdefault("issues", [])
                report["issues"].insert(0, syntax_issue)
                if (report.get("health_score") or 100) > 50:
                    report["health_score"] = 50
        return {"success": True, "report": report}
    except json.JSONDecodeError:
        return {"success": True, "report": _default_report(lang, raw_fallback=content[:500] if content else "")}


@app.post("/api/refactor")
def refactor(body: ReviewRequest):
    """Refactor code only. Returns improved code without full review."""
    if not (body.code or "").strip():
        return {"success": False, "error": "Missing code"}

    api_key = _get_api_key()
    if not api_key:
        return {"success": False, "error": f"{GROQ_API_KEY_ENV} not set in .env"}

    code = body.code.strip()[:CODE_LIMIT_REVIEW]
    lang = (body.language or "").strip() or _detect_language(code)

    system_prompt = """You are a code refactoring assistant. Given code, return a JSON object only (no markdown, no extra text) with this exact shape:
{"refactored_code": "<the improved/refactored code as a single string>"}
Improve the code: fix issues, clarify names, simplify logic, follow best practices. Keep the same behavior. Escape newlines in the string as \\n and quotes as \\" so the JSON is valid."""

    user_prompt = f"Language: {lang}\n\nCode:\n```\n{code}\n```"

    content, err = _call_groq(
        api_key,
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        MAX_TOKENS_REVIEW,
    )
    if err:
        return {"success": False, "error": err}

    try:
        if content.startswith("```"):
            content = content.split("```", 2)[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.strip()
        out = json.loads(content)
        refactored = out.get("refactored_code") or ""
        return {"success": True, "refactored_code": refactored}
    except json.JSONDecodeError:
        return {"success": False, "error": "Could not parse refactored code from model."}


@app.post("/api/chat")
def chat(body: ChatRequest):
    if not (body.message or "").strip():
        return {"success": False, "error": "Missing message"}

    api_key = _get_api_key()
    if not api_key:
        return {"success": False, "error": f"{GROQ_API_KEY_ENV} not set in .env"}

    message = body.message.strip()
    code = (body.code or "").strip()[:CODE_LIMIT_CHAT]

    system_prompt = "You are a helpful code review assistant. Answer the user's question concisely. If they shared code context, use it to give relevant advice. Remember the conversation so far."
    user_parts = [f"User: {message}"]
    if code:
        user_parts.append(f"Code context:\n```\n{code}\n```")
    user_prompt = "\n\n".join(user_parts)

    # Load and update history for this session
    history = _chat_history.get(body.session_id, [])
    history.append({"role": "user", "content": user_prompt})
    # Send system + last N messages so the model has conversation context
    messages_for_api = [
        {"role": "system", "content": system_prompt},
        *history[-MAX_CHAT_HISTORY:],
    ]

    content, err = _call_groq(api_key, messages_for_api, MAX_TOKENS_CHAT)
    if err:
        return {"success": False, "error": err}

    # Append assistant reply and trim history
    history.append({"role": "assistant", "content": content or ""})
    _chat_history[body.session_id] = history[-MAX_CHAT_HISTORY:]

    return {"success": True, "response": content or ""}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
