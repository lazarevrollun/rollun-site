---
name: rollun-site
status: draft
updated: 2026-07-05
description: Визуальная идентика корпоративного B2B-сайта rollun — дистрибьютора автозапчастей и товаров для здоровья, торгующего на Amazon / eBay / Walmart. Индустриальный charcoal + оранжевый. Токены извлечены дословно из HTML-прототипов (:root каждой страницы) и питают Tailwind CSS v4 @theme (styles/theme.css). Библиотека компонентов НЕ наследуется (нет shadcn/MUI) — вёрстка захардкожена.
colors:
  # --- Оранжевый бренд (реальный primary, #EF7F1A, 18× по прототипам) ---
  or: '#EF7F1A'          # --or  · основной бренд-акцент (CTA, ссылки, dot, focus)
  or-deep: '#C56712'     # --or-deep · hover/press primary, eyebrow-нумерация
  or-soft: '#f5a35a'     # --or-soft · мягкий бордер/glow оранжевого
  # --- Charcoal / тёмные поверхности ---
  dark: '#1a1a1a'        # --dark · тёмный hero/CTA фон
  dark-2: '#232323'      # --dark-2 · вторая тёмная поверхность
  dark-3: '#0e0e0e'      # самая тёмная section-полоса (background, по 1× на каждой странице)
  ink: '#1f1f1f'         # --ink · основной текст
  ink-soft: '#555'       # --ink-soft · вторичный текст
  ink-mute: '#777'       # --ink-mute · приглушённый/подписи
  header-bg: '#141414'   # фон фиксированной шапки (десктоп и мобайл)
  mobile-shell-bg: '#0c0c0c'  # letterbox-фон под мобильным «телефоном»
  drawer-bg: '#161616'   # фон выезжающего мобильного меню
  # --- Серая бумага / фоны ---
  paper: '#E2E2E2'       # --paper · светлые секции
  bg: '#D2D2D2'          # --bg · основной фон страницы
  bg-2: '#C9C9C9'        # --bg-2 · вторичный серый
  # --- Линии / бордеры ---
  line: 'rgba(31,31,31,0.12)'       # --line · бордеры на светлом
  line-dark: 'rgba(255,255,255,0.12)' # --line-dark · бордеры на тёмном
  # --- Зелёный accent (наличие/сток) ---
  green: '#2f6b48'       # --green · «in stock», галочки, статус
  green-deep: '#214d33'  # --green-deep · глубокий зелёный (Home/About/Contact ТОЛЬКО)
  # --- Пер-страничные (варьируются намеренно, AD-13) ---
  moto-navy: '#1c2c6b'      # --moto-navy · ТОЛЬКО Our Brands (бренд Mototou)
  moto-navy-deep: '#14215a' # --moto-navy-deep · ТОЛЬКО Our Brands
  # --- Внешние / соц ---
  linkedin: '#0a66c2'    # LinkedIn (hover #0954a0)
  github: '#1c1c1c'      # GitHub-кнопка (hover #000)
  white: '#ffffff'
typography:
  display-hero:
    fontFamily: Poppins
    fontSize: clamp(40px, 5.4vw, 78px)
    fontWeight: '700'
    lineHeight: '1.05'
    letterSpacing: -0.012em
  section-display:
    fontFamily: Poppins
    fontSize: clamp(36px, 4.4vw, 64px)
    fontWeight: '700'
    lineHeight: '1.05'
    letterSpacing: -0.005em
  section-title:
    fontFamily: Poppins
    fontSize: clamp(26px, 2.6vw, 36px)
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  eyebrow:
    fontFamily: Poppins
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.22em
  body-lg:
    fontFamily: Roboto
    fontSize: clamp(16px, 1.2vw, 19px)
    fontWeight: '300'
    lineHeight: '1.55'
  body:
    fontFamily: Roboto
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
  label:
    fontFamily: Poppins
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.3'
  label-caps:
    fontFamily: Poppins
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.12em
  accent-hand:
    fontFamily: Caveat        # ТОЛЬКО About Us
    fontSize: 1.32em
    fontWeight: '700'
  mono:
    fontFamily: Roboto Mono   # SKU / артикулы / спецификации
    fontSize: 13px
    fontWeight: '400'
rounded:
  none: '0'          # кнопки, product-card, section-strip — острые углы (индустриальность)
  xs: '3px'          # микро-скругления (dot.active, лого-плитки)
  sm: '4px'
  DEFAULT: '6px'     # инпуты, thumbnail brand-logo
  md: '9px'          # pd-thumb превью
  lg: '12px'         # медиа карточек, pd-main, тайлы hero
  xl: '18px'         # панель quick-view модалки
  pill: '100px'      # чипы, market-теги, badge, back-кнопка (999px — эквивалент)
  full: '9999px'     # круглые: dot, аватар, стрелки слайдера, close (== 50%)
spacing:
  base: '4px'        # базовый ритм (кратные 4)
  container: '1280px'   # max-width контентного контейнера (десктоп)
  gutter: '28px'        # .container padding по краям (десктоп)
  gutter-mobile: '20px' # .wrap padding (мобайл)
  btn-y: '16px'
  btn-x: '32px'
  input-y: '13px'
  input-x: '15px'
  section: '96px'       # типичный вертикальный отступ секции (варьируется 96–110px)
  shell-mobile: '440px' # --shell-w · ширина мобильного «телефона»
components:
  button-primary:      # .btn.btn-or
    fontFamily: '{typography.label-caps.fontFamily}'
    fontSize: 13px
    fontWeight: '500'
    letterSpacing: 0.06em
    textTransform: uppercase
    background: '{colors.or}'
    foreground: '{colors.white}'
    padding: '{spacing.btn-y} {spacing.btn-x}'
    border: '1px solid {colors.or}'
    radius: '{rounded.none}'
    hover-background: '{colors.or-deep}'
    transition: 'all .25s'
  button-ghost:        # .btn.btn-ghost (на тёмном)
    background: transparent
    foreground: '{colors.white}'
    border: '1px solid rgba(255,255,255,0.4)'
    radius: '{rounded.none}'
    hover-background: '{colors.white}'
    hover-foreground: '{colors.dark}'
  button-dark:         # .btn.btn-dark
    background: '{colors.dark}'
    foreground: '{colors.white}'
    border: '1px solid {colors.dark}'
    radius: '{rounded.none}'
    hover-background: '{colors.or}'
  product-card:
    background: '{colors.white}'
    border: '1px solid {colors.line}'
    radius: '{rounded.none}'
    hover-transform: 'translateY(-5px)'
    hover-shadow: '0 28px 56px -32px rgba(0,0,0,0.45)'
    hover-border: 'rgba(31,31,31,0.22)'
    media-aspect: '1 / 1'
    transition: 'transform .28s ease, box-shadow .28s ease, border-color .28s ease'
    focus-outline: '2px solid {colors.or}'
  card-slider:         # .pc-track / .pc-slide / .pc-dot
    track-transition: 'transform .42s cubic-bezier(.4,.0,.2,1)'
    arrow-size: '36px'
    arrow-background: 'rgba(255,255,255,0.92)'
    arrow-radius: '{rounded.full}'
    dot-size: '6px'
    dot-active-width: '17px'
    dot-active-radius: '{rounded.xs}'
  badge:               # .pc-badge
    fontFamily: '{typography.label-caps.fontFamily}'
    fontSize: 10px
    fontWeight: '600'
    letterSpacing: 0.12em
    textTransform: uppercase
    foreground: '{colors.white}'
    background: 'rgba(26,26,26,0.86)'
    background-stock: 'rgba(47,107,72,0.92)'
    padding: '6px 11px'
    radius: '{rounded.pill}'
  chip-market:         # .pc-markets .mk
    fontFamily: '{typography.label-caps.fontFamily}'
    fontSize: 11px
    fontWeight: '500'
    foreground: '{colors.ink-soft}'
    background: '{colors.bg}'
    border: '1px solid {colors.line}'
    radius: '{rounded.pill}'
    padding: '4px 9px 4px 5px'
  chip-filter:         # .cat-back
    fontFamily: '{typography.label-caps.fontFamily}'
    fontSize: 13px
    background: '{colors.white}'
    border: '1px solid {colors.line}'
    radius: '{rounded.pill}'
    padding: '9px 18px'
    hover-border: '{colors.or}'
    hover-foreground: '{colors.or}'
  input:               # .cf-field input/select/textarea
    fontFamily: '{typography.body.fontFamily}'
    fontSize: 15px
    foreground: '{colors.ink}'
    background: '{colors.white}'
    padding: '{spacing.input-y} {spacing.input-x}'
    border: '1px solid #cfcfcf'
    radius: '{rounded.DEFAULT}'
    focus-border: '{colors.or}'
    focus-shadow: '0 0 0 3px rgba(239,127,26,0.15)'
    label-font: '{typography.label}'
  brand-marquee:       # .logo-marquee / .logo-track
    mask: 'linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)'
    animation-fwd: 'marquee-left 48s linear infinite'
    animation-rev: 'marquee-right 34s linear infinite'
    pause-on-hover: 'true'
    reduced-motion: 'animation:none'
  quick-view-modal:    # .pd-modal / .pd-panel
    backdrop: 'rgba(10,10,10,0.78)'
    panel-background: '{colors.white}'
    panel-radius: '{rounded.xl}'
    panel-width: 'min(1000px, calc(100vw - 48px))'
    panel-shadow: '0 50px 120px -30px rgba(0,0,0,0.7)'
    enter-transition: 'transform .34s cubic-bezier(.2,.8,.2,1), opacity .34s ease'
    enter-scale: '0.94 -> 1'
    close-size: '38px'
    close-radius: '{rounded.full}'
    thumb-size: '64px'
    thumb-radius: '{rounded.md}'
    thumb-active-border: '2px solid {colors.or}'
    main-aspect: '1 / 1'
    main-radius: '{rounded.lg}'
  header:
    height: '90px'
    height-scrolled: '76px'
    background: '{colors.header-bg}'
    scrolled-shadow: '0 4px 20px rgba(0,0,0,0.35)'
    logo-height: '40px'
    nav-font: '{typography.label}'
    nav-letterSpacing: 0.04em
    nav-textTransform: uppercase
    nav-color: '{colors.white}'
    nav-hover: '{colors.or}'
    hide-transform: 'translateY(-100%)'
    transition: 'transform .35s ease, height .25s ease, box-shadow .25s ease'
  footer:
    background: '{colors.dark}'
    link-color: 'rgba(255,255,255,0.72)'
    link-hover: '{colors.or}'
    logo-height: '28px'
  header-mobile:
    height: '62px'
    height-scrolled: '56px'
    background: '{colors.header-bg}'
    logo-height: '30px'
  nav-drawer:          # .drawer (mobile)
    background: '{colors.drawer-bg}'
    width: 'min(82%, 360px)'
    transform-closed: 'translateX(100%)'
    transition: 'transform .34s cubic-bezier(.4,0,.2,1)'
    scrim: 'rgba(0,0,0,0.55)'
    burger-size: '44px'
---

## Brand & Style

rollun — это **серьёзная, технологичная B2B e-commerce дистрибуция**: компания продаёт автозапчасти (линия Auto) и товары для здоровья (линия Health) на американских маркетплейсах Amazon, eBay и Walmart. Голос сайта — уверенный, инженерный, без маркетингового шума: числа, каталоги, артикулы, факты о наличии.

Эстетика — **industrial charcoal + orange**. Тёмный графит (`{colors.dark}` / `{colors.header-bg}`) держит hero-секции, CTA и шапку; тёплый оранжевый `#EF7F1A` — единственный бренд-акцент, работающий как «указатель тока»: кнопки действия, активные ссылки, точки-маркеры, кольца фокуса. Между ними — семейство холодных серых «бумаг» (`{colors.paper}` / `{colors.bg}` / `{colors.bg-2}`), на которых живёт основной контент. Углы у деловых элементов (кнопки, товарные карточки, секции-полосы) **острые** — это осознанный «industrial» приём; скругления приберегаются для медиа, чипов-пилюль и модалок. Движение сдержанное и функциональное: короткие `.25s` переходы, аккуратный `cubic-bezier(.4,0,.2,1)`, длинные диффузные тени вместо резких границ.

Библиотека компонентов НЕ наследуется: нет shadcn / MUI. Вёрстка захардкожена, а токены ниже питают единственный источник правды DS — Tailwind CSS v4 `@theme` в `styles/theme.css`.

> **Замечание об источнике токенов.** Все значения извлечены дословно из `:root` каждой HTML-страницы-прототипа (`Home.html`, `About Us.html`, `Catalog.html`, `Our Brands.html`, `Our Shops.html`, `Contact.html` + мобильные варианты и `mobile.css`). Папка `_ds/rollun-design-system-…/` — это **СГЕНЕРИРОВАННЫЙ СУБСТИТУТ** дизайн-системы (по её собственному README шрифты — «SUBSTITUTES for the unknown original brand font»); она использует НЕВЕРНЫЙ оранжевый `#EA7B08` и НЕВЕРНЫЕ шрифты (Archivo / Hanken Grotesk / Spline Sans Mono). Архитектура (AD-2) помечает её как ORPHANED. Её цвета и шрифты игнорируются полностью; из неё заимствуется ТОЛЬКО *форма шкал* как fallback там, где реального значения в прототипе нет (neutral/orange-шкалы, radii xs–xl, spacing на базе 4px, shadow xs–lg, motion ease-out/in-out, dur fast/base/slow). Реальное значение прототипа всегда побеждает.

## Colors

Оранжевый — реальный primary, доминирует по всем прототипам.

- **`{colors.or}` `#EF7F1A`** — основной бренд-акцент. CTA-кнопки (`.btn-or`), активные и hover-состояния nav, точки-маркеры (`.dot`), подчёркивания, кольцо и обводка фокуса, оранжевый текст (`.or-txt`). Это НЕ фоновый цвет больших поверхностей — он всегда «точечный сигнал».
- **`{colors.or-deep}` `#C56712`** — press/hover для primary-кнопок и оранжевая нумерация eyebrow'ов (`.cb-num`).
- **`{colors.or-soft}` `#f5a35a`** — мягкий оранжевый бордер/glow (inset-обводки выбранных состояний).
- **Charcoal-семейство:** `{colors.dark}` `#1a1a1a` (тёмные hero/CTA), `{colors.dark-2}` `#232323` (вторая тёмная поверхность), плюс сырые литералы `#141414` (шапка), `#0c0c0c` (letterbox мобильного шелла), `#161616` (drawer). Текст: `{colors.ink}` `#1f1f1f`, `{colors.ink-soft}` `#555`, `{colors.ink-mute}` `#777`.
- **Серые «бумаги»:** `{colors.paper}` `#E2E2E2` (светлые секции), `{colors.bg}` `#D2D2D2` (основной фон), `{colors.bg-2}` `#C9C9C9`. Линии — полупрозрачные: `{colors.line}` `rgba(31,31,31,0.12)` на светлом, `{colors.line-dark}` на тёмном.
- **Зелёный accent наличия:** `{colors.green}` `#2f6b48` — статус «in stock», зелёная точка `.pc-stock`, галочки. `{colors.green-deep}` `#214d33` — определён **только** на Home, About, Contact (в Catalog / Our Brands / Our Shops его нет — это легитимная пер-страничная вариативность, AD-13, не сводить).
- **Пер-страничные бренд-цвета:** `{colors.moto-navy}` `#1c2c6b` и `{colors.moto-navy-deep}` `#14215a` определены **только** на `Our Brands.html` (собственный бренд Mototou). Не тащить их в глобальную палитру.
- **Внешние/соц и маркетплейсы:** LinkedIn `#0a66c2` (hover `#0954a0`), GitHub `#1c1c1c` (hover `#000`). Бренд-цвета маркетплейсов используются дословно в их логотипах: eBay `#e53238`/`#0064d2`/`#f5af02`/`#86b817`, Amazon `#232f3e`/`#ff9900`, Walmart `#0071ce`/`#ffc220`.

## Typography

Пять семейств, все Google Fonts, self-hosted через `next/font` (vendored, не CDN-хотлинк):

- **Poppins** (заголовки/дисплей, веса 300–900, доминирующий — 283×) — весь заголовочный и UI-caps слой.
- **Roboto** (основной текст, 300/400/500/700) — параграфы, инпуты.
- **Karla** (альт для body/UI, 400–700) — резервное семейство в стеках `'Roboto','Karla',…` и `'Poppins','Karla',…`.
- **Caveat** (рукописный акцент, 600/700) — **только на About Us** (слово-акцент `.love-word`, `{typography.accent-hand}`, оранжевый, 1.32em). Больше нигде не появляется.
- **Roboto Mono** (моно) — SKU / артикулы / спецификации.

Google Fonts URL (дословно из прототипов):
`https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&family=Karla:wght@400;500;600;700&family=Caveat:wght@600;700&display=swap`

Четыре именованные роли + акцент:

1. **`{typography.display-hero}`** — hero-заголовок H1: `clamp(40px, 5.4vw, 78px)`, Poppins 700, `line-height:1.05`, `letter-spacing:-0.012em`. Всегда fluid-clamp.
2. **`{typography.section-display}`** — крупный секционный дисплей: `clamp(36px, 4.4vw, 64px)`, 700, `uppercase`, `letter-spacing:-0.005em`.
3. **`{typography.section-title}`** — стандартный заголовок секции: `clamp(26px, 2.6vw, 36px)`, 600, `uppercase`, `letter-spacing:0.02em`.
4. **`{typography.body}` / `{typography.body-lg}`** — Roboto: базовый текст 15px/`1.6`; лид-абзац `clamp(16px, 1.2vw, 19px)` вес 300.

Плюс **`{typography.eyebrow}`** и **`{typography.label-caps}`** — мелкие Poppins-капсы с широким трекингом (реальные `letter-spacing`: 0.04em, 0.06em, 0.08em, 0.12em, 0.16em, 0.18em, 0.2em, вплоть до 0.22em) для надзаголовков, статусов и caps-меток. Дисплей-заголовки — отрицательный трекинг; мелкие капсы — раздутый.

## Layout & Spacing

- **Ритм** — кратные **4px**; шаг подтверждён DS-fallback-шкалой (`space-1…20`). Ключевые константы: кнопка `padding:{spacing.btn-y} {spacing.btn-x}` (16×32), инпут `13×15`, секции ~96–110px по вертикали.
- **Десктопный контейнер** — `.container { max-width:1280px; margin:0 auto; padding:0 28px }`. Все страницы центрируют контент в этих 1280px.
- **Split 768px.** Две ПОЛНЫЕ композиции на страницу (десктоп | мобайл) переключаются CSS-медиа **ровно на 768px**. Мобильный слой переопределяет ТЕ ЖЕ имена токенов (`--bg`, `--or`, …) — новых токенов не изобретает (см. `mobile.css`, где `:root` дублирует ту же палитру + добавляет `--shell-w:440px`).
- **Мобильный letterbox-шелл 440px.** Мобильная композиция живёт внутри «телефона»: `.phone { max-width:var(--shell-w) /*440px*/; margin:0 auto }` по центру, на фоне `body{background:#0c0c0c}` с боковыми полями-letterbox; `.wrap` даёт 20px внутренних отступов. Шапка — фиксированная 62px→56px, центрированная в тех же 440px.
- **Реальные десктопные брейкпоинты** (внутри самих прототипов, помимо split-а на 768): встречаются `560, 720, 760, 820, 880, 920, 980/981, 1100px` — например Catalog переключает split-грид линий на `980px`. Это внутренняя адаптивность верхней композиции вплоть до `1280px`, её воспроизводить как нарисовано.
- Секции тяготеют к вертикальному стеку; каталог использует сетки `repeat(3,1fr)` и `repeat(auto-fill, minmax(198px,1fr))`.

## Elevation & Depth

Глубина — через **длинные диффузные тени**, а не резкие границы; бордеры почти всегда полупрозрачные (`{colors.line}`).

- **Шапка (scrolled):** `0 4px 20px rgba(0,0,0,0.35)`.
- **Товарная карточка (hover):** `0 28px 56px -32px rgba(0,0,0,0.45)` + подъём `translateY(-5px)`.
- **Quick-view модалка:** `0 50px 120px -30px rgba(0,0,0,0.7)` — самый глубокий уровень.
- **Крупные секционные тени:** серия `0 40px 90px -55px rgba(0,0,0,0.55)`, `0 30px 70px -40px …`, `0 40px 80px -40px rgba(0,0,0,0.8)` — большой blur, большой отрицательный spread, низкая opacity.
- **Кольцо фокуса инпута:** `0 0 0 3px rgba(239,127,26,0.15)` (оранжевое). **Focus-visible** интерактивов: `outline:2px solid {colors.or}`, `outline-offset:3px`.
- **Оранжевый inset выбранного:** `0 0 0 2px var(--or-soft) inset, 0 26px 50px -28px rgba(239,127,26,0.5)`.

**Движение:** базовый переход `all .25s`; длительности `.2s / .25s / .28s / .34s / .35s / .42s / .8s`; кривые `cubic-bezier(.4,0,.2,1)` (стандарт), `cubic-bezier(.2,.8,.2,1)` (вход модалки), `cubic-bezier(.2,.7,.2,1)` (образные трансформы). Уважать `prefers-reduced-motion` (маркиза брендов отключает анимацию).

## Shapes

Радиусы намеренно двухполюсны: **деловые элементы острые, медиа/пилюли скруглены.**

- **`{rounded.none}` 0** — кнопки, `.product-card`, секционные полосы. Острый угол = «industrial / инженерное».
- **`{rounded.xs}` 3px** … **`{rounded.sm}` 4px** — микро (активная точка слайдера, лого-плитки).
- **`{rounded.DEFAULT}` 6px** — инпуты, миниатюра бренд-лого на карточке.
- **`{rounded.md}` 9px** — превью `.pd-thumb`.
- **`{rounded.lg}` 12px** — медиа карточек, `.pd-main`, тайлы hero-мозаики (10px тоже встречается).
- **`{rounded.xl}` 18px** — панель quick-view модалки (`.pd-panel`).
- **`{rounded.pill}` 100px** (и эквивалент 999px) — чипы, market-теги, badge, back-кнопка фильтра.
- **`{rounded.full}` 9999px** (== `50%`) — круглые: точки, аватары, стрелки слайдера, close-кнопка.

## Components

Ниже — только визуальные спецификации; поведение (карусели, открытие модалок, скролл-хайд шапки, drawer-логика) живёт в EXPERIENCE.md.

- **Button — primary (`.btn.btn-or`)** — `{components.button-primary}`: Poppins 500 / 13px / `uppercase` / `letter-spacing:0.06em`, `padding:16px 32px`, `border:1px solid {colors.or}`, фон `{colors.or}`, текст белый, **радиус 0**, `transition:all .25s`; hover → фон `{colors.or-deep}`.
- **Button — ghost (`.btn-ghost`)** — прозрачный, белый текст, `border:1px solid rgba(255,255,255,0.4)`; hover → белый фон, текст `{colors.dark}`. Для тёмных секций.
- **Button — dark (`.btn-dark`)** — фон/бордер `{colors.dark}`, белый текст; hover → фон `{colors.or}`.
- **Product card (`.product-card`)** — `{components.product-card}`: белый фон, `border:1px solid {colors.line}`, радиус 0, `overflow:hidden`; hover → `translateY(-5px)` + тень `0 28px 56px -32px rgba(0,0,0,0.45)` + бордер `rgba(31,31,31,0.22)`. Медиа `.pc-media` — `aspect-ratio:1/1`. Низ карточки: `.pc-offers` (border-top `{colors.line}`), market-чипы и `.pc-cta` (Poppins 600 / 12px / caps / `{colors.or-deep}`, hover → `{colors.or}` + рост gap). Focus-visible → `outline:2px solid {colors.or}`.
- **Card image slider (`.pc-track` / `.pc-slide` / `.pc-arrow` / `.pc-dot`)** — трек `transition:transform .42s cubic-bezier(.4,.0,.2,1)`; стрелки 36px круглые `rgba(255,255,255,0.92)` c бордером `{colors.line}`, появляются на hover медиа (на touch — всегда видимы); точки 6px, активная растягивается до 17px c радиусом 3px.
- **Badge (`.pc-badge`)** — `{components.badge}`: Poppins 600 / 10px / `letter-spacing:0.12em` / caps, белый на `rgba(26,26,26,0.86)`, `padding:6px 11px`, радиус 100px; вариант `.stock` → фон `rgba(47,107,72,0.92)`.
- **Chip — market (`.pc-markets .mk`)** — Poppins 11px 500, текст `{colors.ink-soft}` на `{colors.bg}`, `border:1px solid {colors.line}`, радиус 100px, `padding:4px 9px 4px 5px`, внутри 14px лого маркетплейса.
- **Chip — filter / back (`.cat-back`)** — белая пилюля, `border:1px solid {colors.line}`, радиус 100px, `padding:9px 18px`, Poppins 13px; hover → бордер и текст `{colors.or}`. Рядом `.cat-filter-now` с оранжевой точкой-`dot` 9px.
- **Stock indicator (`.pc-stock`)** — зелёная точка 7px (`::before`) + Poppins 11px 600 caps `{colors.green}`.
- **Input + ContactForm (`.cf-field`)** — `{components.input}`: label Poppins 14px 500 `{colors.ink}` c `margin-bottom:8px`; поле (input/select/textarea) — Roboto 15px, `padding:13px 15px`, `border:1px solid #cfcfcf`, радиус 6px, белый фон; focus → бордер `{colors.or}` + `box-shadow:0 0 0 3px rgba(239,127,26,0.15)`. Textarea `min-height:150px`, `resize:vertical`. Предзаполненный select (`?topic=`) — оранжевый бордер + пульс-анимация. Сетка формы `.cf-row` 2-колоночная, схлопывается в 1 колонку. Info-панель формы — тёмная (`{colors.dark}`), соц-иконки GitHub/LinkedIn.
- **Brand marquee (`.logo-marquee` / `.logo-track`)** — `{components.brand-marquee}`: бесконечная лента лого с краевой маской `linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)`; прямая лента `marquee-left 48s linear infinite`, обратная (`.rev`) `marquee-right 34s`; пауза на hover; при `prefers-reduced-motion` анимация выключена. Живёт в секции `.brands-wall` (тёмный фон).
- **Quick-view modal / bottom-sheet (`.pd-modal` / `.pd-panel`)** — `{components.quick-view-modal}`: backdrop `rgba(10,10,10,0.78)`; панель белая, радиус 18px, `width:min(1000px, calc(100vw - 48px))`, `max-height:calc(100vh - 56px)`, тень `0 50px 120px -30px rgba(0,0,0,0.7)`; вход `scale .94→1`, `transition:transform .34s cubic-bezier(.2,.8,.2,1), opacity .34s ease`. Внутри сетка `1fr 1fr`: галерея `.pd-gallery` (фон `{colors.paper}`) + `.pd-info`. Главное фото `.pd-main` — `aspect-ratio:1/1`, радиус 12px; миниатюры `.pd-thumb` 64px, радиус 9px, `border:2px solid transparent`, активная → `{colors.or}`. Close `.pd-close` — 38px круг `rgba(255,255,255,0.92)`. На мобайле панель ведёт себя как bottom-sheet.
- **Header (`.site-header`)** — `{components.header}`: фиксированная, `height:90px` → `76px` при `.scrolled` (+тень `0 4px 20px rgba(0,0,0,0.35)`), фон `#141414`; лого 40px; nav — Poppins 500 / 14px / caps / `letter-spacing:0.04em`, белые ссылки, hover/active → `{colors.or}`; скрытие — `translateY(-100%)`.
- **Footer (`.site-footer`)** — тёмный `{colors.dark}`, грид-колонки, лого 28px (осветлённое `brightness(1.2)`), ссылки `rgba(255,255,255,0.72)` → hover `{colors.or}`.
- **Header + Nav drawer (мобайл, `mobile.css`)** — шапка 62px→56px, центрирована в `440px`; бургер 44px (полоски 24×2px, анимируются в крест при `.menu-open`); drawer `.drawer` выезжает справа, `transform:translateX(100%)→0`, ширина `min(82%, 360px)`, фон `#161616`, `transition .34s cubic-bezier(.4,0,.2,1)`; scrim `rgba(0,0,0,0.55)`.

## Do's and Don'ts

| DO | DON'T |
|---|---|
| Использовать оранжевый `#EF7F1A` (`{colors.or}`) как единственный бренд-акцент | Использовать `#EA7B08` из orphaned `_ds/` — это неверный оранжевый субститута |
| Брать шрифты Poppins / Roboto / Karla / Caveat / Roboto Mono | Тащить Archivo / Hanken Grotesk / Spline Sans Mono из orphaned DS |
| Vendored self-hosted шрифты через `next/font` | Хотлинкать Google Fonts CDN в проде |
| Держать кнопки, `.product-card` и секции с **острыми углами** (`{rounded.none}`) | Скруглять деловые элементы «чтобы было мягче» |
| Caveat — только на About Us (акцент-слово) | Ставить Caveat где-либо ещё |
| Оранжевый — точечный сигнал (CTA, ссылка, dot, focus) | Заливать оранжевым большие поверхности |
| Воспроизводить пер-страничную вариативность как нарисовано (AD-13): `--green-deep` только на Home/About/Contact; `--moto-navy` только на Our Brands | Сводить/«нормализовать» межстраничные различия токенов |
| Мобайл переопределяет ТЕ ЖЕ имена токенов внутри 440px-шелла | Изобретать новые токены для мобайла или свой брейкпоинт вместо 768px |
| Ссылаться на токены `{path.to.token}` и питать ими Tailwind v4 `@theme` (`styles/theme.css`) | Писать сырые литералы, когда токен уже существует |
| `_ds/` использовать ТОЛЬКО как *форму fallback-шкал*, если реального значения в прототипе нет | Импортировать значения цветов/шрифтов из `_ds/` |
