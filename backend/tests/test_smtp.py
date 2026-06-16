"""SMTP routes — no real SMTP server needed; we test the API surface."""

from fastapi.testclient import TestClient


def test_list_empty(client: TestClient, auth_headers):
    r = client.get("/smtp", headers=auth_headers)
    assert r.status_code == 200
    assert r.json() == []


def test_create_with_bogus_creds_rejected(client: TestClient, auth_headers):
    r = client.post(
        "/smtp",
        headers=auth_headers,
        json={
            "email": "test@example.com",
            "smtp_host": "smtp.nonexistent-host-for-test.invalid",
            "smtp_port": 587,
            "smtp_username": "user",
            "smtp_password": "secret",
        },
    )
    # Should fail to connect, return 400 with helpful message
    assert r.status_code == 400
    assert "connection failed" in r.json()["detail"].lower() or "authentication failed" in r.json()["detail"].lower()


def test_delete_nonexistent(client: TestClient, auth_headers):
    r = client.delete(
        "/smtp/00000000-0000-0000-0000-000000000000", headers=auth_headers
    )
    assert r.status_code == 404


def test_smtp_requires_auth(client: TestClient):
    assert client.get("/smtp").status_code == 401
    assert client.post("/smtp", json={}).status_code == 401
