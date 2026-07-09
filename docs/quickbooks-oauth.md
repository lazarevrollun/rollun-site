# QuickBooks OAuth + legal pages (com.rollun.org)

Этот сайт (`rollun-site`, Next.js 16 + Payload, отдаётся на `com.rollun.org`) несёт
две вещи, нужные для интеграции с QuickBooks Online:

1. **Публичные legal-страницы**, которые требует профиль приложения в Intuit Developer.
2. **Self-service OAuth-flow** для снятия/обновления refresh-токена QuickBooks —
   заменяет локальный `npm run auth` + ngrok.

Сам MCP-сервер, который потом ходит в QuickBooks с этим токеном, живёт в отдельном
репозитории: [`llm-tools/mcps/quickbooks`](https://github.com/rollun-lc/llm-tools/tree/master/mcps/quickbooks/server/README.md).
Интеграция **single-tenant** — читаем собственную бухгалтерию Rollun LC (read-only).

## Маршруты

| Путь | Файл | Назначение |
|---|---|---|
| `/eula` | `src/app/(site)/eula/page.tsx` | End-User License Agreement (публичная) |
| `/privacy` | `src/app/(site)/privacy/page.tsx` | Privacy Policy (публичная; Intuit её реально проверяет) |
| `/quickbooks/connect` | `src/app/quickbooks/connect/route.ts` | Редирект на consent-экран Intuit |
| `/quickbooks/callback` | `src/app/quickbooks/callback/route.ts` | Обмен `code` → токены; показывает `refresh_token` + `realmId` |

Legal-страницы — статические, без зависимости от CMS. OAuth-роуты — dynamic route
handlers (читают request/env; **без** `export const dynamic` — он несовместим с
`cacheComponents: true` в `next.config.ts`).

## Переменные окружения

Задаются в `/srv/rollun-site/.env` на хосте (`docker-compose.prod.yml` пробрасывает их
в сервис `app`). Локально — см. `.env.example`.

| Env | Значение / смысл |
|---|---|
| `QUICKBOOKS_CLIENT_ID` | Client ID приложения Intuit (production) |
| `QUICKBOOKS_CLIENT_SECRET` | Client Secret (production) |
| `QUICKBOOKS_REDIRECT_URI` | `https://com.rollun.org/quickbooks/callback` — должен совпадать с Redirect URI в Intuit символ-в-символ |
| `QUICKBOOKS_CONNECT_SECRET` | Guard-ключ: если задан, `/quickbooks/connect` требует `?key=<этот секрет>`, а `/quickbooks/callback` сверяет его в `state` |

Client ID/Secret — те же, что лежат в Secret Manager для MCP-сервиса.

## Как снять / обновить refresh-токен

1. Убедиться, что в приложении Intuit (**Production → Keys & credentials → Redirect
   URIs**) добавлен ровно `https://com.rollun.org/quickbooks/callback`.
2. В браузере, залогинившись в Intuit под аккаунтом с доступом к компании, открыть:
   ```
   https://com.rollun.org/quickbooks/connect?key=<QUICKBOOKS_CONNECT_SECRET>
   ```
   Выбрать компанию → **Authorize**.
3. Страница `/quickbooks/callback` покажет два значения — скопировать в Secret Manager:

   | Со страницы | Secret Manager |
   |---|---|
   | `refresh_token` | `QUICKBOOKS_REFRESH_TOKEN` |
   | `realmId` | `QUICKBOOKS_REALM_ID` |

4. Редеплой сервиса `quickbooks-mcp` (заберёт токен из Secret Manager при старте).

Токен ротируется вручную (~раз в 1–2 месяца, до истечения 100-дневного окна) — подробно
в README MCP-сервера.

## Безопасность

- OAuth-роуты помечены `noindex,nofollow`; `/callback` показывает секрет только тому,
  кто прошёл consent Intuit к нашей компании.
- `QUICKBOOKS_CONNECT_SECRET` не даёт посторонним инициировать handshake против нашего
  приложения.
- Scope запрашивается только `com.intuit.quickbooks.accounting`; сам MCP работает в
  read-only режиме.
- Если Client Secret/refresh-токен где-то засветились — перегенерировать Secret в
  Intuit и обновить его в двух местах: `/srv/rollun-site/.env` **и** Secret Manager.

## Деплой

`/srv/rollun-site` на хосте — **не git-checkout**; выкладка:

```bash
# из локального репозитория rollun-site
rsync -az --exclude .git --exclude node_modules --exclude .next \
  src/ root@<host>:/srv/rollun-site/src/
ssh root@<host> 'cd /srv/rollun-site && docker compose -f docker-compose.prod.yml up -d --build'
```

Билд рендерит CMS-страницы, поэтому нужен доступ к БД на этапе сборки (host network +
`BUILD_DATABASE_URI`, postgres на `127.0.0.1:5432`). Если сборка падает — старый
контейнер продолжает работать. Изменение только env (без правки кода) достаточно
подхватить через `docker compose -f docker-compose.prod.yml up -d` без `--build`.
