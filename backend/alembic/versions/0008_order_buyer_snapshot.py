"""Buyer name and email captured once at checkout."""

import sqlalchemy as sa

from alembic import op

revision = "0008_order_buyer_snapshot"
down_revision = "0007_staff_catalog_write"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("shop_orders", sa.Column("buyer_name", sa.String(length=200), nullable=True))
    op.add_column("shop_orders", sa.Column("buyer_email", sa.String(length=320), nullable=True))


def downgrade() -> None:
    op.drop_column("shop_orders", "buyer_email")
    op.drop_column("shop_orders", "buyer_name")
