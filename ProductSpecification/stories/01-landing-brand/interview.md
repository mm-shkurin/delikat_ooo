# Interview — 01 Покупатель знакомится с брендом на главной

**Статус:** закрыто для story-spec (эталон в `site/`).  
**Волна:** эталон мокапа; повторная проверка после **08** (лендинг не ломаем).

## Scope

**IN:** первое впечатление — hero (proof, kicker, h1, lead, CTA), переключатель доставка/самовывоз на hero, блок «интеллектуальная упаковка», футер с якорями; nav, theme, телефон, burger; chip города/адреса/самовывоза на главной.

**OUT:** каталог и фильтры (02/08); добавление товаров с главной; QR-скан камерой; оплата; CMS.

## Pages / Surfaces

- `site/index.html` — `#welcome` hero-shell, `#packaging`, `.site-footer`
- Якоря: `#delivery`, `#about`, `#packaging`, `#recipes`, `#contacts` (короткий текст-заглушка в footer-блоках)
- Nav → `catalog.html`, `catalog.html#sale`; с каталога info-ссылки → `index.html#…`
- Оверлеи: `#cart`, `#address`, `#auth` — открываются с header; сценарий покупки ведёт в каталог

## Content & Assets

- Hero copy, упаковка — **рабочий маркетинг** в макете; финальные тексты — от владельца бренда.
- `assets/hero/hero-meat.png`, `assets/packaging/packaging.png`, `assets/logo/*`
- Шрифты: Manrope, Oswald, Source Serif 4
- `DECISION:` proof — glass chips (★ 4.9, Свежее, …), не card-grid в hero

## Key Decisions

- `DECISION:` тема `wine` | `charcoal`, ключ `delikat-theme`, default `wine`
- `DECISION:` chip: pickup → «Самовывоз»; delivery → сохранённый адрес или «Омск»
- `DECISION:` корзина на главине — отдельный `state` в `home.js`; не синхронизирована с каталогом до **10**
- `DECISION:` `#privacy-note` — локальная подсказка «на сервер не уходит» актуальна до Wave 2 API

## Behavior & Rules

- «В мясной каталог» → `catalog.html`
- mode-delivery / mode-pickup — только UI + chip (без API в Wave 1)
- Burger toggles `menu-pop`; mobile «Адрес доставки» → address sheet
- Layers: shade, ×, click shade закрывает
- Dock «К заказу» виден при qty > 0 (на главной почти всегда 0)

## Already Implemented (REUSE)

- `index.html`, `home.js`, `home.css`, tokens

## NOT Yet Implemented (Gaps)

- Formal story-spec + check checklist
- Полноценные тексты about/recipes/contacts (не блокер для 08)

## Out of Scope

- API, каталог, SMS

## Integrations

- `tel:+73812300000` — кликабельный номер

## Check Notes

- 390px и desktop: hero, packaging grid, footer
- Theme persist reload
- Nav round-trip catalog ↔ index
