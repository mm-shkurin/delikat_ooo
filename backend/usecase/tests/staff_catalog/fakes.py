from copy import deepcopy
from dataclasses import replace

from domain.catalog.category import Category
from domain.catalog.product import Product, ProductImage
from usecase.staff_catalog.queries import StaffProductListQuery
from usecase.staff_catalog.validation import media_url


class FakeStaffCatalogStore:
    def __init__(
        self,
        products: list[Product] | None = None,
        categories: list[Category] | None = None,
        images: dict[str, ProductImage] | None = None,
    ) -> None:
        self._products = {row.id: deepcopy(row) for row in products or []}
        self._categories = {row.id: deepcopy(row) for row in categories or []}
        self._images = {key: deepcopy(value) for key, value in (images or {}).items()}

    async def list_staff_products(self, query: StaffProductListQuery) -> list[Product]:
        rows = list(self._products.values())
        if query.visibility == "live":
            rows = [row for row in rows if not row.hidden]
        elif query.visibility == "hidden":
            rows = [row for row in rows if row.hidden]
        if query.q:
            needle = query.q.casefold()
            rows = [
                row
                for row in rows
                if needle in row.name.casefold() or needle in row.id.casefold()
            ]
        return [deepcopy(row) for row in rows]

    async def get_product(self, product_id: str) -> Product | None:
        found = self._products.get(product_id)
        return None if found is None else deepcopy(found)

    async def category_exists(self, category_id: str) -> bool:
        return category_id in self._categories

    async def save_product(self, product: Product) -> Product:
        self._products[product.id] = deepcopy(product)
        return deepcopy(product)

    async def put_image(self, product_id: str, data: bytes, content_type: str) -> Product:
        product = self._products[product_id]
        updated = replace(product, image_url=media_url(product_id))
        self._products[product_id] = updated
        self._images[product_id] = ProductImage(product_id, content_type, data)
        return deepcopy(updated)

    async def get_image(self, product_id: str) -> ProductImage | None:
        found = self._images.get(product_id)
        return None if found is None else deepcopy(found)
