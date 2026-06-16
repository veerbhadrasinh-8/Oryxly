# MailFlow

SaaS email campaign platform for Indian SMBs — by **Oryxus**.

Connect your own SMTP, upload contacts, build templates, launch campaigns.

## Tech stack

- **Frontend:** Next.js 15, TypeScript, Tailwind, ShadCN, Zustand, TanStack Query
- **Backend:** FastAPI, Python 3.12, SQLAlchemy 2, Alembic, Pydantic v2
- **Infra:** PostgreSQL 16, Redis 7, Celery, Docker Compose

## Quick start

Requirements: Docker Desktop running, `make` optional.

```bash
# 1. Copy env files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Generate a FERNET_KEY for backend/.env (SMTP password encryption)
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Generate a SECRET_KEY for JWT
python3 -c "import secrets; print(secrets.token_hex(32))"

# 3. Bring everything up
docker compose up --build
```

Open:
- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Local dev without Docker

Backend:
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
pnpm install
pnpm dev
```

## Project structure

```
mailflow/
  backend/          # FastAPI + Celery
    app/
      api/          # route modules per domain
      core/         # config, redis, security
      database/     # session, Base
      models/       # SQLAlchemy models
      schemas/      # Pydantic schemas
      services/     # business logic
      repositories/ # data access
      workers/      # Celery tasks
    alembic/        # migrations
  frontend/         # Next.js 15 app router
    src/
      app/          # routes
      components/ui # ShadCN components
      features/     # auth, campaigns, templates, smtp, dashboard, logs
      lib/          # api client, utils
  ai-context/       # full product + technical specs
  docker-compose.yml
  claude.md         # AI agent guidance
```

## Build phases

See [claude.md](claude.md) for the 12-phase MVP plan and [ai-context/07_Development_Execution_PRD.md](ai-context/07_Development_Execution_PRD.md) for the canonical sequence.

Currently completed: **Phase 1 — Infrastructure setup**.
