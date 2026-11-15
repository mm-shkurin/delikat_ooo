from dataclasses import fields
from datetime import UTC, datetime
from uuid import uuid4

from domain.account.account import Account
from domain.cart.staff_order import StaffOrder
from usecase.account.errors import Unauthorized


class MapBuyers:
    def __init__(self, rows: dict[str, tuple[str, str | None] | None]) -> None:
        self._rows = rows

    async def lookup(self, access_token: str) -> tuple[str, str | None]:
        row = self._rows.get(access_token)
        if row is None:
            raise Unauthorized()
        return row


def make_account(email: str = "owner@example.com", *, profile_name: str | None = None) -> Account:
    return Account(
        id=uuid4(),
        yandex_subject=f"sub-{email}",
        email=email,
        provider_name=email.split("@")[0],
        created_at=datetime(2026, 11, 1, tzinfo=UTC),
        profile_name=profile_name,
        avatar_url=None,
    )


def staff_field_names() -> set[str]:
    return {item.name for item in fields(StaffOrder)}
