from datetime import datetime
from zoneinfo import ZoneInfo

OMSK = ZoneInfo("Asia/Omsk")

_RU_MONTH_SHORT = (
    "янв.",
    "фев.",
    "мар.",
    "апр.",
    "мая",
    "июн.",
    "июл.",
    "авг.",
    "сент.",
    "окт.",
    "нояб.",
    "дек.",
)


def to_omsk(moment: datetime) -> datetime:
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=ZoneInfo("UTC"))
    return moment.astimezone(OMSK)


def day_key(moment: datetime) -> str:
    local = to_omsk(moment)
    return f"{local.year:04d}-{local.month:02d}-{local.day:02d}"


def day_label(day: str) -> str:
    year, month, day_num = (int(part) for part in day.split("-"))
    return f"{day_num} {_RU_MONTH_SHORT[month - 1]}"
