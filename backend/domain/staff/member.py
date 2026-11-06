from dataclasses import dataclass, replace
from uuid import UUID, uuid4

from domain.account.account import Account
from domain.staff.role import StaffRole, StaffStatus


def normalize_email(raw: str) -> str:
    return raw.strip().lower()


def valid_email(raw: str) -> bool:
    email = normalize_email(raw)
    if not email or "@" not in email or " " in email:
        return False
    local, _, domain = email.partition("@")
    return bool(local) and bool(domain) and "." in domain


@dataclass(frozen=True)
class StaffMember:
    member_id: UUID
    email: str
    role: StaffRole
    status: StaffStatus
    user_id: UUID | None = None
    display_name: str | None = None

    @staticmethod
    def pending(email: str, role: StaffRole) -> "StaffMember":
        return StaffMember(
            member_id=uuid4(),
            email=normalize_email(email),
            role=role,
            status=StaffStatus.PENDING,
        )

    @staticmethod
    def active_for(account: Account, role: StaffRole) -> "StaffMember":
        return StaffMember(
            member_id=uuid4(),
            email=normalize_email(account.email),
            role=role,
            status=StaffStatus.ACTIVE,
            user_id=account.id,
            display_name=account.shown_name(),
        )

    def activate(self, account: Account) -> "StaffMember":
        return replace(
            self,
            email=normalize_email(account.email),
            status=StaffStatus.ACTIVE,
            user_id=account.id,
            display_name=account.shown_name(),
        )

    def with_role(self, role: StaffRole) -> "StaffMember":
        return replace(self, role=role)

    def with_display_name(self, name: str | None) -> "StaffMember":
        return replace(self, display_name=name)
