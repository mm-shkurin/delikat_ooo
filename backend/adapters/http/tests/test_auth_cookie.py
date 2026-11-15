from starlette.requests import Request
from starlette.responses import Response

from adapters.http.auth_cookie import (
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    access_from_cookies,
    clear_auth_cookies,
    refresh_from_cookies,
    set_auth_cookies,
)


def _request(cookies: dict[str, str] | None = None) -> Request:
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/",
        "headers": [],
        "query_string": b"",
        "client": ("test", 50000),
        "server": ("test", 80),
        "scheme": "http",
        "app": type("App", (), {"state": type("State", (), {"settings": None})()})(),
    }
    request = Request(scope)
    if cookies:
        request._cookies = cookies  # noqa: SLF001 — test helper
    return request


def test_set_and_clear_auth_cookies_are_httponly():
    response = Response()
    request = _request()
    set_auth_cookies(
        response,
        request,
        access_token="access-value",
        refresh_token="refresh-value",
        access_max_age=60,
        refresh_max_age=120,
    )
    headers = [v.decode("latin-1") for k, v in response.raw_headers if k.lower() == b"set-cookie"]
    access = next(h for h in headers if h.startswith(f"{ACCESS_COOKIE}="))
    refresh = next(h for h in headers if h.startswith(f"{REFRESH_COOKIE}="))
    assert "HttpOnly" in access
    assert "HttpOnly" in refresh
    assert "access-value" in access
    assert "refresh-value" in refresh

    clear_auth_cookies(response)
    cleared = [v.decode("latin-1") for k, v in response.raw_headers if k.lower() == b"set-cookie"]
    assert any(ACCESS_COOKIE in h for h in cleared)
    assert any(REFRESH_COOKIE in h for h in cleared)


def test_cookie_readers():
    request = _request({ACCESS_COOKIE: "a", REFRESH_COOKIE: "r"})
    assert access_from_cookies(request) == "a"
    assert refresh_from_cookies(request) == "r"
    empty = _request({})
    assert access_from_cookies(empty) is None
    assert refresh_from_cookies(empty) is None
