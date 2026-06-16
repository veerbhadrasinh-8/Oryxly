"""Templates: CRUD, variable extraction, preview, unknown-variable detection."""

from fastapi.testclient import TestClient


def test_create_extracts_variables(client: TestClient, auth_headers):
    r = client.post(
        "/templates",
        headers=auth_headers,
        json={
            "name": "Test tpl",
            "subject": "Hi {{name}} at {{company}}",
            "html_body": "<p>Hi {{name}}, your email is {{email}}.</p>",
        },
    )
    assert r.status_code == 201, r.text
    tid = r.json()["template_id"]

    detail = client.get(f"/templates/{tid}", headers=auth_headers).json()
    vars_ = set(detail["variables"])
    assert vars_ == {"name", "company", "email"}
    assert detail["unknown_variables"] == []


def test_unknown_variables_flagged(client: TestClient, auth_headers):
    r = client.post(
        "/templates",
        headers=auth_headers,
        json={
            "name": "Bad vars",
            "subject": "Hi {{name}} at {{nonexistent_var}}",
            "html_body": "<p>{{another_unknown}}</p>",
        },
    )
    tid = r.json()["template_id"]
    detail = client.get(f"/templates/{tid}", headers=auth_headers).json()
    assert set(detail["unknown_variables"]) == {"nonexistent_var", "another_unknown"}


def test_preview_substitutes(client: TestClient, auth_headers):
    r = client.post(
        "/templates",
        headers=auth_headers,
        json={
            "name": "Preview",
            "subject": "Hi {{name}}",
            "html_body": "<p>From {{company}}</p>",
        },
    )
    tid = r.json()["template_id"]
    preview = client.post(
        f"/templates/{tid}/preview",
        headers=auth_headers,
        json={"name": "Bob", "company": "Globex"},
    ).json()
    assert preview["subject"] == "Hi Bob"
    assert "Globex" in preview["html_body"]


def test_update_re_extracts_variables(client: TestClient, auth_headers):
    r = client.post(
        "/templates",
        headers=auth_headers,
        json={"name": "T", "subject": "{{name}}", "html_body": "x"},
    )
    tid = r.json()["template_id"]
    client.put(
        f"/templates/{tid}",
        headers=auth_headers,
        json={"subject": "{{company}} + {{email}}"},
    )
    detail = client.get(f"/templates/{tid}", headers=auth_headers).json()
    assert set(detail["variables"]) == {"company", "email"}


def test_delete_template(client: TestClient, auth_headers):
    r = client.post(
        "/templates",
        headers=auth_headers,
        json={"name": "To delete", "subject": "x", "html_body": "x"},
    )
    tid = r.json()["template_id"]
    assert client.delete(f"/templates/{tid}", headers=auth_headers).status_code == 200
    assert client.get(f"/templates/{tid}", headers=auth_headers).status_code == 404
