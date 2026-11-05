class Unauthorized(Exception):
    """Invalid or expired session."""


class StoreUnavailable(Exception):
    """Persistence unavailable."""


class OAuthFailed(Exception):
    """OAuth provider error."""


class InvalidDisplayName(Exception):
    """PATCH /me display_name validation failed."""
