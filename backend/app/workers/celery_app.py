"""Celery application - broker + result backend on Redis."""

from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "mailflow",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Send tasks are I/O-bound (SMTP). Modest concurrency keeps us under
    # provider rate limits and avoids one bad SMTP server stalling many workers.
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    # Don't let one stuck SMTP server hang forever.
    task_soft_time_limit=60,
    task_time_limit=120,
)

# Make THIS app the default that shared_task() resolves against. Without
# this, the API process publishes to Celery's amqp:// default (RabbitMQ on
# localhost) which doesn't exist → "Connection refused" on every launch.
celery_app.set_default()

