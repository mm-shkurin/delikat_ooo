from datetime import UTC, datetime

from domain.account.account import Account
from domain.catalog.product import Product, ProductImage
from domain.staff.role import StaffStatus, can_write_catalog
from usecase.staff.ports import StaffStore
from usecase.staff_catalog.errors import (
    CategoryNotFound,
    MediaNotFound,
    ProductIdTaken,
    StaffCatalogForbidden,
    StaffCatalogValidation,
    StaffProductNotFound,
)
from usecase.staff_catalog.ports import StaffCatalogStore
from usecase.staff_catalog.queries import (
    VALID_VISIBILITY,
    StaffProductDraft,
    StaffProductListQuery,
    StaffProductPatch,
    sort_staff_products,
)
from usecase.staff_catalog.validation import (
    apply_patch,
    detect_image,
    media_url,
    validate_draft,
)


class StaffCatalogService:
    def __init__(self, staff: StaffStore, catalog: StaffCatalogStore) -> None:
        self._staff = staff
        self._catalog = catalog

    async def list_products(self, actor: Account, query: StaffProductListQuery) -> list[Product]:
        await self._require_writer(actor)
        if query.visibility not in VALID_VISIBILITY:
            raise StaffCatalogValidation("visibility is not valid")
        rows = await self._catalog.list_staff_products(query)
        return sort_staff_products(rows)

    async def create_product(
        self,
        actor: Account,
        draft: StaffProductDraft,
        image: bytes,
        content_type: str | None = None,
    ) -> Product:
        await self._require_writer(actor)
        clean = validate_draft(draft)
        sniffed = detect_image(image, content_type)
        if await self._catalog.get_product(clean.id) is not None:
            raise ProductIdTaken()
        if not await self._catalog.category_exists(clean.category_id):
            raise CategoryNotFound()
        now = datetime.now(UTC)
        product = Product(
            id=clean.id,
            name=clean.name,
            category_id=clean.category_id,
            default_weight_label=clean.default_weight_label,
            price_rub=clean.price_rub,
            compare_at_price_rub=clean.compare_at_price_rub,
            popularity_score=clean.popularity_score,
            properties=clean.properties,
            badge=clean.badge,
            marble_grade_label=clean.marble_grade_label,
            image_url=media_url(clean.id),
            description=clean.description,
            hidden=clean.hidden,
            created_at=now,
        )
        saved = await self._catalog.save_product(product)
        return await self._catalog.put_image(saved.id, image, sniffed)

    async def patch_product(self, actor: Account, product_id: str, patch: StaffProductPatch) -> Product:
        await self._require_writer(actor)
        if not any(
            [
                patch.name is not None,
                patch.category_id is not None,
                patch.default_weight_label is not None,
                patch.price_rub is not None,
                patch.compare_at_price_rub is not None,
                patch.clear_compare_at,
                patch.popularity_score is not None,
                patch.properties is not None,
                patch.badge is not None,
                patch.clear_badge,
                patch.marble_grade_label is not None,
                patch.clear_marble,
                patch.description is not None,
                patch.clear_description,
                patch.hidden is not None,
            ]
        ):
            raise StaffCatalogValidation("patch body is empty")
        current = await self._load(product_id)
        updated = apply_patch(current, patch)
        if updated.category_id != current.category_id:
            if not await self._catalog.category_exists(updated.category_id):
                raise CategoryNotFound()
        return await self._catalog.save_product(updated)

    async def replace_image(
        self,
        actor: Account,
        product_id: str,
        image: bytes,
        content_type: str | None = None,
    ) -> Product:
        await self._require_writer(actor)
        await self._load(product_id)
        sniffed = detect_image(image, content_type)
        return await self._catalog.put_image(product_id, image, sniffed)

    async def get_media(self, product_id: str) -> ProductImage:
        image = await self._catalog.get_image(product_id)
        if image is None:
            raise MediaNotFound()
        return image

    async def _load(self, product_id: str) -> Product:
        row = await self._catalog.get_product(product_id)
        if row is None:
            raise StaffProductNotFound()
        return row

    async def _require_writer(self, actor: Account) -> None:
        member = await self._staff.get_by_user_id(actor.id)
        if member is None or member.status is not StaffStatus.ACTIVE:
            raise StaffCatalogForbidden()
        if not can_write_catalog(member.role):
            raise StaffCatalogForbidden()
