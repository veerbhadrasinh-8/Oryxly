"""Authentication: register, login, refresh, /me, validation, rate limit."""

import uuid

from fastapi.testclient import TestClient


def test_register_then_login(client: TestClient):
    creds = {
        "full_name": "Reg User",
        "email": f"reg-{uuid.uuid4().hex[:8]}@mailflow-tests.com",
        "password": "GoodPass123!",
    }
    r = client.post("/auth/register", json=creds)
    assert r.status_code == 201
    body = r.json()
    assert body["success"] is True

    r = client.post("/auth/login", json={"email": creds["email"], "password": creds["password"]})
    assert r.status_code == 200
    data = r.json()["data"]
    assert "access_token" in data and "refresh_token" in data
    assert data["user"]["email"] == creds["email"]


def test_duplicate_register_rejected(client: TestClient, registered_user):
    r = client.post(
        "/auth/register",
        json={
            "full_name": "Dup",
            "email": registered_user["email"],
            "password": "AnotherPass1!",
        },
    )
    assert r.status_code == 409


def test_login_bad_password(client: TestClient, registered_user):
    r = client.post(
        "/auth/login",
        json={"email": registered_user["email"], "password": "WrongPass!"},
    )
    assert r.status_code == 401


def test_password_too_short_rejected(client: TestClient):
    r = client.post(
        "/auth/register",
        json={"full_name": "X", "email": "x@y.com", "password": "short"},
    )
    assert r.status_code == 422
    assert any("at least 8" in str(e).lower() for e in r.json()["detail"])


def test_invalid_email_rejected(client: TestClient):
    r = client.post(
        "/auth/register",
        json={"full_name": "X", "email": "notanemail", "password": "GoodPass123!"},
    )
    assert r.status_code == 422


def test_me_requires_auth(client: TestClient):
    assert client.get("/auth/me").status_code == 401
    assert client.get("/auth/me", headers={"Authorization": "Bearer junk"}).status_code == 401


def test_me_returns_self(client: TestClient, registered_user, auth_headers):
    r = client.get("/auth/me", headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == registered_user["email"]
    assert body["plan"] in {"starter", "growth", "agency"}


def test_refresh_returns_new_access_token(client: TestClient, registered_user):
    r = client.post(
        "/auth/login",
        json={"email": registered_user["email"], "password": registered_user["password"]},
    )
    refresh = r.json()["data"]["refresh_token"]
    r = client.post("/auth/refresh", json={"refresh_token": refresh})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_refresh_rejects_bad_token(client: TestClient):
    r = client.post("/auth/refresh", json={"refresh_token": "garbage"})
    assert r.status_code == 401
