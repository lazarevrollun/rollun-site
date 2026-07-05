---
title: 'Story 1.2: Дизайн-система — токены, шрифты, кнопки'
type: 'feature'
created: '2026-07-05'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: '914b6ad2c6ac2bdd290351fb51ee8763c601ea99'
final_revision: '2d81aa1aca7752b07cb7a9140a94318b97f1d9e7'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** Скаффолд 1.1 оставил `src/styles/theme.css` пустым скелетом `@theme {}` и `layout.tsx` без шрифтов. У проекта нет единого источника DS-токенов и self-host типографики, поэтому пиксель-в-пиксель по Handoff (приоритет №1) построить нельзя, а любой визуал 1.3–1.5 и последующих эпиков дрейфовал бы по палитре/шрифтам.

**Approach:** Портировать все токены прототипов (`:root` каждой страницы + `mobile.css` + type/spacing/radii/shadow/motion из DESIGN.md UX-DR1) дословно в один Tailwind v4 `@theme`-блок в `theme.css`; подключить Poppins/Roboto/Karla/Caveat/Roboto Mono через `next/font` (self-host, без CDN) и связать их с font-токенами; реализовать 3 варианта кнопок (`.btn-or`/ghost/dark) по токенам с острыми углами, hover- и focus-visible-состояниями.

## Boundaries & Constraints

**Always:**
- Единственный источник DS-токенов — ОДИН `@theme`-блок в `src/styles/theme.css` (Tailwind v4, CSS-first, AD-2). Значения портируются ДОСЛОВНО из прототипов (см. Token Inventory). Канонический оранж — `#EF7F1A` (единственный оранж).
- Токены именуются в неймспейсах Tailwind v4 (`--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--ease-*`) так, чтобы генерировались утилиты и `var()`. Идентификаторы производны от имён прототипа (`--or`→`--color-or`, `--ink`→`--color-ink`, `--shell-w`→spacing-токен). Компонент не пишет сырой литерал цвета/шрифта/spacing/radius, существующий как токен.
- Поверхностно-специфичные значения (mobile `--bg`, `--shell-w:440px`, About `--map-land`, Brands `--moto-navy`) — это scoped-переопределения ТЕХ ЖЕ токен-имён в scope соответствующей композиции/страницы, НЕ новые имена (AD-2).
- Шрифты — через `next/font` (`next/font/google`), self-host, `display:swap`, с точным набором весов (см. Token Inventory §Fonts). Font-CSS-переменные `next/font` навешиваются на `<html>`/`<body>` и на них ссылаются `--font-*`-токены `@theme`.
- Кнопки: базовый `.btn` + 3 варианта `.btn-or`, `.btn-ghost`, `.btn-dark` — острые углы (`border-radius:0`), значения только из токенов, с `:hover` и `:focus-visible` (оранжевый ринг `outline:2px solid var(--color-or)`, `outline-offset:3px`, UX-DR3). Классы живут в глобальном компонентном стайлшите, подключённом в `layout.tsx`.
- Tie-break: при конфликте нормализации-в-токен с не-канон литералом прототипа побеждает литерал прототипа (AD-13 > AD-2).

**Block If:**
- Прототипы дают взаимно-противоречивые ДЕФОЛТНЫЕ значения одного и того же глобального токена (не поверхностный override), которые нельзя развести scope'ом без выбора «победителя», требующего решения владельца дизайна.

**Never:**
- Не подключать и не использовать orphaned `_ds/…/colors_and_type.css` (`#EA7B08`, Archivo/Hanken/Spline) — ни импортом, ни значениями (AD-2). Допустимо смотреть на него лишь как на форму fallback-лестниц, но реальное значение прототипа всегда побеждает.
- Не тянуть шрифты рантайм-ссылкой на Google Fonts / CDN-хотлинком (NFR-3, AD-11).
- Не строить Header/Footer/мобильное шасси/страничный контент (1.3–1.6) и не вводить page-специфичную кнопку `.btn-navy` (принадлежит эпику Our Brands) — в scope 1.2 только DS-фундамент: токены, шрифты, 3 кнопки.
- Не вводить JS-гейтинг/медиа-хуки; поверхностные overrides — только CSS.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Кнопка primary | `.btn.btn-or` в покое | bg `#EF7F1A`, текст белый, Poppins 500/13px/uppercase/`0.06em`, padding `16px 32px`, `radius:0` | — |
| Кнопка primary hover | наведение на `.btn-or` | bg → `#C56712` (`--color-or-deep`), плавно (`transition:all .25s`) | — |
| Кнопка ghost hover | наведение на `.btn-ghost` (на тёмном) | bg → белый, текст → `#1a1a1a` (`--color-dark`) | — |
| Кнопка dark hover | наведение на `.btn-dark` | bg → `#EF7F1A` (`--color-or`) | — |
| Focus-visible | Tab-фокус на любую `.btn` | оранжевый ринг `outline:2px solid var(--color-or)`, offset 3px; при mouse-клике ринг не форсится | — |
| Загрузка шрифтов | первый рендер страницы | Poppins/Roboto/Karla/Caveat/Roboto Mono отдаются self-host из билда; в DOM/сети нет запросов к `fonts.googleapis.com`/`fonts.gstatic.com` | `display:swap` (без FOIT) |
| Mobile-scope токен | элемент внутри mobile-композиции/шелла | `--shell-w` и переопределённые токены берут mobile-значения тем же именем | — |

</intent-contract>

## Code Map

- `src/styles/theme.css` -- ЕДИНСТВЕННЫЙ `@theme`-блок: палитра, типошкала, spacing (4px), radii, shadows, motion. Сейчас пустой скелет — наполнить дословно из Token Inventory. Font-токены (`--font-*`) ссылаются на переменные `next/font`.
- `src/lib/fonts.ts` -- (новый) централизованные декларации `next/font/google` для Poppins/Roboto/Karla/Caveat/Roboto Mono с точными весами и `variable:`-именами; экспорт для `layout.tsx`.
- `src/app/(site)/layout.tsx` -- навесить `variable`-классы шрифтов на `<html>`/`<body>`; порядок импорта CSS (`theme.css` → компонентный стайлшит).
- `src/styles/components.css` -- (новый) глобальные компонентные классы кнопок (`.btn`, `.btn-or`, `.btn-ghost`, `.btn-dark`) по токенам, hover + focus-visible; импортируется в `layout.tsx` после `theme.css`.
- `rollun_handoff/rollun-web-site/project/*.html`, `mobile.css` -- ИСТОЧНИК ИСТИНЫ значений (read-only). DESIGN.md (`_bmad-output/planning-artifacts/ux-designs/.../DESIGN.md`) — формализованный UX-DR1/2/3.

## Tasks & Acceptance

**Execution:**
- [x] `src/styles/theme.css` -- заполнить единый `@theme`-блок всеми токенами из Token Inventory (цвета, типошкала, spacing, radii, shadows, motion) дословно; font-токены ссылаются на `next/font`-переменные -- единый источник DS (AD-2).
- [x] `src/lib/fonts.ts` -- объявить `next/font/google` для 5 семейств с точными весами и `variable`-именами (self-host) -- детерминированная self-host типографика (NFR-3).
- [x] `src/app/(site)/layout.tsx` -- подключить font-`variable` классы на корне и импортировать `components.css` -- шрифты и кнопки доступны глобально.
- [x] `src/styles/components.css` -- реализовать `.btn`/`.btn-or`/`.btn-ghost`/`.btn-dark` по токенам, `radius:0`, hover + focus-visible-ринг -- 3 варианта кнопок (UX-DR3).
- [x] Юнит/проверка edge-кейсов матрицы: подтвердить hover/focus-состояния кнопок и отсутствие CDN-запросов на шрифты (визуальная/DOM-проверка в preview; авто-тест опционален).

**Acceptance Criteria:**
- Дано прототипы (`:root` каждой страницы + `mobile.css` + UX-DR1), когда токены портированы, тогда `theme.css` содержит один Tailwind v4 `@theme`-блок со ВСЕМИ токенами дословно: палитра (оранж `#EF7F1A`, charcoal, бумаги, линии, green + пер-страничные `--green-deep`/`--moto-navy`/`--map-land`), типошкала (роли display-hero…mono), spacing на базе 4px (container 1280, gutter 28/20), radii none→full, shadows, motion.
- Дано orphaned `_ds/…/colors_and_type.css`, когда осмотрены импорты и значения, тогда он нигде не подключён и не использован (нет `#EA7B08`, Archivo/Hanken/Spline).
- Дано `next/font`, когда собран билд, тогда Poppins/Roboto/Karla/Caveat/Roboto Mono self-host с нужными весами; в рантайме нет хотлинка на Google Fonts CDN.
- Дано 3 варианта кнопок, когда они отрендерены, тогда `.btn-or`/ghost/dark построены по токенам, острые углы, корректные hover; focus-visible даёт оранжевый ринг `outline:2px solid var(--color-or)` offset 3px.
- Дано поверхностные значения (mobile `--bg`/`--shell-w:440px`, About `--map-land`, Brands `--moto-navy`), когда осмотрен CSS, тогда это scoped-переопределения тех же токен-имён, а не новые токены.

## Spec Change Log

## Review Triage Log

### 2026-07-05 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 5: (high 0, medium 1, low 4)
- defer: 1: (high 0, medium 0, low 1)
- reject: 11: (high 0, medium 0, low 11)
- addressed_findings:
  - `[medium]` `[patch]` Документный дефолт-шрифт не был перевязан: Tailwind `--font-sans` оставался `ui-sans-serif`, поэтому любой текст без класса рендерился системным шрифтом, а не Roboto (подтверждено в скомпилированном CSS: `--font-sans:ui-sans-serif`, `font-family:var(--default-font-family,…)`). Исправлено `--font-sans: var(--font-body)`; ре-верифицировано — компилятор эмитит `--font-sans:var(--font-body)`.
  - `[low]` `[patch]` `.btn*` лежали вне слоя → перебивали любые Tailwind-утилиты (`class="btn px-10"` не переопределял padding). Обёрнуто в `@layer components` (порядок theme→base→components→utilities от `@import "tailwindcss"`); проверено — `@layer components{.btn{…}}` в билде.
  - `[low]` `[patch]` Стеки шрифтов теряли прототип-фолбэки: `--font-body` без `system-ui`, `--font-display` без `Karla`. Восстановлены дословно по прототипу.
  - `[low]` `[patch]` Caveat (About-only) и Roboto Mono (узко) префетчились на всех 6 роутах. `preload:false` — грузятся по факту использования, без preload-хинта на каждой странице (соответствует пер-страничной загрузке прототипа).
  - `[low]` `[patch]` Имя переменной `--font-mono-family` ломало паттерн `--font-<family>`. Переименовано в `--font-roboto-mono` (fonts.ts + ссылка в theme.css).
- rejected (шум / вне scope / by-design):
  - `[low]` `--radius:6px` якобы не перевязывает утилиту `rounded` — ЛОЖНОЕ: билд эмитит `.rounded{border-radius:var(--radius)}` = 6px (проверено).
  - `[low]` `--text-display-hero` «только под Home» — это КАНОНИЧЕСКАЯ роль UX-DR1 (DESIGN.md); пер-страничные hero-варианты — scoped-оверрайды в 1.3–1.6.
  - `[low]` Cyrillic-сабсеты (×2): контент сайта английский (US B2B, все прототипы EN) → `latin` корректен. `lang="ru"→"en"` — отдельный пре-existing артефакт 1.1 → defer.
  - `[low]` Ghost-кнопка «невидима на светлом» — by-design вариант ТОЛЬКО для тёмных секций (UX-DR3).
  - `[low]` faux-bold на Roboto@600 — ЛОЖНОЕ: все 600-роли — Poppins (грузит 600), ни одна Roboto-роль не использует 600.
  - `[low]` focus-ring оранжевый на оранжевой `.btn-or` низкоконтрастен — ринг предписан AC/UX-DR3 дословно.
  - `[low]` `border-radius:0` не в прототип-`.btn` / «verbatim» в комментарии — острые углы требует AC; косметика комментария.
  - `[low]` About map-токены `--map-accent`/`--map-bg` не захвачены — пер-страничные (Epic 4), `--map-accent`=var(--or) уже покрыт; вне scope 1.2.
  - `[low]` Roboto статическими весами / build-time сеть next/font — билд проходит; свойства next/font, не дефект стори.

## Design Notes

**Token Inventory (дословно из прототипов + DESIGN.md UX-DR1).** Это данные для портирования; точные идентификаторы/утилиты — за кодом, но значения и имена-роли фиксированы.

- **Палитра** (глобальный `:root`, все страницы): `--or #EF7F1A`, `--or-deep #C56712`, `--or-soft #f5a35a`, `--ink #1f1f1f`, `--ink-soft #555`, `--ink-mute #777`, `--bg #D2D2D2`, `--bg-2 #C9C9C9`, `--paper #E2E2E2`, `--dark #1a1a1a`, `--dark-2 #232323`, `--line rgba(31,31,31,0.12)`, `--line-dark rgba(255,255,255,0.12)`, `--green #2f6b48`, `--white #fff`.
- **Пер-страничные (scoped)**: `--green-deep #214d33` (Home/About/Contact), `--moto-navy #1c2c6b` + `--moto-navy-deep #14215a` (Our Brands), `--map-land #2a2d2e` + `--map-border rgba(255,255,255,0.10)` (About-карта). `--shell-w 440px` (mobile). Catalog `:root` не содержит `--green-deep` — не выдумывать.
- **Типошкала (роли → font/size/weight/lh/ls)**: display-hero `Poppins clamp(40px,5.4vw,78px)/700/1.05/-0.012em`; section-display `Poppins clamp(36px,4.4vw,64px)/700/1.05/-0.005em`; section-title `Poppins clamp(26px,2.6vw,36px)/600/1.1/0.02em uppercase`; eyebrow `Poppins 11px/600/1.2/0.22em uppercase`; nav `Poppins 14px/500/0.04em uppercase`; body-lg `Roboto clamp(16px,1.2vw,19px)/300/1.55`; body `Roboto 15px/400/1.6` (база 16px/1.65); label `Poppins 14px/500/1.3`; label-caps `Poppins 11px/600/0.12em uppercase`; mono `Roboto Mono 13px/400`; accent-hand `Caveat 1.32em/700` (ТОЛЬКО About). Заголовочная база h1–h5: `Poppins 700, ls -0.005em, lh 1.1`.
- **Spacing (4px base)**: container max-width `1280px`, desktop gutter `28px`, mobile gutter `20px`, mobile shell `440px`; button padding `16px 32px`, input padding `13px 15px`. Прочие значения — кратные 4px (используются постранично в след. эпиках).
- **Radii ladder**: `none 0`, `xs 3px`, `sm 4px`, `DEFAULT 6px`, `md 9px`/`10px`, `lg 12px`, `xl 18px`, `2xl 22px`/`28px` (карточки), `pill 100px`, `full 9999px`/`50%`. Кнопки — `0`.
- **Shadows (именованные)**: header `0 4px 20px rgba(0,0,0,0.35)`; input-focus `0 0 0 3px rgba(239,127,26,0.15)`; card-hover `0 28px 56px -32px rgba(0,0,0,0.45)`; modal `0 50px 120px -30px rgba(0,0,0,0.7)`; selected-inset `0 0 0 2px var(--color-or-soft) inset, 0 26px 50px -28px rgba(239,127,26,0.5)`. (Полный набор диффузных теней — по мере страниц; в 1.2 фиксируем эти базовые.)
- **Motion**: длительности `.2s/.25s/.28s/.34s/.35s/.42s/.8s`; easing стандарт `cubic-bezier(.4,0,.2,1)`, modal-enter `cubic-bezier(.2,.8,.2,1)`, transform `cubic-bezier(.2,.7,.2,1)`; `prefers-reduced-motion` — `animation:none` (учитывается в 1.5, здесь только токены easing/duration).

**Fonts (`next/font`, self-host, `display:swap`)** — веса из CDN-href прототипа (источник) + Roboto Mono (используется в CSS, требуется AC):
- Poppins: 300,400,500,600,700,800,900 → `--font-display`
- Roboto: 300,400,500,700 → `--font-body`
- Karla: 400,500,600,700 → fallback в стеке (`'Roboto','Karla',…`); отдельный токен-стек
- Caveat: 600,700 → `--font-hand` (About only)
- Roboto Mono: 400 → `--font-mono`

**Кнопки (golden example, все `radius:0`):**
```css
.btn { display:inline-flex; align-items:center; gap:8px; font-family:var(--font-display);
  font-weight:500; font-size:13px; text-transform:uppercase; letter-spacing:.06em;
  padding:16px 32px; border:1px solid transparent; border-radius:0; cursor:pointer;
  transition:all .25s; }
.btn-or   { background:var(--color-or); color:var(--color-white); border-color:var(--color-or); }
.btn-or:hover { background:var(--color-or-deep); border-color:var(--color-or-deep); }
.btn-ghost{ background:transparent; color:var(--color-white); border-color:rgba(255,255,255,.4); }
.btn-ghost:hover { background:#fff; color:var(--color-dark); border-color:#fff; }
.btn-dark { background:var(--color-dark); color:var(--color-white); border-color:var(--color-dark); }
.btn-dark:hover { background:var(--color-or); border-color:var(--color-or); }
.btn:focus-visible { outline:2px solid var(--color-or); outline-offset:3px; }
```

**Прим.:** прототип у кнопок не имел явного `:focus-visible` — ринг добавляется по прямому требованию UX-DR3/AC; он не влияет на пиксель в покое (виден только при keyboard-фокусе), поэтому не конфликтует с AD-13.

## Verification

**Commands:**
- `npx tsc --noEmit` -- expected: типы проходят (включая `src/lib/fonts.ts`).
- `npm run build` -- expected: `next build` собирается; `next/font` вендорит шрифты в билд.
- `npm run lint` -- expected: линт проходит.
- `grep -rn "fonts.googleapis\|fonts.gstatic\|colors_and_type\|#EA7B08\|Archivo\|Hanken\|Spline" src/` -- expected: пусто (нет CDN-хотлинка и orphaned DS).

**Manual checks (if no CLI):**
- `npm run dev`, открыть любую страницу: в Network нет запросов к `fonts.googleapis.com`/`fonts.gstatic.com`; шрифты идут с локального origin.
- Отрендерить три кнопки в тест-разметке: проверить покой/hover/`Tab`-focus-ринг; углы острые; значения соответствуют токенам.
- Осмотреть `theme.css`: один `@theme`-блок; присутствуют группы палитра/типошкала/spacing/radii/shadows/motion; нет импорта `_ds/…`.

## Auto Run Result

Status: done

### Что реализовано
Дизайн-система как фундамент визуала: единый источник DS-токенов в ОДНОМ Tailwind v4 `@theme`-блоке (`src/styles/theme.css`) — палитра (канон-оранж `#EF7F1A` + пер-страничные `--color-green-deep`/`--color-moto-navy(-deep)`/`--color-map-land`), типошкала (роли display-hero…mono с парными lh/ls/weight), spacing на 4px-базе (container 1280, gutter 28/20, shell 440), radii-лестница none→full, именованные shadows, motion (durations + eases). Шрифты Poppins/Roboto/Karla/Caveat/Roboto Mono — self-host через `next/font` (без CDN-хотлинка), навешены на `<html>` в `layout.tsx`; `--font-*`-токены ссылаются на переменные `next/font`, а `--font-sans` перевязан на Roboto (документный дефолт). Три кнопки (`.btn-or`/ghost/dark) в `@layer components` по токенам, острые углы, hover + focus-visible оранжевый ринг. Orphaned `_ds/colors_and_type.css` не подключён. Поверхностные значения — scoped-оверрайды тех же имён (конвенция задокументирована).

### Изменённые файлы
- `src/styles/theme.css` — единый `@theme`-блок со всеми DS-токенами (дословно из прототипов + UX-DR1); `--font-sans → Roboto`; конвенция surface-scoped-оверрайдов.
- `src/lib/fonts.ts` (новый) — `next/font/google` для 5 семейств с точными весами и `variable`-именами, `display:swap`; `preload:false` на About-only Caveat и узкий Roboto Mono.
- `src/styles/components.css` (новый) — `.btn` + 3 варианта в `@layer components`, `radius:0`, hover + focus-visible.
- `src/app/(site)/layout.tsx` — `fontVariables` на `<html>`, импорт `components.css` после `theme.css`.

### Ревью
- **Патчей применено: 5** — [medium] перевязка документного дефолт-шрифта на Roboto (`--font-sans`); [low] кнопки в `@layer components` (переопределяемость утилитами); [low] восстановление прототип-фолбэков в стеках шрифтов; [low] `preload:false` для Caveat/Roboto Mono; [low] переименование `--font-mono-family → --font-roboto-mono`.
- **Отложено: 1** — `lang="ru"→"en"` (пре-existing артефакт 1.1; сайт англоязычный) → `deferred-work.md`.
- **Отклонено: 11** — в т.ч. 2 ложных срабатывания, проверенных по скомпилированному CSS (`rounded`=6px работает; faux-bold нет — 600-роли все Poppins); остальное by-design/вне scope/предписано AC.

### Верификация (проведена лично, не только сабагентом)
- `npx tsc --noEmit` → PASS; `npm run lint` → PASS (чисто); `npm run build` → PASS (11/11 страниц, `next/font` вендорится в билд).
- `grep` по `src/` на CDN-хотлинк/`colors_and_type`/`#EA7B08`/Archivo/Hanken/Spline/`font-mono-family` → пусто.
- Скомпилированный CSS проверен напрямую: `--font-sans:var(--font-body)` (дефолт-текст = Roboto), `.rounded{border-radius:var(--radius)}` = 6px, `@layer components{.btn{…}}` (утилиты перебивают), `--font-roboto-mono` присутствует.
- `.env`/`node_modules`/`.next` — gitignored, не в коммите.

### Остаточные риски
- Пер-страничные визуальные варианты (hero-размеры, About map-`--map-accent`/`--map-bg`, `.btn-navy` Our Brands) НЕ входят в DS-фундамент — реализуются как scoped-оверрайды/компоненты в стори 1.3–1.6 и профильных эпиках. Конвенция оверрайда задокументирована в `theme.css`.
- `next/font/google` требует сетевого доступа на этапе build (self-host в рантайме гарантирован); в air-gapped CI билд шрифтов надо будет закешировать — учесть при настройке деплой-конвейера (отсрочен владельцу).
- `lang="ru"` остаётся до отдельного фикса (см. deferred-work).
