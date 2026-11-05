from domain.catalog.category import Category
from domain.catalog.product import Product


class FakeCatalogRepository:
    def __init__(
        self,
        categories: list[Category] | None = None,
        products: list[Product] | None = None,
    ) -> None:
        self._categories = categories or []
        self._products = products or []

    async def list_categories(self) -> list[Category]:
        return list(self._categories)

    async def list_products(self) -> list[Product]:
        return list(self._products)

    async def get_product(self, product_id: str) -> Product | None:
        for row in self._products:
            if row.id == product_id:
                return row
        return None
