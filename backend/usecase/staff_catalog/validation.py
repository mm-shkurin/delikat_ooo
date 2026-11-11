import json
import re
from dataclasses import replace

from domain.catalog.product import Product
from usecase.catalog.queries import VALID_PROPERTIES
from usecase.staff_catalog.errors import StaffCatalogValidation
from usecase.staff_catalog.queries import StaffProductDraft, StaffProductPatch

_ID = re.compile(r"^[a-z][a-z0-9-]{0,31}$")
_BADGES = frozenset({"NEW", "SALE", "TOP"})
_MAX_IMAGE = 2 * 1024 * 1024
_MEDIA_PREFIX = "/api/v1/media/products/"


def media_url(product_id: str) -> str:
    return f"{_MEDIA_PREFIX}{product_id}"


def parse_properties(raw: str | list | tuple | None) -> tuple[str, ...]:
    if raw is None:
        return ()
    if isinstance(raw, (list, tuple)):
        values = list(raw)
    else:
        text = str(raw).strip()
        if not text:
            return ()
        try:
            values = json.loads(text)
        except json.JSONDecodeError as exc:
            raise StaffCatalogValidation("properties is not valid JSON") from exc
    if not isinstance(values, list):
        raise StaffCatalogValidation("properties must be a list")
    out: list[str] = []
    for item in values:
        if item not in VALID_PROPERTIES:
            raise StaffCatalogValidation("property is not valid")
        out.append(str(item))
    return tuple(out)


def normalize_badge(value: str | None) -> str | None:
    if value is None:
        return None
    text = value.strip()
    if not text:
        return None
    if text not in _BADGES:
        raise StaffCatalogValidation("badge is not valid")
    return text


def detect_image(data: bytes, declared: str | None = None) -> str:
    if not data:
        raise StaffCatalogValidation("image is required")
    if len(data) > _MAX_IMAGE:
        raise StaffCatalogValidation("image exceeds 2 MiB")
    content_type = _sniff(data)
    if content_type is None:
        raise StaffCatalogValidation("image must be jpeg, png, or webp")
    if declared and declared not in {content_type, "image/jpg"} and not (
        declared == "image/jpg" and content_type == "image/jpeg"
    ):
        # Prefer sniffed type; reject only clear mismatch with unsupported declared.
        if declared not in {"image/jpeg", "image/png", "image/webp", "image/jpg"}:
            raise StaffCatalogValidation("image content type is not allowed")
    return content_type


def validate_draft(draft: StaffProductDraft) -> StaffProductDraft:
    if not _ID.match(draft.id):
        raise StaffCatalogValidation("id is not valid")
    _require_text(draft.name, "name")
    _require_text(draft.default_weight_label, "default_weight_label")
    _require_text(draft.category_id, "category_id")
    _price(draft.price_rub)
    _popularity(draft.popularity_score)
    badge = normalize_badge(draft.badge)
    compare = draft.compare_at_price_rub
    _sale_rules(badge, draft.price_rub, compare)
    for prop in draft.properties:
        if prop not in VALID_PROPERTIES:
            raise StaffCatalogValidation("property is not valid")
    return replace(draft, badge=badge, name=draft.name.strip(), default_weight_label=draft.default_weight_label.strip())


def apply_patch(product: Product, patch: StaffProductPatch) -> Product:
    name = product.name if patch.name is None else patch.name
    category_id = product.category_id if patch.category_id is None else patch.category_id
    weight = product.default_weight_label if patch.default_weight_label is None else patch.default_weight_label
    price = product.price_rub if patch.price_rub is None else patch.price_rub
    popularity = product.popularity_score if patch.popularity_score is None else patch.popularity_score
    properties = product.properties if patch.properties is None else patch.properties
    if patch.clear_compare_at:
        compare = None
    elif patch.compare_at_price_rub is not None:
        compare = patch.compare_at_price_rub
    else:
        compare = product.compare_at_price_rub
    if patch.clear_badge:
        badge = None
    elif patch.badge is not None:
        badge = normalize_badge(patch.badge)
    else:
        badge = product.badge
    if patch.clear_marble:
        marble = None
    elif patch.marble_grade_label is not None:
        marble = patch.marble_grade_label
    else:
        marble = product.marble_grade_label
    if patch.clear_description:
        description = None
    elif patch.description is not None:
        description = patch.description
    else:
        description = product.description
    hidden = product.hidden if patch.hidden is None else patch.hidden
    draft = StaffProductDraft(
        id=product.id,
        name=name,
        category_id=category_id,
        default_weight_label=weight,
        price_rub=price,
        popularity_score=popularity,
        properties=properties,
        compare_at_price_rub=compare,
        badge=badge,
        marble_grade_label=marble,
        description=description,
        hidden=hidden,
    )
    clean = validate_draft(draft)
    return replace(
        product,
        name=clean.name,
        category_id=clean.category_id,
        default_weight_label=clean.default_weight_label,
        price_rub=clean.price_rub,
        compare_at_price_rub=clean.compare_at_price_rub,
        popularity_score=clean.popularity_score,
        properties=clean.properties,
        badge=clean.badge,
        marble_grade_label=clean.marble_grade_label,
        description=clean.description,
        hidden=clean.hidden,
    )


def _require_text(value: str, field: str) -> None:
    if not value or not value.strip():
        raise StaffCatalogValidation(f"{field} is required")


def _price(value: int) -> None:
    if not isinstance(value, int) or isinstance(value, bool) or not (1 <= value <= 99999):
        raise StaffCatalogValidation("price_rub is not valid")


def _popularity(value: int) -> None:
    if not isinstance(value, int) or isinstance(value, bool) or not (0 <= value <= 100):
        raise StaffCatalogValidation("popularity_score is not valid")


def _sale_rules(badge: str | None, price: int, compare: int | None) -> None:
    if compare is not None and (not isinstance(compare, int) or isinstance(compare, bool) or compare < 1):
        raise StaffCatalogValidation("compare_at_price_rub is not valid")
    if badge == "SALE":
        if compare is None or compare <= price:
            raise StaffCatalogValidation("compare_at_price_rub must be greater than price_rub for SALE")
    if compare is not None and compare <= price:
        raise StaffCatalogValidation("compare_at_price_rub must be greater than price_rub")


def _sniff(data: bytes) -> str | None:
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None
