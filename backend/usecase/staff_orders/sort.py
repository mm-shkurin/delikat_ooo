from domain.cart.staff_order import StaffOrder


def sort_staff_orders(rows: list[StaffOrder]) -> list[StaffOrder]:
    by_id = sorted(rows, key=lambda row: str(row.order_id))
    return sorted(by_id, key=lambda row: row.created_at, reverse=True)
