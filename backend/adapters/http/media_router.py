from fastapi import APIRouter, Request, Response

from usecase.staff_catalog.service import StaffCatalogService

router = APIRouter(tags=["media"])


def _service(request: Request) -> StaffCatalogService:
    return request.app.state.ctx.staff_catalog


@router.get("/media/products/{product_id}")
async def get_product_media(product_id: str, request: Request) -> Response:
    image = await _service(request).get_media(product_id)
    return Response(content=image.data, media_type=image.content_type)
