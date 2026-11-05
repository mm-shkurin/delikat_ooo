from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, ConfigDict, Field

from adapters.http.shop_session import ensure_shop_session, require_shop_session
from usecase.cart.service import CartService, serialize_cart

router = APIRouter(tags=["cart"])


class DeliveryAddressBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    city: str = Field(default="Омск", max_length=64)
    street_line: str | None = Field(default=None, max_length=80)


class CartFulfillmentUpdateBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    mode: str
    address: DeliveryAddressBody | None = None


class AddCartItemBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: str
    quantity: int = Field(default=1, ge=1, le=99)
    weight_label: str | None = Field(default=None, max_length=32)


class PatchCartItemBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    quantity: int = Field(ge=1, le=99)


def _cart(request: Request) -> CartService:
    return request.app.state.ctx.cart


@router.get("/cart")
async def get_cart(request: Request, session_id: Annotated[str, Depends(require_shop_session)]) -> dict:
    cart = await _cart(request).get_cart(session_id)
    return serialize_cart(cart)


@router.put("/cart/fulfillment")
async def update_fulfillment(
    request: Request,
    response: Response,
    body: CartFulfillmentUpdateBody,
) -> dict:
    session_id = ensure_shop_session(request, response)
    address = body.address
    cart = await _cart(request).update_fulfillment(
        session_id,
        mode=body.mode,
        city=address.city if address else None,
        street_line=address.street_line if address else None,
    )
    return serialize_cart(cart)


@router.post("/cart/items")
async def add_cart_item(
    request: Request,
    response: Response,
    body: AddCartItemBody,
) -> dict:
    session_id = ensure_shop_session(request, response)
    cart = await _cart(request).add_item(
        session_id,
        product_id=body.product_id,
        quantity=body.quantity,
        weight_label=body.weight_label,
    )
    return serialize_cart(cart)


@router.patch("/cart/items/{line_id}")
async def patch_cart_item(
    line_id: UUID,
    request: Request,
    body: PatchCartItemBody,
    session_id: Annotated[str, Depends(require_shop_session)],
) -> dict:
    cart = await _cart(request).patch_line(session_id, line_id, body.quantity)
    return serialize_cart(cart)


@router.delete("/cart/items/{line_id}")
async def delete_cart_item(
    line_id: UUID,
    request: Request,
    session_id: Annotated[str, Depends(require_shop_session)],
) -> dict:
    cart = await _cart(request).delete_line(session_id, line_id)
    return serialize_cart(cart)
