"""Replace phone/SMS tables with Yandex OAuth accounts."""

import sqlalchemy as sa

from alembic import op

revision = "0002_yandex_accounts"
down_revision = "0001_account_auth"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("DROP TABLE IF EXISTS refresh_tokens")
    op.execute("DROP TABLE IF EXISTS phone_otps")
    op.execute("DROP INDEX IF EXISTS ix_users_phone_e164")
    op.execute("DROP TABLE IF EXISTS users")

    op.create_table(
        "accounts",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("yandex_subject", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("provider_name", sa.String(length=64), nullable=False),
        sa.Column("profile_name", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_accounts_yandex_subject", "accounts", ["yandex_subject"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_accounts_yandex_subject", table_name="accounts")
    op.drop_table("accounts")
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("phone_e164", sa.String(length=16), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_phone_e164", "users", ["phone_e164"], unique=True)
    op.create_table(
        "phone_otps",
        sa.Column("phone_e164", sa.String(length=16), primary_key=True),
        sa.Column("code", sa.String(length=6), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "refresh_tokens",
        sa.Column("token_hash", sa.String(length=64), primary_key=True),
        sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])
