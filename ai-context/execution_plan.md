# MailFlow — Production Execution Plan
**Model: Claude Sonnet 4.6 via Claude Code Desktop**
**Architecture Level: Staff/Principal Engineer | FAANG-grade**
**Goal: Ship profitable SaaS MVP in 10–12 days**

---

## HOW TO USE THIS DOCUMENT WITH CLAUDE CODE

Before anything else, read this section. It will save you 40+ hours.

### Golden Rules for Claude Code Sessions

1. **One phase = one Claude Code session.** Never mix phases in one session. Context drift kills code quality.
2. **Always start a session by pasting the relevant section of this plan** as context before any code prompt.
3. **Never ask Claude Code to "build everything."** Give it ONE file or ONE function at a time.
4. **After every file generated**, run it and validate before moving to the next.
5. **Keep a `CONTEXT.md`** in your repo root. Update it after every session. Paste it at the start of each new session.
6. **When Claude Code starts giving inconsistent code** (wrong imports, forgetting your schema), reset the session and re-paste context.
7. **Commit after every working unit.** `git commit` is your undo button.

### Recommended Session Structure

```
Session Start:
  → Paste CONTEXT.md (current state of project)
  → Paste relevant plan section
  → Give one specific task

Session End:
  → Test the generated code
  → Fix bugs
  → Update CONTEXT.md
  → git commit
```

### CONTEXT.md Template (keep updated)

```markdown
# Project: MailFlow
# Stack: Next.js 15 / FastAPI / PostgreSQL / Redis / Celery
# Current Phase: [X]
# Last Completed: [describe what works]
# DB Models Done: [list]
# API Endpoints Done: [list]
# Frontend Pages Done: [list]
# Known Issues: [list]
# Environment: Railway (backend) + Vercel (frontend)
```

---

## PARALLEL EXECUTION MAP (READ FIRST)

```
DAY 1          DAY 2          DAY 3          DAY 4
──────────────────────────────────────────────────────
[BACKEND]      [BACKEND]      [BACKEND]      [BACKEND]
Phase 0        Phase 2        Phase 3        Phase 4
Infra setup    SMTP + Auth    CSV + Upload   Queue + Celery
               endpoints      endpoints      send worker
──────────────────────────────────────────────────────
               [FRONTEND]     [FRONTEND]     [FRONTEND]
               Phase F1       Phase F2       Phase F3
               Auth pages     SMTP + Upload  Campaign UI
               + routing      pages          + logs
──────────────────────────────────────────────────────

DAY 5          DAY 6          DAY 7
──────────────────────────────────────────────────────
[BOTH]         [BOTH]         [BOTH]
Integration    Polish +       Deploy +
testing        edge cases     client demo
```

**Critical path:** Backend Phase 0 → Phase 2 → Phase 3 → Phase 4 must be sequential.
**Can parallelize:** Frontend work starts Day 2, completely parallel to backend until Day 5 integration.

---

## SECTION 1 — SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│                  Next.js 15 (Vercel)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS + JWT cookie
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Application                        │
│                   Railway (Python 3.11)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Auth Layer │  │  API Routes │  │  Service Layer   │   │
│  │  JWT/Refresh│  │  /v1/*      │  │  Business Logic  │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└──────────┬────────────────────┬────────────────────────────┘
           │                    │
           ▼                    ▼
┌──────────────────┐  ┌─────────────────────────────────────┐
│   PostgreSQL     │  │            Redis                     │
│   Railway        │  │            Railway                   │
│   (primary DB)   │  │  ┌──────────────┐ ┌──────────────┐ │
└──────────────────┘  │  │  Task Queue  │ │  Rate Limit  │ │
                       │  │  (Celery)    │ │  (sliding)   │ │
                       │  └──────────────┘ └──────────────┘ │
                       └────────────────┬────────────────────┘
                                        │
                                        ▼
                       ┌─────────────────────────────────────┐
                       │         Celery Workers               │
                       │         Railway (separate service)   │
                       │  Worker 1: send_email task           │
                       │  Worker 2: cleanup/retry task        │
                       └──────────────┬──────────────────────┘
                                      │
                                      ▼
                       ┌─────────────────────────────────────┐
                       │    Client's SMTP Server              │
                       │    (Gmail / Custom — BYO)            │
                       │    NOT our infrastructure            │
                       └─────────────────────────────────────┘
```

### Request Lifecycle (Synchronous)

```
Browser → Next.js API route (proxy) → FastAPI
  → JWT middleware validates token
  → Rate limiter checks Redis
  → Route handler called
  → Service layer executes business logic
  → Repository layer hits PostgreSQL
  → Response serialized via Pydantic
  → JSON returned to browser
```

### Async Queue Lifecycle (Campaign Send)

```
1. User clicks "Send Campaign"
2. FastAPI creates campaign record (status=queued)
3. FastAPI enqueues Celery task: dispatch_campaign(campaign_id)
4. FastAPI returns 202 Accepted immediately (non-blocking)
5. Celery picks up dispatch_campaign task
6. dispatch_campaign fetches all recipients (status=pending)
7. For each recipient, enqueues: send_single_email(recipient_id, countdown=i*4)
8. send_single_email task:
   a. Fetch recipient + campaign + template + smtp creds
   b. Decrypt SMTP password (Fernet)
   c. Render template (Jinja2 variable substitution)
   d. Build MIME message (with attachments if any)
   e. Connect to SMTP server
   f. Send email
   g. Log result to email_logs table
   h. Update recipient status (sent/failed)
   i. Increment campaign.sent_count or failed_count
9. After all tasks complete: campaign status → completed
10. Frontend polls /campaigns/{id}/status every 5s (TanStack Query)
```

### SMTP Credential Flow (Security Critical)

```
STORE:
User input (plain password)
  → FastAPI receives via HTTPS
  → Service layer calls encrypt(password, FERNET_KEY)
  → Encrypted bytes stored in smtp_credentials.encrypted_password
  → Plain password NEVER touches disk or logs

RETRIEVE (only in Celery worker):
  → Worker fetches smtp_credentials row
  → decrypt(encrypted_password, FERNET_KEY) → plain password in memory
  → Used to authenticate SMTP connection
  → Memory cleared after connection
  → Plain password NEVER returned via API
```

---

## SECTION 2 — MONOREPO PROJECT STRUCTURE

```
mailflow/
├── .github/
│   └── workflows/
│       ├── backend-deploy.yml
│       └── frontend-deploy.yml
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app factory
│   │   ├── config.py                  # Settings (Pydantic BaseSettings)
│   │   ├── database.py                # SQLAlchemy engine + session
│   │   ├── dependencies.py            # FastAPI DI (get_db, get_current_user)
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py          # Aggregate all v1 routers
│   │   │       ├── auth.py
│   │   │       ├── smtp.py
│   │   │       ├── campaigns.py
│   │   │       ├── templates.py
│   │   │       ├── uploads.py
│   │   │       └── logs.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── smtp_credential.py
│   │   │   ├── campaign.py
│   │   │   ├── campaign_recipient.py
│   │   │   ├── template.py
│   │   │   ├── email_log.py
│   │   │   ├── attachment.py
│   │   │   └── background_job.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── smtp.py
│   │   │   ├── campaign.py
│   │   │   ├── template.py
│   │   │   └── log.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── smtp_service.py
│   │   │   ├── campaign_service.py
│   │   │   ├── template_service.py
│   │   │   ├── upload_service.py
│   │   │   └── encryption_service.py
│   │   ├── workers/
│   │   │   ├── __init__.py
│   │   │   ├── celery_app.py          # Celery instance
│   │   │   ├── tasks/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── email_tasks.py     # send_single_email, dispatch_campaign
│   │   │   │   └── cleanup_tasks.py  # daily cap reset, stale job cleanup
│   │   │   └── beat_schedule.py      # Periodic task schedule
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── rate_limit.py
│   │   │   └── request_id.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── email_validator.py
│   │       ├── csv_parser.py
│   │       ├── template_renderer.py
│   │       └── mime_builder.py
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_smtp.py
│   │   ├── test_campaigns.py
│   │   └── test_workers.py
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # redirect to /dashboard or /login
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx         # sidebar + nav wrapper
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── campaigns/
│   │   │       │   ├── page.tsx       # campaign list
│   │   │       │   ├── new/page.tsx   # multi-step creator
│   │   │       │   └── [id]/page.tsx  # campaign detail + live log
│   │   │       ├── templates/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/page.tsx
│   │   │       ├── settings/
│   │   │       │   └── smtp/page.tsx
│   │   │       └── logs/page.tsx
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn components
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── campaigns/
│   │   │   │   ├── CampaignCard.tsx
│   │   │   │   ├── CampaignWizard.tsx # multi-step form
│   │   │   │   ├── CsvUploader.tsx
│   │   │   │   ├── RecipientPreview.tsx
│   │   │   │   └── LiveLogTable.tsx
│   │   │   ├── templates/
│   │   │   │   ├── TemplateEditor.tsx
│   │   │   │   └── TemplatePreview.tsx
│   │   │   ├── smtp/
│   │   │   │   └── SmtpConnectForm.tsx
│   │   │   └── shared/
│   │   │       ├── PageHeader.tsx
│   │   │       ├── DataTable.tsx
│   │   │       ├── StatusBadge.tsx
│   │   │       └── LoadingSkeleton.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                 # axios instance + interceptors
│   │   │   ├── auth.ts                # auth helpers
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCampaigns.ts
│   │   │   ├── useTemplates.ts
│   │   │   └── useSmtp.ts
│   │   ├── stores/
│   │   │   └── authStore.ts           # Zustand (lightweight)
│   │   └── types/
│   │       └── index.ts               # all TS interfaces
│   ├── public/
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── docker-compose.yml                 # local dev only
├── docker-compose.prod.yml            # prod reference
└── CONTEXT.md                         # update after every session
```

---

## SECTION 3 — DATABASE DESIGN

### Design Principles
- All tables have `id` (UUID), `created_at`, `updated_at`
- Soft delete via `deleted_at` (nullable timestamp) — never hard delete user data
- Status fields use string enums (not integers) for readability in logs
- Indexes on all foreign keys and all fields used in WHERE clauses
- JSON fields only for truly dynamic/unknown-shape data (custom CSV columns)

### Complete Schema

```sql
-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    full_name   VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    plan_type   VARCHAR(50) NOT NULL DEFAULT 'starter',
    -- starter | growth | agency
    is_active   BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    -- email verification before first send
    daily_send_count  INTEGER NOT NULL DEFAULT 0,
    -- reset by Celery beat at midnight IST
    daily_send_date   DATE,
    -- the date daily_send_count applies to
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
    -- soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan_type ON users(plan_type);

-- WHY: daily_send_count + daily_send_date stored on user row
-- instead of a separate table to avoid expensive COUNT queries
-- on email_logs every time we check the cap.
-- Trade-off: slight denormalization, acceptable at this scale.


-- ============================================================
-- SMTP CREDENTIALS
-- ============================================================
CREATE TABLE smtp_credentials (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label               VARCHAR(100) NOT NULL DEFAULT 'Primary',
    -- user-friendly name ("Work Gmail", "Company SMTP")
    email_address       VARCHAR(255) NOT NULL,
    -- the From: address
    smtp_host           VARCHAR(255) NOT NULL DEFAULT 'smtp.gmail.com',
    smtp_port           INTEGER NOT NULL DEFAULT 587,
    use_tls             BOOLEAN NOT NULL DEFAULT true,
    encrypted_password  TEXT NOT NULL,
    -- Fernet encrypted, never plain text
    is_verified         BOOLEAN NOT NULL DEFAULT false,
    -- true only after successful SMTP test
    last_tested_at      TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(user_id, email_address)
    -- one SMTP per email address per user
);

CREATE INDEX idx_smtp_user_id ON smtp_credentials(user_id);

-- WHY: separate table (not on users) because Growth plan allows
-- multiple SMTP accounts. Also keeps encryption concern isolated.


-- ============================================================
-- TEMPLATES
-- ============================================================
CREATE TABLE templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    subject         VARCHAR(998) NOT NULL,
    -- 998 = RFC 2822 max subject length
    html_body       TEXT NOT NULL,
    text_body       TEXT,
    -- plain text fallback (auto-generated from html if null)
    variables       JSONB NOT NULL DEFAULT '[]',
    -- ["name", "company", "city"] — detected variables
    is_default      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_user_id_deleted ON templates(user_id, deleted_at);

-- WHY: variables stored as JSONB array for quick client-side
-- validation: "does uploaded CSV have all required columns?"


-- ============================================================
-- ATTACHMENTS
-- ============================================================
CREATE TABLE attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_name   VARCHAR(255) NOT NULL,
    storage_key     TEXT NOT NULL UNIQUE,
    -- Cloudflare R2 object key
    content_type    VARCHAR(100) NOT NULL,
    size_bytes      INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- no soft delete: if campaign is deleted, attachment reference removed
);

CREATE INDEX idx_attachments_user_id ON attachments(user_id);


-- ============================================================
-- CAMPAIGNS
-- ============================================================
CREATE TABLE campaigns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    smtp_credential_id  UUID NOT NULL REFERENCES smtp_credentials(id),
    template_id         UUID NOT NULL REFERENCES templates(id),
    name                VARCHAR(255) NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- draft | queued | running | completed | failed | paused | cancelled
    total_recipients    INTEGER NOT NULL DEFAULT 0,
    sent_count          INTEGER NOT NULL DEFAULT 0,
    failed_count        INTEGER NOT NULL DEFAULT 0,
    skipped_count       INTEGER NOT NULL DEFAULT 0,
    -- skipped = daily cap reached
    send_delay_seconds  INTEGER NOT NULL DEFAULT 4,
    -- configurable per campaign, min 3s enforced
    attachment_ids      JSONB NOT NULL DEFAULT '[]',
    -- array of attachment UUIDs
    error_message       TEXT,
    -- top-level campaign error if dispatch fails
    queued_at           TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_user_status ON campaigns(user_id, status);

-- WHY status breakdown matters:
-- draft: saved but not sent
-- queued: Celery task created, not started
-- running: workers actively sending
-- completed: all recipients processed
-- failed: dispatch-level failure (bad SMTP, etc.)
-- paused: user paused mid-campaign (Phase 2)
-- cancelled: user cancelled before completion


-- ============================================================
-- CAMPAIGN RECIPIENTS
-- ============================================================
CREATE TABLE campaign_recipients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    variables       JSONB NOT NULL DEFAULT '{}',
    -- {"name": "Rahul", "company": "Tata", "city": "Mumbai"}
    status          VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- pending | sent | failed | skipped
    error_message   TEXT,
    -- SMTP error, template render error, etc.
    attempt_count   INTEGER NOT NULL DEFAULT 0,
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- no soft delete: recipients are immutable after campaign launch
);

CREATE INDEX idx_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX idx_recipients_campaign_status ON campaign_recipients(campaign_id, status);
CREATE INDEX idx_recipients_email ON campaign_recipients(email);

-- WHY JSONB for variables: CSV columns are user-defined and unknown
-- at schema design time. JSONB gives us flexibility + indexability.
-- Trade-off: no column-level constraints on variable values.


-- ============================================================
-- EMAIL LOGS
-- ============================================================
CREATE TABLE email_logs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_recipient_id   UUID NOT NULL REFERENCES campaign_recipients(id),
    campaign_id             UUID NOT NULL REFERENCES campaigns(id),
    -- denormalized for faster log queries without joins
    user_id                 UUID NOT NULL REFERENCES users(id),
    -- denormalized for user-level log filtering
    recipient_email         VARCHAR(255) NOT NULL,
    -- denormalized for display without joins
    status                  VARCHAR(50) NOT NULL,
    -- sent | failed | retrying
    smtp_response           TEXT,
    -- raw SMTP server response or error message
    attempt_number          INTEGER NOT NULL DEFAULT 1,
    attempted_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_logs_campaign_id ON email_logs(campaign_id);
CREATE INDEX idx_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_logs_attempted_at ON email_logs(attempted_at DESC);
CREATE INDEX idx_logs_status ON email_logs(status);

-- WHY denormalize: Log queries (user views their logs page) should
-- never need multi-table JOINs for performance. Denormalization here
-- is intentional — logs are append-only, never updated.


-- ============================================================
-- BACKGROUND JOBS
-- ============================================================
CREATE TABLE background_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID REFERENCES campaigns(id),
    job_type        VARCHAR(100) NOT NULL,
    -- dispatch_campaign | send_single_email | cleanup
    celery_task_id  VARCHAR(255),
    -- Celery task UUID for tracking
    status          VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- pending | running | completed | failed | retrying
    error_message   TEXT,
    retry_count     INTEGER NOT NULL DEFAULT 0,
    max_retries     INTEGER NOT NULL DEFAULT 3,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_campaign_id ON background_jobs(campaign_id);
CREATE INDEX idx_jobs_celery_task_id ON background_jobs(celery_task_id);
CREATE INDEX idx_jobs_status ON background_jobs(status);
```

### Alembic Migration Strategy

```
alembic/versions/
  001_initial_schema.py      # all tables above
  002_add_indexes.py         # performance indexes
  003_seed_data.py           # optional: default template
```

Never edit existing migrations. Always create new ones.

---

## SECTION 4 — BACKEND EXECUTION PLAN

### Phase 0: Project Foundation (Day 1, 3–4 hours)

**Objective:** Working FastAPI app connected to Postgres and Redis, deployable to Railway.

#### Step 1: requirements.txt

```txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.30
alembic==1.13.1
psycopg2-binary==2.9.9
pydantic[email]==2.7.1
pydantic-settings==2.2.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
celery[redis]==5.4.0
redis==5.0.4
cryptography==42.0.7
pandas==2.2.2
openpyxl==3.1.2
email-validator==2.1.1
jinja2==3.1.4
boto3==1.34.109
slowapi==0.1.9
httpx==0.27.0
pytest==8.2.0
pytest-asyncio==0.23.6
```

#### Step 2: config.py (Settings)

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    SECRET_KEY: str          # openssl rand -hex 32
    FERNET_KEY: str          # Fernet.generate_key().decode()
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # R2 / S3
    R2_ENDPOINT_URL: str
    R2_ACCESS_KEY_ID: str
    R2_SECRET_ACCESS_KEY: str
    R2_BUCKET_NAME: str
    
    # App
    ENVIRONMENT: str = "production"
    ALLOWED_ORIGINS: list[str] = ["https://mailflow.vercel.app"]
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

#### Step 3: database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,   # reconnect on stale connections
    pool_recycle=3600     # recycle connections every hour
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### Step 4: main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.v1.router import v1_router
from app.config import get_settings

settings = get_settings()

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="MailFlow API",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=None
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

app.include_router(v1_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

#### Step 5: Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Step 6: Validate

```bash
docker-compose up
curl http://localhost:8000/health
# Expected: {"status": "ok"}
alembic upgrade head
# Expected: all tables created
```

---

### Phase 1: Auth System (Day 1, 4–5 hours)

**Objective:** Secure JWT auth with refresh token rotation.

#### encryption_service.py

```python
from cryptography.fernet import Fernet
from app.config import get_settings

settings = get_settings()
_fernet = Fernet(settings.FERNET_KEY.encode())

def encrypt(plain_text: str) -> str:
    return _fernet.encrypt(plain_text.encode()).decode()

def decrypt(cipher_text: str) -> str:
    return _fernet.decrypt(cipher_text.encode()).decode()
```

#### auth_service.py (key parts)

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": user_id, "exp": expire, "type": "access"}, 
                      settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": user_id, "exp": expire, "type": "refresh"},
                      settings.SECRET_KEY, algorithm=settings.ALGORITHM)
```

#### API Endpoints — /api/v1/auth

```
POST /auth/register
  Body: {email, password, full_name}
  Validation: email unique, password min 8 chars
  Action: hash password, create user, send verification email (skip for MVP)
  Response: {user_id, email, message}
  Rate limit: 5/minute per IP

POST /auth/login
  Body: {email, password}
  Action: verify password, create access + refresh tokens
  Response: {access_token, user} + Set-Cookie: refresh_token (httpOnly, Secure, SameSite=Lax)
  Rate limit: 10/minute per IP

POST /auth/refresh
  Cookie: refresh_token
  Action: validate refresh token, issue new access token
  Response: {access_token}

POST /auth/logout
  Action: clear refresh_token cookie
  Response: {message: "logged out"}

GET /auth/me
  Header: Authorization: Bearer <access_token>
  Response: {id, email, full_name, plan_type, smtp_connected}
```

#### dependencies.py — JWT Middleware

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user
```

---

### Phase 2: SMTP Management (Day 2, 3–4 hours)

**Objective:** Securely store and test SMTP credentials.

#### smtp_service.py

```python
import smtplib
from app.services.encryption_service import encrypt, decrypt

def test_smtp_connection(host: str, port: int, email: str, password: str) -> dict:
    """
    Returns {"success": True} or {"success": False, "error": "reason"}
    Never raises — always returns a dict safe to return to frontend
    """
    try:
        if port == 465:
            server = smtplib.SMTP_SSL(host, port, timeout=10)
        else:
            server = smtplib.SMTP(host, port, timeout=10)
            server.ehlo()
            server.starttls()
            server.ehlo()
        
        server.login(email, password)
        server.quit()
        return {"success": True}
    
    except smtplib.SMTPAuthenticationError:
        return {"success": False, "error": "Authentication failed. Check email and app password."}
    except smtplib.SMTPConnectError:
        return {"success": False, "error": f"Cannot connect to {host}:{port}"}
    except TimeoutError:
        return {"success": False, "error": "Connection timed out"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def save_smtp_credential(db, user_id, data) -> SmtpCredential:
    test_result = test_smtp_connection(data.smtp_host, data.smtp_port, 
                                        data.email_address, data.password)
    if not test_result["success"]:
        raise ValueError(test_result["error"])
    
    # Check: only 1 SMTP for Starter plan
    existing = db.query(SmtpCredential).filter(
        SmtpCredential.user_id == user_id,
        SmtpCredential.deleted_at.is_(None)
    ).count()
    
    plan_limits = {"starter": 1, "growth": 3, "agency": 10}
    user = db.query(User).filter(User.id == user_id).first()
    if existing >= plan_limits.get(user.plan_type, 1):
        raise ValueError(f"Your {user.plan_type} plan allows max {plan_limits[user.plan_type]} SMTP accounts")
    
    cred = SmtpCredential(
        user_id=user_id,
        email_address=data.email_address,
        smtp_host=data.smtp_host,
        smtp_port=data.smtp_port,
        encrypted_password=encrypt(data.password),
        is_verified=True,
        last_tested_at=datetime.utcnow()
    )
    db.add(cred)
    db.commit()
    return cred
```

#### API Endpoints — /api/v1/smtp

```
POST /smtp/connect
  Body: {email_address, smtp_host, smtp_port, password}
  Action: test → encrypt → save
  Response: {id, email_address, smtp_host, is_verified, created_at}
  NOTE: password NEVER in response

GET /smtp/list
  Response: [{id, email_address, smtp_host, is_verified, last_tested_at}]

POST /smtp/{id}/test
  Action: decrypt → test live → update last_tested_at
  Response: {success, message}

DELETE /smtp/{id}
  Action: soft delete (deleted_at = NOW())
  Guard: cannot delete if active campaign exists using this SMTP
```

---

### Phase 3: CSV Upload & Campaign Creation (Day 3, 4–5 hours)

**Objective:** Parse CSV/Excel, validate contacts, create campaigns.

#### csv_parser.py

```python
import pandas as pd
from email_validator import validate_email, EmailNotValidError
from io import BytesIO

def parse_contact_file(file_bytes: bytes, filename: str) -> dict:
    """
    Returns:
    {
      "valid": [{email, name, company, ...}],
      "invalid": [{row, email, reason}],
      "columns": ["email", "name", "company"],
      "total": 300,
      "valid_count": 287,
      "invalid_count": 13,
      "duplicate_count": 5
    }
    """
    try:
        if filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(file_bytes))
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(BytesIO(file_bytes))
        else:
            raise ValueError("Unsupported file type. Use CSV or Excel.")
    except Exception as e:
        raise ValueError(f"Could not parse file: {str(e)}")
    
    # Normalize column names
    df.columns = [col.strip().lower().replace(' ', '_') for col in df.columns]
    
    if 'email' not in df.columns:
        raise ValueError("File must have an 'email' column")
    
    valid, invalid = [], []
    seen_emails = set()
    
    for idx, row in df.iterrows():
        raw_email = str(row.get('email', '')).strip()
        
        # Check duplicate
        if raw_email.lower() in seen_emails:
            invalid.append({"row": idx + 2, "email": raw_email, "reason": "Duplicate"})
            continue
        
        # Validate email
        try:
            validated = validate_email(raw_email, check_deliverability=False)
            clean_email = validated.email
        except EmailNotValidError as e:
            invalid.append({"row": idx + 2, "email": raw_email, "reason": str(e)})
            continue
        
        seen_emails.add(clean_email.lower())
        
        # Build variable dict from all CSV columns
        variables = {}
        for col in df.columns:
            if col != 'email':
                val = row.get(col, '')
                variables[col] = '' if pd.isna(val) else str(val).strip()
        
        valid.append({"email": clean_email, **variables})
    
    return {
        "valid": valid,
        "invalid": invalid,
        "columns": list(df.columns),
        "total": len(df),
        "valid_count": len(valid),
        "invalid_count": len(invalid),
        "duplicate_count": len([i for i in invalid if i["reason"] == "Duplicate"])
    }
```

#### template_renderer.py

```python
from jinja2 import Environment, BaseLoader, TemplateSyntaxError, UndefinedError

# Use Jinja2 with {{ }} syntax matching user's expectation
jinja_env = Environment(loader=BaseLoader(), undefined=jinja2.Undefined)

def render_template(html_body: str, subject: str, variables: dict) -> tuple[str, str]:
    """
    Returns (rendered_subject, rendered_html)
    Variables: {"name": "Rahul", "company": "Tata"}
    Undefined variables → empty string (don't crash)
    """
    try:
        rendered_subject = jinja_env.from_string(subject).render(**variables)
        rendered_html = jinja_env.from_string(html_body).render(**variables)
        return rendered_subject, rendered_html
    except TemplateSyntaxError as e:
        raise ValueError(f"Template syntax error: {e.message}")
    except Exception as e:
        raise ValueError(f"Template render error: {str(e)}")

def extract_variables(html_body: str, subject: str) -> list[str]:
    """Extract {{variable_name}} from template for validation UI"""
    import re
    pattern = r'\{\{(\s*\w+\s*)\}\}'
    found = re.findall(pattern, html_body + subject)
    return list(set(v.strip() for v in found))
```

#### API Endpoints — /api/v1/campaigns

```
POST /campaigns/parse-csv
  Body: multipart file upload
  Action: parse + validate (DO NOT save yet)
  Response: ParseResult (valid/invalid counts, preview, columns)
  Rate limit: 10/minute

POST /campaigns
  Body: {
    name, smtp_credential_id, template_id,
    recipients: [{email, variables}],
    attachment_ids: [],
    send_delay_seconds: 4
  }
  Action: create campaign + bulk insert recipients
  Response: {campaign_id, status: "draft"}

POST /campaigns/{id}/launch
  Action: validate SMTP active → enqueue Celery task → set status=queued
  Response: {campaign_id, status: "queued", estimated_duration_seconds}

GET /campaigns
  Response: paginated list with counts

GET /campaigns/{id}
  Response: campaign detail + recipient summary

GET /campaigns/{id}/recipients
  Query params: status, page, per_page
  Response: paginated recipients with status

DELETE /campaigns/{id}
  Guard: cannot delete if status=running
  Action: soft delete campaign + cascade recipients
```

---

### Phase 4: Queue & Worker Architecture (Day 4, 5–6 hours)

**Objective:** Reliable async email sending with retry, rate limiting, daily caps.

#### celery_app.py

```python
from celery import Celery
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "mailflow",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.tasks.email_tasks", "app.workers.tasks.cleanup_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,           # ACK only after task completes (prevents loss)
    worker_prefetch_multiplier=1,  # one task at a time per worker (prevents overload)
    task_reject_on_worker_lost=True,
    task_default_retry_delay=60,
    task_max_retries=3,
    broker_connection_retry_on_startup=True,
    result_expires=86400           # results expire after 24 hours
)
```

#### email_tasks.py (Critical — read carefully)

```python
from celery import shared_task
from celery.utils.log import get_task_logger
import smtplib
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.encryption_service import decrypt
from app.utils.template_renderer import render_template

logger = get_task_logger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_single_email(self, recipient_id: str):
    """
    Idempotent: checks recipient status before sending.
    If already 'sent', returns immediately (handles duplicate task execution).
    """
    db: Session = SessionLocal()
    
    try:
        # Fetch all needed data in one query block
        from app.models import CampaignRecipient, Campaign, Template, SmtpCredential, EmailLog
        
        recipient = db.query(CampaignRecipient).filter_by(id=recipient_id).first()
        
        # IDEMPOTENCY CHECK — critical
        if not recipient:
            logger.warning(f"Recipient {recipient_id} not found")
            return
        if recipient.status == "sent":
            logger.info(f"Recipient {recipient_id} already sent, skipping")
            return
        
        campaign = db.query(Campaign).filter_by(id=recipient.campaign_id).first()
        if campaign.status == "cancelled":
            _mark_recipient_skipped(db, recipient, "Campaign cancelled")
            return
        
        # DAILY CAP CHECK
        from app.models import User
        user = db.query(User).filter_by(id=campaign.user_id).first()
        plan_caps = {"starter": 200, "growth": 1000, "agency": 5000}
        daily_cap = plan_caps.get(user.plan_type, 200)
        
        from datetime import date
        today = date.today()
        if user.daily_send_date != today:
            user.daily_send_count = 0
            user.daily_send_date = today
        
        if user.daily_send_count >= daily_cap:
            _mark_recipient_skipped(db, recipient, f"Daily cap of {daily_cap} reached")
            campaign.skipped_count += 1
            db.commit()
            return
        
        # FETCH SMTP CREDENTIALS
        smtp_cred = db.query(SmtpCredential).filter_by(
            id=campaign.smtp_credential_id
        ).first()
        
        plain_password = decrypt(smtp_cred.encrypted_password)
        
        # RENDER TEMPLATE
        template = db.query(Template).filter_by(id=campaign.template_id).first()
        rendered_subject, rendered_html = render_template(
            template.html_body,
            template.subject,
            recipient.variables
        )
        
        # BUILD MIME MESSAGE
        msg = MIMEMultipart('alternative')
        msg['From'] = smtp_cred.email_address
        msg['To'] = recipient.email
        msg['Subject'] = rendered_subject
        msg.attach(MIMEText(rendered_html, 'html'))
        
        # ATTACH FILES
        if campaign.attachment_ids:
            _attach_files(msg, campaign.attachment_ids, db)
        
        # SEND
        _send_via_smtp(
            msg=msg,
            host=smtp_cred.smtp_host,
            port=smtp_cred.smtp_port,
            email=smtp_cred.email_address,
            password=plain_password,
            use_tls=smtp_cred.use_tls
        )
        
        # UPDATE STATE
        recipient.status = "sent"
        recipient.sent_at = datetime.utcnow()
        recipient.attempt_count += 1
        campaign.sent_count += 1
        user.daily_send_count += 1
        
        # LOG
        log = EmailLog(
            campaign_recipient_id=recipient.id,
            campaign_id=campaign.id,
            user_id=campaign.user_id,
            recipient_email=recipient.email,
            status="sent",
            smtp_response="250 OK",
            attempt_number=recipient.attempt_count
        )
        db.add(log)
        db.commit()
        
        logger.info(f"Email sent to {recipient.email}")
        
    except smtplib.SMTPAuthenticationError as exc:
        # SMTP auth failure = don't retry (credentials won't fix themselves)
        _handle_permanent_failure(db, recipient, campaign, f"SMTP Auth failed: {str(exc)}")
        
    except (smtplib.SMTPConnectError, ConnectionRefusedError) as exc:
        # Connection failure = retry
        logger.warning(f"SMTP connect error for {recipient_id}: {exc}, retrying")
        db.rollback()
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))
    
    except Exception as exc:
        if self.request.retries < self.max_retries:
            logger.warning(f"Task failed for {recipient_id}: {exc}, retrying")
            db.rollback()
            raise self.retry(exc=exc, countdown=60)
        else:
            _handle_permanent_failure(db, recipient, campaign, str(exc))
    
    finally:
        db.close()
        del plain_password  # explicit cleanup of sensitive data


@shared_task
def dispatch_campaign(campaign_id: str):
    """Enqueue individual send tasks with countdown delays"""
    db = SessionLocal()
    try:
        from app.models import Campaign, CampaignRecipient
        
        campaign = db.query(Campaign).filter_by(id=campaign_id).first()
        if not campaign or campaign.status != "queued":
            return
        
        campaign.status = "running"
        campaign.started_at = datetime.utcnow()
        db.commit()
        
        recipients = db.query(CampaignRecipient).filter_by(
            campaign_id=campaign_id,
            status="pending"
        ).all()
        
        delay_seconds = campaign.send_delay_seconds or 4
        
        for i, recipient in enumerate(recipients):
            send_single_email.apply_async(
                args=[str(recipient.id)],
                countdown=i * delay_seconds
            )
        
        logger.info(f"Dispatched {len(recipients)} emails for campaign {campaign_id}")
        
    except Exception as e:
        logger.error(f"Dispatch failed for campaign {campaign_id}: {e}")
        campaign.status = "failed"
        campaign.error_message = str(e)
        db.commit()
    finally:
        db.close()


def _send_via_smtp(msg, host, port, email, password, use_tls):
    if port == 465:
        with smtplib.SMTP_SSL(host, port, timeout=30) as server:
            server.login(email, password)
            server.send_message(msg)
    else:
        with smtplib.SMTP(host, port, timeout=30) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(email, password)
            server.send_message(msg)


def _handle_permanent_failure(db, recipient, campaign, error_msg):
    recipient.status = "failed"
    recipient.error_message = error_msg
    recipient.attempt_count += 1
    campaign.failed_count += 1
    log = EmailLog(...)  # same pattern as success
    db.add(log)
    db.commit()
```

---

## SECTION 5 — FRONTEND EXECUTION PLAN

### Phase F1: Foundation + Auth (Day 2, parallel to backend Phase 2)

**Objective:** Working Next.js app with auth flow, routing, and API layer.

#### api.ts — Axios Client

```typescript
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,  // for httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor: attach access token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor: handle 401 → auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await apiClient.post('/auth/refresh')
        localStorage.setItem('access_token', data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return apiClient(original)
      } catch {
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
```

#### TanStack Query Setup

```typescript
// providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,        // 30 seconds
        retry: (failureCount, error) => {
          if (error?.response?.status === 401) return false
          return failureCount < 2
        }
      }
    }
  }))
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

#### Auth Pages

```typescript
// LoginForm.tsx — using React Hook Form + Zod
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
})

// On submit:
const { data } = await apiClient.post('/auth/login', values)
localStorage.setItem('access_token', data.access_token)
router.push('/dashboard')
```

#### Route Protection (middleware.ts)

```typescript
// next.config.ts level protection
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  // OR check localStorage via a different mechanism
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard') ||
                      request.nextUrl.pathname.startsWith('/campaigns')
  
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/campaigns/:path*', '/settings/:path*']
}
```

---

### Phase F2: Core Campaign Flow (Day 3, parallel to backend Phase 3)

**Objective:** The most important UX in the product — campaign creation wizard.

#### CampaignWizard.tsx — 4-Step Flow

```typescript
// Step state machine
type WizardStep = 'smtp-check' | 'upload' | 'template' | 'review'

// Step 1: SMTP Check
// - Query GET /smtp/list
// - If empty: show "Connect Gmail first" with link to /settings/smtp
// - If connected: show which email will be used, proceed

// Step 2: Upload Contacts
// - Drag/drop zone (react-dropzone)
// - POST /campaigns/parse-csv → show validation results
// - Show: "287 valid | 13 invalid | Download rejected.csv"
// - Cannot proceed if valid_count === 0

// Step 3: Template
// - GET /templates → list existing
// - OR create inline (subject + body with {{variable}} syntax)
// - Live preview: fill first valid recipient's data into template
// - Show: "Preview for: Rahul Sharma, Tata Consultancy"

// Step 4: Review & Send
// - Show summary card
// - "Sending 287 emails from yourname@gmail.com"
// - "Estimated time: ~19 minutes"
// - Big "Launch Campaign" button
// - On click: POST /campaigns → POST /campaigns/{id}/launch
// - Redirect to /campaigns/{id} (live log view)
```

#### LiveLogTable.tsx — Polling

```typescript
// Poll campaign status every 5 seconds while running
const { data: campaign } = useQuery({
  queryKey: ['campaign', id],
  queryFn: () => apiClient.get(`/campaigns/${id}`).then(r => r.data),
  refetchInterval: (data) => data?.status === 'running' ? 5000 : false
})

// Progress bar
const progress = campaign 
  ? ((campaign.sent_count + campaign.failed_count) / campaign.total_recipients) * 100
  : 0

// Log table: paginated, filterable by status
```

---

### Phase F3: Supporting Pages (Day 4)

**Pages to complete:**

**Dashboard** (`/dashboard`)
- 4 stat cards: total campaigns, sent today, active SMTP, total contacts reached
- Recent campaigns list (last 5)
- "New Campaign" CTA button

**Templates** (`/templates`)
- List view with last-used date
- Template editor: textarea with variable highlighting
- Preview button: paste sample CSV row to see rendered output

**SMTP Settings** (`/settings/smtp`)
- Connection form with step-by-step Gmail guide (inline, collapsible)
- Show status badge (connected/disconnected)
- Test connection button with live feedback

**Logs** (`/logs`)
- Full log table: date, campaign, recipient, status, smtp response
- Filter by date range, status, campaign
- Export as CSV (client-side, using papaparse)

---

## SECTION 6 — SECURITY ARCHITECTURE

### SMTP Credential Security (Highest Priority)

```python
# NEVER do this:
return {"smtp_password": credential.encrypted_password}  # Even encrypted

# NEVER do this:
logger.info(f"Connecting SMTP: {email}:{password}")

# ALWAYS do this in API responses:
return {
    "id": str(cred.id),
    "email_address": cred.email_address,
    "smtp_host": cred.smtp_host,
    "is_verified": cred.is_verified,
    # NO password field whatsoever
}

# In Celery worker, after use:
plain_password = decrypt(cred.encrypted_password)
# ... use password ...
del plain_password  # explicit memory cleanup
```

### API Security Checklist

```python
# 1. Rate limiting (slowapi)
@router.post("/auth/login")
@limiter.limit("10/minute")
async def login(request: Request, ...):

# 2. Ownership validation on every resource access
campaign = db.query(Campaign).filter(
    Campaign.id == campaign_id,
    Campaign.user_id == current_user.id,  # ALWAYS check ownership
    Campaign.deleted_at.is_(None)
).first()
if not campaign:
    raise HTTPException(404)  # Return 404, not 403 (don't leak existence)

# 3. File upload validation
ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.xls', '.pdf', '.docx', '.png', '.jpg'}
ALLOWED_MIME_TYPES = {'text/csv', 'application/vnd.openxmlformats...', ...}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# 4. Secure headers (add to FastAPI middleware)
from fastapi.middleware.trustedhost import TrustedHostMiddleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["api.mailflow.in", "localhost"])
```

### Frontend Security

```typescript
// next.config.ts — Security headers
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
]
```

---

## SECTION 7 — DEPLOYMENT ARCHITECTURE

### docker-compose.yml (Local Dev)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mailflow
      POSTGRES_USER: mailflow
      POSTGRES_PASSWORD: devpassword
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  api:
    build: ./backend
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ports: ["8000:8000"]
    env_file: ./backend/.env
    depends_on: [postgres, redis]
    volumes: [./backend:/app]

  worker:
    build: ./backend
    command: celery -A app.workers.celery_app worker --loglevel=info --concurrency=4
    env_file: ./backend/.env
    depends_on: [postgres, redis]

  beat:
    build: ./backend
    command: celery -A app.workers.celery_app beat --loglevel=info
    env_file: ./backend/.env
    depends_on: [postgres, redis]

volumes:
  postgres_data:
```

### Railway Deployment (3 services)

```
Service 1: api
  → Build: Dockerfile in /backend
  → Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
  → Health check: GET /health

Service 2: worker
  → Build: same Dockerfile
  → Start: celery -A app.workers.celery_app worker --loglevel=info --concurrency=4

Service 3: beat (Celery scheduler)
  → Build: same Dockerfile
  → Start: celery -A app.workers.celery_app beat --loglevel=info

Managed Services (Railway add-ons):
  → PostgreSQL (Railway plugin)
  → Redis (Railway plugin)
```

### Environment Variables (Railway)

```bash
# Copy these exactly to Railway service variables:
DATABASE_URL=postgresql://...  # auto-injected by Railway Postgres plugin
REDIS_URL=redis://...          # auto-injected by Railway Redis plugin
SECRET_KEY=<openssl rand -hex 32>
FERNET_KEY=<python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())">
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-app.vercel.app
R2_ENDPOINT_URL=https://<account>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<from Cloudflare dashboard>
R2_SECRET_ACCESS_KEY=<from Cloudflare dashboard>
R2_BUCKET_NAME=mailflow-attachments
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/backend-deploy.yml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      - name: Deploy to Railway
        run: railway up --service api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Railway Rollback Strategy

```bash
# If deployment breaks production:
railway rollback --service api  # reverts to previous deployment

# If DB migration breaks:
alembic downgrade -1  # revert last migration
# Then fix migration file
alembic upgrade head  # re-run
```

---

## SECTION 8 — DELIVERABILITY STRATEGY

### Onboarding Checklist (Show in UI on First Login)

```
□ Step 1: Connect Gmail with App Password (not your real password)
  → Link: "How to create Gmail App Password" (open Google guide)

□ Step 2: Set up SPF record on your domain
  → Show copy-paste DNS record: v=spf1 include:_spf.google.com ~all

□ Step 3: Enable DKIM in Google Workspace Admin
  → Only for Google Workspace users (not personal Gmail)

□ Step 4: Add DMARC record
  → Show copy-paste: v=DMARC1; p=none; rua=mailto:postmaster@yourdomain.com

□ Step 5: Start small — send first 50 emails before large campaigns
  → "This helps establish your sender reputation"
```

### Sending Limits by Plan (Enforced in Worker)

```python
PLAN_LIMITS = {
    "starter": {
        "daily_cap": 200,
        "min_delay_seconds": 4,
        "max_recipients_per_campaign": 2000,
        "smtp_accounts": 1
    },
    "growth": {
        "daily_cap": 1000,
        "min_delay_seconds": 3,
        "max_recipients_per_campaign": 15000,
        "smtp_accounts": 3
    },
    "agency": {
        "daily_cap": 5000,
        "min_delay_seconds": 2,
        "max_recipients_per_campaign": 50000,
        "smtp_accounts": 10
    }
}
```

### Bounce Protection (Add in Worker)

```python
# If bounce rate exceeds 5% in a single campaign, pause it
sent = campaign.sent_count
failed = campaign.failed_count
total_processed = sent + failed

if total_processed > 20:  # minimum sample size
    bounce_rate = failed / total_processed
    if bounce_rate > 0.05:
        campaign.status = "paused"
        campaign.error_message = f"Paused: bounce rate {bounce_rate:.1%} exceeds 5%"
        db.commit()
        return  # stop dispatching more
```

---

## SECTION 9 — TESTING STRATEGY

### Unit Tests (pytest)

```python
# tests/test_csv_parser.py
def test_valid_csv():
    csv_content = b"email,name,company\nrahul@example.com,Rahul,Tata\n"
    result = parse_contact_file(csv_content, "test.csv")
    assert result["valid_count"] == 1
    assert result["valid"][0]["email"] == "rahul@example.com"

def test_invalid_email_rejected():
    csv_content = b"email,name\nnot-an-email,Rahul\n"
    result = parse_contact_file(csv_content, "test.csv")
    assert result["invalid_count"] == 1

def test_duplicate_detection():
    csv_content = b"email\ntest@example.com\ntest@example.com\n"
    result = parse_contact_file(csv_content, "test.csv")
    assert result["duplicate_count"] == 1
    assert result["valid_count"] == 1

# tests/test_template_renderer.py
def test_variable_substitution():
    html = "Hello {{name}} from {{company}}"
    subject = "Hi {{name}}"
    s, h = render_template(html, subject, {"name": "Rahul", "company": "Tata"})
    assert "Rahul" in h
    assert "Tata" in h

def test_missing_variable_renders_empty():
    html = "Hello {{name}} from {{unknown}}"
    s, h = render_template(html, "subj", {"name": "Rahul"})
    assert "Rahul" in h
    # unknown → empty string, no crash
```

### SMTP Mock Test

```python
# tests/test_smtp_service.py
from unittest.mock import patch, MagicMock
import smtplib

def test_smtp_connection_success():
    with patch('smtplib.SMTP') as mock_smtp:
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__ = lambda s: mock_server
        mock_smtp.return_value.__exit__ = MagicMock(return_value=False)
        
        result = test_smtp_connection("smtp.gmail.com", 587, "test@gmail.com", "password")
        assert result["success"] == True

def test_smtp_auth_failure():
    with patch('smtplib.SMTP') as mock_smtp:
        mock_smtp.return_value.login.side_effect = smtplib.SMTPAuthenticationError(535, b"bad auth")
        result = test_smtp_connection("smtp.gmail.com", 587, "test@gmail.com", "wrongpass")
        assert result["success"] == False
        assert "Authentication failed" in result["error"]
```

### Integration Test (API)

```python
# tests/test_auth.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login():
    # Register
    r = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "testpass123",
        "full_name": "Test User"
    })
    assert r.status_code == 201
    
    # Login
    r = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "testpass123"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()

def test_protected_endpoint_requires_auth():
    r = client.get("/api/v1/campaigns")
    assert r.status_code == 403
```

---

## SECTION 10 — MVP SCOPE DISCIPLINE

### MUST BUILD (Ship without these = not a product)

```
✅ User registration + login (JWT)
✅ SMTP connection with encryption + test
✅ CSV/Excel upload with validation
✅ Template editor (subject + HTML body with {{variables}})
✅ Campaign creation (link SMTP + contacts + template)
✅ Campaign launch (queued, 4s delay, daily cap)
✅ Email log (sent/failed/reason per recipient)
✅ PDF/DOCX attachment support
✅ Dashboard with campaign list
✅ Plan-based limits enforcement
```

### SHOULD BUILD (Add in Week 2 if time permits)

```
🔶 Google Sheets URL import
🔶 Campaign scheduling (send at specific time)
🔶 Domain health checker (SPF/DKIM/DMARC DNS lookup)
🔶 Download rejected contacts as CSV
🔶 Re-send failed recipients only
🔶 Campaign pause/cancel
```

### DO NOT BUILD (Will kill your launch velocity)

```
❌ Open tracking / click tracking
❌ Unsubscribe management system
❌ Email warmup / inbox rotation
❌ AI email generation
❌ Analytics dashboard / charts
❌ Team members / multi-user
❌ CRM integration
❌ Webhooks / public API
❌ White-labeling
❌ SMS / LinkedIn outreach
❌ A/B testing
❌ Sequences / follow-ups
❌ Lead database / contact finding
```

**Rule:** If a client hasn't asked for a feature 3+ times, it does not exist for MVP.

---

## SECTION 11 — PRODUCTION READINESS CHECKLIST

Run this before onboarding your first paying client:

### Infrastructure

- [ ] Railway services: api, worker, beat all healthy (green)
- [ ] Railway Postgres: accessible, `alembic upgrade head` run
- [ ] Railway Redis: accessible, `redis-cli PING` returns PONG
- [ ] Vercel: frontend deployed, env vars set
- [ ] Cloudflare R2: bucket created, test upload/download works
- [ ] Custom domain configured (API + frontend)
- [ ] SSL certificates active on both domains

### Security

- [ ] `FERNET_KEY` is in Railway env vars (not in codebase)
- [ ] `SECRET_KEY` is strong (32+ random hex chars)
- [ ] No `.env` file committed to git (check .gitignore)
- [ ] API docs disabled in production (`docs_url=None`)
- [ ] CORS only allows your Vercel domain
- [ ] Rate limiting active on auth endpoints
- [ ] Test: POST /auth/login 11 times → 12th should 429

### Core Flow End-to-End Test

- [ ] Register a new account → login works
- [ ] Connect Gmail SMTP with App Password → "connected" shows
- [ ] Upload a 10-row test CSV → validation shows correctly
- [ ] Create a template with `{{name}}` variable → preview shows name
- [ ] Launch campaign to 3 test email addresses → all received
- [ ] Check logs → sent: 3, failed: 0
- [ ] Verify emails landed in inbox (not spam) for Gmail → Gmail → custom domain

### Monitoring (Minimal)

- [ ] Railway service logs accessible (for debugging)
- [ ] Celery worker logs show task start/completion
- [ ] Set up Railway's built-in CPU/memory alerts
- [ ] Set up UptimeRobot (free) on /health endpoint → alert if down

### Backup

- [ ] Railway Postgres: enable automatic daily backups (Railway dashboard)
- [ ] Test restore procedure: download backup, restore to local Docker

---

## SECTION 12 — DAY-BY-DAY EXECUTION SCHEDULE

```
DAY 1 (Backend only)
AM: Phase 0 — Project setup, Docker, Railway deploy, health check working
PM: Phase 1 — Auth system complete, register/login/refresh tested
End of day: Push to GitHub, Railway auto-deploys, test from Postman

DAY 2 (Backend + Frontend parallel)
Backend AM: Phase 2 — SMTP service, encryption, test endpoint
Backend PM: Phase 2 — SMTP API endpoints, ownership checks
Frontend AM: Phase F1 — Next.js setup, auth pages, routing
Frontend PM: Phase F1 — API layer, TanStack Query, dashboard skeleton

DAY 3 (Backend + Frontend parallel)
Backend AM: Phase 3 — CSV parser, email validator
Backend PM: Phase 3 — Campaign creation API, template API
Frontend AM: Phase F2 — CsvUploader component, parse-csv integration
Frontend PM: Phase F2 — CampaignWizard steps 1-3

DAY 4 (Backend + Frontend parallel)
Backend: Phase 4 — Celery, Redis, send worker, daily caps
Frontend: Phase F3 — Review step, launch button, live log polling

DAY 5 (Integration)
AM: Connect frontend to real backend APIs end-to-end
PM: Fix all integration bugs, test complete campaign flow

DAY 6 (Polish)
AM: Error states, loading skeletons, form validation messages
PM: Mobile responsiveness, edge cases (empty states, 0 contacts, etc.)

DAY 7 (Deploy + Demo)
AM: Deploy to Railway + Vercel production
PM: End-to-end test with real Gmail account
Evening: Schedule demo calls with your 5 clients

DAYS 8–10 (Onboarding)
Client onboarding calls, bug fixes from real usage, quick iterations
```

---

## APPENDIX: CLAUDE CODE PROMPT TEMPLATES

Copy-paste these at the start of each session:

### Session: Auth System
```
I'm building MailFlow, a FastAPI email campaign SaaS.
Stack: FastAPI + SQLAlchemy 2.0 + PostgreSQL + Pydantic v2 + python-jose + passlib[bcrypt]
Current task: Build the auth system
Files needed: app/models/user.py, app/services/auth_service.py, app/api/v1/auth.py
Schema: [paste User model from this doc]
Requirements: JWT access token (15min), httpOnly refresh cookie (7 days), bcrypt rounds=12
Do NOT include: email verification, OAuth, 2FA (out of scope for MVP)
Generate: one file at a time, starting with the User model
```

### Session: SMTP Service
```
Context: MailFlow FastAPI app, auth system complete (JWT working)
Current task: SMTP credential management
Security requirement: Fernet encryption for passwords, NEVER return decrypted password in API
Test flow: receive credentials → test SMTP connection → encrypt → save → return masked response
Generate: app/services/encryption_service.py first, then app/services/smtp_service.py
```

### Session: Celery Worker
```
Context: MailFlow FastAPI app
Models done: User, SmtpCredential, Campaign, CampaignRecipient, Template, EmailLog
Current task: Celery email sending worker
Critical requirements:
  - Idempotency: check recipient.status before sending
  - Daily cap: check user.daily_send_count vs plan limit
  - 4 second delay between emails (countdown parameter)
  - Retry on connection errors, NOT on auth errors
  - Decrypt SMTP password in worker only, del after use
  - Log every attempt to email_logs table
Generate: app/workers/celery_app.py first, then app/workers/tasks/email_tasks.py
```

### Session: Campaign Wizard (Frontend)
```
Context: Next.js 15 + TypeScript + TailwindCSS + shadcn/ui + TanStack Query + React Hook Form + Zod
Backend API available at: /api/v1/campaigns/parse-csv, /api/v1/campaigns, /api/v1/templates, /api/v1/smtp
Current task: Multi-step campaign creation wizard
Steps: 1) SMTP check 2) CSV upload 3) Template select 4) Review & launch
State managed in parent CampaignWizard component, steps are child components
Generate: CampaignWizard.tsx with step state management first
```
