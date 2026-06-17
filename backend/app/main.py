from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.api.admin import router as admin_router
from app.api.attachments import router as attachments_router
from app.api.auth import router as auth_router
from app.api.campaigns import router as campaigns_router
from app.api.contacts import router as contacts_router
from app.api.dashboard import router as dashboard_router
from app.api.logs import router as logs_router
from app.api.smtp import router as smtp_router
from app.api.templates import router as templates_router
from app.core.config import get_settings
from app.core.redis_client import redis_client
from app.database.session import engine

settings = get_settings()

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Sensible defaults for an API-only backend. The frontend has its own
    CSP via Next.js — these headers protect the API surface from being
    embedded, MIME-sniffed, or leaking referrer data."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        response.headers.setdefault("Permissions-Policy", "interest-cohort=()")
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(smtp_router)
app.include_router(contacts_router)
app.include_router(templates_router)
app.include_router(campaigns_router)
app.include_router(logs_router)
app.include_router(dashboard_router)
app.include_router(attachments_router)


@app.get("/health")
def health() -> dict:
    db_ok = False
    redis_ok = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    try:
        redis_ok = bool(redis_client.ping())
    except Exception:
        redis_ok = False
    return {"status": "ok", "db": db_ok, "redis": redis_ok, "env": settings.ENV}


@app.get("/")
def root() -> dict:
    return {"name": settings.APP_NAME, "docs": "/docs"}
