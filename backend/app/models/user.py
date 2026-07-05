import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class UserPlan(str, Enum):
    LITE = "lite"
    STARTER = "starter"
    GROWTH = "growth"
    AGENCY = "agency"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    plan: Mapped[UserPlan] = mapped_column(
        SAEnum(UserPlan, name="user_plan_enum", values_callable=lambda e: [m.value for m in e]),
        default=UserPlan.STARTER,
        nullable=False,
    )
    # Per-user override of the monthly email cap. NULL → use the plan default
    # from app.core.plans.MONTHLY_EMAIL_LIMIT. Set by admins for custom deals.
    monthly_email_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # Per-user override of the SMTP account limit. NULL → use plan default.
    smtp_account_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
