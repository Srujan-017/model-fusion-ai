# ClarifyAI

ClarifyAI is a ChatGPT-style web app (frontend + backend). The frontend is React + Vite + Tailwind. The backend is Node/Express and proxies requests to an OpenAI-compatible chat completions endpoint (GPT-4o).

## Quick start

### Backend
1. `cd backend`
2. `cp .env.example .env` and fill in `OPENAI_API_KEY` (and `OPENAI_API_BASE_URL` if needed).
3. `npm install`
4. `npm run dev` (or `npm start`)

Backend will run on http://localhost:8080 by default.

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

Frontend will run on http://localhost:5173 by default and will call backend at `http://localhost:8080/api/chat`.

