from typing import Annotated

from fastapi import Header

from usecase.account.errors import Unauthorized


def bearer_token(authorization: Annotated[str | None, Header()] = None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise Unauthorized("missing bearer token")
    token = authorization[7:].strip()
    if not token:
        raise Unauthorized("missing bearer token")
    return token
