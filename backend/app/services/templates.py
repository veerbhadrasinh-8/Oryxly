"""Template variable extraction + safe rendering.

Variables use Jinja-style `{{ var }}` syntax but we do NOT use Jinja —
substitution is pure string replacement so users can't smuggle control flow
into the html_body. Whitespace inside the braces is tolerated.
"""

from __future__ import annotations

import re

# Per spec the supported variables are {{name}}, {{company}}, {{email}}.
# Phase 6+ may expand to {{phone}} or custom_data keys. For now we only
# *recognise* (and render) these three; anything else is flagged at create
# time so the user notices typos.
KNOWN_VARIABLES: set[str] = {"name", "company", "email"}

_VAR_PATTERN = re.compile(r"\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}")


def extract_variables(*texts: str) -> list[str]:
    """Return the unique variable names referenced across the given strings,
    preserving first-seen order."""
    seen: dict[str, None] = {}  # ordered set
    for text in texts:
        if not text:
            continue
        for match in _VAR_PATTERN.finditer(text):
            seen.setdefault(match.group(1), None)
    return list(seen.keys())


def unknown_variables(variables: list[str]) -> list[str]:
    """Variables referenced that aren't in our supported set."""
    return [v for v in variables if v not in KNOWN_VARIABLES]


def render(text: str, data: dict[str, str | None]) -> str:
    """Substitute {{ var }} tokens with values from `data`. Missing/None
    values become empty string. Whitespace inside braces is allowed."""

    def replace(m: re.Match[str]) -> str:
        key = m.group(1)
        val = data.get(key)
        return "" if val is None else str(val)

    return _VAR_PATTERN.sub(replace, text or "")


def sample_data() -> dict[str, str]:
    """Default sample row for previews when the user hasn't picked a contact."""
    return {
        "name": "Alice Sharma",
        "company": "Acme Exports",
        "email": "alice@acme.com",
    }
