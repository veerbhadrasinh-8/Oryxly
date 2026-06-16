from datetime import datetime, timedelta, timezone
from typing import Literal

import bcrypt
from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()

ALGORITHM = "HS256"
TokenType = Literal["access", "refresh"]

# bcrypt has a 72-byte password ceiling; truncate to be safe.
_BCRYPT_MAX = 72


def hash_password(password: str) -> str:
    pw = password.encode("utf-8")[:_BCRYPT_MAX]
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    pw = password.encode("utf-8")[:_BCRYPT_MAX]
    try:
        return bcrypt.checkpw(pw, password_hash.encode("utf-8"))
    except ValueError:
        return False


def _create_token(subject: str, token_type: TokenType, expires_delta: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_access_token(user_id: str) -> str:
    return _create_token(user_id, "access", timedelta(minutes=settings.ACCESS_TOKEN_TTL_MIN))


def create_refresh_token(user_id: str) -> str:
    return _create_token(user_id, "refresh", timedelta(days=settings.REFRESH_TOKEN_TTL_DAYS))


def decode_token(token: str, expected_type: TokenType) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise ValueError("invalid token") from exc
    if payload.get("type") != expected_type:
        raise ValueError("wrong token type")
    sub = payload.get("sub")
    if not sub:
        raise ValueError("missing subject")
    return sub
