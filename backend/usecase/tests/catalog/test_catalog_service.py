from datetime import UTC, datetime

import pytest

from domain.catalog.category import Category
from domain.catalog.product import Product
from usecase.catalog.errors import InvalidCatalogQuery, ProductNotFound
from usecase.catalog.queries import ProductListQuery, ProductListResult
from usecase.catalog.service import CatalogService
from usecase.tests.catalog.fakes import FakeCatalogRepository

_T0 = datetime(2026, 1, 1, tzinfo=UTC)


def _sample_products() -> list[Product]:
    return [
        Product(
            id="rib",
            name="Стейк Рибай",
            category_id="marble",
            default_weight_label="~350 г",
            price_rub=1450,
            compare_at_price_rub=None,
            popularity_score=98,
            properties=("chilled", "fresh", "premium"),
            badge="NEW",
            marble_grade_label="4–5",
            image_url="/assets/products/ribeye.jpg",
            created_at=_T0,
        ),
        Product(
            id="beef",
            name="Говядина без кости",
            category_id="beef",
            default_weight_label="за 1 кг",
            price_rub=1290,
            compare_at_price_rub=1490,
            popularity_score=86,
            properties=("chilled", "fresh"),
            badge="SALE",
            marble_grade_label=None,
            image_url="/assets/products/beef.jpg",
            created_at=_T0,
        ),
        Product(
            id="sauce1",
            name="Перечный соус",
            category_id="sauce",
            default_weight_label="120 г",
            price_rub=290,
            compare_at_price_rub=None,
            popularity_score=66,
            properties=("fresh",),
            badge=None,
            marble_grade_label=None,
            image_url="/assets/products/ai-banner.jpg",
            created_at=_T0,
        ),
    ]


@pytest.fixture
def service() -> CatalogService:
    categories = [
        Category(id="beef", title="Говядина", sort_order=1),
        Category(id="sauce", title="Специи", sort_order=6),
    ]
    return CatalogService(FakeCatalogRepository(categories, _sample_products()))


@pytest.mark.asyncio
async def test_list_categories_sorted(service: CatalogService):
    rows = await service.list_categories()
    assert [row.id for row in rows] == ["beef", "sauce"]


@pytest.mark.asyncio
async def test_filter_category_and_price(service: CatalogService):
    result = await service.list_products(
        ProductListQuery(
            category_id="beef",
            max_price_rub=1300,
            properties=(),
            sort="pop",
            limit=16,
            offset=0,
        )
    )
    assert [row.id for row in result.items] == ["beef"]
    assert result.total_count == 1


@pytest.mark.asyncio
async def test_property_or_filter(service: CatalogService):
    result = await service.list_products(
        ProductListQuery(
            category_id=None,
            max_price_rub=None,
            properties=("premium",),
            sort="pop",
            limit=16,
            offset=0,
        )
    )
    assert [row.id for row in result.items] == ["rib"]


@pytest.mark.asyncio
async def test_sort_price_asc(service: CatalogService):
    result = await service.list_products(ProductListQuery(None, None, (), "price_asc", 16, 0))
    assert [row.id for row in result.items] == ["sauce1", "beef", "rib"]


@pytest.mark.asyncio
async def test_pagination(service: CatalogService):
    result = await service.list_products(ProductListQuery(None, None, (), "price_asc", 1, 1))
    assert len(result.items) == 1
    assert result.items[0].id == "beef"
    assert result.total_count == 3


@pytest.mark.asyncio
async def test_invalid_category(service: CatalogService):
    with pytest.raises(InvalidCatalogQuery):
        await service.list_products(ProductListQuery("unknown", None, (), "pop", 16, 0))


@pytest.mark.asyncio
async def test_beef_and_chilled_filter(service: CatalogService):
    result = await service.list_products(ProductListQuery("beef", None, ("chilled",), "pop", 16, 0))
    assert [row.id for row in result.items] == ["beef"]
    assert result.total_count == 1


@pytest.mark.asyncio
async def test_sort_sale_first(service: CatalogService):
    result = await service.list_products(ProductListQuery(None, None, (), "sale_first", 16, 0))
    assert result.items[0].id == "beef"
    assert result.items[0].compare_at_price_rub is not None


@pytest.mark.asyncio
async def test_max_price_out_of_range(service: CatalogService):
    with pytest.raises(InvalidCatalogQuery):
        await service.list_products(ProductListQuery(None, 499, (), "pop", 16, 0))


@pytest.mark.asyncio
async def test_list_products_delegates_the_validated_query():
    seen: dict[str, ProductListQuery] = {}

    class _RecordingCatalog:
        async def list_categories(self):
            return []

        async def list_products(self, query: ProductListQuery) -> ProductListResult:
            seen["query"] = query
            return ProductListResult(items=(), total_count=0, limit=query.limit, offset=query.offset)

        async def get_product(self, product_id: str):
            return None

    query = ProductListQuery("beef", 1300, ("chilled",), "pop", 16, 2)
    result = await CatalogService(_RecordingCatalog()).list_products(query)
    assert seen["query"] == query
    assert result.total_count == 0
    assert result.limit == 16
    assert result.offset == 2


@pytest.mark.asyncio
async def test_get_product_and_not_found(service: CatalogService):
    row = await service.get_product("rib")
    assert row.name.startswith("Стейк")
    assert service.weight_options_for(row)[0] == "~350 г"
    with pytest.raises(ProductNotFound):
        await service.get_product("missing")
