from contextlib import asynccontextmanager
from datetime import UTC, datetime

from sqlalchemy import case, cast, func, or_, select
from sqlalchemy.dialects.postgresql import JSONB, array
from sqlalchemy.exc import DBAPIError, InterfaceError, OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from adapters.db.catalog_models import CategoryRow, ProductRow
from domain.catalog.category import Category
from domain.catalog.product import Product, ProductImage
from usecase.account.errors import StoreUnavailable
from usecase.catalog.queries import ProductListQuery, ProductListResult
from usecase.staff_catalog.queries import StaffProductListQuery


class PostgresCatalogStore:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    @asynccontextmanager
    async def _open(self):
        try:
            async with self._session_factory() as session:
                yield session
        except (OperationalError, InterfaceError, DBAPIError) as exc:
            raise StoreUnavailable() from exc

    async def list_categories(self) -> list[Category]:
        async with self._open() as session:
            rows = (await session.scalars(select(CategoryRow).order_by(CategoryRow.sort_order))).all()
            return [row.to_domain() for row in rows]

    async def list_products(self, query: ProductListQuery) -> ProductListResult:
        async with self._open() as session:
            filtered = _filtered_products(query)
            total = await session.scalar(select(func.count()).select_from(filtered.subquery()))
            page = _ordered(filtered, query.sort).limit(query.limit).offset(query.offset)
            rows = (await session.scalars(page)).all()
            return ProductListResult(
                items=tuple(row.to_domain() for row in rows),
                total_count=int(total or 0),
                limit=query.limit,
                offset=query.offset,
            )

    async def get_product(self, product_id: str) -> Product | None:
        async with self._open() as session:
            row = await session.get(ProductRow, product_id)
            return row.to_domain() if row else None

    async def list_staff_products(self, query: StaffProductListQuery) -> list[Product]:
        async with self._open() as session:
            stmt = select(ProductRow)
            if query.visibility == "live":
                stmt = stmt.where(ProductRow.hidden.is_(False))
            elif query.visibility == "hidden":
                stmt = stmt.where(ProductRow.hidden.is_(True))
            if query.q:
                needle = f"%{query.q}%"
                stmt = stmt.where(
                    or_(ProductRow.name.ilike(needle), ProductRow.id.ilike(needle))
                )
            rows = (await session.scalars(stmt)).all()
            return [row.to_domain() for row in rows]

    async def category_exists(self, category_id: str) -> bool:
        async with self._open() as session:
            row = await session.get(CategoryRow, category_id)
            return row is not None

    async def save_product(self, product: Product) -> Product:
        async with self._open() as session:
            row = await session.get(ProductRow, product.id)
            if row is None:
                row = ProductRow(
                    id=product.id,
                    created_at=product.created_at or datetime.now(UTC),
                    hidden=product.hidden,
                    image_bytes=None,
                    image_content_type=None,
                )
                session.add(row)
            row.apply(product)
            await session.commit()
            await session.refresh(row)
            return row.to_domain()

    async def put_image(self, product_id: str, data: bytes, content_type: str) -> Product:
        async with self._open() as session:
            row = await session.get(ProductRow, product_id)
            if row is None:
                raise LookupError(product_id)
            row.image_bytes = data
            row.image_content_type = content_type
            row.image_url = f"/api/v1/media/products/{product_id}"
            await session.commit()
            await session.refresh(row)
            return row.to_domain()

    async def get_image(self, product_id: str) -> ProductImage | None:
        async with self._open() as session:
            row = await session.get(ProductRow, product_id)
            if row is None or row.image_bytes is None or not row.image_content_type:
                return None
            return ProductImage(product_id, row.image_content_type, bytes(row.image_bytes))


def _filtered_products(query: ProductListQuery):
    stmt = select(ProductRow).where(ProductRow.hidden.is_(False))
    if query.category_id:
        stmt = stmt.where(ProductRow.category_id == query.category_id)
    if query.max_price_rub is not None:
        stmt = stmt.where(ProductRow.price_rub <= query.max_price_rub)
    if query.properties:
        stmt = stmt.where(cast(ProductRow.properties, JSONB).has_any(array(list(query.properties))))
    return stmt


def _ordered(stmt, sort: str):
    if sort == "price_asc":
        return stmt.order_by(ProductRow.price_rub.asc(), ProductRow.id.asc())
    if sort == "sale_first":
        on_sale = case((ProductRow.compare_at_price_rub.is_not(None), 0), else_=1)
        return stmt.order_by(on_sale, ProductRow.price_rub.asc(), ProductRow.id.asc())
    return stmt.order_by(ProductRow.popularity_score.desc(), ProductRow.id.asc())
