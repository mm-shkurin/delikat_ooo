from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

import jwt

from usecase.account.sign_in import TokenPair


@dataclass(frozen=True, slots=True)
class TokenClaims:
    user_id: UUID
    expires_at: datetime
    kind: str


@dataclass(frozen=True, slots=True)
class JwtConfig:
    access_secret: str
    refresh_secret: str
    access_ttl: timedelta = timedelta(minutes=60)
    refresh_ttl: timedelta = timedelta(days=30)


class JwtTokenIssuer:
    def __init__(self, config: JwtConfig) -> None:
        self._config = config

    def issue(self, user_id: UUID) -> TokenPair:
        return TokenPair(self.issue_access(user_id), self._encode(user_id, "refresh"), "Bearer")

    def issue_access(self, user_id: UUID) -> str:
        return self._encode(user_id, "access")

    def read(self, token: str, kind: str) -> TokenClaims | None:
        if kind not in {"access", "refresh"}:
            return None
        secret = self._config.access_secret if kind == "access" else self._config.refresh_secret
        try:
            payload = jwt.decode(token, secret, algorithms=["HS256"])
        except jwt.PyJWTError:
            return None
        if payload.get("type") != kind or not payload.get("sub"):
            return None
        try:
            user_id = UUID(payload["sub"])
        except ValueError:
            return None
        expires_at = datetime.fromtimestamp(payload["exp"], timezone.utc)
        return TokenClaims(user_id=user_id, expires_at=expires_at, kind=kind)

    def _encode(self, user_id: UUID, kind: str) -> str:
        now = datetime.now(timezone.utc)
        ttl = self._config.access_ttl if kind == "access" else self._config.refresh_ttl
        secret = self._config.access_secret if kind == "access" else self._config.refresh_secret
        payload = {
            "sub": str(user_id),
            "type": kind,
            "jti": str(uuid4()),
            "iat": int(now.timestamp()),
            "exp": int((now + ttl).timestamp()),
        }
        return jwt.encode(payload, secret, algorithm="HS256")

    @property
    def access_ttl_sec(self) -> int:
        return int(self._config.access_ttl.total_seconds())
