from contextlib import asynccontextmanager

from sqlalchemy import case, cast, func, select
from sqlalchemy.dialects.postgresql import JSONB, array
from sqlalchemy.exc import DBAPIError, InterfaceError, OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from adapters.db.models import CategoryRow, ProductRow
from domain.catalog.category import Category
from domain.catalog.product import Product
from usecase.account.errors import StoreUnavailable
from usecase.catalog.queries import ProductListQuery, ProductListResult


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


def _filtered_products(query: ProductListQuery):
    stmt = select(ProductRow)
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
