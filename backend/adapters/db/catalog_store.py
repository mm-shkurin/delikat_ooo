from contextlib import asynccontextmanager

from sqlalchemy import select
from sqlalchemy.exc import DBAPIError, InterfaceError, OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from adapters.db.models import CategoryRow, ProductRow
from domain.catalog.category import Category
from domain.catalog.product import Product
from usecase.account.errors import StoreUnavailable


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

    async def list_products(self) -> list[Product]:
        async with self._open() as session:
            rows = (await session.scalars(select(ProductRow))).all()
            return [row.to_domain() for row in rows]

    async def get_product(self, product_id: str) -> Product | None:
        async with self._open() as session:
            row = await session.get(ProductRow, product_id)
            return row.to_domain() if row else None
