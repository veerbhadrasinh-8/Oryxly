"""add inline campaign content

Revision ID: f3c8a2e1b7d9
Revises: 092133ef008c
Create Date: 2026-06-19

Adds subject/html_body/to_variable/selected_columns directly on campaigns
so campaigns no longer require a separate template record. template_id is
kept for backward-compat with existing campaigns but is now nullable with
SET NULL on template delete.
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "f3c8a2e1b7d9"
down_revision: str | None = "092133ef008c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # template_id: NOT NULL → nullable, RESTRICT → SET NULL
    op.alter_column(
        "campaigns", "template_id",
        existing_type=postgresql.UUID(as_uuid=True),
        nullable=True,
    )
    op.drop_constraint("campaigns_template_id_fkey", "campaigns", type_="foreignkey")
    op.create_foreign_key(
        "campaigns_template_id_fkey", "campaigns", "templates",
        ["template_id"], ["id"], ondelete="SET NULL",
    )

    op.add_column("campaigns", sa.Column("subject", sa.Text(), nullable=True))
    op.add_column("campaigns", sa.Column("html_body", sa.Text(), nullable=True))
    op.add_column("campaigns", sa.Column("to_variable", sa.String(255), nullable=True))
    op.add_column(
        "campaigns",
        sa.Column("selected_columns", postgresql.ARRAY(sa.String()), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("campaigns", "selected_columns")
    op.drop_column("campaigns", "to_variable")
    op.drop_column("campaigns", "html_body")
    op.drop_column("campaigns", "subject")

    op.drop_constraint("campaigns_template_id_fkey", "campaigns", type_="foreignkey")
    op.create_foreign_key(
        "campaigns_template_id_fkey", "campaigns", "templates",
        ["template_id"], ["id"], ondelete="RESTRICT",
    )
    # WARNING: will fail if any row has template_id = NULL
    op.alter_column(
        "campaigns", "template_id",
        existing_type=postgresql.UUID(as_uuid=True),
        nullable=False,
    )
