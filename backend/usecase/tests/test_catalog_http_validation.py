import os

os.environ["OAUTH_PROVIDER"] = "fake"
os.environ.setdefault("REDIS_URL", "redis://127.0.0.1:6379/0")
os.environ.setdefault("JWT_ACCESS_SECRET", "test-access-secret")
os.environ.setdefault("JWT_REFRESH_SECRET", "test-refresh-secret")
os.environ["DATABASE_URL"] = "postgresql+asyncpg://delikat:change-me@127.0.0.1:5434/delikat"

from fastapi.testclient import TestClient

from application.main import create_app


def test_catalog_products_invalid_category_returns_400():
    with TestClient(create_app()) as client:
        response = client.get("/api/v1/catalog/products", params={"category_id": "not-a-category"})
        assert response.status_code == 400
        body = response.json()
        assert body["code"] == "validation_error"


def test_catalog_products_invalid_max_price_returns_400():
    with TestClient(create_app()) as client:
        response = client.get("/api/v1/catalog/products", params={"max_price_rub": 100})
        assert response.status_code == 400
        assert response.json()["code"] == "validation_error"
