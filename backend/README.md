# Code Reviewer API

Backend for CodeReview AI. Add your review and chat logic here (e.g. Groq, OpenAI).

## Setup

```bash
pnpm install
```

## Run

```bash
pnpm dev
```

Runs at **http://localhost:4000** by default. Set `PORT` to change.

## Endpoints

- `POST /api/review` – body: `{ code, language? }` → `{ success, report }`
- `POST /api/chat` – body: `{ session_id, message, code? }` → `{ success, response }`

Point the Next.js app at this URL via `NEXT_PUBLIC_API_URL=http://localhost:4000` (or proxy via Next.js API routes).
