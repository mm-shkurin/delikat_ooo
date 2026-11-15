from domain.account.account import Account
from domain.staff.role import StaffRole, StaffStatus
from usecase.staff.ports import StaffStore
from usecase.staff_analytics.aggregate import MoneyResult, StatsResult, build_money, build_stats
from usecase.staff_analytics.errors import StaffAnalyticsForbidden
from usecase.staff_orders.ports import StaffOrderStore


class StaffAnalyticsService:
    def __init__(self, staff: StaffStore, orders: StaffOrderStore) -> None:
        self._staff = staff
        self._orders = orders

    async def stats(self, actor: Account) -> StatsResult:
        await self._require_owner(actor)
        return build_stats(await self._orders.list_all())

    async def money(self, actor: Account) -> MoneyResult:
        await self._require_owner(actor)
        return build_money(await self._orders.list_all())

    async def _require_owner(self, actor: Account) -> None:
        member = await self._staff.get_by_user_id(actor.id)
        if (
            member is None
            or member.status is not StaffStatus.ACTIVE
            or member.role is not StaffRole.OWNER
        ):
            raise StaffAnalyticsForbidden()
