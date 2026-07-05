---
title: 'Story 1.5: Мобильное шасси — drawer, scroll-lock, reveal-on-scroll'
type: 'feature'
created: '2026-07-05'
status: 'done'
baseline_revision: '8093fcde3edfc8c3d6eed07c02cf8049162a7950'
final_revision: 'fca390b6aec0c5e86fb8ce38354bf039ce613028'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** После 1.3/1.4 `(site)/layout.tsx` рендерит `<Header/>` (с ИНЕРТНЫМ 44px-бургером, `aria-expanded="false"`, без обработчика) + `<Footer/>`, но мобильная навигация не работает: бургер ничего не открывает, нет drawer/scrim, нет scroll-lock. Плюс отсутствует общий reveal-on-scroll — а на него опираются секции страниц Epic 3–6 (Cross-Story Dep). Без единого мобильного шасси пиксель-в-пиксель по Handoff (приоритет №1) и рабочий мобильный сайт недостижимы.

**Approach:** Довести существующий мобильный бургер до рабочего drawer справа + scrim со scroll-lock — целиком внутри `Header.client.tsx` (бургер уже там ⇒ общий `menuOpen`-стейт без context/плюмбинга), воспроизводя `mobile.js`/`mobile.css` дословно. Добавить отдельный листовой island `RevealOnScroll.client.tsx` (рендерит `null`), смонтированный в `layout.tsx`, который навешивает `.in` на `.reveal` через IntersectionObserver с порогами по роуту/вьюпорту + desktop-фолбэк 1.5с, уважая `prefers-reduced-motion`. Обе вещи — одна общая реализация в оболочке, монтируется один раз, переиспользуется всеми 6 роутами (AD-1).

## Boundaries & Constraints

**Always:**
- Двухкомпозиционная SSR-дисциплина: `menuOpen` стартует `false` и на сервере, и на клиенте ⇒ без hydration-mismatch. matchMedia допустим ТОЛЬКО внутри эффекта для выбора порога observer'а — никогда для выбора рендеримой разметки.
- Drawer/scrim — mobile-only: базово `display:none`, показываются только в комплемент-медиа `<768px` (как `.site-header--mb`). Бургер на desktop скрыт ⇒ drawer недостижим.
- Дословно по Handoff (AD-13): drawer `translateX(100%)→0`, `width:min(82%,360px)`, `background:#161616`, переход `.34s cubic-bezier(.4,0,.2,1)`; scrim `rgba(0,0,0,.55)`; бургер→крест (`nth-child` transforms); при `≥480px` правый край drawer выравнивается к 440px-шеллу (`right:calc(50% - var(--spacing-shell-w)/2)`).
- Reveal дословно: пороги mobile `0.1` / desktop `0.12` / About `0.25`; desktop-фолбэк форсит видимость `.reveal:not(.in)` в вьюпорте через `1500ms`; класс `.reveal`→`.in`; CSS desktop `translateY(36px)/.8s`, mobile `translateY(26px)/.7s`.
- Scroll-lock: `document.body` класс `menu-open` + `overflow:hidden`; `aria-expanded` бургера синхронно `menuOpen`. Восстановление overflow при закрытии/размонтировании.
- Переиспользовать `NAV_ITEMS` (href+label) для drawer-nav и `.btn-or` для CTA drawer-foot — без форка href/подписей.
- Токен, если канонический существует (`--spacing-shell-w`, `--color-or`, `--color-white`, `--font-display`); при конфликте нормализации с не-канон литералом прототипа побеждает литерал (AD-2 < AD-13).

**Block If:**
- Дизайн-источник (`mobile.js`/`mobile.css`/desktop-скрипты) и UX-DR6/DR17 непримиримо конфликтуют по задокументированному поведению (порог/триггер) так, что дословное воспроизведение невозможно.

**Never:**
- Никакого `useMediaQuery`/условного рендера по ширине/UA-сниффинга для ВЫБОРА композиции (hydration-mismatch, NFR-2/AD-3).
- Никаких глобальных DOM-id (`#burger`/`#scrim`/`#drawerClose`) и императивного `getElementById`/`querySelector`-тогглинга для drawer — состояние через React.
- Не портировать инлайн-копию drawer из `Catalog Mobile.html` (и любой страницы) — только общая реализация (AD-1).
- Не заводить новые имена DS-токенов; islands не фетчат (AD-1/AD-4); дефекты прототипа не «чинить» (AD-13).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Открытие | тап по бургеру, `menuOpen=false` | drawer `translateX(0)`, scrim `opacity:1/pointer-events:auto`, `body.menu-open`+`overflow:hidden`, бургер→«×», `aria-expanded=true`, drawer `aria-hidden=false`/не-`inert` | — |
| Закрытие | тап по drawer-close / scrim / любой nav-ссылке, `menuOpen=true` | drawer `translateX(100%)`, scrim скрыт, `overflow` восстановлен, бургер→линии, `aria-expanded=false` | — |
| Nav-переход | тап по nav-ссылке в drawer | клиентский переход на роут И drawer закрывается | — |
| Escape | нажат `Esc`, drawer открыт | drawer закрывается (a11y-дополнение) | — |
| Reveal-вход | `.reveal` пересёк порог (по роуту/вьюпорту) | добавлен `.in`, элемент проявляется, затем `unobserve` | нет `IntersectionObserver` ⇒ тихо пропустить |
| Desktop-фолбэк | desktop, `.reveal:not(.in)` в вьюпорте спустя 1.5с | форсированный `.in` | — |
| Reduced-motion | `prefers-reduced-motion: reduce` | `.reveal` видим мгновенно, без анимации (CSS) | — |
| Смена роута | изменился `pathname` | observer переинициализируется на `.reveal` новой страницы | — |

</intent-contract>

## Code Map

- `src/components/shell/Header.client.tsx` -- добавить `menuOpen`-стейт; в mobile-композицию (сиблингами `<header site-header--mb>`) отрендерить `.site-scrim` + `.site-drawer` (drawer-top с лого+close, `<nav>` из `NAV_ITEMS`, drawer-foot `.btn-or`→`/catalog` + `<p>`); связать бургер(open)/close/scrim/nav-link(close)/Escape; эффект scroll-lock (`body.menu-open`+`overflow`); переиспользовать `usePathname`/`isActive`; `aria-expanded`/`aria-hidden`/`inert` от `menuOpen`.
- `src/components/islands/RevealOnScroll.client.tsx` -- (новый, листовой island, `return null`) IntersectionObserver навешивает `.in` на `.reveal`; порог: `/about`→0.25, иначе mobile(matchMedia `<768`)→0.1, иначе 0.12; desktop 1.5с-фолбэк; guard `'IntersectionObserver' in window`; переинициализация при смене `pathname`; cleanup disconnect/clearTimeout.
- `src/app/(site)/layout.tsx` -- смонтировать `<RevealOnScroll/>` в `<body>` (рендерит null; один экземпляр на все роуты).
- `src/styles/shell.css` -- дописать (`@layer components`): scrim/drawer/drawer-top/-close/-nav/-foot + переход бургер-span и `body.menu-open .burger span` transforms (комплемент-медиа `<768`, база `display:none`, `@media ≥480` — сдвиг drawer к шеллу); `.reveal`/`.reveal.in` (desktop `≥768` 36px/.8s, mobile `<768` 26px/.7s) + глобальный `prefers-reduced-motion`.
- `src/components/shell/nav-config.ts` -- ПЕРЕИСПОЛЬЗУЕТСЯ (`NAV_ITEMS`), без изменений.
- `rollun_handoff/rollun-web-site/project/{mobile.js:3-31, mobile.css:54-86,143-146, Home Mobile.html:87-114, Home.html:808-809,1342-1345, About Us.html:1181-1182,1727-1750}` -- ИСТОЧНИК ИСТИНЫ (read-only).

## Tasks & Acceptance

**Execution:**
- [x] `src/styles/shell.css` -- дословный CSS drawer/scrim/бургер-анимации (комплемент-медиа `<768`, база `display:none`, `body.menu-open` тогглы, `@media ≥480` сдвиг к 440px-шеллу, drawer-top/-close/-nav Poppins-uppercase-17px/-foot, focus-visible ринги на close/nav) + `.reveal`/`.reveal.in` (desktop 36px/.8s, mobile 26px/.7s) + `prefers-reduced-motion` -- пиксель/поведение вербатим (AD-13, NFR-2).
- [x] `src/components/shell/Header.client.tsx` -- drawer+scrim в mobile-композиции, `menuOpen`-стейт, триггеры open/close (бургер/close/scrim/nav-link/Escape), эффект scroll-lock (`body.menu-open`+`overflow:hidden`, восстановление в cleanup), `aria-expanded`/`aria-hidden`/`inert` синхронно, nav из `NAV_ITEMS`, CTA `.btn-or` -- рабочий мобильный drawer (AD-1, UX-DR6).
- [x] `src/components/islands/RevealOnScroll.client.tsx` -- IntersectionObserver-island: пороги по роуту/вьюпорту, `.reveal`→`.in`+unobserve, desktop 1.5с-фолбэк, guard IO, переинициализация по `pathname`, cleanup -- общий reveal для всех страниц (AD-1, UX-DR17).
- [x] `src/app/(site)/layout.tsx` -- смонтировать `<RevealOnScroll/>` -- reveal на всех 6 роутах.
- [x] Проверить edge-кейсы матрицы (open/close по всем триггерам, scroll-lock и его восстановление, гидрация без mismatch, drawer/scrim скрыты `≥768`, порог/фолбэк/reduced-motion reveal, смена роута) в preview/DOM; авто-тест опционален.

**Acceptance Criteria:**
- Дано любой из 6 роутов на mobile, когда тап по бургеру, тогда drawer выезжает справа (`translateX(100%)→0`, `min(82%,360px)`, `#161616`) со scrim, `body.menu-open`+`overflow:hidden`, `aria-expanded=true`, бургер→«×».
- Дано открытый drawer, когда тап по drawer-close / scrim / любой nav-ссылке (или Escape), тогда drawer закрывается, скролл восстановлен, `aria-expanded=false`; nav-ссылка вдобавок выполняет клиентский переход.
- Дано mobile `≥480px`, когда открыт drawer, тогда его правый край выровнен к 440px-шеллу (`right:calc(50% - var(--spacing-shell-w)/2)`), а не к краю вьюпорта.
- Дано обе композиции в DOM, когда вьюпорт `≥768px`, тогда drawer/scrim скрыты (`display:none`); нет `useMediaQuery`/условного рендера/UA-сниффинга для выбора композиции; гидрация без mismatch.
- Дано секция с `.reveal`, когда она входит в вьюпорт, тогда получает `.in` (порог mobile `0.1` / desktop `0.12` / About `0.25`); на desktop видимость форсится через `1.5с`; при `prefers-reduced-motion` — мгновенно, без анимации.
- Дано drawer-nav, когда осмотрены href/подписи, тогда они из `NAV_ITEMS` (без форка), CTA переиспользует `.btn-or` и ведёт на `/catalog`.
- Дано одна общая реализация, когда осмотрен монтаж, тогда шасси смонтировано один раз в `layout.tsx` и переиспользуется всеми роутами (нет постраничных копий, AD-1).

## Spec Change Log

## Review Triage Log

### 2026-07-05 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 1, low 1)
- defer: 1: (high 0, medium 1, low 0)
- reject: 13: (high 0, medium 0, low 13)
- addressed_findings:
  - `[low]` `[patch]` Порог reveal вычислялся `pathname.startsWith('/about') ? 0.25 : isMobile ? 0.1 : 0.12` — на mobile `/about` брался desktop-порог 0.25 вместо прототипного 0.1 (`mobile.js` шлёт общий 0.1 на ВСЕ mobile-страницы, About включительно; 0.25 — desktop-only, About Us.html:1735). Исправлено на `isMobile ? 0.1 : isAbout ? 0.25 : 0.12` + границовое совпадение `/about` (`=== '/about' || startsWith('/about/')`), чтобы не цеплять sibling-роуты. Ре-верифицировано tsc/lint/build.
  - `[medium]` `[patch]` `menuOpen` не примирялся с жизненным циклом: (а) ресайз `<768→≥768` с открытым drawer прятал бургер/drawer/scrim (`display:none`), оставляя `overflow:hidden` → недостижимый scroll-lock; (б) browser-back с открытым drawer протекал `body.menu-open` на новую страницу (Header в персистентном layout). Добавлено: рендер-тайм сброс `menuOpen` при смене `pathname` (паттерн «reset state on prop change», без setState-in-effect — прошёл `react-hooks/set-state-in-effect`) + `matchMedia('(min-width:768px)')`-listener, закрывающий drawer при пересечении брейкпоинта. Ре-верифицировано tsc/lint/build.

## Design Notes

**Со-размещение бургер↔drawer (без context):** бургер уже живёт в `Header.client.tsx` (mobile-композиция), а весь визуал drawer/scrim/бургер-анимации в прототипе управляется одним классом `body.menu-open`. Держим `menuOpen` локальным стейтом Header'а и рендерим scrim+drawer сиблингами `<header site-header--mb>` — общий стейт без cross-component плюмбинга/контекста. Эффект синхронит `document.body.classList.toggle('menu-open')` + `body.style.overflow`; cleanup восстанавливает `overflow`. Это React-эквивалент `mobile.js:8-13` (id-based getElementById заменён на стейт).

**matchMedia в эффекте ≠ hydration-mismatch:** запрет NFR-2/AD-3 касается ВЫБОРА рендеримой композиции (даёт mismatch). `RevealOnScroll` читает `matchMedia('(max-width:767.98px)')` внутри `useEffect` только чтобы выбрать ЧИСЛО-порог observer'а — разметку это не меняет, поэтому mismatch невозможен. Прототип шлёт отдельные файлы (mobile.js порог `0.1`, Home.html desktop `0.12`, About Us.html `0.25` + фолбэк) — единый island примиряет их через matchMedia+pathname.

**Golden CSS (дословно, литералы вне токенов — AD-13):**
```css
/* burger→cross (mobile.css:55-58) — span нужен transition (в 1.3 его не было) */
.site-header--mb .burger span { transition: transform .3s ease, opacity .2s ease; }
body.menu-open .site-header--mb .burger span:nth-child(1){ transform:translateY(7px) rotate(45deg); }
body.menu-open .site-header--mb .burger span:nth-child(2){ opacity:0; }
body.menu-open .site-header--mb .burger span:nth-child(3){ transform:translateY(-7px) rotate(-45deg); }
/* scrim+drawer (mobile.css:61-70) */
.site-scrim { position:fixed; inset:0; z-index:70; background:rgba(0,0,0,.55); opacity:0; pointer-events:none; transition:opacity .3s ease; }
body.menu-open .site-scrim { opacity:1; pointer-events:auto; }
.site-drawer { position:fixed; top:0; right:0; z-index:80; transform:translateX(100%); width:min(82%,360px); height:100%;
  background:#161616; transition:transform .34s cubic-bezier(.4,0,.2,1); display:flex; flex-direction:column;
  padding:26px 26px calc(26px + env(safe-area-inset-bottom)); }
@media (min-width:480px){ .site-drawer{ right:calc(50% - var(--spacing-shell-w)/2); } }
body.menu-open .site-drawer { transform:translateX(0); }
/* reveal — desktop Home.html:808 / mobile mobile.css:144 */
@media (min-width:768px){ .reveal{opacity:0;transform:translateY(36px);transition:opacity .8s ease,transform .8s ease} .reveal.in{opacity:1;transform:none} }
@media not all and (min-width:768px){ .reveal{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease} .reveal.in{opacity:1;transform:none} }
@media (prefers-reduced-motion:reduce){ .reveal{opacity:1;transform:none;transition:none} }
```

**Desktop-фолбэк reveal (About Us.html:1745-1750):** `setTimeout(()=>{ qsa('.reveal:not(.in)').forEach(el=>{ if(el.getBoundingClientRect().top < innerHeight) el.classList.add('in') }) }, 1500)` — только desktop-ветка (mobile.js фолбэка не имеет). Guard `'IntersectionObserver' in window` (как в About Us.html:2633).

**a11y-дополнения (в духе 1.4):** на закрытом drawer — `aria-hidden` + `inert` (ссылки вне tab-order/AT-дерева, layout сохраняется ⇒ transform анимируется); Escape-закрытие. Это поведение, не пиксель — AD-13 не нарушается. Drawer-nav переиспользует `isActive` для `.active` (стрелка `opacity:0→1`).

## Verification

**Commands:**
- `npx tsc --noEmit` -- expected: типы проходят (включая `Header.client.tsx`, `RevealOnScroll.client.tsx`).
- `npm run build` -- expected: `next build` собирается; 6 роутов монтируют шасси; нет ошибок SSR/hydration.
- `npm run lint` -- expected: чисто.

**Manual checks:**
- В mobile-preview (`<768px`): бургер открывает drawer справа со scrim; scroll фона залочен; close/scrim/nav-link/Escape закрывают; nav-link ещё и переходит; бургер анимируется в «×». В `≥480px` правый край drawer — по краю 440px-шелла.
- В DOM `≥768px`: `.site-drawer`/`.site-scrim` `display:none`; `menuOpen` стартует `false` (нет mismatch в консоли).
- Reveal: временно добавить `.reveal` секции (или проверить на странице Epic 3+) — `.in` появляется при входе в вьюпорт; на desktop форс через 1.5с; при эмуляции reduced-motion — мгновенно.

## Auto Run Result

Status: done

### Что реализовано
Мобильное шасси Story 1.5: (1) рабочий nav-drawer справа + scrim со scroll-lock целиком внутри `Header.client.tsx` (`menuOpen`-стейт, общий с бургером — без context), дословно по `mobile.css:55-86`/`mobile.js`; (2) общий листовой island `RevealOnScroll.client.tsx` (рендерит `null`) в `layout.tsx` — IntersectionObserver навешивает `.in` на `.reveal` с порогами mobile 0.1 / desktop 0.12 / desktop-About 0.25 + desktop-фолбэк 1.5с, `prefers-reduced-motion` через CSS; (3) CSS drawer/scrim/бургер→крест/reveal в `shell.css` (комплемент-медиа 768px, база `display:none`, `@media ≥480` — сдвиг к 440px-шеллу). Одна реализация, смонтирована один раз, переиспользуется всеми 6 роутами (AD-1).

### Изменённые файлы
- `src/components/shell/Header.client.tsx` — `menuOpen`-стейт, drawer+scrim в mobile-композиции, триггеры open/close (бургер/close/scrim/nav-link/Escape), scroll-lock-эффект, рендер-тайм сброс на смене роута, matchMedia-примирение с брейкпоинтом 768px, `aria-expanded`/`aria-hidden`/`inert`.
- `src/components/islands/RevealOnScroll.client.tsx` — (новый) reveal-observer island: пороги по роуту/вьюпорту, `.reveal`→`.in`+unobserve, desktop 1.5с-фолбэк, guard IO, переинициализация по `pathname`, cleanup.
- `src/app/(site)/layout.tsx` — монтаж `<RevealOnScroll/>`, обновлён JSDoc.
- `src/styles/shell.css` — CSS drawer/scrim/бургер-анимации + `.reveal`/`.reveal.in` (desktop 36px/.8s, mobile 26px/.7s) + `prefers-reduced-motion`.

### Ревью
- intent_gap 0, bad_spec 0, patch 2 (medium 1, low 1), defer 1 (medium), reject 13 (low).
- Патч [low]: порядок порога reveal (mobile 0.1 должен выигрывать раньше desktop-About 0.25) + границовое совпадение `/about`.
- Патч [medium]: примирение `menuOpen` с жизненным циклом — сброс на смене роута (рендер-тайм, без setState-in-effect) + закрытие при пересечении брейкпоинта 768px (иначе недостижимый scroll-lock/протечка на след. страницу).
- Defer: полноценный focus-trap/`role=dialog`/возврат фокуса для drawer (сверх прототипа и спеки) → `deferred-work.md`.
- Rejected как noise/faithful-to-prototype/by-design: inert поддержан целевыми браузерами (как в 1.4); бургер open-only + X-анимация; `.reveal` скрыт до JS без IO-фолбэка (IO universally supported, reveal-секций пока нет); авто-`.reveal`-тэггинг заменён явным `.reveal` (UX-DR17); scrim-div (lint чист, dismiss дублируется close/Escape); `.btn`-drift (зона 1.2); прочие стиль-ниты/умозрительные кейсы без текущего контента.

### Верификация (проведена лично, после патчей)
- `npx tsc --noEmit` — PASS.
- `npm run lint` — PASS (чисто; `react-hooks/set-state-in-effect` устранён рендер-тайм паттерном).
- `npm run build` — PASS (Compiled successfully, 11 страниц сгенерированы, без SSR/hydration-ошибок).

### Follow-up review: false
Два локализованных патча (одна medium-lifecycle-правка + одна low-правка порога) + лёгкий lint-рефактор; поведение понятное, breadth/complexity малые. Независимое повторное ревью не оправдано.

### Остаточные риски
- Reveal-секций в Epic 1 нет — reveal-шасси активируется контентом Epic 3–6; latent-кейсы (секция выше `threshold×viewport` на mobile, поздний dynamic-`.reveal`) — faithful к прототипу, всплывут вместе с контентом.
- Focus-management drawer отложен (см. deferred-work) — клавиатурная навигация в открытом drawer не «заперта».
