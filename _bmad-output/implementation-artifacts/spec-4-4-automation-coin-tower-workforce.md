---
title: 'Story 4.4: Секция Automation — count-up, coin-tower и workforce'
type: 'feature'
created: '2026-07-06'
status: 'done'
baseline_revision: 'bef371b17d61b013d24671b938744a5e329e48d8'
final_revision: '9681d5e2ba908830b014f50abe502fb881b58d01'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/rollun_handoff/rollun-web-site/project/About Us.html'
  - '{project-root}/rollun_handoff/rollun-web-site/project/About Us Mobile.html'
  - '{project-root}/docs/pixel-acceptance/checklist-about.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md'
  - '{project-root}/src/components/home/StatsCounter.client.tsx'
warnings: ['oversized']
---

<intent-contract>

## Intent

**Problem:** Секция Automation (04) сейчас — статичный финальный кадр из Story 4.1: три счётчика показывают финальные значения (`50,000+`, `80%`, `30%`), а scaffold-контейнеры `#coinTower` / `#peopleRow` (desktop) пусты. Нет ни count-up-анимации, ни башни монет, ни фигур workforce.

**Approach:** Добавить ОДИН листовой `'use client'`-островок `AutomationAnimations.client.tsx` (renders `null`, ENHANCES статичный SSR-кадр, не переписывает DOM — прецедент `StatsCounter.client` / `UsPresenceMap.client`), который: (1) count-up все `[data-count]`-числа обеих композиций (threshold 0.25); (2) строит и анимирует 10 монет в `#coinTower` (threshold 0.2, первые 3 оранжевые); (3) строит 10 SVG-фигур в `#peopleRow` и гасит 8 из них (threshold 0.2, stagger 130ms). Логика count-up (dur 1800, ease `1-(1-p)^3`, rAF) и алгоритмы монет/фигур портируются ДОСЛОВНО из `About Us.html`. CSS элементов `.coin`/`.pcr`/`.fig` портируется в desktop-медиаблок `about.css`.

## Boundaries & Constraints

**Always:**
- `About Us.html` — источник истины пикселя, разметки, тайминга и алгоритмов. Count-up: dur=1800, ease `1-Math.pow(1-p,3)`, формат `toLocaleString('en-US')`, играет один раз. Coin-tower: `N=10`, `STEP=9px`, `bottom=i*9px`, `zIndex=i+1`, `shown=round(ease(p)*10)`, toggle `.show` для `i<shown`, `.on` для `i<3 && i<shown`. Workforce: `TOTAL=10`, `TEAM=2`, `ROWS=[2,3,3,2]`, SVG-силуэт ДОСЛОВНО, гаснут фигуры `i∈[2..9]` с задержкой `600 + k*130ms` (k=0..7).
- Островок ПОДКЛЮЧАЕТСЯ на mount при `motion allowed && 'IntersectionObserver' in window`: сбрасывает `[data-count]`-числа в `0`, строит монеты/фигуры в НАЧАЛЬНОМ состоянии, затем анимирует на пересечении (каждый эффект — свой IntersectionObserver, играет один раз через `unobserve`/флаг). Число рендерится ТОЛЬКО в первый `<span data-count>` — соседний `<span class="unit">` (`+`/`%`) не трогать.
- `prefers-reduced-motion: reduce` ИЛИ отсутствие `IntersectionObserver`: count-up НЕ трогать (SSR-финал остаётся). Монеты/фигуры островок ВСЁ РАВНО строит, но сразу в ФИНАЛЬНОМ состоянии без анимации (все 10 монет `.show`, первые 3 `.on`; 8 фигур `.faded`, 2 оранжевые) — эпик: rm даёт «статичный итог».
- Coin-tower и workforce — desktop-only: контейнеры существуют только в `.about-dk` (на mobile `.about-dk` = `display:none`, контейнеры скрыты, IntersectionObserver для них не срабатывает). Count-up идёт на ОБЕИХ композициях (mobile-прототип тоже анимирует числа; эпик: «на mobile — только count-up»).
- CSS `.coin`/`.coin.show`/`.coin.on`/`.pcr`/`.fig`/`.fig svg`/`.fig.faded` портируется в desktop-медиаблок `@media (min-width: 768px)` секции `AUTOMATION (04)`, скоуп под `.about-dk` (конвенция блока), литеральный токен `--or → var(--color-or)`, литералы rgba/размеры — по прототипу.
- Островок мутирует только собственные scaffold-узлы; эффект keyed на `usePathname()`, cleanup отменяет все rAF и disconnect всех observers (прецедент `StatsCounter.client`).

**Block If:**
- Разметка/тайминг/алгоритм анимации не выводимы дословно из `About Us.html` — HALT `blocked` с описанием.

**Never:**
- Не трогать статичную SSR-разметку секций (кроме добавления `data-count` на числовые `<span>`), контент `AboutContent.automation`, соседние секции.
- Не вводить UA-сниффинг/JS-гейтинг ширины; выбор композиции — только CSS-медиа (AD-3). Монеты/фигуры на mobile НЕ показывать.
- Не переиспользовать `StatsCounter.client` напрямую (он home-scoped: селектор `.stats .stat-value`, контракт `data-final`/`data-suffix`, threshold 0.4) — у Automation иной селектор (`[data-count]`, отдельный `.unit`-span), threshold 0.25 и добавлены монеты/фигуры. Математику count-up переносим дословно в новый островок.
- Не более одного островка секции; несколько observers внутри одного файла допустимы.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Desktop (≥768px), секция входит во вьюпорт | motion allowed, IO есть | 3 счётчика считаются 0→финал (1800ms, ease-out, threshold 0.25); 10 монет всплывают снизу и стекаются (первые 3 — оранжевый бордер, threshold 0.2); 10 фигур появляются оранжевыми, 8 гаснут в `rgba(255,255,255,0.24)` со stagger 130ms (threshold 0.2); каждый эффект один раз | — |
| Mobile (<768px), секция видима | motion allowed, IO есть | Считаются только числа (0→финал); монет/фигур нет (контейнеры desktop-only скрыты, не пересекаются) | — |
| `prefers-reduced-motion: reduce` ИЛИ нет IO | rm вкл. / IO отсутствует | Числа сразу финальные (SSR не трогается); монеты построены в финале (10 show, 3 on), фигуры построены в финале (8 faded, 2 orange) — без анимации | — |
| SPA-навигация прочь со страницы | unmount островка | Все rAF отменены, все observers disconnected; в стейл-узлы записи нет | cleanup по `usePathname` |

</intent-contract>

## Code Map

- `src/components/about/Automation.tsx` -- ПРАВКА: на числовой `<span>` каждого из 3 счётчиков ОБЕИХ композиций (desktop `.stat-val > span:first-child`, mobile `.astat .v > span:first-child`) добавить `data-count={stats[i].value}` (текст остаётся `display` для SSR-фолбэка). Смонтировать `<AutomationAnimations />` в конце фрагмента. `.unit`-span не трогать.
- `src/components/about/AutomationAnimations.client.tsx` -- НОВЫЙ островок (`'use client'`, `return null`): count-up `[data-count]` (threshold 0.25) + coin-tower `#coinTower` (threshold 0.2) + workforce `#peopleRow` (threshold 0.2). Гварды rm/IO, reset-then-animate, финал-без-анимации в fallback, keyed на `usePathname`, cleanup rAF+observers. Математику/алгоритмы взять дословно из `About Us.html`.
- `src/styles/about.css` -- ДОБАВИТЬ в desktop-медиаблок секции `AUTOMATION (04)` (после scaffold-контейнеров ~стр.442) правила `.about-dk .coin-stat .coin` (+`.show`/`.on`), `.about-dk .team-stat .pcr`/`.fig`/`.fig svg`/`.fig.faded` — дословно из прототипа, `--or → var(--color-or)`, faded = `rgba(255,255,255,0.24)`.
- `src/components/home/StatsCounter.client.tsx` -- РЕФЕРЕНС (не менять): образец count-up-островка (fmt/animate/IO/cleanup/pathname).
- `rollun_handoff/rollun-web-site/project/About Us.html` -- источник: markup (~1362-1391), CSS (~446-469), JS count-up (~1712-1737), coin+workforce (~2600-2668).

## Tasks & Acceptance

**Execution:**
- [x] `src/components/about/Automation.tsx` -- добавить `data-count={value}` на числовые span обеих композиций; смонтировать `<AutomationAnimations />` -- включает островок без изменения статичного кадра.
- [x] `src/components/about/AutomationAnimations.client.tsx` -- реализовать островок (count-up threshold 0.25 + coin-tower + workforce threshold 0.2) с дословным портом алгоритмов, гвардами rm/IO и cleanup -- вся анимация секции.
- [x] `src/styles/about.css` -- портировать CSS `.coin`/`.pcr`/`.fig`/`.fig.faded` в desktop-блок под `.about-dk`, токены → проектные -- пиксель монет/фигур.

**Acceptance Criteria:**
- Given `/about` на desktop (≥768px), when секция Automation входит во вьюпорт, then три числа считаются 0→финал за ~1800ms (ease-out), 10 монет всплывают и стекаются (первые 3 с оранжевым бордером), 10 фигур появляются оранжевыми и 8 гаснут со stagger 130ms; каждая анимация играет ровно один раз; визуал совпадает с `About Us.html`.
- Given mobile (<768px), when секция видима, then анимируются только числа; монет/фигур нет (desktop-контейнеры скрыты CSS-медиа, островок их не показывает); нет UA-сниффинга.
- Given `prefers-reduced-motion: reduce` (или нет `IntersectionObserver`), when секция видима, then числа сразу финальные (SSR не мигает через 0), монеты/фигуры показаны в финальном статичном итоге без анимации.
- Given SPA-навигация со страницы, when островок размонтируется, then все rAF отменены и observers отключены (нет записи в удалённые узлы); typecheck strict проходит.

## Design Notes

**Один островок на всю секцию (AD-1).** Count-up + coin-tower + workforce живут в одном `AutomationAnimations.client.tsx` с тремя независимыми IntersectionObserver'ами (count-up 0.25; монеты/фигуры 0.2) — параллель `UsPresenceMap.client`, где count-up и построение карты сосуществуют в одном островке. Островок лёгкий (без тяжёлых импортов вроде D3), поэтому его загрузка на mobile безвредна — art-direction здесь обеспечивается тем, что desktop-контейнеры `display:none` и не пересекаются, а не отсечением бандла.

**Count-up: дословный порт, но свой островок.** `StatsCounter.client` не переиспользуем (см. Never): у него другой селектор/контракт/threshold. Переносим ту же математику (`dur=1800`, `eased=1-(1-p)^3`, `requestAnimationFrame`, `toLocaleString('en-US')`), но пишем ТОЛЬКО в первый `<span data-count>`, оставляя `.unit`-span (`+`/`%`) статичным — в прототипе count-up тоже адресует `[data-count]`, а `.unit` — соседний узел.

**Fallback для монет/фигур ≠ fallback для чисел.** Числа в SSR уже финальные → под rm/без-IO островок их не трогает. А контейнеры монет/фигур в SSR ПУСТЫ → под rm/без-IO островок обязан их построить, но сразу в финальном состоянии (монеты: все `.show`, первые 3 `.on`; фигуры: индексы 2..9 с `.faded`), без запуска transition. Иначе секция осталась бы пустой — эпик требует «статичный итог».

**Faded-цвет = 0.24.** Рендеримый прототип гасит фигуры инлайн-стилем `rgba(255,255,255,0.24)` (мёртвое CSS-правило `.fig.faded` прототипа держит 0.26). Портируем как класс `.fig.faded { color: rgba(255,255,255,0.24); }` (тумблер класса, как `.show`/`.on` у монет) — воспроизводит фактический пиксель и совпадает с мандатом эпика.

**Скелет островка (сокращённо):**
```tsx
useEffect(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const io = 'IntersectionObserver' in window
  const frames = new Set<number>(); let stopped = false
  // COUNT-UP: query '.about-dk.automation [data-count], .about-mb.dark [data-count]'
  //   reduced||!io → leave SSR final. else reset→0, observe(0.25), animate 0→count once.
  // COIN-TOWER (#coinTower): build 10 coins (bottom=i*9, z=i+1).
  //   reduced||!io → set final (show all, on first 3). else observe(0.2), rAF play once.
  // WORKFORCE (#peopleRow): build ROWS=[2,3,3,2] figs w/ SIL svg (all orange).
  //   reduced||!io → faded on i∈[2..9]. else observe(0.2), setTimeout 600+k*130 once.
  return () => { stopped = true; frames.forEach(cancelAnimationFrame); /* disconnect all */ }
}, [pathname])
```

## Verification

**Commands:**
- `npm run lint` -- expected: без ошибок.
- `npm run build` -- expected: strict typecheck + сборка проходят; `/about` компилируется (static prerender сохраняется — островок renders null).

**Manual checks:**
- `npm run preview` → http://localhost:3000/about, desktop ≥1280px: проскроллить к Automation — числа считаются, монеты всплывают (3 оранжевые), фигуры гаснут (8 из 10) — сверка с `About Us.html` по `docs/pixel-acceptance/checklist-about.md`.
- Mobile ≤768px (letterbox 440px): числа считаются, монет/фигур нет.
- Эмуляция `prefers-reduced-motion: reduce`: числа сразу финальные, монеты/фигуры — статичный финал без анимации.

## Spec Change Log

_(no bad_spec loopbacks — empty)_

## Review Triage Log

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 1, low 1)
- defer: 0
- reject: 12
- addressed_findings:
  - `[medium]` `[patch]` Гвард `childElementCount === 0` защищал от повторного построения монет/фигур, но cleanup отключал observers и НЕ удалял вставленные узлы → при повторном прогоне эффекта (React StrictMode setup→cleanup→setup на том же узле или ре-маунт) блок пропускался (childElementCount≠0), observer уже отключён → монеты/фигуры «замерзали» пустыми. Fixed: cleanup теперь `tower?.replaceChildren()` / `row?.replaceChildren()` — повторный прогон перестраивает их со свежим observer. (В проде single-mount маскировал дефект; проявлялся в dev.) Lint + build пере-прогнаны — PASS.
  - `[low]` `[patch]` Статичный путь reduced-motion строил монеты/фигуры и синхронно вешал финальные классы, но CSS-transition на `.coin`/`.fig` оставались активны → нет гарантии отсутствия анимации под rm (зависит от батчинга пейнта браузером). Fixed: добавлен `@media (prefers-reduced-motion: reduce) { .about-dk .coin-stat .coin, .about-dk .team-stat .fig { transition: none } }` (мандат эпика; паттерн Story 4-3). Build — PASS, `/about` = static prerender.
- rejected (not defects): захардкоженные пропорции (`N=10`/первые 3/`TEAM=2`/`ROWS=[2,3,3,2]`) и терминальный `toLocaleString(value)` — ДОСЛОВНЫЙ порт прототипа (декоративный фиксированный мотив, не data-driven; `value`≡`display` для 50000/80/30; content-driven был бы отклонением от пикселя); ложная тревога «`.about-mb.dark` неверный класс» (mobile-секция = `about-mb section dark reveal`, селектор матчит); upfront-reset в `0` + «мигание»/скрытая композиция в 0 (секция ниже фолда + self-heal на resize — задокументированный паттерн `StatsCounter.client`); ручной `appendChild` в React-контейнеры (паттерн `UsPresenceMap`; родитель — статичный RSC без ре-рендера); дубль count-up-логики (spec явно санкционировал отдельный островок, см. Never); `parseInt`→NaN и SVG-viewBox 24×24→15×22 stretch (латентно на статических доверенных данных с TS-гейтом / дословный пиксель прототипа); `[pathname]`-dep и single-read `matchMedia` (конвенция sibling-островков); фигуры на mobile не пересекаются под `display:none` (art-direction by-design, self-heal + P1-фикс сохраняет observer).

## Auto Run Result

Status: done

### Summary
Секция Automation (04) страницы About Us получила три анимации поверх статичного финального кадра Story 4.1 — одним лёгким листовым `'use client'`-островком `AutomationAnimations.client.tsx` (renders `null`, ENHANCES SSR-кадр, не переписывает DOM; прецедент `StatsCounter.client` / `UsPresenceMap.client`): (1) count-up всех `[data-count]`-чисел обеих композиций (threshold 0.25, dur 1800, ease `1-(1-p)^3`, `toLocaleString('en-US')`, пишет только числовой span, `.unit` не трогает); (2) coin-tower — 10 монет (`bottom=i*9`, `zIndex=i+1`) всплывают/стекаются, первые 3 с оранжевым бордером (threshold 0.2, `shown=round(ease(p)*10)`); (3) workforce — 10 SVG-силуэтов рядами `[2,3,3,2]`, 8 гаснут в `rgba(255,255,255,0.24)` со stagger `600+k*130ms` (threshold 0.2). Все алгоритмы/тайминги портированы ДОСЛОВНО из `About Us.html`. Гварды `prefers-reduced-motion: reduce` / отсутствие `IntersectionObserver`: числа остаются финальными (SSR не трогается), монеты/фигуры строятся сразу в финальном статичном итоге. Art-direction (AD-3): coin-tower/workforce — desktop-only (контейнеры только в `.about-dk`, на mobile `display:none` → observers не срабатывают); count-up идёт на обеих композициях. Эффект keyed на `usePathname()`, cleanup отменяет rAF/timers, disconnect observers и очищает вставленные узлы.

### Files changed
- `src/components/about/Automation.tsx` — на числовой `<span>` каждого из 3 счётчиков обеих композиций добавлен `data-count={stats[i].value}` (текст = `display` для SSR-фолбэка, `.unit`-span не тронут); смонтирован `<AutomationAnimations />` в конце фрагмента.
- `src/components/about/AutomationAnimations.client.tsx` — НОВЫЙ островок: count-up (0.25) + coin-tower (0.2) + workforce (0.2), дословный порт алгоритмов, гварды rm/IO, финал-без-анимации в fallback, cleanup (rAF+timers+observers+очистка узлов).
- `src/styles/about.css` — в desktop-медиаблоке `AUTOMATION (04)` добавлены `.coin`(+`.show`/`.on`)/`.pcr`/`.fig`(+`svg`/`.faded`) под `.about-dk` (токен `--or → var(--color-or)`, faded `rgba(255,255,255,0.24)`) + rm-override `transition: none`.

### Review findings
- Patches applied (2): [medium] cleanup очищает вставленные монеты/фигуры → повторный прогон эффекта (StrictMode/ре-маунт) перестраивает со свежим observer; [low] rm-override гасит CSS-transition монет/фигур (гарантия «статичного итога» эпика).
- Deferred: 0.
- Rejected (12): дословный порт прототипа (захардкоженные пропорции, `toLocaleString`-терминал, SVG-stretch, unit-во-время-рампы); паттерны sibling-островков (upfront-reset ниже фолда, `appendChild`, `pathname`/`matchMedia`, отдельный островок); ложная тревога по `.about-mb.dark`; латентные на статических доверенных данных. Детали — Review Triage Log.

### Verification
- `npm run lint` → PASS (без ошибок), пере-прогон после патчей — PASS.
- `npm run build` → PASS (`✓ Compiled successfully`; `/about` = ○ Static prerender; strict typecheck проходит).

### Residual risks
- Пиксель-приёмка desktop-анимации (count-up, монеты, фигуры) и «на mobile монет/фигур нет» / reduced-motion-статика — ручные шаги (SM-1) по `docs/pixel-acceptance/checklist-about.md` в браузере, автоматически не отмечены.
- Пропорции монет/фигур (30% ≙ 3 монеты, 80% ≙ 8 фигур) захардкожены как в прототипе — при будущем переезде контента на Payload с иными числами визуальное кодирование потребует ревизии (латентно, вне scope; by-design faithful-порт).
