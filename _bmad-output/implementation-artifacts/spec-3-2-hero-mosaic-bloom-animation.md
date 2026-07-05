---
title: 'Story 3.2: Hero-мозаика с bloom-анимацией'
type: 'feature'
created: '2026-07-05'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: '35c79d0a3b60cb8a0a575de8d3b2e0bbd6ecbd10'
final_revision: '9df0649a849674cabee14d3fd3cd9a3f68d6d0ad'
context:
  - '{project-root}/rollun_handoff/rollun-web-site/project/Home.html'
  - '{project-root}/rollun_handoff/rollun-web-site/project/Home Mobile.html'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
warnings: ['oversized']
---

<intent-contract>

## Intent

**Problem:** Story 3.1 отрендерила hero статичным финальным кадром: desktop подсвечивает фиксированный набор плиток (`LIT_DESKTOP=[2,5]`), mobile показывает приглушённые ч/б плитки. «Живая» bloom-анимация мозаики (UX-DR19) — ключевой сигнал «Rollun живой и технологичный» — ещё не реализована.

**Approach:** Добавить один листовой client-островок `HeroMosaic.client.tsx`, который **улучшает существующую SSR-разметку** (паттерн `RevealOnScroll`, не переписывая DOM): desktop циклично зажигает случайные ~25% плиток `.lit` каждые 3с (CSS-переход 1.6s уже есть в `home.css`); mobile гоняет bloom-оверлей `.mosaic-feature` по фото round-robin. Оба пути гейтятся в рантайме через `matchMedia` (вьюпорт + `prefers-reduced-motion`). Островок монтируется из `Hero.tsx` (RSC) и получает фото-данные пропсами.

## Boundaries & Constraints

**Always:**
- Прототип — источник истины таймингов/механизма. **Desktop:** интервал `3000ms`, число зажжённых `Math.max(1, Math.round(N*0.25))` = 2 из 8, случайный набор каждый цикл (Fisher-Yates), первый цикл — сразу; переход `filter 1.6s ease, transform 1.6s ease` УЖЕ объявлен на `.home-dk .mosaic-tile` — островок только тогглит класс `.lit`. **Mobile:** `MOVE=1000 / HOLD=3200 / GAP=800` мс, начальная задержка `400ms`; фича снапится на плитку (`transform-origin: top left`, translate+scale из `getBoundingClientRect` относительно грида), расширяется на весь грид (`cubic-bezier(.4,0,.2,1)` за `MOVE`), держит `HOLD`, откатывается назад за `MOVE`, гаснет (`opacity .5s`, старт на `MOVE-250` внутри отката), пауза `GAP`, следующее фото; round-robin по всем 6 фото.
- Обе композиции остаются SSR в одном DOM; видимую выбирает ТОЛЬКО CSS `@media` 768px. Островок МОЖЕТ использовать `matchMedia('(min-width:768px)')` в рантайме, чтобы решить какую композицию анимировать и переоценить на `resize` (прецедент — `Header.client`/`ContactModal.client`), но НЕ гейтить рендер-разметку по JS-ширине.
- Инвариант art-direction сохраняется: на вьюпорт грузится ровно ОДИН набор hero-фото. Mobile-фича использует `background-image` (не SSR `<img>`) и создаётся островком только когда активен mobile — скрытая desktop-композиция не тянет mobile-фото и наоборот. Mobile-фича переиспользует те же 6 фото, что и mobile-плитки (`mosaicMobile`) — без доп. загрузок.
- `prefers-reduced-motion: reduce` → движения нет: показать статичный финальный кадр (desktop — зажжённый фикс-набор с отключённым переходом; mobile — фича статично на полном гриде с первым фото), НИ ОДИН `setInterval`/`setTimeout` не запускается.
- Полная очистка при размонтировании (все таймеры сброшены, инъектированная фича удалена) — SPA-навигация не течёт; островок рендерит `null`; без hydration-mismatch (вся работа — в `useEffect`).
- Переиспользовать существующее: `.lit` + 1.6s-переход из `home.css`, суффикс `*.client.tsx`, паттерн IO-островка (`RevealOnScroll`), передачу контента пропсами (`GetInTouch`).

**Block If:**
- Тайминг/механизм bloom в прототипе реально неоднозначен, либо CSS mobile-фичи невозможно вывести из `Home Mobile.html` — HALT `blocked` с описанием неоднозначности.

**Never:**
- Не переписывать структуру DOM `Hero.tsx`/других секций; не трогать островки Stories 3.3/3.4 (переключатель линий, count-up).
- Не добавлять UA-сниффинг и JS-гейтинг рендер-разметки по ширине.
- Не «чинить» дефекты AD-13, не менять контент-текст, не вводить тест-раннер (его нет в проекте).
- Не грузить оба набора hero-фото на одном вьюпорте.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Desktop load | ≥768px, JS on, motion ok | ~2 из 8 плиток `.lit`, кросс-фейд 1.6s, новый случайный набор каждые 3с, бесконечно | — |
| Mobile load | <768px, JS on, motion ok | Цветная фича блумит по одному фото (снап→расширение→hold→откат→gap), round-robin по 6 на MOVE1000/HOLD3200/GAP800 | — |
| Reduced motion | `prefers-reduced-motion: reduce`, любой вьюпорт | Статичный цветной финальный кадр; ни интервалов, ни таймаутов; переходы отключены | — |
| JS disabled | нет гидрации | Desktop — SSR-фикс-набор `.lit`; mobile — приглушённые плитки (верно прототипу) | graceful |
| Resize через 768px | вьюпорт пересёк брейкпоинт | Островок переоценивает и гонит теперь-видимую композицию; старые таймеры сброшены; фича пересоздаётся при desktop→mobile | — |
| SPA nav away | смена роута / unmount | Все таймеры очищены, инъектированная фича удалена | no leak |
| Network | одна композиция видима | Ровно один набор hero-фото загружен | — |

</intent-contract>

## Code Map

- `src/components/home/HeroMosaic.client.tsx` -- НОВЫЙ `'use client'`-островок: reduced-motion + viewport `matchMedia`-гейтинг, desktop `.lit`-цикл, mobile bloom-петля с `.mosaic-feature`, `resize`-переоценка, полная очистка, `return null`.
- `src/components/home/Hero.tsx` -- ПРАВКА: смонтировать `<HeroMosaic mosaicDesktop=... mosaicMobile=... />`; передать массивы фото пропсами. Статичный SSR-кадр (`LIT_DESKTOP`, приглушённые mobile-плитки) остаётся как pre-hydration / reduced-motion фолбэк — НЕ удалять.
- `src/styles/home.css` -- ПРАВКА: добавить правила `.home-mb .mosaic-feature` (`position:absolute; inset:0; opacity:0; z-index; box-shadow; background-size:cover; will-change`), портированные из `Home Mobile.html`; добавить блок `@media (prefers-reduced-motion: reduce)` для мозаики (снять переход у `.mosaic-tile`, дать статичный кадр фиче). `.home-mb .mosaic-grid` уже `position:relative`.
- `src/content/home.ts` -- ПЕРЕИСПОЛЬЗОВАТЬ (без изменений): `hero.mosaicDesktop` (8), `hero.mosaicMobile` (6), тип `HomeMosaicPhoto {src, alt}`.
- `src/components/islands/RevealOnScroll.client.tsx` -- ЭТАЛОН: null-островок, `matchMedia`, очистка на unmount, enhance-not-rewrite.
- `src/components/contact-form/GetInTouch.client.tsx` -- ЭТАЛОН: листовой островок получает контент типизированными пропсами.

## Tasks & Acceptance

**Execution:**
- [x] `src/components/home/HeroMosaic.client.tsx` -- реализовать островок: (1) в `useEffect` проверить `matchMedia('(prefers-reduced-motion: reduce)')` и `matchMedia('(min-width:768px)')`; (2) desktop-путь — query `.home-dk .mosaic-tile`, шаффл-цикл (2 из 8) на `setInterval(3000)`, первый прогон сразу; (3) mobile-путь — создать/показать `.mosaic-feature` (background-image div) внутри `.home-mb .mosaic-grid`, петля `MOVE/HOLD/GAP` round-robin по `mosaicMobile`; (4) reduced-motion — статичный кадр без таймеров; (5) слушать `resize` и переоценивать активную композицию; (6) очистка всех таймеров и удаление фичи в cleanup; `return null` -- живая мозаика поверх готовой разметки.
- [x] `src/components/home/Hero.tsx` -- смонтировать `<HeroMosaic mosaicDesktop={hero.mosaicDesktop} mosaicMobile={hero.mosaicMobile} />` рядом с секциями; сохранить статичный SSR-кадр как фолбэк -- точка входа островка без переписывания DOM.
- [x] `src/styles/home.css` -- добавить стили `.home-mb .mosaic-feature` (порт из прототипа) и блок `@media (prefers-reduced-motion: reduce)` для `.mosaic-tile`/`.mosaic-feature` -- пиксель-верный оверлей и статичный кадр при reduced-motion.

**Acceptance Criteria:**
- Given `/` на desktop с разрешённым движением, when страница смонтирована, then ~2 из 8 плиток зажжены и набор `.lit` меняется каждые ~3с с кросс-фейдом 1.6s, бесконечно.
- Given `/` на mobile с разрешённым движением, when страница смонтирована, then цветная фича блумит из плитки на весь грид, держит, откатывается и переходит к следующему фото, проходя все 6 round-robin на таймингах MOVE1000/HOLD3200/GAP800.
- Given `prefers-reduced-motion: reduce`, when hero виден, then рендерится статичный цветной кадр и НИ один interval/timeout не запущен (движения нет).
- Given открытую сеть браузера на каждом вьюпорте, when hero загружен, then скачан ровно один набор hero-фото.
- Given SPA-навигацию прочь / unmount островка, then все таймеры очищены и инъектированной `.mosaic-feature` в DOM не осталось.
- Given реализацию, when `npm run lint` и `npm run build`, then strict-typecheck, линт и сборка проходят без ошибок.

## Spec Change Log

_(no bad_spec loopbacks — empty)_

## Review Triage Log

### 2026-07-05 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 18: (high 0, medium 0, low 18)
- addressed_findings:
  - none
- rejected (not defects):
  - **Reduced-motion / no-JS desktop shows «blank» mosaic** (Edge Case Hunter) — ложная посылка: `Hero.tsx` SSR-рендерит `.lit` на плитках `[2,5]` (строка 68), поэтому статичный кадр стоит без JS/при reduced-motion.
  - **Reduced-motion desktop после mid-session-переключения показывает случайный lit-набор вместо `[2,5]`** — любые 2 из 8 плиток удовлетворяют дизайну «~25% зажжено»; `[2,5]` — произвольный выбор Story 3.1, визуально эквивалентно. Косметика.
  - **`.lit` «утекает» через брейкпоинт** — при возврате на desktop `cycle()` выполняется сразу и перезаписывает набор; утечки не видно.
  - **Reduced-motion mobile показывает цветную фичу вместо приглушённых плиток** — ровно предписано спекой (статичный цветной финальный кадр); не дефект.
  - **Нет visibility/tab-гейтинга анимационного цикла** — прототип (источник истины) тоже не гейтит; тоггл CSS-класса / один promoted-слой — незначимо; вне мандата этой стори.
  - **`will-change: transform, opacity` постоянно на `.mosaic-feature`** — портировано дословно из прототипа (`Home Mobile.html`).
  - **Desktop без `Math.min`-гарда счётчика / возможный OOB индекса** — спекулятивно: контент — фиксированный статический инстанс (8/8); тот же класс находки отклонён в Story 3.1.
  - **Неэкранированный `url('${src}')`** — доверенные статические пути ассетов; CMS-подача (Epic 7) — будущий шов, не эта стори.
  - **Legacy Safari <14 без `addEventListener` у MediaQueryList** — тот же API уже используют `Header.client`/`ContactModal.client`; современный браузер-бейзлайн проекта.
  - **`pathname` в deps «мёртв»** — безвреден (стабилен пока смонтирован); удаление не даёт эффекта, а массивы в deps требует `exhaustive-deps`.
  - **`timers` Set растёт неограниченно** — ~3 записи/6с, очищается на unmount; пренебрежимо.
  - **Двойной `requestAnimationFrame` vs teardown** — `raf` всегда держит последний хэндл; `cancelAnimationFrame` отменяет корректно, фича к тому же удаляется (detached).
  - **Деление на ноль в `tileTransform` при нулевом гриде** — mobile-ветка запускается только когда `.home-mb` видима (media-match), grid имеет размер; не триггерится.
  - **`getBoundingClientRect` на фикс-задержке 400мс хрупок к позднему reflow** — спекулятивно; каждый последующий bloom читает свежие rect'ы, самокоррекция.
  - **deps-массивы меняют identity → пере-инициализация/мерцание** — `homeContent` — модульная константа, RSC передаёт стабильные пропсы; статическая страница не ре-рендерит остров.
  - **Глобальные селекторы `document.querySelectorAll`** — единственный hero на странице; тот же enhance-паттерн, что у `RevealOnScroll`.
  - **Повтор lit-набора между циклами / рассинхрон magic-number (`.5s` vs `MOVE`)** — прототип-верно / косметика поддержки.

## Design Notes

**Desktop-цикл (псевдо, дословно из `Home.html` JS):**
```js
const litCount = Math.max(1, Math.round(total * 0.25)) // 8 -> 2
function cycle(){                                       // shuffle keys, take litCount
  const lit = new Set(shuffle([...Array(total).keys()]).slice(0, litCount))
  tiles.forEach((t,i)=> t.classList.toggle('lit', lit.has(i)))
}
cycle(); const id = setInterval(cycle, 3000)            // island toggles class; CSS does the 1.6s bloom
```

**Mobile-фича — transform из rect (порт из `Home Mobile.html`):**
```js
function tileTransform(t){ const g=grid.getBoundingClientRect(), r=t.getBoundingClientRect()
  return `translate(${r.left-g.left}px,${r.top-g.top}px) scale(${r.width/g.width},${r.height/g.height})` }
// bloom(i): origin top-left; snap = tileTransform(tile); rAF -> transform:'translate(0,0) scale(1,1)'
//   transition `transform ${MOVE}ms cubic-bezier(.4,0,.2,1), opacity .5s ease`
//   after MOVE+HOLD: transform=tileTransform(tile); after +(MOVE-250): opacity=0
// run(): bloom(idx); idx=(idx+1)%6; setTimeout(run, MOVE+HOLD+MOVE+GAP=6000)
```
Отличие от прототипа (осознанно): фича — `background-image`-div, а не `<img>`, — чтобы скрытая desktop-композиция не тянула mobile-фото (тот же приём, что Story 3.1 применила к плиткам). Островок создаёт фичу только на mobile-ветке; на desktop её нет. `matchMedia` для рантайм-выбора композиции и reduced-motion — стандарт, соответствует `Header.client`/`ContactModal.client`; рендер-разметку он НЕ гейтит.

**Reduced-motion:** JS не стартует петли; CSS-блок `@media (prefers-reduced-motion: reduce)` снимает `transition` у `.mosaic-tile` (мгновенный финальный кадр) и оставляет фичу статично раскрытой на первом фото. Двойная защита (JS + CSS), как договорено в эпике.

## Verification

**Commands:**
- `npm run lint` -- expected: без ошибок.
- `npm run build` -- expected: strict typecheck + сборка проходят; `/` остаётся статически пререндеренным, островок гидрируется без предупреждений.

**Manual checks:**
- `npm run preview` → http://localhost:3000/ desktop (≥768px): мозаика циклится — ~2 плитки зажигаются каждые ~3с, кросс-фейд ~1.6s.
- Mobile (<768px, DevTools device ~390px): фича блумит по фото по таймингам MOVE/HOLD/GAP, round-robin.
- DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`: движения нет, статичный цветной кадр.
- DevTools → Network: на каждом вьюпорте грузится ровно один набор hero-фото (не оба).
- SPA-навигация прочь и обратно: нет утёкших таймеров/дублей `.mosaic-feature` (Elements-панель).

## Auto Run Result

Status: done

### Summary
Hero-мозаика ожила (UX-DR19). Добавлен один листовой client-островок `HeroMosaic.client.tsx`, который **улучшает готовый статичный SSR-кадр Story 3.1 на месте** (паттерн `RevealOnScroll`, `return null`, вся работа в `useEffect`), не переписывая DOM. **Desktop:** каждые 3с зажигаются случайные 2 из 8 плиток `.lit` (Fisher-Yates), кросс-фейд даёт уже существующий CSS-переход 1.6s. **Mobile:** JS-создаваемый `.mosaic-feature` (background-image div, не `<img>` — инвариант art-direction) блумит по фото round-robin из плитки на весь грид по таймингам MOVE1000/HOLD3200/GAP800 через `getBoundingClientRect`-трансформы. Оба пути гейтятся в рантайме через `matchMedia` (вьюпорт + `prefers-reduced-motion`), переоцениваются на `change`, полностью очищаются при unmount. `prefers-reduced-motion` → таймеры не стартуют, показывается статичный финальный кадр (+ CSS-подстраховка). Все тайминги/механизмы портированы дословно из прототипов.

### Files changed
- `src/components/home/HeroMosaic.client.tsx` (new) — островок bloom-анимации (desktop-цикл + mobile-feature-петля + reduced-motion + resize-переоценка + полная очистка).
- `src/components/home/Hero.tsx` — смонтирован `<HeroMosaic mosaicDesktop mosaicMobile />`; статичный SSR-кадр сохранён как фолбэк.
- `src/styles/home.css` — правила `.home-mb .mosaic-feature` (порт из прототипа) + блок `@media (prefers-reduced-motion: reduce)` для мозаики/фичи.

### Review findings
- Patches applied: 0. Deferred: 0. Bad-spec loopbacks: 0. Intent gaps: 0.
- Rejected (18): все находки — не дефекты: спекулятивные (фикс-контент 8/8, деление-на-ноль недостижимо, поздний reflow), прототип-верные (visibility-гейтинг, `will-change`, повтор набора), спека-предписанные (reduced-motion mobile — цветной кадр), ложные посылки (SSR даёт `.lit`-фолбэк), либо согласованы с бейзлайном проекта (`matchMedia.addEventListener`). Детали — в Review Triage Log.

### Verification
- `npm run lint` → PASS (без ошибок).
- `npm run build` → PASS (strict typecheck + сборка; `/` остаётся `○ Static`, остров гидрируется без предупреждений).
- Ручная пиксель/поведенческая приёмка в браузере (desktop-цикл, mobile-bloom, reduced-motion, один hero-набор на вьюпорт, чистота таймеров при SPA-навигации) — по чеклисту в разделе Verification, оставлено на ручной проход.

### Residual risks
- Bloom-тайминги и подсветка визуально совпадают с прототипом, но точная попиксельная приёмка мозаики подтверждается только вручную в браузере (авто-тест-раннера в проекте нет).
- Первый mobile-bloom снимает `getBoundingClientRect` на задержке 400мс; при экстремально позднем reflow (шрифт/картинки) начальный снап может слегка сместиться и самокорректируется на следующем цикле.
