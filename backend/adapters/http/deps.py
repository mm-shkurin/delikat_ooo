from typing import Annotated

from fastapi import Header, Request

from adapters.http.auth_cookie import access_from_cookies
from usecase.account.errors import Unauthorized


def bearer_token(
    request: Request,
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    token = _bearer_value(authorization) or access_from_cookies(request)
    if token is None:
        raise Unauthorized("missing bearer token")
    return token


def optional_access_token(
    request: Request,
    authorization: Annotated[str | None, Header()] = None,
) -> str | None:
    if authorization is None and access_from_cookies(request) is None:
        return None
    token = _bearer_value(authorization) or access_from_cookies(request)
    if token is None:
        raise Unauthorized("invalid bearer token")
    return token


def _bearer_value(authorization: str | None) -> str | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization[7:].strip()
    return token or None
