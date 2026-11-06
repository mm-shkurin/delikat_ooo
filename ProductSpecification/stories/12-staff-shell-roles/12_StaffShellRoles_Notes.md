# Staff: вход, роль, каркас вкладок — Notes

## Warnings

### Functional
- Первый и любые доп. owner — только bootstrap seed/env (ops); UI никогда не выдаёт и не снимает `owner`.
- Ops-путь снять owner (если появится) обязан запрещать снятие последнего owner; в кабинете этого пути нет.
- Email для матчинга pending = email из профиля после Yandex; рассинхрон провайдера → invite «висит».
- Manager видит строки owner/manager в списке (read-only), без select/«Убрать».

### UI/UX
- Каркас вкладок 13–16 из мокапа может выглядеть «живым»; подписать/задизейблить write-контроли, если иначе путает DoD 12.
- Демо-пароль `staff` из mock 11 в prod UI не переносить.

### Technical
- JWT buyer vs staff: один OAuth exchange; staff-роль — claim или `GET` staff me из `admin_api.yaml` (решить в api-spec).
- Nice D (httpOnly JWT) из carryover 11 — adjacent, не блокер AC 12, но риск XSS на admin shell.

## Suggestions & Future

### Functional
- Аудит «кто назначил роль» — не в 12.
- Self-service смена email в профиле и перепривязка pending — позже.

### UI/UX
- Подвкладка «Назначить» может позже стать модалкой из Список — не менять AC без нового interview.

### Technical
- Rate-limit invite-by-email; нормализация email (case/domain) — в api-spec / implement.

## Technical Notes

### Assets
- Референс: `site/admin/index.html`, `site/css/admin.css`; React в `frontend/` route `/admin`.
- Контракт: новый `ProductSpecification/api-specs/admin_api.yaml`.

### Responsive
- ~390px: tabs wrap, список staff столбиком (как sku/order cards в мокапе).

### Accessibility
- Tabs: `role="tablist"` / `aria-selected` как в мокапе; ошибки назначения — текст у формы, не только toast.

### Brand constraints
- Manrope / Oswald + tokens витрины; без «Админ» в публичном header (D3).
- Gate/shell — кабинетный тон мокапа, не новый бренд-язык.
