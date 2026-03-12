"""create todos table

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-03-11 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_priority_enum = postgresql.ENUM(
    "low", "medium", "high", name="priority_enum", create_type=False
)


def upgrade() -> None:
    """Create the todos table and required extensions/types."""
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    _priority_enum.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "todos",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("uuid_generate_v4()"),
            nullable=False,
        ),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "completed",
            sa.Boolean(),
            server_default="false",
            nullable=False,
        ),
        sa.Column(
            "priority",
            postgresql.ENUM(
                "low", "medium", "high", name="priority_enum", create_type=False
            ),
            server_default="medium",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    """Drop the todos table and related types."""
    op.drop_table("todos")
    _priority_enum.drop(op.get_bind(), checkfirst=True)
