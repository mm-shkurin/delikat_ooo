from dataclasses import dataclass
from datetime import UTC, datetime

from domain.catalog.product import Product

VALID_VISIBILITY = frozenset({"live", "hidden", "all"})
BADGE_RANK = {"SALE": 0, "NEW": 1, "TOP": 2}
_EPOCH = datetime(1970, 1, 1, tzinfo=UTC)


@dataclass(frozen=True, slots=True)
class StaffProductListQuery:
    q: str | None = None
    visibility: str = "all"


@dataclass(frozen=True, slots=True)
class StaffProductDraft:
    id: str
    name: str
    category_id: str
    default_weight_label: str
    price_rub: int
    popularity_score: int
    properties: tuple[str, ...]
    compare_at_price_rub: int | None = None
    badge: str | None = None
    marble_grade_label: str | None = None
    description: str | None = None
    hidden: bool = False


@dataclass(frozen=True, slots=True)
class StaffProductPatch:
    name: str | None = None
    category_id: str | None = None
    default_weight_label: str | None = None
    price_rub: int | None = None
    compare_at_price_rub: int | None = None
    clear_compare_at: bool = False
    popularity_score: int | None = None
    properties: tuple[str, ...] | None = None
    badge: str | None = None
    clear_badge: bool = False
    marble_grade_label: str | None = None
    clear_marble: bool = False
    description: str | None = None
    clear_description: bool = False
    hidden: bool | None = None


def sort_staff_products(items: list[Product]) -> list[Product]:
    def key(row: Product):
        rank = BADGE_RANK.get(row.badge or "", 3)
        created = row.created_at or _EPOCH
        if created.tzinfo is None:
            created = created.replace(tzinfo=UTC)
        return (rank, -created.timestamp(), row.id)

    return sorted(items, key=key)
