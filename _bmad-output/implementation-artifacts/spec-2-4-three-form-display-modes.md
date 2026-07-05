---
title: 'Story 2.4 — Три режима показа ContactForm (desktop-модалка / инлайн + deep-link / mobile-навигация)'
type: 'feature'
created: '2026-07-05'
status: 'done'
baseline_revision: '762a26567c2117ae4e7e2ada2e5537018d958bcf'
final_revision: '58aa4f5f2311eb684530d0398d82944cff89a75c'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** `ContactForm` (Story 2.1–2.3) сейчас рендерится ТОЛЬКО инлайн-заглушкой на `/contact` (одна колонка, без инфо-панели, без deep-link). Epic FR-11 требует ОДИН компонент в ТРЁХ режимах показа поверх ОДНОГО Server Action (AD-8): desktop-модалка на Home/About по триггеру `GET IN TOUCH`, инлайн на `/contact` с deep-link `?topic=`, и mobile — триггер не открывает модалку, а ведёт навигацией на `/contact`. Режимы различаются ТОЛЬКО презентацией — путь отправки, поля и контракт результата общие.

**Approach:** Обернуть неизменный `ContactForm` тремя тонкими презентационными слоями в `components/contact-form/`: (1) `ContactInfo` — тёмная инфо-панель `.cf-info` (адреса/телефоны/email/соц), общая для модалки и инлайна, чистый RSC, контент пропсом; (2) `ContactModal` + `GetInTouch` — desktop-диалог с scroll-lock/Esc/backdrop/× и авто-закрытием на успех (через существующий `onSuccess`-шов формы), где триггер по паттерну header'а (AD-3) рендерит desktop-`<button>` (открывает модалку) и mobile-`<a href="/contact">` (навигация) одновременно, видимость выбирает CSS-медиа 768px; (3) `ContactInline` — `.contact-card` двухколонка на `/contact`, читает `?topic=` после монтирования и прокидывает `deepLink` в форму (предвыбор темы, пульс `.cf-prefilled`, smooth-scroll, автофокус `Your Name`). В `ContactForm` добавляется опциональный `deepLink`-проп; поведение без него идентично 2.3.

## Boundaries & Constraints

**Always:**
- Все три режима потребляют ОДИН `ContactForm` и ОДИН `submitContactForm` (AD-8) — endpoint один, контракт `ContactFormResult` неизменен, поля/порядок/микрокопи/honeypot не трогаются.
- Инфо-панель, модалка, deep-link — чистая презентация: не меняют путь submit, набор полей, валидацию, honeypot (Story 2.1–2.3).
- Все НОВЫЕ строки инфо-панели (heading, адреса с их лейблами, телефоны, email, blurb, соц-URL) живут в ЕДИНОМ доме контента (AD-14) — новый `src/content/contact-info.ts`, не инлайнятся в JSX.
- Пиксель-фиделити к прототипу (AD-13): `.cf-*`/`.contact-*` CSS портируется дословно из Handoff (`Home.html` модалка+панель, `Contact.html` инлайн+пульс).
- Desktop/mobile-развилка триггера — по CSS-медиа 768px при ОБОИХ композициях в DOM (паттерн `Header.client.tsx`, AD-3): без width-based JS-гейтинга/UA-сниффинга (иначе hydration mismatch).
- Модалка: `role="dialog"` + `aria-modal`, scroll-lock `body.overflow:hidden` пока открыта (идиома `Header.client.tsx`), закрытие ×/backdrop/Esc, авто-закрытие на успех через `onSuccess` формы; cleanup снимает scroll-lock на close/unmount; при переходе через 768px вниз модалка закрывается (AD-3 шов).
- Инфо-панель email — `llc@rollun.com` (значение модального прототипа), НЕ футерный `info@rollun.com`: панель пиксель-верна СВОЕМУ прототипу (прецедент AD-14 `COMPANY_BLURB` vs `COMPANY_INTRO`).
- `deepLink` применяется ОДИН раз (ref-гвард) после монтирования (не в initial state) — select пуст на сервере и в первом клиентском рендере (нет hydration mismatch), тема ставится эффектом; нормализация текста темы как в прототипе (снять `&`/en/em-dash, схлопнуть пробелы, trim, lowercase), несовпадение — тихо игнор.
- `/contact` остаётся статически пререндеримым: deep-link читает `window.location.search` в mount-эффекте (не `useSearchParams`, который потребовал бы Suspense/динамики).

**Block If:**
- Появилось требование реального контента соц-сетей/адресов/email СВЕРХ значений прототипа (напр. другой GitHub/LinkedIn/почта) — источник истины дизайн (AD-13); иные значения это решение владельца, HALT.
- Потребовалось смонтировать модалку/триггер на реальные Home/About СЕЙЧАС — эти страницы это Epic 3/4 (downstream), тут они заглушки; не фабриковать страницы, HALT.

**Never:**
- НЕ менять `submit.ts`/`validate.ts`, honeypot, набор/порядок/микрокопи 6 полей, контракт `ContactFormResult`.
- НЕ вводить второй endpoint/путь отправки для модалки или инлайна.
- НЕ добавлять реальную CAPTCHA / rate-limit (открытое допущение владельца, Story 2.3 границы).
- НЕ монтировать `GetInTouch`/модалку на страницы-заглушки Home/About (Epic 3/4 их построят и смонтируют триггер — cross-story dependency).
- НЕ вводить тест-раннер (в проекте его нет; верификация build/lint/manual как в 2.1–2.3).
- НЕ ломать существующий инлайн-рендер `/contact` без deep-link (дефолтное поведение формы неизменно).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Desktop, клик `GET IN TOUCH` | ≥768px | `.contact-overlay.open`, `body.overflow:hidden`, форма+`.cf-info` двухколонкой, focus в диалоге | n/a |
| Закрытие модалки | ×/backdrop/Esc | `open` снят, scroll-lock снят, значения формы сохранены | n/a |
| Успех в модалке | валидный submit | форма → `THANK YOU ✓`, reset ~1600ms, затем `onSuccess` → модалка закрывается | как в 2.2 |
| Mobile, клик триггера | <768px | навигация `<a>` на `/contact` (с `?topic=` если задан) — модалка НЕ открывается | n/a |
| `/contact?topic=Partnership` | инлайн-загрузка | тема `Partnership` предвыбрана, пульс `.cf-prefilled` (~2.4s), smooth-scroll к форме, автофокус `Your Name` (~700ms) | несовпадение темы → игнор, форма как обычно |
| `/contact` без `?topic=` | инлайн-загрузка | форма+`.cf-info` двухколонкой, без пульса/скролла/автофокуса — поведение как раньше | n/a |
| Ресайз через 768px при открытой модалке | вниз <768px | модалка закрывается, scroll-lock снят (нет недостижимого lock) | n/a |

</intent-contract>

## Code Map

- `src/content/contact-info.ts` -- СОЗДАТЬ. Единый дом (AD-14) строк инфо-панели: `heading` (`Contact Information`), адреса с лейблами (`Registered office` / `Shop & return center`), телефоны с их скобочными лейблами, `email: llc@rollun.com`, `blurb` (`Send us an email and we'll get in touch shortly.`), соц-ссылки GitHub `https://github.com/rollun-lc` + LinkedIn `https://www.linkedin.com/company/rollun-lc/`. Значения дословно из `Home.html:1233-1276`.
- `src/components/contact-form/ContactInfo.tsx` -- СОЗДАТЬ. Чистый RSC: рендер `.cf-info` (heading, `.cf-item` адрес/телефон/email со встроенными SVG-иконками, `<hr>`, `.blurb`, `.cf-info-social`). Контент пропсом (дефолт `contactInfoContent`). Не фетчит. Разметка портирована из `Home.html:1233-1276`.
- `src/components/contact-form/ContactModal.client.tsx` -- СОЗДАТЬ. Презентационный диалог: пропсы `open`, `onClose`, `content?`, `deepLinkTopic?`. Рендер `.contact-overlay`(`role="dialog"` `aria-modal`) → `.contact-modal`(грид) с `ContactForm` (`onSuccess={onClose}`) слева и `ContactInfo` справа, `.contact-close` ×. Эффекты (по `open`): scroll-lock (`body.overflow:hidden` + cleanup, идиома `Header.client.tsx:94-102`), Esc→`onClose`, media `(min-width:768px)` false→`onClose` (AD-3 шов). Backdrop-клик (`e.target===overlay`)→`onClose`. Портирует JS `Home.html:1457-1476`.
- `src/components/contact-form/GetInTouch.client.tsx` -- СОЗДАТЬ. Точка монтирования для Epic 3/4. Владеет `open`-состоянием. Рендерит desktop-`<button class="btn btn-or">` (open) и mobile-`<a>`(`next/link`) на `/contact`(+`?topic=` если проп `topic`) ОДНОВРЕМЕННО (видимость по CSS-медиа) + `<ContactModal>`. Пропсы: `label?`='GET IN TOUCH', `topic?`, `className?`.
- `src/components/contact-form/ContactInline.client.tsx` -- СОЗДАТЬ. Композиция `/contact`: `.contact-card` двухколонка (`ContactForm` + `ContactInfo`). На mount читает `window.location.search` → если `?topic=` есть, прокидывает `deepLink={{ topic }}` в `ContactForm`. Держит `/contact` статичным (не `useSearchParams`).
- `src/components/contact-form/ContactForm.client.tsx` -- ИЗМЕНИТЬ. Добавить опц. проп `deepLink?: { topic?: string }`. `useEffect` (ref-гвард «применить один раз»): нормализовать+сопоставить `deepLink.topic` с `content.topics` → `setValues` темы, добавить пульс-класс select'у (`.cf-prefilled`, снять ~2.4s), smooth-scroll формы в вид (offset ~110px), автофокус `name` (~700ms). Без `deepLink` — поведение 2.3 неизменно. Портирует `Contact.html:625-644`.
- `src/app/(site)/contact/page.tsx` -- ИЗМЕНИТЬ. RSC заменяет прямой `<ContactForm/>` на `<ContactInline/>`.
- `src/styles/components.css` -- ИЗМЕНИТЬ. Добавить в блок `.cf-*`: `.contact-card` (инлайн двухколонка), `.contact-overlay`/`.contact-modal`/`.contact-close`, `.cf-form` padding, `.cf-info` + потомки (`.cf-item`/`.info-lines`/`.info-twocol`/`.lbl`/`.muted`/`.shop-addr`/`.blurb`/`hr`/`.cf-info-social`), `.cf-field select.cf-prefilled` + `@keyframes cf-pulse`, свёртка в одну колонку <768px. Порт из `Home.html:627-763` + `Contact.html:209-217`.
- `src/content/contact-form.ts` -- ТОЛЬКО ЧТЕНИЕ. Контракт формы/тем — источник для нормализации deep-link. Не менять.
- `src/components/contact-form/submit.ts`, `validate.ts` -- ТОЛЬКО ЧТЕНИЕ. Путь submit неизменен (AD-8).

## Tasks & Acceptance

**Execution:**
- [x] `src/content/contact-info.ts` -- Создать типизированный `contactInfoContent` (heading, `addresses[]` с `label`+`lines[]`, `phones[]` с `number`+`label`, `email`, `blurb`, `social[]` с `platform`/`href`/`label`) со значениями дословно из `Home.html:1233-1276` (email `llc@rollun.com`) -- единый дом строк панели (AD-14), пиксель-верно СВОЕМУ прототипу (AD-13).
- [x] `src/components/contact-form/ContactInfo.tsx` -- Чистый RSC-рендер `.cf-info` из `contactInfoContent` (адрес/телефон/email `.cf-item` со встроенными SVG, `<hr>`, `.blurb`, соц-иконки со встроенными SVG, `target="_blank" rel="noopener"`), контент пропсом -- общая панель модалки+инлайна, не фетчит (AD-1/AD-4).
- [x] `src/components/contact-form/ContactModal.client.tsx` -- Диалог `open`/`onClose`: `.contact-overlay`(`role=dialog` `aria-modal="true"` `aria-label`) → `.contact-modal` с `ContactForm onSuccess={onClose}` + `ContactInfo` + `.contact-close`; эффекты scroll-lock/Esc/media-close по `open` (идиома Header 94-112), backdrop-клик по `e.target===overlay` -- desktop-модалка (режим 1), авто-закрытие на успех через существующий `onSuccess`-шов.
- [x] `src/components/contact-form/GetInTouch.client.tsx` -- Владеет `open`; рендерит desktop-`<button class="btn btn-or">`(open) + mobile-`<Link href="/contact"(+?topic)">` (обе в DOM, видимость CSS-медиа) + `<ContactModal open onClose>`; пропсы `label?`/`topic?`/`className?` -- триггер режимов 1+3 (mobile-навигация вместо модалки), паттерн AD-3, точка монтирования Epic 3/4.
- [x] `src/components/contact-form/ContactForm.client.tsx` -- Добавить проп `deepLink?: { topic?: string }` + один-раз-эффект (ref-гвард): нормализовать/сопоставить тему с `content.topics`, `setValues` темы, пульс `.cf-prefilled` на select (~2400ms), smooth-scroll формы (offset ~110px), автофокус `name` (~700ms); без `deepLink` — без изменений -- deep-link режима 2 внутри формы (владеет своими ref'ами), контракт submit нетронут.
- [x] `src/components/contact-form/ContactInline.client.tsx` -- `.contact-card` с `ContactForm`+`ContactInfo`; mount-эффект читает `window.location.search`, при `?topic=` прокидывает `deepLink={{topic}}` -- инлайн-композиция режима 2, `/contact` остаётся статичным.
- [x] `src/app/(site)/contact/page.tsx` -- Заменить `<ContactForm/>` на `<ContactInline/>` -- монтирование инлайн-режима с панелью и deep-link.
- [x] `src/styles/components.css` -- Добавить `.contact-card`/`.contact-overlay`/`.contact-modal`/`.contact-close`/`.cf-form`-padding/`.cf-info`+потомки/`.cf-field select.cf-prefilled`+`@keyframes cf-pulse`/свёртку <768px, порт из `Home.html:627-763`+`Contact.html:209-217` -- пиксель-фиделити (AD-13).

**Acceptance Criteria:**
- Given `<GetInTouch/>` на desktop-вьюпорте, when клик по `GET IN TOUCH`, then открывается `.contact-overlay` (`role=dialog`) двухколонкой (форма + `.cf-info` с адресами/тел/email/соц), фон заблокирован (`body.overflow:hidden`), и закрытие крестиком/backdrop/Esc снимает и оверлей, и scroll-lock (режим 1).
- Given `<GetInTouch/>` на mobile-вьюпорте (<768px), when клик по триггеру, then происходит навигация на `/contact` (с `?topic=` если задан), а модалка НЕ открывается; на mobile-About модалки нет вовсе (режим 3, AD-13).
- Given `/contact?topic=Partnership`, when страница загрузилась, then тема `Partnership` предвыбрана в select, поле кратко подсвечено пульсом `.cf-prefilled`, страница smooth-проскроллена к форме и `Your Name` в фокусе; при `/contact` без `?topic=` форма+панель рендерятся без побочных эффектов (режим 2).
- Given любой режим, when форма успешно отправлена, then путь один — `submitContactForm` (тот же `ContactFormResult`), режимы отличаются только презентацией; в модалке успех авто-закрывает диалог.
- Given `npm run build` и `npm run lint`, when выполнены, then проходят без ошибок и типовых нарушений; `/contact` пререндерится статически; `CRM_API_URL` отсутствует в клиентском бандле.

## Spec Change Log

## Review Triage Log

### 2026-07-05 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 1, medium 0, low 1)
- defer: 3
- reject: 12
- addressed_findings:
  - `[high]` `[patch]` Deep-link аффорданс срабатывал при ЗАКРЫТОЙ модалке (оба ревьюера). `ContactModal` монтирует `ContactForm` всегда и передавал `deepLink` независимо от `open`; одноразовый (ref-guard) эффект формы отрабатывал на mount → при `<GetInTouch topic=…/>` (документированный API для Epic 3/4) на загрузке страницы происходил нежелательный smooth-scroll, пульс уходил в скрытый select, а ref-guard не давал аффордансу воспроизвестись при реальном открытии модалки. Исправлено: `deepLink={open && deepLinkTopic ? {…} : undefined}` — эффект применяется РОВНО когда модалка открывается (переход undefined→{topic} перезапускает эффект до срабатывания guard'а). Под scroll-lock открытой модалки `window.scrollTo` инертен, поэтому это же снимает и находку про «бессмысленную scroll-математику в модалке» (reject).
  - `[low]` `[patch]` Deep-link эффект не отменял свои rAF/`setTimeout` при размонтировании (Edge Case Hunter). Если форма размонтируется до срабатывания (модалку закрыли сразу после deep-linked-открытия / навигация), таймеры дёргали `classList`/`focus`/`scrollTo` на отсоединённом узле (безвредно, но неряшливо и вразрез с timer-cleanup идиомой codebase — рядом `resetTimer`). Исправлено: rAF и таймеры собираются в handles, cleanup их отменяет.
- deferred (не блокирует, вынесено в deferred-work.md):
  - Focus-management диалога (перевод фокуса внутрь / focus-trap / inert фон / `aria-labelledby`) — a11y сверх прототипа (Home.html-модалка его не имеет; epic: пиксель приоритетнее a11y, AD-13). Целостнее внедрить при живом монтировании модалки в Epic 3, не частичным трапом сейчас.
  - `prefers-reduced-motion`-гвард на новую анимацию (smooth-scroll, `cf-pulse`, overlay/modal-переходы) — портировано из прототипа без гварда; когерентный reduced-motion-проход как один блок.
  - Дублирующиеся фиксированные DOM-id (`id="contactForm"`, `cf-*` из 2.1) при мультимонтировании (два `GetInTouch` / триггер + инлайн на одной странице) — преэкзистинг-дизайн id из 2.1, вскрыт `GetInTouch`; актуально при реальном мультимонтировании в Epic 3.
- rejected_summary: 12 отклонено. Scroll-математика в модалке (снята patch'ем F1 — инертна под scroll-lock). `role`/`aria-modal` на backdrop + закрытая модалка в SR — закрытое состояние `visibility:hidden` УБИРАЕТ узел из дерева доступности, экспозиции нет; `aria-labelledby` vs `aria-label` — косметика семантики, прототип-паритет. Match по `label` а не `value` / дубли-нормализация / hyphen-minus не в norm / whitespace-`?topic=` — прототип-верно (`Contact.html:625-644` матчит по `textContent`, norm ровно `[&–—]`), ни одна текущая тема не содержит дефис/не нормализуется в пусто/не дублируется по label → ложных совпадений нет. Save/restore scroll-lock и initial-check `matchMedia` (открытие при уже <768px) — идиома совпадает с `Header.client.tsx` (тот тоже чистит `overflow=''`, не save/restore); открыть модалку при <768px недостижимо (desktop-триггер `display:none`, mobile показывает навигационный `<Link>`); мультиоверлей-сценария нет (desktop-модалка и mobile-drawer не сосуществуют). Нестабильная зависимость `{topic}` — эффект ref-guarded, ре-раны безвредны. `rel="noopener"` без `noreferrer` — прототип-паритет, noopener закрывает tabnabbing. Декоративные иконки без `aria-hidden` — прототип-паритет, голый inline-svg SR обычно игнорирует. Дублирование контакт-данных `contact-info.ts`/`site-contacts.ts` — осознанное расхождение по AD-14 (llc@ vs info@, разные лейблы), зафиксировано в шапке файла. «Немонтированный модальный путь» (INFO) — не дефект: spec явно поставляет `GetInTouch`/`ContactModal` как готовую библиотеку, живая верификация модалки в Epic 3 (cross-story dependency).

### 2026-07-05 — Follow-up review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (high 0, medium 0, low 2)
- defer: 0
- reject: 12
- addressed_findings:
  - `[low]` `[patch]` Deep-link-аффорданс мог осиротеть при ре-рендере родителя ОТКРЫТОЙ модалки (Blind Hunter). `ContactModal` передавал `deepLink` инлайновым объект-литералом `{ topic }` — новая ссылка на каждый рендер; эффект формы завязан на `[deepLink, content.topics]`, поэтому любой ре-рендер родителя в окне 0–2400ms запускал CLEANUP эффекта (отмена rAF + `setTimeout`'ов), а ref-гвард `deepLinkApplied` блокировал перезапуск → smooth-scroll/автофокус не срабатывали, а класс пульса мог зависнуть. Прошлый проход отклонил это как «ре-раны безвредны (ref-guarded)», упустив, что вред наносит именно cleanup (отменяет незавершённые таймеры). Исправлено: `deepLink` мемоизирован (`useMemo` по `[open, deepLinkTopic]`) — стабильная ссылка, ре-рендер родителя больше не перезапускает эффект.
  - `[low]` `[patch]` Класс `.cf-prefilled` (задаёт СТАТИЧНЫЕ оранжевую рамку + box-shadow, не только анимацию) мог остаться навсегда (Edge Case Hunter). Cleanup эффекта отменял таймер снятия класса (`clearTimeout`), но сам класс не снимал; если cleanup срабатывал через 16–2400ms после deep-linked-открытия (напр. модалку закрыли в этом окне), select навсегда сохранял оранжевую рамку/свечение на смонтированном узле. Исправлено: cleanup теперь также вызывает `select?.classList.remove('cf-prefilled')`.

## Design Notes

**Три слоя, один путь (AD-8).** `ContactForm` не знает о режиме — он рендерит форму и вызывает `submitContactForm`. Презентацию дают обёртки: `ContactModal` (оверлей), `ContactInline` (карточка), `GetInTouch` (триггер). Все реиспользуют один `onSuccess`-шов (форма ресетит на ~1600ms и зовёт `onSuccess`) — модалка вешает на него `onClose`, поэтому авто-закрытие бесплатно и без второго таймера.

**Развилка desktop/mobile — CSS, не JS (AD-3).** Как `Header.client.tsx` рендерит обе header-композиции и выбирает CSS-медиа, `GetInTouch` рендерит desktop-`<button>` и mobile-`<a>` одновременно; никакого `matchMedia`-гейтинга рендера (только для авто-закрытия уже открытой модалки при ресайзе вниз, чтобы не остался недостижимый scroll-lock). Это исключает hydration mismatch.

**deep-link без потери статики.** Прототип читает `location.search` после загрузки и императивно поправляет DOM. В React это одноразовый mount-эффект: `ContactInline` читает `window.location.search` (не `useSearchParams` — тот потянул бы Suspense/динамический рендер и снял бы статический пререндер `/contact`), передаёт `deepLink` в форму. Форма применяет его РОВНО раз (ref-гвард) эффектом — select пуст на сервере и в первом клиентском рендере, тема ставится после → нет hydration mismatch. Нормализация темы дословно из прототипа: `s.replace(/[&–—]/g,'').replace(/\s+/g,' ').trim().toLowerCase()`.

**Панель — свой контент-дом (AD-14).** Инфо-панель показывает `llc@rollun.com` и лейблы `Registered office`/`Shop & return center` — они ОТЛИЧАЮТСЯ от футерных атомов (`info@rollun.com`, `Only for legal purposes` в `site-contacts.ts`). Прототипы различаются → по прецеденту `COMPANY_BLURB`/`COMPANY_INTRO` это отдельный дом `contact-info.ts`, а не переиспользование футерных атомов; каждая композиция пиксель-верна своему прототипу (AD-13).

**Почему модалка/триггер не смонтированы сейчас.** Home/About — заглушки Epic 3/4; они смонтируют `<GetInTouch/>` (их AC этого требуют: story 3.1 «кнопка GET IN TOUCH смонтирована и вызывает форму из Epic 2»). Story 2.4 поставляет ГОТОВЫЙ реиспользуемый компонент (cross-story dependency в epic-2-context). Живое поведение модалки прогоняется при монтировании в Epic 3; здесь оно верифицируется сборкой/типами/ревью + общим (уже вживую проверенным на `/contact`) submit-контрактом. Инлайн-режим (2) верифицируется вживую полностью.

## Verification

**Commands:**
- `npm run build` -- expected: `Compiled successfully`, typecheck без ошибок, `/contact` в списке как static (○).
- `npm run lint` -- expected: без ошибок ESLint.

**Manual checks:**
- `/contact`: форма и тёмная `.cf-info`-панель двухколонкой (пиксель как `Contact.html`); свёртка в одну колонку <768px.
- `/contact?topic=Partnership`: тема предвыбрана, пульс на select, smooth-scroll к форме, фокус в `Your Name`; `/contact?topic=Nonexistent` и `/contact` без параметра — без побочных эффектов, форма как обычно.
- Grep-проверка: строки панели (`llc@rollun.com`, GitHub/LinkedIn URL, `Contact Information`) только в `content/contact-info.ts` (AD-14); `CRM_API_URL` отсутствует в `.next/static` (клиентский бандл).
- Код-инспекция модалки (не смонтирована до Epic 3): `ContactModal` рендерит `role="dialog"`/`aria-modal`, эффекты scroll-lock/Esc/backdrop/media-close по `open` с cleanup; `GetInTouch` рендерит обе (desktop-button + mobile-link) композиции; оба потребляют дефолтный `submitContactForm` (endpoint один).

## Auto Run Result

Status: done

**Реализованное изменение:** Story 2.4 (Epic 2) — три режима показа единого `ContactForm` поверх ОДНОГО `submitContactForm` (AD-8, FR-11). Форма/валидация/honeypot/submit из 2.1–2.3 не тронуты; добавлены тонкие презентационные слои в `components/contact-form/`. Режим 2 (инлайн + deep-link `?topic=`) поставлен и верифицирован вживую на `/contact`: двухколоночная `.contact-card` с тёмной `.cf-info`-панелью, `?topic=` предвыбирает тему, пульсит select, smooth-scroll к форме, автофокус `Your Name`. Режим 1 (desktop-модалка) и режим 3 (mobile-навигация) поставлены как готовый к монтированию `GetInTouch` (владеет модалкой; desktop-`<button>` открывает диалог, mobile-`<Link>` навигирует на `/contact` — обе композиции в DOM, видимость по CSS-медиа 768px, паттерн `Header.client.tsx`/AD-3). Home/About — заглушки Epic 3/4, которые смонтируют `GetInTouch` (cross-story dependency); живая верификация модалки — там.

**Файлы:**
- `src/content/contact-info.ts` — СОЗДАН. Единый дом (AD-14) строк инфо-панели (heading, адреса с лейблами, телефоны, `email: llc@rollun.com`, blurb, соц GitHub/LinkedIn), значения дословно из `Home.html:1233-1276`; отдельный дом от футерных атомов (расхождение llc@ vs info@ по прецеденту `COMPANY_BLURB`/`COMPANY_INTRO`).
- `src/components/contact-form/ContactInfo.tsx` — СОЗДАН. Чистый RSC-рендер `.cf-info` (иконки/адреса/телефоны/email/соц inline-SVG), контент пропсом; общий для модалки и инлайна.
- `src/components/contact-form/ContactModal.client.tsx` — СОЗДАН. Презентационный диалог `open`/`onClose`: `.contact-overlay`(`role=dialog`/`aria-modal`) → `.contact-modal` с формой (+`onSuccess=onClose` авто-закрытие) и панелью; эффекты scroll-lock/Esc/media-close(<768px) по `open` с cleanup, backdrop-клик.
- `src/components/contact-form/GetInTouch.client.tsx` — СОЗДАН. Точка монтирования Epic 3/4: владеет `open`, рендерит desktop-`<button>`(open) + mobile-`<Link>`(nav `/contact`+`?topic=`) + `<ContactModal>`; пропсы `label`/`topic`/`className`.
- `src/components/contact-form/ContactInline.client.tsx` — СОЗДАН. Композиция `/contact`: `.contact-card` (форма+панель); mount-эффект читает `window.location.search` (не `useSearchParams` — `/contact` остаётся статичным), прокидывает `deepLink`.
- `src/components/contact-form/ContactForm.client.tsx` — ИЗМЕНЁН. Аддитивный проп `deepLink?: { topic?: string }` + одноразовый (ref-guard) эффект: нормализация/матч темы с `content.topics`, предвыбор, пульс `.cf-prefilled`, smooth-scroll, автофокус name; без `deepLink` поведение идентично 2.3. Submit/валидация/honeypot нетронуты.
- `src/app/(site)/contact/page.tsx` — ИЗМЕНЁН. `<ContactForm/>` → `<ContactInline/>`.
- `src/styles/components.css` — ИЗМЕНЁН. Порт `.contact-card`/`.contact-overlay`/`.contact-modal`/`.contact-close`/`.cf-info`+потомки/`.cf-prefilled`+`@keyframes cf-pulse`/триггер-сплит `.gitouch-dk|mb`/свёртка <768px из `Home.html:627-763` + `Contact.html`.

**Разбор ревью (Blind Hunter + Edge Case Hunter, оба Opus, без предконтекста):** 2 патча применены, 3 отложено, 12 отклонено; 0 intent_gap, 0 bad_spec (repair-луп не запускался). Патчи: `[high]` deep-link срабатывал при закрытой модалке (нежелательный load-scroll + сломанный deep-link-в-модалке для API `GetInTouch topic`) → `deepLink` гейтится на `open` в `ContactModal`; `[low]` deep-link эффект не отменял rAF/таймеры при размонтировании → добавлен cleanup. Отложено (в deferred-work.md): focus-management/trap диалога, `prefers-reduced-motion`-гвард, дубли DOM-id при мультимонтировании — все a11y-сверх-прототипа / преэкзистинг, целостнее закрыть при живом монтировании в Epic 3. Отклонено 12: прототип-паритет матча тем/norm/`rel`/декор-иконок, `visibility:hidden` убирает закрытую модалку из a11y-дерева, идиома scroll-lock как в `Header`, открытие модалки <768px недостижимо (desktop-триггер `display:none`), осознанное AD-14 расхождение контакт-данных.

**Верификация:** `npm run lint` — чисто (exit 0); `npm run build` — `Compiled successfully`, typecheck без ошибок, 11/11 static pages, `/contact` пререндерится static (○). Прогонялось дважды — после имплементации и после патчей ревью. Grep: строки панели (`llc@rollun.com`/GitHub/LinkedIn/`Contact Information`) только в `content/contact-info.ts` (AD-14); `CRM_API_URL` отсутствует в `.next/static` (0 совпадений). Submit/validate не в диффе. Живая проверка инлайн-режима (`/contact`, `?topic=`) доступна; модалка/триггер инспектированы кодом (не смонтированы до Epic 3).

**Остаточные риски:** (1) Модальный/триггерный путь смонтируется и вживую проверится только в Epic 3/4 — до этого верифицирован сборкой/типами/ревью + общим (уже вживую проверенным) submit-контрактом. (2) Три отложенных a11y/id-пункта (focus-trap, reduced-motion, дубли-id) — не блокируют, вынесены в deferred-work.md, целевой срок — монтирование модалки в Epic 3. (3) Контракт CRM (унаследовано из 2.2) — внешнее допущение владельца. (4) Пиксель-фиделити модалки к `Home.html` подтверждена портом CSS, но без живого desktop-рендера — финальная пиксель-приёмка при монтировании в Epic 3.

---

### Follow-up review pass (2026-07-05)

**Повод:** spec был `done` с `followup_review_recommended: true` → запущен независимый повторный ревью (Blind Hunter + Edge Case Hunter, оба Opus, без предконтекста) диффа `src/` от baseline `762a265`.

**Итог триажа:** 0 intent_gap, 0 bad_spec (repair-луп не запускался), 2 патча (оба low), 0 новых defer, 12 отклонено. Обе находки-патча — про жизненный цикл таймеров одноразового deep-link-эффекта в ещё-не-смонтированном модальном пути:
- `[low]` `[patch]` `ContactModal` передавал `deepLink` инлайн-литералом → нестабильная ссылка → ре-рендер родителя открытой модалки (окно 0–2400ms) отменял rAF/таймеры эффекта через его cleanup, а ref-гвард не давал перезапустить. Уточнение к прошлому проходу (тот отклонил как «ре-раны безвредны»): вред наносит именно cleanup. Исправлено `useMemo` по `[open, deepLinkTopic]`.
- `[low]` `[patch]` cleanup deep-link-эффекта отменял таймер снятия `.cf-prefilled`, но не снимал сам класс → зависшая навсегда оранжевая рамка/свечение select'а (класс задаёт статичные border/box-shadow, не только анимацию), если cleanup срабатывал в окне 16–2400ms. Исправлено `select?.classList.remove('cf-prefilled')` в cleanup.

**Новых defer нет:** три преэкзистинг/сверх-прототипа кандидата (focus-trap диалога, дубли DOM-id при мультимонтировании, `prefers-reduced-motion`-гвард) УЖЕ в `deferred-work.md` с прошлого прохода — повторно не заводились. Отклонено 12: reopen модалки не переигрывает deep-link (осознанный дизайн «ровно раз» из Design Notes; семантика reopen — к живому монтированию в Epic 3), прототип-паритет (декор-иконки без `aria-hidden`, `rel=noopener` без `noreferrer`, мис-`?topic=` тихо игнорится), стандартная URL-кодировка `&`→`%26` (внутренние ссылки `GetInTouch` уже `encodeURIComponent`), dev-only StrictMode-двойной-инвок, косметика claim'ов (`Pure RSC`/`content`-проп).

**Файлы этого прохода:**
- `src/components/contact-form/ContactModal.client.tsx` — `deepLink` мемоизирован (`useMemo` по `[open, deepLinkTopic]`) вместо инлайн-литерала.
- `src/components/contact-form/ContactForm.client.tsx` — cleanup deep-link-эффекта дополнен `select?.classList.remove('cf-prefilled')`.

**Верификация (повторный прогон):** `npm run lint` — чисто; `npm run build` — `Compiled successfully`, TypeScript без ошибок, 11/11 static, `/contact` пререндерится static (○); `CRM_API_URL` в `.next/static` — 0 совпадений (без регресса). Патчи клиентские, статику `/contact` не затрагивают.

**Follow-up рекомендация:** `false` — два локализованных low-severity патча в жизненном цикле таймеров одного эффекта (мемоизация + снятие класса в cleanup), тривиальной сложности, косметическое следствие в ещё-не-смонтированном пути; независимый повторный ревью не требуется.
