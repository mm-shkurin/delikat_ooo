def buyer_key(buyer_name: str) -> str:
    trimmed = buyer_name.strip()
    return trimmed if trimmed else "Гость"


def product_key(product_name: str) -> str:
    trimmed = product_name.strip()
    return trimmed if trimmed else "Без названия"
