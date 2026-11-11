from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from pydantic import BaseModel, ConfigDict, Field

from adapters.http.deps import bearer_token
from domain.catalog.product import Product
from usecase.staff_catalog.queries import StaffProductDraft, StaffProductListQuery, StaffProductPatch
from usecase.staff_catalog.service import StaffCatalogService
from usecase.staff_catalog.validation import parse_properties

router = APIRouter(tags=["staff-catalog"])


class StaffProductResponse(BaseModel):
    id: str
    name: str
    category_id: str
    default_weight_label: str
    price_rub: int
    compare_at_price_rub: int | None = None
    popularity_score: int
    properties: list[str]
    badge: str | None = None
    marble_grade_label: str | None = None
    image_url: str
    description: str | None = None
    hidden: bool
    created_at: datetime


class StaffProductListResponse(BaseModel):
    items: list[StaffProductResponse]


class StaffProductPatchBody(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str | None = None
    category_id: str | None = None
    default_weight_label: str | None = None
    price_rub: int | None = Field(default=None, ge=1, le=99999)
    compare_at_price_rub: int | None = Field(default=None, ge=1, le=99999)
    popularity_score: int | None = Field(default=None, ge=0, le=100)
    properties: list[str] | None = None
    badge: str | None = None
    marble_grade_label: str | None = None
    description: str | None = None
    hidden: bool | None = None


def _service(request: Request) -> StaffCatalogService:
    return request.app.state.ctx.staff_catalog


def _response(row: Product) -> StaffProductResponse:
    return StaffProductResponse(
        id=row.id,
        name=row.name,
        category_id=row.category_id,
        default_weight_label=row.default_weight_label,
        price_rub=row.price_rub,
        compare_at_price_rub=row.compare_at_price_rub,
        popularity_score=row.popularity_score,
        properties=list(row.properties),
        badge=row.badge,
        marble_grade_label=row.marble_grade_label,
        image_url=row.image_url,
        description=row.description,
        hidden=row.hidden,
        created_at=row.created_at or datetime(1970, 1, 1, tzinfo=UTC),
    )


@router.get("/staff/catalog/products", response_model=StaffProductListResponse)
async def list_staff_products(
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
    q: str | None = None,
    visibility: str = "all",
) -> StaffProductListResponse:
    account = await request.app.state.ctx.session.caller(access_token)
    rows = await _service(request).list_products(
        account, StaffProductListQuery(q=q, visibility=visibility)
    )
    return StaffProductListResponse(items=[_response(row) for row in rows])


@router.post("/staff/catalog/products", response_model=StaffProductResponse, status_code=201)
async def create_staff_product(
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
    id: Annotated[str, Form()],
    name: Annotated[str, Form()],
    category_id: Annotated[str, Form()],
    default_weight_label: Annotated[str, Form()],
    price_rub: Annotated[int, Form()],
    popularity_score: Annotated[int, Form()],
    image: Annotated[UploadFile, File()],
    properties: Annotated[str, Form()] = "[]",
    compare_at_price_rub: Annotated[int | None, Form()] = None,
    badge: Annotated[str | None, Form()] = None,
    marble_grade_label: Annotated[str | None, Form()] = None,
    description: Annotated[str | None, Form()] = None,
    hidden: Annotated[bool, Form()] = False,
) -> StaffProductResponse:
    account = await request.app.state.ctx.session.caller(access_token)
    data = await image.read()
    draft = StaffProductDraft(
        id=id,
        name=name,
        category_id=category_id,
        default_weight_label=default_weight_label,
        price_rub=price_rub,
        popularity_score=popularity_score,
        properties=parse_properties(properties),
        compare_at_price_rub=compare_at_price_rub,
        badge=badge,
        marble_grade_label=marble_grade_label,
        description=description,
        hidden=hidden,
    )
    created = await _service(request).create_product(
        account, draft, data, image.content_type
    )
    return _response(created)


@router.patch("/staff/catalog/products/{product_id}", response_model=StaffProductResponse)
async def patch_staff_product(
    product_id: str,
    body: StaffProductPatchBody,
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
) -> StaffProductResponse:
    account = await request.app.state.ctx.session.caller(access_token)
    patch = _to_patch(body)
    updated = await _service(request).patch_product(account, product_id, patch)
    return _response(updated)


@router.put("/staff/catalog/products/{product_id}/image", response_model=StaffProductResponse)
async def put_staff_product_image(
    product_id: str,
    request: Request,
    access_token: Annotated[str, Depends(bearer_token)],
    image: Annotated[UploadFile, File()],
) -> StaffProductResponse:
    account = await request.app.state.ctx.session.caller(access_token)
    data = await image.read()
    updated = await _service(request).replace_image(
        account, product_id, data, image.content_type
    )
    return _response(updated)


def _to_patch(body: StaffProductPatchBody) -> StaffProductPatch:
    raw: dict[str, Any] = body.model_dump(exclude_unset=True)
    clear_badge = "badge" in raw and raw["badge"] is None
    clear_compare = "compare_at_price_rub" in raw and raw["compare_at_price_rub"] is None
    clear_marble = "marble_grade_label" in raw and raw["marble_grade_label"] is None
    clear_description = "description" in raw and raw["description"] is None
    properties = None
    if "properties" in raw and raw["properties"] is not None:
        properties = parse_properties(raw["properties"])
    return StaffProductPatch(
        name=raw.get("name"),
        category_id=raw.get("category_id"),
        default_weight_label=raw.get("default_weight_label"),
        price_rub=raw.get("price_rub"),
        compare_at_price_rub=raw.get("compare_at_price_rub"),
        clear_compare_at=clear_compare,
        popularity_score=raw.get("popularity_score"),
        properties=properties,
        badge=None if clear_badge else raw.get("badge"),
        clear_badge=clear_badge,
        marble_grade_label=None if clear_marble else raw.get("marble_grade_label"),
        clear_marble=clear_marble,
        description=None if clear_description else raw.get("description"),
        clear_description=clear_description,
        hidden=raw.get("hidden"),
    )
