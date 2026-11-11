from datetime import UTC, datetime
from uuid import uuid4

from domain.account.account import Account
from domain.catalog.category import Category
from domain.catalog.product import Product
from domain.staff.member import StaffMember
from domain.staff.role import StaffRole
from usecase.staff_catalog.service import StaffCatalogService
from usecase.tests.staff.fakes import FakeStaffStore
from usecase.tests.staff_catalog.fakes import FakeStaffCatalogStore

JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 32
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32
T0 = datetime(2026, 11, 1, tzinfo=UTC)


def account(email: str = "owner@example.com") -> Account:
    return Account(
        id=uuid4(),
        yandex_subject=f"sub-{email}",
        email=email,
        provider_name=email.split("@")[0],
        created_at=T0,
        profile_name=None,
        avatar_url=None,
    )


def product(
    product_id: str,
    *,
    badge: str | None = None,
    hidden: bool = False,
    created_at: datetime | None = None,
    name: str | None = None,
) -> Product:
    return Product(
        id=product_id,
        name=name or product_id.upper(),
        category_id="beef",
        default_weight_label="~350 г",
        price_rub=1000,
        compare_at_price_rub=1500 if badge == "SALE" else None,
        popularity_score=50,
        properties=("fresh",),
        badge=badge,
        marble_grade_label=None,
        image_url=f"/assets/{product_id}.jpg",
        description=None,
        hidden=hidden,
        created_at=created_at or T0,
    )


def service(
    *,
    role: StaffRole = StaffRole.OWNER,
    products: list[Product] | None = None,
    actor: Account | None = None,
) -> tuple[StaffCatalogService, Account, FakeStaffCatalogStore]:
    user = actor or account()
    member = StaffMember.active_for(user, role)
    catalog = FakeStaffCatalogStore(
        products=products,
        categories=[Category(id="beef", title="Говядина", sort_order=1)],
    )
    return StaffCatalogService(FakeStaffStore([member]), catalog), user, catalog
