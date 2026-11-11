class StaffCatalogForbidden(Exception):
    pass


class StaffCatalogValidation(Exception):
    def __init__(self, message: str = "Staff catalog request is not valid") -> None:
        self.message = message
        super().__init__(message)


class ProductIdTaken(Exception):
    pass


class CategoryNotFound(Exception):
    pass


class StaffProductNotFound(Exception):
    pass


class MediaNotFound(Exception):
    pass
