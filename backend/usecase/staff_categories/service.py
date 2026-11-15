from domain.account.account import Account
from domain.staff.role import StaffStatus, can_write_catalog
from usecase.staff.ports import StaffStore
from usecase.staff_categories.errors import FAILED, StaffCategoryForbidden, invalid, missing, taken
from usecase.staff_categories.ports import CatalogChangeSignal, StaffCategoryStore
from usecase.staff_categories.queries import StaffCategory
from usecase.staff_categories.validation import clean_new_id, clean_title


class StaffCategoryService:
    def __init__(
        self,
        staff: StaffStore,
        categories: StaffCategoryStore,
        live: CatalogChangeSignal,
    ) -> None:
        self._staff = staff
        self._categories = categories
        self._live = live

    async def list_categories(self, actor: Account) -> list[StaffCategory]:
        await self._writer(actor)
        return await self._categories.list_categories()

    async def create(self, actor: Account, category_id: str, title: str) -> StaffCategory:
        await self._writer(actor)
        clean_id = clean_new_id(category_id)
        clean = clean_title(title)
        if await self._categories.get(clean_id) is not None:
            raise taken()
        saved = await self._categories.create(clean_id, clean)
        await self._live.catalog_changed()
        return saved

    async def rename(self, actor: Account, category_id: str, title: str) -> StaffCategory:
        await self._writer(actor)
        saved = await self._categories.rename(category_id, clean_title(title))
        if saved is None:
            raise missing()
        await self._live.catalog_changed()
        return saved

    async def reorder(self, actor: Account, ids: list[str]) -> list[StaffCategory]:
        await self._writer(actor)
        saved = await self._categories.reorder(list(ids))
        if saved is None:
            raise invalid(FAILED)
        await self._live.catalog_changed()
        return saved

    async def delete(self, actor: Account, category_id: str) -> None:
        await self._writer(actor)
        if not await self._categories.delete(category_id):
            raise missing()
        await self._live.catalog_changed()

    async def _writer(self, actor: Account) -> None:
        member = await self._staff.get_by_user_id(actor.id)
        if member is None or member.status is not StaffStatus.ACTIVE:
            raise StaffCategoryForbidden()
        if not can_write_catalog(member.role):
            raise StaffCategoryForbidden()
