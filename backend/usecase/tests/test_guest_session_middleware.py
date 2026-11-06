from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient

from adapters.http.session_cookie import SESSION_COOKIE_NAME, minted_session_id
from application.guest_session_middleware import GuestSessionMiddleware


def _mini_app() -> FastAPI:
    app = FastAPI()

    @app.get("/health")
    def health():
        return {"status": "ok"}

    app.add_middleware(GuestSessionMiddleware, max_age_sec=3600)
    return app


def test_sets_cookie_on_first_anonymous_get():
    with TestClient(_mini_app()) as client:
        response = client.get("/health")
        assert response.status_code == 200
        cookie = response.headers.get("set-cookie", "")
        assert SESSION_COOKIE_NAME in cookie
        assert "HttpOnly" in cookie
        lowered = cookie.lower()
        assert "samesite=lax" in lowered
        assert "path=/" in lowered


def test_route_cookie_is_not_replaced():
    app = FastAPI()

    @app.post("/sessions")
    def create(request: Request):
        session_id = minted_session_id(request)
        response = JSONResponse({"session_id": session_id}, status_code=201)
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=session_id,
            httponly=True,
            samesite="lax",
            path="/",
            max_age=3600,
        )
        return response

    app.add_middleware(GuestSessionMiddleware, max_age_sec=3600)
    with TestClient(app) as client:
        response = client.post("/sessions")
        body_id = response.json()["session_id"]
        assert client.cookies.get(SESSION_COOKIE_NAME) == body_id
        session_cookies = [
            value
            for key, value in response.headers.raw
            if key.lower() == b"set-cookie" and value.startswith(SESSION_COOKIE_NAME.encode("latin-1"))
        ]
        assert len(session_cookies) == 1


def test_keeps_existing_cookie():
    with TestClient(_mini_app()) as client:
        client.get("/health")
        session_value = client.cookies.get(SESSION_COOKIE_NAME)
        assert session_value
        second = client.get("/health")
        assert client.cookies.get(SESSION_COOKIE_NAME) == session_value
        assert "set-cookie" not in {k.lower() for k in second.headers.keys()}
