"""Template variable extraction + safe rendering.

Variables use Jinja-style `{{ var }}` syntax but we do NOT use Jinja -
substitution is pure string replacement so users can't smuggle control flow
into the html_body. Whitespace inside the braces is tolerated.
"""

from __future__ import annotations

import re

KNOWN_VARIABLES: set[str] = {"name", "company", "email", "phone"}

# Matches normalized variable names: lowercase letters, digits, underscores.
_VAR_PATTERN = re.compile(r"\{\{\s*([a-z][a-z0-9_]*)\s*\}\}")


def normalize_var(col: str) -> str:
    """Convert a contact column name to a lowercase_underscore variable name.

    'Company Name' → 'company_name', 'Email Address' → 'email_address'.
    Must match the TypeScript normalizeVar() in the frontend wizard exactly.
    """
    cleaned = col.strip().lower().replace(" ", "_")
    return re.sub(r"[^a-z0-9_]", "", cleaned)


def extract_variables(*texts: str) -> list[str]:
    """Return unique variable names referenced across the given strings, in first-seen order."""
    seen: dict[str, None] = {}
    for text in texts:
        if not text:
            continue
        for match in _VAR_PATTERN.finditer(text):
            seen.setdefault(match.group(1), None)
    return list(seen.keys())


def render(text: str, data: dict[str, str | None]) -> str:
    """Substitute {{ var }} tokens with values from `data`. Missing/None → empty string."""

    def replace(m: re.Match[str]) -> str:
        val = data.get(m.group(1))
        return "" if val is None else str(val)

    return _VAR_PATTERN.sub(replace, text or "")


def unknown_variables(variables: list[str]) -> list[str]:
    """Variables referenced that aren't in our supported builtin set (backward compat check)."""
    return [v for v in variables if v not in KNOWN_VARIABLES]


def sample_data() -> dict[str, str]:
    """Default sample row for template previews (backward compat)."""
    return {
        "name": "Alice Sharma",
        "company": "Acme Exports",
        "email": "alice@acme.com",
        "phone": "",
    }


def build_contact_render_data(contact: object) -> dict[str, str]:
    """Build a render-ready variable dict from a Contact ORM object.

    Builtin fields are mapped directly; custom_data keys are normalized so
    'Company Name' becomes 'company_name' etc. Builtin names always win on
    collision.
    """
    data: dict[str, str] = {}
    # Custom data first so builtins override
    custom = getattr(contact, "custom_data", None) or {}
    for k, v in custom.items():
        if v is not None:
            data[normalize_var(k)] = str(v)
    # Builtins
    data["email"] = getattr(contact, "email", "") or ""
    data["name"] = getattr(contact, "name", "") or ""
    data["company"] = getattr(contact, "company", "") or ""
    data["phone"] = getattr(contact, "phone", "") or ""
    return data
