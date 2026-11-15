from typing import Annotated

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from adapters.http.deps import bearer_token
from usecase.staff_categories.queries import StaffCategory
from usecase.staff_categories.service import StaffCategoryService

router = APIRouter(tags=["staff-catalog"])


class StaffCategoryResponse(BaseModel):
    id: str
    title: str
    sort_order: int
    product_count: int


class StaffCategoryListResponse(BaseModel):
    items: list[StaffCategoryResponse]


class StaffCategoryCreateBody(BaseModel):
    id: str
    title: str


class StaffCategoryPatchBody(BaseModel):
    title: str


class StaffCategoryOrderBody(BaseModel):
    ids: list[str]


def _service(request: Request) -> StaffCategoryService:
    return request.app.state.ctx.staff_categories


def _response(row: StaffCategory) -> StaffCategoryResponse:
    return StaffCategoryResponse(
        id=row.id,
        title=row.title,
        sort_order=row.sort_order,
        product_count=row.product_count,
    )


@router.get("/staff/catalog/categories", response_model=StaffCategoryListResponse)
async def list_staff_categories(
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> StaffCategoryListResponse:
    account = await request.app.state.ctx.session.caller(access_token)
    rows = await _service(request).list_categories(account)
    return StaffCategoryListResponse(items=[_response(row) for row in rows])


@router.post("/staff/catalog/categories", response_model=StaffCategoryResponse, status_code=201)
async def create_staff_category(
    body: StaffCategoryCreateBody,
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> StaffCategoryResponse:
    account = await request.app.state.ctx.session.caller(access_token)
    created = await _service(request).create(account, body.id, body.title)
    return _response(created)


@router.put("/staff/catalog/categories/order", response_model=StaffCategoryListResponse)
async def reorder_staff_categories(
    body: StaffCategoryOrderBody,
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> StaffCategoryListResponse:
    account = await request.app.state.ctx.session.caller(access_token)
    rows = await _service(request).reorder(account, body.ids)
    return StaffCategoryListResponse(items=[_response(row) for row in rows])


@router.patch("/staff/catalog/categories/{category_id}", response_model=StaffCategoryResponse)
async def patch_staff_category(
    category_id: str,
    body: StaffCategoryPatchBody,
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> StaffCategoryResponse:
    account = await request.app.state.ctx.session.caller(access_token)
    updated = await _service(request).rename(account, category_id, body.title)
    return _response(updated)


@router.delete("/staff/catalog/categories/{category_id}", status_code=204)
async def delete_staff_category(
    category_id: str,
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> None:
    account = await request.app.state.ctx.session.caller(access_token)
    await _service(request).delete(account, category_id)
