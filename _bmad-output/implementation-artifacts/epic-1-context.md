# Epic 1 Context: Фундамент и глобальная оболочка

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Разработчик получает рабочий каркас проекта — один процесс Next.js 16 + Payload CMS 3.x (local API) — с единой дизайн-системой и зафиксированным формальным критерием пиксель-приёмки (SM-1). Посетитель на любой из 6 страниц (`/`, `/about`, `/catalog`, `/brands`, `/shops`, `/contact`) видит консистентную фирменную шапку, футер и мобильную навигацию, пиксель-в-пиксель по Handoff (desktop+mobile). Этот эпик — фундамент: он включает всё остальное и поставляет полностью рабочую оболочку, каркас и процедуру приёмки пикселя. Реализует FR-1, NFR-1/2/3.

## Stories

- Story 1.1: Скаффолд проекта и один процесс деплоя
- Story 1.2: Дизайн-система — токены, шрифты, кнопки
- Story 1.3: Шапка (Header) — desktop и mobile
- Story 1.4: Футер (Footer) — desktop-колонки и mobile-аккордеоны
- Story 1.5: Мобильное шасси — drawer, scroll-lock, reveal-on-scroll
- Story 1.6: Критерий пиксель-приёмки (SM-1) — брейкпоинт-чеклист и preview

## Requirements & Constraints

- **Приоритет №1 — пиксель-в-пиксель по Handoff.** Дизайн (отрисованный прототип) — источник истины; матчим визуал по каждому целевому брейкпоинту, а не DOM. Кросс-страничные расхождения не примиряем; известные дефекты дизайна воспроизводим дословно, а не «чиним» (AD-13).
- **Одна дизайн-система на desktop и mobile:** Poppins (заголовки), Roboto/Karla (текст), Caveat (только About), Roboto Mono (SKU/спеки); единственный оранж — `#EF7F1A`. Осиротевший `_ds/…/colors_and_type.css` (`#EA7B08`, Archivo/Hanken/Spline) полностью игнорируется — не подключать (NFR-1).
- **Две отдельные композиции desktop|mobile, переключение только CSS-медиа на 768px.** JS-гейтинг (`useMediaQuery`/условный рендер) и server-side UA-сниффинг запрещены (иначе hydration-mismatch). Обе композиции SSR-рендерятся в DOM. Desktop держит свои внутренние брейкпоинты (реально до 1280); desktop-брейкпоинты <768 в прод не отгружаются. Ниже 768px — mobile-композиция в letterbox-шелле (NFR-2, AD-3).
- **Вендоринг внешних ассетов под self-host:** шрифты через `next/font` (без рантайм Google Fonts / CDN-хотлинка); скаффолдинг прототипа (react/@babel unpkg) выкинуть. Детерминизм — часть пиксель-фиделити (NFR-3, AD-11).
- **Env-переменные — UPPER_SNAKE, не захардкожены:** `CRM_API_URL`, DB-коннекшн, `PAYLOAD_SECRET`, revalidate-секрет.
- **Паспорт-атомы (телефон/адрес/email/соц/часы) в футере Фазы 1 захардкожены,** но вынесены так, чтобы позже ссылаться на `SiteSettings` без изменения разметки/пикселя (шов к Epic 7).
- **[ASSUMPTION] Деплой-конвейер отложен владельцем:** конкретное staging/preview-окружение на инфре Rollun, docker-compose с Postgres, TLS/reverse-proxy, выбор DB-адаптера (Postgres рекомендован) — уточняются перед деплоем Фазы 1. До этого достаточно локального preview и Docker-контейнера, собираемого/стартующего локально.

## Technical Decisions

- **AD-12 (один процесс деплоя):** один рантайм Next.js 16 (App Router, Turbopack, Cache Components, Node 20+) отдаёт публичный сайт + Payload-админку на `/admin` + local API. Payload 3.x (последний стабильный, не 4.0), React 19, TypeScript 5, Tailwind CSS v4, Postgres-адаптер. Приложение упаковывается в Docker (`Dockerfile`, один процесс). Отклонён headless-CMS отдельным сервисом.
- **AD-1 (Islands Architecture):** страницы и секции — RSC; всякий интерактив/анимация — листовой `'use client'`-островок под `components/islands/` (суффикс `.client.tsx`), получающий контент только пропсами (островок не фетчит). Мобильное шасси — одна общая реализация для всех mobile-страниц; каждая страница использует её, не инлайнит свою копию.
- **AD-2 (единый источник DS-токенов):** все токены (цвета, типошкала, spacing на базе 4px, radii, shadows, motion) живут в одном `@theme`-блоке `styles/theme.css` (Tailwind v4, CSS-first). Поверхностно-специфичные значения (mobile `--bg`, `--shell-w:440px`) — scoped-переопределения тех же токен-имён, не новые имена. Компонент не пишет сырой литерал цвета/шрифта/spacing, существующий как токен. Tie-break: при конфликте нормализации-в-токен с не-канон литералом прототипа побеждает литерал (AD-13 > AD-2).
- **AD-3 (две композиции):** см. Requirements; на данный вьюпорт грузится ровно одна композиция картинок (art-direction), тяжёлые hero не тянуть в оба дерева.
- **AD-13 (дизайн — источник истины):** воспроизводим дефекты как есть.
- **AD-14 (SiteSettings — единственный владелец атома):** каждый паспорт-атом имеет единственный дом; кросс-страничные расхождения — это разные именованные атомы (`hours.store` ≠ `hours.homeCta`), а не одно поле, отрендеренное по-разному. В Epic 1 футер готовит этот шов.
- **Seed-структура директорий** (детали владеет код):

```text
rollun-site/
  src/
    app/
      (site)/
        layout.tsx            # общая оболочка (header/footer), next/font
        page.tsx              # Home
        about/page.tsx
        catalog/page.tsx
        brands/page.tsx
        shops/page.tsx
        contact/page.tsx
      (payload)/admin/        # Payload-админка (генерится)
    components/
      shell/                  # header, footer (RSC + мобильное client-шасси)
      islands/                # 'use client' листья
      contact-form/           # единый ContactForm + Server Action
    content/                  # Фаза 1: статические типизированные контент-инстансы
    collections/              # Payload: Products, Brands, Shops, Media, Posts, Users
    globals/                  # Payload: SiteSettings, <Page>Content
    lib/
      offers.ts               # buildOffers (рантайм, по линии)
      payload.ts              # getPayload — local API
    styles/
      theme.css               # @theme — единственный источник DS-токенов
  payload.config.ts
  next.config.ts
```

- **Именование:** page-глобалы `<Page>Content` (PascalCase); island-файлы `.client.tsx`; DS-токены — kebab в `@theme`. 6 роутов существуют как RSC-заглушки уже в Story 1.1.

## UX & Interaction Patterns

- **Кнопки — 3 варианта по токенам (UX-DR3):** primary (`.btn-or`, оранж, острые углы), ghost (прозрачная на тёмном), dark (тёмная → hover оранж). Focus-visible — оранжевый ринг `outline:2px solid var(--or)`, offset 3px.
- **Header (UX-DR4):** desktop фикс 90→76px, `scrolled` при scrollY>30 (About — >60), hide-on-scroll-down (`hide` при y>200), show при скролле вверх; mobile фикс 62→56px, центрирован в 440px-шелле, `scrolled` при scrollY>20 (без hide), бургер 44px. Nav подсвечивает активный роут.
- **Footer (UX-DR5):** desktop — раскрытые грид-колонки (контакты, GitHub+LinkedIn, часы), лого 28px, ссылки hover → оранж; mobile — колонки-аккордеоны, клик по `.facc-head` тогглит `.open` у родителя.
- **Nav drawer / мобильное шасси (UX-DR6):** бургер → drawer справа (`translateX(100%)→0`, ширина `min(82%,360px)`, фон `#161616`) со scrim; `body.menu-open` + `overflow:hidden` (scroll-lock); `aria-expanded` синхронно; бургер анимируется в крест. Закрытие — `#drawerClose`/`#scrim`/клик по любой nav-ссылке. Одна общая реализация (эквивалент `mobile.js`); Catalog Mobile сводится к ней же.
- **Reveal-on-scroll (UX-DR17):** секции с `.reveal` получают `.in` по IntersectionObserver (threshold mobile 0.1 / desktop 0.12 / About 0.25); desktop-фолбэк форсит видимость через 1.5с. `prefers-reduced-motion` уважается (без анимаций появления).
- **Пиксель-приёмка (SM-1, Story 1.6):** в репозитории — чеклист приёмки на каждую из 6 страниц с явным перечнем целевых брейкпоинтов desktop (постраничные наборы вплоть до 1280) + mobile-композиция (≤768px, шелл 440px); каждый брейкпоинт — отдельный пункт «визуал совпал с прототипом». Для каждой страницы указан канонический Handoff-референс (`*.html` + `* Mobile.html`). Чеклист помечает воспроизводимые дефекты (AD-13) как «ожидаемо». Приёмка страниц Epic 3–6 ссылается на этот чеклист. Авто visual-regression/pixel-diff — опционален, не блокирует.

## Cross-Story Dependencies

- Story 1.1 (скаффолд, seed-дерево, роуты, env, Docker) — фундамент для всех остальных стори эпика и всего проекта.
- Story 1.2 (токены/шрифты/кнопки) — база для визуала Story 1.3–1.5 и всех последующих эпиков; ничего пиксельного не строить до неё.
- Story 1.3 (Header) и Story 1.4 (Footer) живут в `components/shell` и монтируются в общий `layout.tsx`.
- Story 1.5 (мобильное шасси) — общая реализация, которую переиспользуют все mobile-страницы (в т.ч. Catalog Mobile в Epic 5); включает reveal-on-scroll, используемый всеми секциями страниц Epic 3–6.
- Story 1.4 (футер, хардкод паспорт-атомов) готовит шов к `SiteSettings` (Epic 7).
- Story 1.6 (чеклист SM-1) — контракт приёмки, на который опираются все страничные эпики (3–6).
