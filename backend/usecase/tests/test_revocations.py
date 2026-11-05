import pytest
from redis.exceptions import RedisError

from adapters.cache.redis_revocations import RedisRevocations
from usecase.account.errors import StoreUnavailable


class _Down:
    async def get(self, _key):
        raise RedisError("down")


@pytest.mark.asyncio
async def test_revocation_lookup_fails_closed_when_redis_is_down():
    with pytest.raises(StoreUnavailable):
        await RedisRevocations(_Down()).is_revoked("access-token")
