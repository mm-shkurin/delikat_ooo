import os
from urllib.parse import parse_qs, urlparse

# Tests must not depend on Yandex credentials from a developer .env.
os.environ["OAUTH_PROVIDER"] = "fake"
os.environ.setdefault("REDIS_URL", "redis://127.0.0.1:6379/0")
os.environ.setdefault("JWT_ACCESS_SECRET", "test-access")
os.environ.setdefault("JWT_REFRESH_SECRET", "test-refresh")
os.environ["DATABASE_URL"] = "postgresql+asyncpg://delikat:change-me@127.0.0.1:5434/delikat"

from fastapi.testclient import TestClient

from application.main import create_app


def test_fake_oauth_exchange_flow():
    with TestClient(create_app()) as client:
        start = client.get("/api/v1/auth/oauth/yandex/start", follow_redirects=False)
        assert start.status_code == 302
        browser = start.cookies.get("signin_browser")
        assert browser
        state = parse_qs(urlparse(start.headers["location"]).query)["state"][0]

        callback = client.get(
            "/api/v1/auth/oauth/yandex/callback",
            params={"code": "demo", "state": state},
            follow_redirects=False,
        )
        assert callback.status_code == 302
        assert "code=" in callback.headers["location"]

        handoff = callback.headers["location"].split("code=", 1)[1].split("&", 1)[0]
        exchange = client.post("/api/v1/auth/oauth/exchange", json={"code": handoff})
        assert exchange.status_code == 200
        tokens = exchange.json()
        assert tokens["access_token"]

        me = client.get("/api/v1/me", headers={"Authorization": f"Bearer {tokens['access_token']}"})
        assert me.status_code == 200
        assert me.json()["email"]
