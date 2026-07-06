---
title: 'Story 5.2 — Карточка товара со слайдером изображений'
type: 'feature'
created: '2026-07-06'
status: 'done'
baseline_revision: '91a7582e048dcdcee7f94c5a832453444f189855'
final_revision: 'b1253f66e7fc7f475630c5a8868166f378fa20f3'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/rollun_handoff/rollun-web-site/project/Catalog.html'
  - '{project-root}/rollun_handoff/rollun-web-site/project/Catalog Mobile.html'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** Story 5.1 собрала каркас Catalog, но контейнеры товаров (`.product-grid[data-cat]` на desktop, `.product-shelf[data-cat]` на mobile) рендерятся ПУСТЫМИ. Нужна пиксель-в-пиксель карточка товара с интерактивным слайдером изображений (desktop — стрелки prev/next + точки; mobile — swipe + точки) — второй слой эпика 5, на который лягут офферы (5.3) и quick-view (5.4).

**Approach:** Ввести типизированный статический набор `PRODUCTS` (`content/products.ts`, зеркало будущей Payload-коллекции `Products`), рендерить карточки СЕРВЕРНО (RSC `ProductCard`) в существующие контейнеры 5.1, а всю интерактивность слайдера вынести в один листовой `'use client'`-островок (`CatalogCardSlider`), портирующий VERBATIM логику `go()`/стрелок/swipe из прототипов. Фавиконки брендов/маркетплейсов — листовой клиент-компонент с `onerror`-скрытием.

## Boundaries & Constraints

**Always:**
- Пиксель-в-пиксель по отрисованному Handoff. Портировать VERBATIM ВСЕ правила `.product-card`/`.pc-*`/`.img-ph`/`.pc-badge`/`.pc-markets .mk` из `<style>` ОБОИХ прототипов: desktop-правила под `.catalog-dk`, mobile под `.catalog-mb` (значения различаются — точка active 17px dk / 16px mb, паддинги body 18px/15px, arrow-media-hover только dk, и т.д.). DS-токены через `var(--color-*)`, прототип-литералы (`rgba(255,255,255,.92)`, `cubic-bezier(.4,0,.2,1)`, тени) — как есть. НЕ переопределять `.btn`/`.reveal`.
- Карточки рендерятся СЕРВЕРНО (RSC) из данных `PRODUCTS` в СУЩЕСТВУЮЩИЕ пустые контейнеры 5.1 — НЕ инжектятся клиентским JS. Маппинг контейнер→товары VERBATIM из прототипа: desktop `.product-grid[data-cat="auto-all"]` = по одному представителю `tires[0]`/`oils[0]`/`elec[0]` (3 карточки); desktop `.product-grid[data-cat="health"]` = все `health` (3); mobile `.product-shelf[data-cat="tires|oils|elec|health"]` = все товары своей категории.
- Слайдер — листовой островок (AD-1), `'use client'`, `return null`, только `useEffect` keyed на `usePathname()`, enhance-only (никогда не создаёт/переписывает разметку), cleanup снимает ВСЕ слушатели. Прецедент — `CatalogLineSwitcher.client.tsx`. `go(k)` VERBATIM: `i=(k+n)%n`, `track.style.transform='translateX('+(-i*100)+'%)'`, синхрон точек `.active`. Desktop-карточки (в `.catalog-dk`) — стрелки `.pc-arrow.prev/.next` с `e.stopPropagation()`; mobile-карточки (в `.catalog-mb`) — touch-swipe на `.pc-media` с порогом 36px (`dx<0`→next, `dx>0`→prev), passive-слушатели.
- Разметка карточки VERBATIM: `.pc-media` (`.pc-track` из N `.pc-slide` с плейсхолдером `Photo N`, N = `imgs.length`), `.pc-dots` (N точек, первая `.active`), `.pc-badge` («In stock»; dk-класс `pc-badge stock`, mb-класс `pc-badge`), `.pc-body` (`.pc-brand-row` фавиконка+`.pc-brand`, `.pc-name`, `.pc-specs` = `specs.slice(1,4)` три строки k/v, `.pc-offers` с `.pc-stock` + `.pc-markets`, `.pc-cta` «View details»+стрелка). Desktop-карточка ДОБАВЛЯЕТ `.pc-arrow.prev/.next`; mobile — БЕЗ стрелок. Inline-SVG (`chevL`/`chevR`/`arrowR`/`imgIco`) портируются verbatim.
- Чипы маркетплейсов — СТАТИЧНЫЕ Amazon + eBay (имя + фавиконка-домен): в прототипе это `buildOffers(p,cat).slice(0,2)`, а первые два оффера инвариантно `amazon`,`ebay` для ОБЕИХ линий (walmart — только 3-й у auto, отрезается). Определить как маленькую константу `CARD_MARKETS`; `buildOffers`/цены/URL — НЕ здесь.
- Тип `Product` — FLAT SERIALIZABLE (строки/числа/массивы/кортежи; без функций/JSX), совместим с будущей Payload-коллекцией `Products` (AD-7). Зарезервировать опциональные `sku`/`externalId` (шов к фиду Фазы 4). Товары живут в ОТДЕЛЬНОМ модуле `content/products.ts` (коллекция `Products` ≠ Global `CatalogContent`), НЕ внутри `CatalogContent`.
- Фавиконки — через `https://www.google.com/s2/favicons?domain=<d>&sz=64` (AD-11, единственное разрешённое исключение вендоринга), листовой `'use client'`-компонент `<img>` с `onError` → `style.visibility='hidden'` (пустое состояние: битая фавиконка не рушит верстку). Suppress `@next/next/no-img-element` точечно (как `SubcatTile` в 5.1).
- Карточка рендерится с `role="button"`, `tabindex="0"`, `aria-label="<brand> <name>"`, focus-visible оранжевый ринг (пиксель/DOM-фиделити прототипа) — АКТИВИРУЮЩИЙ обработчик (открытие quick-view) приходит в 5.4, не здесь.

**Block If:**
- Прототипы `Catalog.html` / `Catalog Mobile.html` отсутствуют/нечитаемы (нельзя портировать пиксель/логику верно).
- Контейнеры-точки монтирования из 5.1 (`.catalog-dk .product-grid[data-cat]`, `.catalog-mb .product-shelf[data-cat]`) отсутствуют — 5.2 зависит от каркаса 5.1.

**Never:**
- НЕ реализовывать `buildOffers`/`lib/offers.ts`, репрезентативные цены, внешние offer-ссылки, чип Walmart, offer-дисклеймер — это Story 5.3. Не импортировать `lib/offers.ts` нигде (его ещё нет).
- НЕ реализовывать quick-view (модалка/bottom-sheet, `.pd-*`), галерею thumbs, звёзды рейтинга, `Compatibility/fits`, обработчик клика/Enter/Space по карточке `openDetail` — это Story 5.4.
- НЕ реализовывать brand marquee — Story 5.5.
- НЕ инжектить карточки клиентским JS (рендер только RSC); НЕ добавлять реальные фото товаров (Фаза 1 — плейсхолдеры `Photo N`).
- НЕ «примирять» кросс-страничные расхождения токенов/адресов; НЕ переопределять общие `.btn`/`.reveal`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Рендер карточки (desktop) | `/catalog` desktop, линия выбрана | `.product-card` показывает N слайдов (виден 1-й), N точек (1-я active), стрелки скрыты до hover `.pc-media`, бейдж «In stock», бренд-фавиконка+`.pc-brand`, name, 3 спеки, чипы Amazon+eBay, CTA «View details» | фавиконка не загрузилась → `<img>` скрыт (`visibility:hidden`), верстка цела |
| Клик `.pc-arrow.next` (desktop) | клик стрелки next | `go(i+1)`: `.pc-track` `translateX(-i*100%)` циклично, active-точка синхронизирована; `e.stopPropagation()` (клик по стрелке не всплывает к карточке) | конец → wrap на слайд 0 |
| Клик `.pc-arrow.prev` на 1-м слайде | клик prev при i=0 | `go(i-1)` → `i=(0-1+n)%n` = последний слайд | — |
| Рендер/swipe (mobile) | `/catalog` mobile, свайп на `.pc-media` >36px | shelf карточек (ширина 80%, scroll-snap center); `dx<0`→next, `dx>0`→prev, циклично, точки синхр.; стрелок НЕТ | свайп ≤36px → слайд не меняется |
| Клик по телу карточки (5.2) | клик карточки (не по стрелке) | ничего (quick-view — 5.4); слайдер не затронут | — |
| Клик по `.subcat` | клик плитки | ничего (декоративная, из 5.1) | — |

</intent-contract>

## Code Map

- `src/content/products.ts` -- НОВЫЙ: тип `Product` (+ `ProductCategory`), набор `PRODUCTS` (tires/oils/elec/health, по 3), константа `CARD_MARKETS`. Данные VERBATIM из `PRODUCTS` прототипа. Образец стиля — `content/catalog.ts`
- `src/components/catalog/FaviconImg.client.tsx` -- НОВЫЙ листовой клиент: `<img>` фавиконки с `onError`→hide; suppress no-img-element
- `src/components/catalog/ProductCard.tsx` -- НОВЫЙ RSC: одна карточка, проп `variant: 'dk' | 'mb'` (dk добавляет `.pc-arrow`); порт разметки+inline-SVG verbatim; использует `FaviconImg`
- `src/components/catalog/CatalogCardSlider.client.tsx` -- НОВЫЙ островок: enhance слайдеров (`go()`, стрелки dk, swipe mb, синхрон точек), cleanup, `usePathname`, `return null`. Образец — `CatalogLineSwitcher.client.tsx`
- `src/components/catalog/ProductLines.tsx` -- ПРАВКА: наполнить пустые `.product-grid`/`.product-shelf` компонентами `<ProductCard>` по маппингу; смонтировать `<CatalogCardSlider/>` (см. как смонтирован `CatalogLineSwitcher`)
- `src/app/(site)/catalog/page.tsx` -- ПРАВКА: импорт `PRODUCTS`, передать пропом в `ProductLines` (page остаётся разводкой контента)
- `src/styles/catalog.css` -- ПРАВКА: портировать все `.product-card`/`.pc-*`/`.img-ph`/`.mk` правила verbatim (dk под `.catalog-dk`, mb под `.catalog-mb`) в `@layer components`
- `rollun_handoff/.../Catalog.html` (`cardEl`/`go`/`PRODUCTS`/`MK`, строки ~1359-1500) и `Catalog Mobile.html` (аналог + touch-swipe) -- источник пикселя/логики/данных (VERBATIM)

## Tasks & Acceptance

**Execution:**
- [x] `src/content/products.ts` -- определить `Product` (`brand`, `domain`, `name`, `imgs: string[]`, `rating: number`, `reviews: number`, `specs: [string,string][]`, `fits: string[]`, `desc: string`, `amazon?: string`, зарезервированные `sku?: string`/`externalId?: string`), `ProductCategory = 'tires'|'oils'|'elec'|'health'`, `PRODUCTS: Record<ProductCategory, Product[]>` (VERBATIM данные из прототипа, по 3 товара), `CARD_MARKETS = [{name:'Amazon',domain:'amazon.com'},{name:'eBay',domain:'ebay.com'}]` -- типизированный статический источник карточек (шов к Payload `Products`)
- [x] `src/components/catalog/FaviconImg.client.tsx` -- `'use client'` листовой: `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" alt="" onError=(e)=>e.currentTarget.style.visibility='hidden'>` + проп `className`; suppress `@next/next/no-img-element` -- пустое состояние фавиконки
- [x] `src/components/catalog/ProductCard.tsx` -- RSC, проп `{ product, variant }`: рендер `.pc-media`(`.pc-track`×`.pc-slide` плейсхолдеры `Photo N` по `imgs.length`, `.pc-dots` N точек 1-я active, `.pc-badge`), `.pc-body`(`.pc-brand-row` `FaviconImg.pc-logo`+`.pc-brand`, `.pc-name`, `.pc-specs`=`specs.slice(1,4)`, `.pc-offers` `.pc-stock`+`.pc-markets` из `CARD_MARKETS` с `FaviconImg`, `.pc-cta`«View details»+`arrowR`); `role/tabindex/aria-label`; при `variant==='dk'` добавить `.pc-arrow.prev/.next` (`chevL`/`chevR`, `aria-label`); inline-SVG verbatim -- пиксель карточки, оба варианта
- [x] `src/components/catalog/CatalogCardSlider.client.tsx` -- островок: в `useEffect` (keyed `usePathname()`) для каждой `.catalog-dk .product-card` и `.catalog-mb .product-card` завести слайдер: `track=.pc-track`, `dots=[...​.pc-dot]`, `n=dots.length`, `go(k)` VERBATIM; для dk-карточек — click `.pc-arrow.prev`→`go(i-1)`/`.next`→`go(i+1)` с `e.stopPropagation()`; для mb-карточек — `touchstart/move/end` (passive start/move) на `.pc-media`, порог 36px → `go(dx<0?i+1:i-1)`; cleanup снимает все слушатели -- вся интерактивность слайдера; enhance-only
- [x] `src/components/catalog/ProductLines.tsx` -- наполнить контейнеры: desktop `.product-grid[data-cat="auto-all"]` = `[PRODUCTS.tires[0], PRODUCTS.oils[0], PRODUCTS.elec[0]].map(<ProductCard variant="dk"/>)`; desktop `.product-grid[data-cat="health"]` = `PRODUCTS.health.map(dk)`; mobile `.product-shelf[data-cat=cat]` = `PRODUCTS[cat].map(<ProductCard variant="mb"/>)` для tires/oils/elec/health; смонтировать `<CatalogCardSlider/>` один раз -- точки монтирования 5.1 наполнены
- [x] `src/app/(site)/catalog/page.tsx` -- импорт `PRODUCTS`, передать `products={PRODUCTS}` в `<ProductLines>` (0 собственных строк контента) -- разводка данных
- [x] `src/styles/catalog.css` -- портировать verbatim ВСЕ card/slider-правила из `<style>` обоих прототипов в `@layer components`, dk-правила scoped `.catalog-dk`, mb — `.catalog-mb`; палитра через `var(--color-*)`, литералы как есть -- пиксель-паритет
- [x] Юнит-тест слайдера (если есть тест-раннер, иначе пропустить) -- `go()` цикличность `(k+n)%n` (wrap на обоих концах) и синхрон active-точки -- покрытие I/O-матрицы слайдера

**Acceptance Criteria:**
- Given `/catalog` desktop с выбранной линией, when страница отрисована, then каждая `.product-card` пиксель-в-пиксель: N слайдов (виден 1-й), N точек (1-я active), бейдж «In stock», бренд-фавиконка+имя+3 спеки, чипы Amazon+eBay, CTA «View details»; стрелки появляются на hover `.pc-media`.
- Given desktop-карточка, when клик по стрелке next/prev, then слайд циклично сдвигается (`translateX`), active-точка синхронна, wrap на концах; клик по стрелке НЕ всплывает (`stopPropagation`).
- Given mobile (≤768px), when swipe >36px по `.pc-media`, then слайд меняется (влево→next, вправо→prev) циклично с синхроном точек; стрелок нет; горизонтальный scroll-snap между карточками работает.
- Given любая карточка, when фавиконка бренда/маркетплейса не загрузилась, then её `<img>` скрыт (`visibility:hidden`), остальная верстка цела.
- Given карточка в 5.2, when клик по её телу, then quick-view НЕ открывается (это 5.4); в коде отсутствуют `buildOffers`/цены/`.pd-*`-модалка/рейтинг.
- Given маппинг контейнеров, then desktop auto-all = 3 карточки-представителя (tires/oils/elec), desktop health = 3, mobile shelves tires/oils/elec/health наполнены своими товарами; всё из `PRODUCTS`.
- Given страница, then `page.tsx` без собственных строк контента; `PRODUCTS` соответствует типу `Product`.

## Review Triage Log

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 1, low 1)
- defer: 0
- reject: 13
- addressed_findings:
  - `[medium]` `[patch]` Фавиконка (`FaviconImg`) хранила `onError` только React-синтетический — если SSR-`<img>` падает в 404 ДО гидрации, обработчик не срабатывает и битая иконка остаётся видимой (прототип ловил это нативным атрибутом `onerror=`), частично проваливая empty-state AC. Добавлен `useRef`+`useEffect`, скрывающий на маунте уже-упавшие изображения (`img.complete && naturalWidth===0`).
  - `[low]` `[patch]` `autoRepresentatives` в `ProductLines` отбросил защиту прототипа (`if(PRODUCTS[c]&&PRODUCTS[c][0])`) — пустая категория дала бы `undefined` и краш RSC-рендера. Добавлен `.filter(Boolean)`.
  - Отклонено 13 (verbatim-прототип под приоритетом пикселя над a11y-floor: вложенный `<button>` в `role=button`, инертный `role=button` до 5.4, swipe vs shelf-scroll, `visibility:hidden`-зазор, отсутствие `aria-live`; не срабатывает на статике: пустой `imgs`, дубль-ключи спеков, desync `i` при re-run на одностраничном `/catalog`, `e.touches[0]`; информационное: дублирующиеся favicon-фетчи AD-11, мёртвый `.pc-foot/.pc-market/.pc-view` CSS из verbatim-порта, редундантный `usePathname`, no-JS деградация).

## Design Notes

**Чипы карточки — статичны (граница 5.2↔5.3).** В прототипе `.pc-markets` = `buildOffers(p,cat).slice(0,2)`, но `buildOffers` для health и auto ставит `amazon`,`ebay` первыми (walmart — 3-й у auto, отрезается `slice(0,2)`). Значит чип-набор карточки ИНВАРИАНТЕН = Amazon+eBay для любой линии. Рендерим статичной `CARD_MARKETS` — без `buildOffers`. Полные офферы (цены, внешние URL, walmart, дисклеймер, offer-строки quick-view) — Story 5.3/5.4.

**RSC вместо инъекции.** Прототип строит карточки в JS и `appendChild` в пустые контейнеры. Мы рендерим их СЕРВЕРНО (`ProductCard` в `ProductLines`), а островок лишь ENHANCE-ит слайдер уже отрендеренной разметки. Прецедент: контейнеры 5.1 пустые именно под этот RSC-наполнитель.

**`go()` VERBATIM** (портировать в островок, замкнуть на карточку):
```js
let i = 0; const n = dots.length;
const go = k => { i=(k+n)%n; track.style.transform=`translateX(${-i*100}%)`;
  dots.forEach((d,di)=>d.classList.toggle('active',di===i)); };
```

**Карточка `role=button` инертна до 5.4.** Разметка несёт `role/tabindex/aria-label` и focus-ring (пиксель/DOM прототипа), но обработчик `openDetail` (клик/Enter/Space → quick-view) — Story 5.4. `stopPropagation` на стрелках портируем сразу (верно, когда 5.4 повесит клик карточки).

**Слайдер user-initiated.** Авто-проигрывания нет — переход `.pc-track .42s` запускается только действием пользователя, поэтому под требование `prefers-reduced-motion` (оно про АВТО-анимации: marquee 5.5) не подпадает; транзишн портируется verbatim.

**Товары — отдельный модуль.** `content/products.ts` зеркалит будущую Payload-коллекцию `Products` (≠ Global `CatalogContent`), с зарезервированными `sku`/`externalId` (шов к фиду Фазы 4). `imgs` хранит имена файлов из прототипа (Фаза 1 рендерит плейсхолдеры `Photo N` по количеству; реальные фото — позже).

## Verification

**Commands:**
- `npx tsc --noEmit` -- expected: типы сходятся; `PRODUCTS` соответствует `Product`
- `npm run lint` -- expected: чисто; `@next/next/no-img-element` заглушен точечно на фавиконках/плейсхолдерах
- `npm run build` -- expected: `/catalog` собирается как статический RSC без ошибок

**Manual checks:**
- Desktop: выбрать линию → карточки со слайдером; клик стрелок листает циклично + синхрон точек; стрелки на hover; клик по телу карточки ничего не открывает.
- Mobile (<768px): shelves карточек; свайп листает слайды + точки; стрелок нет; scroll-snap между карточками.
- Сверить пиксель карточки (media/badge/body/specs/chips/cta, точки/стрелки) с отрисованными `Catalog.html` и `Catalog Mobile.html`.
- Фавиконки: при недоступности `s2/favicons` `<img>` скрывается, верстка цела.
</content>
</invoke>

## Auto Run Result

Status: done

**Реализовано.** Карточка товара со слайдером изображений (Story 5.2) пиксель-в-пиксель desktop+mobile: пустые контейнеры каркаса 5.1 (`.product-grid[data-cat]` / `.product-shelf[data-cat]`) наполнены серверно-рендеримыми RSC-карточками из типизированного статического набора `PRODUCTS`, вся интерактивность слайдера — в одном листовом островке. Офферы (5.3), quick-view (5.4) и marquee (5.5) намеренно вне охвата.

**Файлы:**
- `src/content/products.ts` — НОВЫЙ: типы `Product`/`ProductCategory`/`ProductSpec`/`Market`, набор `PRODUCTS` (tires/oils/elec/health, по 3, VERBATIM из прототипов), `CARD_MARKETS`=[Amazon,eBay]; зарезервированы опциональные `sku`/`externalId` (шов Фазы 4).
- `src/components/catalog/FaviconImg.client.tsx` — НОВЫЙ листовой клиент: favicon `<img>` (AD-11) с `onError`- и mount-time-скрытием битых иконок.
- `src/components/catalog/ProductCard.tsx` — НОВЫЙ RSC: карточка, `variant: 'dk'|'mb'` (dk добавляет `.pc-arrow`); разметка+inline-SVG VERBATIM; `role=button`/`tabindex`/`aria-label` (активатор — 5.4).
- `src/components/catalog/CatalogCardSlider.client.tsx` — НОВЫЙ островок: `go()` VERBATIM, desktop-стрелки с `stopPropagation`, mobile touch-swipe (порог 36px), синхрон точек, cleanup, `usePathname`, `return null`.
- `src/components/catalog/ProductLines.tsx` — ПРАВКА: наполнены grid/shelf-контейнеры по маппингу прототипа (auto-all = представители tires[0]/oils[0]/elec[0] с `.filter(Boolean)`-защитой; health = все; mobile shelves = все своей категории); смонтирован `<CatalogCardSlider/>`.
- `src/app/(site)/catalog/page.tsx` — ПРАВКА: импорт `PRODUCTS`, проброс `products=`; 0 собственных строк контента.
- `src/styles/catalog.css` — ПРАВКА: +571 строка — все `.product-card`/`.pc-*`/`.img-ph`/`.pc-badge`/`.pc-markets .mk` правила VERBATIM (desktop под `.catalog-dk`, mobile под `.catalog-mb`), палитра через `var(--color-*)`.

**Review:** 2 патча применены (favicon pre-hydration 404 → mount-time-hide; `autoRepresentatives` защита от пустой категории). 0 отложено, 13 отклонено (verbatim-прототип под приоритетом пикселя над a11y-floor; не срабатывает на статике; информационное). 0 intent_gap, 0 bad_spec, 0 loopback. Follow-up review не рекомендован (2 локальных low/medium-фикса без влияния на поведение/API/данные).

**Верификация:** `npx tsc --noEmit` — чисто; `npm run lint` — чисто; `npm run build` — успех, `/catalog` = статический RSC (○). Повторно после патчей — всё зелёное.

**Остаточные риски:** пиксель-паритет подтверждён кодом/структурой и зелёным билдом, но не отрисовкой в браузере — финальная визуальная сверка карточки (media/badge/body/specs/chips/cta, точки/стрелки, свайп) против `Catalog.html` / `Catalog Mobile.html` остаётся ручной (SM-1). Известные verbatim-a11y-шероховатости (вложенный button-in-role=button, инертный role=button до 5.4, отсутствие aria-live слайдера) сознательно приняты под приоритетом пикселя — не блокеры.
