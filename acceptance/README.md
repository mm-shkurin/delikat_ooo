# Acceptance — Selenium (stories 08 + 10 UI)

```powershell
cd acceptance
pip install -r requirements.txt
pytest -m frontend
```

- **Chrome** + ChromeDriver (Selenium Manager подтягивает driver).
- По умолчанию поднимает **mock API** + **Vite** на свободных портах.
- Если уже крутится Docker: `set ACCEPTANCE_BASE_URL=http://127.0.0.1:5173` и `pytest -m frontend`.
- Story 10: `test_checkout_story10.py` — quick add + «Оформить заказ» → receipt (mock cart API).
