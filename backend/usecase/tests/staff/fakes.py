from copy import deepcopy
from datetime import datetime
from uuid import UUID

from domain.account.account import Account
from domain.account.identity import ProviderIdentity
from domain.staff.member import StaffMember, normalize_email


class FakeAccountStore:
    def __init__(self, accounts: list[Account] | None = None) -> None:
        self._by_id: dict[UUID, Account] = {a.id: a for a in accounts or []}

    async def get(self, user_id: UUID) -> Account | None:
        found = self._by_id.get(user_id)
        return None if found is None else deepcopy(found)

    async def find_by_email(self, email: str) -> Account | None:
        target = normalize_email(email)
        for account in self._by_id.values():
            if normalize_email(account.email) == target:
                return deepcopy(account)
        return None

    async def get_or_create(self, identity: ProviderIdentity, created_at: datetime) -> Account:
        for account in self._by_id.values():
            if account.yandex_subject == identity.subject:
                updated = account.with_provider(identity)
                self._by_id[updated.id] = updated
                return deepcopy(updated)
        account = Account.open(identity, created_at)
        self._by_id[account.id] = account
        return deepcopy(account)

    async def save(self, account: Account) -> Account | None:
        if account.id not in self._by_id:
            return None
        self._by_id[account.id] = deepcopy(account)
        return deepcopy(account)

    def put(self, account: Account) -> None:
        self._by_id[account.id] = deepcopy(account)


class FakeStaffStore:
    def __init__(self, members: list[StaffMember] | None = None) -> None:
        self._rows: dict[UUID, StaffMember] = {m.member_id: deepcopy(m) for m in members or []}

    async def get_by_user_id(self, user_id: UUID) -> StaffMember | None:
        for row in self._rows.values():
            if row.user_id == user_id:
                return deepcopy(row)
        return None

    async def get_by_id(self, member_id: UUID) -> StaffMember | None:
        found = self._rows.get(member_id)
        return None if found is None else deepcopy(found)

    async def get_by_email(self, email: str) -> StaffMember | None:
        target = normalize_email(email)
        for row in self._rows.values():
            if row.email == target:
                return deepcopy(row)
        return None

    async def list_all(self) -> list[StaffMember]:
        return [deepcopy(row) for row in self._rows.values()]

    async def save(self, member: StaffMember) -> StaffMember:
        self._rows[member.member_id] = deepcopy(member)
        return deepcopy(member)

    async def delete(self, member_id: UUID) -> None:
        self._rows.pop(member_id, None)
