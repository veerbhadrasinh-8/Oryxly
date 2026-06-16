# MailFlow — Production Deployment Guide

End-to-end deploy: **Railway** for backend + Postgres + Redis + worker, **Vercel** for frontend.

## Prerequisites

- Railway account (or Fly.io / Render — same shape, different UI)
- Vercel account
- Cloudflare R2 account (for attachments — optional if you skip Phase 10 features)
- A real SMTP provider for sending (Gmail App Password / SendGrid / Mailgun / your own)
- A custom domain (optional but recommended)

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Vercel    │────▶│   Railway    │────▶│ Postgres   │
│  (Next.js)  │     │  api (Web)   │     │ (Railway)  │
└─────────────┘     │              │     └────────────┘
                    │              │
                    │  worker      │────▶┌────────────┐
                    │  (Celery)    │     │   Redis    │
                    └──────┬───────┘     │ (Railway)  │
                           │             └────────────┘
                           ▼
                    ┌────────────┐
                    │ Cloudflare │
                    │     R2     │
                    └────────────┘
```

## 1. Provision storage

### Postgres
- Railway → New Project → Add Postgres
- Note the `DATABASE_URL` (Railway will inject it as a service-link reference)

### Redis
- Same project → Add Redis
- Note the `REDIS_URL`

### Cloudflare R2 (for attachments)
- Cloudflare dashboard → R2 → Create bucket `mailflow-attachments`
- Manage R2 API Tokens → Create API token with read/write on that bucket
- Save the `Account ID` → `R2_ENDPOINT = https://<account>.r2.cloudflarestorage.com`
- Save the `Access Key ID` and `Secret Access Key`

## 2. Generate production secrets

```bash
# Run locally — copy outputs into Railway env vars
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
python3 -c "from cryptography.fernet import Fernet; print('FERNET_KEY=' + Fernet.generate_key().decode())"
```

**Do NOT reuse your dev values.** A new `FERNET_KEY` means all previously-encrypted SMTP passwords become unreadable — but those were dev creds anyway.

## 3. Deploy the API + worker (Railway)

### API service
```
Source: GitHub repo, branch main
Root directory: backend
Dockerfile: backend/Dockerfile.prod
Start command: (default — uvicorn on $PORT)
```

Env vars to set (use the template in `backend/.env.production.example`):
| Var | Value |
|---|---|
| `ENV` | `production` |
| `DEBUG` | `false` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway reference) |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| `SECRET_KEY` | (your generated value) |
| `FERNET_KEY` | (your generated value) |
| `ACCESS_TOKEN_TTL_MIN` | `30` |
| `REFRESH_TOKEN_TTL_DAYS` | `14` |
| `CORS_ORIGINS` | `["https://YOUR-FRONTEND.vercel.app"]` |
| `STORAGE_BACKEND` | `r2` |
| `R2_ENDPOINT` / `R2_ACCESS_KEY` / `R2_SECRET_KEY` / `R2_BUCKET` | from Cloudflare |

> Note: SQLAlchemy needs `postgresql+psycopg://`. If Railway gives you `postgres://`, prepend the SQLAlchemy dialect. Railway's reference values usually need a manual transform.

### Health check
- Railway → Service → Settings → Healthcheck path: `/health`
- This makes Railway wait for `{"status":"ok","db":true,"redis":true}` before considering a deploy healthy.

### Worker service
- Same repo, same Dockerfile
- **Override start command**:
  ```
  uv run celery -A app.workers.celery_app:celery_app worker --loglevel=info --concurrency=2
  ```
- Same env vars as the API
- No public port

### Run migrations
First deploy will start before migrations run. SSH into the API container (Railway → "Connect"):
```bash
uv run alembic upgrade head
```

Or add this as a Railway "predeploy" command on the API service.

## 4. Deploy the frontend (Vercel)

```
Source: GitHub repo
Root directory: frontend
Framework preset: Next.js (auto-detected)
Build command: (default)
```

Env vars:
| Var | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-RAILWAY-API.up.railway.app` |

After first deploy, **go back to Railway** and update `CORS_ORIGINS` to include the Vercel URL.

## 5. Smoke test

```bash
# Health
curl https://your-api.up.railway.app/health
# Expected: {"status":"ok","db":true,"redis":true,"env":"production"}

# Security headers
curl -sI https://your-api.up.railway.app/health | grep -iE "x-frame|x-content|referrer|permissions"
# Expected: all 4 headers present

# Register
curl -X POST https://your-api.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Admin","email":"you@yourcompany.com","password":"YourStrongPass123"}'
# Expected: {"success":true,"message":"Account created"}

# Visit https://your-frontend.vercel.app and log in
```

## Production launch checklist

| Check | How to verify |
|---|---|
| Postgres online | Railway dashboard shows healthy |
| Redis online | Railway dashboard shows healthy |
| API service up | `curl /health` returns 200 |
| Worker service up | Railway logs show `celery@xxx ready.` |
| Migrations applied | `uv run alembic current` matches the latest revision in `alembic/versions/` |
| HTTPS enforced | Railway + Vercel both terminate TLS automatically |
| Real `SECRET_KEY` and `FERNET_KEY` | Not the dev defaults |
| `CORS_ORIGINS` does NOT include `*` | Set to the Vercel URL only |
| Rate limiting active | `RATE_LIMIT_DISABLED` unset or `0` |
| Security headers present | `curl -sI /health \| grep x-frame` → `DENY` |
| Audit log table created | `\d audit_logs` in psql shows the table |
| R2 bucket connected | `STORAGE_BACKEND=r2` env var set, attachment upload works |
| Health endpoint configured in Railway | "Healthcheck path: /health" in service settings |
| Frontend `NEXT_PUBLIC_API_URL` points to prod API | Browser network tab shows requests to `your-api.up.railway.app` |

## Operational

### Tail logs
```
Railway → service → Logs
# or via CLI:
railway logs --service api
railway logs --service worker
```

### Run an interactive psql
```
railway run --service postgres psql $DATABASE_URL
```

### Add another worker
Just clone the worker service in Railway and let them load-balance through Redis. No code change.

### Scale the API
Railway → API service → Settings → Replicas → 2 (uvicorn `--workers 2` already runs 2 worker processes per container).

### Backups
- Postgres: Railway has automatic daily backups on paid plans
- R2: versioning + lifecycle rules in the Cloudflare dashboard

## Common issues

**`/health` returns `db: false`**
- Wrong `DATABASE_URL` format (missing `+psycopg`)
- Postgres not finished provisioning (wait 30s)

**`/health` returns `redis: false`**
- Wrong `REDIS_URL` (Railway sometimes gives `redis://` with creds in URL, sometimes separate)

**Worker logs show `kombu.exceptions.OperationalError: Connection refused`**
- Worker started before Redis was reachable. Should self-recover. If not, restart the worker service.

**Campaign launches but never delivers**
- Check worker logs — is `start_campaign` task being received?
- Is SMTP password decryption working? (Wrong `FERNET_KEY` between API and worker)

**Frontend "Network Error" calling the API**
- CORS — `CORS_ORIGINS` env on the API doesn't include the Vercel URL
- `NEXT_PUBLIC_API_URL` not set on Vercel — defaults to localhost

**SMTP test send fails with auth error from Gmail**
- Use a Gmail App Password (not your regular password) at https://myaccount.google.com/apppasswords
- 2-step verification must be on for App Passwords to be available

## Rollback

Railway and Vercel both keep the previous deploy ready. One click → previous version.

For DB schema changes that need rolling back, `alembic downgrade -1` works against `DATABASE_URL` from any container with the codebase.
