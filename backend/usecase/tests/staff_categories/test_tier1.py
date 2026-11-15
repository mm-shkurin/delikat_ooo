import pytest

from domain.staff.role import StaffRole
from usecase.catalog.live import CATALOG_CHANGED
from usecase.staff_catalog.queries import StaffProductPatch
from usecase.staff_categories.errors import StaffCategoryForbidden
from usecase.tests.staff_catalog.helpers import product as sku
from usecase.tests.staff_catalog.helpers import service as product_service
from usecase.tests.staff_categories.helpers import opened, product, seed_categories


@pytest.mark.asyncio
async def test_manager_creates_category_after_current_maximum():
    categories = [row for row in seed_categories() if row.id != "poultry"]
    service, actor, store, _live = opened(role=StaffRole.MANAGER, categories=categories)

    created = await service.create(actor, "lamb", "  Баранина  ")

    assert created.id == "lamb"
    assert created.title == "Баранина"
    assert created.sort_order == 7
    listed = await service.list_categories(actor)
    assert listed[-1].id == "lamb"
    assert listed[-1].sort_order == 7
    assert store.categories["lamb"].sort_order == 7


@pytest.mark.asyncio
async def test_owner_rename_keeps_id():
    service, actor, store, _live = opened(categories=seed_categories())

    renamed = await service.rename(actor, "beef", "Мраморная говядина")

    assert renamed.id == "beef"
    assert renamed.title == "Мраморная говядина"
    assert store.categories["beef"].id == "beef"


@pytest.mark.asyncio
async def test_reorder_rewrites_visible_numbers():
    service, actor, _store, _live = opened(categories=seed_categories()[:2])

    rows = await service.reorder(actor, ["pork", "beef"])

    assert [row.sort_order for row in rows] == [1, 2]
    assert [row.id for row in rows] == ["pork", "beef"]


@pytest.mark.asyncio
async def test_delete_removes_category_and_its_products_only():
    past_order = {"product_name": "RIB", "unit_price_rub": 1000}
    service, actor, store, _live = opened(
        categories=seed_categories()[:2],
        products=[
            product("rib", "beef"),
            product("rib-hidden", "beef", hidden=True),
            product("ham", "pork"),
        ],
    )

    await service.delete(actor, "beef")

    assert "beef" not in store.categories
    assert "rib" not in store.products
    assert "rib-hidden" not in store.products
    assert "ham" in store.products
    assert past_order == {"product_name": "RIB", "unit_price_rub": 1000}


@pytest.mark.asyncio
async def test_cashier_cannot_read_or_change_categories():
    service, actor, _store, _live = opened(role=StaffRole.CASHIER, categories=seed_categories())

    with pytest.raises(StaffCategoryForbidden):
        await service.list_categories(actor)
    with pytest.raises(StaffCategoryForbidden):
        await service.create(actor, "lamb", "Баранина")
    with pytest.raises(StaffCategoryForbidden):
        await service.rename(actor, "beef", "Другое")
    with pytest.raises(StaffCategoryForbidden):
        await service.reorder(actor, ["beef"])
    with pytest.raises(StaffCategoryForbidden):
        await service.delete(actor, "beef")


@pytest.mark.asyncio
async def test_category_write_signals_and_price_edit_does_not():
    service, actor, _store, live = opened(role=StaffRole.MANAGER, categories=seed_categories())

    await service.create(actor, "lamb", "Баранина")

    assert live.frames == [CATALOG_CHANGED]
    assert set(live.frames[0]) == {"type"}
    products, product_actor, _catalog = product_service(products=[sku("rib")])
    await products.patch_product(product_actor, "rib", StaffProductPatch(price_rub=1200))
    assert live.frames == [CATALOG_CHANGED]
