export function cartToView(cart) {
  return {
    mode: cart.fulfillment.mode,
    city: cart.fulfillment.address.city,
    streetLine: cart.fulfillment.address.street_line ?? '',
    items: cart.items.map(cartLineToView),
    itemsCount: cart.items_count,
    total: cart.total_rub,
    canCheckout: cart.can_checkout,
  }
}

function cartLineToView(line) {
  return {
    lineId: line.line_id,
    productId: line.product_id,
    name: line.product_name,
    weightLabel: line.weight_label,
    quantity: line.quantity,
    unitPrice: line.unit_price_rub,
    lineTotal: line.line_total_rub,
  }
}
