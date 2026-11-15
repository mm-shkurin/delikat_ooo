ORDER_STATUSES = frozenset({"accepted", "packing", "ready", "done", "cancelled"})

_FORWARD = {"accepted": "packing", "packing": "ready", "ready": "done"}


def next_statuses(status: str) -> tuple[str, ...]:
    step = _FORWARD.get(status)
    if step is None:
        return ()
    return (step, "cancelled")
