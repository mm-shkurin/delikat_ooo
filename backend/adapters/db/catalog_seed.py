import json
import os
from pathlib import Path


def _fixtures_dir() -> Path:
    for key in ("CATALOG_FIXTURES_DIR", "FIXTURES_DIR"):
        raw = os.environ.get(key)
        if raw:
            return Path(raw)
    repo_root = Path(__file__).resolve().parents[3]
    return repo_root / "ProductSpecification" / "api-specs" / "examples"


def load_category_rows() -> list[dict]:
    fixtures = _fixtures_dir()
    payload = json.loads((fixtures / "catalog-categories.json").read_text(encoding="utf-8"))
    return list(payload["items"])


def load_product_rows() -> list[dict]:
    fixtures = _fixtures_dir()
    payload = json.loads((fixtures / "catalog-products-page.json").read_text(encoding="utf-8"))
    return list(payload["items"])
