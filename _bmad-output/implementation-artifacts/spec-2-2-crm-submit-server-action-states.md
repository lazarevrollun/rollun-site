---
title: 'Story 2.2 — Отправка заявки в CRM через Server Action + состояния submit'
type: 'feature'
created: '2026-07-05'
status: 'done'
baseline_revision: '5d77a6eaabd5737d897f1cac29390457d842d814'
final_revision: 'f52aa73f76012264bdf1e7b1cf0b9c7516029600'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** `ContactForm` (Story 2.1) валидирует данные, но не отправляет их: seam `onValidSubmit` пуст, реального пути «форма → CRM» нет. Epic 2 требует, чтобы валидная заявка server-side уходила в CRM (URL/секрет скрыты от браузера), успех подтверждался, а сбой не терял введённое.

**Approach:** Добавить **одну** Server Action `submitContactForm` (фиксированный контракт результата `ContactFormResult`, AD-8), которая server-side POST-ит values на `CRM_API_URL` (env), дублирует серверную валидацию и логирует сбой. Заменить seam `onValidSubmit` на проп `action` (дефолт — реальная Server Action) и завести в островке машину состояний submit `idle → submitting → success | error`: успех воспроизводит поведение прототипа (кнопка `THANK YOU ✓`, через 1600мс reset), ошибка показывает сообщение и сохраняет все введённые данные (тему в том числе) для повтора. Никакого хранения лида на сайте.

## Boundaries & Constraints

**Always:**
- POST выполняется ТОЛЬКО server-side из Server Action; `CRM_API_URL` читается из `process.env` server-side и НИКОГДА не попадает в клиентский бандл (без `NEXT_PUBLIC_`).
- Единый фиксированный контракт результата `ContactFormResult` (`{ ok: true } | { ok: false; message }`) — его потребляют все три режима 2.4; режимы отличаются только презентацией.
- Server Action дублирует клиентскую валидацию тем же чистым `validateContactForm` перед POST (клиентская подсказка дублируется серверной, Epic constraint).
- Успех (2xx): кнопка → `content.successLabel` (`THANK YOU ✓`), затем через **1600мс** (значение прототипа `Contact.html:621`) форма сбрасывается к пустым values и кнопка возвращается к `ASK A QUESTION`. Дизайн — источник истины (AD-13).
- Ошибка доставки (не-2xx / сетевой сбой / отсутствует `CRM_API_URL`): понятное сообщение (`content.errorMessages.submit`) во form-level `role="alert"`, ВСЕ введённые values сохранены (включая `topic`), повтор возможен; сбой логируется server-side (`console.error`).
- Пока идёт submit — кнопка `disabled` (защита от двойной отправки).
- Все новые строки живут ТОЛЬКО в `contactFormContent` (AD-14).

**Block If:**
- Появилось требование хранить/пересылать лид на сайте (коллекция `Submissions`, mailer, лог тела заявки в БД) — HALT, это нарушает «не хранить лид».
- Потребовалось раскрыть CRM URL/секрет клиенту для отправки — HALT.

**Never:**
- НЕ создавать Payload-коллекцию `Submissions`, mailer или любое хранилище тела заявки — лид только транзитом.
- НЕ реализовывать honeypot/анти-спам (Story 2.3), инфо-панель, модалку, deep-link `?topic=`, авто-закрытие модалки ~1.4с (Story 2.4). Оставить структуру action так, чтобы 2.3 вставил honeypot-проверку в этот же путь.
- НЕ менять пиксельную вёрстку `.cf-*`, поля, порядок, список тем, микрокопи существующих строк.
- НЕ хардкодить адрес CRM — только через `CRM_API_URL`.
- НЕ добавлять тест-раннер (в проекте его нет; верификация build/lint/manual — как в 2.1).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | Валидные values, CRM отвечает 2xx | `submitContactForm` POST-ит JSON тело на `CRM_API_URL`, возвращает `{ ok: true }`; островок: `success` → кнопка `THANK YOU ✓`, через 1600мс reset values + `idle` | нет ошибки |
| CRM не-2xx | Валидные values, CRM отвечает 4xx/5xx | `{ ok: false, message }`; островок: `error`, сообщение в `role="alert"`, values сохранены | `console.error` со статусом; тело заявки не логируется целиком |
| Сетевой сбой | `fetch` бросает (timeout/DNS) | `{ ok: false, message }`; островок: `error`, values сохранены | `console.error(err)`; повтор доступен |
| Нет env | `CRM_API_URL` не задан | `{ ok: false, message }` без POST | `console.error` о missing env; путь безопасно деградирует |
| Обход клиента | В action пришли невалидные values | серверная валидация → `{ ok: false, message }`, POST не выполняется | без throw |
| Двойной клик | Клик во время `submitting` | Повторная отправка не стартует (кнопка `disabled`) | нет |

</intent-contract>

## Code Map

- `src/content/contact-form.ts` -- ИЗМЕНИТЬ. Добавить микрокопи `successLabel: 'THANK YOU ✓'`, `errorMessages.submit` (текст сбоя доставки) и экспорт типа `ContactFormResult` (общий контракт результата). Единственный дом строк (AD-14).
- `src/components/contact-form/submit.ts` -- НОВЫЙ. `'use server'` модуль: `submitContactForm(values): Promise<ContactFormResult>` — серверная валидация, чтение `CRM_API_URL`, POST JSON, логирование сбоя, фиксированный результат. Шов для honeypot 2.3.
- `src/components/contact-form/ContactForm.client.tsx` -- ИЗМЕНИТЬ. Заменить seam `onValidSubmit` на проп `action` (дефолт — `submitContactForm`) + опциональный `onSuccess?` (шов для авто-закрытия модалки 2.4). Машина состояний `idle|submitting|success|error`, кнопка `disabled`/`THANK YOU ✓`, form-level `role="alert"`, reset через 1600мс.
- `src/components/contact-form/validate.ts` -- ТОЛЬКО ЧТЕНИЕ. Переиспользуется серверной валидацией — не менять.
- `src/app/(site)/contact/page.tsx` -- ТОЛЬКО ЧТЕНИЕ (проверить). Монтирует `<ContactForm />` без пропсов; дефолтный `action` включает реальную отправку без изменений файла.
- `.env.example` / `.env` -- ТОЛЬКО ЧТЕНИЕ. `CRM_API_URL` уже присутствует.
- `rollun_handoff/rollun-web-site/project/Contact.html` -- ТОЛЬКО ЧТЕНИЕ. Эталон поведения submit (строки 617-621: `THANK YOU ✓`, reset через 1600мс).

## Tasks & Acceptance

**Execution:**
- [x] `src/content/contact-form.ts` -- Добавить `successLabel: 'THANK YOU ✓'` рядом с `submitLabel`, `errorMessages.submit` (напр. `Something went wrong. Please try again.`) и `export type ContactFormResult = { ok: true } | { ok: false; message: string }` -- новые строки/контракт в единственном доме (AD-14).
- [x] `src/components/contact-form/submit.ts` -- НОВЫЙ `'use server'`: `submitContactForm(values: ContactFormValues): Promise<ContactFormResult>` — (1) `validateContactForm(values)`; если ошибки → `{ ok: false, message: submit }` без POST; (2) `const url = process.env.CRM_API_URL`; если пусто → `console.error` + `{ ok:false }`; (3) `try` POST `fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(values) })`; `res.ok` → `{ ok:true }`; иначе `console.error` статус + `{ ok:false, message }`; `catch` → `console.error(err)` + `{ ok:false, message }` -- единый серверный обработчик, лид не хранится.
- [x] `src/components/contact-form/ContactForm.client.tsx` -- Проп `action?: (values) => Promise<ContactFormResult>` (дефолт `submitContactForm`), опциональный `onSuccess?: () => void`; `useState` статуса `idle|submitting|success|error` + `submitError`; в `handleSubmit` после успешной клиентской валидации: `submitting` → `await action(values)`; `ok` → `success`, кнопка `successLabel`, `setTimeout(1600)` → reset values к пустым + `idle` + `onSuccess?.()`; иначе `error` + `submitError`, values сохранены; кнопка `disabled` при `submitting|success`; form-level `<p className="cf-error" role="alert">` при `error`; очистить таймер в `useEffect` cleanup -- машина состояний submit.
- [x] `src/app/(site)/contact/page.tsx` -- Проверить, что инлайн-монтаж работает с дефолтным `action` без изменений; править ТОЛЬКО если сломается компиляция.

**Acceptance Criteria:**
- Given валидно заполненная форма и CRM, отвечающая 2xx, when жму `ASK A QUESTION`, then Server Action делает server-side POST на `CRM_API_URL`, кнопка показывает `THANK YOU ✓`, через ~1.6с форма очищается и кнопка возвращается к `ASK A QUESTION`; в клиентском бандле нет ни URL, ни секрета CRM.
- Given CRM возвращает ошибку (не-2xx) или недоступна, when сабмичу, then показывается понятное сообщение об ошибке (`role="alert"`), все введённые значения сохранены (тема не сброшена), повторная отправка возможна, а сбой залогирован server-side.
- Given идёт отправка, when повторно кликаю кнопку, then вторая отправка не стартует (кнопка `disabled`).
- Given лид отправлен, when проверяю проект, then нет коллекции `Submissions`, mailer и хранения тела заявки — только транзит через action.
- Given `npm run build` и `npm run lint`, when выполнены, then проходят без ошибок и типовых нарушений.

## Spec Change Log

<!-- Append-only. Populated by step-04 during review loops. Empty until the first bad_spec loopback. -->

## Review Triage Log

### 2026-07-05 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 4: (high 2, medium 1, low 1)
- defer: 1
- reject: 12
- addressed_findings:
  - `[high]` `[patch]` Клиентский `await action(values)` не был обёрнут в try/catch — reject Server Action (RSC-транспорт/500) оставлял `status='submitting'` навсегда, кнопка disabled без ошибки. Добавлен try/catch/finally → деградация в `error` (сообщение `errorMessages.submit`), значения сохранены.
  - `[high]` `[patch]` В `submit.ts` не было таймаута fetch — зависший CRM не завершал submit (комментарий ложно обещал catch «timeout»). Добавлен `AbortSignal.timeout(10s)`; комментарий исправлен.
  - `[medium]` `[patch]` Гонка двойного сабмита: guard читал устаревший `status` из замыкания, `disabled` отставал на рендер. Добавлен синхронный `useRef` re-entrancy-lock.
  - `[low]` `[patch]` Разделяемый мутабельный модульный объект `failure` возвращался по ссылке — заменён на фабрику `failure()` (свежий объект на каждый вызов).

### 2026-07-05 — Follow-up review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 1, low 1)
- defer: 0
- reject: 15
- addressed_findings:
  - `[medium]` `[patch]` Повтор сабмита после ошибки доставки с невалидным полем: ветка client-валидации делала `return`, НЕ сбрасывая `status='error'` — устаревший form-level баннер `role="alert"` («Something went wrong») висел поверх свежих field-ошибок (два конфликтующих контекста ошибки). Добавлен сброс `status='idle'` + `setSubmitError('')` в невалидной ветке, когда был `error`.
  - `[low]` `[patch]` JSDoc в `ContactForm.client.tsx` цитировал `Contact.html:620` для reset через 1600мс; по факту 620 — присвоение метки `THANK YOU ✓`, а `setTimeout(…,1600)`/reset — строка 621 (сверено с прототипом; `content.ts` цитирует 620 для метки корректно). Исправлено на 621.
- rejected_summary: 15 отклонено. Явный scope Story 2.3 (open-relay без auth/rate-limit/CAPTCHA, size-cap тела, серверный enum `topic`) — путь action оставлен швом для 2.3, уже в «Остаточных рисках». Открытое допущение CRM-контракта владельца (успех=`res.ok`/2xx без чтения тела ответа) — зафиксировано как residual risk #1, блокирует прод-включение, не разработку. Spec-предписанное by-design: `disabled`-кнопка без «Sending…» (прототип фидбека не даёт), `.cf-error` на form-level `<p>` (spec прямо предписал разметку; у прототипа нет error-состояния — нет пиксельного эталона), uniform-сообщение при missing env (server-логи уже различают: «not configured» vs «request failed»/статус), `onSuccess` на 1600мс (тайминг авто-закрытия модалки ~1.4с — забота 2.4). Теоретический custom-`content` путь (server валидирует синглтон; единственный монтаж — `<ContactForm />` без пропсов; `action`-проп — существующий escape-hatch для кастомной обвязки). Benign React-19 no-op (setState/`onSuccess` после unmount — навигация во время <10с сабмита; `{ok:false}` с пустым `message` — тип требует `message: string`, дефолтный action всегда даёт непустую строку). Отсутствие client-side таймаута на `await action` — server-fetch ограничен `AbortSignal.timeout(10с)`, поэтому action возвращается ≤~10с; истинный transport-hang в итоге реджектится сетевым слоем браузера → уже пойман `catch`; наивный client-таймаут внёс бы риск false-negative дублей. Success не анонсируется AT — уже в `deferred-work.md` (не дублирую).


**Server Action, не route handler.** Next 16 / React 19: `'use server'` функция вызывается из client-островка как обычная async-функция (`await action(values)`), values/результат сериализуемы через RSC-границу. Это скрывает `CRM_API_URL` в серверном бандле без отдельного API-route и без `NEXT_PUBLIC_`.

**Почему не `useActionState`/`<form action>`.** Островок уже валидирует client-side ПЕРЕД отправкой (фокус первого невалидного поля, блок) и должен программно управлять пост-успешным таймером reset. Ручной `useState`+`await action()` сохраняет существующий порядок «валидация → отправка» и focus-поведение 2.1; нативный `<form action>` его бы обошёл.

**Контракт результата (AD-8).** `ContactFormResult` — единственный тип ответа success/error; 2.4 навесит на `success` авто-закрытие модалки (`onSuccess` seam), на `error` — тот же inline-показ. Режимы различаются только презентацией.

**Тайминги — из прототипа (AD-13).** `Contact.html:621` сбрасывает кнопку/форму через `1600`мс. Берём это значение (не ~1.4с из UX-DR20 — та про авто-закрытие модалки, забота 2.4).

**CRM-контракт — допущение (не блокер).** Поля тела/формат/авторизация — от владельца. До этого POST-им JSON всех values на env-endpoint без auth-заголовка; если позже потребуется секрет — добавится отдельный `CRM_API_*` env. Зафиксировано как открытое допущение Epic 2 (блокирует прод-включение, не разработку).

**Верификация без тест-раннера.** В проекте нет vitest/jest (Story 2.1 так же). Логику action держим чистой и проверяем build/lint + ручными сценариями матрицы; отдельный тест-раннер не вводим (scope creep).

## Verification

**Commands:**
- `npm run build` -- expected: успешная сборка, typecheck без ошибок; `/contact` пререндерится.
- `npm run lint` -- expected: без ошибок ESLint.

**Manual checks:**
- Grep бандла/исходников: `CRM_API_URL` встречается только в `submit.ts` (server) и `.env*`, не в client-компонентах.
- Временно указать `CRM_API_URL` на mock, возвращающий 200 → сабмит валидной формы: кнопка `THANK YOU ✓`, через ~1.6с форма пуста, кнопка `ASK A QUESTION`.
- Указать `CRM_API_URL` на endpoint, возвращающий 500 (или невалидный хост) → сабмит: появляется сообщение об ошибке, поля и выбранная тема сохранены, в серверных логах — `console.error`.
- Двойной быстрый клик по кнопке во время отправки → уходит один POST.
- Проверить отсутствие `Submissions`-коллекции и mailer в `src/collections` / `payload.config`.

## Auto Run Result

Status: done

**Реализованное изменение:** Story 2.2 (Epic 2) — валидная заявка `ContactForm` теперь server-side уходит в CRM через единственную Server Action `submitContactForm` (фиксированный контракт `ContactFormResult`, AD-8). Островок получил машину состояний submit `idle → submitting → success | error`: успех воспроизводит прототип (кнопка `THANK YOU ✓`, через 1600мс reset формы), ошибка показывает form-level `role="alert"`-сообщение и сохраняет все введённые данные (включая тему) для повтора. `CRM_API_URL` читается только server-side и не попадает в клиентский бандл; лид не хранится на сайте (нет `Submissions`/mailer) — только транзит. Seam `onValidSubmit` заменён на проп `action` (дефолт — реальная Server Action) + `onSuccess` для авто-закрытия модалки 2.4.

**Файлы:**
- `src/content/contact-form.ts` — ИЗМЕНЁН. Добавлены микрокопи `successLabel: 'THANK YOU ✓'`, `errorMessages.submit` и общий контракт `export type ContactFormResult` (единственный дом строк/типа, AD-14).
- `src/components/contact-form/submit.ts` — НОВЫЙ. `'use server'` `submitContactForm`: серверная валидация тем же `validateContactForm`, чтение `CRM_API_URL`, POST JSON под таймаутом 10с, `console.error` без дампа тела, фиксированный результат. Шов для honeypot 2.3.
- `src/components/contact-form/ContactForm.client.tsx` — ИЗМЕНЁН. Машина состояний submit, кнопка `disabled`/`THANK YOU ✓`, form-level `role="alert"`, reset через 1600мс с очисткой таймера, try/catch на reject action, синхронный re-entrancy-lock.
- `src/app/(site)/contact/page.tsx` — без изменений (инлайн-монтаж работает с дефолтным `action`).

**Разбор ревью (Blind Hunter + Edge Case Hunter):** 4 патча применены (2 high: reject action → стрелок стрелок «stuck submitting», нет try/catch — исправлено try/catch/finally; нет таймаута fetch — добавлен `AbortSignal.timeout(10с)`; 1 medium: гонка двойного сабмита — `useRef`-lock; 1 low: разделяемый `failure` → фабрика). 1 отложено в `deferred-work.md` (a11y: успех не анонсируется AT — согласуется с отложенным a11y-пассом 2.1). 12 отклонено: анти-спам/rate-limit/size-cap и серверный enum `topic` — область Story 2.3; отсутствие auth-заголовка / success-по-`res.ok` / семантика тела ответа — открытое допущение контракта CRM (от владельца); транзит-only с `console.error` — by-design по epic; слабый email-regex — из общего валидатора 2.1; magic-number 1600, недочитанное тело undici на масштабе контакт-формы, nullish-гварды при наличии дефолтов — шум.

**Верификация:** `npm run lint` — чисто; `npm run build` — `Compiled successfully`, typecheck без ошибок, `/contact` пререндерится как static. Grep: `CRM_API_URL` отсутствует в `.next/static` (клиентский бандл), в исходниках — только `submit.ts` (server). Прогонялось дважды: после имплементации и после патчей ревью.

**Остаточные риски:** (1) Контракт CRM (поля/формат/авторизация тела, семантика success-ответа) — внешнее допущение владельца; до него POST-им JSON всех values на env-endpoint без auth, успех = 2xx. Блокирует прод-включение, не разработку. (2) Хардненинг публично вызываемой Server Action (rate-limit, size-cap, серверный enum `topic`, honeypot) — Story 2.3. (3) Провал доставки логируется, но без алертинга/ретрая (by-design «не хранить лид»); наблюдаемость — инфра-задача. (4) Успех submit не анонсируется screen-reader'ам — отложенный a11y-пасс.

---

### Follow-up review pass (2026-07-05)

Повторный независимый review-проход по завершённой спеке (входной `status: done`, `followup_review_recommended: true`). Blind Hunter + Edge Case Hunter отработали по диффу от baseline `5d77a6e`; 17 уникальных находок после дедупликации.

**Применено 2 патча** (оба в `src/components/contact-form/ContactForm.client.tsx`):
- `[medium]` Устаревший form-level баннер ошибки доставки: при повторном сабмите после сбоя CRM с невалидным полем ветка client-валидации делала `return`, НЕ сбрасывая `status='error'` — баннер `role="alert"` («Something went wrong») оставался поверх свежих field-ошибок (два конфликтующих контекста ошибки). Теперь при входе в невалидную ветку из состояния `error` сбрасываем `status='idle'` + `submitError=''`.
- `[low]` JSDoc цитировал `Contact.html:620` для reset через 1600мс; по прототипу 620 — присвоение метки `THANK YOU ✓`, а reset (`setTimeout(…,1600)`) — строка 621 (`content.ts` цитирует 620 для метки корректно). Исправлено на 621.

**15 отклонено** (детали в Review Triage Log): scope Story 2.3 (open-relay без auth/rate-limit/CAPTCHA, size-cap тела, серверный enum `topic`), открытое допущение CRM-контракта владельца (успех=`res.ok`/2xx без чтения тела ответа), spec-предписанное by-design (disabled-кнопка без «Sending…», `.cf-error` на form-level `<p>`, uniform-сообщение при missing env, `onSuccess` на 1600мс), теоретический custom-`content` путь (server валидирует синглтон; escape-hatch — override `action`-пропа), benign React-19 no-op (setState после unmount; `{ok:false}` с пустым `message` при инъекции action), отсутствие client-side таймаута (server-fetch уже под `AbortSignal.timeout(10с)`; наивный client-таймаут внёс бы false-negative дубли), a11y success — уже в `deferred-work.md`. **0 отложено** (новых записей в ledger нет).

**Верификация (повторно):** `npm run lint` — чисто; `npm run build` — `Compiled successfully`, TypeScript без ошибок, `/contact` пререндерится как static; `CRM_API_URL` отсутствует в `.next/static` (клиентский бандл), в исходниках — только `submit.ts` (server); нет коллекции `Submissions`/mailer (`src/collections` = только `Users.ts`).

**Итог:** машина состояний submit сошлась — применён один локальный medium-фикс UX ошибки повтора + один тривиальный doc-фикс. `followup_review_recommended: false`: дальнейший независимый review не оправдан (несколько локальных низко-последственных изменений).
