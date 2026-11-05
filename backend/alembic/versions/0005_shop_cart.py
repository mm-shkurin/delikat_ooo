"""Shop carts and orders."""

from alembic import op
import sqlalchemy as sa

revision = "0005_shop_cart"
down_revision = "0004_catalog"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "shop_carts",
        sa.Column("session_id", sa.String(length=36), primary_key=True),
        sa.Column("fulfillment_mode", sa.String(length=16), nullable=False),
        sa.Column("city", sa.String(length=64), nullable=False),
        sa.Column("street_line", sa.String(length=80), nullable=True),
    )
    op.create_table(
        "cart_lines",
        sa.Column("line_id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("session_id", sa.String(length=36), sa.ForeignKey("shop_carts.session_id"), nullable=False),
        sa.Column("product_id", sa.String(length=64), nullable=False),
        sa.Column("product_name", sa.String(length=200), nullable=False),
        sa.Column("weight_label", sa.String(length=32), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price_rub", sa.Integer(), nullable=False),
    )
    op.create_table(
        "shop_orders",
        sa.Column("order_id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("idempotency_key", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("session_id", sa.String(length=36), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("total_rub", sa.Integer(), nullable=False),
        sa.Column("message", sa.String(length=500), nullable=False),
        sa.Column("customer_note", sa.String(length=500), nullable=True),
        sa.Column("fulfillment_mode", sa.String(length=16), nullable=False),
        sa.Column("city", sa.String(length=64), nullable=False),
        sa.Column("street_line", sa.String(length=80), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_shop_orders_idempotency_key", "shop_orders", ["idempotency_key"], unique=True)
    op.create_table(
        "shop_order_lines",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("order_id", sa.Uuid(as_uuid=True), sa.ForeignKey("shop_orders.order_id"), nullable=False),
        sa.Column("product_id", sa.String(length=64), nullable=False),
        sa.Column("product_name", sa.String(length=200), nullable=False),
        sa.Column("weight_label", sa.String(length=32), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price_rub", sa.Integer(), nullable=False),
        sa.Column("line_total_rub", sa.Integer(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("shop_order_lines")
    op.drop_index("ix_shop_orders_idempotency_key", table_name="shop_orders")
    op.drop_table("shop_orders")
    op.drop_table("cart_lines")
    op.drop_table("shop_carts")
