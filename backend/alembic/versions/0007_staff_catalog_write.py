"""Staff catalog write: hidden, created_at, image blob."""

import sqlalchemy as sa

from alembic import op

revision = "0007_staff_catalog_write"
down_revision = "0006_staff_members"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "catalog_products",
        sa.Column("hidden", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "catalog_products",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("TIMESTAMPTZ '2026-01-01 00:00:00+00'"),
        ),
    )
    op.add_column("catalog_products", sa.Column("image_bytes", sa.LargeBinary(), nullable=True))
    op.add_column(
        "catalog_products",
        sa.Column("image_content_type", sa.String(length=64), nullable=True),
    )
    op.alter_column("catalog_products", "hidden", server_default=None)
    op.alter_column("catalog_products", "created_at", server_default=None)


def downgrade() -> None:
    op.drop_column("catalog_products", "image_content_type")
    op.drop_column("catalog_products", "image_bytes")
    op.drop_column("catalog_products", "created_at")
    op.drop_column("catalog_products", "hidden")
