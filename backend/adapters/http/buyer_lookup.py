from usecase.account.session import SessionService


class SessionBuyerLookup:
    def __init__(self, session: SessionService) -> None:
        self._session = session

    async def lookup(self, access_token: str) -> tuple[str, str | None]:
        account = await self._session.caller(access_token)
        return account.shown_name(), account.email
