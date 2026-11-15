from usecase.staff.errors import Forbidden


class StaffOrdersForbidden(Forbidden):
    """Caller is not an active owner, manager, or cashier."""


class StaffOrderError(Exception):
    code = "error"
    message = ""


class InvalidStatusTransition(StaffOrderError):
    code = "invalid_status_transition"
    message = "Этот статус отсюда не поставить."


class InvalidOrderStatus(StaffOrderError):
    code = "validation_error"
    message = "Некорректный статус."


class InvalidOrderId(StaffOrderError):
    code = "validation_error"
    message = "Некорректный номер заказа."


class OrderNotFound(StaffOrderError):
    code = "order_not_found"
    message = "Заказ не найден."
