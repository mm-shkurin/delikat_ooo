from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest

from adapters.security.jwt import JwtConfig, JwtTokenIssuer
from domain.account.account import Account
from usecase.account.errors import Unauthorized
from usecase.account.session import SessionService


class _Accounts:
    def __init__(self, account: Account) -> None:
        self.account = account

    async def get(self, user_id):
        if user_id == self.account.id:
            return self.account
        return None


class _Revocations:
    def __init__(self) -> None:
        self.dead: set[str] = set()

    async def revoke(self, token: str, expires_at: datetime) -> None:
        del expires_at
        self.dead.add(token)

    async def is_revoked(self, token: str) -> bool:
        return token in self.dead


@pytest.mark.asyncio
async def test_refresh_rotates_token_and_revokes_the_presented_one():
    user_id = uuid4()
    account = Account(
        id=user_id,
        yandex_subject="subject",
        email="a@b.test",
        provider_name="Ada",
        created_at=datetime.now(timezone.utc),
    )
    tokens = JwtTokenIssuer(JwtConfig("access-secret-value", "refresh-secret-value", access_ttl=timedelta(minutes=5)))
    issued = tokens.issue(user_id)
    revocations = _Revocations()
    service = SessionService(_Accounts(account), tokens, revocations)
    rotated = await service.refresh(issued.refresh_token)
    assert rotated.refresh_token != issued.refresh_token
    assert rotated.access_token != issued.access_token
    assert await revocations.is_revoked(issued.refresh_token)
    with pytest.raises(Unauthorized):
        await service.refresh(issued.refresh_token)
