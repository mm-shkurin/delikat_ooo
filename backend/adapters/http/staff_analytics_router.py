from typing import Annotated

from fastapi import APIRouter, Depends, Request

from adapters.http.deps import bearer_token
from adapters.http.staff_analytics_payload import money_payload, stats_payload

router = APIRouter(tags=["staff-analytics"])


def _analytics(request: Request):
    return request.app.state.ctx.staff_analytics


@router.get("/staff/stats")
async def get_staff_stats(
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> dict:
    account = await request.app.state.ctx.session.caller(access_token)
    return stats_payload(await _analytics(request).stats(account))


@router.get("/staff/money")
async def get_staff_money(
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> dict:
    account = await request.app.state.ctx.session.caller(access_token)
    return money_payload(await _analytics(request).money(account))
