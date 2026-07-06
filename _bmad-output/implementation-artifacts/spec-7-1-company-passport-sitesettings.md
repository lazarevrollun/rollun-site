---
title: 'Story 7.1 — Паспорт компании: SiteSettings (единственный дом паспорт-атомов)'
type: 'feature'
created: '2026-07-06'
status: 'done'
baseline_revision: 'a032e999202324e6c58a05190e4665f394b98a4b'
final_revision: '1c0cca3ac2fe275656d59bc6f60334d07081c6b2'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** Паспорт-атомы (телефоны, email, адреса, соц-ссылки, часы) сейчас захардкожены и продублированы по нескольким `src/content/*` модулям и inline в компонентах (напр. соц-ссылки в Home/About CTA). У одного и того же атома несколько владельцев — правка требует разработчика и правки в N мест, что нарушает FR-12/AD-14.

**Approach:** Ввести Payload-глобал `SiteSettings` как ЕДИНСТВЕННЫЙ дом каждого паспорт-атома. Все текущие потребители переключаются на чтение из `SiteSettings` через один серверный аксессор (`getSiteSettings`, обёрнутый в `use cache` + `cacheTag`), при этом презентационная обёртка (лейблы, проза, микрокопия, вёрстка) остаётся в коде (AD-6). Разметка/DOM/пиксель не меняются — меняется только источник значений (AD-7). Значения полей задаются через `defaultValue`, равные текущим литералам, поэтому первый рендер (до любой правки в админке) пиксель-идентичен.

## Boundaries & Constraints

**Always:**
- Каждый паспорт-атом имеет РОВНО ОДИН дом в `SiteSettings`; ни один потребитель не хранит второй копии значения (AD-14). Презентационные лейблы/проза остаются в коде.
- Значение любого поля `SiteSettings` задаётся `defaultValue`, ДОСЛОВНО равным текущему литералу из кода — первый рендер до правок в админке обязан быть пиксель-идентичным.
- Чтение `SiteSettings` — только на серверном (RSC/build) слое через `getSiteSettings()`; клиентские островки получают уже готовые значения ТОЛЬКО через props (никакой client-side fetch, AD-12).
- `getSiteSettings()` обёрнут в `'use cache'` + `cacheTag(SITE_SETTINGS_TAG)`, иначе под `cacheComponents: true` страницы не смогут остаться статическими (и 7.4 не сможет ревалидировать).
- Осознанные расхождения между поверхностями сохраняются как РАЗНЫЕ именованные атомы/значения, а НЕ сводятся к одному (AD-13/AD-14): `emails.footer` (`info@…`) ≠ `emails.contact` (`llc@…`); `hours.homeCtaDesktop` (`11:00…UTC`) ≠ `hours.homeCtaMobile` ≠ `hours.aboutCtaDesktop` (`…UTC +2` c пробелом) ≠ `hours.aboutCtaMobile` (`…UTC+2` без пробела) ≠ `hours.contact`.
- Каждая композиция строки-адреса у каждого потребителя обязана воспроизводить ДОСЛОВНО текущий вывод (см. таблицу в Acceptance) из структурированных полей адреса.

**Block If:**
- Не удаётся поднять локальный Postgres (`docker compose up -d postgres`) и/или прогнать `payload migrate` — тогда `next build` не верифицируем. HALT: `cannot bring up postgres / run migrations`.
- Обнаружен паспорт-атом, чей текущий литерал НЕВОЗМОЖНО воспроизвести дословно из выбранной гранулярности полей `SiteSettings`. HALT: `atom string not reproducible`.

**Never:**
- НЕ трогать разметку/DOM/CSS/классы/пиксель. НЕ править ⚫-контент: прозу, лейблы, микрокопию, blurbs (`COMPANY_BLURB`/`COMPANY_INTRO`/`blurb`), legal-ссылки, `map.initialSrc` (включая typo `53%2F27`), спейсинг-квирки (`cityDk` без пробела / `cityMb` с пробелом; `UTC +2` vs `UTC+2`).
- НЕ примирять осознанные расхождения (разные email/часы/лейблы) — сохранить как есть.
- НЕ реализовывать Story 7.2 (Media), 7.3 (Page Globals — перенос прозы/заголовков/изображений страниц), 7.4 (`afterChange`-хук `revalidateTag`). В 7.1 — только паспорт-атомы и read-side тег.
- НЕ добавлять тест-фреймворк (в проекте нет тестового раннера — это его конвенция); паритет проверяется таблицей + build/typecheck/lint + ревью.
- НЕ вводить page-builder / абстрактную модель `Page`; НЕ трогать роли/матрицу прав (Epic 8).

</intent-contract>

## Code Map

- `payload.config.ts` -- зарегистрировать `SiteSettings` в `globals: []`.
- `src/globals/SiteSettings.ts` -- НОВЫЙ. `GlobalConfig` со всеми паспорт-полями и `defaultValue`.
- `src/lib/site-settings.ts` -- НОВЫЙ. `SITE_SETTINGS_TAG`, `getSiteSettings()` (`use cache` + `cacheTag`), format-хелперы адресов.
- `src/lib/payload.ts` -- существующий `getPayload` аксессор (используется внутри `getSiteSettings`).
- `src/payload-types.ts` -- РЕГЕНЕРИРУЕТСЯ (`npm run generate:types`) → появится тип `SiteSetting`.
- `src/migrations/*` -- НОВАЯ миграция (`npm run migrate:create`), создаёт таблицу глобала; закоммитить `.ts` + `.json`.
- `src/content/site-contacts.ts` -- добавить `buildFooterContacts(s)`; ⚫-атомы (blurb/legal/copyright/sublabels) остаются.
- `src/components/shell/Footer.tsx` -- RSC → async; `phones/email/addresses` из `SiteSettings`. Монтируется из `src/app/(site)/layout.tsx` (правки layout не требуются).
- `src/content/contact-info.ts` -- добавить `buildContactInfoContent(s)`; лейблы/heading/blurb/social-label остаются.
- `src/components/contact-form/ContactInfo.tsx` -- потребляет `content` (уже проп с дефолтом) — дефолт-импорт статики удалить/заменить на required-проп из RSC.
- `src/components/contact-form/ContactInline.client.tsx` / `ContactModal.client.tsx` / `GetInTouch.client.tsx` -- прокинуть `contactInfo` пропом сверху вниз (client-компоненты только передают проп, fetch не делают).
- `src/content/shops.ts` + `src/app/(site)/shops/page.tsx` + `src/components/shops/Store.tsx` -- `store.hours/phone/addressLines` из `SiteSettings`; `cityDk/cityMb`/лейблы остаются.
- `src/content/home.ts` + `src/app/(site)/page.tsx` + `src/components/home/CtaSection.tsx` -- `cta.hours` из `SiteSettings`; hardcoded соц-URL заменить на props из `SiteSettings`; прокинуть `contactInfo` в `GetInTouch`.
- `src/content/about.ts` + `src/app/(site)/about/page.tsx` + `src/components/about/CtaSection.tsx` -- `cta.hours` + соц-URL + `usPresence.mobile.cards[].addr` из `SiteSettings`; прокинуть `contactInfo` в `GetInTouch`.
- `src/content/contact.ts` + `src/app/(site)/contact/page.tsx` -- `hero.intro` (часы) + `map.tabs[].addr/q` из `SiteSettings`; `map.initialSrc` не трогать.

## Tasks & Acceptance

**Execution:**

- [x] `src/globals/SiteSettings.ts` -- Создать `GlobalConfig` (slug `'site-settings'`, `admin.group: 'Company'`) с полями и `defaultValue` (значения — см. таблицу «ATOM INVENTORY»): группы `phones {legal, shop}`, `emails {footer, contact}`, `social {github, linkedin}`, `registeredAddress {company, street, city, state, zip}`, `shopAddress {street, city, state, zip}`, `hours { store: array<{day:text, time:text, closed:checkbox}>, homeCtaDesktop, homeCtaMobile, aboutCtaDesktop, aboutCtaMobile, contact }`. Каждое скалярное поле — `type:'text'` (кроме `closed`), с `defaultValue`. `store` — `type:'array'` с 7 дефолтными строками.
- [x] `payload.config.ts` -- Импортировать и добавить `SiteSettings` в `globals: [SiteSettings]`.
- [x] `src/lib/site-settings.ts` -- Экспортировать `export const SITE_SETTINGS_TAG = 'site-settings'`; `export async function getSiteSettings()` c первой строкой `'use cache'`, вызовом `cacheTag(SITE_SETTINGS_TAG)` (импорт из `next/cache` в форме, совместимой с Next 16.2.10), затем `const payload = await getPayload(); return payload.findGlobal({ slug: 'site-settings' })` (типизировать возвратом `SiteSetting`). Добавить чистые format-хелперы: `cityStateZip(a)` → `` `${a.city}, ${a.state} ${a.zip}` ``; и вспомогательные для потребителей, где формат отличается. Хелперы — чистые функции от объекта настроек (детерминированы, DB-free).
- [x] `npm run generate:types` -- Регенерировать `src/payload-types.ts`; убедиться, что появился тип глобала (`SiteSetting`) и он экспортируется. Все билдеры импортируют этот тип.
- [x] `src/migrations/<generated>` -- Сгенерировать миграцию (`npm run migrate:create site_settings`) для таблицы глобала; закоммитить `.ts` и `.json` снапшот. Прогнать `npm run migrate`.
- [x] `src/content/site-contacts.ts` + `src/components/shell/Footer.tsx` -- В `site-contacts.ts` добавить `buildFooterContacts(s: SiteSetting): { phones: Phone[]; email: string; addresses: Address[] }`, композиция: `phones` из `s.phones` + текущие лейблы (`only for legal purposes` / `shop and return center`); `email = s.emails.footer`; `addresses` из `s.registeredAddress`/`s.shopAddress` + текущие `sublabel`/`accent`, строки собираются format-хелпером (см. таблицу). Footer сделать `async`, заменить прямые импорты `PHONES/EMAIL/ADDRESSES` на `buildFooterContacts(await getSiteSettings())`. `COMPANY_BLURB/COMPANY_INTRO/LEGAL_LINKS/COPYRIGHT` оставить статикой.
- [x] `src/content/contact-info.ts` + ContactInfo/ContactInline/ContactModal/GetInTouch -- Добавить `buildContactInfoContent(s: SiteSetting): ContactInfoContent` (адреса/телефоны/`email=s.emails.contact`/`social` из `s`; `heading`/`blurb`/лейблы/`platform`/`label` — в коде). `ContactInfo` принимает `content` как REQUIRED проп (убрать дефолт-импорт статики). Прокинуть `contactInfo` пропом: `ContactInline.client` (получает от contact page) и `GetInTouch.client` → `ContactModal.client` → `ContactInfo` (получает от home/about `CtaSection`). Client-компоненты только ретранслируют проп.
- [x] `src/content/shops.ts` + `src/app/(site)/shops/page.tsx` + `src/components/shops/Store.tsx` -- `store.hours` (7 дней), `store.phone`, `store.addressLines` строить из `s.hours.store`/`s.phones.shop`/`s.shopAddress` (`addressLines = [street, zip]` → `['5327 Aldine Mail Route Rd','77039']`). shops page (RSC) вызывает `getSiteSettings()` и передаёт готовый `store` в `Store`. `cityDk/cityMb` (спейсинг-квирк), `eyebrow/title/intro/locationLabel/directions` — в коде.
- [x] `src/content/home.ts` + `src/app/(site)/page.tsx` + `src/components/home/CtaSection.tsx` -- `cta.hours.dk/mb` из `s.hours.homeCtaDesktop/homeCtaMobile`; hardcoded `github`/`linkedin` в `CtaSection` заменить на значения `s.social.github/linkedin` (проп сверху). home page (RSC) фетчит `getSiteSettings()`, собирает `cta` и `contactInfo`, передаёт в `CtaSection`/`GetInTouch`. `heading/intro/schedulePrefix/scheduleSuffix` — в коде.
- [x] `src/content/about.ts` + `src/app/(site)/about/page.tsx` + `src/components/about/CtaSection.tsx` -- `cta.hours.dk/mb` из `s.hours.aboutCtaDesktop/aboutCtaMobile` (сохранить `UTC +2` vs `UTC+2`); соц-URL из `s.social`; `usPresence.mobile.cards[].addr` строить из `s.registeredAddress`/`s.shopAddress` дословно (см. таблицу — HQ с `· only for legal purposes`, store `5327 Aldine Mail Route Rd, 77039`). Прочая проза/`usPresence.locations` — в коде.
- [x] `src/content/contact.ts` + `src/app/(site)/contact/page.tsx` -- `hero.intro` собрать как `` `Wholesale, partnership, and marketplace operations. Monday to Friday from ${s.hours.contact}.` ``; `map.tabs[0].addr/q` и `map.tabs[1].addr/q` — из `s.shopAddress`/`s.registeredAddress` дословно (см. таблицу; HQ `addr` ≠ `q`). `map.initialSrc` и лейблы табов НЕ трогать. contact page (RSC) фетчит настройки и передаёт `hero`/`map`/`contactInfo` в секции.

**ATOM INVENTORY (поле `SiteSettings` → `defaultValue`):**
- `phones.legal` = `(307) 920-0149`; `phones.shop` = `(832) 461-2525`
- `emails.footer` = `info@rollun.com`; `emails.contact` = `llc@rollun.com`
- `social.github` = `https://github.com/rollun-lc`; `social.linkedin` = `https://www.linkedin.com/company/rollun-lc/`
- `registeredAddress` = { company `Rollun LC`, street `30 N Gould St STE 4370`, city `Sheridan`, state `WY`, zip `82801` }
- `shopAddress` = { street `5327 Aldine Mail Route Rd`, city `Houston`, state `TX`, zip `77039` }
- `hours.store` = [Monday…Friday `10 AM – 4 PM`; Saturday `Closed` closed:true; Sunday `Closed` closed:true]
- `hours.homeCtaDesktop` = `11:00 to 21:00 UTC`; `hours.homeCtaMobile` = `09:00 to 21:00 UTC+2`
- `hours.aboutCtaDesktop` = `09:00 to 21:00 UTC +2`; `hours.aboutCtaMobile` = `09:00 to 21:00 UTC+2`
- `hours.contact` = `09:00 to 21:00 UTC+2`

**Acceptance Criteria:**
- Given чистая БД (глобал ни разу не сохранён), when собран `next build`, then `getSiteSettings()` возвращает `defaultValue`-значения и все страницы рендерятся пиксель-идентично Фазе 1 (значения из таблицы ниже воспроизведены дословно).
- Given правка любого паспорт-атома в `/admin` (напр. `phones.shop`), when срабатывает ревалидация (появится в 7.4), then новое значение отражается ВЕЗДЕ, где атом выводится (footer, contact-панель, shops) — потому что у атома единственный дом и все потребители на него ссылаются.
- Given `s.emails.footer` ≠ `s.emails.contact` и четыре разных `hours.*CtaDesktop/Mobile`, when рендерятся футер/панель/CTA, then осознанные расхождения сохранены (разные значения из разных полей, не сведены к одному).
- Given `next build` под `cacheComponents: true`, when страницы пререндерятся, then сборка успешна (чтение глобала внутри `use cache` не переводит страницы в dynamic).
- Given `npm run generate:types`, when тип глобала сгенерирован, then все билдеры типобезопасны против `SiteSetting` (`tsc --noEmit` без ошибок).

**Exact-output parity table (композиция обязана воспроизвести дословно):**
| Потребитель | Строится из | Ожидаемый вывод (дословно) |
|---|---|---|
| Footer registered `lines` | registeredAddress | `['Rollun LC','30 N Gould St STE 4370','Sheridan, WY 82801']` |
| Footer shop `lines` | shopAddress | `['5327 Aldine Mail Route Rd','Houston, TX 77039']` |
| ContactInfo registered `lines` | registeredAddress | `['Rollun LC','30 N Gould St STE 4370','Sheridan, WY 82801']` |
| ContactInfo shop `lines` | shopAddress | `['5327 Aldine Mail Route Rd','Houston, TX 77039']` |
| Shops `addressLines` | shopAddress | `['5327 Aldine Mail Route Rd','77039']` |
| Map tab[0] `addr`/`q` | shopAddress | `5327 Aldine Mail Route Rd, Houston, TX 77039` (оба) |
| Map tab[1] `addr` | registeredAddress | `Registered Rollun LC — 30 N Gould St STE 4370, Sheridan WY 82801` |
| Map tab[1] `q` | registeredAddress | `30 N Gould St STE 4370, Sheridan, WY 82801` |
| About mobile card HQ `addr` | registeredAddress | `30 N Gould St STE 4370 · only for legal purposes` |
| About mobile card store `addr` | shopAddress | `5327 Aldine Mail Route Rd, 77039` |
| Contact `hero.intro` | hours.contact | `Wholesale, partnership, and marketplace operations. Monday to Friday from 09:00 to 21:00 UTC+2.` |

## Spec Change Log

<!-- Append-only. Populated by step-04 during review loops. -->

(Пусто — ни одного `bad_spec`-лупбэка не потребовалось.)

## Review Triage Log

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 2, low 0)
- defer: 2
- reject: 8
- addressed_findings:
  - `[medium]` `[patch]` Чистые формат-хелперы жили в одном модуле с `getSiteSettings` (который тянет `getPayload`/`@payload-config`) — риск утечки Payload-local-API в клиентский бандл, если content-модуль когда-нибудь value-импортнут в client-остров. Вынес чистые DB-free хелперы в `src/lib/site-settings-format.ts`; content-модули импортируют из него, `getSiteSettings` изолирован в `src/lib/site-settings.ts`.
  - `[medium]` `[patch]` Редакторская проза (предложение hero-интро, префикс `Registered … —`, микрокопия `· only for legal purposes`) утекла в `lib/site-settings.ts`, нарушая заявленную AD-6-границу (проза — в `content/*`). Перенёс композицию этих строк обратно в `content/contact.ts` / `content/about.ts` (атомы из паспорта, проза — в коде). Паритет строк перепроверен байт-в-байт в пререндер-HTML.

<!-- Отклонено (reject, кратко для аудита): (1) HIGH-опасение обоих ревьюеров, что `findGlobal` не отдаст defaults (в т.ч. массив `hours.store`) для несохранённого глобала — ЭМПИРИЧЕСКИ опровергнуто: пререндер `/shops` содержит 20×«10 AM – 4 PM» и 8×«Closed», все 4 страницы `○ Static`; (2) `?? []` «пустые часы» — поглощено (1), безопасно; (3) хелперы кидают на partial-глобале — опровергнуто; (4) новая зависимость build/runtime от Postgres для всех маршрутов — by design (AD-12; docker-compose поднимает БД+migrate до app); (5) нет `cacheLife` — by design, ревалидацию вводит 7.4; (6) defaults продублированы (field vs SQL) — свойство Payload-миграций; (7) email как `text`, не `email` — вне scope (паритет, не новая валидация); (8) `closed`-чекбокс не связан с `time` — админ-ввод, не паритет. -->

## Design Notes

- **Гранулярность адреса — намеренно структурная.** Один и тот же физический адрес выводится в 5 разных форматах (полные строки / только zip / `city, state zip` / `city state zip` без запятой у HQ-map / inline-микрокопия). Единый «дом» — структурные поля (`street/city/state/zip/company`); КАЖДЫЙ потребитель собирает свою строку в коде из этих полей + свою микрокопию. Так AD-14 (один источник) и AD-13 (дословные расхождения) соблюдены одновременно. Пример HQ-map: `` `Registered ${s.registeredAddress.company} — ${street}, ${city} ${state} ${zip}` `` даёт `…Sheridan WY 82801` (без запятой) — это НЕ баг, воспроизводится дословно.
- **`defaultValue` = гарантия паритета.** Payload для глобала, который ещё не сохраняли, возвращает значения `defaultValue` из `findGlobal`. Поэтому сборка ДО любой правки в админке пиксель-идентична. Значения полей — ровно текущие литералы.
- **Границы код/контент.** В `SiteSettings` уезжают ТОЛЬКО сырые паспорт-значения (🟢). Проза/лейблы/микрокопия/спейсинг-квирки (🟡↔⚫, tie-break → ⚫) остаются в `content/*` и компонентах. Blurbs, legal-ссылки, `map.initialSrc`, city-лейблы, `schedulePrefix`/`hoursPrefix` — в коде.
- **Client boundary.** `ContactInfo` рендерится внутри client-деревьев (`ContactInline`, `GetInTouch → ContactModal`). Фетч делают ТОЛЬКО RSC-границы: contact page (для inline), home/about `CtaSection` (RSC — для модалки). Значения проходят вниз пропом `contactInfo`; ни один client-компонент не вызывает Payload.
- **Два модуля (review-patch).** DB-несущий аксессор `getSiteSettings` изолирован в `src/lib/site-settings.ts`; чистые DB-free формат-хелперы адресов — в `src/lib/site-settings-format.ts`. `content/*` импортируют ТОЛЬКО format-модуль (безопасно тянуть в любой бандл), страницы/Footer — `getSiteSettings`. Так исключена транзитивная утечка `@payload-config` в клиентский бандл. Проза строк (hero-предложение, `Registered … —`, `· only for legal purposes`) живёт в `content/*`, не в lib (AD-6).
- **Кэш/тег — read-side для 7.4.** `getSiteSettings()` кэшируется под `SITE_SETTINGS_TAG`. `afterChange`-хук с `revalidateTag(SITE_SETTINGS_TAG)` — задача Story 7.4; здесь только тег на чтении (обязателен, иначе build не статичен под `cacheComponents`).
- **Тестов нет по конвенции.** В проекте отсутствует тест-раннер; паритет строк проверяется таблицей выше и ревью, а типо-/сборочная корректность — `tsc`/`build`. Не вводить vitest/jest в этой истории.

## Verification

**Commands:**
- `docker compose up -d postgres` -- expected: контейнер postgres healthy (нужен для migrate/build; порт 5432 сейчас свободен).
- `npm run generate:types` -- expected: `src/payload-types.ts` содержит тип глобала `SiteSetting`; git-diff показывает добавление глобала.
- `npm run migrate:create site_settings` && `npm run migrate` -- expected: миграция создаёт таблицу глобала, применяется без ошибок; файлы миграции закоммичены.
- `npx tsc --noEmit` -- expected: 0 ошибок (все билдеры типобезопасны против `SiteSetting`).
- `npm run lint` -- expected: без ошибок.
- `npm run build` -- expected: сборка успешна; целевые страницы (`/`, `/about`, `/shops`, `/contact`) остаются статически пререндеренными; никаких `Route couldn't be rendered statically` от чтения глобала.

**Manual checks:**
- Пройтись по «Exact-output parity table»: для каждого потребителя сверить, что композиция из `defaultValue`-полей даёт ДОСЛОВНО указанную строку (особенно: shops `77039`-only, HQ-map `addr`≠`q` и `Sheridan WY 82801` без запятой, about mobile `· only for legal purposes`, hero-предложение с часами).
- Grep-проверка отсутствия второго дома: `github.com/rollun-lc` и `linkedin.com/company/rollun-lc` больше не встречаются как хардкод в `home/CtaSection.tsx` и `about/CtaSection.tsx`; телефоны/адреса не дублируются литералами в `content/*` (только `defaultValue` в `SiteSettings.ts`).

## Auto Run Result

Status: done

**Реализовано:** введён Payload-глобал `SiteSettings` как единственный дом (AD-14) всех паспорт-атомов компании (телефоны, email, соц-ссылки, два адреса, часы). Все потребители (Footer, contact-панель, Our Shops, Home/About CTA, Contact) переключены на чтение из него через серверный `getSiteSettings()` (`use cache` + `cacheTag`), без единой правки разметки/пикселя. Значения заданы через `defaultValue`, равные текущим литералам, поэтому первый рендер до правок в админке — пиксель-идентичен. Осознанные расхождения (footer `info@` vs contact `llc@`; четыре разных CTA-часа; `UTC +2` с пробелом vs `UTC+2`; map HQ `addr` без запятой vs `q` с запятой; shops zip-only адрес) сохранены как отдельные поля/значения.

**Изменённые/новые файлы:**
- `src/globals/SiteSettings.ts` (новый) — `GlobalConfig` со всеми паспорт-полями + `defaultValue`.
- `payload.config.ts` — регистрация `globals: [SiteSettings]`.
- `src/lib/site-settings.ts` (новый) — `SITE_SETTINGS_TAG` + серверный `getSiteSettings()` (DB-несущий, изолирован).
- `src/lib/site-settings-format.ts` (новый, review-patch) — чистые DB-free формат-хелперы адресов.
- `src/payload-types.ts` — регенерирован (тип `SiteSetting`).
- `src/migrations/20260706_064817_site_settings.ts|.json` (новые) + `index.ts` — таблица глобала, применена.
- `src/content/{site-contacts,contact-info,shops,home,about,contact}.ts` — статические инстансы → `build*(s)` билдеры, паспорт-атомы из глобала, проза/лейблы в коде.
- `src/components/shell/Footer.tsx` — async RSC, контакты из глобала.
- `src/components/contact-form/{ContactInfo,ContactInline.client,ContactModal.client,GetInTouch.client}.tsx` — `content`/`contactInfo` как required-проп, проброшены с RSC-границы (client не фетчит).
- `src/components/{home,about}/CtaSection.tsx` — соц-URL и `contactInfo` как props (хардкод убран).
- `src/app/(site)/{page,about,contact,shops}.tsx` — async, фетчат настройки, собирают контент.

**Ревью:** intent_gap 0, bad_spec 0. Патчей 2 (оба medium, применены): (1) вынос чистых формат-хелперов в отдельный DB-free модуль (устранён риск утечки `@payload-config` в клиентский бандл); (2) возврат редакторской прозы из lib в `content/*` (AD-6). Отложено 2 (в `deferred-work.md`, к Story 7.3): десктопные пины US-presence карты и `map.initialSrc` — паспорт-смежные литералы вне scope 7.1. Отклонено 8 (гл.: HIGH-опасение про defaults несохранённого глобала — эмпирически опровергнуто; Postgres-зависимость — by design AD-12).

**Верификация (после патча):** `npx tsc --noEmit` — 0 ошибок; `npm run lint` — чисто; `npm run build` — успех, `/`, `/about`, `/contact`, `/shops` все `○ (Static)`; паритет строк перепроверен байт-в-байт в пререндер-HTML (em-dash U+2014, middot U+00B7, `UTC +2`-пробел, 20×«10 AM – 4 PM» + 8×«Closed» на /shops, single-home footer, проброшенный `llc@` модалки). Postgres поднят через `docker compose up -d postgres`; миграция применена.

**Остаточные риски:** правки паспорта в админке отражаются на проде только после Story 7.4 (`afterChange` → `revalidateTag`); до неё — фоновая ревалидация профиля `use cache` (~15 мин) или пересборка. Два отложенных вторых-дома (desktop-пины, initialSrc) до Story 7.3 не отслеживают правку адреса.
