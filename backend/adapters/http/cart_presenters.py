from domain.cart.models import Cart
from domain.cart.rules import can_checkout


def serialize_cart(cart: Cart) -> dict:
    items_count = sum(line.quantity for line in cart.lines)
    total_rub = sum(line.line_total_rub for line in cart.lines)
    return {
        "fulfillment": {
            "mode": cart.fulfillment.mode,
            "address": {
                "city": cart.fulfillment.address.city,
                "street_line": cart.fulfillment.address.street_line,
            },
        },
        "items": [
            {
                "line_id": str(line.line_id),
                "product_id": line.product_id,
                "product_name": line.product_name,
                "weight_label": line.weight_label,
                "quantity": line.quantity,
                "unit_price_rub": line.unit_price_rub,
                "line_total_rub": line.line_total_rub,
            }
            for line in cart.lines
        ],
        "items_count": items_count,
        "total_rub": total_rub,
        "can_checkout": can_checkout(cart),
    }
