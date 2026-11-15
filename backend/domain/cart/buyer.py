GUEST_BUYER_NAME = "Гость"


def present_buyer_name(raw: str | None) -> str:
    if raw is None or not raw.strip():
        return GUEST_BUYER_NAME
    return raw
