---
title: 'Story 5.3 — Офферы: рантайм-деривация buildOffers'
type: 'feature'
created: '2026-07-06'
status: 'done'
baseline_revision: 'c492fd89183b0b52cb9cdc6ad46831480a3a6d6b'
final_revision: '51288f88d4eb18b66b8a43d05550b0e5587aade7'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/rollun_handoff/rollun-web-site/project/Catalog.html'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** Story 5.2 отрисовала карточки товара, но чипы маркетплейсов на них — статическая заглушка `CARD_MARKETS` (Amazon+eBay), а реальных офферов (цена, внешняя ссылка на площадку, Walmart для auto, дисклеймер) нет. По AD-9 офферы — рантайм-деривация, а не поле Payload, и должны быть единым источником для карточки (5.2) и будущего quick-view (5.4).

**Approach:** Ввести серверный чистый модуль `src/lib/offers.ts` с `buildOffers(product, line)`, портирующий VERBATIM логику `buildOffers`/`priceFor`/`offer`/`MK` из прототипа. Деривация вызывается СЕРВЕРНО в `ProductLines` (где линия известна из `side`/`variant`) и передаётся `ProductCard` готовым пропсом `offers: Offer[]`. Карточка рендерит чипы из `offers.slice(0,2)` вместо статической `CARD_MARKETS` (пиксель идентичен — первые два оффера инвариантно Amazon+eBay). Полные поля оффера (price/ship/url) + константа дисклеймера — готовый шов, который отрендерит quick-view (5.4).

## Boundaries & Constraints

**Always:**
- `buildOffers` VERBATIM по прототипу (Catalog.html ~1353-1446): `line==='health'` → `[amazon(direct `p.amazon`), ebay(search by `p.name`)]`; иначе (auto) → `[amazon, ebay, walmart]` все search-URL по `p.brand+' '+p.name`. Порядок офферов и ship-тексты (`'In stock · Prime delivery'`, `'In stock · Free shipping'`, `'In stock · 2-day shipping'`) — как в прототипе.
- `priceFor(p, idx)` и `MK` (домены + search-билдеры Amazon/eBay/Walmart) и `offer()`-фабрика (`url = переданный url || MK[key].search(name)`) — портировать VERBATIM.
- `Offer` — FLAT SERIALIZABLE (`{ key, name, domain, price, ship, url }`, все строки; `key: 'amazon'|'ebay'|'walmart'`). Денормализовать `name`/`domain` из `MK` В оффер, чтобы потребитель (в т.ч. клиентский quick-view 5.4) рендерил без импорта `lib/offers.ts`.
- Деривация — только СЕРВЕРНАЯ: `buildOffers` вызывается в RSC `ProductLines` (в `DesktopLineCol`/`MobileLine`, где линия = `side`/`variant`) и передаётся пропсом. **Импорт `lib/offers.ts` в client-островок ЗАПРЕЩЁН** (AD-9); `ProductCard` (RSC) импортирует только `type { Offer }`.
- Второй аргумент `buildOffers` — ЛИНИЯ `'auto' | 'health'` (AC: офферы «по линии»). health-линия = категория `health`; auto-линия = `tires`/`oils`/`elec` — все non-health.
- Чипы карточки = `offers.slice(0,2)` (`.mk`: `FaviconImg` домена + имя) — разметка/пиксель `.pc-markets` VERBATIM как в 5.2; меняется лишь источник (offers вместо `CARD_MARKETS`). Walmart (3-й оффер auto) отрезается slice — на карточке не показывается.
- Экспортировать `OFFER_DISCLAIMER` (текст дисклеймера из прототипа) — контракт для 5.4; сейчас не рендерится.
- Зарезервированные `sku`/`externalId` на `Product` (шов к фиду Фазы 4) сохранить; покупок/корзины на сайте нет.

**Block If:**
- Прототип `Catalog.html` отсутствует/нечитаем (нельзя портировать логику/цены/URL верно).

**Never:**
- НЕ реализовывать quick-view (`.pd-*`-модалку/bottom-sheet, offer-строки `.pd-offer`, галерею thumbs, рейтинг, `Compatibility/fits`, рендер дисклеймера/цены/внешних ссылок в UI) — это Story 5.4. 5.3 только ПРОИЗВОДИТ данные + рендерит чипы.
- НЕ делать оффер полем Payload/`CatalogContent` (AD-9); НЕ импортировать `lib/offers.ts` в `'use client'`-файл; НЕ фетчить из островка.
- НЕ добавлять чип Walmart на карточку (slice(0,2)); НЕ менять разметку/CSS `.pc-markets`; НЕ «примирять» кросс-страничные расхождения.
- НЕ вводить авто-анимаций (офферы статичны — вне `prefers-reduced-motion`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Health-линия | `buildOffers(healthProduct, 'health')` | 2 оффера: `amazon` (url = `p.amazon` прямой, ship «Prime delivery»), `ebay` (url = eBay search по `p.name`) | `p.amazon` отсутствует → amazon.url = Amazon search по `''` (прототип-faithful; в Фазе 1 у всех health есть `amazon`) |
| Auto-линия | `buildOffers(autoProduct, 'auto')` | 3 оффера: `amazon`,`ebay`,`walmart`, все url = search соответствующей площадки по `brand+' '+name`, ship-тексты по прототипу | — |
| Чипы карточки | `ProductCard` с `offers` | `.pc-markets` = `offers.slice(0,2)` → Amazon+eBay (для обеих линий); пиксель как в 5.2 | favicon не грузится → `<img>` скрыт (`FaviconImg`), верстка цела |
| Цена | `priceFor(p, idx)` | детерминированная строка `'$N[,NNN].CC'` (thousands-разделитель, центы из набора) | — |
| Клиентский потребитель | quick-view 5.4 получит `offers` пропсом | офферы сериализуемы, рендер без импорта `lib/offers.ts` | — |

</intent-contract>

## Code Map

- `src/lib/offers.ts` -- НОВЫЙ серверный чистый модуль (без `'use client'`, без React): типы `Offer`/`OfferKey`, конст `MK` (домены+search), `priceFor`, `offer`-фабрика, `buildOffers(p, line)`, `OFFER_DISCLAIMER`. Порт VERBATIM из `Catalog.html` ~1353-1446. Alias `@/lib`
- `src/components/catalog/ProductCard.tsx` -- ПРАВКА: проп `offers: Offer[]` (`import type { Offer } from '@/lib/offers'`); `.pc-markets` рендерит `offers.slice(0,2)` вместо `CARD_MARKETS`; убрать импорт `CARD_MARKETS`; обновить хедер-коммент («full offers are Story 5.3» → реализовано)
- `src/components/catalog/ProductLines.tsx` -- ПРАВКА: `import { buildOffers } from '@/lib/offers'`; в `DesktopLineCol` (`products.map`) передать `offers={buildOffers(p, side)}`; в `MobileLine` (`products[cat].map`) — `offers={buildOffers(p, variant)}`
- `src/content/products.ts` -- ПРАВКА: удалить ставшую лишней заглушку `CARD_MARKETS` и тип `Market` (если больше не используются); обновить хедер-коммент (чипы теперь из `buildOffers`); сохранить `sku`/`externalId`
- `rollun_handoff/.../Catalog.html` (`MK` ~1353, `offer` ~1364, `PRODUCTS`/`priceFor` ~1366-1446, `buildOffers` ~1429, дисклеймер ~1555) -- источник логики/цен/URL (VERBATIM)

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/offers.ts` -- определить `OfferKey='amazon'|'ebay'|'walmart'`, `Offer={key,name,domain,price,ship,url}`; `MK` (Amazon/eBay/Walmart: domain + `search(q)=>encodeURIComponent`-URL) VERBATIM; `priceFor(p,idx)` VERBATIM; `offer(key,price,ship,url,name?)` = `{key, name:MK[key].name, domain:MK[key].domain, price, ship: ship||'In stock · Free shipping', url: url||MK[key].search(name??'')}`; `buildOffers(p:Product, line:'auto'|'health'):Offer[]` VERBATIM (health→amazon(direct `p.amazon`)+ebay; auto→amazon+ebay+walmart); экспорт `OFFER_DISCLAIMER` -- единый серверный источник офферов (AD-9)
- [x] `src/components/catalog/ProductLines.tsx` -- смонтировать деривацию: `DesktopLineCol`→`offers={buildOffers(p, side)}`, `MobileLine`→`offers={buildOffers(p, variant)}` -- офферы передаются карточке готовыми пропсами, серверно
- [x] `src/components/catalog/ProductCard.tsx` -- принять `offers: Offer[]`; `.pc-markets` = `offers.slice(0,2).map(o => <span className="mk"><FaviconImg domain={o.domain}/>{o.name}</span>)`; снять импорт/использование `CARD_MARKETS` -- чипы data-driven, пиксель без изменений
- [x] `src/content/products.ts` -- удалить `CARD_MARKETS`/`Market` (заглушка 5.2 заменена деривацией), обновить коммент; `sku`/`externalId` не трогать -- убрать дублирующий источник офферов (AD-9)
- [x] Юнит-тест `buildOffers` (ПРОПУЩЕН — тест-раннера в проекте нет) (ЕСЛИ есть тест-раннер, иначе пропустить — сейчас его нет) -- health→2 оффера/auto→3, порядок, url-деривация (`p.amazon` direct vs search), `slice(0,2)`=Amazon+eBay -- покрытие I/O-матрицы

**Acceptance Criteria:**
- Given товар, when рендерятся офферы, then они вычислены серверным `buildOffers` (`lib/offers.ts`) по линии (Health→Amazon/eBay; Automotive→Amazon/eBay/Walmart), НЕ поле Payload/`CatalogContent`.
- Given карточка/будущий quick-view, when потребляют офферы, then получают их готовым пропсом `offers: Offer[]`; `lib/offers.ts` НЕ импортируется ни в один `'use client'`-файл.
- Given оффер, then он несёт `url` (для внешней ссылки `target=_blank rel=noopener` в 5.4), репрезентативную `price` и `ship`; модуль экспортирует `OFFER_DISCLAIMER` (текст дисклеймера) — рендер этого в UI — Story 5.4.
- Given карточка desktop/mobile, when отрисована, then `.pc-markets` = первые два оффера (Amazon+eBay), пиксель идентичен 5.2; Walmart на карточке отсутствует.
- Given `Product`, then поля `sku`/`externalId` сохранены (шов Фазы 4); покупок/корзины на сайте нет.
- Given проект, then `tsc`/`lint`/`build` проходят; в `'use client'`-островках нет импорта `lib/offers.ts`.

## Spec Change Log

<!-- Append-only. Empty until the first bad_spec loopback. -->

## Review Triage Log

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 1
- reject: 15
- addressed_findings:
  - none
- notes:
  - `[defer]` AD-9 (server/client boundary) сейчас держится только на конвенции/комментариях — предложено `import 'server-only'` в `lib/offers.ts` для build-time-гарантии. Пакет `server-only` не установлен и в репо не используется; добавление зависимости unattended вне объёма trivial-patch. Инвариант сегодня соблюдён (проверено: ни один `'use client'`-файл не импортирует модуль; `ProductCard`/`ProductLines` — RSC). Занесено в deferred-work.
  - Отклонено 15: verbatim-порт под мандатом пикселя/логики (health-`amazon` empty-search fallback — прототип-faithful И недостижим: все 3 Phase-1 health несут `amazon`; thousands-regex «мёртв» но verbatim; `ship`-дефолт недостижим но verbatim; коллизии цен из `priceFor`; implicit-else на типизированном union `'auto'|'health'`); by-design шов 5.3↔5.4 (price/ship/url деривируются, но не рендерятся в 5.3; `OFFER_DISCLAIMER` — контракт 5.4; чипы «ceremony for constant» — сознательно единый источник AD-9); норма проекта (нет тест-раннера — как в 5.1/5.2); ложное срабатывание (E4 «untyped params» — реальный код типизирован, `tsc` зелёный); не-этой-истории (line-classification coupling из каркаса 5.1; широкий export-surface — безвреден, мед. точкой мимо AD-9-guard).

## Design Notes

**Ключ деривации — линия, не категория.** AC: офферы «по линии». `buildOffers(p, line)` проверяет `line==='health'`; auto-линия (`tires`/`oils`/`elec`) идёт в non-health ветку. Прототип передавал категорию, но различает только health-vs-нет — эквивалентно. Линия доступна на месте рендера: `DesktopLineCol.side`, `MobileLine.variant`.

**Почему офферы денормализованы.** Клиентский quick-view (5.4) получит `offers` пропсом и НЕ может импортировать `lib/offers.ts` (AD-9). Поэтому `Offer` несёт `name`/`domain` внутри себя (не только `key`+внешний `MK`-лукап) — потребитель рендерит автономно.

**Граница 5.3↔5.4.** 5.3 = ПРОИЗВОДИТ офферы + рендерит чипы карточки (`slice(0,2)`, пиксель как в 5.2). Полные поля (price/url/ship) и `OFFER_DISCLAIMER` сейчас НЕ рендерятся — это готовый шов; offer-строки `.pd-offer`, внешние ссылки, цена и дисклеймер в UI — Story 5.4. Неиспользуемые сейчас поля оффера — намеренный шов, не мёртвый код.

**`buildOffers` VERBATIM-порт (ядро):**
```ts
export function buildOffers(p: Product, line: 'auto' | 'health'): Offer[] {
  if (line === 'health') return [
    offer('amazon', priceFor(p, 0), 'In stock · Prime delivery', p.amazon),
    offer('ebay',   priceFor(p, 1), 'In stock · Free shipping', undefined, p.name),
  ]
  return [
    offer('amazon',  priceFor(p, 0), 'In stock · Free shipping', undefined, p.brand + ' ' + p.name),
    offer('ebay',    priceFor(p, 1), 'In stock · Free shipping', undefined, p.brand + ' ' + p.name),
    offer('walmart', priceFor(p, 2), 'In stock · 2-day shipping', undefined, p.brand + ' ' + p.name),
  ]
}
```

## Verification

**Commands:**
- `npx tsc --noEmit` -- expected: типы сходятся; `Offer`/`buildOffers` типобезопасны, `ProductCard` принимает `offers`
- `npm run lint` -- expected: чисто; нет неиспользуемого `CARD_MARKETS`; `@next/next/no-img-element` уже заглушен на фавиконках
- `npm run build` -- expected: `/catalog` собирается как статический RSC без ошибок
- `grep -rn "lib/offers" src --include=*.tsx | xargs grep -l "use client"` -- expected: пусто (нет импорта в client-островках)

**Manual checks:**
- Desktop/mobile `/catalog`: чипы карточек — Amazon+eBay, пиксель как до 5.3 (favicon+имя, без Walmart).
- Сверить `buildOffers`/`priceFor`/`MK`/дисклеймер с `Catalog.html` (~1353-1446, ~1555) — значения/порядок/тексты совпадают.

## Auto Run Result

Status: done

**Implemented change:** Story 5.3 — рантайм-деривация офферов. Введён серверный чистый модуль `src/lib/offers.ts` (`buildOffers(p, line)` + `MK`/`priceFor`/`offer`/`OFFER_DISCLAIMER`), VERBATIM-порт из прототипа `Catalog.html`. Офферы вычисляются СЕРВЕРНО в RSC `ProductLines` (по линии `side`/`variant`) и передаются `ProductCard` готовым пропсом `offers: Offer[]`; карточка рендерит чипы из `offers.slice(0,2)` (Amazon+eBay), заменив статическую заглушку `CARD_MARKETS`. Полные поля оффера (price/ship/url) и `OFFER_DISCLAIMER` — готовый шов для quick-view (5.4). AD-9 соблюдён: модуль server-only, в client-островки не импортируется.

**Files changed:**
- `src/lib/offers.ts` — НОВЫЙ server-only модуль: `Offer`/`OfferKey`, `MK`, `offer`, `priceFor`, `buildOffers`, `OFFER_DISCLAIMER` (verbatim-порт).
- `src/components/catalog/ProductLines.tsx` — деривация `offers={buildOffers(p, side|variant)}` в `DesktopLineCol`/`MobileLine`.
- `src/components/catalog/ProductCard.tsx` — проп `offers: Offer[]` (type-only импорт); чипы `.pc-markets` из `offers.slice(0,2)`; убран `CARD_MARKETS`.
- `src/content/products.ts` — удалены заглушка `CARD_MARKETS` и тип `Market`; обновлён коммент; `sku`/`externalId` сохранены.

**Review findings breakdown:** patches applied: 0 · deferred: 1 (build-time `server-only` guard для AD-9 — требует новой зависимости) · rejected: 15 (verbatim-порт/by-design шов 5.3↔5.4/норма проекта/ложное срабатывание). Пиксель карточки не изменился; чипы byte-identical (Amazon+eBay).

**Verification:** `npx tsc --noEmit` — PASS; `npm run lint` — PASS (нет неиспользуемых `CARD_MARKETS`/`Market`); `npm run build` — PASS (`/catalog` статический RSC). Guard-проверка: ни один `'use client'`-файл не импортирует `lib/offers.ts`.

**Follow-up review recommended:** false — ревью не внесло изменений в код (patch=0), только один defer.

**Residual risks:** AD-9 держится на конвенции (нет build-time-гарантии до внедрения отложенного `server-only`); полные поля оффера (price/url) деривируются, но визуально не проверены до рендера в quick-view (5.4).
