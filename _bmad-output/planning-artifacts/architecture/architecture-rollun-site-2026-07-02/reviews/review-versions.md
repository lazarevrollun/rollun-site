---
title: 'Ревью актуальности технологий — Architecture Spine «Сайт Rollun»'
type: version-currency-review
subject: 'ARCHITECTURE-SPINE.md → секция Stack + AD-2 / AD-10 / AD-11 / AD-12'
review-date: '2026-07-02'
method: 'WebSearch / WebFetch по официальным источникам (nextjs.org, payloadcms.com, tailwindcss.com, github.com, npmjs.com, endoflife.date)'
reviewer: 'automated web-verification pass'
---

# Ревью актуальности технологий — на июль 2026

Проверка каждого технологического утверждения из `ARCHITECTURE-SPINE.md` (секция **Stack**, а также решения **AD-2**, **AD-10**, **AD-11**, **AD-12**) против веб-источников по состоянию на **2 июля 2026**. Для каждого пункта: статус **PROVEN-CURRENT** (подтверждено веб-источником) / **STALE** (устарело) / **UNVERIFIED** (не удалось подтвердить), факт на июль 2026 и URL-источник.

---

## Вердикт (TL;DR)

**ВСЁ CURRENT.** Ни одно утверждение стека не устарело (0 × STALE). Все 15 проверяемых техно-фактов подтверждены веб-источниками как актуальные на июль 2026. Есть **1 содержательная неточность формулировки** (модель Cache Components — MEDIUM) и **2 мелкие косметические** (устаревший минимум версии Payload и статус Postgres как «ASSUMPTION» — LOW). Стек можно принимать как есть; правки — редакционные, не замена технологий.

| # | Технология (по Spine) | Заявлено | Статус | Факт на июль 2026 |
| --- | --- | --- | --- | --- |
| 1 | Next.js | 16.2.x, App Router, Turbopack, Cache Components | **PROVEN-CURRENT** | Последний стабильный — **16.2.10 (LTS), 01.07.2026**; App Router — рекомендованный; Turbopack — по умолчанию; Cache Components — реальная стабильная фича (нюанс: opt-in флагом) |
| 2 | React | 19.x | **PROVEN-CURRENT** | Next 16 работает на React 19 (использует фичи 19.2) |
| 3 | TypeScript | 5.x | **PROVEN-CURRENT** | 5.x — текущий мажор; TS-first в Next 16 |
| 4 | Payload CMS | 3.x (≥3.77, не 4.0) | **PROVEN-CURRENT** | v3 — текущий прод-стабильный (последний ~3.84.x, релизы v3 продолжаются в июне 2026); 4.0 — в разработке (beta/pre-alpha, не для прода) |
| 5 | Node.js | 20+ | **PROVEN-CURRENT** | Минимум Next 16 — **Node 20.9+** |
| 6 | Tailwind CSS | 4.x, CSS-first `@theme` | **PROVEN-CURRENT** | v4 — текущий; `@theme` без `tailwind.config.js` — реальный механизм; эмитит и `:root`-переменные, и утилиты |
| 7 | DB-адаптер Payload | Postgres `[ASSUMPTION]` | **PROVEN-CURRENT** | Postgres в Payload 3 — stable (Drizzle), Lexical — stable |
| 8 | D3 | 7 | **PROVEN-CURRENT** | Последний мажор — **7.9.0**, v8 не существует |
| 9 | topojson-client | 3 | **PROVEN-CURRENT** | Последний — **3.1.0** |
| 10 | us-atlas (states-10m) | 3 | **PROVEN-CURRENT** | Последний — **3.0.1**, `states-10m.json` присутствует |
| 11 | `next/font` (self-host) | актуален | **PROVEN-CURRENT** | Текущий рекомендованный способ, self-host по умолчанию |
| 12 | `next/image` | актуален | **PROVEN-CURRENT** | Текущий компонент оптимизации изображений |

---

## Детальный разбор по вопросам

### 1. Next.js 16.2.x

- **Текущий стабильный?** — **PROVEN-CURRENT.** По `endoflife.date` последний стабильный на 01.07.2026 — **16.2.10 (LTS)**; в июне 2026 фигурировал 16.2.7. Мажор 16 выпущен 22.10.2025, минор 16.2 — 18.03.2026. «16.2.x» в Spine попадает точно.
  - https://endoflife.date/nextjs · https://nextjs.org/blog/next-16-2 · https://nextjs.org/blog/next-16
- **App Router рекомендован?** — **PROVEN-CURRENT.** App Router — способ по умолчанию и рекомендованный, бесшовно работает с Cache Components.
  - https://nextjs.org/blog/next-16 · https://nextjs.org/docs/app/guides/upgrading/version-16
- **Turbopack по умолчанию?** — **PROVEN-CURRENT.** С Next 16 Turbopack стабилен и используется **по умолчанию** для `next dev` и `next build`.
  - https://nextjs.org/docs/app/api-reference/turbopack · https://nextjs.org/blog/next-16
- **Cache Components — реальная модель кэша Next 16?** — **PROVEN-CURRENT (с нюансом).** Cache Components — реальная **стабильная** фича Next 16 (стабилизированный наследник `experimental.dynamicIO` из Next 15, префикс `unstable_` снят). Центр — директива `use cache`; PPR встроен как поведение по умолчанию при включении. **Нюанс:** это **opt-in** через флаг `cacheComponents: true` в `next.config.ts`, а не «включено само по себе». Без флага действует dynamic-by-default (весь динамический код исполняется в request-time). См. находку F-1.
  - https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents · https://nextjs.org/docs/app/guides/migrating-to-cache-components · https://nextjs.org/docs/app/api-reference/directives/use-cache
- **params / cookies / headers async?** — **PROVEN-CURRENT.** В Next 16 синхронный доступ **удалён**: `params`, `searchParams` — Promise (нужен `await`); `cookies()`, `headers()`, `draftMode()` — async, доступ только через `await`/`use()`. Есть codemod `next-async-request-api`.
  - https://nextjs.org/docs/messages/sync-dynamic-apis · https://nextjs.org/docs/app/api-reference/functions/cookies · https://nextjs.org/docs/app/guides/upgrading/version-16

### 2. Payload CMS 3.x

- **Текущий стабильный (не 4.0)?** — **PROVEN-CURRENT.** Payload 3 — текущая прод-версия. Релизы v3 идут еженедельно (от ~3.73 в янв. 2026 до ~3.84.x к апрелю 2026; стабильная ветка получала релиз 09.06.2026). Spine прав: строить прод на 3.x.
  - https://github.com/payloadcms/payload/releases · https://payloadcms.com/posts/releases
- **4.0 ещё в разработке?** — **PROVEN-CURRENT.** Да. Команда Payload характеризует 4.0 как pre-alpha и прямо предупреждает **не** строить прод на main; `v4.0.0-beta.0` вышла 22.04.2026 как первая проверка миграции v3→v4. Для реального клиентского проекта сегодня рекомендован Payload 3.
  - https://www.buildwithmatija.com/blog/payload-4-0
- **Next-native / local API / установка в `/app`?** — **PROVEN-CURRENT.** Payload 3 — «первый CMS, устанавливающийся прямо в любое Next.js-приложение». Local API (`payload.find` и т.п.) идёт напрямую в БД без третьей-стороны-API, доступен в Server Components / Server Functions. Согласуется с деревом Spine (`app/(payload)/admin/`) и AD-12.
  - https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app · https://payloadcms.com/docs/getting-started/concepts
- **Postgres + Lexical stable?** — **PROVEN-CURRENT.** Postgres помечен stable в Payload 3.0 (через Drizzle; тот же код для Postgres/SQLite/Vercel Postgres). Lexical — stable, с inline/block-компонентами. Подтверждает `[ASSUMPTION]` из AD-12 фактами.
  - https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app · https://payloadcms.com/docs/rich-text/overview

### 3. Tailwind CSS v4

- **Текущий?** — **PROVEN-CURRENT.** v4 — текущий мажор (линейка v4.0/v4.1). Установка — одна строка `@import "tailwindcss"`.
  - https://tailwindcss.com/blog/tailwindcss-v4
- **CSS-first `@theme` без `tailwind.config.js` — реальный механизм?** — **PROVEN-CURRENT.** Конфигурация переехала из JS в CSS: кастомизация через at-rule `@theme` прямо в CSS, отдельный `tailwind.config.js` больше не нужен (legacy-режим через `@config` сохранён, но `corePlugins`/`safelist`/`separator` не поддерживаются). Совпадает с AD-2 и `styles/theme.css`.
  - https://tailwindcss.com/blog/tailwindcss-v4 · https://github.com/tailwindlabs/tailwindcss/discussions/17168
- **Токены = `:root`-переменные + утилиты?** — **PROVEN-CURRENT.** Переменные из `@theme` (а) инструктируют Tailwind создать соответствующие утилиты (`--color-brand` → `bg-brand`/`text-brand`/…) и (б) эмитятся как обычные CSS-переменные, доступные в рантайме. Ровно формулировка AD-2 («эмит и как `:root`-переменные, и как утилиты»).
  - https://tailwindcss.com/docs/theme

### 4. React 19 + Next 16, минимум Node

- **React 19 с Next 16?** — **PROVEN-CURRENT.** Next 16 работает на React 19 (App Router использует фичи React 19.2). Апгрейд: `npm install next@16 react@19 react-dom@19`.
  - https://nextjs.org/docs/messages/react-version · https://nextjs.org/docs/app/guides/upgrading/version-16
- **Node 20+ — минимум Next 16?** — **PROVEN-CURRENT.** Минимум поднят до **Node 20.9+**.
  - https://nextjs.org/docs/app/guides/upgrading/version-16

### 5. D3 v7 и гео-стек

- **D3 v7 — текущий мажор (нет v8)?** — **PROVEN-CURRENT.** Последний релиз — **7.9.0**; мажор 8 не выпущен.
  - https://github.com/d3/d3/releases · https://www.npmjs.com/package/d3
- **topojson-client v3?** — **PROVEN-CURRENT.** Последний — **3.1.0**.
  - https://www.npmjs.com/package/topojson-client · https://github.com/topojson/topojson-client
- **us-atlas v3 (states-10m)?** — **PROVEN-CURRENT.** Последний — **3.0.1**; `states-10m.json` (коллекции states + nation) присутствует в пакете.
  - https://github.com/topojson/us-atlas · https://www.npmjs.com/package/us-atlas

### 6. next/font, next/image в Next 16

- **`next/font`?** — **PROVEN-CURRENT.** Актуален; автоматическая оптимизация и **self-host** любых шрифтов без рантайм-запросов к Google Fonts — ровно то, что требует AD-11.
  - https://nextjs.org/docs/app/getting-started/fonts
- **`next/image`?** — **PROVEN-CURRENT.** Актуальный компонент App Router: авто-оптимизация, lazy-load, WebP/AVIF, предотвращение layout shift.
  - https://nextjs.org/docs/app/api-reference/components/image

---

## Находки (что stale / unverified / неточно)

### F-1 — Модель Cache Components описана неполно · severity: **MEDIUM** · тип: точность, не устаревание

Стек перечисляет «Cache Components» как встроенную часть Next 16, а **AD-10** гласит: «страницы **статически рендерятся**; правка контента триггерит `revalidatePath`/`revalidateTag` … согласовано с явной моделью Cache Components». Веб-источники подтверждают: Cache Components реальна и стабильна, **но**:

1. Она **opt-in** — включается флагом `cacheComponents: true` в `next.config.ts`; без флага — не активна.
2. При включённых Cache Components поведение по умолчанию — **dynamic** (request-time), а **статичность** страницы достигается **явно** через директиву `use cache` (+ `cacheTag`/`cacheLife`), а не автоматически.
3. `revalidateTag(tag)` инвалидирует записи, помеченные `cacheTag(tag)` — т.е. хук `afterChange` → `revalidateTag` требует, чтобы страница/фетч были помечены `use cache` + `cacheTag`.

Итог: направление AD-10 верное и реализуемо, но формулировка «страницы статически рендерятся … согласовано с Cache Components» ближе к **старой** модели неявного full-route-cache. Под Cache Components нужно явно: `use cache` на уровне страницы + `cacheTag`, тогда `revalidateTag` из хука сработает. **Рекомендация:** уточнить AD-10 и строку стека — назвать флаг `cacheComponents: true` и связку `use cache`/`cacheTag` ↔ `revalidateTag` как механизм статичности+ревалидации.
- https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents · https://nextjs.org/docs/app/api-reference/directives/use-cache · https://nextjs.org/docs/app/guides/migrating-to-cache-components

### F-2 — Минимум версии Payload «≥3.77» слегка отстал · severity: **LOW** · тип: косметика

Стек фиксирует «последний стабильный ≥3.77». Фактический последний v3 на лето 2026 — **~3.84.x** (релизы v3 продолжаются, ветка получала релиз 09.06.2026). Порог «≥3.77» не ошибочен (условие выполняется), но как ориентир занижен. **Рекомендация:** обновить ориентир до актуального v3 (≈3.84+) или заменить на «последний v3.x». Не блокер.
- https://github.com/payloadcms/payload/releases

### F-3 — Postgres помечен `[ASSUMPTION]`, хотя веб это подтверждает · severity: **LOW** · тип: можно повысить уверенность

AD-12 и строка стека держат DB-адаптер как `[ASSUMPTION: Postgres]`. Веб подтверждает: в Payload 3 Postgres — **stable + рекомендован** (Drizzle), Lexical — **stable**. Предположение обосновано; финальное решение — за владельцем (см. Deferred → «DB-адаптер»). Технической причины сомневаться нет. **Рекомендация:** оставить выбор за владельцем, но снять техническую неопределённость — «Postgres подтверждён как stable-опция; открыт только продуктовый выбор (Postgres vs SQLite vs Mongo)».
- https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app · https://payloadcms.com/docs/rich-text/overview

---

## Что осталось UNVERIFIED

Ничего критичного. Все 15 техно-фактов получили подтверждение. Единственный элемент, зависящий не от версии, — продуктовый выбор DB-адаптера (Postgres vs SQLite vs Mongo) — это осознанный Deferred в Spine, а не устаревание технологии.

---

## Источники

- Next.js релизы / версии: https://nextjs.org/blog/next-16 · https://nextjs.org/blog/next-16-2 · https://endoflife.date/nextjs · https://nextjs.org/docs/app/guides/upgrading/version-16
- Cache Components / Turbopack / async APIs: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents · https://nextjs.org/docs/app/guides/migrating-to-cache-components · https://nextjs.org/docs/app/api-reference/directives/use-cache · https://nextjs.org/docs/app/api-reference/turbopack · https://nextjs.org/docs/messages/sync-dynamic-apis · https://nextjs.org/docs/app/api-reference/functions/cookies
- React / Node минимум: https://nextjs.org/docs/messages/react-version
- Payload CMS: https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app · https://github.com/payloadcms/payload/releases · https://payloadcms.com/posts/releases · https://www.buildwithmatija.com/blog/payload-4-0 · https://payloadcms.com/docs/rich-text/overview · https://payloadcms.com/docs/getting-started/concepts
- Tailwind CSS v4: https://tailwindcss.com/blog/tailwindcss-v4 · https://tailwindcss.com/docs/theme · https://github.com/tailwindlabs/tailwindcss/discussions/17168
- D3 / topojson / us-atlas: https://github.com/d3/d3/releases · https://www.npmjs.com/package/d3 · https://www.npmjs.com/package/topojson-client · https://github.com/topojson/topojson-client · https://github.com/topojson/us-atlas · https://www.npmjs.com/package/us-atlas
- next/font, next/image: https://nextjs.org/docs/app/getting-started/fonts · https://nextjs.org/docs/app/api-reference/components/image
