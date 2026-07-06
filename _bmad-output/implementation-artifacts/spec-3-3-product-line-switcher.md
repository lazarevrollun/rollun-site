---
title: 'Story 3.3 — Переключатель продуктовых линий'
type: 'feature'
created: '2026-07-05'
status: 'done'
baseline_revision: 'a7885a74b51c4b78311c54b2502358c385075ae0'
final_revision: 'a3a987be845e0abadad112ee4fcd593c144e1636'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md'
warnings: ['oversized']
---

<intent-contract>

## Intent

**Problem:** Секция «Two focused product lines» на Home сейчас статичный финальный кадр (Story 3.1): desktop-карусели Automotive/Health показывают слайд 0 активным, а кнопки-цифры `.line-dots` не реагируют на клик. Story 3.3 оживляет ручное листание, без которого посетитель не может рассмотреть линии в своём темпе.

**Approach:** Листовой `'use client'`-островок `ProductLineSwitcher` навешивается поверх готовой SSR-разметки (паттерн `RevealOnScroll`, enhance-not-rewrite): по клику на цифру тогглит классы слайдов `active/prev/next` и `button.active`, **без авто-ротации**, и синхронизирует состояние с URL hash. Mobile остаётся чистым CSS `scroll-snap`-шелфом — JS его не трогает.

## Boundaries & Constraints

**Always:**
- Островок ЛИСТОВОЙ и ENHANCE-ONLY: только тогглит классы на уже отрендеренных `.home-dk` слайдах/кнопках, не создаёт и не переписывает разметку слайдов, `return null`. Конфиг (линии + число слайдов) приходит пропсами из `HomeContent`; островок ничего не фетчит.
- Логика `setActive(i)` дословно из прототипа `Home.html`: `diff=(idx-i+total)%total` → `diff===0` `active`, `diff===total-1` `prev`, `diff===1` `next`; остальные без класса; `button[data-i===i]` получает `active`.
- Переключение ТОЛЬКО по клику (или клавиатуре — кнопки нативные `<button>`); авто-ротации нет, таймеров нет.
- Hash-синхрон (UX-DR11) детерминирован: формат `#line-<key>-<n>` (`key`∈`automotive|health`, `n` 1-based). Клик пишет hash через `history.replaceState` (без скролл-прыжка и без засорения истории); загрузка и `hashchange` читают hash и восстанавливают активный слайд соответствующей карусели.
- Обе карусели независимы: hash отражает ПОСЛЕДНЮЮ интеракцию; на загрузке восстанавливается только упомянутая в hash линия, вторая остаётся на слайде 0.
- Reduced-motion уважается: под `prefers-reduced-motion: reduce` кросс-фейд слайдов мгновенный (снять CSS-transition у `.home-dk .line-slide`); функциональность переключения сохраняется.
- Полная очистка: все слушатели (`click`, `hashchange`) снимаются на unmount / SPA-навигации (dep `usePathname`).

**Block If:**
- Если существующая SSR-разметка `ProductLines` не даёт стабильно сматчить кнопку `data-i` со слайдом внутри одного `.line-block` — HALT (не изобретать альтернативную DOM-структуру).

**Never:**
- Никаких JS/UA-гейтингов композиции и никакого JS на mobile-шелфе (`.home-mb .line-shelf` — только CSS `scroll-snap`).
- Не менять отрисованный пиксель статичного кадра, порядок/размеры слайдов, тайминги/кривые CSS-переходов.
- Не добавлять авто-ротацию, точки-индикаторы сверх прототипа, свайп-жесты на desktop.
- Не дублировать hero/контент-ассеты; не заводить клиентский фетч контента.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Клик по цифре | Desktop, клик `.line-dots button[data-i=2]` в Automotive | Слайд 2 `active`, соседи `prev`/`next`, `button` #3 `active`; hash → `#line-automotive-3` | — |
| Загрузка с hash | URL `…/#line-health-2` | Карусель Health стартует со слайда 1 активным; Automotive — слайд 0 | Невалидный/чужой hash (`#lines`, out-of-range) игнорируется → дефолт слайд 0 |
| hashchange | Пользователь меняет hash на `#line-automotive-4` | Automotive переключается на слайд 3 | Неизвестный key/`n` → без изменений |
| Reduced-motion | `prefers-reduced-motion: reduce`, клик | Слайд меняется мгновенно, без кросс-фейда | — |
| Mobile | `<768px` | Desktop-острова не влияют; свайп `scroll-snap` работает как есть | Скрытые desktop-узлы не кликабельны |
| Unmount / SPA nav | Уход со страницы | Слушатели `click`/`hashchange` сняты, утечек нет | — |

</intent-contract>

## Code Map

- `src/components/home/ProductLineSwitcher.client.tsx` — НОВЫЙ листовой `'use client'`-островок. Пропс `lines: { key: string; count: number }[]`. `useEffect`(dep `usePathname()`): для каждого `.home-dk [data-line=<key>] .line-stack` найти слайды и сиблинг `.line-dots button`; `setActive(i)`; навесить `click`; применить hash на маунте + слушать `hashchange`; cleanup снимает все слушатели. `return null`.
- `src/components/home/ProductLines.tsx` — ПРАВКА: добавить `data-line={lineKey}` на desktop `.line-block` (в `DesktopLine`, новый проп `lineKey`); смонтировать `<ProductLineSwitcher lines={[{key:'automotive',count:automotive.slidesDesktop.length},{key:'health',count:health.slidesDesktop.length}]} />` внутри/после desktop-секции. Статичный SSR-кадр (slide 0 active, #1 active) НЕ трогать — он pre-hydration / reduced-motion фолбэк.
- `src/styles/home.css` — ПРАВКА: в существующий блок `@media (prefers-reduced-motion: reduce)` (около строки 1260) добавить `.home-dk .line-slide { transition: none; }` — мгновенное переключение без движения.
- `src/content/home.ts` — ПЕРЕИСПОЛЬЗОВАТЬ без изменений: типы `HomeProductLine`/`HomeSlide`, `slidesDesktop`.
- `src/components/islands/RevealOnScroll.client.tsx` — ЭТАЛОН: null-островок, `usePathname` dep, enhance-not-rewrite, cleanup слушателей.
- `src/components/home/HeroMosaic.client.tsx` — ЭТАЛОН: типизированные пропсы, паттерн cleanup.
- `rollun_handoff/rollun-web-site/project/Home.html` — ИСТОЧНИК ИСТИНЫ desktop `setActive`/`.line-dots` JS (строки ~1432–1455). Прим.: в прототипе hash-синхрона НЕТ — он добавляется по требованию UX-DR11/AC.

## Tasks & Acceptance

**Execution:**
- [x] `src/components/home/ProductLineSwitcher.client.tsx` — реализовать островок: (1) `setActive(stack, buttons, i)` дословно из прототипа; (2) для каждой линии из пропа найти `.home-dk [data-line=key] .line-stack` + сиблинг `.line-dots button`, навесить `click`→`setActive`+`history.replaceState('#line-<key>-<i+1>')`; (3) `applyHash()` парсит `location.hash` (`line-<key>-<n>`), валидирует key/диапазон `1..count`, вызывает `setActive`; вызвать на маунте и по `hashchange`; (4) cleanup снимает все `click` и `hashchange`; `return null`.
- [x] `src/components/home/ProductLines.tsx` — добавить `data-line` на desktop `.line-block` и смонтировать `<ProductLineSwitcher …>`; статичный кадр не менять.
- [x] `src/styles/home.css` — `.home-dk .line-slide { transition: none; }` в reduced-motion блоке.
- [x] Юнит-тест сценариев I/O-матрицы — в проекте нет тест-раннера (нет `test`-скрипта/фреймворка); покрытие обеспечено ручными проверками из раздела Verification (клик→классы+hash, load-with-hash, невалидный hash, reduced-motion).

**Acceptance Criteria:**
- Given desktop Home, when клик по цифре `.line-dots`, then активный слайд меняется (`active`/`prev`/`next`), `button.active` синхронна, авто-ротации нет.
- Given desktop, when клик по цифре, then URL hash обновляется на `#line-<key>-<n>` без скролл-прыжка; открытие такого URL восстанавливает активный слайд этой линии.
- Given mobile (`<768px`), then линии — горизонтальный `scroll-snap`-шелф (слайды 78%), свайп работает, переключателей нет, JS шелф не трогает.
- Given `prefers-reduced-motion: reduce`, when клик, then переключение мгновенное, без движения, но функциональность сохранена.
- Given SPA-навигацию прочь / unmount, then все слушатели сняты.
- Given реализацию, when `npm run lint` и `npm run build`, then strict-typecheck, линт и сборка проходят без ошибок.

## Spec Change Log

## Review Triage Log

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 1: (high 0, medium 1, low 0)
- defer: 1: (high 0, medium 1, low 0)
- reject: 12
- addressed_findings:
  - `[medium]` `[patch]` Активный слайд/точка обозначались только цветом (WCAG 1.4.1), а стори делает точки реальным переключателем. Добавлен `aria-pressed` на кнопки `.line-dots`: SSR-инициал (`aria-pressed={i===0}` в `ProductLines.tsx`) + тоггл в островке `setActive`. Пиксель не меняется, lint/build зелёные.

## Design Notes

**setActive — дословно из `Home.html` (источник истины):**
```js
const setActive = (slides, buttons, i) => {
  const total = slides.length
  slides.forEach((s, idx) => {
    s.classList.remove('active', 'prev', 'next')
    const diff = (idx - i + total) % total
    if (diff === 0) s.classList.add('active')
    else if (diff === total - 1) s.classList.add('prev')
    else if (diff === 1) s.classList.add('next')
  })
  buttons.forEach((b, idx) => b.classList.toggle('active', idx === i))
}
```

**Hash-синхрон (расширение сверх прототипа, по UX-DR11/AC).** Прототип hash не трогает; AC явно требует «синхрон с hash». Семантика намеренно namespaced во избежание коллизии с deep-link Каталога (`#automotive`/`#health`) и с `id="lines"` секции: `#line-<key>-<n>`. Запись — `history.replaceState(null,'',`#line-${key}-${i+1}`)` (без скролла к несуществующему id, без истории). Чтение — на маунте и по `hashchange`; невалидное значение → без изменений (дефолтный слайд 0). Только упомянутая линия восстанавливается; вторая остаётся дефолтной.

**Почему enhance-only, а не рендер слайдов островком.** Обе композиции уже SSR-рендерятся (AD-3); статичный кадр — pre-hydration/reduced-motion фолбэк. Островок, как `RevealOnScroll`, лишь тогглит классы поверх — ноль дублирования разметки/ассетов. Пропс `lines` даёт конфиг (ключи + число слайдов) из типизированного контента, а `data-line` на `.line-block` — стабильный мостик проп→DOM.

**Reduced-motion.** Переключение — ручное (не авто-анимация), поэтому не отключается; движение (кросс-фейд) убирается CSS-блоком `transition:none`, двойная защита в духе HeroMosaic.

## Verification

**Commands:**
- `npm run lint` — expected: без ошибок/warnings.
- `npm run build` — expected: strict typecheck + сборка проходят.

**Manual checks:**
- Desktop `/`: клик по цифрам 1–4 в Automotive и Health меняет активный слайд с кросс-фейдом; #-цифра подсвечивается; URL hash обновляется; F5 на `…/#line-health-2` открывает Health со слайдом 2.
- Mobile ≤768px: свайп шелфа снапится по слайдам 78%, кнопок-переключателей нет.
- Reduced-motion (DevTools emulate): клик переключает мгновенно, без анимации.

## Auto Run Result

Status: done

**Реализованное изменение:** Оживлён ручной переключатель продуктовых линий (Automotive/Health) на desktop-композиции Home. Новый листовой `'use client'`-островок `ProductLineSwitcher` навешивается поверх статичного SSR-кадра (Story 3.1), не переписывая разметку: клик по цифре `.line-dots` тогглит классы слайдов `active/prev/next` и `button.active` (логика `setActive` дословно из прототипа `Home.html`), без авто-ротации и таймеров. Состояние синхронизируется с URL hash в namespaced-формате `#line-<key>-<n>` через `history.replaceState` (без скролл-прыжка и засорения истории); загрузка и `hashchange` восстанавливают активный слайд. Mobile остаётся чистым CSS `scroll-snap`-шелфом (JS не трогает). Reduced-motion делает переключение мгновенным через CSS. Точки-переключатели получили `aria-pressed` (a11y-патч из ревью).

**Изменённые файлы:**
- `src/components/home/ProductLineSwitcher.client.tsx` (НОВЫЙ) — листовой островок-энхансер, `return null`; `setActive` + click-переключение + hash-синхрон + `aria-pressed`; cleanup всех слушателей по `usePathname`.
- `src/components/home/ProductLines.tsx` — `data-line` на desktop `.line-block`, монтаж `<ProductLineSwitcher>`, `aria-pressed` на кнопках-цифрах; статичный кадр и mobile не тронуты.
- `src/styles/home.css` — `.home-dk .line-slide { transition: none }` в блоке `@media (prefers-reduced-motion: reduce)`.

**Ревью (1 проход, Blind Hunter + Edge Case Hunter):**
- Патчи применены: 1 — `aria-pressed` на точках-переключателях (WCAG 1.4.1: активное состояние обозначалось только цветом).
- Отложено: 1 — полная screen-reader-семантика карусели (aria-hidden на неактивных слайдах, `aria-roledescription`, live-region) → `deferred-work.md` (пре-существующая SSR-структура Story 3.1, лучше единым a11y-проходом).
- Отклонено: 12 — гипотетические/невозможные при single-source-of-truth состояния (`data-i` всегда в диапазоне; prop `count` и DOM-слайды из одного `slidesDesktop`), верное воспроизведение прототипа (инвариант «setActive дословно»), инертные при RSC-родителе, либо by-design/задокументированные.
- Функциональных багов high-severity не найдено; эквивалентность SSR-кадра и `setActive(0)`, победа reduced-motion-правила по специфичности и порядку — проверены ревьюерами.

**Верификация:** `npm run lint` — чисто; `npm run build` — успешно (strict typecheck, все страницы собраны); `npx tsc --noEmit` — без ошибок. Ручные проверки из раздела Verification применимы (в проекте нет тест-раннера — подтверждено отсутствием `test`-скрипта и тест-фреймворков в `package.json`).

**Остаточные риски:** Отложенная screen-reader-семантика карусели (см. `deferred-work.md`). Hash отражает только последнюю интерактивную линию (by-design). Функциональных рисков для визуального пользователя не выявлено.
