---
title: 'Story 4.3: US Presence — статический список (mobile)'
type: 'feature'
created: '2026-07-06'
status: 'done'
baseline_revision: 'b86d2748f3324ddcc228619b0c5c25ad2614cb17'
final_revision: 'b7b948a830773f25bbcb1c15884c258f9749f397'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/rollun_handoff/rollun-web-site/project/About Us Mobile.html'
  - '{project-root}/docs/pixel-acceptance/checklist-about.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-4-2-us-presence-d3-map-desktop.md'
warnings: ['oversized']
---

<intent-contract>

## Intent

**Problem:** Мобильная композиция секции US Presence (06) сейчас — только заголовок из Story 4.1 (`.about-mb.section.paper` с `section-head`, без тела). Нужно наполнить её статическим содержимым мобильного прототипа: две карточки локаций (Registered HQ + Store/return center), ряд из 8 чипов городов ship-from и live-tag «Live network · 9 shipping points».

**Approach:** Чистый RSC + CSS, БЕЗ островка и JS: расширить `AboutContent.usPresence` мобильным под-объектом (`mobile.cards`, `mobile.chips`, `mobile.network`) с контентом, портированным дословно из `About Us Mobile.html`, отрендерить его в mobile-поддереве `UsPresence.tsx` (`<div class="wrap">` с `.loc-list`/`.ship-row`/`.live-tag`), и портировать mobile-CSS этих классов в mobile-медиаблок `src/styles/about.css`, скоуп под `.about-mb`, литеральные токены прототипа → проектные.

## Boundaries & Constraints

**Always:**
- `About Us Mobile.html` — единственный источник истины пикселя, разметки, данных и текста. Разметка секции 06 (`.loc-list` → 2×`.loc-card`; `.ship-row` → 8×`.ship-chip`; `.live-tag`) и CSS классов `.loc-list`/`.loc-card`(+`.store`)/`.loc-marker`(+`.hq`/`.store`)/`.meta`/`.place`/`.addr`/`.ship-row`/`.ship-chip`/`.live-tag`(+`.dot`/`.num`) портируются ДОСЛОВНО.
- Контент дословно из прототипа: card HQ = meta «Registered HQ» / place «Sheridan, Wyoming» / addr «30 N Gould St STE 4370 · only for legal purposes»; card store = meta «Brick store & return center» / place «Houston, Texas» / addr «5327 Aldine Mail Route Rd, 77039». Чипы (порядок дословный): Seattle WA, Los Angeles CA, Denver CO, Kansas City MO, Chicago IL, Atlanta GA, New York NY, Miami FL. Live-tag: label «Live network», число `9`, unit «shipping points».
- Контент — плоский сериализуемый под-объект `AboutContent['usPresence']['mobile']` (AD-7, Payload-совместимо), страница остаётся чистой функцией контента; островок/фетч не вводить. Новые типы (`AboutPresenceCard`) — плоские, без функций/JSX.
- Разметка добавляется ТОЛЬКО в существующее mobile-поддерево `<section className="about-mb section paper reveal">`: сразу после текущего `.section-head.wrap` добавить второй `<div className="wrap">` с телом. Существующий `section-head` (eyebrow/title/intro.mb) не трогать.
- CSS-правила класть в mobile-медиаблок `@media not all and (min-width: 768px)` (начинается ~строка 1284), новой секцией `US PRESENCE (06)` между `KEEPTOSHIP (05)` и `TEAM (07)`; каждое правило скоупить под `.about-mb` (конвенция блока). Токены: `--or→--color-or`, `--line→--color-line`, `--dark→--color-dark`, `--ink-mute→--color-ink-mute`, `--ink-soft→--color-ink-soft`; литералы `#fff`/`#34C759`/rgba и `'Poppins'→--font-display` — по прототипу.
- `prefers-reduced-motion: reduce` отключает пульс `.live-tag .dot` (`@keyframes live`) — добавить override `animation: none` (эпик: rm гасит все анимации; прототип rm-проверки не имеет).

**Block If:**
- Разметка/данные mobile-секции 06 неоднозначны и не выводимы из `About Us Mobile.html` — HALT `blocked` с описанием неоднозначности.

**Never:**
- Не трогать desktop-композицию (`.about-dk.map-section`, D3-островок Story 4.2, `#map`/`#loc-popup`/`#live-count`/`.map-hint`, desktop-CSS в `@media (min-width:768px)`).
- Не переиспользовать массив `usPresence.locations` (desktop-данные: 30 wh + hq/store с `kicker`/`desc`/`rows`) для mobile-карточек — формат карточек (meta/place/addr) и набор чипов (8 курированных городов, НЕ 30 складов) в прототипе иные; mobile-число `9`, не `30`.
- Не вводить островок, JS, count-up, IntersectionObserver, интерактив или анимацию числа — mobile-композиция полностью статична.
- Не вводить UA-сниффинг/JS-гейтинг ширины; выбор композиции — только CSS-медиа (AD-3).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mobile (<768px), секция видима | `mobile` контент | Рендерятся 2 loc-card (HQ оранжевый / store тёмный marker), 8 ship-chip, live-tag «Live network · **9** shipping points»; визуал совпадает с `About Us Mobile.html` | — |
| Desktop (≥768px) | `.about-mb` = display:none | Mobile-список скрыт CSS-медиа; активна только D3-карта (Story 4.2) | — |
| `prefers-reduced-motion: reduce` | rm вкл. | Пульс `.live-tag .dot` не играет (`animation:none`); остальное статично | — |

</intent-contract>

## Code Map

- `src/content/about.ts` -- РАСШИРИТЬ: новый тип `AboutPresenceCard = { variant:'hq'|'store'; meta; place; addr }`; в тип `AboutContent['usPresence']` добавить `mobile: { cards: AboutPresenceCard[]; chips: string[]; network: { label: string; count: number; unit: string } }`; в инстанс — дословные данные mobile-прототипа (2 cards, 8 chips, network 9). Не менять `locations`.
- `src/components/about/UsPresence.tsx` -- ПРАВКА (только mobile-поддерево): после `.section-head.wrap` добавить `<div className="wrap">` с `.loc-list` (cards.map → `.loc-card` + вариант `store`, `.loc-marker` hq/store, `.meta`/`.place`/`.addr`), `.ship-row` (chips.map → `.ship-chip`), `.live-tag` (`.dot`, «Live network · », `.num` = count, « shipping points»). Desktop-поддерево не трогать.
- `src/styles/about.css` -- ДОБАВИТЬ секцию `US PRESENCE (06)` в mobile-медиаблок `@media not all and (min-width: 768px)` (перед `TEAM (07)` ~стр.1643): портированный CSS `.loc-*`/`.ship-*`/`.live-tag`/`@keyframes live`, скоуп `.about-mb`, токены прототипа → проектные; + rm-override для `.dot`.
- `rollun_handoff/rollun-web-site/project/About Us Mobile.html` -- источник истины: markup секции 06 (~стр.225-249), CSS (~стр.57-75).
- `_bmad-output/implementation-artifacts/spec-4-2-us-presence-d3-map-desktop.md` -- парная desktop-история; конвенция токен-маппинга и art-direction (AD-3).

## Tasks & Acceptance

**Execution:**
- [x] `src/content/about.ts` -- добавить тип `AboutPresenceCard` и поле `usPresence.mobile` ({cards, chips, network}); заполнить дословно из `About Us Mobile.html` -- сериализуемый источник mobile-контента (AD-7), не трогая `locations`.
- [x] `src/components/about/UsPresence.tsx` -- отрендерить mobile-тело (`.loc-list`/`.ship-row`/`.live-tag`) из `usPresence.mobile` в существующем `.about-mb`-поддереве после `section-head`; desktop не трогать.
- [x] `src/styles/about.css` -- портировать CSS `.loc-*`/`.ship-*`/`.live-tag`/`@keyframes live` в mobile-медиаблок под `.about-mb`, токены → проектные, + `prefers-reduced-motion` override для `.dot`.

**Acceptance Criteria:**
- Given `/about` на mobile (<768px), when секция US Presence видима, then рендерятся 2 карточки локаций (HQ с оранжевым marker+halo, store с тёмным marker и тёмным левым бордером), 8 чипов городов в дословном порядке и live-tag «Live network · 9 shipping points»; визуал совпадает с `About Us Mobile.html`.
- Given desktop (≥768px), when загружена страница, then mobile-список скрыт (CSS-медиа), активна только D3-карта Story 4.2; в mobile-поддереве нет карты, в desktop-поддереве нет `.loc-list`/чипов.
- Given `prefers-reduced-motion: reduce`, when секция видима, then пульс live-точки не играет, содержимое статично.
- Given страница — чистая функция контента, when меняешь `usPresence.mobile`, then разметка следует контенту без правок компонента; typecheck (`AboutPresenceCard`, `mobile`) проходит strict.

## Spec Change Log

_(no bad_spec loopbacks — empty)_

## Review Triage Log

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 0, low 1)
- defer: 0
- reject: 7
- addressed_findings:
  - `[low]` `[patch]` Компонент хардкодил литерал «Live network ·», не читая `mobile.network.label` → поле `label` контент-модели было мёртвым (расхождение render/контент для AD-7/Payload). Fixed: JSX теперь рендерит `{mobile.network.label}` (сепаратор «·» остаётся статичным пунктуатором прототипа); визуал идентичен. Lint + build пере-прогнаны — PASS, `/about` = static prerender.
- rejected (not defects): дропнутые `.loc-card.ship`/`.loc-marker.ship` правила прототипа (spec явно санкционировал омитить неиспользуемый `.ship`-вариант; markup рендерит только hq/store, тип `variant:'hq'|'store'`); `@keyframes live` внутри `@media` (оба ревьюера подтвердили валидность — keyframe-имена глобальны, единственный потребитель `.dot` в том же mobile-блоке); non-semantic `div`/`span` вместо `ul`/`li` (дословный порт прототипа; эпик: пиксель приоритетнее Accessibility Floor); дубль-ключи React `key={c}`/`key={c.variant}` и ternary/`loc-marker ${variant}` без дефолта (латентно только при расширении union/повторе — данные статичный доверенный константный набор из 2 карточек/8 уникальных чипов, TS-гейт `'hq'|'store'`); прочие латентные future-proofing-замечания на статических данных.

## Design Notes

**Полностью статичная композиция — контраст со Story 4.2.** Desktop = императивный D3-островок; mobile = чистый RSC + CSS, ноль JS. Единственная «анимация» — CSS-пульс `.live-tag .dot` (`@keyframes live`, infinite), который гасится под `prefers-reduced-motion`.

**Отдельный mobile-контент, а НЕ проекция `locations`.** Прототип mobile использует свой курированный набор: 2 карточки в формате meta/place/addr (иной, чем desktop-поповер kicker/desc/rows), 8 репрезентативных городов (не 30 складов) и число `9` (не `30`). Поэтому вводится независимый `usPresence.mobile`, а `locations` (desktop) не трогается.

**Скелет mobile-тела:**
```tsx
<div className="wrap">
  <div className="loc-list">
    {mobile.cards.map((c) => (
      <div key={c.variant} className={c.variant === 'store' ? 'loc-card store' : 'loc-card'}>
        <div className={`loc-marker ${c.variant}`} />
        <div><div className="meta">{c.meta}</div><div className="place">{c.place}</div><div className="addr">{c.addr}</div></div>
      </div>
    ))}
  </div>
  <div className="ship-row">{mobile.chips.map((c) => <span key={c} className="ship-chip">{c}</span>)}</div>
  <div className="live-tag"><span className="dot" /> Live network · <span className="num">{mobile.network.count}</span> {mobile.network.unit}</div>
</div>
```

## Verification

**Commands:**
- `npm run lint` -- expected: без ошибок.
- `npm run build` -- expected: strict typecheck + сборка проходят; `/about` компилируется; `AboutPresenceCard`/`usPresence.mobile` типобезопасны.

**Manual checks:**
- `npm run preview` → http://localhost:3000/about в mobile-вьюпорте (≤768px, letterbox 440px): 2 карточки, 8 чипов, live-tag «9 shipping points» — сверка с `About Us Mobile.html` по `docs/pixel-acceptance/checklist-about.md`.
- Desktop (≥1280px): mobile-список НЕ виден, активна D3-карта.
- Эмуляция `prefers-reduced-motion: reduce`: пульс live-точки отсутствует.

## Auto Run Result

Status: done

### Summary
Мобильная композиция секции US Presence (06) получила статическое содержимое из `About Us Mobile.html` — БЕЗ островка и JS (контраст с desktop-D3 Story 4.2): чистый RSC + CSS. В `AboutContent.usPresence` добавлен плоский сериализуемый под-объект `mobile` (AD-7, Payload-совместимо) с курированным мобильным контентом (2 карточки локаций HQ/store в формате meta/place/addr, 8 чипов городов ship-from, live-network тег с числом `9`) — это НЕ проекция desktop-массива `locations` (30 складов, число `30`), а самостоятельный набор из mobile-прототипа. В mobile-поддереве `UsPresence.tsx` (после `.section-head`) добавлено тело `<div class="wrap">` с `.loc-list`/`.ship-row`/`.live-tag`, отрендеренное из `usPresence.mobile`. CSS классов `.loc-*`/`.ship-*`/`.live-tag` портирован дословно в mobile-медиаблок `@media not all and (min-width:768px)` под `.about-mb` (перед Team 07), литеральные токены прототипа замаплены на проектные (`--or→--color-or`, `--line→--color-line`, `--dark→--color-dark`, `--ink-mute→--color-ink-mute`, `--ink-soft→--color-ink-soft`, `'Poppins'→--font-display`). Пульс live-точки (`@keyframes live`) гасится под `prefers-reduced-motion: reduce` (мандат эпика). Desktop-композиция, D3-островок и прочие секции не тронуты; art-direction (AD-3) — выбор композиции только CSS-медиа на 768px.

### Files changed
- `src/content/about.ts` — новый тип `AboutPresenceCard` + поле `usPresence.mobile` ({cards, chips, network}); данные дословно из `About Us Mobile.html`. `locations` не тронут.
- `src/components/about/UsPresence.tsx` — mobile-поддерево наполнено телом `.loc-list`/`.ship-row`/`.live-tag` из `usPresence.mobile`; live-tag рендерит `mobile.network.label` (патч ревью). Desktop-поддерево не тронуто.
- `src/styles/about.css` — секция «US PRESENCE (06)» в mobile-медиаблоке: `.loc-*`/`.ship-*`/`.live-tag`/`@keyframes live` под `.about-mb`, токены → проектные, + `prefers-reduced-motion` override для `.dot`.

### Review findings
- Patches applied (1): [low] live-tag теперь читает `mobile.network.label` вместо хардкод-литерала (поле контент-модели было мёртвым; render/контент рассинхрон для AD-7).
- Deferred: 0.
- Rejected (7): spec-санкционированный дроп `.ship`-варианта; `@keyframes` в `@media` (подтверждено валидным); non-semantic markup (дословный порт, пиксель > a11y); латентные дубль-ключи/ternary/marker-fallback на статических доверенных данных с TS-гейтом. Детали — Review Triage Log.

### Verification
- `npm run lint` → PASS (без ошибок), пере-прогон после патча — PASS.
- `npm run build` → PASS (`✓ Compiled successfully`; `/about` = ○ Static prerender; `AboutPresenceCard`/`usPresence.mobile` типобезопасны).

### Residual risks
- Пиксель-приёмка mobile-композиции (карточки, чипы, live-tag) в браузере на mobile-вьюпорте (≤768px, letterbox 440px) по `docs/pixel-acceptance/checklist-about.md` и проверка «desktop-список не виден / mobile-карта не грузится» — ручные шаги (SM-1), автоматически не отмечены.
- Ключи React у карточек/чипов и ветвление классов корректны для текущего статического контента (2 варианта, 8 уникальных городов); при будущем расширении набора локаций через Payload потребуется ревизия уникальности ключей и вариантов маркеров (латентно, вне scope Story 4.3).
