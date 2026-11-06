from uuid import UUID, uuid4

from starlette.requests import Request
from starlette.responses import Response

SESSION_COOKIE_NAME = "delikat_session"


def is_uuid(value: str | None) -> bool:
    if not value:
        return False
    try:
        UUID(value)
    except ValueError:
        return False
    return True


def cookie_secure(request: Request) -> bool:
    settings = getattr(request.app.state, "settings", None)
    base = getattr(settings, "public_base_url", "") if settings is not None else ""
    return str(base).lower().startswith("https://")


def minted_session_id(request: Request) -> str:
    """Id minted for this request when the client sent no session cookie."""
    issued = getattr(request.state, "issued_session_id", None)
    if isinstance(issued, str) and issued:
        return issued
    return str(uuid4())


def set_session_cookie(response: Response, request: Request, session_id: str, *, max_age: int) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        httponly=True,
        samesite="lax",
        secure=cookie_secure(request),
        path="/",
        max_age=max_age,
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")


def response_sets_session(response: Response) -> bool:
    needle = f"{SESSION_COOKIE_NAME}=".encode("latin-1")
    for key, value in response.raw_headers:
        if key.lower() == b"set-cookie" and needle in value:
            return True
    return False
