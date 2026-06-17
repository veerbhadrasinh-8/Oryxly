"""add lite plan and monthly_email_limit

Revision ID: 092133ef008c
Revises: 82529195332d
Create Date: 2026-06-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "092133ef008c"
down_revision: Union[str, Sequence[str], None] = "82529195332d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ALTER TYPE ... ADD VALUE cannot run inside a transaction block, so use
    # an autocommit block for the enum extension.
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE user_plan_enum ADD VALUE IF NOT EXISTS 'lite'")

    op.add_column("users", sa.Column("monthly_email_limit", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "monthly_email_limit")
    # Postgres cannot drop a single enum value; leaving 'lite' in the type is
    # harmless. Recreating the type to remove it would require rewriting the
    # column, which is out of scope for a downgrade.
