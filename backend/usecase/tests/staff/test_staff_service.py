from datetime import UTC, datetime
from uuid import uuid4

import pytest

from domain.account.account import Account
from domain.staff.member import StaffMember
from domain.staff.role import StaffRole, StaffStatus
from usecase.staff.errors import Forbidden, OwnerImmutable, StaffValidation
from usecase.staff.service import StaffService
from usecase.tests.staff.fakes import FakeAccountStore, FakeStaffStore


def _account(email: str = "owner@example.com", **overrides) -> Account:
    fields = {
        "id": uuid4(),
        "yandex_subject": f"sub-{email}",
        "email": email,
        "provider_name": email.split("@")[0],
        "created_at": datetime(2026, 11, 6, tzinfo=UTC),
        "profile_name": None,
        "avatar_url": None,
    }
    fields.update(overrides)
    return Account(**fields)


def _service(
    *,
    accounts: list[Account] | None = None,
    members: list[StaffMember] | None = None,
    owner_emails: frozenset[str] = frozenset(),
) -> tuple[StaffService, FakeStaffStore, FakeAccountStore]:
    store = FakeStaffStore(members)
    directory = FakeAccountStore(accounts)
    return StaffService(store, directory, owner_emails), store, directory


@pytest.mark.asyncio
async def test_me_returns_role_for_owner():
    owner = _account("owner@example.com")
    member = StaffMember.active_for(owner, StaffRole.OWNER)
    service, _, _ = _service(accounts=[owner], members=[member])
    view = await service.me(owner)
    assert view.role == "owner"
    assert view.email == "owner@example.com"
    assert view.user_id == str(owner.id)


@pytest.mark.asyncio
async def test_non_staff_cannot_read_me():
    buyer = _account("buyer@example.com")
    service, _, _ = _service(accounts=[buyer])
    with pytest.raises(Forbidden):
        await service.me(buyer)


@pytest.mark.asyncio
async def test_owner_assigns_registered_cashier_active():
    owner = _account("owner@example.com")
    butcher = _account("butcher@example.com", profile_name="Butcher")
    owner_row = StaffMember.active_for(owner, StaffRole.OWNER)
    service, store, _ = _service(accounts=[owner, butcher], members=[owner_row])
    member = await service.assign(owner, "butcher@example.com", "cashier")
    assert member.status is StaffStatus.ACTIVE
    assert member.role is StaffRole.CASHIER
    assert member.user_id == butcher.id
    assert member.display_name == "Butcher"
    assert await store.get_by_email("butcher@example.com") is not None


@pytest.mark.asyncio
async def test_pending_activates_on_login_email_match():
    invite = StaffMember.pending("newhire@example.com", StaffRole.CASHIER)
    service, store, _ = _service(members=[invite])
    hire = _account("newhire@example.com", profile_name="New Hire")
    await service.on_account_login(hire)
    activated = await store.get_by_email("newhire@example.com")
    assert activated is not None
    assert activated.status is StaffStatus.ACTIVE
    assert activated.user_id == hire.id
    view = await service.me(hire)
    assert view.role == "cashier"


@pytest.mark.asyncio
async def test_cannot_assign_owner_via_staff_routes():
    owner = _account("owner@example.com")
    other = _account("other@example.com")
    owner_row = StaffMember.active_for(owner, StaffRole.OWNER)
    other_row = StaffMember.active_for(other, StaffRole.OWNER)
    service, _, _ = _service(accounts=[owner, other], members=[owner_row, other_row])
    with pytest.raises(StaffValidation):
        await service.assign(owner, "buyer@example.com", "owner")
    with pytest.raises(OwnerImmutable):
        await service.update_role(owner, other_row.member_id, "cashier")
    with pytest.raises(OwnerImmutable):
        await service.remove(owner, other_row.member_id)


@pytest.mark.asyncio
async def test_bootstrap_owner_email_grants_role_on_me():
    owner = _account("boss@delikat.test")
    service, _, _ = _service(accounts=[owner], owner_emails=frozenset({"boss@delikat.test"}))
    view = await service.me(owner)
    assert view.role == "owner"


@pytest.mark.asyncio
async def test_assign_unknown_email_creates_pending():
    owner = _account("owner@example.com")
    owner_row = StaffMember.active_for(owner, StaffRole.OWNER)
    service, _, _ = _service(accounts=[owner], members=[owner_row])
    member = await service.assign(owner, "newhire@example.com", "manager")
    assert member.status is StaffStatus.PENDING
    assert member.role is StaffRole.MANAGER
    assert member.user_id is None


@pytest.mark.asyncio
async def test_invalid_assign_email_rejected():
    owner = _account("owner@example.com")
    owner_row = StaffMember.active_for(owner, StaffRole.OWNER)
    service, _, _ = _service(accounts=[owner], members=[owner_row])
    with pytest.raises(StaffValidation):
        await service.assign(owner, "", "cashier")
    with pytest.raises(StaffValidation):
        await service.assign(owner, "not-an-email", "cashier")


@pytest.mark.asyncio
async def test_manager_cannot_assign_manager():
    manager = _account("mgr@example.com")
    manager_row = StaffMember.active_for(manager, StaffRole.MANAGER)
    service, _, _ = _service(accounts=[manager], members=[manager_row])
    with pytest.raises(Forbidden):
        await service.assign(manager, "x@example.com", "manager")


@pytest.mark.asyncio
async def test_cashier_cannot_list_or_assign():
    cashier = _account("cash@example.com")
    cashier_row = StaffMember.active_for(cashier, StaffRole.CASHIER)
    service, _, _ = _service(accounts=[cashier], members=[cashier_row])
    with pytest.raises(Forbidden):
        await service.list_members(cashier)
    with pytest.raises(Forbidden):
        await service.assign(cashier, "x@example.com", "cashier")
