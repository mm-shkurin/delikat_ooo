from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, ConfigDict

from adapters.http.deps import bearer_token

BROWSER_COOKIE = "signin_browser"

router = APIRouter(tags=["auth"])
me_router = APIRouter(tags=["auth"])


class ExchangeBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    code: str


class RefreshBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    refresh_token: str


class LogoutBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    refresh_token: str | None = None


class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in_sec: int


class UserProfileResponse(BaseModel):
    user_id: str
    email: str
    display_name: str
    provider_display_name: str
    avatar_url: str | None = None


class UserProfileUpdateBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    display_name: str


@router.get("/oauth/yandex/start")
async def start_yandex(request: Request):
    ctx = request.app.state.ctx
    url, browser = await ctx.sign_in.start()
    response = RedirectResponse(url, status_code=302)
    response.set_cookie(
        key=BROWSER_COOKIE,
        value=browser,
        max_age=int(ctx.settings.state_ttl.total_seconds()),
        httponly=True,
        samesite="lax",
        secure=str(ctx.settings.public_base_url).lower().startswith("https://"),
        path="/",
    )
    return response


@router.get("/oauth/yandex/callback")
async def finish_yandex(request: Request, code: str = "", state: str = "", error: str = ""):
    location = await request.app.state.ctx.sign_in.callback(code, state, error)
    return RedirectResponse(location, status_code=302)


@router.post("/oauth/exchange", response_model=TokenPairResponse)
async def exchange(body: ExchangeBody, request: Request) -> TokenPairResponse:
    ctx = request.app.state.ctx
    pair = await ctx.sign_in.exchange(body.code, request.cookies.get(BROWSER_COOKIE, ""))
    return TokenPairResponse(
        access_token=pair.access_token,
        refresh_token=pair.refresh_token,
        token_type=pair.token_type,
        expires_in_sec=ctx.sign_in.tokens.access_ttl_sec,
    )


@router.post("/refresh", response_model=TokenPairResponse)
async def refresh(body: RefreshBody, request: Request) -> TokenPairResponse:
    ctx = request.app.state.ctx
    pair = await ctx.session.refresh(body.refresh_token)
    return TokenPairResponse(
        access_token=pair.access_token,
        refresh_token=pair.refresh_token,
        token_type=pair.token_type,
        expires_in_sec=ctx.sign_in.tokens.access_ttl_sec,
    )


@router.post("/logout", status_code=204, response_class=Response)
async def post_logout(
    request: Request,
    _access: Annotated[str, Depends(bearer_token)],
    body: LogoutBody | None = None,
) -> Response:
    refresh_token = body.refresh_token if body is not None else None
    await request.app.state.ctx.session.logout(_access, refresh_token)
    return Response(status_code=204)


@me_router.get("/me", response_model=UserProfileResponse)
async def get_me_route(
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> UserProfileResponse:
    ctx = request.app.state.ctx
    account = await ctx.session.caller(access_token)
    profile = ctx.profile.view(account)
    return UserProfileResponse(**profile)


@me_router.patch("/me", response_model=UserProfileResponse)
async def patch_me_route(
    request: Request,
    body: UserProfileUpdateBody,
    access_token: Annotated[str, Depends(bearer_token)],
) -> UserProfileResponse:
    ctx = request.app.state.ctx
    account = await ctx.session.caller(access_token)
    updated = await ctx.profile.rename(account, body.display_name)
    return UserProfileResponse(**ctx.profile.view(updated))
