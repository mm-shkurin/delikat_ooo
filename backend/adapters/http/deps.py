from typing import Annotated

from fastapi import Header

from usecase.account.errors import Unauthorized


def bearer_token(authorization: Annotated[str | None, Header()] = None) -> str:
    token = _bearer_value(authorization)
    if token is None:
        raise Unauthorized("missing bearer token")
    return token


def optional_access_token(authorization: Annotated[str | None, Header()] = None) -> str | None:
    if authorization is None:
        return None
    token = _bearer_value(authorization)
    if token is None:
        raise Unauthorized("invalid bearer token")
    return token


def _bearer_value(authorization: str | None) -> str | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization[7:].strip()
    return token or None
