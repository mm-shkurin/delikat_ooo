from uuid import uuid4

from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

from application.guest_session_middleware import SESSION_COOKIE_NAME, cookie_secure, minted_session_id

router = APIRouter(tags=["sessions"])


def _attach_session_cookie(response: Response, request: Request, session_id: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        httponly=True,
        samesite="lax",
        secure=cookie_secure(request),
        path="/",
        max_age=request.app.state.settings.session_cookie_max_age_sec,
    )


@router.post("/sessions", status_code=201)
async def create_session(request: Request) -> JSONResponse:
    session_id = minted_session_id(request) if not request.cookies.get(SESSION_COOKIE_NAME) else str(uuid4())
    await request.app.state.ctx.cart.ensure_session(session_id)
    response = JSONResponse({"session_id": session_id}, status_code=201)
    _attach_session_cookie(response, request, session_id)
    return response


@router.post("/sessions/reset", status_code=204, response_class=Response)
async def reset_session(request: Request) -> Response:
    session_id = str(uuid4())
    await request.app.state.ctx.cart.ensure_session(session_id)
    response = Response(status_code=204)
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")
    _attach_session_cookie(response, request, session_id)
    return response
