from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, ConfigDict, Field

from adapters.http.deps import bearer_token
from domain.staff.member import StaffMember
from usecase.staff.service import StaffMeView, StaffService

router = APIRouter(tags=["staff"])


class StaffMeResponse(BaseModel):
    user_id: str
    email: str
    display_name: str
    role: str


class StaffMemberResponse(BaseModel):
    member_id: str
    user_id: str | None = None
    email: str
    display_name: str | None = None
    role: str
    status: str


class StaffMemberListResponse(BaseModel):
    items: list[StaffMemberResponse]


class StaffAssignBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: str = Field(min_length=1)
    role: str


class StaffRoleUpdateBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    role: str


def _staff(request: Request) -> StaffService:
    return request.app.state.ctx.staff


def _me_response(view: StaffMeView) -> StaffMeResponse:
    return StaffMeResponse(
        user_id=view.user_id,
        email=view.email,
        display_name=view.display_name,
        role=view.role,
    )


def _member_response(member: StaffMember) -> StaffMemberResponse:
    return StaffMemberResponse(
        member_id=str(member.member_id),
        user_id=str(member.user_id) if member.user_id else None,
        email=member.email,
        display_name=member.display_name,
        role=member.role.value,
        status=member.status.value,
    )


@router.get("/staff/me", response_model=StaffMeResponse)
async def get_staff_me(
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> StaffMeResponse:
    ctx = request.app.state.ctx
    account = await ctx.session.caller(access_token)
    return _me_response(await _staff(request).me(account))


@router.get("/staff/members", response_model=StaffMemberListResponse)
async def list_staff_members(
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> StaffMemberListResponse:
    ctx = request.app.state.ctx
    account = await ctx.session.caller(access_token)
    rows = await _staff(request).list_members(account)
    return StaffMemberListResponse(items=[_member_response(row) for row in rows])


@router.post("/staff/members", response_model=StaffMemberResponse, status_code=201)
async def assign_staff_member(
    body: StaffAssignBody,
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> StaffMemberResponse:
    ctx = request.app.state.ctx
    account = await ctx.session.caller(access_token)
    member = await _staff(request).assign(account, body.email, body.role)
    return _member_response(member)


@router.patch("/staff/members/{member_id}", response_model=StaffMemberResponse)
async def update_staff_member(
    member_id: UUID,
    body: StaffRoleUpdateBody,
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> StaffMemberResponse:
    ctx = request.app.state.ctx
    account = await ctx.session.caller(access_token)
    member = await _staff(request).update_role(account, member_id, body.role)
    return _member_response(member)


@router.delete("/staff/members/{member_id}", status_code=204, response_class=Response)
async def remove_staff_member(
    member_id: UUID,
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> Response:
    ctx = request.app.state.ctx
    account = await ctx.session.caller(access_token)
    await _staff(request).remove(account, member_id)
    return Response(status_code=204)
