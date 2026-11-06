from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from adapters.http.session_cookie import (
    SESSION_COOKIE_NAME,
    cookie_secure,
    is_uuid,
    response_sets_session,
)


class GuestSessionMiddleware(BaseHTTPMiddleware):
    """Issue a guest session id cookie when the client has none (cart wiring in story 10)."""

    def __init__(self, app, max_age_sec: int) -> None:
        super().__init__(app)
        self._max_age_sec = max_age_sec

    async def dispatch(self, request: Request, call_next) -> Response:
        existing = request.cookies.get(SESSION_COOKIE_NAME)
        if not is_uuid(existing):
            request.state.issued_session_id = str(uuid4())
            existing = None
        response = await call_next(request)
        if existing or response_sets_session(response):
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
