import smtplib
import ssl
from dataclasses import dataclass
from email.message import EmailMessage


@dataclass
class SmtpCreds:
    host: str
    port: int
    username: str
    password: str
    from_email: str


class SmtpError(Exception):
    """Wraps any SMTP-level failure with a user-readable message."""


class SmtpRecipientError(SmtpError):
    """Raised when the SERVER accepted our auth but rejected the recipient.
    Distinct from generic SmtpError so the caller can avoid marking the
    sender account as broken — the creds are fine, the to_email is bad."""


def _connect(creds: SmtpCreds, timeout: float = 12.0) -> smtplib.SMTP:
    """Open a TLS SMTP connection. Caller must close it."""
    ctx = ssl.create_default_context()
    if creds.port == 465:
        client = smtplib.SMTP_SSL(creds.host, creds.port, timeout=timeout, context=ctx)
    else:
        client = smtplib.SMTP(creds.host, creds.port, timeout=timeout)
        client.ehlo()
        client.starttls(context=ctx)
        client.ehlo()
    return client


def verify_credentials(creds: SmtpCreds) -> None:
    """Open connection, authenticate, log out. Raises SmtpError on any failure."""
    try:
        client = _connect(creds)
    except (smtplib.SMTPException, OSError) as exc:
        raise SmtpError(f"connection failed: {exc}") from exc
    try:
        client.login(creds.username, creds.password)
    except smtplib.SMTPAuthenticationError as exc:
        raise SmtpError(f"authentication failed: {exc.smtp_error.decode(errors='ignore') if isinstance(exc.smtp_error, bytes) else exc.smtp_error}") from exc
    except smtplib.SMTPException as exc:
        raise SmtpError(f"smtp error: {exc}") from exc
    finally:
        try:
            client.quit()
        except smtplib.SMTPException:
            client.close()


def send_test_email(creds: SmtpCreds, *, to_email: str | None = None) -> None:
    """Verify creds AND deliver a tiny test message to `to_email` (defaults to sender)."""
    recipient = to_email or creds.from_email
    msg = EmailMessage()
    msg["Subject"] = "ORYXLY SMTP test"
    msg["From"] = creds.from_email
    msg["To"] = recipient
    msg.set_content(
        "This is a test email from ORYXLY confirming your SMTP credentials work.\n\n"
        "If you're reading this, the connection succeeded."
    )

    try:
        client = _connect(creds)
    except (smtplib.SMTPException, OSError) as exc:
        raise SmtpError(f"connection failed: {exc}") from exc
    try:
        client.login(creds.username, creds.password)
        client.send_message(msg)
    except smtplib.SMTPAuthenticationError as exc:
        raise SmtpError(f"authentication failed: {exc}") from exc
    except smtplib.SMTPRecipientsRefused as exc:
        raise SmtpRecipientError(f"recipient refused: {exc.recipients}") from exc
    except smtplib.SMTPException as exc:
        raise SmtpError(f"smtp error: {exc}") from exc
    finally:
        try:
            client.quit()
        except smtplib.SMTPException:
            client.close()


def send_message(
    creds: SmtpCreds,
    *,
    to_email: str,
    subject: str,
    html_body: str,
    attachments: list[dict] | None = None,
) -> None:
    """Send one HTML email, optionally with attachments.

    `attachments` is a list of dicts: `{"filename": str, "mime": str, "content": bytes}`.
    The MIME type is split into maintype/subtype for `add_attachment`.

    Raises SmtpError on any failure (connect/auth/send)."""
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = creds.from_email
    msg["To"] = to_email
    msg.set_content("This email is best viewed in an HTML-capable client.")
    msg.add_alternative(html_body, subtype="html")

    for att in attachments or []:
        mime = att.get("mime") or "application/octet-stream"
        maintype, _, subtype = mime.partition("/")
        if not subtype:
            maintype, subtype = "application", "octet-stream"
        msg.add_attachment(
            att["content"],
            maintype=maintype,
            subtype=subtype,
            filename=att.get("filename") or "file",
        )

    try:
        client = _connect(creds)
    except (smtplib.SMTPException, OSError) as exc:
        raise SmtpError(f"connection failed: {exc}") from exc
    try:
        client.login(creds.username, creds.password)
        client.send_message(msg)
    except smtplib.SMTPAuthenticationError as exc:
        raise SmtpError(f"authentication failed: {exc}") from exc
    except smtplib.SMTPRecipientsRefused as exc:
        raise SmtpRecipientError(f"recipient refused: {exc.recipients}") from exc
    except smtplib.SMTPException as exc:
        raise SmtpError(f"smtp error: {exc}") from exc
    finally:
        try:
            client.quit()
        except smtplib.SMTPException:
            client.close()
