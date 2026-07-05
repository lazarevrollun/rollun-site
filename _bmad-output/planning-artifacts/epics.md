---
stepsCompleted: [step-01-validate-prerequisites]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-rollun-site-2026-07-02/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-rollun-site-2026-07-02/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-rollun-site-2026-07-05/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-rollun-site-2026-07-05/EXPERIENCE.md
---

# Сайт Rollun - Epic Breakdown

## Overview

Этот документ — полная декомпозиция эпиков и историй для **Сайта Rollun** (Next.js 16 + Payload CMS 3.x), сводящая требования PRD, UX-дизайна (DESIGN.md + EXPERIENCE.md) и Architecture Spine в реализуемые истории. Приоритет №1 — **пиксель-в-пиксель по Handoff** (desktop+mobile, 6 страниц); единственная функция сверх визуала в Фазе 1 — рабочая Contact-форма. CMS подключается слоями в Фазах 2–4.

## Requirements Inventory

### Functional Requirements

**Фаза 1 (MVP — пиксель-фиделити + рабочая форма):**

FR-1: Единый адаптивный layout (общие шапка и футер на всех 6 страницах, desktop+mobile; mobile — burger-drawer, footer-аккордеоны, header shrink-on-scroll; активный пункт nav подсвечивается).
FR-2: Страница Home — пиксель-в-пиксель по Handoff (desktop+mobile), включая анимации (hero-bloom, count-up «Proven at scale»); product lines листаются вручную (desktop — кнопки-цифры, mobile — swipe/scroll-snap, без авто-ротации); Contact-форма по кнопке «GET IN TOUCH» (модалка). Реализует UJ-1.
FR-3: Страница About Us — пиксель-в-пиксель по Handoff; интерактивная D3-карта «US Presence» (desktop) / статический список (mobile); секция Automation (count-up, coin-tower, workforce-фигуры); KeepToShip с внешним CTA; Contact-форма (desktop — модалка, mobile — переход на /contact). Реализует UJ-1.
FR-4: Просмотр каталога по продуктовым линиям + Marquee брендов (desktop — переключение линий через entrances/hash + фильтр-бар + «Back to product lines»; mobile — стопкой статично; слайдер изображений в карточке; две авто-скролл ленты лого с паузой по hover). Реализует UJ-2.
FR-5: Quick-view товара с внешними офферами (desktop — модалка / mobile — bottom-sheet; rating, specs, fits, офферы с репрезентативными ценами; клик по офферу → внешний маркетплейс в новой вкладке; покупки на сайте нет). Реализует UJ-2.
FR-6: Витрина бренда MOTOTOU (Our Brands) — общие секции (Hero, brand card, story, products, CTA); desktop — кнопки «BECOME A PARTNER»/«SHOP MOTOTOU ON AMAZON», сертификат текстом; mobile — «Visit mototou.com» + lightbox сертификата USPTO. Реализует UJ-1.
FR-7: Страница Our Shops — магазин Houston TX 77039, «GET DIRECTIONS» (внешний Google Maps), три карточки маркетплейсов (Amazon/eBay/Walmart), таблица часов. Дефект дизайна (GET DIRECTIONS → Conroe) воспроизводится как есть.
FR-8: Страница Contact с инлайн-формой, встроенной картой и табами локаций (переключение src Google Maps iframe Houston ↔ Sheridan). Реализует UJ-1.
FR-9: Отправка заявки в CRM (успешная отправка → 2xx + подтверждение; при ошибке — понятное сообщение + сохранение введённого; валидация обязательных полей и email; заявка не хранится на сайте). Реализует UJ-1.
FR-10: Анти-спам защита формы (минимум honeypot + серверная валидация; не прошедшие отправки не уходят в CRM).
FR-11: Единый компонент формы в разных режимах подачи (один компонент + один обработчик, один endpoint; desktop Home/About — модалка; Contact — инлайн; mobile Home/About — переход на страницу Contact).

**Фазы 2–3 (CMS-роадмап):**

FR-12: Управление паспортом компании из одного места (`SiteSettings`) — правки телефона/адреса/соц-ссылки/часов отражаются во всех страницах, шапке, футере. *(Фаза 2)* Реализует UJ-3.
FR-13: Редактирование контента страниц без разработчика — размеченные слоты (картинки, тексты, товары) через админку; изменения на проде без пересборки; вёрстку изменить нельзя; роли admin/manager. *(Фаза 2–3)* Реализует UJ-3.

### NonFunctional Requirements

NFR-1 (Одна дизайн-система): единая DS для desktop и mobile — Poppins (заголовки), Roboto/Karla (текст), оранж `#EF7F1A`; токены портируются из инлайн-стилей и `mobile.css` в CSS-переменные/Tailwind theme; orphaned `_ds/…/colors_and_type.css` (Archivo/`#EA7B08`) игнорируется.
NFR-2 (Брейкпоинты и переход desktop→mobile): реальные desktop `@media` брейкпоинты (постраничные поднаборы вплоть до 1280) — часть пиксель-в-пиксель; desktop и mobile — отдельные HTML-раскладки; переход на ~768px.
NFR-3 (Внешние зависимости ассетов и детерминизм): шрифты (Poppins/Roboto/Karla/Caveat) через `next/font` self-host; D3/topojson-client/us-atlas — в бандл; скаффолдинг прототипа (react/@babel unpkg) выкинуть; лого брендов в Фазе 1 — фавиконки как в дизайне.
NFR-4 (Изображения): оптимизация через `next/image`; в Фазе 2+ — коллекция `Media` (webp, нужные размеры).
NFR-5 (Ревалидация контента): правки CMS появляются на проде через on-demand revalidation / ISR без пересборки (Фаза 2+).

### Additional Requirements

*(Технические требования из Architecture Spine, влияющие на реализацию и разбиение историй.)*

- **Стартовый скаффолд (greenfield, Epic 1 Story 1):** один процесс Next.js 16 (App Router, Turbopack, Cache Components, Node 20+) + Payload CMS 3.x (local API) + React 19 + TypeScript 5 + Tailwind CSS v4 (`@theme`), DB-адаптер Postgres. Payload-админка на `/admin`. Self-host на инфре Rollun.
- **Islands Architecture (AD-1):** страницы/секции — RSC; всякий интерактив/анимация — листовой `'use client'`-островок, получающий контент пропсами (островок не фетчит). Мобильное шасси — одна общая реализация для всех mobile-страниц (в т.ч. Catalog Mobile).
- **Единый источник DS-токенов (AD-2):** все токены в одном `@theme`-блоке (`styles/theme.css`, Tailwind v4). Поверхностные значения — scoped-переопределения тех же имён, не новые имена.
- **Две композиции desktop|mobile (AD-3):** обе SSR-рендерятся в DOM, переключение только CSS-медиа на 768px; JS-гейтинг и UA-сниффинг запрещены. На вьюпорт грузится ровно одна композиция картинок (art-direction).
- **Контент только с сервера через local API (AD-4):** RSC читают контент через Payload local API (`getPayload`); клиентского фетча контента нет.
- **Типизированные слоты: Global на страницу (AD-5):** `HomeContent`, `AboutContent`, `CatalogContent`, `BrandsContent`, `ShopsContent`, `ContactContent` + `SiteSettings` + коллекции (`Products`, `Brands`, `Shops`, `Media`, `Posts`, `Users`). Нет абстрактной `Page`, нет page-builder.
- **Граница код/контент по 4 уровням текучести (AD-6):** 🔴 живое → CMS · 🟡 правимый текст → CMS · 🟢 паспорт → `SiteSettings` · ⚫ гвоздями → код. При сомнении 🟡↔⚫ — по умолчанию ⚫.
- **Страница = чистая функция типизированного контент-объекта (AD-7):** Фаза 1 подаёт статический инстанс (`content/*`), Фазы 2–3 — тот же тип из Payload Global. Статические инстансы typecheck-аются против Payload-генерённого типа в CI.
- **Единый `ContactForm` → CRM через Server Action (AD-8):** один компонент + один серверный обработчик; submit через Server Action, server-side POST на `CRM_API_URL` (env); URL/секрет CRM браузер не видит. Нет `Submissions`, нет mailer.
- **Офферы — рантайм-деривация (AD-9):** `buildOffers` (`lib/offers.ts`) детерминированно вычисляет офферы по линии (Health → Amazon/eBay; Automotive → Amazon/eBay/Walmart) на сервере; островок получает офферы пропсами (импорт `lib/offers.ts` в островок запрещён). На `Products` с Фазы 1 зарезервированы `sku`/`externalId` (фид-шов Фазы 4).
- **Ревалидация on-demand (AD-10):** `revalidateTag` (не `revalidatePath`) из `afterChange`-хуков Payload; каждый Global — канонический тег; паспорт/shell тегируют все поверхности (mobile+desktop). Согласовано с Next 16 `cacheComponents` + `use cache` + `cacheTag`. Фаза 1 — полностью статична. *(Фаза 2+)*
- **Вендоринг внешних ассетов (AD-11):** шрифты через `next/font`; D3/topojson-client/us-atlas в бандл; react/@babel скаффолдинг прототипа About выкинуть. Исключение — marquee-лого через `google.com/s2/favicons` в Фазе 1.
- **Один процесс деплоя (AD-12):** Next.js 16 отдаёт сайт + `/admin` + local API в одном рантайме. Env: `CRM_API_URL`, DB-коннекшн, `PAYLOAD_SECRET`, revalidate-секрет.
- **Дизайн — источник истины, воспроизводим дефекты (AD-13):** матчим отрисованный прототип по каждому брейкпоинту; кросс-страничные расхождения не примиряем; известные дефекты — дословно.
- **Паспорт: `SiteSettings` — единственный владелец атома (AD-14):** каждый паспорт-атом имеет единственный дом; страницы/shell/footer ссылаются. Кросс-страничные расхождения — разные именованные атомы (`hours.store` ≠ `hours.homeCta`).
- **Роуты (Conventions):** `/` (Home), `/about`, `/catalog`, `/brands`, `/shops`, `/contact`, `/admin`.

### UX Design Requirements

*(Извлечено из DESIGN.md + EXPERIENCE.md. Каждый UX-DR — самостоятельная реализуемая единица работы.)*

UX-DR1: **Design tokens в `styles/theme.css`.** Портировать дословно все токены из `:root` каждого прототипа + `mobile.css` в Tailwind v4 `@theme`: палитра (вкл. пер-страничные `--green-deep` только Home/About/Contact, `--moto-navy` только Our Brands, `--map-land` только About), типошкала (5 семейств + роли display-hero/section-display/section-title/eyebrow/body/label), spacing на базе 4px (container 1280, gutter 28/20), radii none→full (двухполюсные), shadows, motion (easing/durations). Orphaned `_ds/` (`#EA7B08`, Archivo/Hanken/Spline) игнорируется полностью.
UX-DR2: **Шрифты self-host через `next/font`:** Poppins (300–900), Roboto (300/400/500/700), Karla (400–700), Caveat (600/700 — только About Us), Roboto Mono (SKU/спеки). Без CDN-хотлинка Google Fonts в проде.
UX-DR3: **Кнопки — 3 варианта по токенам:** primary (`.btn-or`, оранж, острые углы), ghost (прозрачная на тёмном), dark (тёмная → hover оранж). Focus-visible оранжевый ринг.
UX-DR4: **Header (shell) — визуал + поведение:** фикс 90→76px (mobile 62→56px), shrink-on-scroll (`scrolled` при scrollY>30, About >60, mobile >20), hide-on-scroll-down (desktop, y>200) / show при скролле вверх, nav подсвечивает активный роут.
UX-DR5: **Footer (shell):** desktop — раскрытые колонки (контакты, GitHub+LinkedIn, часы); mobile — аккордеоны (клик по `.facc-head` тогглит `.open`).
UX-DR6: **Nav drawer (mobile) — единая реализация `mobile.js` (AD-1):** burger→open, `#drawerClose`/`#scrim`→shut, клик по nav-ссылке→shut; `body.menu-open` + scroll-lock; `aria-expanded` синхронно; бургер анимируется в крест. Catalog Mobile сводится к этому же компоненту.
UX-DR7: **Product card (Catalog):** рендер из данных; медиа-слайдер (desktop — стрелки `.pc-arrow` + точки, `translateX` циклично, `stopPropagation`; mobile — swipe + точки); бейдж «In stock», чипы двух маркетплейсов, CTA «View details»; `role=button`/`tabindex=0`/Enter+Space открывают quick-view.
UX-DR8: **Quick-view (Catalog):** desktop — модалка (`role=dialog`, `aria-modal=true`), mobile — bottom-sheet; галерея с thumbs-переключением, спецификации, `Compatibility — fits`, рейтинг (звёзды + N ratings), офферы; закрытие backdrop/`.pd-close`/Esc; `body.overflow` scroll-lock; focus-trap.
UX-DR9: **Offer row (Quick-view):** офферы из рантайм `buildOffers` (AD-9), не поле; Health → Amazon/eBay, Automotive → Amazon/eBay/Walmart; каждый — внешняя ссылка `target=_blank rel=noopener`; дисклеймер репрезентативных цен.
UX-DR10: **Brand marquee (Catalog):** две авто-скролл ленты лого (fwd 48s / rev 34s), пауза по hover, краевая маска; Фаза 1 — фавиконки `google.com/s2/favicons`; клик по `.logo-tile` → fly-to-center спотлайт (Visit website), закрытие клик/Esc; `prefers-reduced-motion` → без авто-скролла.
UX-DR11: **Product-line switch (Home):** desktop — кнопки-цифры `.line-dots` тогглят слайд (active/prev/next), **без авторотации**, синхрон с hash; mobile — горизонтальный `scroll-snap` шелф (слайды 78%), свайп, без переключателей.
UX-DR12: **Category filter (Catalog):** desktop — два entrance + фильтр-бар, `choose('health'|'auto')` → solo-грид + `.cat-filter-name` + smooth-scroll, `.cat-back` возвращает, deep-link hash `#health`/`#automotive`; mobile — две линии стопкой без переключателей. Подкатегорийные плитки — декоративные (не фильтруют).
UX-DR13: **US Presence map (About):** desktop — D3 (`geoAlbersUsa`, viewBox 960×600), кликабельные маркеры (HQ Sheridan WY, Store Houston TX, ~30 warehouse) → поповеры, закрытие клик/Esc/`.lp-close`, репозиция на resize, live-счётчик 0→30; mobile — статический список локаций + чипы, без D3.
UX-DR14: **Coin-tower + workforce (About «Automation», desktop-only):** coin-tower (10 монет, всплывают ease-out 1800ms, первые 3 оранжевые), workforce (10 SVG-фигур, 8 гаснут со сдвигом 130ms); триггер IO threshold 0.2, один раз; `prefers-reduced-motion` → статичный итог.
UX-DR15: **Map tabs (Contact):** табы локаций `.map-tab[data-q]` переключают `#mapFrame.src` через `encodeURIComponent(data-q)`; есть и на mobile; стартовый `src` содержит дефект `53%2F27` — оставить как есть.
UX-DR16: **Certificate lightbox (Our Brands, mobile-only):** клик по `#certCard` открывает `#lightbox` (USPTO), клик закрывает, scroll-lock; Esc не подключён (as-is); desktop — без lightbox (мёртвый код не дорисовывать).
UX-DR17: **Reveal-on-scroll (все секции кроме первой):** `.reveal` → IO добавляет `.in` (threshold desktop 0.12 / mobile 0.1 / About 0.25); desktop-фолбэк: через 1.5с форсить видимость в вьюпорте.
UX-DR18: **Count-up счётчики (Home «Proven at scale», About):** старт по IO (threshold 0.4 Home / 0.25 About), cubic ease-out ~1800ms, форматирование comma/suffix, один раз; до триггера финал не показан; reduced-motion → сразу финал.
UX-DR19: **Hero-bloom (Home):** desktop — ч/б плитки, ~25% зажжены в цвет, набор обновляется каждые 3с (переход 1.6s); mobile — одна фотография bloom из плитки (MOVE 1000 / HOLD 3200 / GAP 800 мс); reduced-motion → статичный кадр.
UX-DR20: **ContactForm — режимы и состояния (AD-8):** 3 режима показа (desktop-модалка Home/About с инфо-панелью + scroll-lock; инлайн Contact с deep-link `?topic=`, smooth-scroll, `.cf-prefilled`, автофокус; mobile Home/About → навигация на `/contact`); состояния — валидация (required, email, тема из списка), success (THANK YOU ✓ → reset, модалка закрывается ~1.4с), error (понятное сообщение + сохранение введённого).
UX-DR21: **Empty / no-data состояния:** лого-фавиконка не загрузилась → `onerror` прячет `<img>` (verstka не рушится); карта не загрузилась → `.map-hint` «Map could not load»; плейсхолдеры «Photo N» в карточках до реальных фото.
UX-DR22: **Accessibility Floor (БАЗОВЫЙ, не полный WCAG AA):** семантический HTML + корректный Tab-порядок; клавиатурная навигация всех интеракций (card `role=button`/`tabindex=0`/Enter+Space); видимый оранжевый focus-ring (`outline:2px solid #EF7F1A`, offset 3px); alt-тексты (декоративные — пустой alt); ARIA на оверлеях (модалки/quick-view `role=dialog`+`aria-modal`+focus-trap+Esc; drawer `aria-expanded`; icon-кнопки `aria-label`); `prefers-reduced-motion` отключает все анимации. Ничего не меняет отрисованный пиксель (AD-13 > a11y при конфликте).
UX-DR23: **Voice / микрокопи (⚫ гвоздями):** контент англоязычный; CTA капсом глаголом («GET IN TOUCH», «ASK A QUESTION», «BECOME A PARTNER»); темы формы фикс-список и порядок (`Select a topic` · Wholesale & distribution · Partnership · Marketplace operations · Returns & support · Other); подписи полей (`Your Name`/`Your Email`/`Phone Number`/`Company`/`Question Topic`/`Your Message`); дисклеймер офферов.
UX-DR24: **Known Design Defects — воспроизвести дословно (AD-13):** (1) Our Shops GET DIRECTIONS → Conroe TX; (2) Contact стартовый map `src` `53%2F27`; (3) часы расходятся между страницами = разные атомы; (4) USPTO lightbox только mobile-DOM без Esc; (5) Home mobile теряет рейтинги маркетплейсов; (6) About `.team-tile.tr` `#ea7b07` (не нормализовать).

### FR Coverage Map

- **FR-1** (Единый адаптивный layout) → **Epic 1** — shell (header/footer/drawer) на всех 6 страницах.
- **FR-2** (Home) → **Epic 3** — главная пиксель-в-пиксель + анимации.
- **FR-3** (About Us) → **Epic 4** — About + D3-карта + Automation.
- **FR-4** (Catalog по линиям + marquee) → **Epic 5** — каркас, карточки, marquee, фильтр линий.
- **FR-5** (Quick-view + офферы) → **Epic 5** — quick-view + buildOffers.
- **FR-6** (Витрина MOTOTOU) → **Epic 6** — Our Brands.
- **FR-7** (Our Shops) → **Epic 6** — Our Shops.
- **FR-8** (Contact: инлайн-форма/карта/табы) → **Epic 6** — Contact-страница (форма из Epic 2).
- **FR-9** (Отправка заявки в CRM) → **Epic 2** — Server Action → CRM.
- **FR-10** (Анти-спам) → **Epic 2** — honeypot + серверная валидация.
- **FR-11** (Единый компонент формы, 3 режима) → **Epic 2** — ContactForm + режимы показа.
- **FR-12** (Паспорт из одного места) → **Epic 7** — `SiteSettings`. *(Фаза 2)*
- **FR-13** (Правка контента без разработчика) → **Epic 7** — Page Globals + слоты + ревалидация. *(Фаза 2–3)*

*Все 13 FR покрыты. NFR-1/2/3 → Epic 1; NFR-4/5 → Epic 7. Cross-cutting UX-DR (a11y-пол UX-DR22, reduced-motion, empty-states UX-DR21, дефекты дизайна UX-DR24) заходят в AC соответствующих историй тех страниц/компонентов, где проявляются.*

## Epic List

### Epic 1: Фундамент и глобальная оболочка
Разработчик получает рабочий каркас проекта (Next.js 16 + Payload в одном процессе) с единой дизайн-системой, а посетитель на **любой** из 6 страниц видит консистентную фирменную шапку, футер и мобильную навигацию, пиксель-в-пиксель по Handoff. Реализует FR-1.
**FRs covered:** FR-1
**NFR/Additional:** NFR-1 (одна DS), NFR-2 (брейкпоинты/768px), NFR-3 (вендоринг шрифтов/либ), AD-1/2/3/12 (Islands, `@theme`, две композиции, один процесс), UX-DR1–6.
*Enables:* всё остальное. Standalone: полностью рабочая оболочка + каркас.

### Epic 2: Contact-форма и захват лида
B2B-партнёр может оставить заявку, и она гарантированно доходит в CRM Rollun — единственная функция сверх визуала в Фазе 1. Один компонент формы, готовый к монтированию на страницах в трёх режимах показа. Реализует UJ-1 (климакс), SM-2.
**FRs covered:** FR-9, FR-10, FR-11
**Additional:** AD-8 (единый ContactForm → Server Action → CRM), UX-DR20 (состояния формы), UX-DR23 (микрокопи/темы/подписи).
*Enables:* монтирование формы на Home/About/Contact. Standalone: рабочий сквозной путь «форма → CRM».

### Epic 3: Главная страница (Home)
Оптовый партнёр открывает главную и за секунды считывает, что Rollun — живая технологичная компания: hero-мозаика оживает, счётчики «Proven at scale» досчитывают, продуктовые линии листаются, кнопка «GET IN TOUCH» открывает форму (из Epic 2). Реализует FR-2, UJ-1 (вход).
**FRs covered:** FR-2
**Additional:** AD-7 (страница = чистая функция контент-объекта), AD-13 (дефекты as-is), UX-DR11 (product-line switch), UX-DR18 (count-up), UX-DR19 (hero-bloom), UX-DR24#5 (Home mobile без рейтингов).
*Standalone:* Home пиксель-в-пиксель desktop+mobile с анимациями.

### Epic 4: О компании (About Us)
Партнёр получает доказательства масштаба: интерактивная D3-карта присутствия по США, count-up-счётчики, секция Automation (coin-tower + workforce), KeepToShip. Реализует FR-3, UJ-1 (доверие).
**FRs covered:** FR-3
**Additional:** AD-1 (островки), AD-13 (mobile без D3/модалки), UX-DR13 (US Presence map), UX-DR14 (coin-tower+workforce), UX-DR18 (count-up), UX-DR24#6 (`.team-tile` `#ea7b07` as-is).
*Standalone:* About пиксель-в-пиксель desktop+mobile.

### Epic 5: Каталог (Catalog)
Посетитель просматривает продуктовые линии, листает фото товаров, открывает quick-view и уходит на маркетплейс по офферу; внизу — marquee знакомых брендов. Самая интерактивная страница. Реализует FR-4, FR-5, UJ-2.
**FRs covered:** FR-4, FR-5
**Additional:** AD-9 (офферы — рантайм-деривация, sku/externalId reserved), AD-13, UX-DR7 (product card+slider), UX-DR8 (quick-view), UX-DR9 (offer row), UX-DR10 (brand marquee), UX-DR12 (category filter).
*Standalone:* Catalog пиксель-в-пиксель desktop+mobile со всей интерактивностью.

### Epic 6: Бренд, магазины и контакты (Our Brands / Our Shops / Contact)
Три оставшиеся страницы: витрина собственного бренда MOTOTOU (с сертификатом USPTO на mobile), физический магазин Houston TX с маркетплейс-карточками, и Contact с инлайн-формой (из Epic 2), картой и табами локаций. Реализует FR-6, FR-7, FR-8.
**FRs covered:** FR-6, FR-7, FR-8
**Additional:** AD-13/AD-14 (дефекты и атомы паспорта as-is), UX-DR15 (map tabs), UX-DR16 (cert lightbox mobile-only), UX-DR21 (empty-states), UX-DR24#1–#4 (Conroe, `53%2F27`, часы-атомы, USPTO lightbox).
*Standalone:* 3 страницы пиксель-в-пиксель desktop+mobile.

### Epic 7: CMS — паспорт компании и управляемый контент (Фаза 2–3)
Нетехнический менеджер меняет паспорт компании, картинки, тексты и товары через админку Payload без разработчика и без риска сломать вёрстку; изменения появляются на проде без пересборки. Реализует FR-12, FR-13, UJ-3, SM-3.
**FRs covered:** FR-12, FR-13
**NFR/Additional:** NFR-4 (Media/next-image), NFR-5 (ревалидация), AD-5/6/7 (Global на страницу, слоты, шов роадмапа), AD-10 (revalidateTag/afterChange), AD-14 (атомы паспорта).
*Standalone:* полный CMS-контур Фаз 2–3. *(Фаза 4 — авто-подтяг товаров из фида и Posts — вынесена за пределы этой разбивки как отдельный будущий эпик.)*
