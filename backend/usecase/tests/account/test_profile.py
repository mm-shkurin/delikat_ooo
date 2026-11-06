from datetime import UTC, datetime
from uuid import uuid4

from domain.account.account import Account
from usecase.account.profile import ProfileService, UserProfileView


def _account(**overrides) -> Account:
    fields = {
        "id": uuid4(),
        "yandex_subject": "subject",
        "email": "a@b.test",
        "provider_name": "Ada",
        "created_at": datetime(2026, 11, 6, tzinfo=UTC),
        "profile_name": "Adelaide",
        "avatar_url": "https://example.test/a.png",
    }
    fields.update(overrides)
    return Account(**fields)


def test_view_returns_profile_model():
    account = _account()
    view = ProfileService(accounts=None).view(account)
    assert view == UserProfileView(
        user_id=str(account.id),
        email="a@b.test",
        display_name="Adelaide",
        provider_display_name="Ada",
        avatar_url="https://example.test/a.png",
    )


def test_view_uses_provider_name_when_profile_name_is_empty():
    account = _account(profile_name=None, avatar_url=None)
    view = ProfileService(accounts=None).view(account)
    assert view.display_name == "Ada"
    assert view.avatar_url is None
