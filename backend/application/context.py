from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker

from adapters.cache.redis_oauth import RedisOAuthStore
from adapters.cache.redis_revocations import RedisRevocations
from adapters.db.account_store import PostgresAccountStore
from adapters.db.cart_store import PostgresCartStore
from adapters.db.catalog_store import PostgresCatalogStore
from adapters.db.category_store import PostgresStaffCategoryStore
from adapters.db.session import create_db_engine, create_session_factory
from adapters.db.staff_order_store import PostgresStaffOrderStore
from adapters.db.staff_store import PostgresStaffStore
from adapters.http.buyer_lookup import SessionBuyerLookup
from adapters.live.catalog_hub import CatalogLiveHub
from adapters.oauth.fake import FakeOAuthProvider
from adapters.oauth.yandex import YandexOAuthProvider
from adapters.security.jwt import JwtConfig, JwtTokenIssuer
from application.settings import Settings
from usecase.account.profile import ProfileService
from usecase.account.session import SessionService
from usecase.account.sign_in import SignIn
from usecase.cart.service import CartService
from usecase.catalog.service import CatalogService
from usecase.staff.service import StaffService
from usecase.staff_analytics.service import StaffAnalyticsService
from usecase.staff_catalog.service import StaffCatalogService
from usecase.staff_categories.service import StaffCategoryService
from usecase.staff_orders.service import StaffOrdersService


@dataclass
class RuntimeConfig:
    state_ttl: timedelta
    cors_origins: tuple[str, ...]


@dataclass
class AppContext:
    settings: Settings
    engine: AsyncEngine
    session_factory: async_sessionmaker
    config: RuntimeConfig
    sign_in: SignIn
    session: SessionService
    profile: ProfileService
    catalog: CatalogService
    cart: CartService
    staff: StaffService
    staff_catalog: StaffCatalogService
    staff_categories: StaffCategoryService
    staff_orders: StaffOrdersService
    staff_analytics: StaffAnalyticsService
    catalog_live: CatalogLiveHub
    redis: Redis


def build_context(settings: Settings) -> AppContext:
    engine = create_db_engine(settings.database_url)
    session_factory = create_session_factory(engine)
    accounts = PostgresAccountStore(session_factory)
    staff_store = PostgresStaffStore(session_factory)
    staff = StaffService(
        staff_store,
        accounts,
        settings.staff_owner_emails,
    )
    redis = Redis.from_url(settings.redis_url)
    tokens = JwtTokenIssuer(
        JwtConfig(
            access_secret=settings.jwt_access_secret,
            refresh_secret=settings.jwt_refresh_secret,
            access_ttl=settings.access_ttl,
            refresh_ttl=settings.refresh_ttl,
        )
    )
    provider = _provider(settings)
    clock = _WallClock()
    sign_in = SignIn(
        provider,
        RedisOAuthStore(redis),
        accounts,
        tokens,
        clock,
        settings.state_ttl,
        settings.handoff_ttl,
        settings.frontend_callback_url,
        staff_login=staff,
    )
    session = SessionService(accounts, tokens, RedisRevocations(redis))
    catalog_store = PostgresCatalogStore(session_factory)
    catalog = CatalogService(catalog_store)
    cart = CartService(PostgresCartStore(session_factory), catalog_store, SessionBuyerLookup(session))
    staff_catalog = StaffCatalogService(staff_store, catalog_store)
    catalog_live = CatalogLiveHub()
    staff_categories = StaffCategoryService(
        staff_store,
        PostgresStaffCategoryStore(session_factory),
        catalog_live,
    )
    order_store = PostgresStaffOrderStore(session_factory)
    staff_orders = StaffOrdersService(staff_store, order_store)
    staff_analytics = StaffAnalyticsService(staff_store, order_store)
    return AppContext(
        settings=settings,
        engine=engine,
        session_factory=session_factory,
        config=RuntimeConfig(settings.state_ttl, settings.cors_origins),
        sign_in=sign_in,
        session=session,
        profile=ProfileService(accounts),
        catalog=catalog,
        cart=cart,
        staff=staff,
        staff_catalog=staff_catalog,
        staff_categories=staff_categories,
        staff_orders=staff_orders,
        staff_analytics=staff_analytics,
        catalog_live=catalog_live,
        redis=redis,
    )


def _provider(settings: Settings):
    if settings.oauth_provider == "fake":
        return FakeOAuthProvider(settings.yandex_redirect_uri)
    return YandexOAuthProvider(
        settings.yandex_client_id,
        settings.yandex_client_secret,
        settings.yandex_redirect_uri,
        settings.yandex_authorize_url,
        settings.yandex_token_url,
        settings.yandex_info_url,
    )


class _WallClock:
    def now(self) -> datetime:
        return datetime.now(UTC)
