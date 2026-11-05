from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Product:
    id: str
    name: str
    category_id: str
    default_weight_label: str
    price_rub: int
    compare_at_price_rub: int | None
    popularity_score: int
    properties: tuple[str, ...]
    badge: str | None
    marble_grade_label: str | None
    image_url: str
    description: str | None = None
