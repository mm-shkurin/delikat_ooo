from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

SESSION_COOKIE_NAME = "delikat_session"


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


def _response_sets_session(response: Response) -> bool:
    needle = f"{SESSION_COOKIE_NAME}=".encode("latin-1")
    for key, value in response.raw_headers:
        if key.lower() == b"set-cookie" and needle in value:
            return True
    return False


class GuestSessionMiddleware(BaseHTTPMiddleware):
    """Issue a guest session id cookie when the client has none (cart wiring in story 10)."""

    def __init__(self, app, max_age_sec: int) -> None:
        super().__init__(app)
        self._max_age_sec = max_age_sec

    async def dispatch(self, request: Request, call_next) -> Response:
        existing = request.cookies.get(SESSION_COOKIE_NAME)
        if not existing:
            request.state.issued_session_id = str(uuid4())
        response = await call_next(request)
        if existing or _response_sets_session(response):
            return response
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=request.state.issued_session_id,
            httponly=True,
            samesite="lax",
            secure=cookie_secure(request),
            path="/",
            max_age=self._max_age_sec,
        )
        return response
