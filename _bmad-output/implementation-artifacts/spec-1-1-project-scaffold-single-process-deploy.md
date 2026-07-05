---
title: 'Story 1.1: Скаффолд проекта и один процесс деплоя'
type: 'feature'
created: '2026-07-05'
status: 'in-review'
baseline_revision: '6af323b684e7ba49c2a0da40baae6df69b31d0f2'
review_loop_iteration: 0
followup_review_recommended: true
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** Репозиторий greenfield — приложения нет вовсе. Всем последующим историям (DS, оболочка, страницы, форма, CMS) нужен единый детерминированный фундамент: один процесс Next.js 16 + Payload 3.x, seed-дерево каталогов, 6 роут-заглушек и env-контур.

**Approach:** Заскаффолдить один рантайм Next.js 16 (App Router, Turbopack, Cache Components, Node 20+), который в одном процессе отдаёт публичный сайт, Payload-админку на `/admin` и Payload local API (Postgres-адаптер); разложить seed-дерево из spine, создать 6 RSC-заглушек роутов, вынести секреты в env (UPPER_SNAKE), упаковать в Docker + docker-compose с Postgres, собираемый и стартующий локально.

## Boundaries & Constraints

**Always:**
- Приложение живёт в корне репозитория (`package.json`, `next.config.ts`, `payload.config.ts` в корне; исходники под `src/`). Один процесс обслуживает сайт + `/admin` + local API (AD-12).
- Структура каталогов точно соответствует seed-дереву spine (`src/app/(site)/*`, `src/app/(payload)/*`, `src/components/{shell,islands,contact-form}`, `src/content/`, `src/globals/`, `src/collections/`, `src/lib/`, `src/styles/`).
- Секреты и адреса — только из env, UPPER_SNAKE, не захардкожены: `CRM_API_URL`, `DATABASE_URI`, `PAYLOAD_SECRET`, `REVALIDATION_SECRET`.
- `.gitignore` дополняется (`node_modules/`, `.next/`, build-артефакты) ДО первого `npm install`, чтобы auto-commit hook не закоммитил зависимости.
- Версии — последний стабильный релиз в рамках мажоров: Next 16.2.x, React 19.x, TypeScript 5.x, Tailwind CSS 4.x, Payload CMS latest-stable 3.x (НЕ 4.0), Postgres-адаптер (`@payloadcms/db-postgres`).
- Островки — `'use client'` в `components/islands/` с суффиксом `.client.tsx`; контент читается на сервере через `getPayload` (`src/lib/payload.ts`).

**Block If:**
- Latest-stable Next 16 / React 19 / Payload 3.x / Tailwind 4 оказываются взаимно несовместимы так, что рабочий одно-процессный скаффолд собрать нельзя без выбора иной архитектуры/мажора.
- Требуется реальный адрес/секрет CRM, домен, TLS/reverse-proxy или конкретное staging-окружение инфры Rollun (владелец-отсрочка «Деплой-конвейер») — их отсутствие блокирует прод, но НЕ локальный скаффолд; блокировать только если что-то из этого реально мешает локальной сборке/старту.

**Never:**
- Не тянуть прототип-скаффолдинг из `rollun_handoff` (react/@babel/standalone/unpkg CDN, `tweaks-panel.jsx`) в билд (AD-11).
- Не строить реальные фичи: ни DS-токенов (Story 1.2), ни Header/Footer/мобильного шасси (1.3–1.5), ни контента страниц, ни рабочей формы/CRM-вызова, ни CMS-коллекций сверх минимума для загрузки Payload.
- Не разворачивать прод-деплой-конвейер (staging/preview на инфре Rollun, TLS, reverse-proxy) — отсрочено владельцу; scope 1.1 = локальная сборка+старт контейнера.
- Не подключать orphaned `_ds/…/colors_and_type.css`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Публичный роут | `GET /` (и `/about`,`/catalog`,`/brands`,`/shops`,`/contact`) | 200, RSC-заглушка страницы | — |
| Payload-админка | `GET /admin` | 200 (экран входа/создания первого пользователя) в том же процессе | — |
| Local API-хелпер | RSC вызывает `getPayload()` | Возвращает инициализированный Payload-инстанс (Postgres) | — |
| Нет `PAYLOAD_SECRET` | старт без env | Процесс падает на старте с внятной ошибкой конфигурации | Fail-fast, не молча |
| Нет `DATABASE_URI` | старт без env | Процесс не поднимается, понятная ошибка подключения к БД | Fail-fast |
| Docker-старт | `docker compose up` с заданными env + Postgres | Контейнер собирается и стартует; сайт и `/admin` отвечают | — |

</intent-contract>

## Code Map

- `package.json` -- корень; зависимости (next, react, react-dom, payload, @payloadcms/next, @payloadcms/db-postgres, @payloadcms/richtext-lexical, tailwindcss v4, typescript), скрипты `dev/build/start/generate:types/lint`, `engines.node >=20`.
- `next.config.ts` -- Next 16 конфиг: `cacheComponents: true`, Turbopack, `output: 'standalone'`, обёртка `withPayload`.
- `payload.config.ts` -- корень; Postgres-адаптер (`DATABASE_URI`), `secret: PAYLOAD_SECRET`, admin, Lexical, `typescript.outputFile`, минимальная коллекция `Users`.
- `tsconfig.json` -- strict, TS5, path-alias `@/*` → `src/*`.
- `src/app/(site)/layout.tsx` -- корневая оболочка `html/body`, импорт глобального CSS; рендерит `children` (шапка/футер — Story 1.3/1.4).
- `src/app/(site)/page.tsx` + `about|catalog|brands|shops|contact/page.tsx` -- 6 RSC-заглушек.
- `src/app/(payload)/` -- сгенерённые Payload-Next файлы (`admin/[[...segments]]`, `api/[...slug]`, `layout.tsx`) — админка + REST/GraphQL в том же рантайме.
- `src/lib/payload.ts` -- `getPayload` (local API), memoized.
- `src/collections/Users.ts` -- минимальная auth-коллекция (чтобы Payload грузился и `/admin` работал).
- `src/styles/theme.css` -- скелет `@theme {}` (Tailwind v4) + импорт `tailwindcss`; токены наполняет Story 1.2.
- `src/{components/{shell,islands,contact-form},content,globals}/` -- пустые seed-каталоги (`.gitkeep`), наполняются в своих историях.
- `Dockerfile`, `.dockerignore`, `docker-compose.yml` -- один Node 20+ процесс (standalone) + Postgres-сервис для локального build/start.
- `.env.example` -- все env-переменные с плейсхолдерами.
- `.gitignore` -- дополнить `node_modules/`, `.next/`, `*.tsbuildinfo` и т.п.

## Tasks & Acceptance

**Execution:**
- [x] `.gitignore` -- добавить `node_modules/`, `.next/`, build-артефакты ДО установки зависимостей -- чтобы auto-commit hook не тянул node_modules.
- [x] `package.json` + `tsconfig.json` -- объявить стек (latest-stable в мажорах §Always), скрипты, `engines.node`, alias `@/*`; `npm install` -- фундамент сборки.
- [x] `payload.config.ts` + `src/lib/payload.ts` + `src/collections/Users.ts` -- Payload на Postgres, секрет/URI из env, минимальный `Users`, `getPayload`-хелпер, `outputFile` для типов -- рабочий local API + `/admin`.
- [x] `next.config.ts` + Tailwind v4 wiring (`postcss.config.*`, `src/styles/theme.css` скелет) -- Next 16 (cacheComponents, Turbopack, standalone) + `withPayload` + CSS-конвейер (без токенов).
- [x] `src/app/(site)/layout.tsx` + 6 `page.tsx` заглушек + `src/app/(payload)/*` -- 6 публичных RSC-роутов + админка/API в одном процессе.
- [x] seed-каталоги `src/components/{shell,islands,contact-form}`, `src/content/`, `src/globals/` (+ `.gitkeep`) -- дерево соответствует spine.
- [x] `Dockerfile` + `.dockerignore` + `docker-compose.yml` + `.env.example` -- упаковка в один процесс + Postgres, локальная сборка/старт с env.

**Acceptance Criteria:**
- Дано чистый репозиторий, когда выполнен скаффолд и запущено приложение, тогда один процесс Next.js 16 (App Router, Turbopack, Cache Components, Node 20+) отдаёт публичный сайт, `/admin` (Payload) и local API (Postgres) в одном рантайме (AD-12).
- Дано seed-дерево spine, когда осмотрена структура, тогда присутствуют все каталоги (`src/app/(site)/*`, `src/app/(payload)/*`, `components/{shell,islands,contact-form}`, `content/`, `globals/`, `collections/`, `lib/`, `styles/`).
- Дано окружение, когда читаются секреты, тогда `CRM_API_URL`, `DATABASE_URI`, `PAYLOAD_SECRET`, `REVALIDATION_SECRET` берутся из env (UPPER_SNAKE) и нигде не захардкожены; `.env.example` их документирует.
- Дано приложение, когда открыты `/`, `/about`, `/catalog`, `/brands`, `/shops`, `/contact`, тогда все 6 отвечают 200 как RSC-заглушки; прототип-скаффолдинг (react/@babel/unpkg, tweaks-panel) в билд не попадает (AD-11).
- Дано env и Postgres, когда `docker compose build` и `docker compose up`, тогда контейнер собирается и стартует локально, сайт и `/admin` отвечают.

## Spec Change Log

_Пусто — bad_spec-петель не было._

## Review Triage Log

### 2026-07-05 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 4: (high 1, medium 1, low 2)
- defer: 0
- reject: 9: (high 0, medium 1, low 8)
- addressed_findings:
  - `[high]` `[patch]` Контейнер в `NODE_ENV=production` не создавал схему БД (Postgres-адаптер не пушит в prod, миграций не было) → `/admin` отдавал 200-оболочку, но создание первого пользователя падало HTTP 500. Подтверждено прямым тестом (БД без таблиц + `first-register` 500). Исправлено: `migrationDir` + начальная миграция `src/migrations/*_initial`, стадия `migrator` в Dockerfile и one-shot `migrate`-сервис в compose (`app` зависит через `service_completed_successfully`). Ре-верифицировано чистым циклом: миграция exit 0, таблицы `users`/`users_sessions` есть, `POST /api/users/first-register` → 200, строка сохранена.
  - `[medium]` `[patch]` `secret`/`connectionString` через `|| ''` маскировали отсутствие env. Исправлено: fail-fast `throw` при пустых `PAYLOAD_SECRET`/`DATABASE_URI` до `buildConfig`.
  - `[low]` `[patch]` Вводящий в заблуждение комментарий Dockerfile про «нужен доступный Postgres на build» — сборка БД не касается (проверено билдом при недоступном URI). Комментарий переписан.
  - `[low]` `[patch]` `engines.node` `">=20"` → `">=20.9.0"` (реальный флор Next 16).
- rejected (шум / вне scope):
  - `[low]` Ложные срабатывания Edge-ревьюера: якобы отсутствуют `public/`, `package-lock.json`, `importMap.js` — все три на месте (кросс-проверено).
  - `[medium]` Дефолт-секреты в compose при `NODE_ENV=production` — заведомо ЛОКАЛЬНЫЙ артефакт (прод-конвейер отсрочен владельцу, §Never); fail-fast отсекает пустой секрет. Отмечено как остаточный риск.
  - `[low]` `cacheComponents` как «мина» для будущих стори; секрет в build-слое; `.gitignore` не исключает `rollun_handoff`/`_bmad` (pre-existing, `.dockerignore` их исключает из образа); мнимый дубль `.gitignore` (артефакт review-бандла).

## Design Notes

- **Размещение в корне.** Seed-дерево spine помечено `rollun-site/` как имя проекта, а не вложенную папку; репозиторий и есть rollun-site, поэтому `package.json`/конфиги — в корне, исходники под `src/`. Соседние `rollun_handoff/`, `_bmad*`, `.claude/` остаются нетронутыми.
- **Минимальный Payload.** Для загрузки Payload и работы `/admin` достаточно db-адаптера, секрета и одной auth-коллекции `Users`. Остальные коллекции/глобалы (`Products`, `Brands`, `SiteSettings`, `<Page>Content` …) — в своих историях; сейчас только каталоги-заготовки, чтобы не раздувать scope.
- **Границы с 1.2.** `theme.css` — пустой скелет `@theme {}` + подключённый Tailwind v4-конвейер; сами токены (палитра, типошкала, шрифты `next/font`) наполняет Story 1.2. `layout.tsx` пока без Header/Footer.
- **Payload-Next файлы.** `src/app/(payload)/*` — стандартная интеграция `@payloadcms/next` (route-группа `(payload)`, `admin/[[...segments]]`, `api/[...slug]`); допустимо сгенерировать через `create-payload-app`/шаблон и переименовать `(frontend)`→`(site)`.
- **Docker.** `output: 'standalone'` в next.config → тонкий рантайм-образ Node 20+; `docker-compose.yml` поднимает app + Postgres и прокидывает env для локального build/start (прод-конвейер отсрочен владельцу).

## Verification

**Commands:**
- `npm install` -- expected: успешная установка без нерешаемых peer-конфликтов.
- `npx tsc --noEmit` -- expected: типы проходят (включая сгенерённый Payload-тип).
- `npm run build` -- expected: `next build` (+ Payload) собирается без ошибок.
- `npm run lint` -- expected: линт проходит.
- `docker compose build && docker compose up -d` -- expected: контейнер + Postgres поднимаются; затем `curl -sf localhost:3000/ ` и остальные 5 роутов → 200, `curl -sI localhost:3000/admin` → 200/redirect на логин. Завершить `docker compose down`.

**Manual checks (if no CLI):**
- Осмотреть дерево: все seed-каталоги на месте; в билд-выводе/исходниках нет unpkg/@babel/tweaks-panel артефактов из `rollun_handoff`.
- Функциональная проверка админки в контейнере: после `docker compose up` таблицы `users`/`users_sessions` существуют и `POST /api/users/first-register` → 200 (не только 200-оболочка `/admin`).

## Auto Run Result

Status: done

### Что реализовано
Greenfield-скаффолд «один процесс Next.js 16 + Payload 3.x»: App Router (route-группы `(site)`/`(payload)`), Turbopack, Cache Components (`cacheComponents`), `output: 'standalone'`, `withPayload`. Payload на Postgres-адаптере с local API (`getPayload`), админка `/admin` и REST/GraphQL в том же рантайме (AD-12). 6 публичных RSC-заглушек (`/`,`/about`,`/catalog`,`/brands`,`/shops`,`/contact`). Seed-дерево spine разложено полностью. Секреты — из env (UPPER_SNAKE) с fail-fast. Упаковано в Docker (multi-stage standalone) + docker-compose (Postgres + one-shot миграции), собирается и стартует локально. Прод-деплой-конвейер осознанно отсрочен владельцу.

### Изменённые файлы (ключевые)
- `package.json`, `tsconfig.json` — стек (Next 16.2.10, React 19.2, Payload 3.85.2, Tailwind 4.3.2, TS 5.9.3), скрипты (`dev/build/start/lint/generate:types/migrate`), `engines.node >=20.9.0`, alias `@/*`, `@payload-config`.
- `next.config.ts` — `cacheComponents` + `standalone` + `withPayload`.
- `payload.config.ts` — Postgres-адаптер, fail-fast по env, `migrationDir`, Lexical, `outputFile`, минимальный `Users`.
- `src/lib/payload.ts` — memoized `getPayload` (local API).
- `src/collections/Users.ts` — минимальная auth-коллекция.
- `src/app/(site)/{layout,page + 5 pages}.tsx` — оболочка (html/body, импорт `theme.css`) + 6 заглушек.
- `src/app/(payload)/*` — интеграция `@payloadcms/next` (admin + api).
- `src/styles/theme.css` — пустой `@theme{}` скелет (токены — Story 1.2).
- `src/migrations/*_initial.{ts,json}` + `index.ts` — начальная миграция схемы (users, users_sessions).
- `Dockerfile` (стадии deps/builder/migrator/runner), `.dockerignore`, `docker-compose.yml` (postgres + migrate + app), `.env.example`, `.gitignore` (node_modules/.next до install), `postcss.config.mjs`, `eslint.config.mjs`.

### Ревью
- **Патчей применено: 4** — [high] схема БД в prod-контейнере через миграции (main fix), [medium] fail-fast по env, [low] комментарий Dockerfile, [low] `engines.node`.
- **Отложено: 0. Отклонено: 9** (в т.ч. 3 ложных срабатывания об «отсутствующих» файлах; см. Review Triage Log).

### Верификация (проведена лично, не только сабагентом)
- `npx tsc --noEmit` → PASS; `npm run build` → PASS; `npm run lint` → PASS.
- `docker compose build` → OK; `docker compose up -d` → миграция exit 0, app healthy.
- `\dt` → таблицы `users`, `users_sessions` присутствуют.
- 6 роутов → 200; `/admin` → 200; `POST /api/users/first-register` → **200**, строка `admin@example.com` сохранена в БД. `docker compose down -v` → чисто.
- node_modules/.next не в git; `src/migrations/` в git как исходники.

### Остаточные риски
- `docker-compose.yml` — ЛОКАЛЬНЫЙ артефакт с дефолт-секретами при `NODE_ENV=production`; при построении прод-деплоя (отсрочено владельцу) секреты/URI обязаны приходить извне (fail-fast отсекает пустые, но не placeholder). Не тащить этот compose в прод как есть.
- `cacheComponents: true` потребует от будущих стори оборачивать динамику в Suspense/`use cache` — учтено на уровне паттерна, сегодня сборка чистая.
- Контракт CRM (`CRM_API_URL`), домен/TLS/staging под SM-1 — отсрочены владельцу (см. `<intent-contract>` Block If).
