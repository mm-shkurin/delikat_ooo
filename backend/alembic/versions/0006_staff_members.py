"""Staff roster members."""

import sqlalchemy as sa

from alembic import op

revision = "0006_staff_members"
down_revision = "0005_shop_cart"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "staff_members",
        sa.Column("member_id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("user_id", sa.Uuid(as_uuid=True), sa.ForeignKey("accounts.id"), nullable=True),
        sa.UniqueConstraint("email", name="uq_staff_members_email"),
    )
    op.create_index("ix_staff_members_user_id", "staff_members", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_staff_members_user_id", table_name="staff_members")
    op.drop_table("staff_members")
