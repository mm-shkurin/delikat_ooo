from enum import Enum


class StaffRole(str, Enum):
    OWNER = "owner"
    MANAGER = "manager"
    CASHIER = "cashier"


class StaffStatus(str, Enum):
    ACTIVE = "active"
    PENDING = "pending"


def can_manage_roster(role: StaffRole) -> bool:
    return role in {StaffRole.OWNER, StaffRole.MANAGER}


def can_write_catalog(role: StaffRole) -> bool:
    return role in {StaffRole.OWNER, StaffRole.MANAGER}


def assignable_by(actor: StaffRole) -> frozenset[StaffRole]:
    if actor is StaffRole.OWNER:
        return frozenset({StaffRole.MANAGER, StaffRole.CASHIER})
    if actor is StaffRole.MANAGER:
        return frozenset({StaffRole.CASHIER})
    return frozenset()
