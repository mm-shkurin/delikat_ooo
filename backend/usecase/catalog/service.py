from domain.catalog.category import Category
from domain.catalog.product import Product
from usecase.catalog.errors import InvalidCatalogQuery, ProductNotFound
from usecase.catalog.ports import CatalogRepository
from usecase.catalog.queries import (
    VALID_CATEGORIES,
    VALID_PROPERTIES,
    VALID_SORT,
    ProductListQuery,
    ProductListResult,
)

_DEFAULT_DESCRIPTION = "Мраморная говядина. Режем под заказ."
_WEIGHT_PRESETS = ("~250 г", "~350 г", "~500 г", "1 кг")


class CatalogService:
    def __init__(self, catalog: CatalogRepository) -> None:
        self._catalog = catalog

    async def list_categories(self) -> list[Category]:
        items = await self._catalog.list_categories()
        return sorted(items, key=lambda row: row.sort_order)

    async def list_products(self, query: ProductListQuery) -> ProductListResult:
        self._validate_query(query)
        filtered = await self._catalog.list_products()
        if query.category_id:
            filtered = [row for row in filtered if row.category_id == query.category_id]
        if query.max_price_rub is not None:
            filtered = [row for row in filtered if row.price_rub <= query.max_price_rub]
        if query.properties:
            wanted = set(query.properties)
            filtered = [
                row for row in filtered if wanted.intersection(row.properties)
            ]
        filtered = self._sort(filtered, query.sort)
        total = len(filtered)
        page = filtered[query.offset : query.offset + query.limit] if query.limit > 0 else filtered[query.offset :]
        return ProductListResult(
            items=tuple(page),
            total_count=total,
            limit=query.limit,
            offset=query.offset,
        )

    async def get_product(self, product_id: str) -> Product:
        row = await self._catalog.get_product(product_id)
        if row is None:
            raise ProductNotFound(product_id)
        return row

    def weight_options_for(self, product: Product) -> tuple[str, ...]:
        default = product.default_weight_label or "~350 г"
        return tuple(dict.fromkeys((default, *_WEIGHT_PRESETS)))

    def description_for(self, product: Product) -> str:
        return product.description or _DEFAULT_DESCRIPTION

    def _validate_query(self, query: ProductListQuery) -> None:
        if query.category_id and query.category_id not in VALID_CATEGORIES:
            raise InvalidCatalogQuery("category_id")
        if query.max_price_rub is not None and not (500 <= query.max_price_rub <= 7000):
            raise InvalidCatalogQuery("max_price_rub")
        if query.sort not in VALID_SORT:
            raise InvalidCatalogQuery("sort")
        if not (1 <= query.limit <= 100):
            raise InvalidCatalogQuery("limit")
        if query.offset < 0:
            raise InvalidCatalogQuery("offset")
        unknown = [prop for prop in query.properties if prop not in VALID_PROPERTIES]
        if unknown:
            raise InvalidCatalogQuery("property")

    def _sort(self, items: list[Product], sort: str) -> list[Product]:
        if sort == "price_asc":
            return sorted(items, key=lambda row: row.price_rub)
        if sort == "sale_first":
            return sorted(
                items,
                key=lambda row: (0 if row.compare_at_price_rub else 1, row.price_rub),
            )
        return sorted(items, key=lambda row: row.popularity_score, reverse=True)
