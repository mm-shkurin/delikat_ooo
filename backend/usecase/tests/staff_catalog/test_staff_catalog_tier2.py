import pytest

from domain.catalog.category import Category
from usecase.staff_catalog.errors import (
    CategoryNotFound,
    ProductIdTaken,
    StaffCatalogForbidden,
    StaffCatalogValidation,
)
from usecase.staff_catalog.queries import StaffProductDraft, StaffProductListQuery, StaffProductPatch
from usecase.staff_catalog.service import StaffCatalogService
from usecase.tests.staff.fakes import FakeStaffStore
from usecase.tests.staff_catalog.fakes import FakeStaffCatalogStore
from usecase.tests.staff_catalog.helpers import JPEG, PNG, account, product, service


@pytest.mark.asyncio
async def test_duplicate_product_id_rejected():
    svc, actor, catalog = service(products=[product("rib")])
    with pytest.raises(ProductIdTaken):
        await svc.create_product(
            actor,
            StaffProductDraft(
                id="rib",
                name="Dup",
                category_id="beef",
                default_weight_label="1",
                price_rub=10,
                popularity_score=1,
                properties=(),
            ),
            JPEG,
        )
    assert (await catalog.get_product("rib")).name == "RIB"


@pytest.mark.asyncio
async def test_sale_without_compare_at_rejected():
    svc, actor, _ = service()
    with pytest.raises(StaffCatalogValidation):
        await svc.create_product(
            actor,
            StaffProductDraft(
                id="sale1",
                name="Sale",
                category_id="beef",
                default_weight_label="1",
                price_rub=100,
                popularity_score=1,
                properties=(),
                badge="SALE",
                compare_at_price_rub=None,
            ),
            JPEG,
        )


@pytest.mark.asyncio
async def test_search_matches_name_or_id():
    products = [
        product("rib", name="Стейк Рибай"),
        product("sauce", name="Соус"),
    ]
    svc, actor, _ = service(products=products)
    by_name = await svc.list_products(actor, StaffProductListQuery(q="риб"))
    by_id = await svc.list_products(actor, StaffProductListQuery(q="rib"))
    assert [row.id for row in by_name] == ["rib"]
    assert [row.id for row in by_id] == ["rib"]


@pytest.mark.asyncio
async def test_create_without_image_rejected():
    svc, actor, _ = service()
    with pytest.raises(StaffCatalogValidation):
        await svc.create_product(
            actor,
            StaffProductDraft(
                id="noimg",
                name="No",
                category_id="beef",
                default_weight_label="1",
                price_rub=10,
                popularity_score=1,
                properties=(),
            ),
            b"",
        )


@pytest.mark.asyncio
async def test_unknown_category_rejected():
    svc, actor, _ = service()
    with pytest.raises(CategoryNotFound):
        await svc.create_product(
            actor,
            StaffProductDraft(
                id="orphan",
                name="Orphan",
                category_id="missing",
                default_weight_label="1",
                price_rub=10,
                popularity_score=1,
                properties=(),
            ),
            JPEG,
        )


@pytest.mark.asyncio
async def test_non_staff_forbidden():
    buyer = account("buyer@example.com")
    catalog = FakeStaffCatalogStore(categories=[Category(id="beef", title="B", sort_order=1)])
    svc = StaffCatalogService(FakeStaffStore([]), catalog)
    with pytest.raises(StaffCatalogForbidden):
        await svc.list_products(buyer, StaffProductListQuery())


@pytest.mark.asyncio
async def test_replace_image_updates_bytes():
    svc, actor, _ = service()
    await svc.create_product(
        actor,
        StaffProductDraft(
            id="swap",
            name="Swap",
            category_id="beef",
            default_weight_label="1",
            price_rub=10,
            popularity_score=1,
            properties=(),
        ),
        JPEG,
    )
    updated = await svc.replace_image(actor, "swap", PNG)
    assert updated.image_url == "/api/v1/media/products/swap"
    media = await svc.get_media("swap")
    assert media.content_type == "image/png"


@pytest.mark.asyncio
async def test_badge_cleared_to_unmarked():
    row = product("rib", badge="NEW")
    svc, actor, _ = service(products=[row])
    updated = await svc.patch_product(actor, "rib", StaffProductPatch(clear_badge=True))
    assert updated.badge is None
    rows = await svc.list_products(actor, StaffProductListQuery())
    assert rows[0].badge is None
