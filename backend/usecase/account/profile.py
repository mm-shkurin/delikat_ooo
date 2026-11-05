from domain.account.account import Account
from usecase.account.errors import InvalidDisplayName
from usecase.account.ports import AccountStore


class ProfileService:
    def __init__(self, accounts: AccountStore):
        self._accounts = accounts

    def view(self, account: Account) -> dict:
        return {
            "user_id": str(account.id),
            "email": account.email,
            "display_name": account.shown_name(),
            "provider_display_name": account.provider_name,
            "avatar_url": account.avatar_url,
        }

    async def rename(self, account: Account, display_name: str) -> Account:
        trimmed = display_name.strip()
        if not trimmed or len(trimmed) > 120:
            raise InvalidDisplayName()
        updated = account.with_profile_name(trimmed)
        saved = await self._accounts.save(updated)
        if saved is None:
            raise InvalidDisplayName()
        return saved
