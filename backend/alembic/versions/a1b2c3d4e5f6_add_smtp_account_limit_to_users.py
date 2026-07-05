"""add smtp_account_limit to users

Revision ID: a1b2c3d4e5f6
Revises: f3c8a2e1b7d9
Create Date: 2026-07-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "a1b2c3d4e5f6"
down_revision: str | None = "f3c8a2e1b7d9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("smtp_account_limit", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "smtp_account_limit")
