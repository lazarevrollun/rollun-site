---
title: 'Story 7.4 — Ревалидация контента on-demand: afterChange-хуки семи Payload Globals вызывают revalidateTag по каноническому тегу, правка в /admin появляется на проде за секунды без пересборки'
type: 'feature'
created: '2026-07-06'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: '0eb7f6d8fd544daa5881cc55a58f65cc85754419'
final_revision: 'd85b872c3b553d5c438760ee185637214362def3'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** Семь Payload Globals (`SiteSettings` + шесть `<Page>Content`) уже отдают контент через закэшированные аксессоры (`'use cache'` + `cacheTag(<TAG>)`), но правка в `/admin` НЕ появляется на статически пререндеренных страницах — нет `afterChange`-хука, который сбросит соответствующий тег. Эпик 7 обещает «изменения на проде за секунды без пересборки» (NFR-5) — это последнее звено контура.

**Approach:** На каждый из семи Globals повесить `afterChange`-хук, вызывающий `revalidateTag(<канонический тег этого Global>)` (НЕ `revalidatePath`, AD-10). Хук — общая фабрика; тег берётся из единого источника правды. Ревалидация внутрипроцессная (AD-12): один рантайм Next.js держит и `/admin`, и сайт, поэтому хук зовёт `revalidateTag` напрямую — без HTTP-вебхука и секрета.

## Boundaries & Constraints

**Always:**
- **`revalidateTag`, не `revalidatePath` (AD-10).** Каждый из семи Globals получает `afterChange`-хук, ревалидирующий СВОЙ канонический тег (`site-settings`, `home-content`, `about-content`, `catalog-content`, `brands-content`, `shops-content`, `contact-content`).
- **Тег — единый источник правды.** Строка тега определяется в ОДНОМ месте и потребляется И `cacheTag(...)` в аксессоре, И `revalidateTag(...)` в хуке. Рассинхрон (переименовал в аксессоре, забыл в хуке → тихо сломанная ревалидация) исключён по построению.
- **Паспорт тегирует ВСЕ поверхности одним тегом.** `SiteSettings` имеет один канонический тег `site-settings`, читаемый ОДНИМ аксессором `getSiteSettings`, который питает каждую поверхность (footer, header, home/about CTA desktop+mobile, shops, contact). `revalidateTag('site-settings')` инвалидирует этот аксессор и транзитивно все зависящие роут-кэши → desktop и mobile обновляются вместе, дрейф свежести невозможен по построению (не разбивать на пер-поверхностные теги).
- **Внутрипроцессно (AD-12).** Хук вызывает `revalidateTag` прямо в рантайме Next — сетевого хопа/вебхука нет.
- **Гвард на не-request запись.** Хук пропускает ревалидацию, когда `req.context.disableRevalidate` установлен (программные сиды/тесты), чтобы не бросить «revalidateTag called outside a request scope».
- **Раскладка/конвенции 7.1/7.3.** Новый код в `src/lib/` и `src/hooks/`; глобалы правятся только добавлением поля `hooks`.

**Block If:**
- Payload 3.85 не даёт `afterChange`-хуку Global вызвать `next/cache` `revalidateTag` внутри одного рантайма (импорт `next/cache` в граф `payload.config` ломает `payload generate:types`/`migrate`, или вызов невозможен) — HALT, это фундамент контура.

**Never:**
- **Никакого `revalidatePath`, никакого пер-страничного ad-hoc кэша** (AD-10).
- **Никакого внешнего revalidate-роута/вебхука + секрета.** Внутрипроцессный `afterChange` (AD-12) делает его ненужным; env `revalidate-секрет` в этой истории не проводится.
- **Никакой миграции, изменения схемы или регена `payload-types.ts`.** Хуки — поведение, не данные: БД-таблицы и генерённые типы не меняются.
- **Не импортировать модули-аксессоры (`site-settings.ts`, `*-content.ts`) в конфиги глобалов.** Это даёт цикл (`payload.config → global → accessor → @/lib/payload → @payload-config`) И тянет `'use cache'`/`next/cache` под Payload-CLI, который не под Next-компилятором. Тег — только через чистый модуль-константы.
- **Не трогать разметку, билдеры `content/*`, `Media`/`MediaImage`, сами `cacheTag`-чтения аксессоров** (7.1–7.3) — только точка ревалидации.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Менеджер правит любой Global в `/admin` | сохранение документа | `afterChange` → `revalidateTag(<тег этого Global>)`; на след. запросе статическая страница перерисована — без пересборки/редеплоя | — |
| Правка паспорта `SiteSettings` | сохранение | `revalidateTag('site-settings')` → все поверхности (footer, header, home/about CTA desktop+mobile, shops, contact) освежаются вместе | один тег/один аксессор → нет desktop/mobile-дрейфа |
| Программная запись с `context.disableRevalidate` | сид/тест пишет Global | `revalidateTag` пропущен | гвард против throw вне request-scope |
| Payload CLI (`generate:types`/`migrate`) | граф конфига импортит `next/cache` | импорт резолвится; `afterChange` не срабатывает (документ не пишется хуком) | CLI остаётся зелёным |

</intent-contract>

## Code Map

- `src/lib/site-settings.ts` -- ОБРАЗЕЦ аксессора: `export const SITE_SETTINGS_TAG` + `cacheTag(SITE_SETTINGS_TAG)`. Тег переезжает в `cache-tags.ts`; аксессор его импортирует и ре-экспортирует (публичная поверхность сохранена).
- `src/lib/{home,about,catalog,brands,shops,contact}-content.ts` -- то же: канонический `<PAGE>_CONTENT_TAG` переезжает в `cache-tags.ts`, импорт+ре-экспорт. Поведение `'use cache'`+`cacheTag` не меняется.
- `src/lib/cache-tags.ts` -- НОВЫЙ, ЧИСТЫЙ модуль (без импортов, без `next/cache`, без `'use cache'`): семь строковых констант тегов — единый источник правды. Безопасен для импорта из графа `payload.config` и из Next-рантайма.
- `src/hooks/revalidate-global.ts` -- НОВЫЙ. Фабрика `revalidateGlobal(tag): GlobalAfterChangeHook`, гардит на `context.disableRevalidate`, зовёт `revalidateTag(tag)`, возвращает `doc`. Единственная точка импорта `next/cache` `revalidateTag`.
- `src/globals/{SiteSettings,HomeContent,AboutContent,CatalogContent,BrandsContent,ShopsContent,ContactContent}.ts` -- добавить `hooks: { afterChange: [revalidateGlobal(<TAG>)] }`; импорт тега из `../lib/cache-tags` и фабрики из `../hooks/revalidate-global`. Поля/slug/`defaultValue` не трогаются.
- `payload.config.ts` -- без правок (глобалы уже зарегистрированы); проверить, что граф конфига остаётся CLI-безопасным.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/cache-tags.ts` -- Создать чистый модуль с семью `export const`: `SITE_SETTINGS_TAG='site-settings'`, `HOME_CONTENT_TAG='home-content'`, `ABOUT_CONTENT_TAG='about-content'`, `CATALOG_CONTENT_TAG='catalog-content'`, `BRANDS_CONTENT_TAG='brands-content'`, `SHOPS_CONTENT_TAG='shops-content'`, `CONTACT_CONTENT_TAG='contact-content'`. Значения = точные текущие строки из аксессоров. Никаких импортов.
- [x] `src/lib/site-settings.ts` + `src/lib/{home,about,catalog,brands,shops,contact}-content.ts` -- В каждом заменить локальный `export const <TAG>='...'` на импорт из `@/lib/cache-tags` и ре-экспорт того же имени (`export { <TAG> }`), сохранив публичную поверхность и использование в `cacheTag(<TAG>)`. Поведение аксессора неизменно.
- [x] `src/hooks/revalidate-global.ts` -- Фабрика: `export const revalidateGlobal = (tag: string): GlobalAfterChangeHook => ({ doc, req: { payload, context } }) => { if (!context?.disableRevalidate) { payload.logger.info(\`revalidate tag "${tag}"\`); revalidateTag(tag) } return doc }`. Импорт `revalidateTag` из `next/cache`, тип `GlobalAfterChangeHook` из `payload`.
- [x] `src/globals/SiteSettings.ts` -- Добавить `hooks: { afterChange: [revalidateGlobal(SITE_SETTINGS_TAG)] }` (импорт тега из `../lib/cache-tags`, фабрики из `../hooks/revalidate-global`). Ничего кроме `hooks` не менять.
- [x] `src/globals/{HomeContent,AboutContent,CatalogContent,BrandsContent,ShopsContent,ContactContent}.ts` -- То же: `afterChange:[revalidateGlobal(<PAGE>_CONTENT_TAG)]` с соответствующим тегом каждой страницы.
- [x] Греп-проверка edge-матрицы -- подтвердить: (а) все семь глобалов имеют `afterChange:[revalidateGlobal(<TAG>)]` с правильным тегом; (б) ни один аксессор не импортирует другого значения тега, кроме `cache-tags.ts`; (в) нет новых файлов под `src/migrations/`; (г) `src/payload-types.ts` не изменён.

**Acceptance Criteria:**
- Given правка любого из семи Globals в `/admin`, when срабатывает `afterChange`, then вызывается `revalidateTag(<канонический тег этого Global>)` (не `revalidatePath`), и статическая страница освежается на следующем запросе без пересборки (NFR-5/AD-10).
- Given правка `SiteSettings`, then `revalidateTag('site-settings')` освежает ВСЕ поверхности сразу (desktop+mobile), потому что один тег читается одним аксессором, питающим каждую поверхность — дрейф desktop/mobile невозможен.
- Given `npm run generate:types`, then команда зелёная и `src/payload-types.ts` НЕ меняется (хуки схему не трогают), доказывая, что импорт `next/cache` в графе конфига CLI-безопасен.
- Given `npm run build` под `cacheComponents:true`, then сборка успешна, все шесть публичных страниц остаются `○ (Static)`, новой миграции нет, `SiteSettings`/`Media`/hero не затронуты.

## Spec Change Log

<!-- Append-only. Populated by step-04 during review loops. -->

## Review Triage Log

<!-- Append-only. Populated by step-04 on EVERY review pass. -->

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 0, low 1)
- defer: 1
- reject: 15
- addressed_findings:
  - `[low]` `[patch]` Уточнён комментарий у `revalidateTag(tag, 'max')` в `src/hooks/revalidate-global.ts`: `'max'` — это НЕ блокирующий purge, а stale-while-revalidate (Next-рекомендованный профиль помечает все записи с тегом устаревшими сразу, свежий контент регенерируется на следующем визите, across all pages). Прежняя формулировка «on-demand purge» вводила будущего мейнтейнера в заблуждение о семантике read-your-writes. Верифицировано по исходнику и докам Next 16.2.10.

<!-- Отклонено/отложено (кратко для аудита):
  DEFER (1): Media-коллекция без afterChange-хука — правка существующего Media-дока in-place не ревалидирует страницы, тянущие его через image-слот Global (About ceoPhoto, depth:2). Записано в deferred-work.md. Вне scope 7.4 (spec Never: «не трогать Media»; AD-10 — по Globals). Основной сценарий смены картинки (загрузить новый Media + назначить в слот) ревалидируется хуком Global.
  REJECT (15): (1) `'max'` неверен/не немедленный — ВЕРИФИЦИРОВАНО корректным и Next-рекомендованным (SWR по докам 16.2.10); (2) комментарий «single-arg deprecated» неверен — на деле ВЕРЕН, Next сам печатает "is now deprecated"; (3) паспорт-тег не доходит до page-тегов — ФАКТИЧЕСКИ НЕВЕРНО: `revalidateTag` инвалидирует across all pages using the tag (доки Next), транзитивно; (4) тег без аксессора — все 7 аксессоров вызывают `cacheTag` (проверено); (5) drafts/autosave триггерят хук — версионирование на глобалах не включено (проверено); (6) нет тестов — в проекте нет тест-фреймворка (как во всех прошлых историях); (7) неймспейсинг тегов — теги канонические из 7.1/7.3, ренейм вне scope, коллизий нет; (8) грубый один тег паспорта — by design (AD-10, spec Always); (9) no-op saves ревалидируют — ничтожно, под SWR тем более; (10) try/catch отсутствует — официальный Payload+Next паттерн его не оборачивает, а для ещё не проверенной вживую интеграции громкий сбой на первом реальном admin-save безопаснее тихого проглатывания; `disableRevalidate` уже гардит программные записи; (11) `disableRevalidate` — «мёртвый гард» — стандартный защитный Payload-паттерн; (12) req может быть undefined — Payload всегда передаёт req в global afterChange; (13) ре-экспорт = два пути импорта — намеренная обратная совместимость с 7.3, внешних потребителей тега нет; (14) info-лог на каждый save — соответствует Payload-шаблону, уместно для admin-действия; (15) «6 страниц Static» голословно — билд реально прогнан зелёным, payload-types без диффа. -->

## Design Notes

- **Почему `cache-tags.ts` (чистый модуль), а не импорт тега из аксессора.** Аксессор `site-settings.ts` импортит `@/lib/payload` (→ `@payload-config` → `payload.config.ts`), поэтому импорт аксессора в конфиг глобала замыкает цикл `payload.config → global → accessor → @/lib/payload → @payload-config`. Плюс аксессоры несут `'use cache'` и `next/cache`, которые Payload-CLI (`generate:types`/`migrate`, вне Next-компилятора) не переваривает. Чистый модуль-константы разрывает оба: он импортируется и глобалами (для тега), и аксессорами (вместо локального `const`), оставаясь единым источником правды строки тега.
- **Почему один тег паспорта покрывает «все поверхности».** AC требует, чтобы desktop и mobile паспорта не разошлись в свежести. Это обеспечено структурно: `getSiteSettings` — единственный аксессор, его результат тегирован `site-settings`, и КАЖДАЯ поверхность (footer/header/CTA desktop+mobile/shops/contact) читает именно его. `revalidateTag('site-settings')` инвалидирует аксессор и транзитивно все роут-кэши → обе поверхности перерисовываются вместе. Пер-поверхностные теги не нужны и были бы регрессом.
- **`next/cache` в графе Payload-конфига — установленный паттерн.** Официальный website-шаблон Payload импортит `revalidateTag`/`revalidatePath` из `next/cache` прямо в хуках коллекций и держит `generate:types` зелёным: сам импорт безопасен, а `revalidateTag` вызывается только внутри `afterChange` на реальной admin-записи (в Next-рантайме). CLI-команды документ через хук не пишут → вызова нет.
- **Гвард `context.disableRevalidate`** — стандартный Payload-паттерн: программные записи (сид/тест) ставят флаг и не роняют «outside a request scope». На обычной admin-правке флага нет → ревалидация идёт.
- **Golden — фабрика хука:**
  ```ts
  // src/hooks/revalidate-global.ts
  import { revalidateTag } from 'next/cache'
  import type { GlobalAfterChangeHook } from 'payload'
  export const revalidateGlobal =
    (tag: string): GlobalAfterChangeHook =>
    ({ doc, req: { payload, context } }) => {
      if (!context?.disableRevalidate) {
        payload.logger.info(`revalidate tag "${tag}"`)
        revalidateTag(tag)
      }
      return doc
    }
  ```

## Verification

**Commands:**
- `docker compose up -d postgres` -- expected: postgres healthy (нужен для build/generate).
- `npm run generate:types` -- expected: команда зелёная; `git diff src/payload-types.ts` пуст (хуки типы не меняют) — доказывает CLI-безопасность импорта `next/cache`.
- `npx tsc --noEmit` -- expected: 0 ошибок (`GlobalAfterChangeHook` типизирован, теги совместимы).
- `npm run lint` -- expected: чисто.
- `npm run build` -- expected: успешно под `cacheComponents:true`; все шесть страниц (`/`,`/about`,`/catalog`,`/shops`,`/brands`,`/contact`) остаются `○ (Static)`; новой миграции нет.
- `grep -rn "afterChange" src/globals/` -- expected: семь глобалов, каждый `afterChange:[revalidateGlobal(<TAG>)]` с правильным тегом.
- `ls src/migrations/` -- expected: без новых файлов относительно 7.3.

**Manual checks:**
- Запущенный процесс + БД: в `/admin` изменить 🟡 текст-слот Home → в течение секунд `/` показывает новое значение без пересборки (полноценно проверяемо только на живом рантайме; в unattended-прогоне без браузера — по построению и логам `payload.logger`).
- Правка телефона в `SiteSettings` → footer, header и CTA (desktop и mobile) обновляются одновременно.

## Auto Run Result

Status: done

**Реализовано:** контур on-demand ревалидации замкнут для всех семи Payload Globals (`SiteSettings` + `Home/About/Catalog/Brands/Shops/ContactContent`). На каждый глобал повешен `afterChange`-хук `revalidateGlobal(<канонический тег>)`, вызывающий `revalidateTag` по каноническому тегу глобала (НЕ `revalidatePath`, AD-10). Ревалидация внутрипроцессная (AD-12): один рантайм Next держит `/admin` и сайт, хук зовёт `revalidateTag` напрямую — без вебхука/секрета. Паспорт (`SiteSettings`) тегируется одним `site-settings`, читаемым единственным аксессором `getSiteSettings`, который питает все поверхности (footer/header/CTA desktop+mobile/shops/contact) → `revalidateTag('site-settings')` инвалидирует их вместе (транзитивно across all pages using the tag — подтверждено докой Next 16.2.10), дрейф desktop/mobile невозможен по построению.

**Ключевое решение (единый источник правды тега).** Импортировать тег из аксессора в конфиг глобала нельзя — это замыкает цикл `payload.config → global → accessor → @/lib/payload → @payload-config` И тянет `'use cache'`/`next/cache` под Payload-CLI (вне Next-компилятора). Введён чистый модуль-константы `src/lib/cache-tags.ts` (без импортов): его потребляют И `cacheTag(...)` в аксессорах, И `revalidateTag(...)` в хуках. Аксессоры ре-экспортируют свои теги (обратная совместимость с 7.3). Хуки — только `src/hooks/revalidate-global.ts` (единственная точка импорта `next/cache` `revalidateTag`), с гардом `req.context.disableRevalidate` для программных записей.

**Изменённые/новые файлы:**
- `src/lib/cache-tags.ts` (новый) — 7 канонических тег-констант, единый источник правды, CLI-безопасен.
- `src/hooks/revalidate-global.ts` (новый) — фабрика `revalidateGlobal(tag): GlobalAfterChangeHook`, гард + `revalidateTag(tag, 'max')`.
- `src/globals/{SiteSettings,HomeContent,AboutContent,CatalogContent,BrandsContent,ShopsContent,ContactContent}.ts` — добавлен `hooks.afterChange:[revalidateGlobal(<TAG>)]`; поля/slug/`defaultValue` не тронуты.
- `src/lib/{site-settings,home,about,catalog,brands,shops,contact}-content.ts` — тег переехал в `cache-tags.ts`, импорт+ре-экспорт; `'use cache'`+`cacheTag`-тело не изменено.

**Отклонение от spec (вынужденное окружением):** golden-сниппет спеки показывал single-arg `revalidateTag(tag)`; в установленном Next 16.2.10 второй аргумент-профиль ОБЯЗАТЕЛЕН (single-arg — type error + runtime-deprecated). Реализация использует `revalidateTag(tag, 'max')` — Next-рекомендованное значение (stale-while-revalidate: помечает записи с тегом устаревшими сразу, свежий контент регенерируется на следующем визите across all pages). Инвариант спеки (`revalidateTag` не `revalidatePath`, по каноническому тегу, внутрипроцессно, один тег паспорта) сохранён. Верифицировано по исходнику и докам Next.

**Ревью (1 проход):** intent_gap 0, bad_spec 0, patch 1 (low), defer 1, reject 15. Исправлено: (low patch) уточнён комментарий про семантику `'max'` (SWR, не блокирующий purge). Отложено (defer, → deferred-work.md): Media-коллекция без afterChange — правка Media-дока in-place не ревалидирует страницы, тянущие его через image-слот Global; вне scope 7.4 (spec Never: не трогать Media). Отклонено 15 (детали в Review Triage Log; ключевые: `'max'` верифицирован корректным/рекомендованным; транзитивность паспорт-тега подтверждена докой; версионирования на глобалах нет; try/catch намеренно не добавлен — громкий сбой на первом реальном save безопаснее тихого проглатывания непроверенной вживую интеграции).

**Верификация:** `docker compose up -d postgres` healthy; `generate:types` зелёный, `git diff src/payload-types.ts` ПУСТ (хуки схему/типы не меняют → импорт `next/cache` в графе конфига CLI-безопасен); `tsc --noEmit` 0 ошибок; `lint` чисто; `build` успешен под `cacheComponents:true`, все шесть публичных страниц `○ (Static)`, новой миграции нет; `grep afterChange src/globals/` — 7 глобалов с правильным пер-страничным тегом; `ls src/migrations/` — без новых файлов. Пост-патч (комментарий) `tsc`/`lint` — зелёные.

**Остаточные риски:** (1) живой admin-save путь (реальная правка в `/admin` → страница освежается за секунды) НЕ проверен вживую в unattended-прогоне без браузера — гарантирован по построению (проводка `afterChange`→`revalidateTag('...', 'max')` + существующие `cacheTag`-чтения) и логами `payload.logger.info`; рекомендуется быстрый ручной спот-чек при следующем заходе. (2) `'max'` = stale-while-revalidate: редактор на ПЕРВОМ визите после правки может увидеть устаревший контент (свежий регенерируется в фоне), на следующем — свежий; для контент-сайта приемлемо (Next прямо рекомендует SWR для каталогов/страниц), строгий read-your-writes через `updateTag` недоступен из Payload-хука (только Server Action). (3) Media in-place edits — см. defer.
