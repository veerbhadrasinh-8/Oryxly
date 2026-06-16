"""Worker-layer unit tests — variable rendering + the helpers, not the SMTP
session itself (which needs a real server)."""

import uuid

from app.models.campaign import CampaignStatus, RecipientStatus
from app.services.templates import (
    extract_variables,
    render,
    sample_data,
    unknown_variables,
)


def test_extract_variables_dedupes_and_orders():
    vars_ = extract_variables(
        "Hi {{name}} at {{company}}",
        "<p>{{name}} - {{email}}</p>",
    )
    assert vars_ == ["name", "company", "email"]


def test_extract_handles_whitespace_in_braces():
    assert extract_variables("{{ name }}") == ["name"]
    assert extract_variables("{{  company  }}") == ["company"]


def test_unknown_variables_flags_typos():
    assert unknown_variables(["name", "compny", "email"]) == ["compny"]


def test_render_substitutes_and_handles_missing():
    out = render("Hi {{name}}, missing: {{unknown}}", {"name": "Alice"})
    assert out == "Hi Alice, missing: "


def test_render_handles_none_values():
    out = render("Name: {{name}}", {"name": None})
    assert out == "Name: "


def test_render_preserves_non_variable_text():
    out = render("<p>hello world</p>", {})
    assert out == "<p>hello world</p>"


def test_sample_data_has_known_vars():
    s = sample_data()
    assert set(s.keys()) == {"name", "company", "email"}


def test_campaign_status_enum_values():
    """The spec's exact set — guard against accidental rename."""
    assert {s.value for s in CampaignStatus} == {
        "draft", "queued", "running", "completed", "failed", "cancelled"
    }


def test_recipient_status_enum_values():
    assert {s.value for s in RecipientStatus} == {
        "pending", "sent", "failed", "bounced"
    }


def test_uuid_serialization_roundtrip():
    """Defensive: UUIDs are how we pass IDs between API and worker."""
    u = uuid.uuid4()
    assert uuid.UUID(str(u)) == u
