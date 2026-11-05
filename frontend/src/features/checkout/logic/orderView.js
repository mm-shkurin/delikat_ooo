export function orderCreatedToView(order) {
  return {
    orderId: order.order_id,
    status: order.status,
    total: order.total_rub,
    message: order.message,
    mode: order.fulfillment.mode,
    city: order.fulfillment.address.city,
    streetLine: order.fulfillment.address.street_line ?? '',
    lines: order.lines.map((line) => ({
      productId: line.product_id,
      name: line.product_name,
      weightLabel: line.weight_label,
      quantity: line.quantity,
      unitPrice: line.unit_price_rub,
      lineTotal: line.line_total_rub,
    })),
  }
}
