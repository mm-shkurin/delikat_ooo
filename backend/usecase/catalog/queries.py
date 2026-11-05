from dataclasses import dataclass

VALID_CATEGORIES = frozenset({"beef", "pork", "poultry", "marble", "semi", "sauce"})
VALID_SORT = frozenset({"pop", "price_asc", "sale_first"})
VALID_PROPERTIES = frozenset({"chilled", "frozen", "fresh", "premium"})


@dataclass(frozen=True, slots=True)
class ProductListQuery:
    category_id: str | None
    max_price_rub: int | None
    properties: tuple[str, ...]
    sort: str
    limit: int
    offset: int


@dataclass(frozen=True, slots=True)
class ProductListResult:
    items: tuple
    total_count: int
    limit: int
    offset: int
