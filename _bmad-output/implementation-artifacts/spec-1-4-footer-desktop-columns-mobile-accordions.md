---
title: 'Story 1.4: Футер (Footer) — desktop-колонки и mobile-аккордеоны'
type: 'feature'
created: '2026-07-05'
status: 'done'
baseline_revision: 'cef69d8f0e0a0f9c822e710661e2d5a0fbe9bd70'
final_revision: 'f96fac005afa199179ba3f4ab57ce37bdb1d59a8'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** После 1.3 `(site)/layout.tsx` рендерит `<Header/>` + `{children}`, но футера нет ни на одной из 6 страниц — оболочка безнога. Без общего footer из `components/shell` пиксель-в-пиксель по Handoff (приоритет №1) недостижим, и не подготовлен шов паспорт-атомов к `SiteSettings` (Epic 7, AD-14).

**Approach:** Смонтировать в общий `(site)/layout.tsx` под `{children}` единый Footer из `components/shell`, воспроизводящий Handoff-футер дословно двумя SSR-композициями в одном DOM, переключаемыми ТОЛЬКО CSS-медиа на 768px: desktop — раскрытые грид-колонки (RSC, статика), mobile — колонки-аккордеоны (листовой client-островок тоглит `.open`). Паспорт-атомы (телефоны/email/адреса/legal-ссылки/blurb) вынести в единый типизированный модуль контента — один дом на атом (AD-14), шов к `SiteSettings` без изменения разметки/пикселя.

## Boundaries & Constraints

**Always:**
- Один Footer из `src/components/shell`, смонтированный в `(site)/layout.tsx` ПОД `{children}` → присутствует на всех 6 роутах.
- **Две отдельные композиции desktop|mobile, обе SSR-рендерятся в DOM; переключение ТОЛЬКО CSS-медиа на 768px** (desktop `@media (min-width:768px)`, mobile комплемент `@media not all and (min-width:768px)` — ровно одна видима при любой ширине, как в 1.3). JS-гейтинг по ширине / UA-сниффинг ЗАПРЕЩЕНЫ (AD-3, NFR-2). Классы двух `.site-footer` разведены scope/суффиксом (`--dk`/`--mb`, как header), чтобы правила из двух прототип-файлов не коллизировали.
- **Desktop (дословно из `Home.html`):** `.footer-grid` = 5 колонок `grid-template-columns:3fr 2fr 2fr 3fr 2fr; gap:40px; margin-bottom:60px`, в `.container`. Колонки по порядку: (1) лого 28px `filter:brightness(1.2)` + blurb-`<p>`; (2) `Quick Links` + 6 nav-ссылок; (3) `Contacts` + 2 телефона с суб-подписями + email; (4) `Locations` + 2 адреса с sublabel; (5) `Legal` + Privacy Policy / Terms & Conditions (`href="#"`). Ниже — `.footer-bottom` `Rollun © 2026`. bg `#0e0e0e`, `padding:80px 0 30px`. Desktop-внутренний брейкпоинт `@media (max-width:1100px){ .footer-grid{grid-template-columns:1fr 1fr} }` портируется (реален в диапазоне 768–1100).
- **Mobile (дословно из `Home Mobile.html`/`mobile.css`):** `.site-footer` без `.container`: лого 26px + `<p class="intro">` + РОВНО 3 аккордеона `.facc` (`Quick Links`, `Contacts`, `Locations`) + `.footer-bottom`. Каждый `.facc` = `<button class="facc-head" type="button">Title <svg плюс-иконка/></button>` + `.facc-body`>`.facc-inner`. bg `#0e0e0e`, `padding:44px 20px calc(30px + env(safe-area-inset-bottom))`.
- **Аккордеон-поведение (UX-DR5):** клик по `.facc-head` тоглит `.open` на родителе `.facc`; `.facc-body{max-height:0;overflow:hidden;transition:max-height .32s ease}` → `.facc.open .facc-body{max-height:420px}`; плюс-иконка `.facc-head svg{18×18;color:var(--color-or);transition:transform .28s}` → `.facc.open … svg{transform:rotate(45deg)}`. Все аккордеоны стартуют ЗАКРЫТЫМИ (server и client рендерят одинаково — без hydration-mismatch). Тоггл — client-островок с `useState`; `aria-expanded` на кнопке синхронизирован с `.open`.
- **Nav-переиспользование:** колонка/аккордеон `Quick Links` берёт href+порядок из существующего `NAV_ITEMS` (`nav-config.ts`) как единственного источника; отображаемые подписи — Title-Case прототипа (`Home`, `About Us`, `Catalog`, `Our Shops`, `Our Brands`, `Contact Us`). НЕ форкать второй список href.
- **Паспорт-атомы в едином типизированном модуле** (`src/content/…`): телефоны `[{number,label}]` (`(307) 920-0149`/only for legal purposes, `(832) 461-2525`/shop and return center), `info@rollun.com` (`mailto:`), адреса `[{sublabel,lines,accent?}]` (Rollun LC / 30 N Gould St STE 4370 / Sheridan, WY 82801 — sublabel «Only for legal purposes»; 5327 Aldine Mail Route Rd / Houston, TX 77039 — sublabel «Shop & return center», оранжевая), legal-ссылки, company-blurb, copyright. Обе композиции читают ИЗ ОДНОГО модуля (один дом на атом — AD-14; шов к `SiteSettings`).
- **Токены vs литералы (AD-13 > AD-2):** существующее как токен пишется токеном — `var(--color-or)` (оранж hover/иконка/orange-sublabel; == прототип `var(--or)`/`rgb(239,127,26)`), `var(--font-display)` (h4/facc-head 'Poppins'), body-текст наследует `--font-body`. Литералы прототипа без токена — дословно: `#0e0e0e`, все `rgba(255,255,255,.72/.62/.6/.5/.4/.09/.08)`, `13/13.5/12.5/12px`, `.18em/.14em`, `brightness(1.2)`, `max-height:420px`, `.28s/.32s`, `1fr 1fr`.
- Логотип — тот же self-host `public/rollun-logo.png` (уже вендорён 1.3); footer-высота 28px (desktop) / 26px (mobile), `filter:brightness(1.2)`.
- Footer-CSS — в `src/styles/shell.css` (существующий), `@layer components`, дописать после header-правил.

**Block If:**
- Прототип требует значение, которого нет ни как токен, ни как воспроизводимый литерал, и выбор требует решения владельца дизайна (при данном Handoff — не ожидается).

**Never:**
- НЕ примирять desktop↔mobile: mobile НЕ содержит колонку `Legal` и company-blurb-колонку — это ЗАКОННОЕ расхождение композиций (AD-3), воспроизводится как есть, не «чинится».
- НЕ добавлять GitHub/LinkedIn-соц и колонку «часы» — их НЕТ в прототип-футере; сводка UX-DR5 (эпик-контекст) в этой части неточна, побеждает прототип (AD-13 > эпик-сводка). Никаких выдуманных атомов.
- НЕ трогать header (1.3), drawer/scroll-lock/`body.menu-open`/reveal-on-scroll (1.5), контент страниц, реальную интеграцию `SiteSettings` (Epic 7 — только шов).
- НЕ вводить JS-гейтинг/медиа-хуки/UA-сниффинг; различия композиций — только CSS-медиа.
- НЕ подключать orphaned `_ds/…/colors_and_type.css`; не хотлинкать шрифты/ассеты с CDN (NFR-3).
- НЕ трогать `<html lang>` (deferred-item из 1.2).
- НЕ делать десктоп-футер (статику) client-компонентом — RSC; клиентский только листовой аккордеон-островок (AD-1).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Desktop покой | ширина ≥768 | `.footer-grid` 5 колонок (3fr 2fr 2fr 3fr 2fr), bg `#0e0e0e`, лого 28px, `.footer-bottom` `Rollun © 2026` | — |
| Desktop сужение | 768 ≤ ширина ≤1100 | `.footer-grid` → `1fr 1fr` (внутренний брейкпоинт) | — |
| Mobile покой | ширина <768 | лого 26px + `.intro` + 3 закрытых `.facc` + `.footer-bottom`; НЕТ колонки Legal | — |
| Аккордеон-тап открыть | клик по закрытому `.facc-head` | родитель +`.open` → body `max-height:420px`, иконка `rotate(45deg)`, `aria-expanded="true"` | — |
| Аккордеон-тап закрыть | клик по открытому `.facc-head` | `.open` снят → body `max-height:0`, иконка 0deg, `aria-expanded="false"` | — |
| Ресайз через 768px | пересечение брейкпоинта | CSS меняет видимую композицию; JS не ремоунтит; hydration-mismatch отсутствует | — |
| Гидрация | первый рендер обеих композиций | server и client: все аккордеоны закрыты — разметка совпадает | нет mismatch |
| Nav-ссылки футера | клик по Quick Links | ведут на те же 6 роутов, что header (`NAV_ITEMS` hrefs), через `next/link` | — |

</intent-contract>

## Code Map

- `src/app/(site)/layout.tsx` -- смонтировать `<Footer/>` ПОД `{children}` (перед `</body>`). Импорты CSS не меняются (`shell.css` уже подключён).
- `src/components/shell/Footer.tsx` -- (новый, RSC) обе композиции в одном DOM: desktop 5-колоночный грид + mobile (лого/intro/3 аккордеона/bottom). Читает `NAV_ITEMS` и модуль паспорт-атомов; статика — server. Mobile-аккордеоны рендерятся через island с RSC-контентом в `children`.
- `src/components/shell/FooterAccordion.client.tsx` -- (новый, листовой island) `'use client'`, `useState(open)`, рендерит `.facc`/`.facc-head`(+svg)/`.facc-body`/`.facc-inner`; тоглит `.open`, синхронит `aria-expanded`; контент приходит `children` (островок не фетчит — AD-1/AD-4).
- `src/content/site-contacts.ts` -- (новый) типизированные паспорт-атомы (телефоны, email, адреса, legal-ссылки, blurb, copyright) — единственный дом атома, шов к `SiteSettings` (AD-14, Epic 7).
- `src/components/shell/nav-config.ts` -- ПЕРЕИСПОЛЬЗУЕТСЯ (`NAV_ITEMS`) для Quick Links; НЕ дублировать href.
- `src/styles/shell.css` -- дописать footer-CSS обеих композиций (`@layer components`), scope `--dk`/`--mb`, комплемент-медиа 768px, focus-visible ринги.
- `rollun_handoff/rollun-web-site/project/{Home.html,Home Mobile.html,mobile.css,mobile.js}` -- ИСТОЧНИК ИСТИНЫ (read-only): desktop `Home.html:772-826,1279-1324`; mobile markup `Home Mobile.html:243-275`; mobile CSS `mobile.css:126-141`; toggle JS `mobile.js:19-22`.

## Tasks & Acceptance

**Execution:**
- [x] `src/content/site-contacts.ts` -- экспортировать типизированные паспорт-атомы (телефоны с подписями, email, адреса с sublabel/accent, legal-ссылки, blurb, copyright) -- единый дом атома, шов к `SiteSettings` (AD-14).
- [x] `src/components/shell/FooterAccordion.client.tsx` -- листовой island: тоггл `.open` + `aria-expanded`, разметка `.facc`/`.facc-head`(+плюс-svg)/`.facc-body`/`.facc-inner`, контент через `children` -- интерактив аккордеона (AD-1).
- [x] `src/components/shell/Footer.tsx` -- RSC: desktop 5-колоночный грид (blurb/Quick Links/Contacts/Locations/Legal + bottom) и mobile (лого/intro/3× `FooterAccordion`/bottom) в одном DOM; данные из `NAV_ITEMS` + `site-contacts` -- воспроизведение Handoff-футера (AD-3, AD-13).
- [x] `src/styles/shell.css` -- дословный footer-CSS обеих композиций (грид/цвета/типографика/аккордеон max-height+иконка/footer-bottom), scope `--dk`/`--mb`, комплемент-медиа 768px, desktop-брейкпоинт 1100px→`1fr 1fr`, focus-visible ринги на `.facc-head`/ссылках -- пиксель-в-пиксель (AD-13, NFR-2).
- [x] `src/app/(site)/layout.tsx` -- смонтировать `<Footer/>` под `{children}` -- footer на всех 6 роутах.
- [x] Проверить edge-кейсы матрицы (тоггл-аккордеона, гидрация-без-mismatch, комплемент-медиа 768px, отсутствие Legal в mobile, отсутствие CDN/UA-сниффинга) в preview/DOM; авто-тест опционален.

**Acceptance Criteria:**
- Дано любой из 6 роутов, когда он загружен, тогда снизу общий Footer из одного `components/shell`-компонента, пиксель-в-пиксель по Handoff на desktop и mobile.
- Дано desktop, когда осмотрен футер, тогда 5 грид-колонок (blurb / Quick Links / Contacts / Locations / Legal), bg `#0e0e0e`, лого 28px, `.footer-bottom` `Rollun © 2026`; при 768–1100px грид → `1fr 1fr`.
- Дано mobile, когда осмотрен футер, тогда лого 26px + intro + 3 аккордеона (Quick Links/Contacts/Locations, БЕЗ Legal), все закрыты; клик по `.facc-head` тоглит `.open` (body 0↔420px, иконка 0↔45°, `aria-expanded` синхронно).
- Дано обе композиции, когда осмотрен DOM, тогда desktop И mobile SSR-отрендерены, переключение — только CSS-медиа на 768px; нет `useMediaQuery`/условного рендера по ширине/UA-сниффинга (AD-3); гидрация без mismatch.
- Дано паспорт-атомы, когда осмотрен код, тогда телефоны/email/адреса/legal/blurb живут в одном типизированном модуле, читаемом обеими композициями (один дом на атом — AD-14).
- Дано Quick Links, когда осмотрены href, тогда они берутся из `NAV_ITEMS` (без форка) и ведут на те же 6 роутов, что header.

## Spec Change Log

## Review Triage Log

### 2026-07-05 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 1, low 0)
- defer: 1: (high 0, medium 0, low 1)
- reject: 9: (high 0, medium 0, low 9)
- addressed_findings:
  - `[medium]` `[patch]` Аккордеон был полу-раскрытым disclosure: добавлен `aria-expanded`, но закрытая `.facc-body` (`max-height:0;overflow:hidden`) оставляла ссылки в tab-order и a11y-дереве, не было `aria-controls`↔`id`, декоративная `+`-svg без `aria-hidden`. Достроено: `useId()`→`aria-controls`+`id` (SSR-safe), `inert={!open}` на закрытой панели (в layout остаётся → max-height анимируется, но фокус/AT исключены), `aria-hidden="true" focusable="false"` на svg. Ноль пиксельного/поведенческого изменения; ре-верифицировано tsc/lint/build + grep SSR (3×`aria-controls`/`inert`/`aria-hidden`).
- deferred (новая запись в `deferred-work.md`, NEW-only):
  - `[low]` `[defer]` Дословный `max-height:420px` клэмп открытого аккордеона (AD-13) обрежет контент, если панель вырастет (текст-зум, i18n, редактируемые `SiteSettings`-данные Epic 7); сейчас faithful и под лимитом — при переходе на динамический контент заменить на `grid-template-rows:0fr↔1fr` или scrollHeight.
- rejected (шум / вне scope / faithful-to-prototype / by-design):
  - `.facc:last-of-type` не матчит последний аккордеон (после него trailing `.footer-bottom`-div) — ИДЕНТИЧНО в прототипе (та же DOM-структура + тот же селектор в `mobile.css:130`); border-bottom последнего аккордеона не рисуется И в источнике истины. «Фикс» (`.facc + :not(.facc)`) дал бы бордер, которого НЕТ в прототипе → пиксель-девиация (AD-13). Воспроизведено дословно.
  - `titleCase` выводит подписи Quick Links из uppercase `NAV_ITEMS` — для всех 6 текущих подписей даёт точные строки прототипа (Home/About Us/Catalog/Our Shops/Our Brands/Contact Us); nav — фиксированный контент, не пользовательский ввод; AD-14-шов относится к контакт-атомам, не к nav.
  - `Locations` оборачивает адрес в `<div>` (нет в прототип-DOM) — НОЛЬ визуального эффекта (Tailwind preflight обнуляет margin `<p>`; sublabel `margin-top:12px` даёт тот же 12px-зазор с/без обёртки); эпик матчит ВИЗУАЛ, а не DOM (контекст, стр.20).
  - Content-as-key (`addr.lines[0]`/`phone.number`/`line`) — уникальны для текущих данных; дубли-коллизия недостижима сейчас.
  - Двойной запрос лого + дубль footer-DOM — ядро предписанной двухкомпозиционной SSR (AD-3), тот же trade-off принят в 1.3; один URL → HTTP-кэш дедуплицирует сеть.
  - `:focus-visible` оранжевые ринги (нет в прототипе) — санкционированная DS-конвенция 1.2, невидимы в покое → ноль пикселя (как принято в 1.3).
  - Legal-ссылки `href="#"` — дословные Phase-1 плейсхолдеры прототипа (AD-13); реальные роуты Privacy/Terms — продуктовая задача будущего.
  - «Мёртвый» базовый класс `.site-footer` (правила только под `--dk/--mb`) — зеркалит header (`.site-header` база + модификаторы); интеграционный хук, безвреден.
  - Два `contentinfo`-landmark в исходнике — ровно один в a11y-дереве при любом вьюпорте (второй `display:none` исключён); реальному AT-пользователю дубля нет (та же схема, что у двух `<header>` в 1.3).

## Design Notes

**Двухкомпозиционная SSR-архитектура (AD-3):** как в 1.3 (`.site-header--dk/--mb`) — оба `.site-footer` в DOM, CSS-медиа скрывает нерелевантный; классы разведены scope/суффиксом, чтобы прототип-правила `.site-footer`/`.facc` из `Home.html` и `mobile.css` не конфликтовали. Комплемент-медиа (`min-width:768px` ↔ `not all and (min-width:768px)`) — без дыры на дробной ширине (урок ревью 1.3).

**RSC + листовой island (AD-1):** в отличие от header (весь client из-за `usePathname`), desktop-футер полностью статичен → `Footer.tsx` — RSC. Интерактив только у mobile-аккордеона → `FooterAccordion.client.tsx` получает server-рендеренный контент в `children` (React-композиция: island управляет только классом `.open`/`aria-expanded`, НЕ фетчит).

**Golden CSS (дословно; литералы вне токенов — AD-13):**
```css
/* desktop (Home.html:772-826) */
.site-footer { background:#0e0e0e; color:#fff; padding:80px 0 30px; }
.footer-grid { display:grid; grid-template-columns:3fr 2fr 2fr 3fr 2fr; gap:40px; margin-bottom:60px; }
.site-footer .logo img { height:28px; filter:brightness(1.2); }
.site-footer h4 { color:#fff; font-family:var(--font-display); font-size:13px; font-weight:600;
  letter-spacing:.18em; text-transform:uppercase; margin:22px 0; }
.site-footer a { color:rgba(255,255,255,.72); } .site-footer a:hover { color:var(--color-or); }
.site-footer .col p { line-height:1.7; color:rgba(255,255,255,.6); font-size:13.5px; }
.site-footer .col .sublabel { color:#fff; font-weight:500; margin:12px 0 4px; font-size:13px; }
.footer-bottom { text-align:center; padding-top:28px; border-top:1px solid rgba(255,255,255,.08);
  font-size:13px; color:rgba(255,255,255,.5); }
@media (max-width:1100px){ .footer-grid{ grid-template-columns:1fr 1fr; } }
/* mobile (mobile.css:126-141) */
.site-footer { padding:44px 20px calc(30px + env(safe-area-inset-bottom)); }
.site-footer .logo img { height:26px; }
.site-footer .intro { line-height:1.7; color:rgba(255,255,255,.6); font-size:13.5px; margin:18px 0 8px; }
.facc { border-top:1px solid rgba(255,255,255,.09); } .facc:last-of-type{ border-bottom:1px solid rgba(255,255,255,.09); }
.facc-head { width:100%; background:transparent; border:0; cursor:pointer; display:flex; align-items:center;
  justify-content:space-between; padding:16px 0; color:#fff; font-family:var(--font-display);
  font-size:13px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; }
.facc-head svg { width:18px; height:18px; color:var(--color-or); transition:transform .28s ease; }
.facc.open .facc-head svg { transform:rotate(45deg); }
.facc-body { max-height:0; overflow:hidden; transition:max-height .32s ease; }
.facc.open .facc-body { max-height:420px; }
.facc-inner { padding:2px 0 18px; }
.facc .sublabel { color:#fff; font-weight:500; margin:12px 0 3px; font-size:12.5px; }
.footer-bottom { text-align:center; padding-top:26px; font-size:12.5px; color:rgba(255,255,255,.5); } /* mobile: без border-top */
```

**Плюс-иконка аккордеона:** inline `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>` (крест «+», через `currentColor`=`var(--color-or)`); `rotate(45deg)` при `.open` → «×».

**Прим.:** `#0e0e0e` — отдельный литерал футер-bg (≠ header `#141414` ≠ токен `--color-dark` `#1a1a1a`), воспроизводится дословно. Оранжевый sublabel адреса (desktop inline `rgb(239,127,26)` / mobile `var(--or)`) → `var(--color-or)` (== `#EF7F1A`). Quick Links: подписи Title-Case прототипа, href/порядок из `NAV_ITEMS`. focus-visible ринги на `.facc-head`/ссылках — DS-конвенция 1.2 (невидимы в покое → пиксель не затронут).

## Verification

**Commands:**
- `npx tsc --noEmit` -- expected: типы проходят (включая `Footer.tsx`, `FooterAccordion.client.tsx`, `site-contacts.ts`).
- `npm run build` -- expected: `next build` собирается; 6 роутов рендерят footer.
- `npm run lint` -- expected: чисто.
- `grep -rniE "usemediaquery|navigator.useragent|user-agent|fonts.googleapis|fonts.gstatic|colors_and_type" src/` -- expected: пусто.

**Manual checks (if no CLI):**
- `npm run dev`, открыть любой роут: снизу desktop-футер 5 колонок; сузить <768px — mobile-футер с 3 закрытыми аккордеонами (без Legal), клик по заголовку раскрывает/сворачивает (иконка `+`→`×`).
- В DOM обе `.site-footer`-композиции присутствуют одновременно; аккордеоны стартуют закрытыми (нет hydration-warning в консоли).
- Паспорт-атомы читаются из `src/content/site-contacts.ts` (grep); нет внешних CDN-запросов за шрифты/лого.

## Auto Run Result

Status: done

### Что реализовано
Фирменный футер на всех 6 роутах, смонтирован в `(site)/layout.tsx` под `{children}`. Две SSR-композиции в одном DOM, переключаются ТОЛЬКО CSS-медиа на 768px (комплемент `min-width:768px` ↔ `not all and (min-width:768px)` — ровно одна видима при любой ширине; JS-гейтинга/UA-сниффинга нет, AD-3). **Desktop** (`.site-footer--dk`, RSC): `.container`→`.footer-grid` 5 колонок `3fr 2fr 2fr 3fr 2fr` (лого 28px + blurb / Quick Links / Contacts / Locations / Legal) + `.footer-bottom` `Rollun © 2026`; bg `#0e0e0e`; внутренний брейкпоинт 1100px→`1fr 1fr`. **Mobile** (`.site-footer--mb`): лого 26px + `.intro` (короткий вариант) + РОВНО 3 аккордеона (Quick Links/Contacts/Locations, БЕЗ Legal — законное расхождение композиций AD-3) + `.footer-bottom`; аккордеон — листовой island `FooterAccordion.client.tsx` (`useState`, тоггл `.open`, body `max-height 0↔420px`, иконка `+`→`×` `rotate(45deg)`), стартует закрытым (гидрация без mismatch). Паспорт-атомы (телефоны/email/адреса/legal/blurb) — в едином типизированном `src/content/site-contacts.ts` (один дом на атом, шов к `SiteSettings`; desktop-blurb и mobile-intro — два разных именованных атома по AD-14, каждый faithful своему прототипу). Quick Links переиспользуют `NAV_ITEMS` (href+порядок), подписи — Title-Case прототипа. Токены где есть (`--color-or`, `--font-display`), иначе прототип-литералы дословно (`#0e0e0e`, все `rgba(255,255,255,…)`, размеры/spacing/motion — AD-13).

### Изменённые файлы
- `src/content/site-contacts.ts` (новый) — типизированные паспорт-атомы; `COMPANY_BLURB` (desktop) + `COMPANY_INTRO` (mobile) как два атома.
- `src/components/shell/FooterAccordion.client.tsx` (новый) — листовой island аккордеона: тоггл `.open`, `aria-expanded`/`aria-controls`(`useId`), `inert` на закрытой панели, `aria-hidden` svg.
- `src/components/shell/Footer.tsx` (новый, RSC) — обе композиции в одном DOM; данные из `NAV_ITEMS` + `site-contacts`; общие хелперы `QuickLinks`/`Contacts`/`Locations`.
- `src/styles/shell.css` — дописан footer-CSS обеих композиций (`@layer components`, scope `--dk`/`--mb`, комплемент-медиа 768px, 1100px-брейк, focus-visible ринги).
- `src/app/(site)/layout.tsx` — импорт + монтаж `<Footer/>` под `{children}`.

### Ревью
- **Патчей: 1** (medium): достроен полу-раскрытый disclosure аккордеона — `aria-controls`+`id` (`useId`, SSR-safe), `inert={!open}` на закрытой панели (max-height-анимация сохранена, но фокус/AT исключены), `aria-hidden`/`focusable=false` на декоративной svg. Ноль пиксельного/поведенческого изменения.
- **Отложено: 1** (low): дословный `max-height:420px` клэмп обрежет контент при росте (зум/i18n/`SiteSettings` Epic 7) — вынесено в `deferred-work.md`.
- **Отклонено: 9** (low): `.facc:last-of-type` не рисует бордер последнего аккордеона — ИДЕНТИЧНО прототипу (faithful, AD-13); `titleCase` корректен для всех 6 подписей; `Locations`-обёртка `<div>` — ноль визуала (эпик матчит визуал, не DOM); content-keys уникальны сейчас; дубль лого/DOM — ядро AD-3 (как 1.3); focus-visible ринги — DS-конвенция 1.2; `href="#"` legal — faithful плейсхолдеры; базовый `.site-footer` — зеркалит header; два `contentinfo` — один в a11y-дереве при любом вьюпорте. intent_gap 0, bad_spec 0 (лупбэка нет).

### Верификация (проведена лично, после патча)
- `npx tsc --noEmit` → PASS; `npm run lint` → PASS (чисто); `npm run build` → PASS (11/11 страниц, все 6 site-роутов рендерят footer).
- Grep SSR (`about.html`): обе композиции `site-footer--dk`+`site-footer--mb` присутствуют; 3× `facc-head`; desktop blurb длинный (`our own sales channels`), mobile intro короткий (`health products.`); 3× `aria-controls`/`inert`/`aria-hidden` на закрытых панелях.
- `grep` по `src/` (useMediaQuery/UA/CDN/`colors_and_type`) → пусто.

### Follow-up review: false
Финальный проход внёс один локализованный medium-патч a11y (аккордеон-island), нулевой по пикселю/поведению, подтверждённый билдом и grep SSR. Недостаточно для независимого повторного ревью.

### Остаточные риски
- Визуальная пиксель-приёмка на реальных брейкпоинтах — формально Story 1.6 (SM-1 чеклист + preview); здесь проверено логикой/билдом/SSR-grep, не визуальным диффом.
- `max-height:420px` клэмп аккордеона — faithful сейчас, риск обрезки при динамическом/зумленном контенте (отложено, Epic 7).
- `<html lang="ru">` при EN-контенте — остаётся (deferred-item из 1.2, вне scope 1.4).
- Legal-ссылки `href="#"` — плейсхолдеры прототипа до появления реальных Privacy/Terms-роутов.
