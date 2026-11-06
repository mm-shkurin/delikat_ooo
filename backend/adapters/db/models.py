from datetime import datetime
from uuid import UUID

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from adapters.db.base import Base
from domain.account.account import Account
from domain.cart.models import Cart, CartLine, DeliveryAddress, Fulfillment
from domain.catalog.category import Category
from domain.catalog.product import Product
from domain.staff.member import StaffMember
from domain.staff.role import StaffRole, StaffStatus


class AccountRow(Base):
    __tablename__ = "accounts"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    yandex_subject: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    provider_name: Mapped[str] = mapped_column(String(64), nullable=False)
    profile_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    def to_domain(self) -> Account:
        return Account(
            id=self.id,
            yandex_subject=self.yandex_subject,
            email=self.email,
            provider_name=self.provider_name,
            created_at=self.created_at,
            profile_name=self.profile_name,
            avatar_url=self.avatar_url,
        )

    def apply(self, account: Account) -> None:
        self.email = account.email
        self.provider_name = account.provider_name
        self.profile_name = account.profile_name
        self.avatar_url = account.avatar_url


class StaffMemberRow(Base):
    __tablename__ = "staff_members"

    member_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    role: Mapped[str] = mapped_column(String(16), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False)
    user_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("accounts.id"), nullable=True)

    def to_domain(self) -> StaffMember:
        return StaffMember(
            member_id=self.member_id,
            email=self.email,
            role=StaffRole(self.role),
            status=StaffStatus(self.status),
            user_id=self.user_id,
            display_name=None,
        )

    def apply(self, member) -> None:
        self.email = member.email
        self.role = member.role.value
        self.status = member.status.value
        self.user_id = member.user_id


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
        )


class ShopCartRow(Base):
    __tablename__ = "shop_carts"

    session_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    fulfillment_mode: Mapped[str] = mapped_column(String(16), nullable=False)
    city: Mapped[str] = mapped_column(String(64), nullable=False)
    street_line: Mapped[str | None] = mapped_column(String(80), nullable=True)
    lines: Mapped[list["CartLineRow"]] = relationship(back_populates="cart", cascade="all, delete-orphan")

    def to_domain(self) -> Cart:
        fulfillment = Fulfillment(
            mode=self.fulfillment_mode,
            address=DeliveryAddress(city=self.city, street_line=self.street_line),
        )
        return Cart(
            session_id=self.session_id,
            fulfillment=fulfillment,
            lines=[line.to_domain() for line in self.lines],
        )

    def apply(self, cart: Cart) -> None:
        self.fulfillment_mode = cart.fulfillment.mode
        self.city = cart.fulfillment.address.city
        self.street_line = cart.fulfillment.address.street_line


class CartLineRow(Base):
    __tablename__ = "cart_lines"

    line_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("shop_carts.session_id"), nullable=False)
    product_id: Mapped[str] = mapped_column(String(64), nullable=False)
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    weight_label: Mapped[str] = mapped_column(String(32), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price_rub: Mapped[int] = mapped_column(Integer, nullable=False)
    cart: Mapped[ShopCartRow] = relationship(back_populates="lines")

    def to_domain(self) -> CartLine:
        return CartLine(
            line_id=self.line_id,
            product_id=self.product_id,
            product_name=self.product_name,
            weight_label=self.weight_label,
            quantity=self.quantity,
            unit_price_rub=self.unit_price_rub,
        )


class OrderRow(Base):
    __tablename__ = "shop_orders"

    order_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    idempotency_key: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), unique=True, nullable=False)
    session_id: Mapped[str] = mapped_column(String(36), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    total_rub: Mapped[int] = mapped_column(Integer, nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    customer_note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    fulfillment_mode: Mapped[str] = mapped_column(String(16), nullable=False)
    city: Mapped[str] = mapped_column(String(64), nullable=False)
    street_line: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    lines: Mapped[list["OrderLineRow"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class OrderLineRow(Base):
    __tablename__ = "shop_order_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("shop_orders.order_id"), nullable=False)
    product_id: Mapped[str] = mapped_column(String(64), nullable=False)
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    weight_label: Mapped[str] = mapped_column(String(32), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price_rub: Mapped[int] = mapped_column(Integer, nullable=False)
    line_total_rub: Mapped[int] = mapped_column(Integer, nullable=False)
    order: Mapped[OrderRow] = relationship(back_populates="lines")
