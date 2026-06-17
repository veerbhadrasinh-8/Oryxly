"""Celery tasks: `start_campaign` orchestrates per-recipient `send_recipient`s.

Design:
- `start_campaign(campaign_id)` runs once per launch. It flips queued→running
  and schedules a `send_recipient` task for each pending recipient with a
  countdown that staggers sends by ≥ MIN_DELAY_SECONDS (business rule: 4s).
- Each `send_recipient(recipient_id)` is independent — own DB session, own
  retry policy, own SMTP connection. If a recipient errors, it retries up
  to MAX_ATTEMPTS times with exponential backoff, then marks failed.
- After every send (success or terminal failure) we check whether the
  campaign is done and flip it to completed/failed accordingly.
- Cancellation is honored cooperatively: before each send the task checks
  the campaign's current status and bails if it's no longer running/queued.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from uuid import UUID

from celery import shared_task
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

# Importing celery_app here registers it as Celery's default app so that
# shared_task lookups (from the API process) target our Redis broker
# instead of falling back to the amqp default.
from app.workers.celery_app import celery_app  # noqa: F401
from app.core.crypto import decrypt
from app.repositories import attachments as att_repo
from app.services.storage import get_storage
from app.core.plans import effective_monthly_email_limit
from app.core.rate_limits import release_send_slot, reserve_send_slot
from app.database.session import SessionLocal
from app.models.campaign import (
    Campaign,
    CampaignRecipient,
    CampaignStatus,
    RecipientStatus,
)
from app.models.contact import Contact
from app.models.smtp_account import SmtpAccount
from app.models.template import Template
from app.models.user import User
from app.services.smtp import SmtpCreds, SmtpError, send_message
from app.services.templates import render

log = logging.getLogger(__name__)

# Business rules
MIN_DELAY_SECONDS = 4
MAX_ATTEMPTS = 3
TERMINAL_CAMPAIGN_STATUSES = {
    CampaignStatus.CANCELLED,
    CampaignStatus.COMPLETED,
    CampaignStatus.FAILED,
}


# ---- orchestrator ----------------------------------------------------------


@shared_task(name="campaigns.start_campaign")
def start_campaign(campaign_id: str) -> dict:
    """Read pending recipients and fan out send tasks with 4s pacing."""
    db: Session = SessionLocal()
    try:
        c = db.get(Campaign, UUID(campaign_id))
        if c is None:
            return {"ok": False, "reason": "campaign not found"}
        if c.status not in (CampaignStatus.QUEUED, CampaignStatus.DRAFT):
            return {"ok": False, "reason": f"status is {c.status.value}, not launchable"}

        # Transition queued → running so the UI / cancel paths can see progress.
        c.status = CampaignStatus.RUNNING
        if c.started_at is None:
            c.started_at = datetime.now(timezone.utc)
        db.commit()

        pending = list(
            db.execute(
                select(CampaignRecipient.id).where(
                    CampaignRecipient.campaign_id == c.id,
                    CampaignRecipient.status == RecipientStatus.PENDING,
                )
            ).scalars().all()
        )
        log.info("start_campaign %s: dispatching %d recipients", campaign_id, len(pending))

        if not pending:
            _maybe_finalize(db, c.id)
            return {"ok": True, "dispatched": 0}

        for i, rid in enumerate(pending):
            send_recipient.apply_async(args=[str(rid)], countdown=i * MIN_DELAY_SECONDS)

        return {"ok": True, "dispatched": len(pending)}
    finally:
        db.close()


# ---- per-recipient ---------------------------------------------------------


@shared_task(
    name="campaigns.send_recipient",
    bind=True,
    # We do NOT use autoretry_for — that path bypasses our MaxRetriesExceededError
    # handler so a recipient that exhausts all retries would sit in PENDING
    # forever. Manual self.retry() lets us catch terminal failure and
    # _mark_failed correctly.
    default_retry_delay=4,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
    max_retries=MAX_ATTEMPTS - 1,  # 1 initial + (MAX_ATTEMPTS-1) retries
    acks_late=True,
)
def send_recipient(self, recipient_id: str) -> dict:
    db: Session = SessionLocal()
    try:
        rec = db.get(CampaignRecipient, UUID(recipient_id))
        if rec is None:
            return {"ok": False, "reason": "recipient not found"}
        if rec.status != RecipientStatus.PENDING:
            return {"ok": True, "reason": f"already {rec.status.value}"}

        c = db.get(Campaign, rec.campaign_id)
        if c is None or c.status in TERMINAL_CAMPAIGN_STATUSES:
            log.info("send_recipient %s: campaign %s is terminal, skipping", recipient_id, c.status if c else "missing")
            return {"ok": True, "reason": "campaign no longer active"}

        contact = db.get(Contact, rec.contact_id)
        tpl = db.get(Template, c.template_id)
        smtp = db.get(SmtpAccount, c.smtp_account_id)
        user = db.get(User, c.user_id)
        if not (contact and tpl and smtp and user):
            _mark_failed(db, rec, c, "missing config (contact/template/smtp/user)")
            _maybe_finalize(db, c.id)
            return {"ok": False, "reason": "missing config"}

        # Render template with per-contact data
        data = {
            "name": contact.name or "",
            "company": contact.company or "",
            "email": contact.email,
        }
        subject = render(tpl.subject, data)
        html_body = render(tpl.html_body, data)

        # Build creds and send
        creds = SmtpCreds(
            host=smtp.smtp_host,
            port=smtp.smtp_port,
            username=smtp.smtp_username,
            password=decrypt(smtp.encrypted_password),
            from_email=smtp.email,
        )

        rec.attempt_count += 1
        rec.last_attempt_at = datetime.now(timezone.utc)
        db.commit()

        # Load campaign attachments (if any). Read from storage once per
        # task — small files, infrequent fetches.
        attachments_payload: list[dict] = []
        try:
            storage = get_storage()
            for att in att_repo.list_for_campaign(db, c.id):
                try:
                    content = storage.get(att.storage_key)
                except FileNotFoundError:
                    log.warning("attachment %s storage key missing — skipping", att.id)
                    continue
                attachments_payload.append({
                    "filename": att.original_name,
                    "mime": att.mime_type,
                    "content": content,
                })
        except Exception as exc:  # noqa: BLE001 — storage failure shouldn't crash send
            log.warning("send_recipient %s: failed loading attachments: %s", recipient_id, exc)

        # Monthly-cap reservation (per-user). Reserve a slot atomically right
        # before sending so concurrent workers can't overshoot the cap, and so
        # no work between here and the send can leak a reserved slot. If the
        # month is full, reschedule the recipient a day later as a *fresh*
        # task — we don't use self.retry() because that would consume the SMTP
        # retry budget (max_retries=2). A full cap is an environmental wait,
        # not a delivery failure.
        monthly_limit = effective_monthly_email_limit(user)
        if not reserve_send_slot(str(user.id), monthly_limit, want=1):
            log.info("send_recipient %s: monthly cap reached, rescheduling +1d", recipient_id)
            send_recipient.apply_async(args=[recipient_id], countdown=24 * 60 * 60)
            return {"ok": True, "reason": "rescheduled — monthly cap"}

        try:
            send_message(
                creds,
                to_email=contact.email,
                subject=subject,
                html_body=html_body,
                attachments=attachments_payload,
            )
        except SmtpError as exc:
            rec.error_message = str(exc)[:1000]
            db.commit()
            log.warning(
                "send_recipient %s: SMTP error attempt %d/%d: %s",
                recipient_id, rec.attempt_count, MAX_ATTEMPTS, exc,
            )
            # Explicit retry-budget check — clearer than catching
            # MaxRetriesExceededError and survives any future change
            # to self.retry()'s exception semantics.
            #
            # Release the reserved monthly slot: this attempt did not deliver.
            # On retry the retried task re-reserves; on terminal failure the
            # slot is freed so a failed send never counts against the cap.
            release_send_slot(str(user.id))
            if self.request.retries >= self.max_retries:
                _mark_failed(db, rec, c, str(exc))
                _maybe_finalize(db, c.id)
                return {"ok": False, "reason": "max retries exceeded"}
            # Schedule next retry with exponential backoff (4s, 8s, 16s caps at 60s)
            delay = min(MIN_DELAY_SECONDS * (2 ** self.request.retries), 60)
            raise self.retry(exc=exc, countdown=delay)

        # Success
        rec.status = RecipientStatus.SENT
        rec.sent_at = datetime.now(timezone.utc)
        rec.error_message = None
        db.execute(
            update(Campaign)
            .where(Campaign.id == c.id)
            .values(sent_count=Campaign.sent_count + 1)
        )
        db.commit()
        # Monthly slot already reserved before the send; nothing to increment.
        log.info("send_recipient %s: SENT to %s", recipient_id, contact.email)

        _maybe_finalize(db, c.id)
        return {"ok": True}
    finally:
        db.close()


# ---- helpers ---------------------------------------------------------------


def _mark_failed(db: Session, rec: CampaignRecipient, c: Campaign, reason: str) -> None:
    rec.status = RecipientStatus.FAILED
    rec.error_message = reason[:1000]
    db.execute(
        update(Campaign)
        .where(Campaign.id == c.id)
        .values(failed_count=Campaign.failed_count + 1)
    )
    db.commit()


def _maybe_finalize(db: Session, campaign_id: UUID) -> None:
    """If no recipients are pending, flip the campaign to completed/failed.

    Counts come from fresh SQL, never the ORM identity map — after raw
    UPDATE statements the cached `c.sent_count` is stale, which previously
    caused 1-recipient campaigns to be marked FAILED even though their
    only send succeeded.
    """
    pending = db.execute(
        select(func.count())
        .select_from(CampaignRecipient)
        .where(
            CampaignRecipient.campaign_id == campaign_id,
            CampaignRecipient.status == RecipientStatus.PENDING,
        )
    ).scalar_one()
    if pending > 0:
        return

    sent = db.execute(
        select(func.count())
        .select_from(CampaignRecipient)
        .where(
            CampaignRecipient.campaign_id == campaign_id,
            CampaignRecipient.status == RecipientStatus.SENT,
        )
    ).scalar_one()
    failed = db.execute(
        select(func.count())
        .select_from(CampaignRecipient)
        .where(
            CampaignRecipient.campaign_id == campaign_id,
            CampaignRecipient.status == RecipientStatus.FAILED,
        )
    ).scalar_one()

    c = db.get(Campaign, campaign_id)
    if c is None or c.status in TERMINAL_CAMPAIGN_STATUSES:
        return
    new_status = CampaignStatus.COMPLETED if sent > 0 else CampaignStatus.FAILED
    c.status = new_status
    c.completed_at = datetime.now(timezone.utc)
    db.commit()
    log.info(
        "campaign %s finalized as %s (sent=%d failed=%d)",
        campaign_id, new_status.value, sent, failed,
    )
