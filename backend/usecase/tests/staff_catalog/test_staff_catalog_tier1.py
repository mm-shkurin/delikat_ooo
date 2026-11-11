from datetime import timedelta

import pytest

from domain.staff.role import StaffRole
from usecase.staff_catalog.errors import StaffCatalogForbidden
from usecase.staff_catalog.queries import StaffProductDraft, StaffProductListQuery, StaffProductPatch
from usecase.tests.staff_catalog.helpers import JPEG, PNG, T0, product, service


@pytest.mark.asyncio
async def test_manager_creates_product_with_image():
    svc, actor, catalog = service(role=StaffRole.MANAGER)
    draft = StaffProductDraft(
        id="rib-new",
        name="Рибай",
        category_id="beef",
        default_weight_label="~350 г",
        price_rub=1450,
        popularity_score=90,
        properties=("chilled", "fresh"),
    )
    created = await svc.create_product(actor, draft, JPEG, "image/jpeg")
    assert created.id == "rib-new"
    assert created.image_url == "/api/v1/media/products/rib-new"
    assert created.created_at is not None
    listed = await svc.list_products(actor, StaffProductListQuery())
    assert any(row.id == "rib-new" for row in listed)
    media = await svc.get_media("rib-new")
    assert media.content_type == "image/jpeg"
    assert media.data.startswith(b"\xff\xd8\xff")
    assert await catalog.get_product("rib-new") is not None


@pytest.mark.asyncio
async def test_owner_patches_name_and_price_keeps_created_at():
    created_at = T0 - timedelta(days=2)
    row = product("rib", created_at=created_at, name="Old")
    svc, actor, _ = service(products=[row])
    updated = await svc.patch_product(
        actor,
        "rib",
        StaffProductPatch(name="Стейк Рибай", price_rub=1600),
    )
    assert updated.name == "Стейк Рибай"
    assert updated.price_rub == 1600
    assert updated.id == "rib"
    assert updated.created_at == created_at


@pytest.mark.asyncio
async def test_soft_hide_visibility_filter():
    live = product("live-sku", hidden=False)
    hidden = product("hide-sku", hidden=True)
    svc, actor, _ = service(products=[live, hidden])
    await svc.patch_product(actor, "live-sku", StaffProductPatch(hidden=True))
    hidden_rows = await svc.list_products(actor, StaffProductListQuery(visibility="hidden"))
    live_rows = await svc.list_products(actor, StaffProductListQuery(visibility="live"))
    assert {row.id for row in hidden_rows} == {"live-sku", "hide-sku"}
    assert all(row.id != "live-sku" for row in live_rows)
    assert all(not row.hidden for row in live_rows)


@pytest.mark.asyncio
async def test_cashier_cannot_list_or_write():
    svc, actor, _ = service(role=StaffRole.CASHIER, products=[product("rib")])
    with pytest.raises(StaffCatalogForbidden):
        await svc.list_products(actor, StaffProductListQuery())
    with pytest.raises(StaffCatalogForbidden):
        await svc.create_product(
            actor,
            StaffProductDraft(
                id="x",
                name="X",
                category_id="beef",
                default_weight_label="1",
                price_rub=10,
                popularity_score=1,
                properties=(),
            ),
            JPEG,
        )
    with pytest.raises(StaffCatalogForbidden):
        await svc.patch_product(actor, "rib", StaffProductPatch(hidden=True))


@pytest.mark.asyncio
async def test_staff_list_sorts_sale_new_top_then_unmarked():
    older = T0 - timedelta(days=1)
    products = [
        product("u1", badge=None, created_at=T0),
        product("n-old", badge="NEW", created_at=older),
        product("n-new", badge="NEW", created_at=T0),
        product("t1", badge="TOP", created_at=T0),
        product("s1", badge="SALE", created_at=older),
    ]
    svc, actor, _ = service(products=products)
    rows = await svc.list_products(actor, StaffProductListQuery())
    assert [row.id for row in rows] == ["s1", "n-new", "n-old", "t1", "u1"]


@pytest.mark.asyncio
async def test_anonymous_media_returns_uploaded_bytes():
    svc, actor, _ = service(role=StaffRole.OWNER)
    await svc.create_product(
        actor,
        StaffProductDraft(
            id="img1",
            name="Img",
            category_id="beef",
            default_weight_label="1",
            price_rub=10,
            popularity_score=1,
            properties=(),
        ),
        PNG,
    )
    media = await svc.get_media("img1")
    assert media.content_type == "image/png"
    assert media.data.startswith(b"\x89PNG")
