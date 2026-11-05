from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.exc import DBAPIError, IntegrityError, InterfaceError, OperationalError

from adapters.db.models import AccountRow
from domain.account.identity import ProviderIdentity
from usecase.account.errors import StoreUnavailable


class PostgresAccountStore:
    def __init__(self, sessions):
        self._sessions = sessions

    async def get(self, user_id: UUID):
        return await self._run(lambda session: self._get(session, user_id))

    async def get_or_create(self, identity: ProviderIdentity, created_at: datetime):
        try:
            return await self._run(lambda session: self._claim(session, identity, created_at))
        except IntegrityError:
            return await self._run(lambda session: self._reread(session, identity))

    async def save(self, account):
        return await self._run(lambda session: self._save(session, account))

    async def _get(self, session, user_id: UUID):
        row = await session.get(AccountRow, user_id)
        return None if row is None else row.to_domain()

    async def _claim(self, session, identity: ProviderIdentity, created_at: datetime):
        found = await session.scalar(select(AccountRow).where(AccountRow.yandex_subject == identity.subject))
        if found is not None:
            found.email = identity.email
            found.provider_name = identity.name
            found.avatar_url = identity.avatar_url
            return found.to_domain()
        row = AccountRow(
            id=uuid4(),
            yandex_subject=identity.subject,
            email=identity.email,
            provider_name=identity.name,
            avatar_url=identity.avatar_url,
            created_at=created_at,
        )
        session.add(row)
        await session.flush()
        return row.to_domain()

    async def _reread(self, session, identity: ProviderIdentity):
        found = await session.scalar(select(AccountRow).where(AccountRow.yandex_subject == identity.subject))
        if found is None:
            raise StoreUnavailable()
        found.email = identity.email
        found.provider_name = identity.name
        found.avatar_url = identity.avatar_url
        return found.to_domain()

    async def _save(self, session, account):
        row = await session.get(AccountRow, account.id)
        if row is None:
            return None
        row.apply(account)
        await session.flush()
        return row.to_domain()

    async def _run(self, work):
        try:
            async with self._sessions() as session:
                async with session.begin():
                    return await work(session)
        except IntegrityError:
            raise
        except (OperationalError, InterfaceError, DBAPIError) as error:
            raise StoreUnavailable() from error
