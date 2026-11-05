import httpx
import pytest

from adapters.oauth.yandex import YandexOAuthProvider


@pytest.mark.asyncio
async def test_token_post_sends_redirect_uri():
    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        if str(request.url).endswith("/token"):
            seen["body"] = request.content.decode()
            return httpx.Response(200, json={"access_token": "ya-token"})
        return httpx.Response(
            200,
            json={"id": "subject-1", "default_email": "a@b.test", "display_name": "Ada"},
        )

    provider = YandexOAuthProvider(
        client_id="id",
        client_secret="secret",
        redirect_uri="http://127.0.0.1:8000/api/v1/auth/oauth/yandex/callback",
        authorize_url="https://oauth.yandex.ru/authorize",
        token_url="https://oauth.yandex.ru/token",
        info_url="https://login.yandex.ru/info",
        transport=httpx.MockTransport(handler),
    )
    identity = await provider.fetch_identity("demo-code")
    assert "redirect_uri=http%3A%2F%2F127.0.0.1%3A8000%2Fapi%2Fv1%2Fauth%2Foauth%2Fyandex%2Fcallback" in seen["body"]
    assert identity.email == "a@b.test"
