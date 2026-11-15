import re

from usecase.staff_categories.errors import BAD_ID, EMPTY_TITLE, LONG_TITLE, invalid, reserved

_ID = re.compile(r"^[a-z][a-z0-9-]{0,31}$")


def clean_new_id(raw: str) -> str:
    category_id = raw.strip()
    if category_id == "all":
        raise reserved()
    if _ID.fullmatch(category_id) is None:
        raise invalid(BAD_ID)
    return category_id


def clean_title(raw: str) -> str:
    title = raw.strip()
    if not title:
        raise invalid(EMPTY_TITLE)
    if len(title) > 120:
        raise invalid(LONG_TITLE)
    return title
