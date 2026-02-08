# CodeReview AI

**CodeReview AI** – Paste your code and get AI-powered feedback. Next.js frontend + Python (FastAPI) backend.

## File structure

The repo has two main code folders: **frontend** and **backend-python**. The root holds workspace config and scripts.

```
code-reviewer-ai/
├── frontend/               # Next.js app (UI and API route stubs)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
├── backend-python/         # FastAPI API server (POST /api/review, /api/chat)
│   ├── app.py
│   ├── requirements.txt
│   ├── .venv/              # (create with python -m venv .venv)
│   └── .env                # API keys (see .env.example)
├── package.json            # Root scripts (dev, dev:backend, build, etc.)
├── pnpm-workspace.yaml
├── .env.example
└── .gitignore
```

- **Frontend** (Next.js): `frontend/` — UI and stubs. Set `NEXT_PUBLIC_API_URL` to use the backend.
- **Backend** (Python): `backend-python/` — FastAPI app. Add your LLM logic (e.g. OpenAI/Groq) in `app.py`.

## Run

**1. Frontend**

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Without a backend URL, it uses Next.js API route stubs.

**2. Backend (Python)**

From repo root:

```bash
pnpm dev:backend
```

Or from `backend-python`:

```bash
cd backend-python
.venv/bin/pip install -r requirements.txt   # first time
.venv/bin/uvicorn app:app --reload --port 8000
```

**3. Connect frontend to backend**

In **frontend/.env.local**:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Restart the frontend (`pnpm dev`). The app will call `http://localhost:8000/api/review` and `/api/chat`.

## Backend API

- `POST /api/review` – body: `{ "code": string, "language"?: string }` → `{ "success", "report" }`
- `POST /api/chat` – body: `{ "session_id", "message", "code"?: string }` → `{ "success", "response" }`

Implement these in `backend-python/app.py` (e.g. with OpenAI or Groq SDK).
