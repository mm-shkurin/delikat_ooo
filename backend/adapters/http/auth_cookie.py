"""HttpOnly JWT cookies for browser sessions (XSS cannot read tokens)."""

from starlette.requests import Request
from starlette.responses import Response

from adapters.http.session_cookie import cookie_secure

ACCESS_COOKIE = "delikat_access"
REFRESH_COOKIE = "delikat_refresh"


def set_auth_cookies(
    response: Response,
    request: Request,
    *,
    access_token: str,
    refresh_token: str,
    access_max_age: int,
    refresh_max_age: int,
) -> None:
    secure = cookie_secure(request)
    response.set_cookie(
        key=ACCESS_COOKIE,
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=secure,
        path="/",
        max_age=access_max_age,
    )
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=secure,
        path="/",
        max_age=refresh_max_age,
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(key=ACCESS_COOKIE, path="/")
    response.delete_cookie(key=REFRESH_COOKIE, path="/")


def access_from_cookies(request: Request) -> str | None:
    value = request.cookies.get(ACCESS_COOKIE, "").strip()
    return value or None


def refresh_from_cookies(request: Request) -> str | None:
    value = request.cookies.get(REFRESH_COOKIE, "").strip()
    return value or None
