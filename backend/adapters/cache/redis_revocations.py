import hashlib
from datetime import datetime, timezone

from redis.exceptions import RedisError

from usecase.account.errors import StoreUnavailable


class RedisRevocations:
    def __init__(self, redis):
        self.redis = redis

    async def revoke(self, token: str, expires_at: datetime) -> None:
        ttl = max(int((expires_at - datetime.now(timezone.utc)).total_seconds()), 1)
        await self.redis.set(_key(token), "1", ex=ttl)

    async def is_revoked(self, token: str) -> bool:
        try:
            return await self.redis.get(_key(token)) is not None
        except RedisError as exc:
            raise StoreUnavailable() from exc


def _key(token: str) -> str:
    return "revoked:" + hashlib.sha256(token.encode("utf-8")).hexdigest()
