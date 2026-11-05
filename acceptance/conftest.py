import os
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import httpx
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
MOCK_API = ROOT / "infra" / "mock-api"
FIXTURES = ROOT / "ProductSpecification" / "api-specs" / "examples"

pytest.register_assert_rewrite("statements.catalog_statements")

from statements.catalog_statements import CatalogStatements  # noqa: E402


def _free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def _chrome():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1400,1000")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=options)
    driver.set_window_size(1400, 1000)
    driver.set_page_load_timeout(30)
    return driver


def _log_tail(log_path: str) -> str:
    with open(log_path, encoding="utf-8", errors="replace") as handle:
        return handle.read()[-2000:]


def _wait_http(url: str, proc, log_path: str) -> None:
    deadline = time.monotonic() + 90
    while time.monotonic() < deadline:
        if proc is not None and proc.poll() is not None:
            raise RuntimeError(_log_tail(log_path))
        try:
            if httpx.get(url, timeout=0.5).status_code == 200:
                return
        except httpx.HTTPError:
            pass
        time.sleep(0.25)
    raise RuntimeError(_log_tail(log_path))


def _stop_process(proc) -> None:
    if proc is None or proc.poll() is not None:
        return
    if sys.platform == "win32":
        subprocess.run(
            ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
    else:
        proc.terminate()
    try:
        proc.wait(timeout=8)
    except subprocess.TimeoutExpired:
        proc.kill()


def _start_mock_api(port: int, log_handle):
    env = os.environ.copy()
    env["FIXTURES_DIR"] = str(FIXTURES)
    env["PYTHONUNBUFFERED"] = "1"
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", str(port)],
        cwd=MOCK_API,
        env=env,
        stdin=subprocess.DEVNULL,
        stdout=log_handle,
        stderr=subprocess.STDOUT,
    )


def _start_vite(port: int, api_target: str, log_handle):
    env = os.environ.copy()
    env["VITE_API_PROXY_TARGET"] = api_target
    env["FRONTEND_HOST"] = "127.0.0.1"
    env["FRONTEND_PORT"] = str(port)
    env["BROWSER"] = "none"
    npm = "npm.cmd" if sys.platform == "win32" else "npm"
    return subprocess.Popen(
        [npm, "run", "dev"],
        cwd=FRONTEND,
        env=env,
        stdin=subprocess.DEVNULL,
        stdout=log_handle,
        stderr=subprocess.STDOUT,
    )


@pytest.fixture
def catalog_browser():
    """Selenium + frontend. Uses ACCEPTANCE_BASE_URL or starts mock API + Vite."""
    external = os.environ.get("ACCEPTANCE_BASE_URL", "").strip()
    mock = vite = None
    descriptor, log_path = tempfile.mkstemp(prefix="acceptance-delikat-", suffix=".log")
    os.close(descriptor)
    log_handle = open(log_path, "w", encoding="utf-8")
    driver = None
    try:
        if external:
            _wait_http(external, None, log_path)
            app_url = external.rstrip("/")
        else:
            api_port = _free_port()
            ui_port = _free_port()
            mock = _start_mock_api(api_port, log_handle)
            api_url = f"http://127.0.0.1:{api_port}"
            _wait_http(f"{api_url}/health", mock, log_path)
            vite = _start_vite(ui_port, api_url, log_handle)
            app_url = f"http://127.0.0.1:{ui_port}"
            _wait_http(app_url, vite, log_path)

        driver = _chrome()
        yield CatalogStatements(driver, app_url)
    finally:
        if driver is not None:
            driver.quit()
        _stop_process(vite)
        _stop_process(mock)
        log_handle.close()
        Path(log_path).unlink(missing_ok=True)
