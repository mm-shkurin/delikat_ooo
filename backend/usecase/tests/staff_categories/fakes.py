from copy import deepcopy

from domain.catalog.product import Product
from usecase.staff_categories.queries import StaffCategory


class FakeStaffCategoryStore:
    def __init__(
        self,
        categories: list[StaffCategory] | None = None,
        products: list[Product] | None = None,
    ) -> None:
        self.categories = {row.id: row for row in categories or []}
        self.products = {row.id: deepcopy(row) for row in products or []}

    async def list_categories(self) -> list[StaffCategory]:
        return [_with_count(row, self.products) for row in _sorted(self.categories)]

    async def get(self, category_id: str) -> StaffCategory | None:
        row = self.categories.get(category_id)
        return None if row is None else _with_count(row, self.products)

    async def create(self, category_id: str, title: str) -> StaffCategory:
        orders = [row.sort_order for row in self.categories.values()]
        sort_order = 1 if not orders else max(orders) + 1
        saved = StaffCategory(category_id, title, sort_order, 0)
        self.categories[category_id] = saved
        return saved

    async def rename(self, category_id: str, title: str) -> StaffCategory | None:
        row = self.categories.get(category_id)
        if row is None:
            return None
        saved = StaffCategory(row.id, title, row.sort_order, row.product_count)
        self.categories[category_id] = saved
        return _with_count(saved, self.products)

    async def reorder(self, ids: list[str]) -> list[StaffCategory] | None:
        if len(ids) != len(set(ids)) or set(ids) != set(self.categories):
            return None
        for index, category_id in enumerate(ids, start=1):
            row = self.categories[category_id]
            self.categories[category_id] = StaffCategory(row.id, row.title, index, row.product_count)
        return await self.list_categories()

    async def delete(self, category_id: str) -> bool:
        if category_id not in self.categories:
            return False
        self.products = {
            product_id: row
            for product_id, row in self.products.items()
            if row.category_id != category_id
        }
        del self.categories[category_id]
        return True


def _sorted(rows: dict[str, StaffCategory]) -> list[StaffCategory]:
    return sorted(rows.values(), key=lambda row: (row.sort_order, row.id))


def _with_count(row: StaffCategory, products: dict[str, Product]) -> StaffCategory:
    count = sum(1 for product in products.values() if product.category_id == row.id)
    return StaffCategory(row.id, row.title, row.sort_order, count)
