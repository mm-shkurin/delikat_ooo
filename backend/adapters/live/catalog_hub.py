import json

from fastapi import WebSocket

from usecase.catalog.live import CATALOG_CHANGED


class CatalogLiveHub:
    def __init__(self) -> None:
        self._clients: set[WebSocket] = set()

    async def connect(self, socket: WebSocket) -> None:
        await socket.accept()
        self._clients.add(socket)

    def disconnect(self, socket: WebSocket) -> None:
        self._clients.discard(socket)

    async def catalog_changed(self) -> None:
        payload = json.dumps(CATALOG_CHANGED)
        dead: list[WebSocket] = []
        for socket in list(self._clients):
            try:
                await socket.send_text(payload)
            except Exception:
                dead.append(socket)
        for socket in dead:
            self.disconnect(socket)
