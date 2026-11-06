from domain.cart.models import Cart, Fulfillment


def street_ok(fulfillment: Fulfillment) -> bool:
    if fulfillment.mode == "pickup":
        return True
    street = fulfillment.address.street_line
    return bool(street and str(street).strip())


def can_checkout(cart: Cart) -> bool:
    items_count = sum(line.quantity for line in cart.lines)
    return items_count > 0 and street_ok(cart.fulfillment)
