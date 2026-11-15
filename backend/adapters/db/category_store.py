from contextlib import asynccontextmanager

from sqlalchemy import delete, func, select
from sqlalchemy.exc import DBAPIError, IntegrityError, InterfaceError, OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from adapters.db.catalog_models import CategoryRow, ProductRow
from usecase.account.errors import StoreUnavailable
from usecase.staff_categories.errors import taken
from usecase.staff_categories.queries import StaffCategory


class PostgresStaffCategoryStore:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    @asynccontextmanager
    async def _open(self):
        try:
            async with self._session_factory() as session:
                yield session
        except (OperationalError, InterfaceError, DBAPIError) as exc:
            raise StoreUnavailable() from exc

    async def list_categories(self) -> list[StaffCategory]:
        async with self._open() as session:
            return await _staff_rows(session)

    async def get(self, category_id: str) -> StaffCategory | None:
        async with self._open() as session:
            row = await session.get(CategoryRow, category_id)
            if row is None:
                return None
            count = await _product_count(session, category_id)
            return StaffCategory(row.id, row.title, row.sort_order, count)

    async def create(self, category_id: str, title: str) -> StaffCategory:
        async with self._open() as session:
            current = await session.scalar(select(func.max(CategoryRow.sort_order)))
            sort_order = 1 if current is None else int(current) + 1
            session.add(CategoryRow(id=category_id, title=title, sort_order=sort_order))
            try:
                await session.commit()
            except IntegrityError as exc:
                await session.rollback()
                raise taken() from exc
            return StaffCategory(category_id, title, sort_order, 0)

    async def rename(self, category_id: str, title: str) -> StaffCategory | None:
        async with self._open() as session:
            row = await session.get(CategoryRow, category_id)
            if row is None:
                return None
            row.title = title
            count = await _product_count(session, category_id)
            await session.commit()
            return StaffCategory(category_id, title, row.sort_order, count)

    async def reorder(self, ids: list[str]) -> list[StaffCategory] | None:
        async with self._open() as session:
            rows = (await session.scalars(select(CategoryRow))).all()
            by_id = {row.id: row for row in rows}
            if len(ids) != len(set(ids)) or set(ids) != set(by_id):
                return None
            for index, category_id in enumerate(ids, start=1):
                by_id[category_id].sort_order = index
            await session.commit()
        return await self.list_categories()

    async def delete(self, category_id: str) -> bool:
        async with self._open() as session:
            row = await session.get(CategoryRow, category_id)
            if row is None:
                return False
            await session.execute(delete(ProductRow).where(ProductRow.category_id == category_id))
            await session.delete(row)
            await session.commit()
            return True


async def _staff_rows(session: AsyncSession) -> list[StaffCategory]:
    counts = (
        select(ProductRow.category_id, func.count().label("product_count"))
        .group_by(ProductRow.category_id)
        .subquery()
    )
    stmt = (
        select(CategoryRow, func.coalesce(counts.c.product_count, 0))
        .outerjoin(counts, CategoryRow.id == counts.c.category_id)
        .order_by(CategoryRow.sort_order, CategoryRow.id)
    )
    found = (await session.execute(stmt)).all()
    return [
        StaffCategory(row.id, row.title, row.sort_order, int(count))
        for row, count in found
    ]


async def _product_count(session: AsyncSession, category_id: str) -> int:
    total = await session.scalar(
        select(func.count()).select_from(ProductRow).where(ProductRow.category_id == category_id)
    )
    return int(total or 0)
