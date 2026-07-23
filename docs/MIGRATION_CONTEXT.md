# Migration Context — Backend Infra Move (GCP → Railway)

## Why this happened
Backend was on Google Cloud VM. Billing/identity verification got stuck (Google required
mandatory ID verification with unclear ETA), VM got stopped, site went down — login/signup
broken in production while client campaigns were live.

## What we did, in order

### 1. Forked repo to new GitHub account
- Original repo: `veerbhadrasinh-8/Oryxly` (private → made public to allow forking)
- Forked to: `oryxusofficial-create/Oryxly-bakend` (fresh GitHub account, needed because
  Railway free trial credit was tied to `veerbhadrasinh-8`'s GitHub and was exhausted)

### 2. Deployed to Railway (new account, fresh $5 trial credit)
Project name: `jubilant-presence`
Services created:
- **`dynamic-exploration`** — backend/API (FastAPI), custom domain `backend.oryxly.in`
- **`amused-illumination`** — Celery worker (later removed, see below)
- **Redis** — Railway-managed Redis addon

### 3. Fixed a chain of deployment bugs (in order encountered)
1. Root directory not set → build failed reading wrong Dockerfile context.
   Fix: Railway service Settings → Source → Root Directory = `backend`.
2. `$PORT` not substituted in start command → uvicorn crashed with "Invalid value for '--port'".
   Fix: wrapped start command in `sh -c "... --port $PORT"`.
3. Custom domain `backend.oryxly.in` target port mismatch (was 8000, app listens on
   Railway-injected `$PORT`=8080). Fixed by setting target port to 8080 in Networking settings.
4. DNS: `backend.oryxly.in` originally pointed to old GCP VM (A record `34.173.197.7`) on
   Cloudflare (domain registered at Hostinger, but nameservers point to Cloudflare — DNS
   actually managed there). Replaced A record with CNAME → Railway's generated domain,
   added Railway's TXT verification record, used Cloudflare's Railway one-click DNS connect.
5. `DATABASE_URL` and `REDIS_URL` env vars were still local Docker values
   (`postgres:5432` / `redis:6379`) copy-pasted from local `.env` — pointed nowhere in
   production. Fixed by setting `DATABASE_URL` to the Neon Postgres connection string and
   `REDIS_URL` to Railway's managed Redis URL.
6. **Redis SSL kwarg bug** (`backend/app/core/redis_client.py`): code unconditionally passed
   `ssl_cert_reqs=None` to `Redis.from_url()`, which only non-SSL `redis://` connections don't
   accept (TypeError). Fixed to only pass that kwarg when the URL scheme is `rediss://`.
   Committed as `529ffdd`.
7. **CORS**: `CORS_ORIGINS` defaulted to `localhost:3000` only. Login preflight (OPTIONS)
   failed with 400 from frontend at `https://oryxly.in`. Fixed by setting
   `CORS_ORIGINS=["https://oryxly.in","https://www.oryxly.in"]` on Railway.
8. **FERNET_KEY mismatch**: SMTP account passwords were encrypted in the DB using the
   `FERNET_KEY` that was active on the **old Render deployment**
   (`hYMrI1hKSjf02ZpiStNAQ99iI3onPu9UWBJJLi1D0HY=`), NOT the value in the local `.env`
   file (`mINOrQ0k8cxrqCYMTvAJt55uvdW0ANXWinLFl_IsL-8=`). Using the wrong key threw
   `cryptography.fernet.InvalidToken` / "invalid encrypted value" on every send attempt.
   Fixed by setting `FERNET_KEY` to the Render value everywhere (Railway services + local
   `.env`). SMTP accounts can't be deleted/recreated in this app by design, so getting the
   original key right was mandatory — there is no brute-force recovery from Fernet.
9. **Celery worker concurrency**: default `--concurrency` (48 prefork workers) exceeded
   Railway free-tier instance memory → worker crash-looped (OOM). Fixed by setting
   `--concurrency=2` in the worker's start command.

### 4. Outbound SMTP port blocking (the big one)
- Symptom: `[Errno 101] Network is unreachable`, then after an IPv4 patch, plain
  `connection failed: timed out` when the Celery worker tried to reach `smtp.gmail.com:587`.
- Root cause #1 (partially): container lacked IPv6 outbound routing; Python's
  `socket.getaddrinfo` returned AAAA records first. Patched `backend/app/services/smtp.py`
  with a `_force_ipv4()` context manager that scopes `socket.getaddrinfo` to `AF_INET` only
  during the SMTP connect. Committed as `ff04f02`.
- Root cause #2 (the actual blocker): **Railway blocks outbound SMTP ports (25/465/587) on
  Free, Trial, and Hobby plans — only Pro/Enterprise allow it.** Confirmed via Railway's own
  Central Station community posts and docs (this was NOT correctly identified up front;
  initial assumption was "Hobby plan fixes it," which is wrong and was corrected after
  actually searching Railway's docs).
- This is the same class of restriction that originally broke SMTP on **Render** before this
  migration even started — both free PaaS tiers block SMTP outbound by policy.

### 5. Current workaround (stopgap, in progress)
Since Oracle Cloud (the intended long-term free host with no port blocking) is stuck on
Google's identity verification, and Fly.io requires a payment method to even launch an app
(discovered when attempting it — also not verified up front), the temporary fix is:

- Run the **Celery worker locally** on the user's Mac, pointed at Railway's Redis and Neon's
  Postgres (same queue, same DB — only the SMTP-sending process moves to a network that
  isn't port-blocked).
- Local `backend/.env` updated to production `DATABASE_URL`, `REDIS_URL`, and the correct
  `FERNET_KEY`.
- Railway's `amused-illumination` worker service removed to avoid two workers racing for
  the same queue (Railway's copy would grab tasks and fail them before the local worker
  could).
- Local worker started with:
  ```
  uv run celery -A app.workers.celery_app worker --loglevel=info --concurrency=2
  ```
- `caffeinate -i` running alongside to prevent the Mac from sleeping.

## What's still unresolved / next steps
- **Oracle Cloud VM** (`oryxly-api`, project `project-b9a153c0-5831-4f65-b08`) is stopped,
  pending Google identity verification (deadline shown: 2 Nov 2026, but VM won't start
  until verified). This was meant to be the permanent home for the backend + worker with
  no SMTP restrictions.
- Long-term, the Celery worker needs to live somewhere with unrestricted outbound SMTP —
  either Oracle Cloud once verified, or a small VPS (Hetzner/DigitalOcean, ~$5/mo, no known
  SMTP blocking), since Railway Pro is the only Railway tier that unblocks SMTP and is
  more expensive than a plain VPS.
- Running the worker on a personal Mac is not a durable solution — it depends on the
  machine staying on and connected.
- One campaign (`IM_UFPL_FRANCE_20260722`, 44 recipients) failed entirely before the local
  worker fix landed; it needs to be manually retriggered via:
  ```python
  from app.workers.tasks import start_campaign
  start_campaign.delay("ed74bdfa-eeb1-495f-8f84-b54a8238abaf")
  ```

## Key credentials/values referenced during this migration
- Neon `DATABASE_URL`: `postgresql+psycopg://neondb_owner:npg_jRowdeEi47MH@ep-dark-tooth-aotizhgt-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
- Correct `FERNET_KEY` (matches production DB): `hYMrI1hKSjf02ZpiStNAQ99iI3onPu9UWBJJLi1D0HY=`
- Railway Redis `REDIS_URL`: `redis://default:NNYqtpiWGJdhPIuNGDEJLLziguFfdvIN@acela.proxy.rlwy.net:24552`
- GitHub fork used for Railway deploys: `oryxusofficial-create/Oryxly-bakend`
