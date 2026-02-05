# CodeReview AI

**CodeReview AI** – Paste your code and get AI-powered feedback. Clear name, clear idea: review your code for bugs, security, and style. Next.js frontend + optional Node/Express backend.

## File structure

The repo has two main code folders: **frontend** and **backend**. All app code lives in one of them; the root only has workspace config and scripts.

```
code-reviewer-ai/
├── frontend/               # Next.js app (all UI and Next API routes)
│   ├── app/                # App Router
│   │   ├── api/            # API routes (stubs; use when backend not running)
│   │   │   ├── chat/route.ts
│   │   │   └── review/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/         # React UI
│   │   ├── ui/             # Button, EmptyState, LoadingSpinner
│   │   ├── CodeEditor.tsx
│   │   ├── EditorPanel.tsx
│   │   ├── Header.tsx
│   │   ├── ResultsPanel.tsx
│   │   ├── OverviewTab.tsx
│   │   ├── IssuesTab.tsx
│   │   ├── RefactoredTab.tsx
│   │   └── ChatTab.tsx
│   ├── lib/                # Shared (frontend)
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── public/             # Static assets (e.g. favicon.svg)
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
├── backend/                # Standalone Express API server
│   ├── src/
│   │   └── index.ts        # Express: POST /api/review, POST /api/chat
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── package.json            # Root workspace scripts (dev, dev:backend, build, etc.)
├── pnpm-workspace.yaml
├── .env.example
└── .gitignore
```

- **Frontend** (Next.js): `frontend/` — `app/`, `components/`, `lib/`, `public/`. Serves the UI and can proxy to the backend.
- **Backend** (Express): `backend/` — add your review/chat logic (e.g. Groq/OpenAI) here. Same API shape as `frontend/app/api/`.

## Run

**Frontend only** (uses Next.js API route stubs):

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**With backend** (recommended when you add real LLM calls):

1. Install backend deps and run the API:

```bash
cd backend && pnpm install && pnpm dev
```

Or from repo root:

```bash
pnpm dev:backend
```

2. Point the app at the backend. Create `.env.local` in the **frontend** folder (or repo root):

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

3. In another terminal, run the frontend (from repo root):

```bash
pnpm dev
```

The app will call `http://localhost:4000/api/review` and `/api/chat` instead of the Next.js routes.

## Backend API

- `POST /api/review` – body: `{ code, language? }` → `{ success, report }`
- `POST /api/chat` – body: `{ session_id, message, code? }` → `{ success, response }`

Implement these in `backend/src/index.ts` (e.g. with Groq or OpenAI SDK).
