from domain.catalog.category import Category
from domain.catalog.product import Product
from usecase.catalog.queries import ProductListQuery, ProductListResult


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

    async def list_products(self, query: ProductListQuery) -> ProductListResult:
        return apply_product_list(self._products, query)

    async def get_product(self, product_id: str) -> Product | None:
        for row in self._products:
            if row.id == product_id:
                return row
        return None


def apply_product_list(products: list[Product], query: ProductListQuery) -> ProductListResult:
    filtered = list(products)
    if query.category_id:
        filtered = [row for row in filtered if row.category_id == query.category_id]
    if query.max_price_rub is not None:
        filtered = [row for row in filtered if row.price_rub <= query.max_price_rub]
    if query.properties:
        wanted = set(query.properties)
        filtered = [row for row in filtered if wanted.intersection(row.properties)]
    filtered = _sort_products(filtered, query.sort)
    total = len(filtered)
    if query.limit > 0:
        page = filtered[query.offset : query.offset + query.limit]
    else:
        page = filtered[query.offset :]
    return ProductListResult(
        items=tuple(page),
        total_count=total,
        limit=query.limit,
        offset=query.offset,
    )


def _sort_products(items: list[Product], sort: str) -> list[Product]:
    if sort == "price_asc":
        return sorted(items, key=lambda row: row.price_rub)
    if sort == "sale_first":
        return sorted(items, key=lambda row: (0 if row.compare_at_price_rub else 1, row.price_rub))
    return sorted(items, key=lambda row: row.popularity_score, reverse=True)
