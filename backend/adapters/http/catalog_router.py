from typing import Annotated

from fastapi import APIRouter, Query, Request
from pydantic import BaseModel, ConfigDict

from usecase.catalog.queries import ProductListQuery
from usecase.catalog.service import CatalogService

router = APIRouter(tags=["catalog"])


class CategoryItem(BaseModel):
    id: str
    title: str
    sort_order: int


class CategoryListResponse(BaseModel):
    items: list[CategoryItem]


class ProductSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    category_id: str
    default_weight_label: str
    price_rub: int
    compare_at_price_rub: int | None
    popularity_score: int
    properties: list[str]
    badge: str | None
    marble_grade_label: str | None
    image_url: str


class ProductListResponse(BaseModel):
    items: list[ProductSummaryResponse]
    total_count: int
    limit: int
    offset: int


class ProductDetailResponse(ProductSummaryResponse):
    weight_options: list[str]
    description: str | None = None


def _catalog(request: Request) -> CatalogService:
    return request.app.state.ctx.catalog


@router.get("/catalog/categories", response_model=CategoryListResponse)
async def list_categories(request: Request) -> CategoryListResponse:
    rows = await _catalog(request).list_categories()
    return CategoryListResponse(
        items=[CategoryItem(id=row.id, title=row.title, sort_order=row.sort_order) for row in rows]
    )


@router.get("/catalog/products", response_model=ProductListResponse)
async def list_products(
    request: Request,
    category_id: str | None = None,
    max_price_rub: int | None = None,
    property: Annotated[list[str] | None, Query()] = None,
    sort: str = "pop",
    limit: int = 16,
    offset: int = 0,
) -> ProductListResponse:
    result = await _catalog(request).list_products(
        ProductListQuery(
            category_id=category_id,
            max_price_rub=max_price_rub,
            properties=tuple(property or ()),
            sort=sort,
            limit=limit,
            offset=offset,
        )
    )
    return ProductListResponse(
        items=[_summary(row) for row in result.items],
        total_count=result.total_count,
        limit=result.limit,
        offset=result.offset,
    )


@router.get("/catalog/products/{product_id}", response_model=ProductDetailResponse)
async def get_product(product_id: str, request: Request) -> ProductDetailResponse:
    service = _catalog(request)
    row = await service.get_product(product_id)
    return ProductDetailResponse(
        **_summary(row).model_dump(),
        weight_options=list(service.weight_options_for(row)),
        description=service.description_for(row),
    )


def _summary(row) -> ProductSummaryResponse:
    return ProductSummaryResponse(
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
    )
