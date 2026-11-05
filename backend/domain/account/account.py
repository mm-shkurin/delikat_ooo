from dataclasses import dataclass, replace
from datetime import datetime
from uuid import UUID, uuid4

from domain.account.identity import ProviderIdentity


@dataclass(frozen=True)
class Account:
    id: UUID
    yandex_subject: str
    email: str
    provider_name: str
    created_at: datetime
    profile_name: str | None = None
    avatar_url: str | None = None

    @staticmethod
    def open(identity: ProviderIdentity, created_at: datetime) -> "Account":
        return Account(
            id=uuid4(),
            yandex_subject=identity.subject,
            email=identity.email,
            provider_name=identity.name,
            created_at=created_at,
            avatar_url=identity.avatar_url,
        )

    def shown_name(self) -> str:
        if self.profile_name:
            return self.profile_name
        return self.provider_name

    def with_provider(self, identity: ProviderIdentity) -> "Account":
        return replace(
            self,
            email=identity.email,
            provider_name=identity.name,
            avatar_url=identity.avatar_url,
        )

    def with_profile_name(self, name: str) -> "Account":
        return replace(self, profile_name=name)
