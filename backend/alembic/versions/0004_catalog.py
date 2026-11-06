"""Catalog categories and products seed (16 SKU)."""

import sqlalchemy as sa

from adapters.db.catalog_seed import load_category_rows, load_product_rows
from alembic import op

revision = "0004_catalog"
down_revision = "0003_account_avatar"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "catalog_categories",
        sa.Column("id", sa.String(length=32), primary_key=True),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
    )
    op.create_table(
        "catalog_products",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("category_id", sa.String(length=32), sa.ForeignKey("catalog_categories.id"), nullable=False),
        sa.Column("default_weight_label", sa.String(length=32), nullable=False),
        sa.Column("price_rub", sa.Integer(), nullable=False),
        sa.Column("compare_at_price_rub", sa.Integer(), nullable=True),
        sa.Column("popularity_score", sa.Integer(), nullable=False),
        sa.Column("properties", sa.JSON(), nullable=False),
        sa.Column("badge", sa.String(length=8), nullable=True),
        sa.Column("marble_grade_label", sa.String(length=64), nullable=True),
        sa.Column("image_url", sa.String(length=512), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
    )

    categories = sa.table(
        "catalog_categories",
        sa.column("id", sa.String),
        sa.column("title", sa.String),
        sa.column("sort_order", sa.Integer),
    )
    products = sa.table(
        "catalog_products",
        sa.column("id", sa.String),
        sa.column("name", sa.String),
        sa.column("category_id", sa.String),
        sa.column("default_weight_label", sa.String),
        sa.column("price_rub", sa.Integer),
        sa.column("compare_at_price_rub", sa.Integer),
        sa.column("popularity_score", sa.Integer),
        sa.column("properties", sa.JSON),
        sa.column("badge", sa.String),
        sa.column("marble_grade_label", sa.String),
        sa.column("image_url", sa.String),
        sa.column("description", sa.Text),
    )

    op.bulk_insert(categories, load_category_rows())
    op.bulk_insert(
        products,
        [
            {
                **row,
                "description": None,
            }
            for row in load_product_rows()
        ],
    )


def downgrade() -> None:
    op.drop_table("catalog_products")
    op.drop_table("catalog_categories")
