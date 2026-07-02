# Addendum — Сайт Rollun

Материал, поддерживающий PRD, но не входящий в его основной нарратив: тех-механизмы («как»), отклонённые альтернативы, детальная модель данных, роадмап, справочные данные. Питает архитектуру/UX-спеку, а не приёмку продукта.

## A. Тех-стек и механизмы (зафиксировано)

- **Стек:** Next.js **App Router** + TypeScript + React + **Payload CMS 3.0**, self-host на инфре Rollun, opensource.
- **Payload в одном процессе:** работает внутри того же Next.js-приложения; React Server Components читают данные через **local API** без сетевого хопа.
- **Захардкоженный layout + типизированные слоты:** вёрстка в коде, CMS заполняет только размеченные поля. Снимает три напряжения разом — дизайн 1:1 не ждёт CMS, менеджер не ломает вёрстку, MVP быстрее.
- **Ревалидация:** правки менеджера появляются на проде через on-demand revalidation / ISR без пересборки.
- **Изображения:** коллекция `Media` + `next/image` → авто-оптимизация webp и нужные размеры («снимает страх hero на 8 МБ»).
- **Дизайн-токены (одна DS):** портируются из инлайн-стилей desktop-страниц и `mobile.css` в CSS-переменные / Tailwind theme — Poppins (заголовки) / Roboto / Karla (текст), оранж `#EF7F1A`. Файл `_ds/…/colors_and_type.css` (Archivo, `#EA7B08`) **не подключён ни одной страницей — игнорируется** (решение: канон — прототипы).
- **Внешние зависимости ассетов (вендорить под self-host, NFR-3):** шрифты Poppins/Roboto/Karla (+ **Caveat** на About) — Google Fonts → `next/font`; карта About — `d3@7`, `topojson-client@3`, `us-atlas@3/states-10m.json` (jsDelivr) → в бандл; прототип About тянет `react`/`react-dom`/`@babel/standalone` (unpkg) — **скаффолдинг прототипа, в Next-сборке не нужен**; лого для Marquee брендов — `google.com/s2/favicons` (в Фазе 1 оставляем как есть).

## B. Одна дизайн-система (и осиротевший DS-файл)

Прототипы (desktop и mobile) рендерятся **одной** DS: **Poppins** (заголовки), **Roboto**/**Karla** (текст), оранж **`#EF7F1A`**. Это подтверждено по `<head>` и `:root` всех 6 desktop-страниц + `mobile.css`.

| | Реальная DS (прототипы, desktop+mobile) | Осиротевший файл `colors_and_type.css` |
|---|---|---|
| Шрифты | Poppins / Roboto / Karla | Archivo / Hanken Grotesk / Spline Sans Mono |
| Оранж | `#EF7F1A` | `#EA7B08` («the wordmark orange») |
| Статус | **используется** (канон) | **не подключён ни одной страницей — игнорируется** |

Правило: матчим **визуал отрисованного прототипа** на каждом брейкпоинте, а не DOM. Desktop и mobile — отдельные HTML-раскладки (одна DS, разная вёрстка), переход на ~768px. Адреса воспроизводятся постранично как в дизайне: **и Contact, и Our Shops визуально показывают Houston TX 77039** (5327 Aldine Mail Route Rd); «Conroe TX» присутствует только в ссылке GET DIRECTIONS на Our Shops (нестыковка дизайна). Contact-табы карты переключают Houston ↔ Sheridan WY (legal).

## C. Детальная модель данных (ориентир для Фаз 2–4)

**Globals:** `SiteSettings` (паспорт: телефоны, адреса, email, GitHub, LinkedIn, часы) + по одному на страницу: `HomeContent`, `AboutContent`, `CatalogContent`, `BrandsContent`, `ShopsContent`, `ContactContent` (поля строго под слоты).

**Collections:**
- `Products` — шов `sku`/`externalId` заложен сразу. **Перезаписываемые фидом поля (Фаза 4):** цена, картинка(и), наличие. Реальная модель карточки из прототипа: `{ brand, domain (сайт бренда, источник фавиконки — не категория), name, imgs, rating, reviews, specs, fits, desc }`. Категория — неявный ключ группировки (tires/oils/elec/health), отдельного поля нет. **`offers` — не поле, а рантайм-генерация** (`buildOffers` + псевдо-цена): Health → Amazon/eBay, Automotive → Amazon/eBay/Walmart. Изображения в прототипе — плейсхолдеры («Photo N»). Категории: Automotive (масла и жидкости, электрика, шины и диски, АКБ), Health (ортопедия, обезболивание, добавки, energy & focus).
- `Brands` — лого брендов «Brands we work with» для **Marquee брендов на Catalog** (не для страницы Our Brands — та про собственный бренд MOTOTOU, см. §4.5 PRD). Страница-контент Our Brands = глобал `BrandsContent` (MOTOTOU: story/products/сертификат) — это отдельная сущность, не коллекция `Brands`.
- `Shops`/`Locations` — магазин Houston TX 77039 (5327 Aldine Mail Route Rd — видимый и на Our Shops, и на Contact); Sheridan WY (legal) для таба карты Contact. «Conroe TX» — только в ссылке GET DIRECTIONS на Our Shops (нестыковка дизайна). Ссылки/embeds Google Maps.
- `Media` — авто-оптимизация изображений.
- `Posts` — новости (Фаза 4).
- `Users` — встроенный auth Payload, роли `admin`/`manager`, access control.

*Коллекции `Submissions` нет: Заявки формы уходят напрямую в CRM API (POST), на сайте не хранятся.*

**Границы редактируемости (уровни текучести):** 🔴 Живое (картинки, товары) — CMS · 🟡 Правимое (тексты живых блоков) — CMS · 🟢 Паспорт (тел/адрес/соц/часы) — `SiteSettings` · ⚫ Гвоздями (вёрстка, структура, юр/статичный текст, микрокопи) — код.

## D. Роадмап (принят)

- **Фаза 0** — скаффолд Next.js+Payload, порт DS-токенов и шрифтов, базовый layout.
- **Фаза 1** — 6 страниц пиксель-в-пиксель, захардкоженный контент + рабочая форма (POST в CRM API).
- **Фаза 2** — `SiteSettings` + `Media`; контакты/ссылки/картинки на слоты.
- **Фаза 3** — `Products`/`Brands`/`Shops`; Catalog и Our Brands из CMS (ручной ввод).
- **Фаза 4** — авто-подтяг товаров по sku-шву; `Posts`/новости. *(Заявки в CRM — уже с Фазы 1.)*

## E. Отклонённые альтернативы (с причинами)

- **Свободный page-builder в CMS** — даёт менеджеру сломать дизайн. Отклонён в пользу типизированных слотов.
- **Абстрактная модель `Page`** — отклонена в пользу отдельного Global на страницу (точные поля под слоты).
- **Headless CMS отдельным сервисом (сетевой хоп)** — отклонён в пользу Payload в одном процессе (local API).
- **Авто-подтяг товаров сейчас** — отклонён; ручной ввод, модель готова через `sku` (Фаза 4).
- **Переписать на Laravel / другой стек** — не даёт пиксель-в-пиксель React из коробки, ломает срок.
- **Строить/хранить Заявки на сайте (коллекция `Submissions`, почта)** — отклонено; у Rollun своя CRM, форма POST-ит Заявку прямо в её API. Сайту не нужны ни `Submissions`, ни mailer.

## F. Тон и характер бренда

Rollun должен читаться как серьёзная технологичная компания; сайт для B2B = витрина серьёзности. Визуальный характер задан DS: фирменный оранж, charcoal, заданные spacing/radii/shadows/easing, типографика Handoff. Приоритет — точность исполнения и правильная граница «код vs контент». Итоговое видение — «живая самоуправляемая витрина технологичной дистрибуции Rollun».

## G. Справочные контактные данные (из дизайна)

- Registered Rollun LC — 30 N Gould St STE 4370, Sheridan WY 82801 (legal only; no walk-ins). На Contact — второй таб карты.
- Shop & return center — 5327 Aldine Mail Route Rd, Houston, TX 77039. Видимый адрес магазина и на Our Shops, и на Contact.
- «Conroe, Texas» — только цель ссылки GET DIRECTIONS на Our Shops (не совпадает с видимым адресом Houston; нестыковка дизайна, §I).
- Телефоны: (307) 920-0149 (legal), (832) 461-2525 (shop & return center).
- Email (отображаемые контакты): `llc@rollun.com`, `info@rollun.com` (футер). *Форма шлёт в CRM API, не на эти адреса.*
- Часы **расходятся между страницами** (воспроизводить как в дизайне каждой): Our Shops — Mon–Fri 10 AM–4 PM, Sat/Sun closed; Home CTA — desktop «11:00–21:00 UTC» / mobile «09:00–21:00 UTC+2».

## H. Источники и канонический маппинг файлов

Handoff: `rollun_handoff/rollun-web-site/project/` (главный экран `About Us.html`). **DS одна** — токены из инлайн-стилей desktop-страниц и `mobile.css`; логика mobile — `mobile.js`. Файл `_ds/rollun-design-system-d64777f9-…/colors_and_type.css` в бандле есть, но **не используется** (осиротевший, §B).

**Канон «страница → HTML» (файлы `*-print*.html`, `* v1.html`, `*-print-*.html` — служебные варианты, игнорировать):**

| Страница | Desktop | Mobile |
|---|---|---|
| Home | `Home.html` | `Home Mobile.html` |
| About Us | `About Us.html` | `About Us Mobile.html` |
| Catalog | `Catalog.html` | `Catalog Mobile.html` |
| Our Brands (MOTOTOU) | `Our Brands.html` | `Our Brands Mobile.html` |
| Our Shops | `Our Shops.html` | `Our Shops Mobile.html` |
| Contact | `Contact.html` | `Contact Mobile.html` |

Бриф: `_bmad-output/planning-artifacts/briefs/brief-rollun-site-2026-07-02/` (brief.md + addendum.md).
Брейншторм: `_bmad-output/brainstorming/brainstorm-rollun-site-cms-2026-07-02/`.

## I. Известные нестыковки дизайна (по умолчанию воспроизводим как есть; кандидаты на фикс — §8 PRD)

- **Contact — опечатка в стартовом `src` карты:** `53%2F27` (= «53/27») вместо `5327`. На первой загрузке карта ищет неверный адрес; клик по любому табу локации чинит (JS кодирует `data-q` заново). В обоих файлах (desktop + mobile).
- **Our Shops — адрес vs ссылка карты:** видимый адрес Houston TX 77039, а «GET DIRECTIONS» → `maps?q=Conroe, Texas`.
- **About Us — mobile ≠ desktop:** на mobile нет контакт-модалки (кнопки ведут на `Contact Mobile.html`); карта «US Presence» на mobile — статический список локаций/чипы, не D3.
- **Lightbox сертификата (Our Brands)** — есть только в mobile-DOM; на desktop это мёртвый код (нет элемента). Esc-закрытие нигде фактически не подключено (только клик).
- **Catalog — изображения товаров** в прототипе не рендерятся (плейсхолдеры «Photo N»); массив `imgs` задаёт только число слайдов. Реальные фото подставляются позже.
- **Home — mobile marketplaces** теряют рейтинги, которые есть на desktop-карточках.
