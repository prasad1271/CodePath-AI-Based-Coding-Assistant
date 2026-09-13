# Production Deployment Guide (Render, Vercel, Supabase)

## 1. Cloud Architecture Overview

CodePath uses modern production hosting targets:
- **Frontend**: **Vercel** (Global Edge CDN, dynamic serverless functions, automatic preview environments).
- **Backend**: **Render** (Dockerized web service running FastAPI with auto-deploy on git push).
- **Database, Auth & Storage**: **Supabase** (Managed PostgreSQL, Auth, and S3-compatible Storage).

---

## 2. Step-by-Step Deployment

### 2.1 Database Setup (Supabase)
1. Create a new project at [supabase.com](https://supabase.com).
2. Note your **Project URL**, **Anon Key**, **Service Role Key**, and **Database Connection String**.
3. In the Supabase SQL Editor, execute:
   - `supabase/migrations/20260101000000_initial_schema.sql` (Creates all 37 tables, indexes, and RLS policies).
   - `supabase/seed/seed_data.sql` (Inserts initial courses, problems, DSA topics, and placement tests).
4. Under **Storage**, create a public bucket named `resumes` and a bucket named `project-artifacts`.

### 2.2 Backend Deployment (Render)
1. Log in to [render.com](https://render.com) and click **New > Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `codepath-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Docker` (or `Python 3` with Build: `pip install -r requirements.txt` and Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
   - **Plan**: Standard or Free
4. Open: **Render → CODEPATH Backend → Environment**
5. Add the following Environment Variables (Do not commit real keys to Git):
   ```env
   ENVIRONMENT=production
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
   SUPABASE_URL=https://[PROJECT_ID].supabase.co
   SUPABASE_SECRET_KEY=[YOUR_SUPABASE_SECRET_KEY]
   SUPABASE_JWT_SECRET=[YOUR_JWT_SECRET]
   CORS_ORIGINS=https://codepath.vercel.app,http://localhost:3000
   AI_API_KEY=[YOUR_GEMINI_OR_OPENAI_KEY]
   ```
6. Deploy the service. Verify deployment health at `https://<your-render-app>.onrender.com/health`.

### 2.3 Frontend Deployment (Vercel)
1. Log in to [vercel.com](https://vercel.com) and click **Add New > Project**.
2. Select your Git repository.
3. In the project configuration:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
4. Open: **Vercel → CODEPATH → Settings → Environment Variables**
5. Add the following Environment Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_[YOUR_KEY]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_[YOUR_KEY]
   ```
6. Click **Deploy**. Vercel will build the Next.js app and deliver a live production URL.

---

## 3. Automated CI/CD (GitHub Actions)

The repository comes pre-configured with two GitHub Action workflows in `.github/workflows/`:

1. **`ci.yml`**:
   - Runs on every pull request and push to `main`.
   - Lints and tests the FastAPI backend using `pytest`.
   - Runs `npm run build` on the Next.js frontend to verify type safety and static page generation.

2. **`cd.yml`**:
   - Triggers when a push to `main` passes CI.
   - Automatically pings Render's Deploy Hook (`RENDER_DEPLOY_HOOK_URL`).
   - Automatically triggers Vercel's Deploy Hook (`VERCEL_DEPLOY_HOOK_URL`).

---

## 4. Monitoring & Telemetry

- **FastAPI Health & Readiness**:
  - `GET /health` - Basic liveness probe.
  - `GET /ready` - Database connection and sandbox readiness.
- **Request Tracing**: All API responses attach an `X-Request-ID` header matching backend structured logs.
