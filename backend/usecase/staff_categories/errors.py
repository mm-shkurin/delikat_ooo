from usecase.staff.errors import Forbidden

BAD_ID = "Некорректный код категории."
EMPTY_TITLE = "Введите название."
LONG_TITLE = "Название не длиннее 120 символов."
TAKEN = "Такая категория уже есть."
RESERVED = "Код all занят кнопкой «Все»."
MISSING = "Категория не найдена."
FAILED = "Не получилось. Попробуйте ещё раз."


class StaffCategoryForbidden(Forbidden):
    pass


class StaffCategoryFailure(Exception):
    def __init__(self, code: str, message: str, status: int = 400) -> None:
        self.code = code
        self.message = message
        self.status = status
        super().__init__(message)


def invalid(message: str) -> StaffCategoryFailure:
    return StaffCategoryFailure("validation_error", message)


def reserved() -> StaffCategoryFailure:
    return StaffCategoryFailure("category_id_reserved", RESERVED)


def taken() -> StaffCategoryFailure:
    return StaffCategoryFailure("category_id_taken", TAKEN)


def missing() -> StaffCategoryFailure:
    return StaffCategoryFailure("category_not_found", MISSING, status=404)
