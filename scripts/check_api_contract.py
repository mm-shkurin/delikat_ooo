"""Сверка путей фронтенда с ProductSpecification/api-specs/*.yaml.

Запуск: python scripts/check_api_contract.py [--update-baseline]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
PATHS = ROOT / "frontend/src/shared/api/backend/paths.js"
SPECS = ROOT / "ProductSpecification/api-specs"
BASELINE = ROOT / "scripts/api-contract-baseline.json"

PARAM = re.compile(r"\$\{[^}]*\}")
TEMPLATE = re.compile(r"`([^`]*)`")
BRACED = re.compile(r"\{[^}]+\}")
V1_CONST = re.compile(r"const\s+V1\s*=\s*['\"]([^'\"]+)['\"]")


def frontend_paths() -> set[str]:
    if not PATHS.exists():
        raise SystemExit(f"Не найден {PATHS.relative_to(ROOT)}")
    text = PATHS.read_text(encoding="utf-8")
    version_match = V1_CONST.search(text)
    prefix = version_match.group(1) if version_match else "/api/v1"

    paths: set[str] = set()
    for raw in TEMPLATE.findall(text):
        if "${V1}" not in raw and not raw.startswith(prefix):
            continue
        path = PARAM.sub("{}", raw.replace("${V1}", prefix))
        paths.add(path.split("?")[0])
    if not paths:
        raise SystemExit(f"В {PATHS.relative_to(ROOT)} не найдено ни одного пути")
    return paths


def contract_paths() -> set[str]:
    paths: set[str] = set()
    for spec in sorted(SPECS.glob("*.yaml")):
        document = yaml.safe_load(spec.read_text(encoding="utf-8")) or {}
        paths.update(BRACED.sub("{}", path) for path in (document.get("paths") or {}))
    return paths


def main() -> int:
    argv = sys.argv[1:]
    front = frontend_paths()
    contract = contract_paths()
    missing = sorted(front - contract)

    if "--update-baseline" in argv:
        BASELINE.write_text(
            json.dumps({"not_in_contract": missing}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"Записано путей вне контракта: {len(missing)}")
        return 0

    known = set()
    if BASELINE.exists():
        known = set(json.loads(BASELINE.read_text(encoding="utf-8"))["not_in_contract"])
    new = [path for path in missing if path not in known]
    landed = sorted(known - set(missing))

    print(f"Фронтенд: {len(front)} путей. Контракт: {len(contract)}.")
    print(f"Вне контракта: {len(missing)}.")

    if landed:
        print("\nПути появились в контракте — уберите из scripts/api-contract-baseline.json:")
        for path in landed:
            print(f"  {path}")
    if new:
        print("\nФронт зовёт путь, которого нет в контракте и baseline:")
        for path in new:
            print(f"  {path}")

    return 1 if (new or landed) else 0


if __name__ == "__main__":
    raise SystemExit(main())
