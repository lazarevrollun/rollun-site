---
title: 'Story 5.4 — Quick-view товара'
type: 'feature'
created: '2026-07-06'
status: 'done'
baseline_revision: 'ea7b5d10d3014688e71f86177baf8e9589ea392f'
final_revision: '25abf7eb24ddbadb642afaad87a7401c87c33c5f'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/rollun_handoff/rollun-web-site/project/Catalog.html'
  - '{project-root}/rollun_handoff/rollun-web-site/project/Catalog Mobile.html'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** Story 5.2 отрисовала карточки товара (`role=button`, `tabindex`, focus-ring), но БЕЗ активирующего обработчика — клик/Enter/Space по карточке ничего не открывают. Нет quick-view: галереи с thumbs, спецификаций, `Compatibility — fits`, рейтинга, описания и офферов с внешними ссылками (готовый шов из Story 5.3 не отрендерен). `.pd-*`-стили в проект не портированы. Это последний интерактив каталога после каркаса (5.1), слайдера (5.2) и деривации офферов (5.3).

**Approach:** Ввести листовой `'use client'`-островок `ProductQuickView.client.tsx`, который ENHANCE-ит уже отрисованные карточки (прецедент `CatalogCardSlider`): вешает клик/keydown на каждый `.product-card[data-pd-key]`, по ключу находит деталь в сериализуемом пропе `details` и открывает оверлей. По AD-3 островок рендерит ОБЕ композиции в DOM — desktop-модалку (`.pd-panel`, 2-колоночный `.pd-grid`) и mobile-bottom-sheet (`.pd-sheet` + `.pd-grab`), — CSS-медиа на 768px показывает одну. Офферы вычислены СЕРВЕРНО в `ProductLines` (`buildOffers`, AD-9) и переданы островку пропсами; островок импортирует только `type { Offer }`. Разметка/иконки/тексты/CSS — VERBATIM из обоих прототипов.

## Boundaries & Constraints

**Always:**
- **AD-9:** островок НЕ импортирует `lib/offers.ts`. Офферы деривируются серверно в `ProductLines` через `buildOffers(p, line)` и складываются в проп `details: ProductDetail[]`; islands получают готовые сериализуемые данные. `ProductLines` строит `details` из ВСЕХ товаров `PRODUCTS` (12 уникальных), `line = cat === 'health' ? 'health' : 'auto'`.
- **AD-3 / две композиции:** островок рендерит desktop `.pd-modal > .pd-panel > .pd-grid` (обёрнут в `.catalog-dk`) И mobile `.pd-modal > .pd-sheet` (обёрнут в `.catalog-mb`), обе в одном DOM; видимость выбирает ТОЛЬКО CSS-медиа на 768px (существующий паттерн `.catalog-dk`/`.catalog-mb`). Запрещены JS-гейтинг композиции и UA-сниффинг. `matchMedia('(min-width:768px)')` допустим ТОЛЬКО для выбора активной панели при управлении фокусом.
- **Открытие:** клик/Enter/Space по `.product-card` открывают quick-view для товара из `data-pd-key`. Guard `if ((e.target as HTMLElement).closest('.pc-arrow')) return` — клик по стрелке слайдера НЕ открывает модалку (как в прототипе). `data-pd-key = `${brand} ${name}`` (тот же ключ, что `key=` в `ProductLines`; уникален по всем 12 товарам).
- **Desktop-модалка:** `.pd-panel[role=dialog][aria-modal=true]`, focus-trap, вход `scale .94→1` (CSS `.open`). Порядок (VERBATIM Catalog.html ~1537): `.pd-grid` = слева `.pd-gallery` (main-плейсхолдер + `.pd-thumbs` + `Compatibility — fits`), справа `.pd-info` (brand-row, `.pd-title`, `.pd-rating` звёзды + `N.N · N ratings`, `.pd-stockline` «In stock — ships today», `.pd-desc`, `Specifications`, `Available at` офферы, `.pd-disc`).
- **Mobile bottom-sheet:** `.pd-sheet[role=dialog][aria-modal=true]` + `.pd-grab`, вход `translateY(100%)→0` (CSS `.open`). Порядок ОТЛИЧАЕТСЯ (VERBATIM Catalog Mobile.html ~799): `.pd-gallery` (main + thumbs, БЕЗ fits) затем `.pd-info` (brand-row, title, rating, stockline, `.pd-desc`, `Available at` офферы, `Specifications`, `Compatibility — fits`, `.pd-disc`).
- **Thumbs-переключение:** активная миниатюра — `.pd-thumb.active` (оранжевый бордер); клик по thumb обновляет активную + счётчик «View N of M» (`#pdViewN`→`View <b>N</b> of M`). Плейсхолдеры (`Photo`/номер) — реальной смены фото нет (Фаза 1), как в прототипе. Открытие сбрасывает активный thumb на 0 и `scroll.scrollTop = 0`.
- **Рейтинг:** 5 звёзд, `k <= Math.round(rating) ? 'on' : 'off'` (VERBATIM `stars()`); подпись `rating.toFixed(1) + ' · ' + reviews.toLocaleString() + ' ratings'`.
- **Offer row:** каждый оффер — `<a class="pd-offer" href={o.url} target="_blank" rel="noopener">` = `FaviconImg`(domain, `mk-logo`) + `.mk-meta`(`o.name` / `o.ship`) + `.mk-price`(`o.price`) + `.mk-go`(«View» + extIco). Дисклеймер `.pd-disc` — VERBATIM текст прототипа (совпадает с `OFFER_DISCLAIMER`).
- **Закрытие:** backdrop-клик / `.pd-close` / Esc (только когда открыто) / `.pd-grab`-клик (mobile) закрывают. Scroll-lock: при открытии `document.body.style.overflow='hidden'`, при закрытии `''`.
- **CSS:** портировать `.pd-*` desktop (Catalog.html ~447-563) под `@media(min-width:768px)` scoped `.catalog-dk`, mobile (Catalog Mobile.html ~297-360) под комплемент `@media not all and (min-width:768px)` scoped `.catalog-mb`, в `@layer components`. Сырые vars прототипа → DS-токены проекта (как в 5.1/5.2): `--paper`→`--color-paper`, `--or`→`--color-or`, `--or-deep`→`--color-or-deep`, `--ink`→`--color-ink`, `--ink-mute`→`--color-ink-mute`, `--ink-soft`→`--color-ink-soft`, `--green`→`--color-green`, `--bg`→`--color-bg`, `--line`→`--color-line`; `--shell-w` оставить как есть (тема). Прототип-литералы (rgba-тени/подложки, размеры) — verbatim.
- Иконки VERBATIM (Catalog.html ~1343-1349): `xIco`, `extIco`, `checkIco`; `imgIco` — переиспользовать глиф из `ProductCard`/новый локальный (идентичен). Reuse `FaviconImg` для brand-logo и mk-logo.

**Block If:**
- Прототипы `Catalog.html` / `Catalog Mobile.html` отсутствуют/нечитаемы (нельзя портировать разметку/CSS/иконки/порядок секций верно).

**Never:**
- НЕ импортировать `lib/offers.ts` в островок (AD-9); НЕ вызывать `buildOffers`/`priceFor` в client — только `type { Offer }`.
- НЕ гейтить композицию по JS/UA; НЕ рендерить только одну модалку с CSS-reorder — обе структуры (desktop/mobile) в DOM, порядок секций РАЗНЫЙ (fits слева в галерее desktop vs в конце info mobile).
- НЕ вводить реальную смену фото в галерее (Фаза 1 — плейсхолдеры); НЕ трогать деривацию офферов/цен (Story 5.3) — только рендер.
- НЕ менять пиксель/разметку/CSS карточки (`.pc-*`) и слайдер (5.2) — только ДОБАВить `data-pd-key`; НЕ дублировать активацию слайдера (стрелки уже у `CatalogCardSlider`); НЕ «примирять» кросс-страничные расхождения.
- НЕ добавлять корзину/покупку; НЕ SSR-рендерить активный контент (модалка стартует закрытой, `activeKey=null`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Клик по карточке | `.product-card[data-pd-key]` (не по `.pc-arrow`) | quick-view открывается для товара по ключу; активная композиция по брейкпоинту; фокус на `.pd-close`; scroll-lock | ключ не найден в `details` → no-op (не открывать) |
| Клик по стрелке слайдера | `e.target.closest('.pc-arrow')` | НЕ открывать модалку (слайд листается островком 5.2) | — |
| Enter/Space на карточке | keydown, карточка в фокусе | `e.preventDefault()`, открыть quick-view | др. клавиши — игнор |
| Health-товар | `details` с 2 офферами (amazon/ebay) | 2 `.pd-offer` строки, цены/ship из `buildOffers` | — |
| Auto-товар | `details` с 3 офферами (amazon/ebay/walmart) | 3 `.pd-offer` строки | — |
| Thumb-клик | `.pd-thumb[data-n=N]` | active→этот thumb, счётчик «View N of M» | — |
| Закрытие | backdrop / `.pd-close` / Esc / `.pd-grab` | `.open` снят, scroll-lock снят | Esc при закрытом — no-op |
| Favicon 404 | brand/mk domain | `<img>` скрыт (`FaviconImg`), верстка цела | — |

</intent-contract>

## Code Map

- `src/components/catalog/ProductQuickView.client.tsx` -- НОВЫЙ листовой `'use client'`-островок. Экспортирует `type ProductDetail` (сериализуемый: `key,brand,domain,name,imgs,rating,reviews,specs,fits,desc,offers: Offer[]`). Рендерит desktop `.pd-panel`+mobile `.pd-sheet` (обе в DOM, обёрнуты `.catalog-dk`/`.catalog-mb`); state `activeKey`/`thumb`; useEffect вешает click/keydown на `.product-card[data-pd-key]` (guard `.pc-arrow`), Esc/backdrop/close/grab, scroll-lock, focus-trap на видимой панели (`matchMedia`). Порт VERBATIM `openDetail`/`stars`/иконок из обоих прототипов. Reuse `FaviconImg`; импорт `type { Offer }` (НЕ `lib/offers`)
- `src/components/catalog/ProductLines.tsx` -- ПРАВКА: собрать `allDetails` из `PRODUCTS` (flatMap по категориям, `offers: buildOffers(p, cat==='health'?'health':'auto')`), отрендерить `<ProductQuickView details={allDetails} />` один раз (после mobile-композиции/`CatalogCardSlider`); `import type { ProductDetail }`
- `src/components/catalog/ProductCard.tsx` -- ПРАВКА: добавить `data-pd-key={`${brand} ${name}`}` на `.product-card`; обновить хедер-коммент (активация quick-view — Story 5.4, островок `ProductQuickView`)
- `src/styles/catalog.css` -- ПРАВКА: добавить `.pd-*` (desktop под `@media(min-width:768px)` scoped `.catalog-dk`; mobile под комплемент scoped `.catalog-mb`) в `@layer components`; сырые vars→DS-токены
- `rollun_handoff/.../Catalog.html` (CSS ~447-563, `openDetail`/`stars` ~1516-1568, иконки ~1343-1349) -- источник desktop VERBATIM
- `rollun_handoff/.../Catalog Mobile.html` (CSS ~297-360, `openDetail` ~794-827) -- источник mobile bottom-sheet VERBATIM

## Tasks & Acceptance

**Execution:**
- [x] `src/components/catalog/ProductQuickView.client.tsx` -- НОВЫЙ островок: `type ProductDetail`; два модальных корня (desktop `.pd-panel`/`.pd-grid`, mobile `.pd-sheet`/`.pd-grab`) в `.catalog-dk`/`.catalog-mb`; state `activeKey`+`thumb`; wiring карточек (click/keydown, guard `.pc-arrow`), Esc/backdrop/close/grab, scroll-lock, focus-trap видимой панели; `stars()`/иконки/разметка VERBATIM; офферы `<a target=_blank rel=noopener>`; `FaviconImg`; `type { Offer }` -- единственный интерактив 5.4, AD-9-совместимый
- [x] `src/components/catalog/ProductLines.tsx` -- построить `allDetails` (серверный `buildOffers` по линии) и смонтировать `<ProductQuickView details={allDetails} />` -- офферы деривируются серверно, островок получает готовые пропсы
- [x] `src/components/catalog/ProductCard.tsx` -- `data-pd-key` на `.product-card`, обновить коммент -- шов активации карточка→островок без изменения пикселя
- [x] `src/styles/catalog.css` -- порт `.pd-*` desktop+mobile под соответствующие медиа/скоуп, vars→DS-токены -- пиксель модалки/шита матчит прототип на обоих брейкпоинтах
- [x] Юнит-тест (ПРОПУЩЕН — тест-раннера в проекте нет, как в 5.1–5.3) -- I/O-матрица проверяется вручную/`build`

**Acceptance Criteria:**
- Given Catalog, when открываю карточку (клик/Enter/Space, не по стрелке), then на desktop — `.pd-panel[role=dialog][aria-modal=true]` с focus-trap и входом `scale .94→1`; на mobile — `.pd-sheet` bottom-sheet с входом `translateY→0`; активную композицию выбирает CSS-медиа на 768px.
- Given quick-view открыт, then показаны: галерея с thumbs-переключением (active — оранжевый бордер, счётчик «View N of M»), спецификации, `Compatibility — fits`, рейтинг (звёзды + `N ratings`), name/brand/desc; порядок секций desktop и mobile — VERBATIM своих прототипов.
- Given quick-view, then офферы показаны как внешние ссылки (`target=_blank rel=noopener`) с ценой/ship/дисклеймером — готовые из `details` (Story 5.3, `buildOffers` серверно); островок НЕ импортирует `lib/offers.ts`.
- Given quick-view открыт, when backdrop-клик / `.pd-close` / Esc / `.pd-grab`(mobile), then закрывается; при открытии `body{overflow:hidden}`, при закрытии снимается.
- Given обе композиции, then они обе в DOM (AD-3), без JS-гейтинга/UA-сниффинга; карточка (`.pc-*`) и слайдер (5.2) пиксельно не изменены (добавлен лишь `data-pd-key`).
- Given проект, then `tsc`/`lint`/`build` проходят; grep не находит импорта `lib/offers` в `'use client'`-файлах.

## Spec Change Log

<!-- Append-only. Empty until the first bad_spec loopback. -->

## Review Triage Log

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 4: (high 0, medium 1, low 3)
- defer: 0
- reject: 5
- addressed_findings:
  - `[medium]` `[patch]` Exit-animation content pop: `{detail && …}` размонтировал тело панели в момент `activeKey→null`, и `.pd-panel`/`.pd-sheet` анимировались наружу пустой коробкой (прототип держит разметку в DOM постоянно, лишь тогглит `.open`). Введён `lastDetail`-state (пишется в open-хендлере, не в эффекте) — `detail = activeDetail ?? lastDetail` остаётся смонтированным сквозь CSS-транзишн; `open` отдельно тогглит `.open`. Motion-фиделити (приоритет №1) восстановлен.
  - `[low]` `[patch]` Scroll-lock leak: open-эффект не возвращал cleanup → размонтирование при открытой модалке (клиентская навигация) оставляло `body{overflow:hidden}`. Эффект перестроен: всегда возвращает cleanup, восстанавливающий `overflow` (покрывает close по любому пути И unmount-while-open).
  - `[low]` `[patch]` Focus не возвращался на карточку-триггер при закрытии: захватываем `triggerRef` в open-хендлере, рефокусим в cleanup open-эффекта (WCAG 2.4.3 dialog pattern; мы ввели focus-management — завершили его).
  - `[low]` `[patch]` Диалоги без доступного имени: добавлен `aria-label={detail.name}` на `.pd-panel`/`.pd-sheet` (в объёме floor «ARIA на оверлеях»).
- notes:
  - Отклонено 5: фон не `inert`/`aria-hidden` (механизм floor — `aria-modal=true`; прототип не гейтит фон); неинтерактивные `<div>` backdrop/grab (verbatim-прототип; Esc + `.pd-close` дают клавиатурный путь; lint чист); `noopener` без `noreferrer` (спек мандатит verbatim `rel=noopener`; reverse-tabnabbing покрыт, referer к маркетплейсу штатен); числовые имена thumbs (verbatim Phase-1 плейсхолдер-галерея, реальной смены фото нет); focus при ресайзе через 768px с открытой модалкой (само-восстанавливается по Tab; слушатель ради ничтожной выгоды).

### 2026-07-06 — Review pass (follow-up)
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 5: (high 0, medium 1, low 4)
- reject: 5
- addressed_findings:
  - none
- notes:
  - Follow-up-пасс по рекомендации предыдущего прохода (`followup_review_recommended: true`): независимо проверить его поведенческие правки — persist-`lastDetail` сквозь close-анимацию, lifecycle фокуса (capture `triggerRef` + restore в cleanup), scroll-lock с cleanup. Запущены два ревьюера БЕЗ контекста (Blind Hunter → `bmad-review-adversarial-general`, Edge Case Hunter → `bmad-review-edge-case-hunter`), оба на Opus. Оба НЕЗАВИСИМО ПОДТВЕРДИЛИ корректность островка: open/close по всем путям (backdrop/`.pd-close`/Esc/`.pd-grab`), scroll-lock+focus-restore в cleanup покрывают и unmount-while-open, set/trap/restore фокуса, гейтинг Esc, границы thumb, выравнивание `matchMedia('(min-width:768px)')`↔CSS-комплемента ровно на 768, инертность скрытой композиции (`.catalog-dk`/`.catalog-mb` `display:none`), чистота AD-9 (единственный `lib/offers`-импорт — `import type { Offer }`), уникальность всех 12 ключей `${brand} ${name}`, верность ~700-строчного CSS-порта. High-severity дефектов (корректность/безопасность/AD-9) нет. Кода не менялось — 0 patch, 0 bad_spec; поэтому `followup_review_recommended` этого прохода → `false`.
  - defer: 5 консолидированных записей (из 10 сырых находок ревьюеров), только НОВЫЕ записи в `deferred-work.md` (существующие не тронуты): **[medium]** motion open/close фактически не проигрывается — анимируемые `.pd-panel`/`.pd-sheet`/`.pd-backdrop` лежат внутри `.pd-modal`, который тем же style-коммитом флипает `display:none↔block` вместе с `.open`, а CSS-транзишн не стартует из `display:none`-поддерева → и вход, и выход мгновенно защёлкиваются. ВЕРНО воспроизводит прототип (`openDetail` в обоих HTML — bare `classList.add('open')`, без reflow/rAF), т.е. не регресс, но AC и reduced-motion-заметка спека предполагают проигрыш анимации, а motion-фиделити — приоритет №1; фикс кросс-каттинг и требует дизайн-решения (`@starting-style`+`transition-behavior:allow-discrete` на общем modal-паттерне ИЛИ `display`-first+rAF-`.open`), не unattended-патч. **[low]** мобильный свайп по карточке может провалиться в синтетический `click` и случайно открыть quick-view (5.2 passive-touch на `.pc-media` без `preventDefault`/suppress + активация 5.4 guard'ит только `.pc-arrow`, которого на mobile нет). **[low]** iOS Safari `body{overflow:hidden}` не держит фон за фикс. bottom-sheet. **[low]** хардненинг под динамические/CMS-данные (пустые `imgs`/`specs`/`fits`/`offers` → «View 1 of 0»/сиротские заголовки; value-derived React-ключи `key={f}`/`key={k}`/`key=${brand} ${name}` коллизят на дублях; дубль `${brand} ${name}` делает 2-й товар недостижимым через `details.find`; `ProductDetail` вручную зеркалит `Product`) — латентно: статические 12 товаров не триггерят. **[low]** дублирование строки дисклеймера island↔`lib/offers.ts` (`OFFER_DISCLAIMER`) — drift-риск, AD-9-safe вынос в pure-const модуль.
  - reject: 5 — **[low]** focus-restore на `display:none`-триггер после ресайза через 768px с ОТКРЫТОЙ модалкой (сиблинг уже-отклонённого resize-trap кейса; фокус уходит на `body`, восстановим по Tab; крайне узкий сценарий — ресайз через точный брейкпоинт при открытом оверлее); **[low]** `aria-labelledby`→`.pd-title` вместо добавленного прошлым проходом `aria-label` (текущий `aria-label={detail.name}` уже даёт доступное имя — floor выполнен, рефайнмент маргинален); **[low]** `.pd-scroll` не скроллится клавиатурой без `tabindex` (контент достижим по Tab к thumbs/офферам; verbatim-прототип); **[low]** `lastDetail` как «мёртвая сложность» (контингентно [medium]-motion; состояние безвредно, введено прошлым проходом намеренно — снятие откатило бы его фикс); **[low]** горизонтальный скачок из-за скрытия скроллбара на desktop-open (косметика; verbatim-прототип; `scrollbar-gutter:stable` — глобальное решение вне объёма).

## Design Notes

**Почему островок рендерит обе композиции.** AD-3: обе SSR-композиции в DOM, переключение только CSS. Порядок секций desktop vs mobile РАЗНЫЙ (desktop: fits в левой галерее; mobile: fits в конце info; офферы/спеки тоже переставлены) — чистым CSS-reorder не сводимо, поэтому обе структуры порождаются в JSX, а `.catalog-dk`/`.catalog-mb` + существующие медиа-правила гасят невидимую. Обе панели биндятся к одному `activeKey`/`thumb`.

**Ключ активации.** Карточки рендерит RSC `ProductCard` (5.2); островок их ENHANCE-ит (как `CatalogCardSlider`), читая `data-pd-key` и находя `ProductDetail` в пропе. `details` строится из всех 12 товаров (desktop-представители дублируют mobile-карточки по ключу — один и тот же `data-pd-key`, одна деталь; на вьюпорте кликабельна лишь видимая композиция).

**`stars()` VERBATIM:**
```tsx
{[1,2,3,4,5].map((k) => (
  <svg key={k} className={k <= Math.round(rating) ? 'on' : 'off'} viewBox="0 0 24 24" stroke="none">
    <path d="m12 17.3-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7z" />
  </svg>
))}
```

**Focus-trap.** На открытии фокус на `.pd-close` видимой панели; keydown-Tab циклит фокусируемые внутри активной панели (выбор панели — `matchMedia('(min-width:768px)').matches`). Это управление фокусом, не гейтинг композиции.

**Reduced-motion.** Прототип НЕ гейтит вход модалки под `prefers-reduced-motion` — порт verbatim (транзишн краткий, user-initiated); RM-гейтинг marquee — Story 5.5.

## Verification

**Commands:**
- `npx tsc --noEmit` -- expected: типы сходятся; `ProductDetail`/`Offer` сериализуемы, `ProductLines` строит `details`
- `npm run lint` -- expected: чисто; `@next/next/no-img-element` уже заглушен в `FaviconImg`
- `npm run build` -- expected: `/catalog` собирается (островок — client, страница RSC)
- `grep -rn "lib/offers" src --include=*.tsx | xargs grep -l "use client"` -- expected: пусто (AD-9)

**Manual checks:**
- Desktop `/catalog`: клик по карточке → центрированная модалка (2 колонки), thumbs листают счётчик, офферы кликабельны (нов. вкладка), Esc/backdrop/× закрывают, фон заблокирован; вход scale.
- Mobile ≤768px: клик → bottom-sheet с grab-хэндлом, порядок секций как в mobile-прототипе, grab/backdrop/× закрывают.
- Сверить `.pd-*` пиксель и порядок секций с обоими прототипами; клик по стрелке слайдера НЕ открывает модалку.

## Auto Run Result

Status: done

**Implemented change:** Story 5.4 — quick-view товара. Введён листовой `'use client'`-островок `ProductQuickView.client.tsx`, который ENHANCE-ит уже отрисованные `.product-card[data-pd-key]` (клик/Enter/Space открывают, `.pc-arrow` guard) и рендерит ОБЕ композиции в одном DOM (AD-3): desktop-модалку `.pd-panel` (2-колоночный `.pd-grid`, fits в галерее) и mobile-bottom-sheet `.pd-sheet` (+`.pd-grab`, иной порядок секций) — видимость выбирает CSS-медиа 768px через `.catalog-dk`/`.catalog-mb`. Галерея с thumbs-переключением (счётчик «View N of M»), рейтинг-звёзды, спеки, `Compatibility — fits`, офферы как внешние ссылки (`target=_blank rel=noopener`) + дисклеймер. Офферы вычислены СЕРВЕРНО в `ProductLines` (`buildOffers` по линии) и переданы островку сериализуемым пропсом `details: ProductDetail[]`; островок импортирует лишь `type { Offer }` (AD-9). `.pd-*` CSS портирован из обоих прототипов (desktop под `@media(min-width:768px)`/`.catalog-dk`, mobile под комплемент/`.catalog-mb`), сырые vars → DS-токены. Закрытие: backdrop/`.pd-close`/Esc/`.pd-grab`; body scroll-lock; focus-trap видимой панели.

**Files changed:**
- `src/components/catalog/ProductQuickView.client.tsx` — НОВЫЙ островок (обе композиции, state `activeKey`/`thumb`/`lastDetail`, wiring карточек, focus-trap/Esc/backdrop/grab, scroll-lock+focus-restore cleanup, `stars()`/иконки/разметка VERBATIM, `type { Offer }`).
- `src/components/catalog/ProductLines.tsx` — сборка `allDetails` (серверный `buildOffers` по линии) + монтаж `<ProductQuickView details={allDetails} />`.
- `src/components/catalog/ProductCard.tsx` — `data-pd-key` на `.product-card`; обновлён хедер-коммент (активация — 5.4).
- `src/styles/catalog.css` — `.pd-*` desktop+mobile (~700 строк) под соответствующие медиа/скоуп; vars→DS-токены; `'Poppins'`→`var(--font-display)`; прототипный `@media(max-width:760px)` grid-collapse опущен как мёртвый под `.catalog-dk` (коммент).

**Review findings breakdown:** patches applied: 4 (1 medium — exit-animation content pop / persist-last-detail; 3 low — scroll-lock unmount cleanup, focus-restore on close, dialog `aria-label`) · deferred: 0 · rejected: 5 (фон inert/aria-hidden, неинтерактивные backdrop/grab divs, `noreferrer`, числовые thumbs-имена, resize-across-768px focus — все либо verbatim-прототип/вне a11y-floor, либо само-восстанавливающийся крайний случай). Пиксель карточки/слайдера не изменён (добавлен лишь `data-pd-key`).

**Verification:** `npx tsc --noEmit` — PASS; `npm run lint` — PASS; `npm run build` — PASS (`/catalog` prerendered static). AD-9 guard: единственный импорт `lib/offers` в `'use client'`-островке — `import type { Offer }` (стирается при компиляции).

**Follow-up review recommended:** true — финальный ревью-пасс внёс поведенческое изменение модели рендера/состояния (persist-last-detail сквозь close-анимацию) плюс изменения lifecycle фокуса и scroll-lock; хотя всё локализовано в одном островке и зелёно по tsc/lint/build, независимая проверка open/close/focus-жизненного цикла добавит уверенности.

**Residual risks:** Пиксель/motion модалки и bottom-sheet визуально не сверены в браузере на всех брейкпоинтах (проверено сборкой/статикой, не рендером) — финальная пиксель-приёмка (SM-1) по чеклисту остаётся; `matchMedia` для выбора видимой панели сэмплируется на open/Tab (ресайз через 768px с открытой модалкой — принятый крайний случай).

---

### 2026-07-06 — Follow-up review pass

**Изменение:** кода НЕ менялось. Это отдельный, независимый ревью-проход, запущенный по `followup_review_recommended: true` предыдущего прогона, чтобы перепроверить его поведенческие правки (persist-`lastDetail` сквозь close-анимацию, lifecycle фокуса, scroll-lock+focus-restore cleanup). Два ревьюера без контекста (Blind Hunter → `bmad-review-adversarial-general`, Edge Case Hunter → `bmad-review-edge-case-hunter`, оба Opus) прошлись по диффу от baseline `ea7b5d1`.

**Итог:** оба ревьюера НЕЗАВИСИМО подтвердили корректность островка — open/close по всем путям, scroll-lock с cleanup (в т.ч. unmount-while-open), set/trap/restore фокуса, гейтинг Esc, границы thumb, выравнивание `matchMedia`↔CSS на 768px, инертность скрытой композиции, чистота AD-9 (`import type { Offer }`), уникальность 12 ключей, верность CSS-порта. High-severity дефектов (корректность/безопасность/AD-9) нет; спек-девиаций нет.

**Files changed:** код — нет. `deferred-work.md` — +5 НОВЫХ записей (существующие не тронуты). Сам спек — новая запись в `## Review Triage Log` + этот блок.

**Review findings breakdown:** intent_gap 0 · bad_spec 0 · patch 0 · **defer 5** (консолидируют 10 сырых находок: [medium] motion open/close не проигрывается из-за `display:none`-тоггла `.pd-modal` — верно к прототипу, но AC обещает анимацию; [low] мобильный свайп→случайный open; [low] iOS scroll-lock за bottom-sheet; [low] хардненинг под CMS/динамические данные — пустые массивы/value-derived ключи/зеркало `ProductDetail`; [low] дублирование дисклеймера island↔`lib/offers.ts`) · **reject 5** (resize-across-768 focus-restore, `aria-labelledby`-рефайнмент, keyboard-scroll `.pd-scroll`, `lastDetail` как dead-code контингентно motion, scrollbar-gutter-скачок — все verbatim-прототип/вне floor/само-восстанавливающиеся).

**Verification:** кода не менялось → зелёные `npx tsc --noEmit` / `npm run lint` / `npm run build` из основного прогона держатся; AD-9-guard (`grep -rn "lib/offers"` в `'use client'` = только `import type`) неизменен. Проверка — независимый двойной adversarial-ревью диффа + ручная сверка с обоими прототипами (`openDetail`/CSS `.pd-modal`) для motion-находки.

**Follow-up review recommended:** `false` — этот проход не внёс review-driven изменений (0 patch, 0 bad_spec); он лишь независимо подтвердил корректность правок предыдущего прохода. Дальнейший авто-ревью-цикл не даст выгоды; остаток — отложенные (defer) элементы для сфокусированных проходов и браузерная пиксель/motion-приёмка.

**Residual risks (follow-up):** [medium]-находка (motion фактически не проигрывается) отложена как кросс-каттинг дизайн-решение — до её разбора вход/выход quick-view защёлкиваются мгновенно, вопреки AC; браузерная пиксель/motion-приёмка по-прежнему не выполнена; мобильные свайп-open и iOS scroll-lock отложены и требуют реального устройства.
