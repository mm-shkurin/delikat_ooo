from typing import Protocol

from domain.cart.buyer import GUEST_BUYER_NAME
from usecase.account.errors import Unauthorized


class BuyerLookup(Protocol):
    async def lookup(self, access_token: str) -> tuple[str, str | None]: ...


async def resolve_checkout_buyer(
    access_token: str | None,
    buyers: BuyerLookup | None,
) -> tuple[str, str | None]:
    if not access_token:
        return GUEST_BUYER_NAME, None
    if buyers is None:
        raise Unauthorized()
    shown_name, email = await buyers.lookup(access_token)
    return shown_name.strip() or GUEST_BUYER_NAME, email
