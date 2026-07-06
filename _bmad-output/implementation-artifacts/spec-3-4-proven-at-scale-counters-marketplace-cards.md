---
title: 'Story 3.4 — Счётчики «Proven at scale» и маркетплейс-карточки'
type: 'feature'
created: '2026-07-06'
status: 'done'
baseline_revision: 'b3e09c5f94c30472209259e1888280e2682283f6'
final_revision: 'b9e8211db5450bf1bb0fdae185d09b19b87b229b'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
warnings: ['oversized']
---

<intent-contract>

## Intent

**Problem:** Секция Stats «Proven at scale» на Home сейчас статичный финальный кадр (Story 3.1): `.stat-value` рендерят готовые числа (`2015`, `12`, `80,000`, `30%`) без анимации. Story 3.4 оживляет count-up — цифры масштаба должны досчитываться при попадании секции в вьюпорт, подкрепляя доверие фактами. Секция «Find us on marketplaces» уже собрана в Story 3.1 (desktop с рейтингами, mobile без — дефект AD-13) и в этой стори лишь формально принимается.

**Approach:** Новый листовой `'use client'`-островок `StatsCounter`, смонтированный из RSC `Stats.tsx`, энхансит существующий SSR-кадр (не переписывает разметку, по образцу `ProductLineSwitcher`/`HeroMosaic`): при motion-allowed сбрасывает `.stat-value` на `0` и по IntersectionObserver (threshold 0.4) досчитывает до финала дословным портом count-up из прототипа. `return null`.

## Boundaries & Constraints

**Always:** Островок — лист `'use client'`, `return null`, никакой новой разметки; читает цель/формат/суффикс из data-атрибутов `.stat-value` (SSR из типизированного `content/home.ts`). Count-up дословно из прототипа `Home.html`: `dur=1800`, ease-out `1 - (1-p)^3`, `fmt(final*eased)+suffix`, играет ровно один раз (`data-done`). Старт по IO `threshold: 0.4`; наблюдаются сами элементы `.stat-value`. `usePathname()` — зависимость эффекта; cleanup дисконнектит observer. Обе композиции (`.home-dk`/`.home-mb`) остаются в DOM, переключение — только CSS 768px.

**Block If:** (нет решений, требующих человека — интент полностью определён прототипом и epic-context.)

**Never:** Не переписывать разметку Stats/Marketplaces; не рендерить `.stat-value` из островка. Не добавлять авто-повтор/повторный запуск анимации. Не менять секцию marketplaces (desktop-рейтинги / mobile-без-рейтингов остаётся as-is, AD-13/UX-DR24#5 — воспроизводимый дефект, не «чинить»). Не гейтить композиции через JS/UA-сниффинг. Не показывать финал до триггера при активной анимации.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Секция входит в вьюпорт | motion-allowed, `.stats` пересекает IO ≥0.4 | `.stat-value` досчитывают 0→финал за 1800ms cubic ease-out, формат comma/plain + суффикс, один раз | — |
| До триггера | motion-allowed, островок смонтирован, секция вне вьюпорта | Каждый `.stat-value` показывает `0` (финал не показан) | — |
| reduced-motion | `prefers-reduced-motion: reduce` | Островок ничего не сбрасывает и не анимирует — SSR-финал (`2015`…`30%`) показан сразу | — |
| JS выключен / нет IntersectionObserver | островок не смонтирован или API отсутствует | SSR-финал показан (пре-гидрационный кадр = доступный итог) | Graceful: guard `'IntersectionObserver' in window` |
| Повторный вход в вьюпорт | элемент уже досчитан (`data-done`) | Не перезапускается; `unobserve` после первого запуска | — |
| SPA-навигация прочь / unmount | `usePathname` меняется | observer дисконнектится, таймеров/RAF-циклов не остаётся | — |
| marketplaces desktop / mobile | Story 3.1 SSR (без изменений) | Desktop-карточки с рейтингом (`.mp-rating`), mobile — без рейтингов | — |

</intent-contract>

## Code Map

- `src/components/home/StatsCounter.client.tsx` — НОВЫЙ листовой `'use client'`-островок (пропсов нет). `useEffect` (dep `usePathname()`): если `matchMedia('(prefers-reduced-motion: reduce)').matches` **или** нет `IntersectionObserver` → выход (SSR-финал остаётся). Иначе: для каждого `document.querySelectorAll('.stats .stat-value')` запомнить формат/цель и `textContent = '0'`; один `IntersectionObserver({threshold:0.4})` наблюдает каждый элемент; в колбэке `if isIntersecting && !dataset.done` → `dataset.done='1'`, `unobserve`, запустить `animate(el)` (порт прототипа). Cleanup: `io.disconnect()`. `return null`.
- `src/components/home/Stats.tsx` — ПРАВКА: (1) на `.stat-value` добавить `data-format={stat.display.includes(',') ? 'comma' : 'plain'}` (островок читает как прототип); (2) смонтировать `<StatsCounter />` (например после mobile-секции внутри фрагмента). Статичный SSR-кадр (`{stat.display}`, `data-final`, `data-suffix`) НЕ трогать.
- `src/components/home/Marketplaces.tsx` — ПЕРЕИСПОЛЬЗОВАТЬ БЕЗ ИЗМЕНЕНИЙ: desktop `.mp-rating`, mobile без рейтингов уже реализованы в Story 3.1 (AD-13). Только формальная приёмка.
- `src/content/home.ts` — ПЕРЕИСПОЛЬЗОВАТЬ без изменений: `HomeStat { value; suffix?; display; label }`, `stats.items`.
- `src/components/home/HeroMosaic.client.tsx`, `src/components/islands/RevealOnScroll.client.tsx` — ЭТАЛОНЫ: `usePathname` dep, guard `IntersectionObserver`, reduced-motion → статичный финал, cleanup, `return null`.
- `rollun_handoff/rollun-web-site/project/Home.html` (JS ~1349–1381) — ИСТОЧНИК ИСТИНЫ count-up (`fmt`, `animate`, IO threshold 0.4, `data-done`).

## Tasks & Acceptance

**Execution:**
- [x] `src/components/home/StatsCounter.client.tsx` — реализовать островок: guard reduced-motion/IO → выход; иначе сброс `.stats .stat-value` на `0`, IO threshold 0.4 на каждый элемент, `animate` = дословный порт прототипа (`dur=1800`, `eased=1-(1-p)^3`, `fmt(final*eased, format)+suffix`, `data-done`+`unobserve`, RAF); cleanup `io.disconnect()`; `usePathname` dep; `return null`.
- [x] `src/components/home/Stats.tsx` — добавить `data-format` на `.stat-value` и смонтировать `<StatsCounter />`; статичный кадр не менять.
- [x] Верификация marketplaces (без кода) — подтверждено: desktop-карточки показывают рейтинг (`.mp-rating`), mobile — нет (AD-13), разметка Story 3.1 не тронута.
- [x] Юнит-тест сценариев I/O-матрицы — в проекте нет тест-раннера (нет `test`-скрипта/фреймворка, только `lint`/`build`); покрытие обеспечено ручными проверками из раздела Verification.

**Acceptance Criteria:**
- Given desktop/mobile Home, motion-allowed, when секция Stats пересекает IO threshold 0.4, then `.stat-value` досчитывают до финала (cubic ease-out ~1800ms, формат comma/suffix), играют один раз; до триггера показан `0`, финал не показан (UX-DR18).
- Given `prefers-reduced-motion: reduce`, then счётчики сразу показывают финальное значение, без движения и без сброса на `0`.
- Given JS выключен или нет `IntersectionObserver`, then SSR-финал показан (доступный итог не ломается).
- Given секцию «Find us on marketplaces», then desktop-карточки с рейтингами, mobile — без рейтингов (as-is, UX-DR24#5); код Story 3.1 не изменён.
- Given SPA-навигацию прочь / unmount, then observer дисконнектится, повторных запусков нет.
- Given реализацию, when `npm run lint` и `npm run build`, then strict-typecheck, линт и сборка проходят без ошибок.

## Spec Change Log

## Review Triage Log

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 0, low 1)
- defer: 0
- reject: 11
- addressed_findings:
  - `[low]` `[patch]` In-flight `requestAnimationFrame` не отменялся при unmount/re-run (cleanup делал только `io.disconnect()`) — расходится с teardown-дисциплиной соседних островков (HeroMosaic чистит все таймеры). Добавлены `Set<number> frames` + флаг `stopped`; `animate` перенесён внутрь эффекта, cleanup отменяет все кадры и ставит `stopped=true`. Это заодно снимает теоретическую гонку двух RAF-циклов. Матанимация count-up осталась дословным портом. Lint/build зелёные.

## Design Notes

**Count-up — дословный порт из `Home.html` (источник истины):**
```js
const fmt = (n, format) => { n = Math.round(n);
  return format === 'comma' ? n.toLocaleString('en-US') : String(n) }
const animate = (el) => {
  const final = parseFloat(el.dataset.final)
  const format = el.dataset.format || 'plain'
  const suffix = el.dataset.suffix || ''
  const dur = 1800, start = performance.now()
  const tick = (t) => { const p = Math.min(1, (t - start) / dur)
    const eased = 1 - Math.pow(1 - p, 3)
    el.textContent = fmt(final * eased, format) + suffix
    if (p < 1) requestAnimationFrame(tick) }
  requestAnimationFrame(tick) }
```

**Почему enhance-only + сброс на `0`.** Обе композиции уже SSR-рендерят ФИНАЛ (Story 3.1: `{stat.display}`) — это пре-гидрационный / reduced-motion / no-JS доступный кадр. AC требует «до триггера финал не показан», прототип стартует с `0`. Островок при motion-allowed сбрасывает `.stat-value` на `0` на маунте, затем IO досчитывает — как `HeroMosaic` сбрасывает плитки в ч/б. Секция Stats ниже фолда, поэтому кратковременный SSR-финал→`0` пользователь не видит.

**`data-format` вместо инференса.** Прототип держит `data-format` в разметке; добавляем тот же атрибут в `Stats.tsx` (`comma`, если `display` содержит запятую — только `80,000`; иначе `plain`), чтобы островок был дословным портом (`el.dataset.format || 'plain'`), а не угадывал формат.

**Наблюдаем сами `.stat-value` (threshold 0.4).** Скрытая (`display:none`) композиция не пересекает IO и остаётся на `0`; при ресайзе через 768px становится видимой, входит в вьюпорт и досчитывает сама — self-healing, как в прототипе. Каждый элемент `unobserve`-ится после первого запуска (`data-done`) — играет ровно один раз.

**Reduced-motion.** Count-up — не CSS-переход, а смена `textContent`, поэтому CSS-правило не нужно: островок в reduced-motion просто выходит, оставляя SSR-финал (двойная защита: no-JS тоже показывает финал).

**Marketplaces — уже готово.** Desktop `.mp-rating` (`--pct` из `card.rating.pct`) и mobile без рейтингов реализованы в Story 3.1 (AD-13). Story 3.4 их не трогает — только принимает.

## Verification

**Commands:**
- `npm run lint` — expected: без ошибок/warnings.
- `npm run build` — expected: strict typecheck + сборка проходят.

**Manual checks:**
- Desktop `/`: скролл к «Proven at scale» — четыре счётчика досчитывают от `0` до `2015 / 12 / 80,000 / 30%` (запятая у 80,000, суффикс `%`), плавно ~1.8с, один раз; повторный скролл не перезапускает.
- До скролла к секции значения показаны как `0` (не финал).
- Mobile ≤768px: то же поведение в mobile-композиции.
- Reduced-motion (DevTools emulate): значения показаны финальными сразу, без сброса на `0` и без движения.
- «Find us on marketplaces»: desktop — звёзды/рейтинг/score в карточках; mobile — карточки без рейтингов (дефект as-is).

## Auto Run Result

Status: done

**Реализованное изменение:** Оживлены count-up счётчики секции Stats «Proven at scale» на Home. Новый листовой `'use client'`-островок `StatsCounter` (пропсов нет, `return null`) энхансит статичный SSR-кадр Story 3.1, не переписывая разметку: при motion-allowed и наличии `IntersectionObserver` сбрасывает каждый `.stats .stat-value` на `0`, затем по IO (threshold 0.4) досчитывает до финала дословным портом count-up из прототипа `Home.html` (`dur=1800`, cubic ease-out `1-(1-p)^3`, формат comma/plain + суффикс, играет один раз через `data-done`+`unobserve`). При `prefers-reduced-motion` или отсутствии IO/JS островок ничего не делает — SSR-финал (`2015 / 12 / 80,000 / 30%`) показан сразу (доступный итог). Секция «Find us on marketplaces» уже была собрана в Story 3.1 (desktop с рейтингами, mobile без — дефект AD-13/UX-DR24#5) — принята без изменений кода.

**Изменённые файлы:**
- `src/components/home/StatsCounter.client.tsx` (НОВЫЙ) — островок-энхансер count-up: guard reduced-motion/IO, сброс на `0`, IO threshold 0.4, once-only, cleanup (`io.disconnect()` + отмена всех RAF по флагу `stopped`); `usePathname` dep; `return null`.
- `src/components/home/Stats.tsx` — добавлен `data-format` (`comma`/`plain`) на `.stat-value` и смонтирован `<StatsCounter />`; статичный кадр, `data-final`, `data-suffix`, `{stat.display}` не тронуты.
- `src/components/home/Marketplaces.tsx` — не изменён (проверен: desktop-рейтинги / mobile без рейтингов уже реализованы в Story 3.1).

**Ревью (1 проход, Blind Hunter + Edge Case Hunter):**
- Патчи применены: 1 (low) — отмена in-flight `requestAnimationFrame` при unmount/re-run (было только `io.disconnect()`), приведено к teardown-дисциплине соседних островков; заодно снимает теоретическую гонку двух RAF-циклов.
- Отложено: 0.
- Отклонено: 11 — включая заявленный «HIGH flash финала до триггера» (сброс происходит при гидрации ниже фолда — пользователь его не видит; SSR-финал обязателен по AC reduced-motion/no-JS — задокументированный необходимый компромисс), `[pathname]`-стрэндинг (недостижим: островок только на `/`, уход с Home размонтирует его), джиттер без `tabular-nums` и bare-`0`-до-суффикса (дословная верность прототипу), `Math.round`/non-integer/NaN (все stat — типизированные целые, реконструированный финал точно равен `display`), reduced-motion-без-listener (одноразовая анимация всё равно завершается финалом), и by-design/мета-замечания.
- Функциональных багов high-severity не найдено; эквивалентность анимированного финала и `stat.display`, корректность guard-путей (reduced-motion/no-JS → финал), once-only и self-healing скрытой композиции — подтверждены.

**Верификация:** `npm run lint` — чисто (без ошибок/warnings). `npm run build` — strict typecheck + сборка прошли, все 11 страниц сгенерированы без ошибок.

**Остаточные риски:** Кратковременный пре-гидрационный показ SSR-финала происходит вне вьюпорта (секция ниже фолда) и на практике не виден; это осознанный компромисс ради доступного итога при reduced-motion/no-JS. При ресайзе через 768px ранее скрытая композиция досчитывает сама (self-healing), как в прототипе.
