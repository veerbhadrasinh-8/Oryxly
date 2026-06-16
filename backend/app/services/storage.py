"""Pluggable object storage.

LocalStorage writes to the host filesystem under a per-user prefix and is the
default for dev — no external services required, the worker reads the file
straight from disk.

R2Storage (Cloudflare R2 via S3-compatible boto3) is selected when
STORAGE_BACKEND=r2. It uses the env keys already present in .env.example
(R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET).

Both implementations satisfy the same Protocol so the rest of the app
doesn't know or care which is in use.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import BinaryIO, Protocol
from uuid import UUID, uuid4

from app.core.config import get_settings


class Storage(Protocol):
    """One blob store, no streaming complexity. ~10 MB max per file."""

    def put(self, *, user_id: UUID, original_name: str, content: bytes) -> str:
        """Persist content; return an opaque key the caller stores in the DB."""

    def get(self, key: str) -> bytes:
        """Fetch content by key. Raises FileNotFoundError if missing."""

    def delete(self, key: str) -> None:
        """Remove the underlying object. Idempotent — missing is OK."""


# ---------- local FS implementation ----------------------------------------


class LocalStorage:
    def __init__(self, root: str = "/app/storage/attachments") -> None:
        self._root = Path(root)
        self._root.mkdir(parents=True, exist_ok=True)

    def put(self, *, user_id: UUID, original_name: str, content: bytes) -> str:
        suffix = ""
        if "." in original_name:
            suffix = "." + original_name.rsplit(".", 1)[-1].lower()
            # Defensive: cap suffix length so a pathological filename can't blow it up
            suffix = suffix[:16]
        # Per-user dir keeps blast radius small if the FS ever needs scanning
        user_dir = self._root / str(user_id)
        user_dir.mkdir(parents=True, exist_ok=True)
        key = f"{user_id}/{uuid4()}{suffix}"
        (self._root / key).write_bytes(content)
        return key

    def get(self, key: str) -> bytes:
        path = self._root / key
        return path.read_bytes()

    def delete(self, key: str) -> None:
        path = self._root / key
        try:
            path.unlink()
        except FileNotFoundError:
            pass  # idempotent


# ---------- R2 (S3-compatible) implementation ------------------------------


class R2Storage:
    """Lazy-loads boto3 only when actually used so the dev path doesn't pay
    the import cost."""

    def __init__(self) -> None:
        s = get_settings()
        try:
            import boto3  # type: ignore
        except ImportError as exc:
            raise RuntimeError(
                "STORAGE_BACKEND=r2 selected but boto3 isn't installed. "
                "Run: uv add boto3"
            ) from exc

        self._bucket = os.environ.get("R2_BUCKET") or ""
        if not self._bucket:
            raise RuntimeError("R2_BUCKET env not set")

        self._client = boto3.client(
            "s3",
            endpoint_url=os.environ.get("R2_ENDPOINT"),
            aws_access_key_id=os.environ.get("R2_ACCESS_KEY"),
            aws_secret_access_key=os.environ.get("R2_SECRET_KEY"),
            region_name="auto",
        )
        _ = s  # silence unused if config not needed

    def put(self, *, user_id: UUID, original_name: str, content: bytes) -> str:
        suffix = ""
        if "." in original_name:
            suffix = "." + original_name.rsplit(".", 1)[-1].lower()
            suffix = suffix[:16]
        key = f"attachments/{user_id}/{uuid4()}{suffix}"
        self._client.put_object(Bucket=self._bucket, Key=key, Body=content)
        return key

    def get(self, key: str) -> bytes:
        obj = self._client.get_object(Bucket=self._bucket, Key=key)
        return obj["Body"].read()

    def delete(self, key: str) -> None:
        try:
            self._client.delete_object(Bucket=self._bucket, Key=key)
        except Exception:
            pass


# ---------- factory --------------------------------------------------------


_storage_instance: Storage | None = None


def get_storage() -> Storage:
    """Process-wide singleton. Backend chosen by STORAGE_BACKEND env."""
    global _storage_instance
    if _storage_instance is not None:
        return _storage_instance
    backend = (os.environ.get("STORAGE_BACKEND") or "local").lower()
    if backend == "r2":
        _storage_instance = R2Storage()
    else:
        _storage_instance = LocalStorage()
    return _storage_instance
