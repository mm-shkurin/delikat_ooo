import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from adapters.http.auth_router import me_router
from adapters.http.auth_router import router as auth_router
from adapters.http.cart_router import router as cart_router
from adapters.http.catalog_router import router as catalog_router
from adapters.http.errors import register_errors
from adapters.http.orders_router import router as orders_router
from adapters.http.sessions_router import router as sessions_router
from application.context import AppContext, build_context
from application.guest_session_middleware import GuestSessionMiddleware
from application.settings import Settings, load_settings

_LOG = logging.getLogger("delikat.http")


def create_app(settings: Settings | None = None, context: AppContext | None = None) -> FastAPI:
    config = settings if settings is not None else load_settings()
    ctx = context if context is not None else build_context(config)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        async with ctx.engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        app.state.ctx = ctx
        yield
        await ctx.redis.aclose()
        await ctx.engine.dispose()

    app = FastAPI(title="Delikat Store API", lifespan=lifespan)
    app.state.settings = config
    app.state.ctx = ctx
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(config.cors_origins),
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Idempotency-Key", "Accept"],
    )
    app.add_middleware(GuestSessionMiddleware, max_age_sec=config.session_cookie_max_age_sec)
    register_errors(app)

    @app.get("/health")
    async def health():
        try:
            async with ctx.engine.connect() as connection:
                await connection.execute(text("SELECT 1"))
            await ctx.redis.ping()
        except Exception:
            _LOG.exception("health check failed")
            return JSONResponse({"status": "unavailable"}, status_code=503)
        return {"status": "ok"}

    @app.get("/")
    async def root():
        return {"service": "delikat", "status": "ok"}

    app.include_router(auth_router, prefix="/api/v1/auth")
    app.include_router(me_router, prefix="/api/v1")
    app.include_router(sessions_router, prefix="/api/v1")
    app.include_router(catalog_router, prefix="/api/v1")
    app.include_router(cart_router, prefix="/api/v1")
    app.include_router(orders_router, prefix="/api/v1")
    return app


def __getattr__(name: str):
    if name == "app":
        return create_app()
    raise AttributeError(name)
