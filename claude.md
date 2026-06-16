# MailFlow — Project Guide for Claude

## What this project is

**MailFlow** is a SaaS email campaign platform built by **Oryxus**, targeted at Indian SMBs, exporters, recruiters, and agencies. Users connect their own SMTP, upload contacts, build templates, and run campaigns through their own infrastructure.

- **Status:** Greenfield. `backend/` and `frontend/` are empty. Build from scratch.
- **Timeline:** 10–14 day MVP.
- **Scope:** MVP only. Do NOT build AI features, CRM, automation builder, team management, billing, lead-gen, or social channels.

## Source of truth

All design decisions live in [`ai-context/`](ai-context/). Read these BEFORE writing code. They are the spec — do not contradict them.

| File | Purpose |
|---|---|
| [01_prd.md](ai-context/01_prd.md) | Product requirements, scope, plans, business rules |
| [02_Technical_Architecture.md](ai-context/02_Technical_Architecture.md) | Stack, infrastructure, queue/worker design |
| [03_Security_Access_Control.md](ai-context/03_Security_Access_Control.md) | Auth, encryption, SMTP credential handling |
| [04_Frontend_Specification.md](ai-context/04_Frontend_Specification.md) | UI structure, pages, components |
| [05_Database_Schema_Reference.md](ai-context/05_Database_Schema_Reference.md) | Tables, columns, relationships |
| [06_API_Contract_Specification.md](ai-context/06_API_Contract_Specification.md) | Endpoints, request/response shapes |
| [07_Development_Execution_PRD.md](ai-context/07_Development_Execution_PRD.md) | Phase-by-phase build order — **follow exactly** |
| [execution_plan.md](ai-context/execution_plan.md) | Detailed execution plan |
| [mailflow_plan.md](ai-context/mailflow_plan.md) | Overall plan |

When the user asks for a feature, locate it in the relevant doc first. If a request conflicts with the docs, flag it — don't silently diverge.

## Stack

**Frontend** (`frontend/`)
- Next.js 15 + TypeScript
- TailwindCSS + ShadCN UI
- Zustand (state), TanStack Query (data fetching)
- Deployed on Vercel

**Backend** (`backend/`)
- FastAPI + Python 3.11+
- Pydantic v2, SQLAlchemy 2, Alembic
- PostgreSQL (primary), Redis (queue + cache + rate limit)
- Celery workers for email sending
- Deployed on Railway

## Repository layout (target)

```
mailflow/
  frontend/          # Next.js app
    src/app/         # routes
    src/components/ui/
    src/features/{auth,campaigns,templates,smtp,dashboard,logs}/
    src/{hooks,stores,services,types,lib}/
  backend/           # FastAPI app
    app/api/{auth,smtp,campaigns,templates,contacts,attachments,logs}/
    app/core/
    app/{database,models,schemas,services,repositories,workers,utils}/
  ai-context/        # specs (read-only reference)
  docker-compose.yml
```

## Core architectural rules

1. **Stateless API.** All state in Postgres or Redis.
2. **Async-only email sending.** API never sends directly — always `Queue → Worker → SMTP`.
3. **Multi-tenant.** Every query filters by `user_id`. No exceptions.
4. **Workers scale independently** from the API.

## Hard business rules (enforce in code)

- **Plans:** Starter (₹1,499 / 1 SMTP / 2k contacts / 200 emails-day / 5 campaigns-month), Growth (₹3,499 / 3 SMTP / 1k-day / unlimited), Agency (₹7,999 / 10 SMTP / 5k-day / team).
- **Delay between sends:** minimum 4 seconds.
- **File uploads:** max 10 MB. Contacts as CSV/XLSX/XLS. Attachments PDF/DOCX/PNG/JPG.
- **SMTP credentials:** must be encrypted at rest, never returned in API responses.
- **Passwords:** hashed, minimum 8 chars, email unique.

## MVP feature list (the only things to build)

Auth · SMTP management (add/verify/test/delete) · Contact upload + validation + dedupe · Templates with `{{name}}` `{{company}}` `{{email}}` variables · Campaigns (create/launch/pause/view) · Queue-based sending with retry · Logs (sent/failed/pending) · Dashboard metrics.

Anything not in this list is post-MVP — flag and stop.

## Working conventions

- Follow [07_Development_Execution_PRD.md](ai-context/07_Development_Execution_PRD.md) phase order. Don't skip ahead.
- Each feature must be production-ready before moving on (no half-finished modules).
- Prefer editing existing files; only create files the spec calls for.
- When `ai-context/` is ambiguous, ask the user — don't invent product behavior.

## Build progress

[`docs/PROGRESS.md`](docs/PROGRESS.md) is the living log of what's been shipped. Read it at the start of every phase to know current state. **Update it the moment a phase exits** — append a new section with: completion date, spec refs, what was built, verified evidence, decisions/deviations, files added/changed. Flip the status row in the table at top.
