from dataclasses import dataclass
from uuid import UUID

from domain.account.account import Account
from domain.staff.member import StaffMember, normalize_email, valid_email
from domain.staff.role import StaffRole, StaffStatus, assignable_by, can_manage_roster
from usecase.account.ports import AccountStore
from usecase.staff.errors import Forbidden, OwnerImmutable, StaffNotFound, StaffValidation
from usecase.staff.ports import StaffStore


@dataclass(frozen=True)
class StaffMeView:
    user_id: str
    email: str
    display_name: str
    role: str


class StaffService:
    def __init__(
        self,
        staff: StaffStore,
        accounts: AccountStore,
        owner_emails: frozenset[str] = frozenset(),
    ):
        self.staff = staff
        self.accounts = accounts
        self.owner_emails = frozenset(normalize_email(e) for e in owner_emails if e.strip())

    async def on_account_login(self, account: Account) -> None:
        await self._ensure_bootstrap(account)
        pending = await self.staff.get_by_email(normalize_email(account.email))
        if pending is None or pending.status is not StaffStatus.PENDING:
            return
        await self.staff.save(pending.activate(account))

    async def me(self, account: Account) -> StaffMeView:
        await self._ensure_bootstrap(account)
        member = await self.staff.get_by_user_id(account.id)
        if member is None or member.status is not StaffStatus.ACTIVE:
            raise Forbidden()
        return StaffMeView(
            user_id=str(account.id),
            email=account.email,
            display_name=account.shown_name(),
            role=member.role.value,
        )

    async def list_members(self, actor: Account) -> list[StaffMember]:
        await self._require_roster_manager(actor)
        rows = await self.staff.list_all()
        return [await self._present(row) for row in rows]

    async def assign(self, actor: Account, email: str, role_name: str) -> StaffMember:
        actor_role = await self._require_roster_manager(actor)
        role = self._parse_assignable(role_name)
        self._assert_may_assign(actor_role, role)
        if not valid_email(email):
            raise StaffValidation("email is not valid")
        normalized = normalize_email(email)
        existing = await self.staff.get_by_email(normalized)
        if existing is not None:
            return await self._present(await self._update_existing(existing, role, actor_role))
        account = await self.accounts.find_by_email(normalized)
        if account is None:
            return await self._present(await self.staff.save(StaffMember.pending(normalized, role)))
        member = StaffMember.active_for(account, role)
        return await self._present(await self.staff.save(member))

    async def update_role(self, actor: Account, member_id: UUID, role_name: str) -> StaffMember:
        actor_role = await self._require_roster_manager(actor)
        role = self._parse_assignable(role_name)
        self._assert_may_assign(actor_role, role)
        member = await self._load(member_id)
        self._assert_mutable_target(member, actor_role)
        return await self._present(await self.staff.save(member.with_role(role)))

    async def remove(self, actor: Account, member_id: UUID) -> None:
        actor_role = await self._require_roster_manager(actor)
        member = await self._load(member_id)
        self._assert_mutable_target(member, actor_role)
        await self.staff.delete(member.member_id)

    async def _ensure_bootstrap(self, account: Account) -> None:
        email = normalize_email(account.email)
        if email not in self.owner_emails:
            return
        existing = await self.staff.get_by_user_id(account.id)
        if existing is not None:
            return
        by_email = await self.staff.get_by_email(email)
        if by_email is not None:
            if by_email.status is StaffStatus.PENDING:
                await self.staff.save(by_email.activate(account).with_role(StaffRole.OWNER))
            return
        await self.staff.save(StaffMember.active_for(account, StaffRole.OWNER))

    async def _require_roster_manager(self, actor: Account) -> StaffRole:
        await self._ensure_bootstrap(actor)
        member = await self.staff.get_by_user_id(actor.id)
        if member is None or member.status is not StaffStatus.ACTIVE:
            raise Forbidden()
        if not can_manage_roster(member.role):
            raise Forbidden()
        return member.role

    async def _load(self, member_id: UUID) -> StaffMember:
        member = await self.staff.get_by_id(member_id)
        if member is None:
            raise StaffNotFound()
        return member

    async def _update_existing(
        self, existing: StaffMember, role: StaffRole, actor_role: StaffRole
    ) -> StaffMember:
        self._assert_mutable_target(existing, actor_role)
        return await self.staff.save(existing.with_role(role))

    async def _present(self, member: StaffMember) -> StaffMember:
        if member.user_id is None or member.status is not StaffStatus.ACTIVE:
            return member
        account = await self.accounts.get(member.user_id)
        if account is None:
            return member
        return member.with_display_name(account.shown_name())

    @staticmethod
    def _parse_assignable(role_name: str) -> StaffRole:
        try:
            role = StaffRole(role_name)
        except ValueError as exc:
            raise StaffValidation("role is not valid") from exc
        if role is StaffRole.OWNER:
            raise StaffValidation("owner cannot be assigned")
        return role

    @staticmethod
    def _assert_may_assign(actor: StaffRole, role: StaffRole) -> None:
        if role not in assignable_by(actor):
            raise Forbidden()

    @staticmethod
    def _assert_mutable_target(member: StaffMember, actor: StaffRole) -> None:
        if member.role is StaffRole.OWNER:
            raise OwnerImmutable()
        if member.role not in assignable_by(actor):
            raise Forbidden()
