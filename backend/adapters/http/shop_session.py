from uuid import UUID

from fastapi import Request, Response

from application.guest_session_middleware import SESSION_COOKIE_NAME, cookie_secure, minted_session_id
from usecase.cart.errors import ShopSessionRequired


def require_shop_session(request: Request) -> str:
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if not _is_uuid(session_id):
        raise ShopSessionRequired()
    return session_id


def _is_uuid(value: str | None) -> bool:
    if not value:
        return False
    try:
        UUID(value)
    except ValueError:
        return False
    return True


def ensure_shop_session(request: Request, response: Response) -> str:
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if _is_uuid(session_id):
        return session_id
    session_id = minted_session_id(request)
    _set_cookie(response, session_id, request)
    return session_id


def _set_cookie(response: Response, session_id: str, request: Request) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        httponly=True,
        samesite="lax",
        secure=cookie_secure(request),
        path="/",
        max_age=request.app.state.settings.session_cookie_max_age_sec,
    )
