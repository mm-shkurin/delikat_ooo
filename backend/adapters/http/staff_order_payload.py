from domain.cart.staff_order import StaffOrder


def staff_order_payload(order: StaffOrder) -> dict:
    return {
        "order_id": str(order.order_id),
        "status": order.status,
        "allowed_next": list(order.allowed_next),
        "total_rub": order.total_rub,
        "created_at": order.created_at.isoformat(),
        "buyer_name": order.buyer_name,
        "buyer_email": order.buyer_email,
        "customer_note": order.customer_note,
        "fulfillment": {
            "mode": order.fulfillment.mode,
            "address": {
                "city": order.fulfillment.address.city,
                "street_line": order.fulfillment.address.street_line,
            },
        },
        "lines": [
            {
                "product_id": line.product_id,
                "product_name": line.product_name,
                "weight_label": line.weight_label,
                "quantity": line.quantity,
                "unit_price_rub": line.unit_price_rub,
                "line_total_rub": line.line_total_rub,
            }
            for line in order.lines
        ],
    }
