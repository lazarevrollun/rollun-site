---
title: 'Story 6.3: Contact — инлайн-форма, карта и табы локаций'
type: 'feature'
created: '2026-07-06'
status: 'done'
baseline_revision: '9902950378ff9abc48ac2bce68d5effab4259ebd'
final_revision: '6de01f255758c6555c724f92165387840c876f34'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/rollun_handoff/rollun-web-site/project/Contact.html'
  - '{project-root}/rollun_handoff/rollun-web-site/project/Contact Mobile.html'
  - '{project-root}/docs/pixel-acceptance/checklist-contact.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-6-context.md'
warnings: ['oversized']
---

<intent-contract>

## Intent

**Problem:** Маршрут `/contact` сейчас — заглушка из Epic 2: `<main><ContactInline /></main>`, только карточка формы, без Hero и без Map-секции. Страница не собрана пиксель-в-пиксель по Handoff (`Contact.html` / `Contact Mobile.html`) и не является чистой функцией типизированного контента, как остальные страницы Фазы 1.

**Approach:** Пересобрать `/contact` как чистую функцию нового `ContactContent`: Hero (01) → инлайн `ContactInline` из Epic 2 (02, монтируется как есть) → Map-секция с табами локаций (03) → Footer (из layout). Hero и Map — по паттерну AD-3 (обе композиции `.contact-dk`/`.contact-mb` в одном DOM, переключение только CSS-медиа 768px). Табы локаций переключают `src` iframe карты через `encodeURIComponent(data-q)` — реализуются как один клиентский островок с общим React-состоянием (без `getElementById`, без дублей `id`).

## Boundaries & Constraints

**Always:**
- Пиксель-в-пиксель по отрисованному прототипу на desktop (`Contact.html`) и mobile (`Contact Mobile.html`); при конфликте формулировок и пикселя выигрывает прототип. Приёмка — `docs/pixel-acceptance/checklist-contact.md` (SM-1).
- Форма `ContactInline` (`#contactForm`) из Epic 2 монтируется **как есть, ровно один раз** — никаких новых форм/обработчиков/Server Action. Не трогать `ContactForm`, `ContactInfo`, `ContactInline`, `contact-form.ts`, `contact-info.ts`, `.cf-*`/`.contact-card` в `components.css`.
- Страница — чистая функция типизированного `ContactContent`; весь статический текст обоих прототипов дословно в одном инстансе `contactContent` (AD-7/AD-14). Никакого хардкода строк в JSX секций.
- Обе композиции SSR-рендерятся в DOM; видимую выбирает только `@media` 768px; JS-гейтинг/UA-сниффинг запрещены.
- CSS новых секций — в новом `src/styles/contact.css`, всё в `@layer components`, scope `.contact-dk`/`.contact-mb`; не переопределять `.btn`/`.reveal`/глобальные токены; `.container` определить в scope страницы (глобального нет — как в brands/shops).
- Дефект AD-13 воспроизвести дословно: стартовый `src` карты = литерал с опечаткой `q=53%2F27%20Aldine…`; клик по любому табу корректно пересобирает URL через `encodeURIComponent(data-q)`, `z=13`, `output=embed`.
- Внешние границы — реактивно: рендерить два `<iframe>` (dk+mb) без `id="mapFrame"` (дубль `id` в одном DOM — это дефект, ср. deferred-work по `#contactForm`); `src` привязан к React-состоянию.

**Block If:**
- `ContactInline`/`ContactForm` из Epic 2 отсутствует или не монтируется в инлайн-режиме без правок.
- Требуется изменить контракт формы (id/поля/Server Action), чтобы собрать страницу.

**Never:**
- Не создавать новую форму, валидацию, Server Action, endpoint; не дублировать `.cf-*`/`.contact-card` стили.
- Не чинить AD-13 (опечатку стартового `src`); не сводить атомы часов/адресов с footer/shops.
- Не тащить пер-страничные классы в глобальные стили; не добавлять тест-раннер (проект без него by design).
- Не рендерить `ContactInline` дважды (дубль `id="contactForm"`); не использовать `getElementById`/`window`-хаки для табов.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Загрузка страницы | `/contact`, desktop и mobile | Секции в порядке Hero→форма→Map; таб 0 («Shop and return center») `active`; iframe показывает стартовый `src` с опечаткой `53%2F27` (AD-13) | — |
| Клик таб 0 (Houston) | активен любой таб | `active` переходит на таб 0; `src` = `…?q=5327%20Aldine%20Mail%20Route%20Rd%2C%20Houston%2C%20TX%2077039&z=13&output=embed` | — |
| Клик таб 1 (Sheridan) | активен любой таб | `active` переходит на таб 1; `src` = `…?q=30%20N%20Gould%20St%20STE%204370%2C%20Sheridan%2C%20WY%2082801&z=13&output=embed` | — |
| Deep-link `?topic=` | `/contact?topic=Partnership` | `ContactInline` (Epic 2) сам предвыбирает топик и скроллит к форме — поведение не меняется | Мисс топика — тихий no-op (Epic 2) |

</intent-contract>

## Code Map

- `src/app/(site)/contact/page.tsx` -- ПЕРЕПИСАТЬ: чистая функция `contactContent`; `import '@/styles/contact.css'`; композит `Hero` → `.contact-section > .container > <ContactInline/>` → `MapLocations` в `<main>`. Эталон — `shops/page.tsx`.
- `src/content/contact.ts` -- НОВЫЙ: тип `ContactContent` + инстанс `contactContent` (hero eyebrow/title/intro; map eyebrow/title/`initialSrc` с опечаткой AD-13/массив `tabs`{label,addr,q}). Дословно из прототипов.
- `src/components/contact/Hero.tsx` -- НОВЫЙ RSC (01): обе композиции `.contact-dk page-hero`/`.contact-mb page-hero`, eyebrow «Get in touch»/h1 «Contact us»/intro; первая секция без `.reveal`. Эталон — `shops/Hero.tsx`.
- `src/components/contact/MapLocations.client.tsx` -- НОВЫЙ `'use client'` островок (03): держит `activeIndex` (init 0) и `src` (init `initialSrc`) в React-состоянии; рендерит обе композиции — desktop `.contact-dk map-section`(map-head + map-tabs + map-frame) и mobile `.contact-mb section paper`(section-head + wrap: map-tabs + map-frame); оба набора табов и оба iframe читают/пишут одно состояние; клик по табу `i` → `setActiveIndex(i)` + `src = build(tabs[i].q)`; `build(q)=\`https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=13&output=embed\``; iframe без `id`, с `title`/`loading="lazy"`/`referrerpolicy`; `data-q` на табах для DOM-верности; `.reveal` на корнях секций.
- `src/styles/contact.css` -- НОВЫЙ: порт `<style>` из `Contact.html` (desktop) и `mobile.css`+`Contact Mobile.html` (mobile); scope `.contact-dk`/`.contact-mb`, `@media` 768px, всё в `@layer components`. Desktop: `.page-hero`(+::before/::after/inner/eyebrow/h1/p), `.contact-dk .container`, `.contact-section`, `.map-section`/`.map-head`/`.map-tabs`/`.map-tab`(+`.active`/`.tab-label`/`.tab-addr`)/`.map-frame`+iframe; desktop-внутренний брейк 768–980px: `.contact-card{grid-template-columns:1fr}`. Mobile: `.page-hero`, `.section`/`.section.paper`/`.section-head`/`.section-eyebrow`/`.section-title`/`.wrap`, mobile-вариант `.map-tabs`/`.map-tab`/`.map-frame`.
- `src/components/contact-form/ContactInline.client.tsx` (+ `ContactForm`, `ContactInfo`, `contact-form.ts`, `contact-info.ts`) -- РЕЮЗ Epic 2, НЕ трогать.
- `src/styles/components.css` -- `.cf-*`/`.contact-card` уже здесь (Epic 2) — НЕ трогать/НЕ дублировать.
- `src/app/(site)/layout.tsx` -- Header/Footer/RevealOnScroll смонтированы здесь — переиспользовать.
- `src/components/shops/*`, `src/app/(site)/shops/page.tsx`, `src/styles/shops.css` -- ЭТАЛОН паттерна (dk/mb, content-модуль, scope css, `.reveal`).

## Tasks & Acceptance

**Execution:**
- [x] `src/content/contact.ts` -- тип `ContactContent` + инстанс `contactContent`: hero (eyebrow/title/intro) и map (eyebrow «Find us»/title «Our locations»/`initialSrc` = литерал с опечаткой `q=53%2F27…`/`tabs`: [{«Shop and return center», «5327 Aldine Mail Route Rd, Houston, TX 77039», q:«5327 Aldine Mail Route Rd, Houston, TX 77039»}, {«Only for legal purposes», «Registered Rollun LC — 30 N Gould St STE 4370, Sheridan WY 82801», q:«30 N Gould St STE 4370, Sheridan, WY 82801»}]) — единый типизированный источник (AD-7/AD-14).
- [x] `src/components/contact/Hero.tsx` -- RSC (01): обе композиции, без `.reveal`.
- [x] `src/components/contact/MapLocations.client.tsx` -- островок (03): общее React-состояние на обе композиции, табы переключают `src` через `encodeURIComponent`; стартовый `src` = `initialSrc` (AD-13), таб 0 `active`; iframe без `id`; `.reveal`.
- [x] `src/styles/contact.css` -- порт обеих композиций (scope `.contact-dk`/`.contact-mb`, `@layer components`), переключение `@media` 768px + desktop-внутренний брейк 768–980px (`.contact-card`→1 колонка); `.contact-section`/`.container` в scope страницы.
- [x] `src/app/(site)/contact/page.tsx` -- переписать: `import '@/styles/contact.css'`, отрендерить `Hero` → `.contact-section`(`.reveal`)`>.container><ContactInline/>` → `MapLocations` из `contactContent` в `<main>` в порядке Handoff; `ContactInline` — ровно один монтаж.

**Acceptance Criteria:**
- Given маршрут `/contact`, when страница загружена на desktop и mobile, then отрендерены секции в порядке Hero→форма(`ContactInline`)→Map→Footer и визуал совпадает с соответствующим прототипом (desktop `Contact.html` / mobile `Contact Mobile.html`) по чеклисту.
- Given любой вьюпорт, when открыт DOM, then обе композиции (`.contact-dk`/`.contact-mb`) Hero и Map присутствуют, видимую выбирает только `@media` 768px; `ContactInline` смонтирован ровно один раз (единственный `id="contactForm"`), Map-iframe без атрибута `id`.
- Given реализацию, when проверяется тип, then страница типизирована как чистая функция `ContactContent`, `contactContent` — статический инстанс из `content/*` (плоские сериализуемые данные, совместимо с будущим Payload Global); контент не ссылается на `contact-info.ts`/`site-contacts.ts`/`shops.ts`.
- Given загруженную страницу, when iframe отрисован до клика, then его `src` дословно равен стартовому литералу с опечаткой `q=53%2F27%20Aldine%20Mail%20Route%20Rd%2C%20Houston%2C%20TX%2077039&z=13&output=embed` (AD-13, воспроизведён, не исправлен), таб 0 несёт класс `active`.
- Given секции ниже сгиба (форма, Map), when они входят во вьюпорт, then срабатывает `.reveal` (RevealOnScroll из layout); Hero — без `.reveal`.

## Spec Change Log

_(no bad_spec loopbacks — empty)_

## Review Triage Log

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2 (low 2)
- defer: 3 (medium 1, low 2)
- reject: 10
- addressed_findings:
  - `[low]` `[patch]` **Мобильный боковой gutter карточки формы (28px) расходился с hero (22px)/map (20px)** — на мобиле `.contact-section .container` брал desktop `--spacing-gutter` (28px). Добавлен мобильный override `padding: 0 20px`, заземлённый на `.wrap` мобильного прототипа — gutters карточки формы совпадают с остальным мобильным пикселем.
  - `[low]` `[patch]` **Мобильный вертикальный padding `.contact-section` был выдуманным `40px 0`** — заменён на заземлённый `46px 0 50px` (мобильная секция формы `.section.bg`, mobile.css `.section`).
- deferred (real, not this story's problem):
  - `[medium]` **Мобильная карточка формы не бьётся с `Contact Mobile.html` посекционно** — прототип разбивает форму (`.section.bg`) и dark-инфо (`.section`, full-bleed) на две секции; переиспользуемый единый `.contact-card` (Epic 2 `ContactInline`) схлопывает их в одну карточку. Продиктовано мандатом «монтировать `ContactInline`, не пересобирать» — fidelity-долг Epic 2.
  - `[low]` **`.reveal` на скрытой композиции может застрять `opacity:0` после resize через 768px** — IntersectionObserver навешивается на обе (dk+mb) секции на mount; `display:none`-композиция никогда не пересекается. Системно для всего сайта (dk/mb + RevealOnScroll), пре-существует.
  - `[low]` **Табы локаций без tab-семантики/анонса смены карты** — plain `<button>` без `role=tab`/`aria-selected`/roving-tabindex/live-region. Дословный порт прототипа; совпадает с задокументированным паттерном проекта откладывать a11y-сверх-прототипа.
- rejected (verbatim-mandate / by-design / no present consumer):
  - Двойной монтаж iframe карты в обе композиции (dk+mb) — by-design AD-3, прецедент 6.2 (двойная загрузка `<img>`); `loading="lazy"`+`display:none` откладывает скрытый.
  - `data-q` не читается React'ом — намеренный DOM-верный атрибут по спеке, безвреден.
  - `title="Rollun location map"` — атрибут a11y, дословно из HTML-атрибута прототипа.
  - Двойной border-seam стопки мобильных табов — дословный порт desktop-правил `@media(max-width:720px)`.
  - Переиспользование одного element-descriptor iframe/tabs в двух родителях — корректный React, работает.
  - Дублирование host/params карты в `buildSrc` и `initialSrc` — неизбежно: `initialSrc` — замороженный литерал-дефект AD-13, не выводим из `q`.
  - Пустой/вырожденный `map.tabs`, дубль-`q`/дубль-ключей — латентно, текущий контент всегда 2 различных таба; нет консьюмера (CMS на роадмапе).
  - FOUC при незагрузке contact.css — системно для CSS-гейтед dk/mb всего сайта.
  - RevealOnScroll 767.98 vs CSS 768 — суб-пиксель, без последствий (ревьюер сам исключил).

## Design Notes

**Форма `ContactContent` (строки — ДОСЛОВНО из прототипов):**

```ts
export type ContactMapTab = { label: string; addr: string; q: string }
export type ContactContent = {
  hero: { eyebrow: string; title: string; intro: string }
  map: { eyebrow: string; title: string; initialSrc: string; tabs: ContactMapTab[] }
}
```

- **AD-13 (опечатка стартового src):** `initialSrc` — отдельный литерал `…?q=53%2F27%20Aldine…`, он НЕ совпадает с `tabs[0].q` (`5327 Aldine…`). На загрузке таб 0 `active`, но карта показывает опечатку, пока не кликнут таб. Клик по табу 0 «исправляет» на 5327 — это и есть поведение прототипа (desktop `Contact.html` script, mobile inline script). Не сводить `initialSrc` к `tabs[0].q`.
- **Один островок, общее состояние (не два independent).** Обе композиции карты (dk+mb) — в одном `MapLocations`, делят `activeIndex`/`src`. Так нет дублей `id="mapFrame"` и нет двух рассинхронных состояний. `id` iframe опущен намеренно: в прототипе он лишь хук для vanilla-JS `getElementById`; в React `src` привязан напрямую, а дубль `id` в одном DOM — дефект (ср. deferred-work по `#contactForm`/`GetInTouch`).
- **Композиция AD-3 (эталон — Shops/Brands):** каждая новая секция выводит `.contact-dk …` и `.contact-mb …` поддеревья; видимость — `@media` 768px. Корневые классы секций — компаундом на корне (`.contact-dk.page-hero`, `.contact-dk.map-section`, `.contact-mb.page-hero`, `.contact-mb.section.paper`), как в brands/shops.
- **Форма/инфо-панель — исключение из dk/mb:** `ContactInline` (Epic 2) — единый адаптивный `.contact-card`, схлопывается в 1 колонку `<768px` через уже существующие правила `components.css`; он монтируется один раз в общий `.contact-section` (desktop `.contact-section{padding:90px 0;background:var(--color-bg)}` + `.container`; mobile — меньший паддинг). Не перестраивать под dk/mb (двойной монтаж сломает `id`).
- **Мобильный CSS карты отсутствует в прототипе (обоснованное решение).** В `Contact Mobile.html`/`mobile.css` НЕТ правил `.map-tab`/`.map-tabs`/`.map-frame` — только мёртвый код старого SVG-дизайна (`.map-svg`/`.map-pin`/`.map-info`/`.map-hint`), который разметкой не используется. Мёртвый код НЕ портируем и `.map-hint` «Map could not load» НЕ добавляем (в отрисованном прототипе его нет — пиксель важнее формулировки эпика). Стилизацию мобильных табов/рамки берём из собственных узко-вьюпортных правил desktop-прототипа (`Contact.html` `@media(max-width:720px)`: `.map-tab{width:100%;flex:none;border снизу}`) + разумную высоту iframe (~360px) — grounded-порт, не выдумка.

## Verification

**Commands:**
- `npm run lint` -- expected: без ошибок.
- `npm run build` -- expected: strict typecheck + сборка проходят; `ContactContent`/`contactContent` типобезопасны, `/contact` компилируется как чистая функция контента (○ Static prerender).

**Manual checks:**
- `npm run preview` → http://localhost:3000/contact : сверить визуал против `Contact.html` (1280px и 900px) и `Contact Mobile.html` (~390px и ~760px, 440px-шелл) по `docs/pixel-acceptance/checklist-contact.md`.
- В DOM подтвердить: обе композиции Hero+Map присутствуют; `ContactInline` — один монтаж (единственный `#contactForm`); iframe без `id`; стартовый `src` = опечатка `53%2F27` (AD-13); клик таб 0 → `q=5327 Aldine…`, клик таб 1 → `q=30 N Gould…Sheridan`, `active` мигрирует; deep-link `?topic=Partnership` предвыбирает топик и скроллит к форме (Epic 2).

## Auto Run Result

Status: done

### Summary
Страница Contact (`/contact`) пересобрана как чистая функция типизированного `ContactContent`: заглушка Epic 2 (`<main><ContactInline /></main>`) заменена композитом в порядке Handoff — Hero (01) → инлайн `ContactInline` из Epic 2 (02, смонтирован ровно один раз) → Map-секция с табами локаций (03) → Footer (из layout). Hero и Map — по паттерну AD-3: обе композиции (`.contact-dk` / `.contact-mb`) SSR-рендерятся в один DOM, видимую выбирает только CSS-медиа на 768px. Map — один клиентский островок с общим React-состоянием (`activeIndex`/`src`) на обе композиции: клик по табу пересобирает `src` iframe через `encodeURIComponent(q)` (`z=13`, `output=embed`); iframe без `id` (дубль `id` в одном DOM исключён). Дефект AD-13 воспроизведён дословно: стартовый `src` карты — литерал с опечаткой `q=53%2F27…`, не совпадающий с `tabs[0].q` (`5327…`); таб 0 `active` на загрузке, «исправляется» только по клику. Форма/Server Action не трогались — переиспользован Epic 2 `ContactInline`. Весь текст обоих прототипов — в одном инстансе `contactContent` (AD-7/AD-14).

### Files changed
- `src/app/(site)/contact/page.tsx` — переписан: чистая функция `contactContent`, композит Hero → `.contact-section > .container > <ContactInline/>` → `MapLocations`, импорт `contact.css`.
- `src/content/contact.ts` (new) — тип `ContactContent` + инстанс `contactContent` (hero + map: eyebrow/title/`initialSrc` с опечаткой AD-13/`tabs`).
- `src/components/contact/Hero.tsx` (new) — RSC (01), обе композиции `.contact-dk`/`.contact-mb page-hero`, без `.reveal`.
- `src/components/contact/MapLocations.client.tsx` (new) — островок (03): общее состояние на обе композиции, табы+iframe без `id`, `.reveal`.
- `src/styles/contact.css` (new) — порт обеих композиций (scope `.contact-dk`/`.contact-mb`, `@layer components`), переключение медиа 768px + desktop-внутренний брейк 768–980px (`.contact-card`→1 колонка); мобильные map-табы/рамка заземлены на desktop `@media(max-width:720px)`; мобильный gutter/padding карточки формы выровнены (review-patch).

### Review findings
- Patches applied: 2 (оба low — мобильный gutter карточки формы 28→20px и вертикальный padding 40→46/50px, заземлены на мобильный прототип). Deferred: 3 (mobile-fidelity карточки формы vs `ContactInline`-reuse — medium; `.reveal`-на-скрытой-композиции после resize — low, системно; a11y tab-семантика табов — low). Intent gaps: 0. Bad spec: 0. Rejected: 10 (verbatim-мандат AD-13/AD-3, by-design, латентно-без-консьюмера).
- `followup_review_recommended: false` — правки ревью только 2 локальных low-severity CSS-патча.

### Verification
- `npm run lint` → PASS (без ошибок).
- `npm run build` → PASS (strict typecheck + сборка; `/contact` = ○ Static prerender).

### Residual risks
- Мобильная карточка формы (единый `ContactInline`) не бьётся посекционно с `Contact Mobile.html` — принятый долг Epic 2 (deferred).
- Ручная пиксель-сверка по `docs/pixel-acceptance/checklist-contact.md` (1280/900/~390/~760px) ещё не отмечена — визуальная приёмка вне unattended-прохода.
