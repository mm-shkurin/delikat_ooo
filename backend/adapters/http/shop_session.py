from fastapi import Request, Response

from adapters.http.session_cookie import (
    SESSION_COOKIE_NAME,
    is_uuid,
    minted_session_id,
    set_session_cookie,
)
from usecase.cart.errors import ShopSessionRequired


def require_shop_session(request: Request) -> str:
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if not is_uuid(session_id):
        raise ShopSessionRequired()
    return session_id


def ensure_shop_session(request: Request, response: Response) -> str:
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if is_uuid(session_id):
        return session_id
    session_id = minted_session_id(request)
    set_session_cookie(
        response,
        request,
        session_id,
        max_age=request.app.state.settings.session_cookie_max_age_sec,
    )
    return session_id
