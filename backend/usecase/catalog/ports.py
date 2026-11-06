from typing import Protocol

from domain.catalog.category import Category
from domain.catalog.product import Product
from usecase.catalog.queries import ProductListQuery, ProductListResult


class CatalogRepository(Protocol):
    async def list_categories(self) -> list[Category]: ...

    async def list_products(self, query: ProductListQuery) -> ProductListResult: ...

    async def get_product(self, product_id: str) -> Product | None: ...
