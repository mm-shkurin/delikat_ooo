from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, LargeBinary, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from adapters.db.base import Base
from domain.catalog.category import Category
from domain.catalog.product import Product


class CategoryRow(Base):
    __tablename__ = "catalog_categories"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)

    def to_domain(self) -> Category:
        return Category(id=self.id, title=self.title, sort_order=self.sort_order)


class ProductRow(Base):
    __tablename__ = "catalog_products"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category_id: Mapped[str] = mapped_column(String(32), ForeignKey("catalog_categories.id"), nullable=False)
    default_weight_label: Mapped[str] = mapped_column(String(32), nullable=False)
    price_rub: Mapped[int] = mapped_column(Integer, nullable=False)
    compare_at_price_rub: Mapped[int | None] = mapped_column(Integer, nullable=True)
    popularity_score: Mapped[int] = mapped_column(Integer, nullable=False)
    properties: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    badge: Mapped[str | None] = mapped_column(String(8), nullable=True)
    marble_grade_label: Mapped[str | None] = mapped_column(String(64), nullable=True)
    image_url: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    hidden: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    image_bytes: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    image_content_type: Mapped[str | None] = mapped_column(String(64), nullable=True)

    def to_domain(self) -> Product:
        return Product(
            id=self.id,
            name=self.name,
            category_id=self.category_id,
            default_weight_label=self.default_weight_label,
            price_rub=self.price_rub,
            compare_at_price_rub=self.compare_at_price_rub,
            popularity_score=self.popularity_score,
            properties=tuple(self.properties),
            badge=self.badge,
            marble_grade_label=self.marble_grade_label,
            image_url=self.image_url,
            description=self.description,
            hidden=self.hidden,
            created_at=self.created_at,
        )

    def apply(self, product: Product) -> None:
        self.name = product.name
        self.category_id = product.category_id
        self.default_weight_label = product.default_weight_label
        self.price_rub = product.price_rub
        self.compare_at_price_rub = product.compare_at_price_rub
        self.popularity_score = product.popularity_score
        self.properties = list(product.properties)
        self.badge = product.badge
        self.marble_grade_label = product.marble_grade_label
        self.image_url = product.image_url
        self.description = product.description
        self.hidden = product.hidden
        if product.created_at is not None:
            self.created_at = product.created_at
