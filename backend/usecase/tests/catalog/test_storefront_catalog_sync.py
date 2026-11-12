from dataclasses import replace
from datetime import UTC, datetime
from uuid import uuid4

import pytest

from domain.catalog.product import Product
from usecase.cart.service import CartService
from usecase.catalog.errors import ProductNotFound
from usecase.catalog.queries import ProductListQuery
from usecase.catalog.service import CatalogService
from usecase.tests.cart.fakes import FakeCartRepository, FakeCatalogForCart
from usecase.tests.catalog.fakes import FakeCatalogRepository

_T0 = datetime(2026, 1, 1, tzinfo=UTC)


def _product(
    product_id: str,
    *,
    name: str | None = None,
    category_id: str = "beef",
    price_rub: int = 1000,
    compare_at_price_rub: int | None = None,
    badge: str | None = None,
    image_url: str | None = None,
    hidden: bool = False,
) -> Product:
    return Product(
        id=product_id,
        name=name or product_id.upper(),
        category_id=category_id,
        default_weight_label="~350 г",
        price_rub=price_rub,
        compare_at_price_rub=compare_at_price_rub,
        popularity_score=50,
        properties=("fresh",),
        badge=badge,
        marble_grade_label=None,
        image_url=image_url or f"/assets/{product_id}.jpg",
        hidden=hidden,
        created_at=_T0,
    )


@pytest.mark.asyncio
async def test_hidden_products_excluded_from_buyer_list():
    live = _product("live")
    hidden = _product("gone", hidden=True)
    service = CatalogService(FakeCatalogRepository(products=[live, hidden]))

    result = await service.list_products(ProductListQuery(None, None, (), "pop", 16, 0))

    assert [row.id for row in result.items] == ["live"]
    assert result.total_count == 1


@pytest.mark.asyncio
async def test_hidden_detail_same_as_missing():
    service = CatalogService(
        FakeCatalogRepository(products=[_product("gone", hidden=True)])
    )

    with pytest.raises(ProductNotFound):
        await service.get_product("gone")
    with pytest.raises(ProductNotFound):
        await service.get_product("unknown")


@pytest.mark.asyncio
async def test_add_hidden_product_to_cart_fails_as_not_found():
    catalog = FakeCatalogForCart({"gone": _product("gone", hidden=True)})
    carts = FakeCartRepository()
    service = CartService(carts, catalog)
    session = str(uuid4())
    await service.update_fulfillment(session, mode="pickup", city="Омск", street_line=None)

    with pytest.raises(ProductNotFound):
        await service.add_item(session, product_id="gone", quantity=1, weight_label=None)

    cart = await service.get_cart(session)
    assert cart.lines == []


@pytest.mark.asyncio
async def test_staff_name_price_edits_appear_on_buyer_list():
    live = _product("rib", name="Old", price_rub=1000)
    repo = FakeCatalogRepository(products=[live])
    service = CatalogService(repo)
    repo._products[0] = replace(live, name="New Rib", price_rub=1770)

    result = await service.list_products(ProductListQuery(None, None, (), "pop", 16, 0))

    assert result.items[0].name == "New Rib"
    assert result.items[0].price_rub == 1770


@pytest.mark.asyncio
async def test_filters_and_empty_pages_count_only_live():
    service = CatalogService(
        FakeCatalogRepository(
            products=[_product("gone", category_id="sauce", hidden=True)]
        )
    )

    result = await service.list_products(
        ProductListQuery("sauce", None, (), "pop", 16, 0)
    )

    assert result.items == ()
    assert result.total_count == 0


@pytest.mark.asyncio
async def test_buyer_list_returns_staff_badges_on_live_products():
    products = [
        _product("n1", badge="NEW"),
        _product("s1", badge="SALE", compare_at_price_rub=1500),
        _product("t1", badge="TOP"),
    ]
    service = CatalogService(FakeCatalogRepository(products=products))

    result = await service.list_products(ProductListQuery(None, None, (), "pop", 16, 0))

    by_id = {row.id: row for row in result.items}
    assert by_id["n1"].badge == "NEW"
    assert by_id["s1"].badge == "SALE"
    assert by_id["s1"].compare_at_price_rub == 1500
    assert by_id["t1"].badge == "TOP"


@pytest.mark.asyncio
async def test_staff_image_url_visible_on_buyer_list():
    media = "/api/v1/media/products/rib"
    service = CatalogService(
        FakeCatalogRepository(products=[_product("rib", image_url=media)])
    )

    result = await service.list_products(ProductListQuery(None, None, (), "pop", 16, 0))

    assert result.items[0].image_url == media


@pytest.mark.asyncio
async def test_cart_lines_added_before_hide_are_not_auto_removed():
    product = _product("rib")
    catalog = FakeCatalogForCart({"rib": product})
    carts = FakeCartRepository()
    service = CartService(carts, catalog)
    session = str(uuid4())
    await service.update_fulfillment(session, mode="pickup", city="Омск", street_line=None)
    await service.add_item(session, product_id="rib", quantity=1, weight_label=None)

    catalog._products["rib"] = replace(product, hidden=True)

    cart = await service.get_cart(session)
    assert len(cart.lines) == 1
    assert cart.lines[0].product_id == "rib"

    with pytest.raises(ProductNotFound):
        await service.add_item(session, product_id="rib", quantity=1, weight_label=None)
