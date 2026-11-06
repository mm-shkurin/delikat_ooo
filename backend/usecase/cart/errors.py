class ShopSessionRequired(Exception):
    pass


class AddressRequired(Exception):
    pass


class LineNotFound(Exception):
    pass


class CartEmpty(Exception):
    pass


class CannotCheckout(Exception):
    pass


class InvalidFulfillment(Exception):
    pass


class InvalidQuantity(Exception):
    pass


class MissingIdempotencyKey(Exception):
    pass


class InvalidIdempotencyKey(Exception):
    pass


class IdempotencyConflict(Exception):
    """Key already belongs to a different shopper. Do not return that order."""

    pass
