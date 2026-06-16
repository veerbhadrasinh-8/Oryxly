"""Shared fixtures.

We use the running Postgres but each test gets its own user (random email),
so suites don't collide. The Celery worker stays connected to the real
broker — tests that exercise the worker assert against status transitions.
"""

from __future__ import annotations

import os
import uuid

import pytest
from fastapi.testclient import TestClient

# Ensure required env is set before importing the app (config singleton)
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://mailflow:mailflow@postgres:5432/mailflow")
os.environ.setdefault("REDIS_URL", "redis://redis:6379/0")
os.environ.setdefault("SECRET_KEY", "test-secret-key-32-chars-padding-padding")
os.environ.setdefault("FERNET_KEY", "gJ_0D_B_kCGxMYdokUuE8dkunViEwIbhu0Ors_b79BQ=")
# Bypass the per-IP rate limiter — tests burst many auth calls in one IP.
os.environ["RATE_LIMIT_DISABLED"] = "1"

from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def user_credentials() -> dict:
    """A fresh email each test, so tests can register without collisions."""
    return {
        "full_name": "Test User",
        "email": f"test-{uuid.uuid4().hex[:8]}@mailflow-tests.com",
        "password": "TestPass123!",
    }


@pytest.fixture
def registered_user(client: TestClient, user_credentials: dict) -> dict:
    """A registered + logged-in user. Returns the credentials + access token."""
    r = client.post("/auth/register", json=user_credentials)
    assert r.status_code in (201, 409), r.text  # 409 acceptable if rerun
    r = client.post(
        "/auth/login",
        json={"email": user_credentials["email"], "password": user_credentials["password"]},
    )
    assert r.status_code == 200, r.text
    return {**user_credentials, "token": r.json()["data"]["access_token"]}


@pytest.fixture
def auth_headers(registered_user: dict) -> dict:
    return {"Authorization": f"Bearer {registered_user['token']}"}
