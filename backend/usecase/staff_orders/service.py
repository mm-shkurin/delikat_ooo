from uuid import UUID

from domain.account.account import Account
from domain.cart.order_status import ORDER_STATUSES
from domain.cart.staff_order import StaffOrder
from domain.staff.role import StaffRole, StaffStatus
from usecase.staff.ports import StaffStore
from usecase.staff_orders.errors import (
    InvalidOrderStatus,
    InvalidStatusTransition,
    OrderNotFound,
    StaffOrdersForbidden,
)
from usecase.staff_orders.ports import StaffOrderStore
from usecase.staff_orders.sort import sort_staff_orders

_ROLES = {StaffRole.OWNER, StaffRole.MANAGER, StaffRole.CASHIER}


class StaffOrdersService:
    def __init__(self, staff: StaffStore, orders: StaffOrderStore) -> None:
        self._staff = staff
        self._orders = orders

    async def list_orders(self, actor: Account) -> tuple[list[StaffOrder], bool]:
        await self._require(actor)
        rows, truncated = await self._orders.list_all()
        return sort_staff_orders(rows), truncated

    async def set_status(self, actor: Account, order_id: UUID, status: str) -> StaffOrder:
        await self._require(actor)
        if status not in ORDER_STATUSES:
            raise InvalidOrderStatus()
        current = await self._orders.get(order_id)
        if current is None:
            raise OrderNotFound()
        if status != current.status and status not in current.allowed_next:
            raise InvalidStatusTransition()
        if status == current.status:
            return current
        # Store re-checks under FOR UPDATE so concurrent writers cannot race past allowed_next.
        return await self._orders.save_status(order_id, status)

    async def _require(self, actor: Account) -> None:
        member = await self._staff.get_by_user_id(actor.id)
        if member is None or member.status is not StaffStatus.ACTIVE or member.role not in _ROLES:
            raise StaffOrdersForbidden()
