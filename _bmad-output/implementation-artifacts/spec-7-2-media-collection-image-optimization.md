---
title: 'Story 7.2 — Медиа: коллекция Media и авто-оптимизация изображений (единственный владелец канонических размеров/форматов)'
type: 'feature'
created: '2026-07-06'
status: 'done'
baseline_revision: 'de8010c818c5a1b1eb250a3822bc3054138cc2a2'
final_revision: '68cb34f18ccd1969bdad429da1714fc28551ac2f'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** Изображения сейчас — статичные файлы в `/public` (36 МБ, тяжёлые hero до 4.5 МБ), захардкоженные строковыми путями в `src/content/*`, без авто-оптимизации (webp/размеры) и без владельца канонических форматов. Нет CMS-коллекции, куда менеджер мог бы загрузить картинку и получить лёгкие, правильно нарезанные варианты (NFR-4). Story 7.3 (Page Globals) должна ссылаться на медиа — но ссылаться пока не на что.

**Approach:** Ввести Payload upload-коллекцию `Media` как ЕДИНСТВЕННОГО владельца канонических размеров/форматов: sharp нарезает загруженное в набор webp-вариантов фиксированной ширины. Дать канонический примитив вывода `MediaImage` (обёртка `next/image`), которым Story 7.3 и далее рендерят медиа-бэкнутые картинки — оптимизированные, с `alt`/`sizes`. Настроить `next.config` (webp, выровненные размеры, разрешённый media-путь). Существующую вёрстку Фазы 1 НЕ трогать: `/public`-картинки и намеренный `<img>`-конвент остаются до переезда контента на Media (это работа 7.3); AD-3 hero (background-image, одна композиция на вьюпорт) сохраняется как есть.

## Boundaries & Constraints

**Always:**
- `Media` — единственный дом канонических размеров/форматов (NFR-4). Варианты — webp; набор канонических ширин задаётся в ОДНОМ месте (`upload.imageSizes`) и выравнивается с `next.config` `imageSizes`/`deviceSizes`, чтобы не плодить второй источник правды по ширинам.
- Обработка изображений Payload требует sharp, переданного в `buildConfig({ sharp })` (Payload 3.x). Без этого `imageSizes`/`focalPoint` не работают — добавить `sharp` прямой зависимостью и пробросить в конфиг.
- `alt` в `Media` — обязательное поле (a11y): каждый медиа-вывод через `next/image` несёт осмысленный `alt`.
- Медиа-бэкнутый вывод идёт ТОЛЬКО через `next/image` (примитив `MediaImage`), с `sizes` под реальную ширину слота.
- Схема БД меняется только через миграцию (`migrate:create` → закоммитить `.ts` + `.json`), как в 7.1. Типы регенерируются `generate:types`.
- Пиксель-в-пиксель Фазы 1 (desktop+mobile) сохранён: ни одна существующая поверхность вывода в этой истории визуально не меняется.

**Block If:**
- Payload/sharp не может нарезать webp-варианты канонических ширин при загрузке (пайплайн оптимизации не работает) — HALT `blocked`.
- `next/image` не может оптимизировать файл, отданный Payload по media-URL (даже после настройки `images` + разрешённого пути) — HALT `blocked`.
- Приведение `Media`-коллекции требует сменить БД-адаптер/раскладку рантайма (выход за AD-12) — HALT `blocked`.

**Never:**
- НЕ мигрировать существующие `/public`-`<img>` на `next/image` в этой истории. Проект Epics 1-6 намеренно и повсеместно выбрал `<img>` с задокументированным обоснованием (`AD-13 pixel fidelity; next/image adds no value here`, ~10 файлов). Массовая замена (а) не делает Media владельцем этих `/public`-ассетов, (б) угрожает пиксель-перфекту #1, (в) всё равно переделывается в 7.3, когда картинки станут медиа-ссылками. Переезд поверхностей на Media = работа 7.3 (Page Globals ссылаются на медиа).
- НЕ переводить hero-мозаику (`Hero.tsx`/`HeroMosaic.client.tsx`) на `next/image`. Её `background-image`-дивы — намеренный AD-3-носитель art-direction (скрытая композиция `display:none` не грузит свой набор) + подложка bloom-анимации Story 3.2. Сохранить как есть; переезд hero на Media-бэкнутые источники — 7.3+, и он обязан сохранить «одна композиция на вьюпорт».
- НЕ вводить свободный page-builder, абстрактную модель `Page`, или второй источник размеров/форматов.
- НЕ добавлять тест-раннер (в проекте нет по конвенции — см. 7.1).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Загрузка изображения | admin/manager грузит JPG/PNG в `Media` | sharp нарезает webp-варианты канонических ширин; сохранены `width`/`height`/`url`/`sizes` варианты; `alt` обязателен | Не-изображение (по `mimeTypes`) отклоняется Payload |
| Рендер медиа-дока | `MediaImage` получает `Media`-док + `sizes` | `next/image` с `src=url`, `width`/`height` из дока, `alt` из дока, переданный `sizes` | Пустой/невалидный медиа-проп → не рендерит `<img>` (без «битой» картинки) |
| Медиа-URL под next/image | `/api/media/...`-URL в `next/image` | оптимизируется (webp) через `/_next/image`; путь разрешён в `images` | Неразрешённый путь → build/runtime-ошибка next/image (поймать настройкой) |

</intent-contract>

## Code Map

- `package.json` -- добавить `sharp` в `dependencies` (уже в `node_modules` транзитивно; нужен как прямой для явного проброса в конфиг).
- `payload.config.ts` -- импортировать `sharp`, передать в `buildConfig({ sharp, ... })`; добавить `Media` в `collections`.
- `src/collections/Media.ts` -- НОВЫЙ. `CollectionConfig` со `slug: 'media'`, `upload` (`imageSizes` канонических ширин → webp через `formatOptions`, `focalPoint`, `mimeTypes: ['image/*']`, `staticDir`), обязательное поле `alt`, `admin.group: 'Content'`.
- `src/collections/Users.ts` -- существующий образец `CollectionConfig` (раскладка/стиль).
- `src/components/media/MediaImage.tsx` -- НОВЫЙ. Серверный примитив вывода: `Media`-док → `next/image` (`src`/`width`/`height`/`alt`/`sizes`/опц. `priority`,`fill`). Канонический «вывод через next/image» для медиа-бэкнутых картинок; потребитель — Story 7.3+.
- `next.config.ts` -- добавить `images: { formats: ['image/webp'], deviceSizes, imageSizes (выровнены с Media), localPatterns/remotePatterns для media-пути }`; сохранить `output:'standalone'` + `cacheComponents:true`.
- `src/payload-types.ts` -- РЕГЕНЕРИРУЕТСЯ (`generate:types`) → тип `Media`.
- `src/migrations/*` -- НОВАЯ миграция (таблица `media`); закоммитить `.ts` + `.json`.
- `src/lib/payload.ts` -- существующий `getPayload` (не меняется; используется потребителями медиа в 7.3).

## Tasks & Acceptance

**Execution:**
- [x] `package.json` + `payload.config.ts` -- Добавить `sharp` в `dependencies` (версия совместимая с установленной транзитивной). В `payload.config.ts`: `import sharp from 'sharp'`, передать `sharp` в `buildConfig({ sharp, ... })`. БЕЗ этого upload-оптимизация не работает. _(sharp 0.34.5 добавлен, проброшен в buildConfig.)_
- [x] `src/collections/Media.ts` -- Создать upload-`CollectionConfig` (`slug:'media'`, `admin.group:'Content'`). `upload`: `staticDir` (напр. `public/media`, git-игнорируемый как пользовательские аплоады), `mimeTypes:['image/*']`, `focalPoint:true`, `imageSizes` — набор канонических ширин с `formatOptions:{ format:'webp', options:{ quality } }` на КАЖДЫЙ размер (пример-набор: `thumbnail` 256, `card` 640, `wide` 1024, `hero` 1600, `hero2x` 2400 — ширины финализировать под реальные слоты; высоты не задавать, чтобы держать пропорцию). Поле `alt: { type:'text', required:true }`. Опц. top-level `formatOptions` webp для основного файла. _(Реализовано; 5 webp-вариантов 256/640/1024/1600/2400 @ q80; top-level webp; `useAsTitle:'alt'`. ДЕВИАЦИЯ: добавлен `access.read: () => true` — публичный read обязателен, чтобы `next/image` мог оптимизировать media-URL (иначе Payload-дефолт `Boolean(user)` даёт 403 → `/_next/image` 400, ломая AC2/7.3); write/create/delete остаются auth-gated под будущий матрикс ролей Epic 8.)_
- [x] `payload.config.ts` -- Добавить `Media` в `collections: [Users, Media]`.
- [x] `.gitignore` -- Игнорировать `public/media/` (пользовательские аплоады), сохранив `.gitkeep`/директорию, если Payload требует существования `staticDir` при старте. _(`/public/media/*` игнор, `!/public/media/.gitkeep`.)_
- [x] `npm run generate:types` -- Регенерировать `src/payload-types.ts`; убедиться, что тип `Media` появился и экспортируется (его импортирует `MediaImage` и билдеры 7.3). _(`interface Media` с полями всех 5 вариантов.)_
- [x] `src/migrations/<generated>` -- `npm run migrate:create media`; закоммитить `.ts` + `.json`; прогнать `npm run migrate`. Таблица `media` создаётся без ошибок. _(`20260706_072820_media.ts|.json` + `index.ts`; migrate чисто.)_
- [x] `next.config.ts` -- Добавить `images`: `formats:['image/webp']`; `deviceSizes`/`imageSizes` выровнять с каноническими ширинами `Media` (один источник правды по ширинам); разрешить media-путь (`localPatterns:[{ pathname:'/api/media/**' }]` или `remotePatterns` под фактический URL Payload-аплоадов). Сохранить `output`/`cacheComponents`. _(`deviceSizes:[640,1024,1600,2400]`, `imageSizes:[256]`, `localPatterns` `/api/media/**`.)_
- [x] `src/components/media/MediaImage.tsx` -- Серверный компонент: проп `media: Media | number | null | undefined` (+ `sizes` required, опц. `className`,`priority`,`fill`). Разрезолвить URL/`width`/`height`/`alt` из `Media`-дока (при `number`-ссылке — не фетчить здесь; ожидать populated-док, иначе `null`). Отрендерить `next/image` с этими значениями. `null`/невалидный медиа → вернуть `null` (не рендерить битый `<img>`). Это единственный санкционированный путь вывода медиа-бэкнутых картинок. _(Реализовано; возвращает null при null/number-id/отсутствии url|dims.)_

**Acceptance Criteria:**
- Given настроенная `Media` и `sharp` в `buildConfig`, when admin грузит JPG/PNG в `/admin`, then создаётся набор webp-вариантов канонических ширин (проверяемо в файловой системе `staticDir` и в `sizes`-поле дока), а `alt` обязателен к заполнению — Media стал единственным владельцем канонических размеров/форматов (NFR-4).
- Given populated `Media`-док, when `MediaImage` его рендерит с `sizes`, then выходит `next/image` (не сырой `<img>`) с корректными `src`/`width`/`height`/`alt`, а `/_next/image` отдаёт webp — «вывод медиа через next/image» установлен как канонический путь для 7.3+.
- Given `next build` под `cacheComponents:true`, when собирается проект, then сборка успешна, `Media` зарегистрирована, миграция применена, `tsc` без ошибок, и НИ ОДНА существующая страница (`/`, `/about`, `/catalog`, `/shops`, `/brands`, `/contact`) не изменилась пиксельно (существующий `<img>`-конвент и hero background-image нетронуты).
- Given hero-мозаика Home, when проверяется после изменений, then `Hero.tsx`/`HeroMosaic.client.tsx` не тронуты, одна композиция на вьюпорт сохранена (AD-3), bloom-анимация работает как прежде.

## Spec Change Log

<!-- Append-only. Populated by step-04 during review loops. -->

## Review Triage Log

<!-- Append-only. Populated by step-04 on EVERY review pass. -->

### 2026-07-06 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 3: (high 0, medium 1, low 2)
- defer: 2
- reject: 11
- addressed_findings:
  - `[medium]` `[patch]` `mimeTypes:['image/*']` допускал `image/svg+xml` (сырой раздачей с публичного file-эндпоинта → stored-XSS при встроенном скрипте; плюс `next/image` отказывает SVG, поэтому он минует webp-пайплайн) и анимированный GIF (молча схлопывается в один кадр при webp-перекодировании). Сузил до растровых фото-форматов `['image/jpeg','image/png','image/webp','image/avif']`.
  - `[low]` `[patch]` `focalPoint:true` персистил focalX/focalY, но `MediaImage` их игнорировал — редактор задаёт фокус-точку без эффекта. Прокинул в `fill`-ветку `MediaImage` как `object-position: ${focalX}% ${focalY}%` (только когда фокус задан; в fixed-size ветке кропа нет — focal point неприменим).
  - `[low]` `[patch]` `public/media/.gitkeep` не был под git-контролем — негейт `!/public/media/.gitkeep` в `.gitignore` был no-op, на чистом клоне директория `staticDir` отсутствовала бы. Форс-добавлен (`git add -f`) при финализирующем коммите.

<!-- Отклонено (reject, кратко для аудита): (1) `read:()=>true` «раскрывает листинг Media-документов неаутентифицированным» — приемлемо: ВСЯ медиа = публичные картинки сайта (alt/filenames и так на публичных страницах); матрикс ролей admin/manager — явный Epic 8 TBD; (2) 5 sharp-вариантов «не используются MediaImage, дублируют ресайз next/image» — AC прямо требует «Media — единственный владелец канонических размеров» (imageSizes обязателен); варианты также питают admin-тумбы; (3) двойное webp-кодирование (80 затем next/image 75) — нет потребителя в 7.2; тюнинг качества — задача 7.3 при подаче реальных картинок; оба webp-стандартны; (4) `deviceSizes` потолок 2400 «режет 4K/retina» — осознанный performance-tradeoff (тяжёлые heavy heroes ≠ «лёгкие картинки»), spec-выровнен с Media-ширинами; (5) silent-null без dev-warn — намеренная graceful-деградация; (6) `alt ?? ''` «мёртвый код» — `alt` типизирован required-string, безвредная защита; (7) `filesize`-кап — НЕ добавлен намеренно: заблокировал бы легитимные тяжёлые hero-исходники (15–18 МБ, AD-3), аплоад auth-gated (доверенные); (8) `fill` требует positioned-обёртку — стандартный контракт next/image, задокументирован в компоненте (ответственность потребителя 7.3); (9) `media:number`→null — by-design, задокументировано («передавать populated-док»); (10) diff-vs-tree рассинхрон по guard width/height — ЛОЖНОЕ срабатывание: закоммиченный `MediaImage.tsx:52` уже содержит `if (typeof width!=='number'||typeof height!=='number') return null`; (11) физ. путь `/media/<name>` не в localPatterns — заметка для авторов 7.3, не дефект. -->


## Design Notes

- **Почему НЕ blanket-миграция на next/image (главный триаж-риск).** AC говорит «вывод через next/image везде», но весь проект (Epics 1-6, ~10 файлов) намеренно выбрал `<img>` с задокументированным AD-13-обоснованием. Разрешение противоречия: NFR-4 про next/image относится к МЕДИА-БЭКНУТЫМ картинкам (загруженным в CMS, авто-оптимизированным). Пока контент ссылается на `/public`-строки (Фаза 1), медиа-вывода нет нигде; ссылки на `Media` появляются в 7.3 (Page Globals). Тогда каждая поверхность естественно перетекает `/public`-строка → `Media`-ссылка → `MediaImage`(next/image), история за историей. `next/image` поверх `/public`-строки НЕ делает Media владельцем ассета и не приближает NFR-4 — только рвёт ~20 осознанных решений и рискует пиксель-перфектом #1 под unattended-прогоном. Поэтому 7.2 = ФУНДАМЕНТ (коллекция + примитив + конфиг), «везде» набирается прогрессивно с переездом контента.
- **AD-3 hero сохраняется.** `background-image`-дивы hero — намеренный носитель art-direction: скрытая композиция `display:none` не грузит свой тяжёлый набор (одна композиция на вьюпорт), плюс это подложка bloom-анимации Story 3.2 (JS правит `background-image` на `.mosaic-feature` и `filter` на `.mosaic-tile`). `next/image` не выражает art-direction нативно и мог бы регрессировать двойной загрузкой/анимацией — поэтому hero не трогаем. Переезд hero на Media (7.3+) обязан сохранить этот принцип (Media-оптимизированный webp можно подать в `background-image` по одному URL, оставаясь media-gated).
- **Единый источник ширин.** Канонические ширины живут в `Media.upload.imageSizes`; `next.config.imageSizes`/`deviceSizes` выравниваются под них, иначе появится второй владелец размеров (нарушение NFR-4). Пример-набор в задачах — стартовый; финальные ширины подобрать под реальные слоты (логотип/тумба 4:3/сторфронт/hero full-bleed).
- **sharp — обязателен в конфиге.** `sharp` установлен транзитивно, но Payload 3.x требует ЯВНОГО `buildConfig({ sharp })` для нарезки; иначе upload-оптимизация молча не работает. Отсюда прямая зависимость + проброс.
- **MediaImage без потребителя в 7.2 — намеренно.** Это фундамент-примитив; первый потребитель — Story 7.3 (эпик прямо помечает 7.2 фундаментом для 7.3). Держим как экспортируемый примитив, проверяем типами/сборкой; не dead-code, а контракт вывода.

## Verification

**Commands:**
- `docker compose up -d postgres` -- expected: postgres healthy (нужен для migrate/build).
- `npm run generate:types` -- expected: `src/payload-types.ts` содержит тип `Media`; git-diff показывает добавление коллекции.
- `npm run migrate:create media` && `npm run migrate` -- expected: таблица `media` создаётся и применяется без ошибок; файлы миграции закоммичены.
- `npx tsc --noEmit` -- expected: 0 ошибок (`MediaImage` типобезопасен против `Media`).
- `npm run lint` -- expected: без ошибок (ни один существующий `eslint-disable no-img-element` не удалён — конвент сохранён).
- `npm run build` -- expected: сборка успешна под `cacheComponents:true`; все существующие страницы (`/`,`/about`,`/catalog`,`/shops`,`/brands`,`/contact`) остаются статически пререндеренными и пиксельно неизменными.

**Manual checks:**
- В `/admin` загрузить тестовый JPG/PNG в `Media`: убедиться, что созданы webp-варианты канонических ширин (файлы в `staticDir`, поле `sizes` дока заполнено), `alt` требуется к вводу.
- Открыть тестовый media-URL через `/_next/image?url=...&w=...`: ответ — webp, корректная ширина.
- Grep-проверка: hero (`Hero.tsx`,`HeroMosaic.client.tsx`) и существующие `<img>`-поверхности не изменены (diff пуст вне новых файлов/конфига).

## Auto Run Result

Status: done

**Реализовано:** введена Payload upload-коллекция `Media` как ЕДИНСТВЕННЫЙ владелец канонических размеров/форматов (NFR-4) — sharp (проброшен в `buildConfig({ sharp })`) при загрузке нарезает 5 webp-вариантов фиксированных ширин (256/640/1024/1600/2400 @ q80) + перекодирует основной файл в webp; `alt` обязателен (a11y); `focalPoint` включён. Дан канонический примитив вывода `MediaImage` (обёртка `next/image`), которым Story 7.3+ рендерят медиа-бэкнутые картинки (populated-док → `next/image` с `src/width/height/alt/sizes`, `fill`-ветка учитывает фокус-точку; null-safe — не рендерит битый `<img>`). `next.config.images` настроен (webp, `deviceSizes`/`imageSizes` выровнены с каноническими ширинами Media — один источник правды, `localPatterns` для `/api/media/**`). Пайплайн проверен реальной загрузкой: файл отдаётся `200 image/webp`, `/_next/image` отдаёт webp на всех канонических ширинах. Существующая вёрстка Фазы 1 НЕ тронута: намеренный `<img>`-конвент (12 задокументированных `eslint-disable`, ~10 файлов) и AD-3 hero (background-image, одна композиция на вьюпорт + bloom-анимация Story 3.2) сохранены дословно.

**Изменённые/новые файлы:**
- `src/collections/Media.ts` (новый) — upload-`CollectionConfig`, канонические webp-`imageSizes`, публичный read, растровые `mimeTypes`.
- `src/components/media/MediaImage.tsx` (новый) — серверный примитив вывода медиа через `next/image` (потребитель — 7.3).
- `payload.config.ts` — `import sharp`, `sharp` в `buildConfig`, `Media` в `collections`.
- `next.config.ts` — блок `images` (webp, выровненные размеры, `localPatterns`).
- `package.json` — `sharp` 0.34.5 прямой зависимостью.
- `.gitignore` — игнор `public/media/*`, кроме `.gitkeep`.
- `src/payload-types.ts` — регенерирован (тип `Media`).
- `src/migrations/20260706_072820_media.ts|.json` + `index.ts` (новые) — таблица `media`, применена.
- `public/media/.gitkeep` (новый, форс-добавлен) — сохраняет `staticDir` на чистом клоне.

**Ревью:** 2 параллельных ревьюера (Blind Hunter + Edge Case Hunter). Патчей 3 (1 medium: сужение `mimeTypes` от SVG-XSS/анимированного GIF к растру; 2 low: проброс focal point в `MediaImage`, форс-добавление `.gitkeep`). Дефер 2 (персистентность медиа под standalone-Docker без volume/storage-адаптера; хрупкость `localPatterns` при заданном `serverURL` → нужен `remotePatterns`) — оба записаны в `deferred-work.md`. Reject 11 (см. Review Triage Log; в т.ч. ложное срабатывание обоих ревьюеров про null width/height — на диске guard уже есть). Intent_gap/bad_spec — 0, лупбэков не потребовалось.

**Верификация:** `docker compose up -d postgres` (healthy); `generate:types` (тип `Media`); `migrate:create media` + `migrate` (чисто); `tsc --noEmit` (0 ошибок, включая патчи); `lint` (чисто, ни один `eslint-disable no-img-element` не удалён); `build` (успешно под `cacheComponents`, все 6 страниц `/ /about /catalog /shops /brands /contact` остаются `○ Static`); реальная загрузка → webp-варианты + `/_next/image` webp.

**Остаточные риски:** (1) в проде под standalone-Docker без персистентного volume/cloud-storage аплоады не переживут редеплой (дефер); (2) при будущей установке `serverURL` `Media.url` станет абсолютным — понадобится `remotePatterns` (дефер); (3) `read:()=>true` открывает публичный листинг Media-документов — приемлемо (вся медиа = публичные картинки), матрикс ролей = Epic 8; (4) двойное webp-кодирование (Media q80 → next/image q75) — мягкий tradeoff качества/CPU, тюнинг при появлении потребителя в 7.3; (5) `deviceSizes` потолок 2400 ограничивает 4K/retina — осознанный performance-выбор. `MediaImage` без потребителя в 7.2 — намеренно (фундамент для 7.3).
