from uuid import uuid4

from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

from adapters.http.session_cookie import (
    SESSION_COOKIE_NAME,
    clear_session_cookie,
    is_uuid,
    minted_session_id,
    set_session_cookie,
)

router = APIRouter(tags=["sessions"])


@router.post("/sessions", status_code=201)
async def create_session(request: Request) -> JSONResponse:
    existing = request.cookies.get(SESSION_COOKIE_NAME)
    session_id = existing if is_uuid(existing) else minted_session_id(request)
    await request.app.state.ctx.cart.ensure_session(session_id)
    response = JSONResponse({"session_id": session_id}, status_code=201)
    set_session_cookie(
        response,
        request,
        session_id,
        max_age=request.app.state.settings.session_cookie_max_age_sec,
    )
    return response


@router.post("/sessions/reset", status_code=204, response_class=Response)
async def reset_session(request: Request) -> Response:
    session_id = str(uuid4())
    await request.app.state.ctx.cart.ensure_session(session_id)
    response = Response(status_code=204)
    clear_session_cookie(response)
    set_session_cookie(
        response,
        request,
        session_id,
        max_age=request.app.state.settings.session_cookie_max_age_sec,
    )
    return response
