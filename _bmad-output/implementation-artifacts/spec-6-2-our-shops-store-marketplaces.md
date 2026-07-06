---
title: 'Story 6.2: Our Shops — магазин и маркетплейсы'
type: 'feature'
created: '2026-07-06'
status: 'done'
baseline_revision: 'd7301aa36f8e8c1f384a08e035a7ebd0584e093f'
final_revision: '7802c83c59d016190d13dcebf0302458cb38cdc5'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/rollun_handoff/rollun-web-site/project/Our Shops.html'
  - '{project-root}/rollun_handoff/rollun-web-site/project/Our Shops Mobile.html'
  - '{project-root}/docs/pixel-acceptance/checklist-shops.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-6-context.md'
warnings: ['oversized']
---

<intent-contract>

## Intent

**Problem:** Страница `/shops` — заглушка из Story 1.1 (`<main>Rollun — Shops (scaffold)</main>`). Нужна полностью собранная страница «Our Shops»: Hero → физический магазин в Техасе (фото, адрес, таблица часов, телефон, GET DIRECTIONS) → три карточки маркетплейсов (Amazon/eBay/Walmart со скриншотом, лого, рейтингом и VISIT STORE), пиксель-в-пиксель desktop+mobile, со статичным контентом.

**Approach:** Ввести типизированный контент-объект `ShopsContent` (`content/shops.ts`) со всем статическим текстом, портированным дословно из обоих прототипов, и переписать `shops/page.tsx` как чистую функцию этого объекта (AD-7), по эталону `brands/page.tsx`. Секции — RSC-компоненты в `components/shops/*`, каждый рендерит ОБЕ композиции (desktop+mobile) в один DOM, переключение только CSS-медиа на 768px (AD-3), scope `.shops-dk`/`.shops-mb` в `styles/shops.css` по эталону `styles/brands.css`. Интерактива нет — клиентских островков страница не добавляет (header hide-on-scroll принадлежит layout).

## Boundaries & Constraints

**Always:**
- Прототип — единственный источник истины пикселя и текста: desktop = `Our Shops.html`, mobile = `Our Shops Mobile.html`. Весь текст (заголовки, микрокопи, адрес, часы, рейтинги, alt, лейблы кнопок) портируется ДОСЛОВНО, включая различия desktop↔mobile.
- Порядок секций (одинаков в обоих прототипах): Hero (01) → Physical Store (02) → Online Shops / marketplaces (03). Footer/Header — из `layout.tsx`, не дублировать.
- **Дословные различия desktop↔mobile — явными полями контента, не рантайм-логикой:** город desktop `Houston,Texas` (без пробела после запятой, инлайн `font-size:30px`) vs mobile `Houston, Texas`; лейбл кнопки directions desktop `GET DIRECTIONS` vs mobile `Get directions` (+ mobile-стрелка SVG); лейбл карточки desktop `VISIT STORE` vs mobile `Visit store`; alt фото магазина desktop `Rollun storefront entrance in Texas with the rollun sign above the door` vs mobile `Rollun storefront entrance in Texas`.
- **Воспроизвести дефекты дизайна дословно (AD-13):** «GET DIRECTIONS»/«Get directions» ведёт на `https://maps.google.com/maps?q=Conroe%2C%20Texas`, хотя виден адрес Houston — НЕ чинить на Houston. Часы магазина (`shops`-атом) расходятся с footer/contact — это отдельный именованный атом (AD-14), не сводить.
- Паспорт-атомы страницы (адрес магазина `5327 Aldine Mail Route Rd` / `77039`, часы, телефон `(832) 461-2525`, URL маркетплейсов) — НОВЫЙ дом в `content/shops.ts`. Это отдельные атомы от `site-contacts.ts`/`contact-info.ts` (там `Houston, TX 77039`; здесь desktop-адрес без города) — не сводить к существующим (прецедент AD-14: `COMPANY_BLURB`≠`COMPANY_INTRO`). Вынести так, чтобы позже ссылаться на `SiteSettings` без изменения разметки/пикселя (шов к Epic 7).
- `ShopsContent` — плоские сериализуемые данные (строки/числа/массивы/объекты, без функций и JSX), typecheck-совместимые с будущим Payload Global (AD-7/AD-14). Страница получает контент только пропсами; никакого клиентского фетча.
- Обе композиции SSR-рендерятся в DOM; выбор видимой — только CSS `@media` на 768px, паттерн `.shops-dk`/`.shops-mb` (эталон — `.brands-dk`/`.brands-mb`): desktop-правила в `(min-width:768px)`, mobile — в точном комплементе `not all and (min-width:768px)`. JS-гейтинг ширины и UA-сниффинг запрещены.
- Секции кроме hero получают класс `.reveal` (island `RevealOnScroll` уже смонтирован в layout — новый island не создавать).
- Переиспользовать существующие глобальные стили/токены: `.btn`/`.btn-or` (components.css), `.reveal`/`.in`, `.container`, токены `theme.css` (`--color-bg`/`--color-paper`/`--color-dark`/`--color-dark-2`/`--color-or`/`--color-ink*`/`--color-line`, `--spacing-container`/`--spacing-gutter`, `--font-display`). Новые глобальные токены не вводить. Все стили `shops.css` — в `@layer components`.
- Внешние ссылки (маркетплейсы, directions) — `target="_blank" rel="noopener"`. Скриншот карточки — тоже внешняя ссылка на витрину.
- Лого маркетплейса — презентационная разметка в компоненте по дискриминатору `brand`: Amazon (текст `amazon` + inline SVG-улыбка) и Walmart (inline SVG-спарк + текст `Walmart`) собираются разметкой; eBay — `<img src="/shop/ebay-logo.png">`. Звёзды рейтинга — `<span className="stars" style={{'--pct': …}}>`, оформление per-composition в CSS (desktop `::before/::after`, mobile mask-SVG — оба по `--pct`).

**Block If:**
- Пиксель-в-пиксель требует решения, не выводимого из прототипа (реальная неоднозначность разметки/стиля) — HALT `blocked`, условие описывает неоднозначность.
- Требуемый прототипом ассет отсутствует и в `public/shop/`, и в `rollun_handoff/rollun-web-site/project/shop/` — HALT `blocked`. (Проверено: `storefront-2.png`, `store-amazon.png`, `store-ebay.png`, `store-walmart-reviews.png`, `ebay-logo.png` присутствуют в handoff; `ebay-logo.png` уже в `public/shop/`.)

**Never:**
- Не «чинить» намеренные дефекты прототипа: Conroe-ссылку → Houston; `Houston,Texas` без пробела; расхождение часов между страницами.
- Не сводить shops-атомы к `site-contacts.ts`/`contact-info.ts` и не менять те модули.
- Не переписывать Header/Footer/RevealOnScroll — только переиспользовать из layout. Не создавать клиентских островков (интерактива на странице нет).
- Не менять пиксель ради a11y при конфликте (приоритет у дизайна). Не тащить прототипные `:root`-токены заново в глобальную палитру (уже в theme.css).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Загрузка `/shops` desktop (≥768px) | статический `shopsContent` | Секции 01–03 в порядке Handoff, desktop-композиция видима, пиксель совпадает с `Our Shops.html`; `shop-grid` в 3 колонки, город `Houston,Texas`, кнопка `GET DIRECTIONS` | — |
| Загрузка `/shops` mobile (<768px) | тот же `shopsContent` | Видима mobile-композиция, пиксель совпадает с `Our Shops Mobile.html`; карточки стопкой (`shop-list`), город `Houston, Texas`, кнопка `Get directions` | — |
| Клик «GET DIRECTIONS»/«Get directions» | клик по кнопке directions | Переход в новой вкладке на `maps.google.com/maps?q=Conroe%2C%20Texas` (дословно, дефект AD-13), `rel=noopener` | by design |
| Клик по скриншоту или «VISIT STORE» карточки | клик по внешней ссылке | Переход на URL витрины маркетплейса в новой вкладке (`rel=noopener`) | — |
| Любой вьюпорт | открыт DOM | Обе композиции присутствуют; видимое дерево выбирает только CSS-медиа 768px; рейтинг-звёзды заполнены на `--pct` из контента | — |
| `prefers-reduced-motion` | reduced-motion вкл. | Reveal-анимации отключены (глобальный паттерн); контент доступен | — |

</intent-contract>

## Code Map

- `src/app/(site)/shops/page.tsx` -- ПЕРЕПИСАТЬ: чистая функция `shopsContent`, композит секций (Hero → Store → Marketplaces); `import '@/styles/shops.css'`. Эталон — `brands/page.tsx`.
- `src/content/shops.ts` -- НОВЫЙ: тип `ShopsContent` + инстанс `shopsContent` (весь статический текст обоих прототипов дословно; desktop/mobile-варианты города/лейблов/alt как явные поля).
- `src/components/shops/Hero.tsx` -- НОВЫЙ RSC (01): page-hero — eyebrow «Where to buy», h1 «Our stores», абзац; обе композиции; первая секция без `.reveal`.
- `src/components/shops/Store.tsx` -- НОВЫЙ RSC (02): desktop `store-grid` (store-media фото + store-info: Location/city/addr/`hours-table`/`store-phone`/GET DIRECTIONS); mobile `section bg` (section-head + `store-photo` + store-info + Get directions со стрелкой); телефон-иконка и directions-стрелка — inline SVG в компоненте; `.reveal`.
- `src/components/shops/Marketplaces.tsx` -- НОВЫЙ RSC (03): desktop `shops`/`shop-grid` (3 карточки), mobile `section paper`/`shop-list`; мапит `ShopCard`. Вложенные хелперы `ShopCard` (skeleton карточки + рейтинг-звёзды по `--pct` + CTA-лейбл пропсом) и `ShopLogo` (switch по `brand`: amazon/walmart — inline SVG+текст, ebay — `<img>`); `.reveal`.
- `src/styles/shops.css` -- НОВЫЙ: стили обеих композиций, портированы из встроенного CSS `Our Shops.html` и `Our Shops Mobile.html` (+ нужные mobile-shell-классы `.section`/`.wrap`/`.section-head`/`.section-eyebrow`/`.section-title` из `mobile.css`); scope `.shops-dk`/`.shops-mb`, медиа-переключение 768px; всё в `@layer components`; не дублировать `.btn`/`.reveal`/`.container`/глоб. токены.
- `public/shop/` -- скопировать 4 ассета из `rollun_handoff/rollun-web-site/project/shop/`: `storefront-2.png`, `store-amazon.png`, `store-ebay.png`, `store-walmart-reviews.png` (`ebay-logo.png` уже на месте); ссылаться root-абсолютными URL (`/shop/*.png`).
- `src/app/(site)/brands/*`, `src/styles/brands.css`, `src/content/brands.ts` -- ЭТАЛОН паттерна (композиция dk/mb, content-модуль, scope css, `@layer components`) — не менять.
- `src/content/site-contacts.ts`, `src/content/contact-info.ts` -- родственные паспорт-атомы (footer/форма) — НЕ трогать, НЕ сводить с shops-атомами.
- `src/app/(site)/layout.tsx` -- Header/Footer/RevealOnScroll смонтированы здесь — переиспользовать, не трогать.
- `docs/pixel-acceptance/checklist-shops.md` -- чеклист приёмки (отмечается в review-проходе).

## Tasks & Acceptance

**Execution:**
- [x] `public/shop/` (assets) -- скопировать `storefront-2.png`, `store-amazon.png`, `store-ebay.png`, `store-walmart-reviews.png` из `rollun_handoff/rollun-web-site/project/shop/`; ссылаться `/shop/<name>.png` -- изображения доступны рантайму.
- [x] `src/content/shops.ts` -- определить тип `ShopsContent` и экспортировать инстанс `shopsContent`; весь статический текст обоих прототипов дословно, включая desktop/mobile-различия (город, лейблы directions/CTA, alt фото) -- единый типизированный источник (AD-7/AD-14).
- [x] `src/styles/shops.css` -- портировать стили обеих композиций (scope `.shops-dk`/`.shops-mb`, всё в `@layer components`), переключение только `@media` 768px (+ desktop-внутренний брейк ≤980px: `shop-grid`→1 колонка, `store-grid`→1 колонка); звёзды рейтинга desktop (`::before/::after`) и mobile (mask-SVG) по `--pct`; переиспользовать глобальные токены/классы -- пиксель-в-пиксель раскладка.
- [x] `src/components/shops/Hero.tsx` -- RSC (01): обе композиции, eyebrow/h1/абзац; без `.reveal`.
- [x] `src/components/shops/Store.tsx` -- RSC (02): desktop `store-grid`(media+info), mobile `section bg`(head+photo+info); hours-table, store-phone (inline SVG), directions-кнопка (desktop `GET DIRECTIONS`, mobile `Get directions`+стрелка) на дефектный Conroe-URL; `.reveal`.
- [x] `src/components/shops/Marketplaces.tsx` -- RSC (03): desktop `shop-grid`(3)/mobile `shop-list`; `ShopCard` (shop-shot ссылка+img, `ShopLogo` по brand, rating звёзды по `--pct`, blurb, CTA `VISIT STORE`/`Visit store`); `.reveal`.
- [x] `src/app/(site)/shops/page.tsx` -- переписать: `import '@/styles/shops.css'`, отрендерить Hero/Store/Marketplaces из `shopsContent` в `<main>` в порядке Handoff -- страница = чистая функция контента.

**Acceptance Criteria:**
- Given маршрут `/shops`, when страница загружена на desktop и на mobile, then отрендерены секции Handoff в порядке Hero→Store→Marketplaces и визуал совпадает с соответствующим прототипом (desktop `Our Shops.html` / mobile `Our Shops Mobile.html`).
- Given desktop-композицию, when открыт DOM, then `shop-grid` в 3 колонки, город `Houston,Texas` (без пробела, font-size 30px), лейблы `GET DIRECTIONS`/`VISIT STORE` капсом; три карточки Amazon/eBay/Walmart с корректными лого, рейтингами и внешними ссылками.
- Given mobile-композицию, when открыт DOM, then карточки стопкой (`shop-list`), город `Houston, Texas`, лейблы `Get directions`/`Visit store`, кнопка directions со стрелкой.
- Given кнопку directions на любой композиции, when открыт `href`, then он равен `https://maps.google.com/maps?q=Conroe%2C%20Texas` дословно (дефект AD-13 воспроизведён, не исправлен), `target=_blank rel=noopener`.
- Given реализацию, when проверяется тип, then страница типизирована как чистая функция `ShopsContent`, а `shopsContent` — статический инстанс из `content/*` (плоские сериализуемые данные, форма совместима с Payload Global); shops-атомы не ссылаются на `site-contacts.ts`/`contact-info.ts`.
- Given любой вьюпорт, when открыт DOM, then обе композиции присутствуют, переключение видимого дерева — только CSS-медиа 768px; звёзды рейтинга заполнены на `--pct` из контента.

## Design Notes

**Форма `ShopsContent` (скелет; строки заполнить ДОСЛОВНО из прототипов).** Различия desktop↔mobile — явными полями:

```ts
export type ShopHours = { day: string; time: string; closed?: boolean }
export type ShopCardData = {
  brand: 'amazon' | 'ebay' | 'walmart'   // → ShopLogo switch
  shot: { img: string; alt: string; href: string }
  rating: { pct: number; score: string; meta: string }  // pct → --pct
  blurb: string
  cta: { labelDk: string; labelMb: string; href: string }
}
export type ShopsContent = {
  hero: { eyebrow: string; title: string; intro: string }
  store: {
    eyebrow: string; title: string; intro: string
    photo: { img: string; altDk: string; altMb: string }
    locationLabel: string; cityDk: string; cityMb: string
    addressLines: string[]                 // ['5327 Aldine Mail Route Rd', '77039']
    hours: ShopHours[]                      // Mon–Fri 10 AM – 4 PM, Sat/Sun Closed
    phone: string                          // '(832) 461-2525'
    directions: { labelDk: string; labelMb: string; href: string } // href = Conroe (AD-13)
  }
  shops: { eyebrow: string; title: string; intro: string; cards: ShopCardData[] }
}
```

- **Композиция AD-3 (эталон — Brands/Catalog/About):** каждый секционный компонент выводит desktop-поддерево (`.shops-dk …`) и mobile-поддерево (`.shops-mb …`); видимость решает `@media` 768px. Точные внутренние классы — как в прототипе (`.page-hero`, `.store`/`.store-grid`/`.store-media`/`.store-photo-feature`/`.store-info`/`.hours-table`/`.store-phone`, mobile `.section`/`.section-head`/`.wrap`/`.store-photo`, `.shops`/`.shop-grid`/`.shop-list`/`.shop-card`/`.shop-shot`/`.shop-logo`/`.rating`/`.stars`).
- **Корневые классы на узле секции — компаундом, не потомком.** Как в brands (`.brands-mb.story`): mobile-секции несут `section bg`/`section paper` на корне `.shops-mb`, поэтому их правила — `.shops-mb.section.bg {…}` / `.shops-mb.section.paper {…}` (компаунд), иначе откат к общим стилям. `.store`/`.shops` desktop тоже на корне `.shops-dk` → `.shops-dk.store`/`.shops-dk.shops`.
- **CSS-переменная `--pct` в JSX:** `style={{ ['--pct' as string]: `${card.rating.pct}%` }}` — типизировать каст, звезда сама читает `var(--pct)` из CSS.
- **Лого:** Amazon = `<span class="amazon">amazon</span>` + inline `<svg class="amazon-smile">` (path'ы дословно из прототипа); Walmart = inline `<svg class="walmart-spark">` (6 lines) + `<span class="walmart">Walmart</span>`; eBay = `<img src="/shop/ebay-logo.png" alt="eBay">`. Разметка per-brand в `ShopLogo`, размеры — CSS per-composition.
- **Звёзды:** desktop `.stars::before` (серые) + `.stars::after` (оранжевые, `width:var(--pct)`, overflow hidden) — glyph `★`; mobile `.stars` = linear-gradient по `--pct` под mask-SVG (дословно из mobile-прототипа). Обе версии scoped (`.shops-dk .stars` / `.shops-mb .stars`).
- **Контент-модуль** повторяет `content/brands.ts`: типы + один инстанс (AD-14), без хардкода строк в JSX секций.

## Verification

**Commands:**
- `npm run lint` -- expected: без ошибок.
- `npm run build` -- expected: strict typecheck + сборка проходят; `ShopsContent`/`shopsContent` типобезопасны, `/shops` компилируется как чистая функция контента (○ Static prerender).

**Manual checks:**
- `npm run preview` → http://localhost:3000/shops : сверить визуал против `Our Shops.html` (1280px и 900px) и `Our Shops Mobile.html` (~390px и ~760px, 440px-шелл) по `docs/pixel-acceptance/checklist-shops.md`.
- В DOM подтвердить: desktop — `shop-grid` 3 колонки, город `Houston,Texas`, `GET DIRECTIONS`/`VISIT STORE`; mobile — `shop-list` стопкой, `Houston, Texas`, `Get directions`/`Visit store`; кнопка directions ведёт на `q=Conroe%2C%20Texas` (не Houston); звёзды заполнены на заданный `--pct`.

## Spec Change Log

_(no bad_spec loopbacks — empty)_

## Review Triage Log

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 3
- addressed_findings:
  - none
- rejected (not defects / by-design / precedent):
  - `[low]` **scroll-snap не портирован** (Blind Hunter). Прототипы гонят полноэкранные секции через `html{scroll-snap-type:y proximity}` + `scroll-snap-align:start`. Порт сохранил `min-height:100vh`, но snap-правила опущены. Отклонено: `scroll-snap-type` — html/layout-уровневое правило (Epic 1), не пер-страничный стиль; без контейнера `scroll-snap-align` инертен. Ровно это уже адъюдицировано прецедентом Story 6.1 (Brands: «scroll-snap-align dropped as inert, layout root has no scroll-snap-type»). Систематическое решение layout, не дефект этой истории.
  - Двойная загрузка `<img>` обеих композиций (desktop+mobile) в одном DOM — by design AD-3, системно для всего сайта; скрытая композиция `display:none`.
  - `.stars` без собственного `aria-label` — рейтинг доступен ассистивным технологиям через соседние `.score` («4.7 out of 5») и `.meta`; дословный порт, приоритет дизайна. Edge Case Hunter — 0 находок.

## Auto Run Result

Status: done

### Summary
Страница Our Shops (`/shops`) собрана как чистая функция типизированного `ShopsContent`: заглушка Story 1.1 заменена композитом секций Handoff. Обе композиции (`.shops-dk` / `.shops-mb`) SSR-рендерятся в один DOM, видимая выбирается только CSS-медиа на 768px (AD-3). Порядок (одинаков в обоих прототипах): Hero (01) → Physical Store (02, фото + Location/city/адрес + `hours-table` + телефон + GET DIRECTIONS) → Online Shops (03, три карточки Amazon/eBay/Walmart: скриншот-ссылка + лого + рейтинг-звёзды по `--pct` + blurb + VISIT STORE). Дословные различия desktop↔mobile — явными полями (`cityDk`/`cityMb`, `directions.labelDk`/`labelMb`, `cta.labelDk`/`labelMb`, `photo.altDk`/`altMb`). Дефекты дизайна воспроизведены дословно (AD-13): directions → `q=Conroe%2C%20Texas` при видимом Houston; `Houston,Texas` без пробела; часы — отдельный атом. Header/Footer/RevealOnScroll — из layout. Клиентских островков нет (интерактива на странице нет). Весь текст портирован дословно в один инстанс `shopsContent` (AD-7/AD-14).

### Files changed
- `src/app/(site)/shops/page.tsx` — переписан: чистая функция `shopsContent`, композит Hero/Store/Marketplaces в порядке Handoff, импорт `shops.css`.
- `src/content/shops.ts` (new) — тип `ShopsContent` + инстанс `shopsContent` (весь статический текст обоих прототипов дословно; desktop/mobile-варианты города/лейблов/alt как явные поля; Conroe-дефект).
- `src/components/shops/Hero.tsx` (new) — секция 01, обе композиции, без `.reveal`.
- `src/components/shops/Store.tsx` (new) — секция 02; desktop `store-grid`(media+dark info), mobile `section bg`(head+photo+info); `HoursTable`, inline PhoneIcon/ArrowIcon; directions → Conroe-URL.
- `src/components/shops/Marketplaces.tsx` (new) — секция 03; вложенные `ShopLogo` (switch по brand: amazon/walmart inline SVG+текст, ebay `<img>`) и `ShopCard` (shop-shot ссылка + рейтинг по `--pct` + CTA-лейбл пропсом); desktop `shop-grid`(3)/mobile `shop-list`.
- `src/styles/shops.css` (new) — стили обеих композиций, scope `.shops-dk`/`.shops-mb`, всё в `@layer components`, переключение медиа 768px + desktop-внутренний брейк ≤980px; звёзды desktop `::before/::after` / mobile mask-SVG по `--pct`; корневые классы компаундом.
- `public/shop/storefront-2.png`, `store-amazon.png`, `store-ebay.png`, `store-walmart-reviews.png` (new) — ассеты магазина/маркетплейсов (`ebay-logo.png` уже был на месте).

### Review findings
- Patches applied: 0. Deferred: 0. Intent gaps: 0. Bad spec: 0.
- Rejected (3): scroll-snap не портирован (by-design/precedent 6.1 — layout-уровневое правило, `scroll-snap-align` без контейнера инертен), двойная загрузка img обеих композиций (by design AD-3), `.stars` без `aria-label` (рейтинг доступен через `.score`/`.meta`). Edge Case Hunter — 0 находок.

### Verification
- `npm run lint` → PASS (без ошибок).
- `npm run build` → PASS (strict typecheck + сборка; `/shops` = ○ Static prerender).
- Пиксель-приёмка в браузере по `docs/pixel-acceptance/checklist-shops.md` (1280/900/~390/~760px) — ручной review-шаг (SM-1), ещё не отмечен.

### Residual risks
- Формальная пиксель-приёмка (визуальная сверка с прототипами) — ручной шаг, ещё не отмечен в чеклисте.
- scroll-snap-навигация по секциям присутствует в прототипах, но отсутствует на сайте (layout не задаёт `scroll-snap-type`) — сознательное системное решение (прецедент 6.1), не пер-страничная регрессия.
