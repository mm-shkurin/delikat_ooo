import pytest

from domain.catalog.category import Category
from domain.staff.role import StaffRole
from usecase.catalog.errors import InvalidCatalogQuery
from usecase.catalog.queries import ProductListQuery
from usecase.catalog.service import CatalogService
from usecase.staff_categories.errors import (
    BAD_ID,
    EMPTY_TITLE,
    FAILED,
    LONG_TITLE,
    MISSING,
    RESERVED,
    TAKEN,
    StaffCategoryFailure,
    StaffCategoryForbidden,
)
from usecase.tests.catalog.fakes import FakeCatalogRepository
from usecase.tests.staff_categories.helpers import buyer, opened, product, seed_categories


@pytest.mark.asyncio
async def test_id_all_is_reserved_and_not_stored():
    service, actor, store, live = opened(role=StaffRole.MANAGER, categories=seed_categories())

    with pytest.raises(StaffCategoryFailure) as caught:
        await service.create(actor, "all", "Все")

    assert caught.value.code == "category_id_reserved"
    assert caught.value.message == RESERVED
    assert "all" not in store.categories
    assert live.frames == []


@pytest.mark.asyncio
async def test_duplicate_id_keeps_the_existing_title():
    service, actor, store, _live = opened(role=StaffRole.MANAGER, categories=seed_categories())

    with pytest.raises(StaffCategoryFailure) as caught:
        await service.create(actor, "beef", "Другая")

    assert caught.value.code == "category_id_taken"
    assert caught.value.message == TAKEN
    assert store.categories["beef"].title == "Говядина"


@pytest.mark.asyncio
async def test_title_longer_than_120_is_not_truncated():
    service, actor, store, _live = opened(role=StaffRole.MANAGER, categories=[])
    title = "я" * 121

    with pytest.raises(StaffCategoryFailure) as caught:
        await service.create(actor, "lamb", f"  {title}  ")

    assert caught.value.code == "validation_error"
    assert caught.value.message == LONG_TITLE
    assert store.categories == {}


@pytest.mark.asyncio
async def test_unknown_public_category_is_rejected():
    catalog = CatalogService(FakeCatalogRepository(categories=[Category("beef", "Говядина", 1)]))

    with pytest.raises(InvalidCatalogQuery):
        await catalog.list_products(ProductListQuery("missing", None, (), "pop", 16, 0))
    with pytest.raises(InvalidCatalogQuery):
        await catalog.list_products(ProductListQuery("Bad", None, (), "pop", 16, 0))


@pytest.mark.asyncio
async def test_partial_order_keeps_previous_numbers():
    service, actor, store, live = opened(role=StaffRole.MANAGER, categories=seed_categories()[:3])
    before = {row.id: row.sort_order for row in store.categories.values()}

    with pytest.raises(StaffCategoryFailure) as caught:
        await service.reorder(actor, ["beef", "pork"])

    assert caught.value.message == FAILED
    assert {row.id: row.sort_order for row in store.categories.values()} == before
    assert live.frames == []


@pytest.mark.asyncio
async def test_rename_missing_category():
    service, actor, _store, live = opened(role=StaffRole.MANAGER, categories=seed_categories())

    with pytest.raises(StaffCategoryFailure) as caught:
        await service.rename(actor, "gone", "Нет")

    assert caught.value.code == "category_not_found"
    assert caught.value.message == MISSING
    assert caught.value.status == 404
    assert live.frames == []


@pytest.mark.asyncio
async def test_staff_count_includes_hidden_products():
    service, actor, _store, _live = opened(
        role=StaffRole.MANAGER,
        categories=seed_categories()[:1],
        products=[product("live", "beef"), product("hidden", "beef", hidden=True)],
    )

    rows = await service.list_categories(actor)

    assert rows[0].product_count == 2
    assert not hasattr(rows[0], "public_count")


@pytest.mark.asyncio
async def test_buyer_cannot_call_staff_categories():
    service, _actor, _store, _live = opened(categories=seed_categories())

    with pytest.raises(StaffCategoryForbidden):
        await service.list_categories(buyer())
    with pytest.raises(StaffCategoryForbidden):
        await service.create(buyer(), "lamb", "Баранина")


@pytest.mark.asyncio
async def test_empty_title_and_bad_id_are_validation_errors():
    service, actor, store, _live = opened(role=StaffRole.MANAGER, categories=[])

    with pytest.raises(StaffCategoryFailure) as empty:
        await service.create(actor, "lamb", "   ")
    with pytest.raises(StaffCategoryFailure) as bad:
        await service.create(actor, "Lamb", "Баранина")

    assert empty.value.message == EMPTY_TITLE
    assert bad.value.message == BAD_ID
    assert store.categories == {}
