# Epic 5 Context: Каталог (Catalog)

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Эпик реализует страницу Catalog (`/catalog`) пиксель-в-пиксель по Handoff на desktop и mobile — самую интерактивную страницу сайта (UJ-2). Цель: посетитель просматривает две продуктовые линии (Automotive/Health), листает фото товаров в карточках, открывает quick-view с характеристиками, совместимостью и рейтингом и уходит на внешний маркетплейс по офферу; внизу — marquee знакомых брендов, подтверждающий масштаб партнёрской сети. Покупок и корзины на сайте нет — офферы ведут наружу. Страница подаётся как чистая функция типизированного контент-объекта `CatalogContent` (Фаза 1 — статический инстанс из `content/*`), готовая к переезду на Payload Global в Фазе 2. Покрывает FR-4 и FR-5.

## Stories

- Story 5.1: Каркас Catalog — линии и переключение
- Story 5.2: Карточка товара со слайдером изображений
- Story 5.3: Офферы — рантайм-деривация buildOffers
- Story 5.4: Quick-view товара
- Story 5.5: Marquee брендов

## Requirements & Constraints

- **Пиксель-в-пиксель — приоритет №1.** Визуал матчится по отрисованному Handoff-прототипу на каждом целевом брейкпоинте. Catalog имеет свои постраничные desktop-брейкпоинты (920/980/1100/1280; split-грид линий переключается на 980px) плюс mobile-композиция (≤768px, letterbox-шелл 440px). Дизайн — источник истины; кросс-страничные расхождения не примиряются. Приёмка использует брейкпоинт-чеклист (SM-1) из Epic 1; страница не Done, пока все её пункты не отмечены.
- **Порядок секций** (as-designed): Hero → «Two entrances» → две линии Automotive/Health → CTA → Footer.
- Офферы фиксированы по линии: **Health → Amazon/eBay; Automotive → Amazon/eBay/Walmart.** Каждый оффер — внешняя ссылка с репрезентативной ценой и дисклеймером; покупки на сайте нет.
- **Пустые состояния:** лого-фавиконка не загрузилась → `onerror` прячет `<img>` (верстка не рушится); плейсхолдеры «Photo N» в карточках — до реальных фото.
- Подкатегорийные плитки — **декоративные** (клик не фильтрует) и на desktop, и на mobile.
- `prefers-reduced-motion` отключает авто-скролл marquee и прочие анимации.
- Зелёный accent `--green-deep` на Catalog отсутствует — легитимная пер-страничная вариативность, не сводить к другим страницам.

## Technical Decisions

- **Islands Architecture:** секции — RSC; весь интерактив (переключение линий, слайдер карточки, quick-view, marquee) — листовые `'use client'`-островки. Островок получает контент пропсами и НЕ фетчит данные.
- **Две композиции desktop|mobile:** обе SSR-рендерятся в DOM, переключение только CSS-медиа на 768px. Запрещены JS-гейтинг и UA-сниффинг. На вьюпорт активна одна композиция.
- **Страница = чистая функция контент-объекта** `CatalogContent`; Фаза 1 — статический инстанс, typecheck-совместимый с будущим Payload-генерённым типом (проверяется в CI).
- **Офферы — рантайм-деривация (AD-9):** серверный `buildOffers` (`lib/offers.ts`) детерминированно вычисляет офферы по линии; это НЕ поле Payload. Островок/карточка/quick-view получают готовые офферы пропсами — **импорт `lib/offers.ts` в client-островок запрещён**. На коллекции `Products` с Фазы 1 зарезервированы поля `sku`/`externalId` (шов к фиду Фазы 4).
- **Карточки рендерятся из данных** (Фаза 1 — статический `PRODUCTS`-набор), не хардкодятся в разметке.
- **Marquee-лого в Фазе 1 — фавиконки** через `google.com/s2/favicons` (единственное разрешённое исключение из вендоринга ассетов, AD-11).
- **Переключение линий (desktop):** клик по entrance или hash вызывает `choose('health'|'auto')` → `.split-grid` получает `solo` + `show-health`/`show-auto`, секция `.active`, имя в `.cat-filter-name`, smooth-scroll; кнопка `.cat-back` возвращает к entrances. Deep-link: hash `#health`/`#automotive` выбирает линию на входе. Mobile — линии стопкой статично, без переключателей и фильтр-бара.
- **Мобильное шасси — общее из Epic 1** (drawer/scroll-lock/reveal). Catalog Mobile НЕ инлайнит собственную копию `mobile.js`.

## UX & Interaction Patterns

- **Слайдер карточки (`.pc-track`/`.pc-slide`/`.pc-arrow`/`.pc-dot`):** desktop — круглые стрелки prev/next (появляются на hover медиа) + точки, `translateX(-i*100%)` циклично, `stopPropagation` чтобы клик по стрелке не открыл quick-view; mobile — swipe + точки. Карточка: бейдж «In stock», чипы двух маркетплейсов, CTA «View details».
- **Открытие quick-view:** карточка — `role=button`, `tabindex=0`, клик/Enter/Space открывают; focus-visible оранжевый ринг.
- **Quick-view (`.pd-modal`/`.pd-panel`):** desktop — модалка (`role=dialog`, `aria-modal=true`, focus-trap); mobile — bottom-sheet; вход `scale .94→1`. Содержимое: галерея с thumbs-переключением (активная миниатюра — оранжевый бордер), спецификации, `Compatibility — fits`, рейтинг (звёзды + `N ratings`), name/brand/desc и офферы (готовые пропсы из Story 5.3). Закрытие: backdrop-клик / `.pd-close` / Esc; `body.overflow:hidden` scroll-lock.
- **Offer row:** каждый оффер — внешняя ссылка `target=_blank rel=noopener`, рядом репрезентативная цена + дисклеймер.
- **Brand marquee (`.logo-marquee`/`.logo-track`):** две ленты — прямая `marquee-left 48s`, обратная (`.rev`) `marquee-right 34s`, краевая маска, **пауза по hover**. Клик по `.logo-tile` → fly-to-center спотлайт («Visit website»); закрытие клик/backdrop/Esc. При `prefers-reduced-motion` авто-скролл выключен.
- **Accessibility Floor (базовый, не полный WCAG AA):** семантический HTML, Tab-порядок, клавиатурная навигация всех интеракций, видимый оранжевый focus-ring (`outline:2px solid #EF7F1A`, offset 3px); ARIA на оверлеях (quick-view — role/aria-modal/focus-trap/Esc); icon-кнопки с `aria-label` («Close», «Previous image», «Next image»). При конфликте a11y с отрисованным пикселем — пиксель приоритетнее.

## Cross-Story Dependencies

- **Epic 1 (Фундамент/оболочка):** страница использует общую shell (header/footer), мобильное шасси (drawer, scroll-lock, reveal-on-scroll) и DS-токены/шрифты. Каркас проекта, роут `/catalog` и критерий пиксель-приёмки (SM-1) приходят из Epic 1.
- **Epic 8 (Фаза 3, будущее):** коллекции `Products`/`Brands` переносят каталог в CMS; офферы остаются рантайм-деривацией (не поле). `Brands` (чужие лого для marquee) ≠ `BrandsContent` (страница MOTOTOU) — разные сущности. Зарезервированные `sku`/`externalId` — шов к фиду Фазы 4.
- **Внутри эпика:** Story 5.3 (`buildOffers`) — общий источник офферов для карточки (Story 5.2) и quick-view (Story 5.4); обе получают готовые офферы пропсами. Story 5.4 открывается из карточки Story 5.2.
