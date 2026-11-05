import pytest

from adapters.http.orders_router import _parse_idempotency
from usecase.cart.errors import InvalidIdempotencyKey


def test_malformed_idempotency_key_is_rejected():
    with pytest.raises(InvalidIdempotencyKey):
        _parse_idempotency("not-a-uuid")


def test_missing_idempotency_key_is_optional_at_the_parser():
    assert _parse_idempotency(None) is None
    assert _parse_idempotency("") is None
