"""Add avatar_url to accounts."""

from alembic import op
import sqlalchemy as sa

revision = "0003_account_avatar"
down_revision = "0002_yandex_accounts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("accounts", sa.Column("avatar_url", sa.String(length=512), nullable=True))


def downgrade() -> None:
    op.drop_column("accounts", "avatar_url")
