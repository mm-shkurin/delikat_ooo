from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Category:
    id: str
    title: str
    sort_order: int
