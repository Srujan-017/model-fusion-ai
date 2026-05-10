# ModelFusion AI

ModelFusion AI is a MERN-style multi-model chat app. The React/Vite frontend talks to an Express backend, and the backend routes requests to GitHub Models through the OpenAI-compatible SDK.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- AI: GitHub Models API

## Local Setup

Use Node `22.12.0` or any version that satisfies `>=20.19.0`. On Windows PowerShell, use `npm.cmd` if `npm` is blocked by execution policy.

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Edit `backend/.env`:

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/modelfusion
GITHUB_TOKEN=your_github_token_here
CLIENT_ORIGIN=http://localhost:5173
```

Health check:

```bash
curl http://localhost:8080/api/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

During local development, Vite proxies `/api` to `http://localhost:8080`, so no frontend environment variable is required locally.

## Required Environment Variables

### Backend

- `GITHUB_TOKEN`: GitHub token with `models: read` permission.
- `MONGO_URI`: MongoDB connection string. The API can boot without it, but chat persistence is skipped.
- `CLIENT_ORIGIN`: frontend URL allowed by CORS. Example: `https://your-app.vercel.app`.
- `PORT`: optional. Render sets this automatically.

### Frontend

- `VITE_API_URL`: deployed backend chat endpoint. Example: `https://your-api.onrender.com/api/chat`.

## Deploy Correctly

### 1. Push to GitHub

Deploy platforms need a Git repo. If this folder is not already a repo:

```bash
git init
git add .
git commit -m "Prepare ModelFusion AI for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Deploy Backend on Render

Create a Render Web Service from your repo.

- Root Directory: `backend`
- Language: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Node version: `22.12.0`

Set environment variables:

```env
GITHUB_TOKEN=your_github_models_token
MONGO_URI=your_mongodb_atlas_connection_string
CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
```

After deploy, test:

```bash
curl https://your-api.onrender.com/api/health
```

### 3. Deploy Frontend on Vercel

Create a Vercel project from the same repo.

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Set environment variable:

```env
VITE_API_URL=https://your-api.onrender.com/api/chat
```

Redeploy after adding or changing `VITE_API_URL`; Vite reads it at build time.

### 4. Final CORS Update

After Vercel gives you the final frontend URL, update the backend `CLIENT_ORIGIN` on Render to that exact URL and redeploy the backend.

## Verification Commands

```bash
cd backend
npm run check
```

```bash
cd frontend
npm run build
```

## Common Mistakes to Avoid

- Do not set `VITE_API_URL` to `localhost` in production.
- Do not expose `GITHUB_TOKEN` in the frontend.
- Do not forget to redeploy Vercel after changing `VITE_API_URL`.
- Do not deploy with Node below `20.19.0`; Vite 8 requires a newer Node runtime.
- Do not leave `CLIENT_ORIGIN` as `http://localhost:5173` after production deployment.
