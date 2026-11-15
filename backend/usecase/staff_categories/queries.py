from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class StaffCategory:
    id: str
    title: str
    sort_order: int
    product_count: int
