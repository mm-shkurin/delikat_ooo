from usecase.staff.errors import Forbidden


class StaffAnalyticsForbidden(Forbidden):
    """Caller is not an active owner."""
