from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import DBAPIError, IntegrityError, InterfaceError, OperationalError

from adapters.db.models import StaffMemberRow
from domain.staff.member import StaffMember, normalize_email
from usecase.account.errors import StoreUnavailable


class PostgresStaffStore:
    def __init__(self, sessions):
        self._sessions = sessions

    async def get_by_user_id(self, user_id: UUID) -> StaffMember | None:
        return await self._run(lambda session: self._by_user(session, user_id))

    async def get_by_id(self, member_id: UUID) -> StaffMember | None:
        return await self._run(lambda session: self._by_id(session, member_id))

    async def get_by_email(self, email: str) -> StaffMember | None:
        return await self._run(lambda session: self._by_email(session, email))

    async def list_all(self) -> list[StaffMember]:
        return await self._run(self._list)

    async def save(self, member: StaffMember) -> StaffMember:
        return await self._run(lambda session: self._save(session, member))

    async def delete(self, member_id: UUID) -> None:
        await self._run(lambda session: self._delete(session, member_id))

    async def _by_user(self, session, user_id: UUID):
        row = await session.scalar(select(StaffMemberRow).where(StaffMemberRow.user_id == user_id))
        return None if row is None else row.to_domain()

    async def _by_id(self, session, member_id: UUID):
        row = await session.get(StaffMemberRow, member_id)
        return None if row is None else row.to_domain()

    async def _by_email(self, session, email: str):
        target = normalize_email(email)
        row = await session.scalar(select(StaffMemberRow).where(StaffMemberRow.email == target))
        return None if row is None else row.to_domain()

    async def _list(self, session):
        rows = await session.scalars(select(StaffMemberRow))
        return [row.to_domain() for row in rows]

    async def _save(self, session, member: StaffMember):
        row = await session.get(StaffMemberRow, member.member_id)
        if row is None:
            row = StaffMemberRow(
                member_id=member.member_id,
                email=member.email,
                role=member.role.value,
                status=member.status.value,
                user_id=member.user_id,
            )
            session.add(row)
        else:
            row.apply(member)
        await session.flush()
        return row.to_domain()

    async def _delete(self, session, member_id: UUID):
        row = await session.get(StaffMemberRow, member_id)
        if row is not None:
            await session.delete(row)

    async def _run(self, work):
        try:
            async with self._sessions() as session:
                async with session.begin():
                    return await work(session)
        except IntegrityError:
            raise
        except (OperationalError, InterfaceError, DBAPIError) as error:
            raise StoreUnavailable() from error
