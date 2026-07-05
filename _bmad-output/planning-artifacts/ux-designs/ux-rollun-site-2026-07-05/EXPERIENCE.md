---
name: rollun-site
status: draft
sources:
  - _bmad-output/planning-artifacts/briefs/brief-rollun-site-2026-07-02/brief.md
  - _bmad-output/planning-artifacts/prds/prd-rollun-site-2026-07-02/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-rollun-site-2026-07-02/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-rollun-site-2026-07-02/reviews/review-pixel-fidelity.md
  - rollun_handoff/rollun-web-site/project/ (Handoff — источник истины по визуалу и поведению)
updated: 2026-07-05
---

# Rollun — Experience Spine

> Имиджевая B2B-витрина Rollun — автоматизированного дистрибьютора e-commerce (автозапчасти + мото-аксессуары; health-товары). **Это не магазин:** корзины/чекаута нет, покупки уходят на внешние маркетплейсы. Задача сайта — убедить оптового партнёра, что компания серьёзная и технологичная, и захватить лид через Contact-форму. Этот spine владеет **как это работает** (IA, поведение, состояния, интеракции, доступность, флоу). Визуальные спеки — в `DESIGN.md`; здесь они не дублируются, а ссылаются по имени токена в `{path.to.token}`. Наследует 14 инвариантов `AD-*` из `ARCHITECTURE-SPINE.md` — они здесь опора, а не пересказ. Токен-пути ниже следуют именам DS в `DESIGN.md` (Tailwind v4 `@theme`); где точный путь под вопрос — помечено `[ASSUMPTION]`.

## Foundation

Responsive web, **две отдельные композиции** на страницу (desktop | mobile), без UI-библиотеки — с нуля поверх единой DS. `DESIGN.md` — визуальный референс; этот spine — поведение.

- **Порог композиций — 768px (AD-3).** Обе композиции SSR-рендерятся в DOM; переключение — **только CSS-медиа на 768px**. JS-гейтинг (`useMediaQuery`, условный рендер) и server-side UA-сниффинг запрещены (hydration-mismatch, разное монтирование островков). Ниже 768px рендерится mobile-композиция; desktop-брейкпоинты <768 (560/720/760…) в прод не отгружаются.
- **Mobile — letterbox-шелл.** Мобильная композиция живёт в центрированном шелле `{shell.width}` (=440px, `.phone{max-width:440px;margin:0 auto}`) на фоне `{colors.bg-mobile}` (=`#D2D2D2`) `[ASSUMPTION: имена token-путей]`. Полоса 440–768px — mobile-шелл в letterbox, не desktop.
- **Desktop-брейкпоинты — постраничные,** выведены из файла страницы (реально до 1280, не до 1100): Home 820/1050/1100/1180/1200/1280; About 780/880/1100/1280; Catalog 920/980/1100/1280; Brands 900/920/980/1280; Shops 940/980/1280; Contact 980/1280. Полоса 768–~900px = самый «схлопнутый» desktop-стейт.
- **Медиа — одна композиция картинок на вьюпорт (AD-3/AD-11).** Тяжёлые hero (15–18 МБ на Home) **не дублируются** в оба дерева: art-direction `<picture>`/`source media` или `next/image sizes`, без второго `src`.
- **Интерактив — только листовые client-островки (AD-1).** Секция и страница — RSC; всё поведение ниже — явные `'use client'`-листья, получающие контент **пропсами** (островок не фетчит).

→ Композиционный референс (пиксель + поведение): `Home.html`, `About Us.html`, `Catalog.html`, `Contact.html`, `Our Brands.html`, `Our Shops.html` + `* Mobile.html`, общий `mobile.js`. **Spine выигрывает при конфликте формулировок; при конфликте пикселя — выигрывает отрисованный прототип (AD-13).**

## Information Architecture

6 публичных роутов + админка. Каждый роут = чистая функция типизированного контент-объекта (`<Page>Content`), Фаза 1 подаёт статический инстанс из `content/*`, Фазы 2–3 — тот же тип из Payload Global (AD-5, AD-7). Разметка между фазами не меняется — меняется источник.

| Route | Content type | Страница | Ключевой смысл |
|---|---|---|---|
| `/` | `HomeContent` | Home | Первое впечатление: hero-мозаика, продуктовые линии, «Proven at scale», маркетплейс-карточки |
| `/about` | `AboutContent` | About Us | Доказательства масштаба: count-up, D3-карта US Presence, «Automation» (coin-tower + workforce) |
| `/catalog` | `CatalogContent` | Catalog | Две продуктовые линии, карточки со слайдером, quick-view, marquee лого брендов |
| `/brands` | `BrandsContent` | Our Brands | Собственный бренд **MOTOTOU**: hero, brand card, story, products, сертификат USPTO |
| `/shops` | `ShopsContent` | Our Shops | Физический магазин Houston TX, GET DIRECTIONS, маркетплейс-карточки, часы |
| `/contact` | `ContactContent` | Contact | Инлайн-форма + Google Maps с табами локаций (Houston / Sheridan) |
| `/admin` | — | Payload CMS | Редактирование контента (менеджер не может сломать вёрстку) |

**Глобальная оболочка (shell, AD-1).** Общий на все роуты header (лого, nav с индикатором активного роута, на mobile — burger→drawer) и footer (контакты/паспорт, GitHub + LinkedIn, часы, на mobile — аккордеоны). Паспорт-атомы (телефон, адрес, email, соц-ссылки, часы) имеют единственный дом в `SiteSettings`; страницы/shell/footer **ссылаются**, не дублируют (AD-14). Кросс-страничные расхождения часов — это **разные именованные атомы** (`hours.store` на Shops vs `hours.homeCta`), а не одно поле.

**Уровни текучести контента (AD-6) — что редактируемо, что гвоздями:**
- 🔴 **живое** (hero-картинки, товары, лого) → CMS-слот.
- 🟡 **правимый текст живых блоков** (заголовки/описания секций) → CMS-слот, держит бренд-голос §Voice.
- 🟢 **паспорт** (тел/адрес/email/соц/часы — атомы) → `SiteSettings`.
- ⚫ **гвоздями** (вёрстка, структура, юр/статичный текст, микрокопи, CTA-надписи) → код. При сомнении 🟡↔⚫ — по умолчанию ⚫.

## Voice and Tone

Микрокопи. Бренд-голос и эстетика — в `DESIGN.md`. **Контент сайта — англоязычный** (аудитория — B2B-партнёры в US); тон — деловой, технический, без восторженности и эмодзи. Ниже — правила надписей (⚫ гвоздями, кроме 🟡).

| Do | Don't |
|---|---|
| «GET IN TOUCH», «ASK A QUESTION», «BECOME A PARTNER» — короткие капс-CTA глаголом | «Click here to contact us!», «Let's connect 🚀» |
| «Proven at scale» · «Supplier ship-from network» — фактические, поддающиеся проверке заголовки | Маркетинговая вода, превосходные степени без цифры |
| «In stock — ships today» · «Free shipping» — статус товара как факт | Псевдо-срочность («Only 2 left!»), которой на имидж-сайте нет |
| Дисклеймер офферов: «Prices and availability shown are representative and may vary on the marketplace. Rollun distributes these products through the listed marketplace stores.» | Замалчивание, что покупка — на внешнем маркетплейсе |

**Темы Contact-формы (`cf-topic`, фикс-список ⚫, порядок сохранять):** `Select a topic` (disabled-плейсхолдер) · **Wholesale & distribution** · **Partnership** · **Marketplace operations** · **Returns & support** · **Other**.

**Подписи полей формы (⚫):** `Your Name` · `Your Email` · `Phone Number` · `Company` · `Question Topic` · `Your Message`. Кнопка сабмита — `ASK A QUESTION`.

## Component Patterns

Поведенческие спеки. Визуал — в `DESIGN.md.Components`. Все — client-островки под `components/islands/` (кроме `ContactForm` под `components/contact-form/`).

| Компонент | Где | Поведение |
|---|---|---|
| **Header (shell)** | все роуты | Desktop: shrink-on-scroll (класс `scrolled` при `scrollY>30`; About — `>60`) + hide-on-scroll-down (`hide` при `y>lastY && y>200`), show при скролле вверх. Mobile (`mobile.js`): `scrolled` при `scrollY>20` (без hide). Nav подсвечивает активный роут. |
| **Nav drawer (mobile)** | все mobile-роуты | Единая реализация `mobile.js` (AD-1): `#burger`→open, `#drawerClose`/`#scrim`→shut, клик по любой `.drawer nav a`→shut. Открытие вешает `body.menu-open` + `body.style.overflow='hidden'` (scroll-lock), `burger[aria-expanded]` синхронно. **Catalog Mobile сводится к этому же компоненту**, инлайн-копия из прототипа не портируется. |
| **Footer (shell)** | все роуты | Desktop — раскрытые колонки (контакты, GitHub+LinkedIn, часы). Mobile — аккордеоны: клик по `.facc-head` тогглит `.open` у родителя. |
| **ContactForm** | Home, About (модалка); Contact (инлайн); mobile Home/About (навигация) | Один компонент, один Server Action, **три режима показа** — см. ниже. Поля: `Your Name`, `Your Email`, `Phone Number`, `Company`, `Question Topic` (select из фикс-списка), `Your Message`. Анти-спам: honeypot-поле + серверная валидация (AD-8). Лид POST→CRM (`CRM_API_URL`, env, server-side); на сайте **не хранится** (нет `Submissions`, нет mailer). |
| **Product card** | Catalog | Рендерится из данных `PRODUCTS`. Медиа-слайдер: desktop — стрелки `.pc-arrow prev/next` + точки `.pc-dot`, `translateX(-i*100%)`, циклично; mobile — swipe + точки. Клик по карточке (кроме стрелок) → quick-view; `role=button`, `tabindex=0`, Enter/Space открывают. Бейдж `In stock`, чипы двух маркетплейсов, CTA `View details`. |
| **Quick-view** | Catalog | Desktop — модалка (`role=dialog`, `aria-modal=true`); mobile — bottom-sheet. Содержимое: галерея (thumbs-переключение), спецификации, `Compatibility — fits`, рейтинг (звёзды + `N ratings`), офферы. Закрытие: backdrop-клик, `.pd-close`, Esc. Открытие вешает `body.overflow='hidden'`. |
| **Offer row** | Quick-view | Офферы — рантайм `buildOffers` (AD-9), **не поле**: Health → Amazon/eBay; Automotive → Amazon/eBay/Walmart. Каждый оффер — внешняя ссылка `target=_blank rel=noopener` на маркетплейс; островок получает готовые офферы пропсами (импорт `lib/offers.ts` в островок запрещён). |
| **Brand marquee** | Catalog | Две ленты лого брендов (авто-скролл `.track`), **пауза по hover**. В Фазе 1 лого — фавиконки `google.com/s2/favicons` (AD-11). Отдельно: клик по `.logo-tile` → «fly-to-center» спотлайт (лого летит в центр, `Visit website`/`Trusted partner brand`), закрытие — клик по backdrop/вне карточки/Esc. |
| **Product-line switch** | Home | Desktop — кнопки-цифры `.line-dots button` тогглят слайд (`active`/`prev`/`next`), **без авторотации**; синхрон с hash. Mobile — горизонтальный `scroll-snap` шелф (`.line-shelf`, `scroll-snap-type:x mandatory`, слайды `flex:0 0 78%`), свайп, без переключателей. |
| **Category filter** | Catalog | Desktop: два «entrance» + фильтр-бар — клик по entrance вызывает `choose('health'|'auto')`: `.split-grid` получает `solo`+`show-health`/`show-auto`, секция `.active`, имя в `.cat-filter-name`, smooth-scroll; кнопка `.cat-back` возвращает к entrances. Deep-link: hash `#health`/`#automotive` выбирает линию на входе. Mobile: две линии стопкой, **без переключателей**. |
| **US Presence map** | About | Desktop — D3 (`geoAlbersUsa`, viewBox 960×600): кликабельные маркеры (HQ Sheridan WY, Store Houston TX, ~30 warehouse-точек) → поповер с деталями; закрытие — клик по карте, Esc, `.lp-close`; репозиция поповера на `resize`. Рядом — live-счётчик 0→30. Mobile — статический список локаций + чипы, **без D3** (AD-13). |
| **Coin-tower + workforce** | About «Automation», **desktop-only** | Coin-tower: 10 «монет» стопкой, всплывают при въезде в вьюпорт (ease-out, 1800ms), первые 3 — оранжевые (`on`). Workforce: 10 SVG-фигур, стартуют оранжевыми, 8 из 10 гаснут в `rgba(255,255,255,0.24)` со сдвигом 130ms. Триггер — IntersectionObserver threshold 0.2, играет один раз. |
| **Map tabs** | Contact | Табы локаций (`.map-tab[data-q]`) переключают `#mapFrame.src` = `maps.google.com/maps?q=…&z=13&output=embed` через `encodeURIComponent(data-q)`; активный таб — класс `active`. Есть и на mobile. Стартовый `src` содержит дефект — см. §Known Defects. |
| **Certificate lightbox** | Our Brands, **mobile-only** | Клик по `#certCard` открывает `#lightbox` (сертификат USPTO), клик по нему закрывает; scroll-lock. Только в mobile-DOM; desktop-код мёртв (AD-13). |

**ContactForm — три режима показа (AD-8):**
1. **Desktop-модалка** (Home, About) по кнопке `GET IN TOUCH` / `openContact`: двухколоночная (форма + инфо-панель), `role=dialog`, backdrop-клик и Esc закрывают, `body.overflow='hidden'` (scroll-lock). Открытие через `#openContact`, закрытие — `#closeContact`/backdrop/Esc.
2. **Инлайн** (Contact): форма в потоке страницы, без оверлея. Поддерживает deep-link `?topic=…` — предвыбор темы (нормализация текста опции), smooth-scroll к форме, кратковременная подсветка `.cf-prefilled`, автофокус на `Your Name`.
3. **Mobile Home/About:** кнопка не открывает модалку, а **ведёт навигацией на `/contact`** (по возможности с `?topic=…`), где показывается инлайн-режим. На mobile About контакт-модалки нет вовсе (AD-13).

## State Patterns

| Состояние | Поверхность | Обработка |
|---|---|---|
| Reveal-on-scroll | все секции (кроме первой) | Секция получает `.reveal`, IntersectionObserver добавляет `.in` при пересечении (threshold desktop 0.12, mobile `mobile.js` 0.1, About 0.25). Desktop-фолбэк: через 1.5с всё, что в вьюпорте и без `.in`, форсится видимым (защита от «пустого экрана»). |
| Count-up счётчики | Home «Proven at scale», About | Стартуют при въезде (IO threshold 0.4 Home / 0.25 About), cubic ease-out, ~1800ms, форматирование `comma`/suffix; играют один раз (`data-done`). До триггера — финальное значение не показано. |
| Hero-bloom | Home | Desktop: ч/б плитки, ~25% «зажжены» в цвет, набор обновляется каждые 3с (CSS-переход 1.6s). Mobile: одна фотография «выезжает» цветной из своей плитки, держится ~3.2с, уезжает, следующая. |
| Форма — валидация | ContactForm | Обязательные поля, формат email, тема — строго из фикс-списка. Клиентская подсказка + серверная валидация на единственном пути (AD-8). |
| Форма — success | ContactForm | Лид принят CRM (2xx) → подтверждение (в прототипе кнопка → `THANK YOU ✓`, затем reset; модалка закрывается через ~1.4с). Продовое подтверждение — явное сообщение об успехе. |
| Форма — error | ContactForm | Сбой доставки в CRM → **понятное сообщение** + **сохранение введённого** для повтора (FR-9); провал POST логируется server-side. Данные не теряются. |
| Пусто / нет данных | Catalog, карта | Лого-фавиконка не загрузилась → `onerror` прячет `<img>` (`visibility:hidden`), верстка не рушится. Карта не загрузилась → `.map-hint` = «Map could not load». Плейсхолдеры `Photo N` в карточках — до реальных фото. |
| Контент обновлён (Фаза 2+) | все роуты | Правка в Payload-админке → `afterChange`-хук → `revalidateTag` (канон-тег на Global; паспорт/shell тегируют **все** поверхности — mobile+desktop — иначе разъедутся в свежести). Прод обновляется без пересборки; вёрстку сломать нельзя (AD-10). Фаза 1 — полностью статична. |

## Interaction Primitives

**Указательное устройство + тач; клавиатура — базовый пол (не главный канал).** На im(age)-сайте главный вход — мышь/тач; клавиатура и focus-состояния обязаны работать (см. §Accessibility Floor), но продукт не «keyboard-first».

- **hero-bloom** — desktop: IO зажигает ~25% плиток в цвет, цикл 3с; mobile: одиночная фотография bloom из плитки (MOVE 1000 / HOLD 3200 / GAP 800 мс). `prefers-reduced-motion` → статичный кадр.
- **count-up** — IO-триггер, cubic ease-out ~1800ms, один раз. `prefers-reduced-motion` → сразу финальное значение.
- **D3-map (desktop)** — клик по маркеру `openPopup` (позиционирование по проекции, `--arrow`, флип below/above), закрытие клик-по-карте/Esc/`.lp-close`; `resize` → `positionPopup(current)`. Mobile — статический список (без D3).
- **card-slider** — desktop стрелки `prev/next` + точки, `translateX`, циклично, `stopPropagation` чтобы клик по стрелке не открыл quick-view; mobile — swipe + точки.
- **scroll-snap** (mobile) — горизонтальный шелф продуктовых линий Home, `scroll-snap-type:x mandatory`, слайды 78% ширины, без авторотации.
- **quick-view open/close** — клик по карточке (Enter/Space) открывает; backdrop/Esc/`.pd-close` закрывают; `body.overflow` lock на время показа.
- **marquee hover-pause** — авто-скролл лент лого, пауза по hover; `prefers-reduced-motion` → без авто-скролла.
- **logo fly-to-center** — клик по `.logo-tile` анимирует лого в центр экрана (спотлайт), закрытие клик/Esc.
- **coin-tower / workforce (desktop)** — canvas/rAF-анимация по IO, один раз; `prefers-reduced-motion` → статичный итог.
- **drawer** (mobile) — burger/scrim/close, scroll-lock, `aria-expanded`; клик по nav-ссылке закрывает.
- **shrink/hide-on-scroll** — header уменьшается (desktop `scrollY>30`/About `>60`, mobile `>20`) и на desktop прячется при скролле вниз (`y>200`), показывается при скролле вверх.

**Запрещено везде:** клиентский фетч контента (AD-4); `'use client'` на целую секцию вместо листа-островка (AD-1); JS-гейтинг композиции по вьюпорту (AD-3); дублирование тяжёлых hero в оба дерева (AD-3); импорт `lib/offers.ts` в client-островок (AD-9); вторая копия мобильного шасси (AD-1).

## Accessibility Floor

**Уровень — БАЗОВЫЙ, это НЕ полное WCAG AA.** Осознанное решение владельца: цель — доступность, которая **ничего не ломает в пикселе**. Не заявляем и не проверяем полные критерии AA (контраст, все ARIA-паттерны, скринридер-объявления навигации и т.п.) — только пол ниже.

- **Семантический HTML** и корректный порядок Tab = порядок чтения на каждой поверхности.
- **Клавиатурная навигация:** все интерактивные элементы достижимы и активируются с клавиатуры; product card — `role=button`/`tabindex=0`/Enter+Space.
- **Видимые focus-состояния** — оранжевый фокус-ринг `{colors.focus-ring}` (`{colors.or}` = `#EF7F1A`) на всех фокусируемых элементах.
- **alt-тексты** на смысловых изображениях; декоративные — пустой `alt`.
- **ARIA на оверлеях:** модалки и quick-view — `role=dialog` + `aria-modal=true` + **focus-trap** + Esc-закрытие; drawer — `aria-expanded` на burger; кнопки-иконки — `aria-label` (`Close`, `Previous image`, `Next image`).
- **`prefers-reduced-motion`** отключает hero-bloom, count-up (сразу финал), marquee (без авто-скролла), coin-tower/workforce, logo-fly.
- **Границы:** ничего из перечисленного не меняет отрисованный пиксель прототипа (AD-13 > доступность там, где они конфликтуют по видимому результату).

`[ASSUMPTION]` Focus-trap и `aria-modal` в прототипе не реализованы (там простые оверлеи) — это добавление Фазы 1 поверх дизайна, не ломающее пиксель.

## Known Design Defects — Reproduce As-Is

Воспроизводим **дословно** как намеренные (AD-13): матчим отрисованный прототип по каждому брейкпоинту, кросс-страничные расхождения не примиряем, пока владелец явно не закажет фикс. При конфликте с нормализацией токенов (AD-2) — **побеждает воспроизведение прототипа**.

1. **Our Shops — GET DIRECTIONS ведёт на Conroe TX.** На странице виден магазин Houston TX 77039 (Aldine), но ссылка «GET DIRECTIONS» содержит `q=Conroe`. Воспроизводится на desktop и mobile. Не «чинить» на Houston.
2. **Contact — опечатка стартового `src` карты `53%2F27`.** Первичный `#mapFrame.src` содержит `q=53%2F27%20Aldine…` (кривой адрес). **Клик по любому табу локации чинит** (пересобирает URL через `encodeURIComponent(data-q)`). Оставить стартовый src как есть.
3. **Часы расходятся между страницами.** Значения часов на Our Shops / Contact / footer / Home-CTA могут не совпадать — это **разные именованные атомы** `SiteSettings` (AD-14: `hours.store` ≠ `hours.homeCta`), а не один отрендеренный по-разному. Не сводить к одному значению.
4. **Lightbox сертификата USPTO — только в mobile-DOM.** Работает лишь на Our Brands Mobile (клик по `#certCard` открывает, клик закрывает — **Esc не подключён**). На desktop элемента `#lightbox` **нет**; desktop-JS вешает `keydown→Escape`, но код мёртв (защищён `if(cert&&lb)`). Воспроизводя mobile — **не дорисовывать Esc**; desktop оставить без lightbox.
5. **Home mobile теряет рейтинги маркетплейсов.** Маркетплейс-карточки на Home Mobile не показывают рейтинги, которые есть на Home Desktop. Воспроизводим как есть (не добавлять).
6. `[ASSUMPTION]` **About `.team-tile.tr { background:#ea7b07 }`** — видимый не-канонический оранж (близнец осиротевшего `#EA7B08`). По AD-13 (дизайн — источник) **оставить `#ea7b07`**, не нормализовать в `{colors.or}` (`#EF7F1A`). Внесено как воспроизводимый литерал; подтвердить у владельца.

## Key Flows

### Flow 1 — Марк: оптовый байер проверяет Rollun (ноутбук, desktop)

Марк получил холодное письмо и хочет понять, серьёзная ли это компания, прежде чем отвечать.

1. Открывает `/` с ноутбука. Hero-мозаика оживает — ч/б плитки команды/стенда/склада зажигаются в цвет; ниже count-up «Proven at scale» досчитывает цифры. Первое впечатление: живая, технологичная компания.
2. Переходит на `/about`. Счётчики отрабатывают, **D3-карта US Presence** рисует HQ Sheridan WY, Store Houston TX и ~30 warehouse-точек. Марк кликает маркер — поповер показывает поставщика и адрес отгрузки. Масштаб подтверждён.
3. `/catalog`: две продуктовые линии, карточки со слайдером, **marquee** знакомых брендов и собственный **MOTOTOU**. Ассортимент и партнёрская сеть выглядят настоящими.
4. Жмёт `GET IN TOUCH` — открывается **desktop-модалка** (двухколоночная, scroll-lock). Заполняет `Your Name`, `Your Email`, `Company`, выбирает тему **Wholesale & distribution**, пишет сообщение, `ASK A QUESTION`.
5. **Климакс:** мгновенное подтверждение — лид ушёл в CRM (2xx), модалка закрывается. Марк уверен: компания серьёзная, и он уже в их воронке.

**Edge (ошибка отправки):** CRM недоступен → **понятное сообщение об ошибке**, все введённые данные **сохранены** в форме, тема не сброшена; повторный `ASK A QUESTION` отправляет снова. Сбой залогирован server-side.

### Flow 2 — Дана: покупатель мото-запчастей (телефон, mobile)

Дана ищет заднюю покрышку для CRF250L с телефона.

1. Открывает `/catalog` на телефоне. Две продуктовые линии идут **стопкой** (без переключателей); reveal-on-scroll подаёт секции.
2. Находит карточку покрышки — **свайпает** фото (точки внизу отражают позицию).
3. Тапает карточку — снизу выезжает **quick-view bottom-sheet**: галерея, спецификации (`Size 4.60-18`, `Rear`…), `Compatibility — fits` (`2018–2023 Honda CRF250L`…), рейтинг, и **офферы** (`buildOffers` для Automotive → Amazon / eBay / Walmart).
4. Тапает оффер **Amazon** — открывается новая вкладка (`target=_blank rel=noopener`) с поиском/страницей товара на маркетплейсе.
5. **Климакс:** Дана уходит на маркетплейс — покупка совершается **не на сайте** Rollun. Сайт своё дело сделал: свёл спрос с оффером.

### Flow 3 — Ирина: контент-менеджер меняет hero (Payload admin, Фаза 2+)

Ирина — нетехнический контент-менеджер, ей нужно заменить одну hero-картинку на Home.

1. Логинится в `/admin` (Payload), открывает Global **`HomeContent`**.
2. Находит **типизированный слот** hero-картинки (🔴 живое, AD-6) — только загрузка изображения в размеченный слот, вёрстки/структуры она не касается (page-builder'а нет, AD-5).
3. Заменяет картинку, `Save`.
4. `afterChange`-хук Payload триггерит **`revalidateTag`** по канон-тегу `HomeContent` (тег покрывает **обе** поверхности — desktop и mobile Home).
5. **Климакс:** прод обновляется за секунды **без пересборки**; новая картинка встаёт ровно в тот же слот — пиксель между фазами не поехал, и **сломать вёрстку Ирина физически не может** (слот принимает только контент, не структуру).
