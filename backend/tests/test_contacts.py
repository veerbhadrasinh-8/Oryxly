"""Contacts: list CRUD + upload validation."""

import io

from fastapi.testclient import TestClient


def test_list_empty(client: TestClient, auth_headers):
    r = client.get("/contact-lists", headers=auth_headers)
    assert r.status_code == 200
    assert r.json() == []


def test_upload_csv_with_validation(client: TestClient, auth_headers):
    csv = (
        b"email,name,company\n"
        b"alice@acme.com,Alice,Acme\n"
        b"ALICE@acme.com,Alice 2,Acme\n"  # case-insensitive dup
        b"bob@globex.co,Bob,Globex\n"
        b"not-an-email,Bad,Bad\n"
        b",,nothing\n"
    )
    r = client.post(
        "/contacts/upload",
        headers=auth_headers,
        files={"file": ("contacts.csv", io.BytesIO(csv), "text/csv")},
        data={"name": "Test list"},
    )
    assert r.status_code == 200, r.text
    stats = r.json()["data"]["stats"]
    assert stats["valid"] == 2
    assert stats["invalid"] == 2
    assert stats["duplicates"] == 1


def test_upload_bad_extension_rejected(client: TestClient, auth_headers):
    r = client.post(
        "/contacts/upload",
        headers=auth_headers,
        files={"file": ("bad.txt", io.BytesIO(b"hello"), "text/plain")},
    )
    assert r.status_code == 400
    assert "unsupported file type" in r.json()["detail"]


def test_upload_empty_file_rejected(client: TestClient, auth_headers):
    r = client.post(
        "/contacts/upload",
        headers=auth_headers,
        files={"file": ("empty.csv", io.BytesIO(b""), "text/csv")},
    )
    assert r.status_code == 400


def test_list_then_detail(client: TestClient, auth_headers):
    csv = b"email\nx@y.com\n"
    client.post(
        "/contacts/upload",
        headers=auth_headers,
        files={"file": ("a.csv", io.BytesIO(csv), "text/csv")},
        data={"name": "Detail test"},
    )
    lists = client.get("/contact-lists", headers=auth_headers).json()
    assert any(l["name"] == "Detail test" for l in lists)
    list_id = next(l["id"] for l in lists if l["name"] == "Detail test")
    detail = client.get(f"/contact-lists/{list_id}", headers=auth_headers).json()
    assert detail["valid_contacts"] == 1
    assert detail["contacts"][0]["email"] == "x@y.com"


def test_cross_tenant_isolation(client: TestClient, auth_headers, user_credentials, seed_invitation):
    # Make a list on user A
    csv = b"email\na@a.com\n"
    upload = client.post(
        "/contacts/upload",
        headers=auth_headers,
        files={"file": ("a.csv", io.BytesIO(csv), "text/csv")},
        data={"name": "A's list"},
    ).json()
    list_id = upload["data"]["list_id"]

    # Register user B
    import uuid as _uuid
    b_creds = {
        "full_name": "Other",
        "email": f"other-{_uuid.uuid4().hex[:6]}@mailflow-tests.com",
        "password": "TestPass123!",
    }
    seed_invitation(b_creds["email"])
    client.post("/auth/register", json=b_creds)
    b_login = client.post(
        "/auth/login",
        json={"email": b_creds["email"], "password": b_creds["password"]},
    ).json()
    b_headers = {"Authorization": f"Bearer {b_login['data']['access_token']}"}

    # B cannot read A's list
    assert client.get(f"/contact-lists/{list_id}", headers=b_headers).status_code == 404
    assert client.delete(f"/contact-lists/{list_id}", headers=b_headers).status_code == 404
    # B sees their own (empty) list
    assert client.get("/contact-lists", headers=b_headers).json() == []
