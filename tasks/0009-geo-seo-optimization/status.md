# GEO И SEO оптимизация — статус

2026-10-19. По запросу пользователя оформлена задача. Реализация и поставка этапа 1 выполнены 2026-10-26. Canonical исправлен, закоммичен и опубликован. Lang/title/description/favicon/logo/JSON-LD исправлены, закоммичены и опубликованы следующим изменением; SSG публичного контента реализован локально; редакционные этапы не начаты.

| Этап | Статус | Результат и проверка | Осталось |
|---|---|---|---|
| Подготовка | принят | git status проверен; предыдущие документы задач сохранены. Локальный backup создан в игнорируемом sqlDump и успешно проверен pg_restore --list, содержимое не выводилось | Перед будущими изменениями повторить необходимые проверки |
| Изыскания | принят | Результаты прямых HTTP-проверок, браузерного просмотра production и чтения кода сохранены в audit.md с границами достоверности и источниками | Получить данные вебмастеров и измерить производительность при реализации |
| План | на проверке | plan.md содержит приоритеты, затрагиваемый код, критерии, приватность и rollback | Согласовать реальные сведения о проекте/авторах/контактах, выбрать рендеринг |
| Техническая индексация | принят | Этап 1 опубликован: robots/sitemap, 404, noindex, www и /analysis redirects; локальные и production HTTP checks успешны | canonical/metadata/изображения — этап 2 |
| Метаданные | принят | Опубликованы из 9fca0f9; 16 candidate test methods, 76 production HTTP checks с сервера/извне и DOM/SPA успешны | Рендеринг контента, редактура и аналитика отдельно |
| Рендеринг | на проверке | SSG 5 public pages, hydration и ClientOnly реализованы локально; build/lint, SSG checks и 18 HTTP test methods успешны | Коммит/публикация по запросу, полевая оценка CWV отдельно |
| Доверие и контент | не начат | Предложения оформлены, медицинские тексты не публиковались | Методология, источники, реальные сведения и предметная проверка |
| Тематические страницы/GEO | не начат | Намечена структура полезных страниц | Редакционная подготовка и перелинковка |
| Метрики и поставка | в работе | 28.10: публичный baseline снят, PSI429, кабинеты недоступны; локальный privacy fix проверен, SSH timeout не позволил поставку | Доступ к кабинетам/SSH, публикация, индексация/трафик/CWV и отправка sitemap |

На этапе постановки 2026-10-19 сборки и тесты не запускались: менялись только документы. Итог реализации и последующей разрешённой поставки этапа 1 зафиксирован в implementation.md.

## 2026-10-26 — реализация этапа 1

- Подготовка — принят: git status проверен, предыдущие untracked задачи сохранены; свежий backup локальной БД создан в игнорируемом sqlDump и проверен pg_restore --list без вывода содержимого.
- Техническая индексация, часть 1 — в работе: scope уточнён в plan.md; остальные этапы не начинаются. Серверные проверки выполняются изолированно, без изменения production и локальной БД.

### Результат этапа 1 — 2026-10-26

- Исходные дефекты повторно подтверждены read-only HTTP на production; regression harness до правки воспроизвёл ошибки статусов/headers/robots/redirects.
- Реализация — на проверке: явная матрица маршрутов client Nginx, HTTP/HTTPS host redirects на proxy, noindex API, Navigate для /analysis в SPA. БД и медицинская логика не менялись, backend не перезапускался.
- Проверка — принят: client build и lint успешны; существующие CSS/chunk warnings остались. Оба Nginx config прошли nginx -t. Все 11 групп HTTP regression checks прошли на собранном клиенте и proxy с mock API; тестовая сеть/контейнеры удалены.
- Browser smoke — принят: /analysis?seo_probe=1#list заменён на /?seo_probe=1#list; главная, список и форма доступны. Незаполненная форма показывает ожидаемую ошибку до сохранения. Медицинские данные не вводились, PDF не загружались, результаты не создавались.
- Поставка — не начат: production не менялся. Проверка сертификата www, запуск проверок после поставки и отправка sitemap выполняются при разрешённой публикации. Метаданные, рендеринг и контент остаются следующими этапами.

## 2026-10-26 — поставка этапа 1

- Пользователь явно разрешил выгрузку на рабочий сервер.
- Подготовка — в работе: TLS основного/www проверен; исходные изменяемые AppContainer и proxy config совпали с проверенной базой. Production-клиент содержит дополнительные изменения выбора групп показателей и зависимостей: новая сборка будет основана на действующем production release с добавлением только SEO-правок. Обновление всего приложения из локальной копии исключено.
- До переключения сохраняются прежний client image и proxy config; backend/БД/parser остаются без перезапуска. Идентичность и время запуска этих контейнеров зафиксированы для сравнения после поставки.

### Результат поставки — 2026-10-26

- Подготовка — принят: TLS обоих доменов действителен; прежний image/config сохранены для rollback. Новый release построен на текущем production client, чтобы сохранить более свежие изменения группового выбора. Новые nginx configs проверены до переключения.
- Поставка — принят: обновлены только client image и proxy config; in-place file mount и nginx -t/reload проверены, backend/БД/PDF ID/image/StartedAt не изменились.
- Приёмка — принят: 27 проверок candidate, затем 31 production HTTP check с сервера и 31 извне успешны; браузер подтвердил redirect с query/hash, загрузку списка и формы. Rollback не потребовался; предыдущий image/config сохранены, candidate удалён.
- Ограничения — метаданные/рендеринг/контент и Search Console/Яндекс Вебмастер остаются последующими этапами. Рекомендации для следующей сборки и rollback записаны в implementation.md: прежний compose имеет старый build context, новый исходник хранится в отдельном SEO-release.

## 2026-10-26 — canonical самостоятельных страниц

- Подготовка — принят: git status проверен, предыдущие изменения сохранены; свежий локальный backup в игнорируемом sqlDump создан и проверен pg_restore --list без вывода содержимого.
- Реализация — в работе: scope и решение описаны в plan.md; изменения только canonical публичных страниц и согласованных HTML-оболочек/SPA-навигации. Production не меняется.

### Результат исправления canonical — 2026-10-26

- Реализация — на проверке: canonical для 5 публичных страниц формируется в исходном HTML после build и синхронизируется hook при SPA-переходах. Для noindex/404 убран неверный canonical главной. Общие hreflang главной удалены, остальные metadata не менялись.
- Проверка — принят: build/postbuild, lint и все 13 HTTP test methods с подслучаями успешны. Браузер подтвердил /about query/hash → canonical /about, SPA-переход privacy-policy, Back и отсутствие canonical на /test. Предыдущие этапы маршрутизации не сломаны; БД/API не менялись.
- Поставка canonical — не начат: production пока с этапом 1. Порядок согласованной сборки client image, проверки оболочек и rollback добавлен в implementation.md. Title/description/lang/JSON-LD/favicon/контент остаются следующими пунктами.

## Canonical: коммит и разрешённая поставка — 2026-10-26

- Коммит — принят: 551eb67 (fix(seo): configure indexing and page-specific canonical URLs); включает SEO-код и документы 0009. Не связанные задачи 0007/0008 оставлены вне коммита; secrets и generated files не включались.
- Поставка — в работе: пользователь явно разрешил. Текущий production image соответствует предыдущему SEO-release; кандидат готовится на его source с сохранением новых production dependencies. В production package.json добавляется только postbuild, без замены его локальной устаревшей копией. Предыдущий client image/config сохраняются для rollback; БД/backend/PDF не меняются.

### Результат canonical-поставки — 2026-10-26

- Коммит кода — принят: 551eb67, только SEO и задача 0009, без задач 0007/0008 и секретов.
- Кандидат — принят: source на основе текущего production-release, сохранены более свежие зависимости/выбор групп, добавлен только canonical scope. Docker build, nginx -t и 13 групп HTTP regression checks на реальном build успешны.
- Поставка — принят: опубликован image seo-canonical-551eb67, предыдущий закреплён для rollback. Обновлён только client, proxy reload без изменения config. ID/image/StartedAt backend/БД/PDF/proxy не изменились.
- Приёмка — принят: 31 HTTP check и 24 canonical source HTML checks прошли с сервера и извне; production DOM /about → privacy-policy → Back содержит правильный единственный canonical. Миграции/изменения данных отсутствуют, rollback не потребовался.
- Документация — принят: source/image/rollback и ограничение старого compose build context записаны в implementation.md. Lang/title/description/JSON-LD/favicon остаются вне этой поставки.

## Метаданные, lang, favicon/logo, JSON-LD — 2026-10-26

- Подготовка — принят: git status проверен, старые untracked 0007/0008 сохранены. Свежий локальный backup создан в игнорируемом sqlDump и проверен pg_restore --list без вывода данных.
- Исследование — принят: найдены lang=en, общие metadata/JSON-LD, URL /public/pa.svg и обещание диагностики в index.html; конкурирующие useDocumentTitle на страницах подтверждены чтением кода. Существующий SVG локально читаем. Scope и решение зафиксированы в plan.md.
- Реализация — в работе; production не меняется, БД/API не затрагиваются.

### Результат метаданных — 2026-10-26

- Реализация — на проверке: единый config/engine для build и DOM, lang=ru, собственные title/description, централизованный head без конкурирующих page hooks. Удалено обещание диагностики/obsolete MedicalDiagnostics/aspect, добавлен согласованный graph публичных страниц. Logo URL исправлен на доступный /pa.svg.
- Проверки — принят: build/postbuild, lint, все 16 HTTP test methods с подслучаями на dist/config и собранном Nginx runtime image успешны. Проверены реальные SVG/MIME/read permissions, raw dev HTML 5 страниц, DOM всех 5 public routes, SPA, Back, service и 404. Исходные ошибки воспроизведены до исправления. Внешние rich-result валидаторы не запускались.
- Scope — принят: данные/БД/API/интерпретации/видимый контент не менялись; старые CSS/chunk warnings не исправлялись. Canonical и этап 1 не регрессировали.
- Поставка metadata — не начат: изменения только локально, без коммита и публикации. Порядок будущей поставки/rollback и сохранения более свежей production-базы записан в implementation.md.

## Метаданные: коммит и разрешённая поставка — 2026-10-26

- Коммит — принят: 9fca0f9 (fix(seo): unify page metadata and structured data), только SEO и документы задачи 0009.
- Поставка — в работе: пользователь явно разрешил. Проверяется побайтовое соответствие исходных изменяемых файлов действующей production-базе. Новый source собирается из canonical-release с добавлением только файлов коммита и удалением useDocumentTitle; более свежие production dependencies сохраняются. Предыдущий image/config сохраняются для rollback, backend/БД/PDF не меняются.

### Результат metadata-поставки — 2026-10-26

- Коммит кода — принят: 9fca0f9, только metadata scope и документы 0009.
- Кандидат — принят: все изменяемые source files совпали с ожидаемой базой, production dependencies/групповая выборка сохранены; Docker build, nginx -t и 16 HTTP test methods на готовом image успешны.
- Поставка — принят: опубликован seo-metadata-9fca0f9, прежний image/config сохранены для rollback. Обновлён только client, proxy reload; backend/БД/PDF/proxy container ID/image/StartedAt не изменились.
- Приёмка — принят: 76 HTTP/canonical/metadata/schema/icon checks прошли с сервера и извне. Браузер подтвердил все 5 public pages, SPA/Back/service/404. Favicon/logo доступны, обещание диагностики удалено; внешние rich-result валидаторы не запускались.
- Документация — принят: текущий source/image, rollback и ограничение старого compose build context добавлены в implementation.md. Данные/БД/API не менялись, дальнейшие content/SSR/аналитические этапы не начаты.

## Рендеринг публичного контента — 2026-10-26

- Подготовка — принят: git status чист для tracked files, старые untracked задачи 0007/0008 сохранены; свежий backup создан в игнорируемом sqlDump и проверен pg_restore --list.
- Исследование — принят: публичные текстовые компоненты статичны; форма/навигационная auth-часть зависят от Redux/i18n/DOM, AppContainer и cookie-banner читают localStorage. Для сборки нужен ClientOnly и StaticRouter/fresh store, а не window polyfills или загрузка production API.
- Решение — в работе: SSG только 5 public routes, тот же React tree и hydrateRoot; динамические/private области не рендерятся в build. План, критерии, приватность и rollback добавлены в plan.md. Production/БД не меняются.

### Результат рендеринга — 2026-10-26

- Реализация — на проверке: SSG пяти public pages из того же React tree, ClientOnly для browser-only зон, hydrateRoot, native details, public footer links. Private/service/error paths не пререндерятся, server bundle вне dist, сборка без сети/API/БД.
- Проверки — принят: build/postbuild/lint, SSG isolation script и 18 HTTP test methods на dist/config и runtime image успешны. В браузере устранена и повторно проверена старая невалидная вложенность p/ul/p политики: все пять public pages без hydration errors. Form/SPA/Back работают.
- No-script/adaptive — принят: копия SSG HTML без script tags показала содержимое/ссылки и native accordion мышью/Enter; desktop/mobile без горизонтального overflow, viewport возвращён к исходному.
- PDF smoke — принят: локальный синтетический одностраничный документ без значений анализов; expected unsupported/empty findings, counts сохранённых результатов/точек неизменны. Реальные PDF и запись результатов не использовались.
- Ограничения — CWV/CrUX не измерены, тексты about/contacts/политики содержательно не редактировались. UI file upload/save не выполнялись. Backend/БД/PDF не менялись; коммит/публикация SSG не выполнялись. Порядок последующей поставки/rollback записан в implementation.md.

### 2026-10-26 — устранение скачка рендеринга (на проверке)
- Вместо приблизительной заглушки SSR выводит начальную пустую форму; справочники загружаются только в браузере. Select используют useId и безопасный portal target; переводы справочников не скрывают форму через Suspense.
- Под поле пола зарезервирована ширина: загрузка вариантов больше не переносит подписи возраста (остаточное смещение 24 px выявлено и устранено).
- Cookie-баннер fixed, с ограничением высоты и прокруткой: появление/закрытие не меняет поток страницы.
- Найдено отдельное смещение около 44 px из-за шрифта. Sofia Sans загружается через preload, font-display optional исключает позднюю замену при медленной загрузке. Удалена внешняя загрузка Roboto; запасной шрифт системный Arial. При медленной сети первая загрузка может остаться с системным шрифтом.
- В браузере при ширине 1280 после загрузки шрифта геометрия header/H1/list/analysis/form совпала у статической копии без scripts и гидратированной страницы; ошибок гидратации нет, горизонтального overflow нет. Это сравнение геометрии, не измерение полевого CLS.
- Regression checks теперь требуют форму в публичном HTML и отсутствие приблизительной заглушки; private/service страницы остаются CSR. Сборка, lint, SSR без сети и 18 групп Nginx-проверок выполнены.
- Ранее выбранное разделение «вся форма ClientOnly» заменено: только навигация/модальные окна/consent остаются ClientOnly. Никаких изменений БД, API или медицинской логики. Коммит и публикация не выполнялись.

### 2026-10-26 — header и CSS до первого отображения (на проверке)
Уточнена причина FOUC: SSR HTML показывался до CSS, импортированного из main.tsx через JS в Vite dev. Оба глобальных CSS перенесены в обычные блокирующие stylesheet-ссылки в head, импорты из main удалены. Vite build преобразует ссылки в assets CSS. SVG публичного header и иконки авторизованной навигации получили intrinsic width/height; responsive классы сохранены.
Regression на отсутствие размеров сначала воспроизвёл дефект (Laboratory без width), после исправления проходит; добавлена проверка stylesheet в head собранных публичных страниц. Build, lint и SSR checks проходят. HTTP dev с Accept:text/css возвращает оба CSS 200 text/css. Браузер после перезагрузки показывает обе таблицы в document.styleSheets, header 72 px и публичные иконки 20×20 px; ошибок нет. Это исправление порядка CSS, полевой CLS не измерялся. БД не затрагивалась. Коммит/публикация не выполнены.

### 2026-10-26 — повторная проверка публичного рендеринга
Статус: на проверке пользователя. Текущие SSR regression checks и lint проходят. Все 18 HTTP-групп проходят через изолированный Nginx: публичный body до JS, metadata/canonical, assets, noindex/пустая CSR-оболочка service/private/error и недоступность server bundle. В браузере повторно открыты все пять публичных URL: marker=true, один H1, canonical своего URL, две глобальные таблицы стилей, без horizontal overflow и ошибок hydration. Аккордеон открывается; пустая форма показывает ошибку пола/возраста; SPA-переход и Back возвращают рабочую форму. Запись результата/загрузка реальных PDF не выполнялись.
Предыдущая успешная build проверена на актуальных артефактах; код в этом аудите не менялся. В SSR остаётся некритическое предупреждение react-i18next NO_I18NEXT_INSTANCE (переводы справочников на сборке не загружаются); это не ошибка гидратации, но стоит устранить отдельно. Полевой CLS/CrUX и медленная сеть не измерялись. Production не обновлялся; вывод относится к локальной реализации и её Nginx-стенду.

### 2026-10-26 - Public rendering deployment in progress
Commit a412aa4 created; tasks 0007/0008 excluded. Running production matches metadata-release. Previous client image and proxy config retained. Initial patch-check rejected two divergent files before applying any change. Compatible files applied with patch-check; package postbuild and group selector SSR changes adapted separately. Production package-lock/dependencies and Redux group selection retained and checked. Backend/database/parser are outside rollout scope.

## Public rendering production deployment - 2026-10-26

Status: accepted after automated and browser verification. User explicitly authorized commit and deployment. Code commit: a412aa4 (feat(seo): prerender public pages with stable initial styles).

Current production source: /var/analysis/releases/seo-render-a412aa4/client. Current image: analysis-client_analysis:seo-render-a412aa4, also tagged latest. Built from the previous metadata production source, applying the committed client patch. Initial check rejected package.json and AnalysisPointGroupSelect differences without changing the running site. The compatible patch was checked/applied; only postbuild and SSR compatibility (useId, portal guard, non-suspending translations) were transferred into these two divergent files. Production dependencies/package-lock and Redux group selection logic were preserved and verified.

Backup: /var/analysis/backups/seo-render-a412aa4 (0700), including previous image identity, proxy config and private build/rollout diagnostics. Rollback image: analysis-client_analysis:before-seo-render-a412aa4. No secrets or medical data included in Git or task artifacts.

Candidate: full Docker client build passed. The actual runtime image passed nginx -t and all 18 isolated Nginx routing/rendering/metadata test groups. Runtime has no prerender bundle or node_modules. Only client_analysis was recreated using the existing analysis compose manifest with --no-deps --no-build --pull never; external proxy received nginx -t/reload for upstream DNS. Original backend/PostgreSQL/PDF/proxy IDs, images and StartedAt remained unchanged through preparation and rollout. No database operations or result saves were performed.

After rollout, 86 HTTPS checks passed both from the server and externally: 9 rendering/isolation, 32 HTTP/HEAD/routes/assets/API, 24 canonical and 21 metadata/schema/icon checks. Browser: all five public paths have a prerender marker, one H1, loaded built CSS and 20px header icons, with no console errors/hydration failures. Native accordion, SPA navigation and Back to the form passed; no horizontal overflow at the tested desktop width. Field CWV/CLS, slow-network and real PDF/save flows were not measured in this deployment.

Rollback: first confirm no subsequent release; tag before-seo-render-a412aa4 as latest, recreate only client_analysis through /var/analysis/releases/b94f38614ee2/docker-compose.yaml with project analysis and --no-deps --no-build --pull never --force-recreate, then nginx -t/reload in nginxProxy and rerun HTTPS checks. Do not rebuild from that older compose build context. Future builds must start from the current seo-render source to retain production-only improvements. Backend/database/PDF need no restart or rollback.

Git push was not performed; publication used the verified image from the isolated release. Local tasks 0007/0008 remain untracked and excluded.

## Этап 3 — в работе, 26.10.2026
Backup локальной БД создан и проверен. Шаблоны и ложные технические обещания воспроизведены чтением исходников. Подтверждающие сведения запрошены у пользователя; подготовка достоверного описания алгоритма продолжается.

### Этап 3 — локальная реализация на проверке, 26.10.2026
- About: алгоритм по коду, границы/единицы/возраст, отсутствие или конфликт норматива, подготовленные пояснения, source-only и исторические снимки; ограничения 30/360 дней, PDF 10 МБ/первые 5 страниц, проверка распознавания и capability-доступ.
- Contacts: удалены demo email/телефон/адрес; использован ранее опубликованный mailbox из footer. Не заявлены вымышленные авторы, квалификации, медицинское рецензирование или происхождение интервалов. Подтверждение контакта владельцем остаётся открытым.
- Добавлены ссылки в header и на главной; descriptions согласованы с текстом, JSON-LD не получил неподтверждённых свойств доверия. MedlinePlus приведён только как общая справка, не источник интервалов.
- Карточки больше не обещают точность/мгновенность, охват всех возрастов и отсутствие обработки личных сведений PDF. В policy/consent убраны технически неверные обещания TTL30/шифрования/анонимности; уточнены cookies и возможная передача URL в аналитику. Это точечная сверка фактов, не юридическое принятие документов. Реквизиты оператора, правовые основания и порядок обработки запросов требуют отдельного согласования владельца.
- Regression сначала воспроизвёл старый demo about; после реализации build/lint, SSR isolation/content checks и 18 Nginx-групп проходят. Браузер: about/contacts, anchors/SPA/Back, canonical, меню и отсутствие overflow при 1280px, ошибок hydration нет. БД/API/расчёты не менялись; backup проверен. Реальные PDF/результаты не использовались.
- Для завершения ожидаются сведения пользователя: владелец/авторы, разрешённые контакты, источники и версии референсов, медицинские рецензенты при наличии. До ответа оставлены честные указания «пока не опубликованы». Коммит/публикация не выполнялись.

### Этап 3 — уточнение владельца, 26.10.2026
Пользователь подтвердил имя автора/владельца и разрешённый публичный email. Сведения внесены в About/Contacts, прежняя оговорка об отсутствии сведений об авторе удалена. Подтверждение медицинской квалификации из этого не следует; источники референсов и медицинское рецензирование всё ещё не подтверждены. Юридическая роль оператора данных отдельно не переопределялась. Контент остаётся локальным, без публикации.

## Этап 3 — разрешённая публикация 26.10.2026
Статус поставки: принят. Коммит 6df6e23 — feat(seo): document service methodology and confirmed ownership. Пользователь явно разрешил коммит/публикацию. Все изменяемые source-файлы совпали с родительской версией перед переносом; production dependencies/package-lock и более новая логика группового выбора сохранены.

Source: /var/analysis/releases/seo-trust-6df6e23/client. Image: analysis-client_analysis:seo-trust-6df6e23 (также latest). Backup: /var/analysis/backups/seo-trust-6df6e23 (0700); rollback image before-seo-trust-6df6e23. Candidate build/nginx -t и 18 изолированных Nginx test groups прошли; фактический HTML дополнительно проверен на владельца/методологию/отсутствие шаблонов и ложных обещаний хранения. Runtime остаётся статическим Nginx без SSR bundle/node_modules.

Точечно пересоздан только client_analysis без build/deps/pull через действующий compose project analysis. Proxy получил nginx -t/reload для upstream DNS. Backend/PostgreSQL/PDF/proxy IDs/images/StartedAt совпали с baseline до сборки и после поставки. БД/миграции/реальные PDF/сохранение результатов не использовались.

91 HTTPS-проверка прошла с сервера и повторно извне: 5 trust/ownership + 9 render/isolation + 32 HTTP + 24 canonical + 21 metadata/schema/icon. Браузер подтвердил имя владельца в about/contacts, корректный canonical, один H1, SPA/Back и отсутствие console/hydration errors.

Открытые содержательные вопросы этапа 3 остаются: происхождение/версии референсов, медицинские рецензенты/квалификация и полное юридическое согласование документов. Их публикация не подменяется подтверждением технической поставки. Git push не выполнялся. Задачи 0007/0008 оставлены вне коммита.

## Этап 5 — в работе, 28.10.2026
Локальный backup создан и проверен. Внешних коннекторов Search Console/Вебмастера нет; браузерный inventory вернул «Local browser use is disabled in Work settings». Доступ/выгрузки запрошены у пользователя. Найдена отправка полного URL/referrer и включённые session/form interaction collectors в текущем Yandex init; готовится отключение collector, безопасный публичный baseline и методика агрегатов.

### Этап 5 — промежуточный результат 28.10.2026
Публичный production baseline снят: 5/5 страниц 200, canonical/H1/SSG/CSS согласованы; sitemap 200, 1 URL. PSI mobile/desktop: 429, CWV не получены. GSC/Яндекс и отправка sitemap ожидают доступа, browser disabled в Work. AI referral count=null — нет безопасного collector. Старую Метрику и предложение включить её отключили локально; документы уточнены. Build/lint, SSR, 18 Nginx-групп, build privacy scan и 3 Python-теста проходят. Планируется поставка клиентского исправления в рамках явно порученного этапа «Измерение и поставка»; полное завершение измерений не заявляется.

### Этап 5 — итог доступной части, 28.10.2026
Код и baseline: commit 0e5cc67 (feat(seo): establish public baseline and disable unsafe telemetry). Build/lint, SSR, 18 Nginx-групп, build privacy scan и 3 Python-теста успешны. Попытка проверить production перед поставкой: два SSH-подключения завершились exit255; безопасная диагностика второго определила connection_timeout. Команды изменения на сервере не выполнялись, image/source не готовились и клиент не переключался. Следовательно, production пока содержит старый collector; локальное отключение ещё НЕ опубликовано.

Статус этапа: в работе, ожидается внешний доступ. GSC/Вебмастер и отправка sitemap не выполнены из-за disabled browser/no connector; CWV/PSI не получены из-за HTTP429; AI referrals unavailable. Публичный HTTP-baseline сохранён, он не доказывает индексацию. Для продолжения: включить браузер Work/подтверждённые кабинеты, обеспечить SSH, затем проверить текущий image/source (последний известный seo-trust-6df6e23), поставить клиент с backup/rollback и повторить публичный HTTP-only snapshot без PSI (--skip-performance). Секреты/права доступа не менялись; ключи/пароли у пользователя не запрашивались.

### Этап 5 — доступ к Метрике и анализ, 28.10.2026
Пользователь поручил анализ Яндекс Метрики в Chrome. Через отдельную агентскую вкладку FSB получены агрегированные отчёты (без посетителей/Вебвизора/URL результатов); snapshot сохранён в metrika-20261028.json. Локальный backup перед записью отчёта создан и проверен. Период UI «месяц»: 29.09–28.10.2026, последний день может быть неполным; это 30-дневный preset, не прежнее проектное окно 28 дней.

Итого 16 визитов / 8 посетителей / 21 просмотр; время 4:24, глубина 1.31, отказы 18.75%. Источники: direct/undefined 11 визитов (68.75%, время6:22, отказы0); поиск3 (18.75%, все Яндекс, время5с, отказы66.67%); referrals2 (12.5%, оба metrika.yandex.ru, время8с, отказы50%). Суммы посетителей по источникам могут пересекаться. Записанных Google/явных AI referrals в этой разбивке не показано; это не доказывает отсутствие индексации/ИИ-упоминаний или неатрибутированных визитов.

Цели: UI показывает 0/200 пользовательских целей и 4 автоматические категории (email/контактные поля/формы). Достижения целей не сняты, их нельзя считать нулём. Специальных целей для пути пользователя по сервису не обнаружено. Короткие поисковые визиты требуют проверки входных страниц/запросов, но 3 визита не дают достоверной оценки качества/эффекта SEO. Тестовое/внутреннее использование вероятно по структуре, но не доказано для прямых визитов.

Статус доступа уточнён: Метрика доступна через FSB; Search Console и Яндекс Вебмастер по-прежнему не проверены. Небезопасный collector в production в этом анализе не менялся, подготовленный commit0e5cc67 не публиковался. CSP заблокировала execute_js, защита не обходилась; использованы native read_page/get_text/scroll/navigation. Native Chrome inspection и screenshot tool зависали; в выводах использованы читаемые таблицы, не вымышленные визуальные значения.
### Проверка поисковых запросов и Вебмастера, 28.10.2026
Read-only аудит через FSB за 29.09–28.10.2026. Метрика раскрывает две фразы: «info@ про анализы» — 1 визит, 15 секунд, глубина 1, отказов 0%; «proanalizy.ru» — 1 визит, 0 секунд, глубина 1, отказов 100%. В сводке источников 3 поисковых визита; фраза третьего не установлена. При показе неопределённых фраз отчёт включает все 16 визитов, из них 14 без фразы, включая непоисковые источники. Эти 14 нельзя считать поисковыми переходами.

Вебмастер /sites/ показывает «Добавьте сайт», без карточки proanalize.ru, и уведомление о временном отсутствии обновления данных раздела «Мои сайты». Это не доказывает отсутствие сайта в индексе или регистрации в Вебмастере. Клики, показы, позиции, индексирование, ошибки и sitemap в кабинете не проверены. Сайт не добавлялся, права и настройки не менялись. Для завершения нужен доступ к существующей карточке сайта после восстановления раздела либо аккаунт с подтверждёнными правами. Отдельные агентские вкладки закрыты.

### Возврат текстов блоков, 02.11.2026 — на проверке
По явному уточнению пользователя полностью восстановлен accordion.data.tsx из dede6ef: заголовки и прежние тексты «Безопасно», «Быстро», «Точно». Backup создан и проверен. Client build/postbuild и lint прошли; существующие CSS/chunk/i18next warnings остаются. Поведение аккордеона и медицинская логика не менялись. Коммит и публикация не выполнялись.

### Удаление блока со ссылкой /about, 02.11.2026 — на проверке
Удалён абзац «Как работает сравнение и какие у него ограничения» из AnalysisIntroduction и неиспользуемый импорт Link. Страница /about не менялась. Backup проверен. Client build/postbuild и lint прошли с прежними предупреждениями сборки. Публикация и коммит не выполнялись.

### Удаление вводного описания, 02.11.2026 — на проверке
Убран видимый абзац «Загрузите PDF или введите показатели вручную…» из AnalysisIntroduction и неиспользуемый импорт metadata. Meta description остаётся в конфигурации SEO. Backup проверен. Build/postbuild и lint прошли с прежними предупреждениями. Без коммита и публикации.

### Мобильный подвал в два столбца, 02.11.2026 — на проверке
Список ссылок Basement использует grid-cols-2 до 640px и прежний flex на более широких экранах. Добавлен перенос длинных ссылок и min-width:0 для элементов. Backup проверен; client build/postbuild и lint прошли с прежними предупреждениями. Визуальная проверка в мобильном браузере не выполнялась. Изменение локальное.

### Порог подвала 1024px, 02.11.2026 — на проверке
По уточнению пользователя два столбца действуют до 1024px; с 1024px используется flex. Перенос длинных ссылок также действует до lg. Backup проверен, build/postbuild и lint успешны. Визуальная проверка не выполнялась, публикации нет.

### Подвал в один столбец, 02.11.2026 — на проверке
По последнему уточнению пользователя до 1024px установлен один столбец вместо двух; с 1024px сохраняется flex. Backup проверен. Build/postbuild и lint успешны с прежними предупреждениями. Визуальная проверка не выполнялась; без публикации.

### Запрошенная публикация 02.11.2026 — заблокирован
Коммит b1be03b создан: возврат прежних текстов блоков, удаление двух вступительных абзацев, один столбец ссылок подвала до 1024px; включены накопленные обезличенные отчёты SEO. Сборка/postbuild и lint успешны, diff --check чистый. Два SSH-подключения завершились тайм-аутом до авторизации, хотя отдельная TCP-проверка порта прошла. Публикация не начата, рабочий сервер не менялся. Задачи 0007/0008 не включены. Требуется восстановить SSH-доступ, затем выполнить поставку из текущего production source с сохранением серверных отличий и backup/rollback.
