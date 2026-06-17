"""Production-safety guardrail in Settings.

The guardrail must block insecure config in production while staying inert
in development/test.
"""

import pytest
from cryptography.fernet import Fernet

from app.core.config import Settings

_GOOD_SECRET = "x" * 40
_GOOD_FERNET = Fernet.generate_key().decode()


def test_dev_boots_with_defaults():
    s = Settings(ENV="development")
    assert s.is_production is False


def test_prod_rejects_placeholder_secrets():
    with pytest.raises(ValueError, match="SECRET_KEY"):
        Settings(
            ENV="production",
            SECRET_KEY="change-me-in-prod",
            FERNET_KEY=_GOOD_FERNET,
            DEBUG=False,
            CORS_ORIGINS=["https://app.example.com"],
        )


def test_prod_rejects_debug_and_localhost_cors():
    with pytest.raises(ValueError) as exc:
        Settings(
            ENV="production",
            SECRET_KEY=_GOOD_SECRET,
            FERNET_KEY=_GOOD_FERNET,
            DEBUG=True,
            CORS_ORIGINS=["http://localhost:3000"],
        )
    msg = str(exc.value)
    assert "DEBUG" in msg
    assert "localhost" in msg


def test_prod_rejects_invalid_fernet_key():
    with pytest.raises(ValueError, match="FERNET_KEY"):
        Settings(
            ENV="production",
            SECRET_KEY=_GOOD_SECRET,
            FERNET_KEY="not-a-valid-fernet-key",
            DEBUG=False,
            CORS_ORIGINS=["https://app.example.com"],
        )


def test_prod_boots_with_secure_config():
    s = Settings(
        ENV="production",
        SECRET_KEY=_GOOD_SECRET,
        FERNET_KEY=_GOOD_FERNET,
        DEBUG=False,
        CORS_ORIGINS=["https://app.example.com"],
    )
    assert s.is_production is True
