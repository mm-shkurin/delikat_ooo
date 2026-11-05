from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """ORM metadata root; account/catalog tables land in later stories."""
