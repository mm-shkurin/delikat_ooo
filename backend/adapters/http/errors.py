import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from usecase.account.errors import InvalidDisplayName, StoreUnavailable, Unauthorized
from usecase.cart.errors import (
    AddressRequired,
    CannotCheckout,
    CartEmpty,
    IdempotencyConflict,
    InvalidFulfillment,
    InvalidIdempotencyKey,
    InvalidQuantity,
    LineNotFound,
    MissingIdempotencyKey,
    ShopSessionRequired,
)
from usecase.catalog.errors import InvalidCatalogQuery, ProductNotFound

_UNAUTHORIZED = {"code": "unauthorized", "message": "Credentials are not valid"}
_SESSION_REQUIRED = {"code": "unauthorized", "message": "Shop session is required"}
_ADDRESS_REQUIRED = {"code": "address_required", "message": "Укажите адрес доставки перед добавлением в корзину"}
_LINE_NOT_FOUND = {"code": "line_not_found", "message": "Строка не найдена"}
_CART_EMPTY = {"code": "cart_empty", "message": "Корзина пуста"}
_CANNOT_CHECKOUT = {"code": "cannot_checkout", "message": "Нельзя оформить заказ"}
_INVALID_REQUEST = {"code": "invalid_request", "message": "The request is not valid"}
_VALIDATION = {"code": "validation_error", "message": "Query parameters are not valid"}
_PRODUCT_NOT_FOUND = {"code": "product_not_found", "message": "Product was not found"}
_INVALID_DISPLAY_NAME = {"code": "invalid_display_name", "message": "Display name is not valid"}
_UNAVAILABLE = {"code": "unavailable", "message": "The service is temporarily unavailable"}
_FINISHED = {"code": "internal_error", "message": "The request could not be finished"}
_IDEMPOTENCY_CONFLICT = {"code": "idempotency_conflict", "message": "Idempotency key is already in use"}
_LOG = logging.getLogger("delikat.http")


def register_errors(app: FastAPI) -> None:
    app.add_exception_handler(Unauthorized, _status(401, _UNAUTHORIZED))
    app.add_exception_handler(ShopSessionRequired, _status(401, _SESSION_REQUIRED))
    app.add_exception_handler(ProductNotFound, _status(404, _PRODUCT_NOT_FOUND))
    app.add_exception_handler(LineNotFound, _status(404, _LINE_NOT_FOUND))
    app.add_exception_handler(AddressRequired, _status(409, _ADDRESS_REQUIRED))
    app.add_exception_handler(CartEmpty, _status(409, _CART_EMPTY))
    app.add_exception_handler(CannotCheckout, _status(409, _CANNOT_CHECKOUT))
    app.add_exception_handler(MissingIdempotencyKey, _status(400, _INVALID_REQUEST))
    app.add_exception_handler(InvalidIdempotencyKey, _status(400, _INVALID_REQUEST))
    app.add_exception_handler(IdempotencyConflict, _status(409, _IDEMPOTENCY_CONFLICT))
    app.add_exception_handler(InvalidFulfillment, _status(400, _INVALID_REQUEST))
    app.add_exception_handler(InvalidQuantity, _status(400, _INVALID_REQUEST))
    app.add_exception_handler(InvalidCatalogQuery, _status(400, _VALIDATION))
    app.add_exception_handler(InvalidDisplayName, _status(422, _INVALID_DISPLAY_NAME))
    app.add_exception_handler(StoreUnavailable, _status(503, _UNAVAILABLE))
    app.add_exception_handler(RequestValidationError, _status(400, _INVALID_REQUEST))
    app.add_exception_handler(Exception, _status(500, _FINISHED, log_error=True))


def _status(status: int, body: dict, *, log_error: bool = False):
    async def handler(_request: Request, exc: Exception) -> JSONResponse:
        if log_error:
            _LOG.exception("unhandled request failure", exc_info=exc)
        return JSONResponse(status_code=status, content=body)

    return handler
