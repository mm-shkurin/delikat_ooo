import pytest

from application.settings import StartupError, load_settings

_ENV = {
    "DATABASE_URL": "postgresql+asyncpg://delikat:secret@127.0.0.1:5434/delikat",
    "REDIS_URL": "redis://127.0.0.1:6379/0",
    "JWT_ACCESS_SECRET": "test-access-secret",
    "JWT_REFRESH_SECRET": "test-refresh-secret",
    "OAUTH_PROVIDER": "fake",
}


def test_fake_oauth_allows_localhost():
    settings = load_settings({**_ENV, "PUBLIC_BASE_URL": "http://localhost:8000"})
    assert settings.oauth_provider == "fake"


def test_fake_oauth_rejects_lookalike_host():
    with pytest.raises(StartupError):
        load_settings({**_ENV, "PUBLIC_BASE_URL": "http://127.0.0.1.evil.example"})
