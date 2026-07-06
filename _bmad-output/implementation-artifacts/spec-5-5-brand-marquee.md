---
title: 'Story 5.5 — Marquee брендов'
type: 'feature'
created: '2026-07-06'
status: 'done'
baseline_revision: 'f7fc9001d2d94c11f4f14705ad4da76939adf58d'
final_revision: '53057465e9088ea1290ed0c3693b63aa81c5c5d2'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/rollun_handoff/rollun-web-site/project/Catalog.html'
  - '{project-root}/rollun_handoff/rollun-web-site/project/Catalog Mobile.html'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** У страницы Catalog нет последней секции эпика 5 — brands-wall (05): marquee знакомых брендов-производителей, подтверждающий масштаб партнёрской сети (две ленты Automotive/Health) и фирменный desktop-интерактив «fly-to-center» спотлайт по клику на лого.

**Approach:** Портировать секцию `.brands-wall` VERBATIM из обоих Handoff-прототипов как RSC-компонент `BrandMarquee` (обе композиции `.catalog-dk`/`.catalog-mb` в одном DOM, переключение только CSS-медиа 768px); бренды — новое чистое поле `catalogContent.brands`; desktop fly-to-center спотлайт — листовой `'use client'`-островок, скоупленный на `.catalog-dk`.

## Boundaries & Constraints

**Always:**
- Пиксель-в-пиксель по обоим прототипам на всех брейкпоинтах (приоритет №1). Обе композиции SSR-рендерятся в DOM (AD-3); видимую выбирает ТОЛЬКО CSS-медиа 768px через `.catalog-dk`/`.catalog-mb`. Без JS-гейтинга/UA-сниффинга.
- Разметка секции VERBATIM: `.brands-wall > .container?(dk) > .bw-head(eyebrow+title+p) + .bw-cat + .logo-marquee>.logo-track + .bw-cat + .logo-marquee>.logo-track.rev`. Desktop оборачивает содержимое в `.container`, mobile — нет (как в `CtaSection`).
- Marquee: прямая лента `.logo-track` (auto) `marquee-left`, обратная `.logo-track.rev` (health) `marquee-right`; краевая mask-маска; пауза по hover (desktop). Durations: desktop 48s/34s, mobile 40s/30s; tile 66px/54px; mask 7%/93% (dk) и 9%/91% (mb).
- **Seamless-loop:** keyframe `translateX(0→-50%)` требует, чтобы каждая лента состояла ровно из 2 идентичных половин → auto = `brands`×2 (14×2=28), health = `brands`×8 (3×8=24). Совпадает и с desktop-разметкой, и с mobile `fill(auto,2)`/`fill(health,8)`.
- `prefers-reduced-motion` выключает авто-скролл лент и `transition` спотлайта (через уже-существующие в порте media-правила `.logo-track{animation:none}` и `.ls-fly{transition:none}`).
- Тайлы: auto — `.logo-tile.linkless` (`<div>`, без href, некликабельный курсор), health — `<a class="logo-tile" target="_blank" rel="noopener">`. Favicon — через `FaviconImg` (AD-11, единственный remote-asset), sz=128.
- Спотлайт-островок ENHANCE-ит ТОЛЬКО `.catalog-dk .logo-tile`; overlay (`.logo-spot`/`.ls-fly`) создаётся на `document.body`. Mobile-тайлы остаются инертны (mobile-прототип спотлайта не имеет).
- Страница остаётся чистой функцией `catalogContent`; бренды — из `catalogContent.brands` (типизировано, typecheck-совместимо с будущим Payload), НЕ хардкод в разметке.
- Raw prototype vars → DS-токены: `--or`→`--color-or`, `--or-deep`→`--color-or-deep`, `--ink`→`--color-ink`, `--ink-mute`→`--color-ink-mute`, `--dark`→`--color-dark`, `--line`→`--color-line`.
- Секция монтируется МЕЖДУ `<ProductLines>` и `<CtaSection>` (порядок 05 Brands → 06 CTA).

**Block If:**
- Прототипы `Catalog.html` / `Catalog Mobile.html` отсутствуют или нечитаемы.
- Требуется структурное решение, не выводимое verbatim из прототипа (например неразрешимый конфликт desktop↔mobile разметки).

**Never:**
- Не менять уже готовые секции (Hero/Entrances/ProductLines/Cta) — только смонтировать `BrandMarquee` в `page.tsx`.
- Не добавлять спотлайт/интерактив на mobile-композицию.
- Не хардкодить бренды в разметке; не использовать `next/image` для фавиконок; не JS-гейтить/UA-сниффить композиции.
- Не ломать существующие вызовы `FaviconImg` (новый проп — опциональный).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Клик по auto-тайлу (desktop) | `.catalog-dk .logo-tile.linkless` | fly-to-center спотлайт: fav + name + «Trusted partner brand» + «Click anywhere to close»; backdrop затемняется | No error |
| Клик по health-тайлу (desktop) | `.catalog-dk a.logo-tile[href]` | спотлайт с кнопкой «Visit website» (href, `target=_blank rel=noopener`) | клик по `.ls-visit` НЕ закрывает (даёт навигацию) |
| Закрытие спотлайта | открыт; Esc / клик по backdrop / клик по `.ls-fly` вне `.ls-visit` | обратная fly-back анимация к origin, затем remove | `transitionend` + 500ms fallback |
| Favicon не загрузился | img `error` или `naturalWidth===0` | `FaviconImg` прячет `<img>` (`visibility:hidden`); верстка цела | `onError` + mount-guard |
| `prefers-reduced-motion` | RM активен | ленты не крутятся; спотлайт открывается без transition | No error |
| Клик по mobile-тайлу | `.catalog-mb .logo-tile` | НИЧЕГО (инертен, как mobile-прототип) | No error |

</intent-contract>

## Code Map

- `src/content/catalog.ts` -- ПРАВКА: добавить `type CatalogBrand = { domain: string; name: string; href?: string }` и `type CatalogBrandsWall = { eyebrow: string; title: string; intro: CatalogVariant; autoCatLabel: string; healthCatLabel: string; auto: CatalogBrand[]; health: CatalogBrand[]; autoRepeat: number; healthRepeat: number }`; поле `brands: CatalogBrandsWall` в `CatalogContent` и инстансе. Данные VERBATIM из прототипа: eyebrow «Trusted partners», title «Brands we work with», intro dk/mb (см. Design Notes), auto[14] (Dunlop…Motul, linkless), health[3] (Ryno Power, Riders Gold · Liquid Fuel, Riders Gold · Full Throttle, с href), `autoRepeat:2`, `healthRepeat:8`.
- `src/components/catalog/BrandMarquee.tsx` -- НОВЫЙ RSC: обе композиции `.brands-wall` (dk — с `.container`, mb — без); `.bw-head`+два блока `.bw-cat`+`.logo-marquee`; тайлы = `Array.from({length:repeat}).flatMap(()=>brands)`; auto → `.logo-tile.linkless <div>`, health → `<a>`; favicon через `<FaviconImg domain size={128} className="fav" />`; имя в `.wm`. В конце монтирует `<BrandSpotlight />`.
- `src/components/catalog/BrandSpotlight.client.tsx` -- НОВЫЙ островок (`return null`): порт VERBATIM `openFrom`/`close` (createElement `.logo-spot`+`.ls-fly`, `getBoundingClientRect`, reflow, transition к центру `min(360,vw-48)`), читает name/href/fav из кликнутого тайла; слушатели скоуплены на `.catalog-dk .logo-tile`; backdrop-click/Esc/click-вне-`.ls-visit` закрывают; cleanup снимает слушатели и remove overlay.
- `src/components/catalog/FaviconImg.client.tsx` -- ПРАВКА: добавить опциональный `size?: number` (default 64) → `&sz=${size}`; существующие вызовы (`ProductCard`, чипы) не меняются.
- `src/app/(site)/catalog/page.tsx` -- ПРАВКА: импорт + `<BrandMarquee brands={catalogContent.brands} />` между `<ProductLines>` и `<CtaSection>`; обновить хедер-коммент (05 Brands больше не «Story 5.5» TODO).
- `src/styles/catalog.css` -- ПРАВКА: в `@layer components` портировать `.brands-wall/.bw-head/.bw-cat/.logo-marquee/.logo-track(.rev)/.logo-tile/.fav/.wm/keyframes marquee-left|right` — desktop-значения под `@media (min-width:768px)` scoped `.catalog-dk`, mobile под `@media not all and (min-width:768px)` scoped `.catalog-mb`; спотлайт `.logo-spot/.ls-backdrop/.ls-fly/.ls-content/.ls-name/.ls-visit/.ls-hint` — ГЛОБАЛЬНО (не под `.catalog-*`, т.к. overlay на `body`), включая их `prefers-reduced-motion`-правила; vars→DS-токены.
- ИСТОЧНИКИ (verbatim): `Catalog.html` — CSS спотлайта 565-623, brands 759-850; HTML 1077-1146; JS спотлайта 1250-1340. `Catalog Mobile.html` — CSS 254-270; HTML 515-526; JS `fill` 630-638.

## Tasks & Acceptance

**Execution:**
- [x] `src/content/catalog.ts` -- добавить `CatalogBrand`/`CatalogBrandsWall` + `brands` в типе и инстансе (14 auto linkless, 3 health с href, repeat 2/8, intro dk/mb) -- бренды как чистые данные, Payload-ready; страница остаётся функцией контента
- [x] `src/components/catalog/FaviconImg.client.tsx` -- опциональный `size` проп (default 64) -- marquee требует sz=128 без регресса текущих вызовов
- [x] `src/components/catalog/BrandMarquee.tsx` -- НОВЫЙ RSC: обе композиции brands-wall, тайлы из `brands`×repeat, auto `.linkless <div>` / health `<a>`, `FaviconImg` sz=128, монтаж `<BrandSpotlight/>` -- секция 05 пиксельно матчит оба прототипа
- [x] `src/components/catalog/BrandSpotlight.client.tsx` -- НОВЫЙ островок: VERBATIM fly-to-center, scoped `.catalog-dk .logo-tile`, Esc/backdrop/click-close, cleanup -- desktop-интерактив, mobile инертен
- [x] `src/styles/catalog.css` -- порт brands+spotlight CSS (dk под min-width:768px/`.catalog-dk`, mb под комплемент/`.catalog-mb`, spotlight глобально), vars→DS-токены -- пиксель лент/тайлов/спотлайта на обоих брейкпоинтах
- [x] `src/app/(site)/catalog/page.tsx` -- смонтировать `<BrandMarquee>` между lines и CTA, обновить коммент -- секция в правильном порядке 05→06
- [x] Юнит-тест (ПРОПУЩЕН — тест-раннера в проекте нет, как в 5.1–5.4) -- I/O-матрица проверяется вручную/`build`

**Acceptance Criteria:**
- Given `/catalog` desktop ≥768px, when страница отрисована, then между Product lines и CTA видна секция 05 Brands: `.bw-head` (eyebrow «Trusted partners», title «Brands we work with», intro), `.bw-cat` «Automotive & Motorcycle» над прямой лентой (14 брендов ×2, `marquee-left` 48s, тайлы `.linkless`), `.bw-cat` «Health & Wellness» над обратной лентой (`.rev`, 3×8, `marquee-right` 34s, тайлы `<a>`); краевая маска; hover ставит ленту на паузу.
- Given desktop, when клик по `.logo-tile`, then fly-to-center спотлайт из origin-геометрии тайла: auto → «Trusted partner brand», health → «Visit website» (внешняя ссылка `target=_blank rel=noopener`); Esc / backdrop / клик-вне-`.ls-visit` закрывают обратной анимацией.
- Given mobile <768px, when страница отрисована, then секция brands с mobile-значениями (tile 54px, durations 40s/30s, mask 9%/91%, без `.container`); тайлы инертны (клик ничего не делает); desktop-композиция `display:none`.
- Given `prefers-reduced-motion`, then ленты не анимируются и спотлайт открывается без transition.
- Given проект, then страница = чистая функция `catalogContent` (бренды из `catalogContent.brands`); обе композиции в DOM без JS-гейтинга; `tsc`/`lint`/`build` проходят.

## Spec Change Log

<!-- Append-only. Empty until the first bad_spec loopback. -->

## Review Triage Log

<!-- Append-only. Empty until the first review pass. -->

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 0, low 2)
- defer: 4: (high 0, medium 1, low 3)
- reject: 11
- addressed_findings:
  - `[low]` `[patch]` Spotlight injected favicon `<img>` had no `onerror`: `BrandMarquee` reuses `FaviconImg`, which on failure only HIDES the tile favicon (`visibility:hidden`) rather than the prototype's `this.remove()`, so `openFrom`'s `querySelector('.fav')` still finds it and injected its (broken) `.src` into the 92px `.ls-fly` card → broken-image glyph on any favicon failure. Added `onerror="this.remove()"` to the injected img (mirrors the prototype tile favicons); happy-path pixel unchanged, degradation now graceful.
  - `[low]` `[patch]` Misleading `CatalogBrand` doc comment called the `.linkless` Automotive tiles "non-clickable" — they carry no href but DO open a "Trusted partner brand" spotlight. Corrected to "no-href `.linkless <div>` that still opens a spotlight but never navigates."
- notes:
  - defer: 4 (new entries only in `deferred-work.md`): **[medium]** spotlight a11y — no dialog role/aria-modal/focus-trap/restore and Automotive `.linkless` tiles are non-focusable click-only `<div>`s, so the decorative spotlight is mouse-only (Health tiles remain focusable `<a href>` — the actionable path; Automotive card has no actionable content); out of scope per the epic's basic Accessibility Floor + "pixel > a11y" + verbatim mandate. **[low]** favicon hide-vs-remove leaves a permanent 34px gutter for a failed/placeholder favicon (vs prototype collapse) — latent, static good-domain favicons resolve. **[low]** `prefers-reduced-motion` `animation:none` pins the double-width track at `translateX(0)`, clipping later brands with no scroll fallback — verbatim/spec-mandated RM behavior but a content-reachability gap. **[low]** dynamic-content fragility — island binds a one-time tile snapshot (empty deps) and the seamless loop needs even `repeat`≥2; both correct for static content, brittle under future CMS data (pairs with the 5.2–5.4 Payload-seam deferrals).
  - reject: 11 — verbatim-prototype fidelity or non-defects: `innerHTML` build of trusted static name/href/src (no present injection; verbatim); `rel="noopener"` without `noreferrer` (spec mandates verbatim `rel=noopener`); stale `getBoundingClientRect` origin on close under the always-animating marquee (verbatim); `transitionend {once:true}` firing on the first of 6 equal-duration props (verbatim + 500ms fallback); both compositions duplicated in DOM (AD-3 by design); resize-while-open (no prototype handling; narrow); no scroll-lock behind backdrop (verbatim); pending `setTimeout(20/500)` not `clearTimeout`-ed on unmount (benign — cleanup removes nodes and `if(!fly)` guards, no observable defect); clicking a second tile while open is a no-op (unreachable — the fixed inset-0 backdrop covers all tiles); redundant `.logo-tile:not(.linkless){cursor:pointer}` CSS (verbatim from prototype); `close()` inside the 20ms pre-zoom window skipping `transitionend` (narrow; self-heals via the 500ms fallback; verbatim).

## Design Notes

**Seamless -50% loop.** `@keyframes marquee-left { 0%→translateX(0); 100%→translateX(-50%) }` бесшовна только если лента = 2 идентичные половины. auto: `autoRepeat=2` → `[14][14]`, при -50% показывается вторая половина, идентичная первой. health: `healthRepeat=8` → `[3×8]=24` = две половины по 12 (3×4). Это ТОЧНО воспроизводит оба прототипа (desktop-разметка auto 2×/health 8×; mobile `fill(auto,2)`/`fill(health,8)`). Компонент рендерит `Array.from({length:repeat}).flatMap(()=>brands)`.

**Intro-варианты (VERBATIM):** dk — «We distribute and resell products from established manufacturers across both of our product lines.»; mb — «…across both product lines.» (без «of our»). Отсюда `intro: CatalogVariant`.

**Спотлайт — imperative-порт.** Прототип создаёт `.logo-spot`/`.ls-fly` через `createElement`, позиционирует по `getBoundingClientRect`, форсит reflow и транзишит к центру. Порт VERBATIM в `useEffect` (как в `ProductQuickView`): читает name/href/`.fav` из кликнутого тайла (НЕ из пропсов — островок не связан с контентом). Overlay живёт на `document.body`, поэтому CSS `.logo-spot/.ls-*` — глобальные (не под `.catalog-dk`), position:fixed.

**Почему островок скоуплен на `.catalog-dk`.** Mobile-прототип спотлайта не имеет; scope держит mobile-тайлы инертными и исключает двойной биндинг к скрытой desktop-композиции (обе в DOM). Это управление интерактивом, не гейтинг композиции.

**FaviconImg `size`.** Marquee показывает favicon 34px (desktop) → sz=128 резче, чем дефолт sz=64. Проп опционален, дефолт 64 сохраняет все текущие вызовы. Hide-on-error (`visibility:hidden`) удовлетворяет empty-state эпика («onerror прячет img, верстка не рушится») и держит консистентность с остальным каталогом.

## Verification

**Commands:**
- `npx tsc --noEmit` -- expected: типы сходятся; `CatalogBrandsWall` сериализуем, `brands` заполнен
- `npm run lint` -- expected: чисто (`@next/next/no-img-element` уже заглушен в `FaviconImg`)
- `npm run build` -- expected: `/catalog` собирается (`BrandMarquee` RSC, `BrandSpotlight` client)

**Manual checks:**
- Desktop ≥768px `/catalog`: секция 05 между lines и CTA; auto-лента влево 48s, health-лента вправо 34s; hover пауза; клик по тайлу → fly-to-center спотлайт (health «Visit website» открывает вкладку, auto «Trusted partner brand»); Esc/backdrop/клик закрывают.
- Mobile <768px: секция меньше/быстрее (54px, 40s/30s), тайлы не реагируют на клик; desktop-композиция скрыта.
- `prefers-reduced-motion`: ленты стоят, спотлайт без анимации.
- Сверить `.brands-wall`/`.logo-*`/`.ls-*` пиксель с обоими прототипами.

## Auto Run Result

Status: done

**Implemented change:** Story 5.5 — секция 05 «Brands we work with» на Catalog: marquee знакомых брендов + desktop fly-to-center спотлайт. Порт VERBATIM из обоих Handoff-прототипов. Новый RSC `BrandMarquee.tsx` рендерит ОБЕ композиции в одном DOM (AD-3) — desktop `.catalog-dk` (в `.container`) и mobile `.catalog-mb` (без) — переключение только CSS-медиа 768px; `.bw-head` (eyebrow/title/intro-вариант) + два блока `.bw-cat`+`.logo-marquee`>`.logo-track`: auto прямая лента (14 брендов ×2, `marquee-left` 48s/40s, тайлы `.linkless <div>`), health обратная `.rev` (3 бренда ×8, `marquee-right` 34s/30s, тайлы внешние `<a target=_blank rel=noopener>`). Каждая лента = 2 идентичные половины → бесшовный `translateX(0→-50%)`. Favicon через `FaviconImg` (AD-11) с новым опциональным `size`-пропом (sz=128). Desktop-спотлайт — листовой островок `BrandSpotlight.client.tsx` (`return null`): VERBATIM-порт `openFrom`/`close` (создаёт `.logo-spot`/`.ls-fly` на `document.body`, `getBoundingClientRect`→reflow→transition к центру), скоуплен на `.catalog-dk .logo-tile` (mobile-тайлы инертны, как в mobile-прототипе); Esc/backdrop/клик-вне-`.ls-visit` закрывают; cleanup снимает все слушатели и overlay. Бренды — новое чистое поле `catalogContent.brands` (типы `CatalogBrand`/`CatalogBrandsWall`, Payload-ready). CSS портирован в `catalog.css` (`@layer components`): brands-правила dk под `@media(min-width:768px)`/`.catalog-dk`, mb под комплемент/`.catalog-mb`; спотлайт `.logo-spot`/`.ls-*` — глобально (overlay на body); keyframes один раз; общий `prefers-reduced-motion`-блок; сырые vars → DS-токены. Смонтировано в `page.tsx` между `<ProductLines>` и `<CtaSection>` (порядок 05→06).

**Files changed:**
- `src/content/catalog.ts` — типы `CatalogBrand`/`CatalogBrandsWall` + поле `brands` в `CatalogContent` и инстансе (14 auto linkless, 3 health с href, `autoRepeat:2`/`healthRepeat:8`, intro dk/mb); коммент уточнён (patch).
- `src/components/catalog/BrandMarquee.tsx` — НОВЫЙ RSC: обе композиции brands-wall, тайлы `brands`×repeat, `FaviconImg size={128}`, монтаж `<BrandSpotlight/>`.
- `src/components/catalog/BrandSpotlight.client.tsx` — НОВЫЙ островок: VERBATIM fly-to-center, scoped `.catalog-dk`, cleanup; инжектируемый img получил `onerror="this.remove()"` (patch).
- `src/components/catalog/FaviconImg.client.tsx` — опциональный `size` проп (default 64, sz=${size}); текущие вызовы не тронуты.
- `src/styles/catalog.css` — порт brands+spotlight CSS (dk/mb + глобальный спотлайт + keyframes + RM), vars→DS-токены.
- `src/app/(site)/catalog/page.tsx` — импорт + `<BrandMarquee>` между lines и CTA; коммент обновлён.

**Review findings breakdown:** 1 review pass. intent_gap 0, bad_spec 0. **patch 2** (оба low, применены): (1) `onerror` на инжектируемом спотлайт-`<img>` — т.к. `FaviconImg` ПРЯЧЕТ упавшую фавиконку (не `.remove()`), её src иначе давал broken-image в 92px карточке; (2) исправлен вводящий в заблуждение коммент «non-clickable» у `.linkless`-тайлов. **defer 4** (1 medium, 3 low — новые записи в `deferred-work.md`): спотлайт-a11y (mouse-only, decorative, вне floor); favicon hide-vs-remove гэп (латентно); RM-обрезание marquee (verbatim); dynamic/CMS-хрупкость (snapshot + чётность repeat). **reject 11**: verbatim-фиделити прототипа или не-дефекты (innerHTML доверенного статик-контента; `rel=noopener` без `noreferrer` — спек мандатит verbatim; stale origin при анимации; `transitionend` на первом из 6 свойств + 500ms fallback; дубль обеих композиций — AD-3; resize-while-open; отсутствие scroll-lock; неочищенные таймеры на unmount — benign; клик по 2-му тайлу — недостижим за backdrop; редундантный `:not(.linkless)` CSS — verbatim; close в 20ms-окне — self-heals).

**Follow-up review recommendation:** false — финальный проход применил лишь 2 локальных low-патча (guard инжектируемого img + коммент), без изменений API/поведения happy-path/безопасности.

**Verification:** `npx tsc --noEmit` → PASS (exit 0); `npm run lint` → PASS/clean (exit 0); `npm run build` → PASS, `/catalog` собирается статически (exit 0). Перезапущены независимо ПОСЛЕ патчей — все три зелёные. Разметка/CSS/JS сверены с `Catalog.html` (CSS 565-623/759-850, HTML 1077-1146, JS 1250-1340) и `Catalog Mobile.html` (CSS 254-270, HTML 515-526, JS 630-638).

**Residual risks:** Все отложенные (deferred) — латентны при текущем статичном контенте (14+3 бренда с рабочими Google-фавиконками, чётный repeat): спотлайт-a11y и favicon-гэп проявятся лишь при провале фавиконки/клавиатурном пути; RM-обрезание — принятый verbatim-трейдоф; dynamic-хрупкость активируется при переезде `brands` на Payload (Фаза 2). Пиксель-приёмка (SM-1 чеклист) — визуальная сверка на устройствах вне объёма unattended-прогона.
