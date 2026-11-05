import os
from collections.abc import Mapping
from dataclasses import dataclass
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


class StartupError(RuntimeError):
    """Misconfiguration — refuse to serve traffic."""


_PLACEHOLDER_SECRETS = frozenset(
    {
        "change-me-access-secret-change-me",
        "change-me-refresh-secret-change-me",
    }
)


DEFAULT_CORS_ORIGINS = (
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:8767",
    "http://localhost:8767",
)


@dataclass(frozen=True)
class Settings:
    database_url: str
    redis_url: str
    cors_origins: tuple[str, ...]
    jwt_access_secret: str
    jwt_refresh_secret: str
    access_ttl: timedelta
    refresh_ttl: timedelta
    oauth_provider: str
    frontend_callback_url: str
    public_base_url: str
    state_ttl: timedelta
    handoff_ttl: timedelta
    yandex_client_id: str
    yandex_client_secret: str
    yandex_redirect_uri: str
    yandex_authorize_url: str
    yandex_token_url: str
    yandex_info_url: str
    session_cookie_max_age_sec: int


def load_settings(env: Mapping[str, str] | None = None) -> Settings:
    source = os.environ if env is None else env
    database_url = _required(source, "DATABASE_URL")
    raw_cors = _text(source, "CORS_ORIGINS")
    if raw_cors:
        cors = tuple(part.strip() for part in raw_cors.split(",") if part.strip())
    else:
        cors = DEFAULT_CORS_ORIGINS
    provider = _text(source, "OAUTH_PROVIDER", "fake")
    if provider not in {"yandex", "fake"}:
        raise StartupError("OAUTH_PROVIDER must be yandex or fake")
    client_id = _text(source, "YANDEX_CLIENT_ID")
    client_secret = _text(source, "YANDEX_CLIENT_SECRET")
    if provider == "yandex" and (not client_id or not client_secret):
        raise StartupError("YANDEX_CLIENT_ID and YANDEX_CLIENT_SECRET required for OAUTH_PROVIDER=yandex")
    public_base_url = _text(source, "PUBLIC_BASE_URL", "http://127.0.0.1:8000")
    if provider == "fake" and not _is_local_origin(public_base_url):
        raise StartupError("OAUTH_PROVIDER=fake is only allowed when PUBLIC_BASE_URL is local")
    access_secret = _required(source, "JWT_ACCESS_SECRET")
    refresh_secret = _required(source, "JWT_REFRESH_SECRET")
    if access_secret in _PLACEHOLDER_SECRETS or refresh_secret in _PLACEHOLDER_SECRETS:
        raise StartupError("Replace JWT_ACCESS_SECRET and JWT_REFRESH_SECRET; example placeholders are refused")
    return Settings(
        database_url=database_url,
        redis_url=_required(source, "REDIS_URL"),
        cors_origins=cors,
        jwt_access_secret=access_secret,
        jwt_refresh_secret=refresh_secret,
        access_ttl=timedelta(minutes=_int(source, "ACCESS_TOKEN_EXPIRE_MINUTES", 60)),
        refresh_ttl=timedelta(days=_int(source, "REFRESH_TOKEN_EXPIRE_DAYS", 30)),
        oauth_provider=provider,
        frontend_callback_url=_text(source, "OAUTH_FRONTEND_CALLBACK_URL", "http://127.0.0.1:5173/auth/callback"),
        public_base_url=public_base_url,
        state_ttl=timedelta(seconds=_int(source, "OAUTH_STATE_TTL_SECONDS", 600)),
        handoff_ttl=timedelta(seconds=_int(source, "OAUTH_HANDOFF_TTL_SECONDS", 120)),
        yandex_client_id=client_id,
        yandex_client_secret=client_secret,
        yandex_redirect_uri=_text(
            source, "YANDEX_REDIRECT_URI", "http://127.0.0.1:8000/api/v1/auth/oauth/yandex/callback"
        ),
        yandex_authorize_url=_text(source, "YANDEX_AUTHORIZE_URL", "https://oauth.yandex.ru/authorize"),
        yandex_token_url=_text(source, "YANDEX_TOKEN_URL", "https://oauth.yandex.ru/token"),
        yandex_info_url=_text(source, "YANDEX_INFO_URL", "https://login.yandex.ru/info"),
        session_cookie_max_age_sec=_int(source, "SESSION_COOKIE_MAX_AGE_SEC", 60 * 60 * 24 * 30),
    )


def _required(env: Mapping[str, str], name: str) -> str:
    value = _text(env, name)
    if not value:
        raise StartupError(f"{name} is unset")
    return value


def _int(env: Mapping[str, str], name: str, default: int) -> int:
    raw = _text(env, name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError as exc:
        raise StartupError(f"{name} must be an integer") from exc


def _is_local_origin(url: str) -> bool:
    lowered = url.lower()
    return "://127.0.0.1" in lowered or "://localhost" in lowered


def _text(env: Mapping[str, str], name: str, default: str = "") -> str:
    value = env.get(name)
    if value is None:
        return default
    return str(value).strip()
