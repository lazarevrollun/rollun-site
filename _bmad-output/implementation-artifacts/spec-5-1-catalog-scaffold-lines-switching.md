---
title: 'Story 5.1 — Каркас Catalog: линии и переключение'
type: 'feature'
created: '2026-07-06'
status: 'done'
baseline_revision: '49b27cf67f795c88e395bc4fc1195d5ca38de98a'
final_revision: 'dcbffca5fbe28e9a6b21a37a923ceabeec0c8cf6'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/rollun_handoff/rollun-web-site/project/Catalog.html'
  - '{project-root}/rollun_handoff/rollun-web-site/project/Catalog Mobile.html'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** Роут `/catalog` — RSC-заглушка («Rollun — Catalog (scaffold)»). Нужен пиксель-в-пиксель каркас страницы Catalog (desktop+mobile) с интерактивным выбором продуктовой линии — самый первый слой эпика 5, поверх которого лягут карточки (5.2), офферы (5.3), quick-view (5.4) и marquee (5.5).

**Approach:** Собрать страницу как чистую функцию нового типизированного контент-объекта `CatalogContent` (`content/catalog.ts`), по паттерну About/Home: секции — RSC в `components/catalog/*`, обе композиции (`.catalog-dk` / `.catalog-mb`) в одном DOM с CSS-переключением на 768px, весь интерактив (`choose()` + deep-link) — один листовой `'use client'`-островок, портирующий VERBATIM логику `Catalog.html`. Product-контейнеры (`.product-grid` / `.product-shelf`) рендерятся ПУСТЫМИ — их наполняют 5.2/5.3.

## Boundaries & Constraints

**Always:**
- Пиксель-в-пиксель по отрисованному Handoff на каждом брейкпоинте (приоритет №1). Значения портируются VERBATIM из двух прототипов; DS-токены пишутся через `var(--color-*)`, прототип-литералы (тени, `rgba(255,255,255,…)`) — как есть. Точный паттерн — `styles/about.css`.
- Обе композиции SSR-рендерятся; видимую выбирает ТОЛЬКО CSS `@media` на 768px (desktop в `(min-width:768px)`, mobile в `not all and (min-width:768px)`). Никакого JS-гейтинга ширины / UA-сниффинга.
- Страница = чистая функция `catalogContent`: page.tsx держит 0 собственных строк, только разводит контент по секциям в EXACT Handoff-порядке и импортит `styles/catalog.css`. Header/Footer/RevealOnScroll даёт layout — НЕ страница.
- Островок — листовой (AD-1), `return null`, только `useEffect`, enhance-only (никогда не переписывает разметку), все селекторы scoped под `.catalog-dk`, keyed на `usePathname()`, cleanup снимает все слушатели. Прецедент — `components/home/ProductLineSwitcher.client.tsx`.
- `CatalogContent` — FLAT SERIALIZABLE DATA (строки/числа/массивы/объекты; без функций/JSX), совместимо с будущим Payload Global `CatalogContent` (AD-7). Различия dk↔mb текста — только через явный `{ dk, mb }` (прецедент `content/about.ts`), не runtime-логикой.
- Подкатегорийные плитки `.subcat` — декоративные: НЕТ ни одного click-обработчика ни на desktop, ни на mobile.
- Порядок секций (5.1): Hero → «Two entrances» → Product lines (split) → CTA. Footer — из layout. Секцию `brands-wall` (marquee) НЕ добавлять — это Story 5.5.

**Block If:**
- Прототипы Catalog отсутствуют/нечитаемы (нельзя портировать пиксель верно).
- Общий каркас (layout с Header/Footer/RevealOnScroll, DS-токены, `.btn`/`.reveal`/`.container`) отсутствует — Story 5.1 зависит от Epic 1.

**Never:**
- Не реализовывать карточки товара, слайдер, quick-view, офферы, marquee, `buildOffers` — это 5.2–5.5. `product-grid`/`product-shelf` остаются пустыми контейнерами (с `data-cat`).
- Не инлайнить своё мобильное шасси (drawer/scroll-lock) — оно общее из Epic 1.
- Не использовать `--color-green-deep` на Catalog (легитимно отсутствует по дизайну; для «In stock» — `--color-green`).
- Не «примирять» кросс-страничные расхождения токенов/адресов.
- Не дублировать `id` между dk и mb композициями (см. Design Notes — канонические `#automotive`/`#health` живут на mobile-секциях).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Клик по entrance (desktop) | клик `.catalog-dk .entrance[href="#automotive"]` | `preventDefault`; `.split-grid` += `solo` + `show-auto` (снять `show-health`); `.lines-split` += `active` (секция становится видимой); `.cat-filter-name` = «Automotive parts & accessories»; smooth-scroll к `.lines-split` (offsetTop−60) | — |
| Клик по entrance health (desktop) | клик `.entrance[href="#health"]` | как выше, но `show-health` + имя «Health products» | — |
| Deep-link при загрузке | `/catalog#health` (или `#automotive`) | на mount островок вызывает `choose('health', false)` (без скролла) → линия показана solo | неизвестный/пустой hash → игнор, `.lines-split` остаётся скрытой |
| Смена hash | `hashchange` → `#automotive` | `choose('auto', false)` | невалидный → игнор |
| Клик `.cat-back` (desktop) | клик кнопки | smooth-scroll к `.entrances` (offsetTop−70); `.lines-split` НЕ скрывается (остаётся `active`) — VERBATIM прототип | — |
| Клик по `.subcat` (оба) | клик плитки | ничего (обработчика нет) | — |
| Entrance на mobile | тап `.catalog-mb .entrance[href="#automotive"]` | нативный anchor-jump к секции `#automotive` (островок сюда НЕ лезет) | — |

</intent-contract>

## Code Map

- `src/app/(site)/catalog/page.tsx` -- заглушка Story 1.1; заменить на RSC-разводку секций + импорт `styles/catalog.css` (образец: `about/page.tsx`)
- `src/content/catalog.ts` -- НОВЫЙ: тип `CatalogContent` + инстанс `catalogContent` (образец `content/about.ts`)
- `src/components/catalog/Hero.tsx` -- НОВЫЙ RSC: dk `.page-hero` + mb `.page-hero`
- `src/components/catalog/Entrances.tsx` -- НОВЫЙ RSC: dk+mb `.entrances`/`.entrance-grid`/`.entrance`
- `src/components/catalog/ProductLines.tsx` -- НОВЫЙ RSC: dk `.lines-split` (filter-bar + `.split-grid` c двумя `.line-col`, пустые `.product-grid`) + mb две `.line`-секции (`.hscroll` subcats + пустой `.product-shelf`); монтирует островок
- `src/components/catalog/CatalogLineSwitcher.client.tsx` -- НОВЫЙ островок: `choose()` + deep-link, scoped `.catalog-dk`
- `src/components/catalog/CtaSection.tsx` -- НОВЫЙ RSC: dk+mb `.cta`
- `src/styles/catalog.css` -- НОВЫЙ: обе композиции, `@layer components`, switch 768px, брейкпоинты 1280/1100/980/920
- `src/styles/theme.css` -- ТОЛЬКО чтение: все нужные токены уже есть (`--color-or/-bg/-paper/-ink*/-line/-green`)
- `rollun_handoff/.../Catalog.html` / `Catalog Mobile.html` -- источник пикселя/логики (VERBATIM)
- `src/components/home/ProductLineSwitcher.client.tsx` -- эталон островка (scoping, hash, cleanup, usePathname)

## Tasks & Acceptance

**Execution:**
- [x] `src/content/catalog.ts` -- определить `CatalogContent` и `catalogContent`: `hero` (eyebrow, title, intro, redirectNote), `entrancesHead` (eyebrow, title), `entrances[]` ({ key:'auto'|'health', href, img, alt, kicker, title, ctaLabel }), `filter` (showingLabel, backLabel, names:{auto,health} — для `choose()`), `lines` ({ auto, health } каждая: eyebrow, title, intro, subcatLabel, subcats[]{img,alt,name}, listingHead{title,hint}, lineCta{label,href}), `cta` (titleSegments с оранжевым акцентом «buy», text, buttons[]{label,href,variant}). Тексты — VERBATIM из прототипов; dk↔mb различия через `{dk,mb}` -- позволяет странице быть чистой функцией контента (AD-7)
- [x] `src/app/(site)/catalog/page.tsx` -- заменить заглушку: `<main>` разводит `Hero`/`Entrances`/`ProductLines`/`CtaSection` из `catalogContent` в Handoff-порядке; импорт `@/styles/catalog.css` последним -- каркас как чистая функция контента
- [x] `src/components/catalog/Hero.tsx` -- RSC: обе `.page-hero` композиции (eyebrow, `<h1>`, intro, `.redirect-note` с иконкой) -- пиксель Hero
- [x] `src/components/catalog/Entrances.tsx` -- RSC: `.entrances`→`.entrances-head`+`.entrance-grid` с двумя `<a class="entrance" href="#automotive|#health">` (img, `.entrance-body`: kicker/h2/`.entrance-cta`+стрелка) для dk и mb -- секция «Two entrances» + якоря deep-link
- [x] `src/components/catalog/ProductLines.tsx` -- RSC: **desktop** `.lines-split`→`.cat-filter-bar` (`.cat-filter-now`+`.dot`+`.cat-filter-name`=«—», `.cat-back`+иконка) + `.split-grid` c `.line-col.health` и `.line-col.auto` (`.line-head`, `.subcat-label`, `.subcat-grid`[`.four` для health] из `.subcat`, `.listing-head`, ПУСТОЙ `.product-grid[data-cat]`, `.line-cta`); **mobile** две `<section class="line auto|health" id>` (`.line-head.wrap`, `.subcat-label.wrap`, `.hscroll` из `.subcat`, ПУСТОЙ `.product-shelf[data-cat]`); смонтировать `<CatalogLineSwitcher/>`. Порядок в split-grid: health слева, auto справа (VERBATIM) -- каркас линий + декоративные subcat + точки монтирования 5.2
- [x] `src/components/catalog/CatalogLineSwitcher.client.tsx` -- островок (`'use client'`, `return null`): в `useEffect` (keyed `usePathname()`) взять `.catalog-dk .lines-split` (если нет — выйти), `.split-grid`, `.cat-filter-name`, `.cat-back`, `.catalog-dk .entrance`; `choose(cat,scroll)` VERBATIM (toggle `solo`/`show-health`/`show-auto`, `.active`, textContent имени, smooth-scroll offsetTop−60); клики entrance → `preventDefault`+`choose(...,true)` (health/auto по href); cat-back → smooth-scroll к `.entrances` offsetTop−70; на mount + `hashchange` читать `location.hash` (`#health`/`#automotive`) → `choose(...,false)`; cleanup снимает все слушатели -- вся интерактивность линий; enhance-only
- [x] `src/components/catalog/CtaSection.tsx` -- RSC: обе `.cta` композиции (h2 с `.or-txt`, text, `.cta-buttons` с `.btn.btn-or`/`.btn.btn-dark`) -- секция CTA
- [x] `src/styles/catalog.css` -- портировать CSS обеих композиций из `<style>` прототипов в `@layer components`: `.catalog-dk`/`.catalog-mb` оба `display:none` → media 768px раскрывает одну; правила `.page-hero`, `.entrances`/`.entrance*`, `.lines-split`(вкл. `display:none`→`.active{display:block}`)/`.cat-filter-*`/`.cat-back`/`.split-grid`(+`.solo`/`.show-*`/hover 981px)/`.line-col`/`.subcat*`/`.line-head`/`.line-cta`, `.hscroll`, `.cta`; desktop-брейкпоинты 1280/1100/980(split→1 колонка)/920. Значения VERBATIM; палитра — через `var(--color-*)`; НЕ переопределять `.btn`/`.reveal` -- пиксель-паритет
- [x] `src/styles/catalog.css` (проверка decorative) -- убедиться, что `.subcat` не имеет `cursor:pointer`-семантики сверх прототипа и НИ в одном компоненте/островке нет обработчика на `.subcat`

**Acceptance Criteria:**
- Given `/catalog` загружена на desktop, when нет hash, then видны Hero, «Two entrances», CTA пиксель-в-пиксель, а `.lines-split` скрыта (`display:none`), пока не выбрана линия — как в прототипе.
- Given desktop, when клик по entrance (или загрузка с `#automotive`/`#health`), then `choose()` показывает выбранную линию solo (`.split-grid.solo.show-auto|show-health`, `.lines-split.active`), фильтр-бар «Showing <имя>» и `.cat-back` видимы; deep-link выбирает линию без скролла.
- Given mobile (≤768px), when страница загружена, then линии Automotive и Health идут стопкой статично, без фильтр-бара/переключателя; entrance-ссылки — нативные якоря к `#automotive`/`#health`.
- Given любой брейкпоинт, when меняется ширина, then видима ровно одна композиция (CSS-only, без JS-гейтинга); split-grid схлопывается в 1 колонку на ≤980px.
- Given desktop и mobile, when клик по подкатегорийной плитке `.subcat`, then ничего не происходит (декоративная).
- Given страница, then `page.tsx` не содержит собственных строк контента (всё из `catalogContent`); Header/Footer приходят из layout.

## Review Triage Log

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 1, low 1)
- defer: 2: (high 0, medium 2, low 0)
- reject: 9
- addressed_findings:
  - `[medium]` `[patch]` Островок форсировал `behavior:'smooth'` в `choose()` и `onBack`, игнорируя `prefers-reduced-motion` (эпик-требование Accessibility Floor: reduced-motion отключает анимации). Добавлен `scrollBehavior()` (matchMedia, читается в момент вызова) → reduced-motion получает мгновенный переход.
  - `[low]` `[patch]` Кнопка CTA «Wholesale & partnerships» отдавала desktop-href (`/contact?topic=…#contactForm`) и на mobile, тогда как mobile-прототип — голый `Contact Mobile.html`. `cta.buttons[].href` сделан `{dk,mb}`-вариантом (mb → `/contact`), `CtaSection` выбирает по композиции.

## Design Notes

**Дубликат id между композициями (важно).** Прототип desktop вешает `id="health"`/`id="automotive"` на `.line-col`, а mobile — на `.line`-секции; в одном DOM это коллизия. Решение: канонические якоря `#automotive`/`#health` живут ТОЛЬКО на mobile-секциях (`.catalog-mb .line`), где нужен нативный anchor-scroll. Desktop `choose()` работает по КЛАССАМ (`.line-col.auto/.health`, `.split-grid`), id ему не нужен (прототипный JS тоже не использует id для скролла — скроллит к `.lines-split`). Home-островок уже намеренно использует namespaced `#line-<key>-<n>`, оставляя `#automotive`/`#health` каталогу — конфликта hash нет.

**`choose()` VERBATIM** (эталон логики; портировать в островок, scoped `.catalog-dk`):
```js
function choose(cat, scroll){
  grid.classList.add('solo');
  grid.classList.remove('show-health','show-auto');
  grid.classList.add(cat==='health' ? 'show-health' : 'show-auto');
  section.classList.add('active');
  if (nameEl) nameEl.textContent = cat==='health' ? 'Health products' : 'Automotive parts & accessories';
  if (scroll) window.scrollTo({ top: section.offsetTop-60, behavior:'smooth' });
}
```
`.cat-back` в прототипе только скроллит к `.entrances` — НЕ снимает `.active` (линия остаётся выбранной). Сохранить as-is (пиксель/поведение > интуиция).

**Пустые контейнеры.** `.product-grid[data-cat]` (desktop, один на линию) и `.product-shelf[data-cat]` (mobile, по подкатегориям: tires/oils/elec/health) рендерятся пустыми — 5.2/5.3 наполнят из данных. Прецедент: About 4.1 оставил пустой `#map` для 4.2.

## Verification

**Commands:**
- `npm run lint` -- expected: без ошибок в новых файлах (в т.ч. `@next/next/no-img-element` — глушить точечно как в `ProductLines.tsx` Home, если `<img>` нужен для пиксель-фиделити)
- `npx tsc --noEmit` -- expected: типы сходятся; `catalogContent` соответствует `CatalogContent`
- `npm run build` -- expected: `/catalog` собирается как статический RSC без ошибок

**Manual checks:**
- `/catalog` desktop: без hash — линии скрыты; клик по entrance → линия solo + фильтр-бар; `/catalog#health` — Health solo сразу; `.cat-back` скроллит к entrances; клик по subcat — ноль реакции.
- Сузить окно <768px: видна mobile-композиция (стопка линий, без фильтр-бара); >768px — desktop; split схлопывается в 1 колонку на ≤980px.
- Сверить пиксель Hero/Entrances/Lines/CTA с отрисованными `Catalog.html` и `Catalog Mobile.html`.

## Auto Run Result

Status: done

**Реализовано.** Каркас страницы Catalog (`/catalog`) пиксель-в-пиксель desktop+mobile как чистая функция `catalogContent`, с интерактивным выбором продуктовой линии (desktop `choose()` + deep-link `#automotive`/`#health`) — фундамент эпика 5 под карточки (5.2), офферы (5.3), quick-view (5.4), marquee (5.5). Product-контейнеры рендерятся пустыми.

**Файлы:**
- `src/content/catalog.ts` — НОВЫЙ: тип `CatalogContent` + инстанс `catalogContent` (hero, entrances, filter, lines{auto,health}, cta); тексты VERBATIM, dk↔mb различия через `{dk,mb}`.
- `src/app/(site)/catalog/page.tsx` — заглушка заменена на RSC-разводку `Hero`/`Entrances`/`ProductLines`/`CtaSection` + импорт `catalog.css`; 0 собственных строк.
- `src/components/catalog/Hero.tsx` — RSC, обе `.page-hero`.
- `src/components/catalog/Entrances.tsx` — RSC, «Two entrances» dk+mb, якоря deep-link.
- `src/components/catalog/ProductLines.tsx` — RSC: desktop `.lines-split` (filter-bar + `.split-grid`, health слева/auto справа, пустые `.product-grid`), mobile две `.line`-секции с `#automotive`/`#health` (пустые `.product-shelf`); монтирует островок.
- `src/components/catalog/CatalogLineSwitcher.client.tsx` — листовой островок: `choose()` VERBATIM, deep-link + hashchange, scoped `.catalog-dk`, reduced-motion-aware scroll, cleanup, `return null`.
- `src/components/catalog/CtaSection.tsx` — RSC, `.cta` dk+mb, href по композиции.
- `src/styles/catalog.css` — обе композиции, `@layer components`, switch 768px, брейкпоинты 1280/1100/980/920.
- `public/cat-parts.png` — скопирован из handoff (недостающий ассет подкатегории «Parts»).

**Review:** 2 патча применены (reduced-motion smooth-scroll; mobile CTA href dk/mb-вариант). 2 отложено в `deferred-work.md` (desktop deep-link не доскроллллвает линию — spec-compliant, требует правки интент-контракта; a11y focus/ARIA на entrances). 9 отклонено (spec-sanctioned / прототип-верно / неприменимо / косметика). 0 intent_gap, 0 bad_spec, 0 loopback.

**Верификация:** `npx tsc --noEmit` — чисто; `npm run lint` — чисто; `npm run build` — успех, `/catalog` = статический RSC (○). Ручную пиксель-сверку с отрисованными прототипами выполнить визуально.

**Остаточные риски:** пиксель-паритет подтверждён кодом/структурой, но не отрисовкой в браузере — финальная визуальная сверка Hero/Entrances/Lines/CTA против `Catalog.html` / `Catalog Mobile.html` остаётся ручной (SM-1 брейкпоинт-чеклист). Оба отложенных пункта — не блокеры каркаса.
