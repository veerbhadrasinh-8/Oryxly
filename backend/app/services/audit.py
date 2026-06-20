"""Audit log writer - best-effort, never blocks the user's request.

Failures are swallowed and logged. We never want a bookkeeping problem to
turn a successful action into a 500.
"""

from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from fastapi import Request
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog

log = logging.getLogger(__name__)


def record(
    db: Session,
    *,
    action: str,
    user_id: UUID | None = None,
    target_type: str | None = None,
    target_id: str | UUID | None = None,
    request: Request | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    try:
        ip = None
        if request and request.client:
            ip = request.client.host
        entry = AuditLog(
            user_id=user_id,
            action=action,
            target_type=target_type,
            target_id=str(target_id) if target_id else None,
            ip_address=ip,
            metadata_json=metadata,
        )
        db.add(entry)
        db.commit()
    except Exception as exc:  # noqa: BLE001 - never let logging crash a request
        log.warning("failed to write audit log for action=%s: %s", action, exc)
        try:
            db.rollback()
        except Exception:
            pass
