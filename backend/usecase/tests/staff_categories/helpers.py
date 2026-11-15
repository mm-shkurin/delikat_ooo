from uuid import uuid4

from domain.account.account import Account
from domain.catalog.product import Product
from domain.staff.member import StaffMember
from domain.staff.role import StaffRole
from usecase.staff_categories.queries import StaffCategory
from usecase.staff_categories.service import StaffCategoryService
from usecase.tests.staff.fakes import FakeStaffStore
from usecase.tests.staff_catalog.helpers import T0, account
from usecase.tests.staff_categories.fakes import FakeStaffCategoryStore


class RecordingSignal:
    def __init__(self) -> None:
        self.frames: list[dict[str, str]] = []

    async def catalog_changed(self) -> None:
        self.frames.append({"type": "catalog_changed"})


def seed_categories() -> list[StaffCategory]:
    titles = ("Говядина", "Свинина", "Птица", "Мрамор", "Полуфабрикаты", "Соусы")
    ids = ("beef", "pork", "poultry", "marble", "semi", "sauce")
    return [
        StaffCategory(category_id, title, index, 0)
        for index, (category_id, title) in enumerate(zip(ids, titles, strict=True), start=1)
    ]


def product(product_id: str, category_id: str, *, hidden: bool = False) -> Product:
    return Product(
        id=product_id,
        name=product_id.upper(),
        category_id=category_id,
        default_weight_label="~350 г",
        price_rub=1000,
        compare_at_price_rub=None,
        popularity_score=10,
        properties=("fresh",),
        badge=None,
        marble_grade_label=None,
        image_url=f"/assets/{product_id}.jpg",
        description=None,
        hidden=hidden,
        created_at=T0,
    )


def opened(
    *,
    role: StaffRole = StaffRole.OWNER,
    categories: list[StaffCategory] | None = None,
    products: list[Product] | None = None,
    actor: Account | None = None,
    signal: RecordingSignal | None = None,
) -> tuple[StaffCategoryService, Account, FakeStaffCategoryStore, RecordingSignal]:
    user = actor or account()
    live = signal or RecordingSignal()
    store = FakeStaffCategoryStore(categories=categories, products=products)
    service = StaffCategoryService(FakeStaffStore([StaffMember.active_for(user, role)]), store, live)
    return service, user, store, live


def buyer() -> Account:
    return Account(
        id=uuid4(),
        yandex_subject="buyer",
        email="buyer@example.com",
        provider_name="buyer",
        created_at=T0,
        profile_name=None,
        avatar_url=None,
    )
