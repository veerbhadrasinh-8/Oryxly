"""Fires the GitHub Actions worker immediately on campaign launch.

Railway blocks outbound SMTP, so the Celery worker runs as a scheduled
GitHub Actions workflow instead of an always-on process (see
docs/MIGRATION_CONTEXT.md). The cron trigger alone can lag several minutes,
so we also fire workflow_dispatch via the API right when a campaign is
launched - dispatch events aren't subject to GitHub's "may be delayed under
load" caveat that applies specifically to `schedule` triggers.

Best-effort only: if the token is missing or the API call fails, we log and
move on. The cron trigger is still there as a fallback within ~5 minutes.
"""

import logging

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_WORKFLOW_FILE = "celery-worker.yml"
_TIMEOUT_SECONDS = 5.0


def trigger_worker_now() -> None:
    settings = get_settings()
    token = settings.GITHUB_ACTIONS_TOKEN
    repo = settings.GITHUB_ACTIONS_REPO
    if not token or not repo:
        return

    url = f"https://api.github.com/repos/{repo}/actions/workflows/{_WORKFLOW_FILE}/dispatches"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
    }
    try:
        resp = httpx.post(url, json={"ref": "main"}, headers=headers, timeout=_TIMEOUT_SECONDS)
        if resp.status_code >= 300:
            logger.warning("github workflow dispatch failed: %s %s", resp.status_code, resp.text)
    except httpx.HTTPError as exc:
        logger.warning("github workflow dispatch error: %s", exc)
