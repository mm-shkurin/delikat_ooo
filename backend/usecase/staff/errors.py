class Forbidden(Exception):
    """Caller is not allowed to perform the staff action."""


class OwnerImmutable(Exception):
    """Owner role cannot be assigned, changed, or removed via staff API."""


class StaffNotFound(Exception):
    """Staff member id does not exist."""


class StaffValidation(Exception):
    """Invalid email or role for staff assign/update."""
