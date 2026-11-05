# GEO И SEO оптимизация — реализация этапа 1

Дата: 2026-10-26. Реализованы и опубликованы управление индексацией, canonical и lang/title/description/favicon/logo/JSON-LD по явным запросам пользователя. Коммиты кода: 551eb67 и 9fca0f9. Следующие этапы рендеринга контента/редактуры/аналитики не реализованы.

## Итоговое поведение

| URL/группа | HTTP и индексация |
|---|---|
| / | 200, без X-Robots-Tag noindex |
| /about, /contacts, /privacy-policy, /consent-personal-data (также с завершающим /) | 200, доступна SPA; метаданные исправляются следующим этапом |
| /robots.txt | 200, text/plain; допускается обход, указана sitemap |
| /sitemap.xml | 200, XML; только https://proanalize.ru/ |
| /analysis, /analysis/, /index.html | 301 на / с сохранением query |
| /result/:resultId | 200 для оболочки существующего маршрута, X-Robots-Tag: noindex |
| Шесть существующих admin маршрутов, /logout, /test | 200 для оболочки SPA, X-Robots-Tag: noindex; клиентская/серверная авторизация не меняется |
| Неизвестные URL и отсутствующие assets | 404, X-Robots-Tag: noindex; тело оболочки даёт React отрисовать текущий NotFoundPage |
| /api/* на внешнем proxy | Прежний upstream/статус/body, дополнительно X-Robots-Tag: noindex, в том числе при ошибке |
| HTTP основной/www хост | 301 на фиксированный https://proanalize.ru с сохранением URI/query |
| HTTPS www | 301 на основной HTTPS-хост с сохранением URI/query |

Внутри SPA /analysis теперь заменяется Navigate на / с сохранением search/hash и replace истории. HTTP redirect не содержит фрагмент: браузер сохраняет исходный fragment при переходе. Долгое кеширование существующих статических ресурсов сохранено.

Новая allowlist в client/nginx/client.conf должна обновляться вместе с AppContainer.tsx при добавлении маршрутов. Случайная существующая статическая .html страница не становится ещё одним индексируемым SPA URL. /index.html канонизирован на /.

## Индексация и приватность

robots.txt не запрещает обход результатов/служебных HTML: иначе робот не увидит noindex. Серверный noindex действует также на 304 и 404. Он строже общего index в HTML, который будет согласован на этапе метаданных. Это не ограничение доступа к медицинским данным; capability-модель остаётся прежней.

Sitemap намеренно содержит только главную. Другие публичные страницы сейчас имеют canonical главной, а about/contacts — шаблонный контент. Добавлять их в sitemap следует после следующих этапов. Результаты, API, admin и test в карту не включаются.

Данные, API-контракты, БД, нормативы, интерпретации и авторизация не менялись. В тестах только вымышленные result IDs, без реальных результатов, tokens и PDF. Перед работой backup локальной БД создан в игнорируемом sqlDump и проверен pg_restore --list, содержимое не публиковалось.

## Проверка

- Read-only перепроверка production перед реализацией подтвердила HTML вместо robots/sitemap, 200 на неизвестном пути, отсутствие noindex и redirect /analysis.
- До исправления добавлен regression harness: client/scripts/verify-seo-routing.py. Он запускает фактический Nginx с build клиента, внешний proxy и отдельный mock backend в выделенной сети, без БД. Порты только на loopback, временный тестовый TLS-сертификат проверяется как доверенный CA только данным скриптом. Внешние TLS-проверки не отключаются. Cleanup выполняется в finally.
- После исправления все 11 test methods с подслучаями прошли: известные/служебные/неизвестные маршруты, 404 со SPA, query redirects, robots parsing, XML sitemap, настоящие build assets, noindex на 304, host redirects HTTP/HTTPS, сохранение статусов/headers через proxy, API без SPA fallback.
- nginx -t успешен для обоих config. client npm run build и npm run lint успешны; прежние CSS optimization и chunk size warnings не исправлялись вне scope.
- Браузер на dev-клиенте: редирект с query/hash подтверждён, список/форма видны, пустая форма даёт ожидаемую ошибку. Это проверка JS-поведения; HTTP-статусы проверялись на production Nginx отдельно.
- Полный сценарий сохранения/разбора не выполнялся: API не менялся, записи/PDF не отправлялись. Backend/Python тесты не повторялись, эти слои не затронуты.
- git diff --check успешен; дампы и сборка не входят в diff. Старые untracked tasks/0007 и tasks/0008 сохранены.

Команда повторной проверки после сборки:

```bash
docker exec clientAnalysis npm run build
docker exec clientAnalysis npm run lint
python3 client/scripts/verify-seo-routing.py --dist client/dist
```

Требуются локальные Docker, образ nginx:alpine и openssl; полный production-compose не нужен. Dev Vite по-прежнему имеет dev fallback: для проверки HTTP 404/headers используется harness.

## Поставка и откат

До публикации:

1. Проверить валидность production TLS-сертификата для обоих имён: proanalize.ru и www.proanalize.ru. Redirect HTTPS происходит только после TLS handshake. Если www не покрыт, сначала решить выпуск сертификата отдельным согласованным действием. Во время read-only HTTP-проверок 19 октября HTTPS www открывался без ошибки, но это не заменяет актуальную проверку перед поставкой.
2. Сохранить предыдущий client image и proxy config. Собрать только client production image и подготовить новый nginx/default.conf. Не перезапускать backend/БД/PDF и не запускать весь compose ради SEO.
3. В рамках разрешённой поставки обновить client и proxy config; выполнить nginx -t и reload proxy. Учесть, что в compose config смонтирован файлом: после его замены убедиться, что контейнер читает именно новую версию.
4. Проверить production GET/HEAD: robots/sitemap, отсутствующий URL, публичные страницы, синтетический result URL и admin noindex, /analysis redirect с query, HTTP/www redirects, реальные assets и /api/health. Не отправлять реальные capability links в сторонние инструменты. Проверить в браузере глубокие ссылки и форму.
5. После успешной публикации отправить sitemap в инструментах вебмастеров при наличии согласованного доступа. Дождаться переобхода; сроки и позиции не гарантируются.

Откат: вернуть предыдущий client image и proxy config, nginx -t/reload, проверить HTTPS/главную/форму/API. Откат БД или down migrations не нужны. Первоначальная локальная проверка завершилась без публикации; последующая разрешённая поставка описана ниже.

## Следующие этапы

Title/description/canonical/lang/JSON-LD/logo, SSR/SSG, достоверный about/contacts, методология, медицинская редактура и поисковая аналитика остаются по plan.md. Для отсутствующего результата внутри допустимого /result/:resultId возвращается оболочка 200 с noindex: существование записи определяется API, проверка БД на уровне Nginx не добавлялась.

## Поставка на production — 2026-10-26

Пользователь явно разрешил публикацию этапа 1. TLS для proanalize.ru и www.proanalize.ru проверен с обычной валидацией сертификата, без отключения TLS-проверок.

Обнаружено, что действующий production client release b94f38614ee2 содержит более свежие изменения группового выбора показателей, dependencies и tests, отсутствующие в текущей локальной базе. Чтобы не откатить их, новый source release создан из git archive HEAD именно действующего production client, затем добавлены только SEO-файлы AppContainer/client Nginx/robots/sitemap и проверочный harness. Исходные AppContainer и proxy config перед заменой побайтово совпали с проверенной базой. Полная локальная сборка клиента на production не переносилась.

Релиз: /var/analysis/releases/seo-20261026-stage1. Новый image: analysis-client_analysis:seo-20261026-stage1. Предыдущий image закреплён как analysis-client_analysis:before-seo-20261026-stage1; прежний proxy config и private deploy diagnostics сохранены в /var/analysis/backups/seo-20261026-stage1 (каталог 0700).

Новый production-клиент собран на сервере. До переключения 27 проверок HTTP GET/HEAD прошли на candidate-контейнере, опубликованном только на loopback. Client nginx -t успешен. Новый proxy config также проверен отдельным nginx -t с существующим production сертификатом и сетью.

Новый image дополнительно помечен штатным analysis-client_analysis:latest. Выполнен точечный compose up --no-deps --no-build --pull never --force-recreate только client_analysis через действующий /var/analysis/releases/b94f38614ee2/docker-compose.yaml, project analysis. Proxy config обновлён in-place, чтобы сохранить inode bind mount; digest файла внутри nginxProxy совпал с новым конфигом. nginx -t/reload успешны. Не запускался полный compose и не выполнялась сборка backend.

31 HTTP-проверка production прошла с самого сервера и повторно с внешней локальной машины: GET/HEAD публичных/служебных/ошибочных маршрутов, noindex, robots MIME/содержимое, XML sitemap, query redirects, www/HTTP→HTTPS с валидным TLS, фактические JS/CSS assets и /api/health. Браузер подтвердил HTTP-переход /analysis?seo_probe=1#analysis на /?seo_probe=1#analysis и отображение списка/формы. Реальные результаты/PDF не открывались, сохранение не вызывалось.

ID, image ID и StartedAt backend/PostgreSQL/PDF совпали с baseline до подготовки релиза и после поставки. Эти сервисы не перезапускались; миграции и записи в БД не выполнялись. Тестовый candidate удалён. Автоматический rollback подготовлен в rollout.py, но не потребовался. Production robots/sitemap доступны, ошибки 404 и noindex проверены после публикации. Search Console/Вебмастер не подключались, sitemap вручную туда не отправлялась.

Важно для последующих поставок: действующий compose клиента по-прежнему расположен в предыдущем release и имеет старый build context; не выполнять его up --build, иначе SEO-правки будут пересобраны из старого исходника. Текущий новый source/image находятся в seo-20261026-stage1. Следующую сборку выполнять из нового согласованного source release, затем точечно переключать image. Это сохраняет существующий механизм изолированных релизов; ветки/commits production не изменялись.

Операционный rollback: восстановить proxy.conf из указанного private backup в исходный файл in-place; tag before-seo-20261026-stage1 вернуть как штатный latest; повторить точечный compose up --no-deps --no-build --pull never --force-recreate только client_analysis через прежний compose; nginx -t/reload и проверка HTTPS/главной/API. Backend/БД/PDF не трогать. Rollback выполнять только по необходимости/отдельному запросу, backup не удалять.

## Исправление canonical — 2026-10-26, локальная реализация

По отдельному запросу пользователя исправлены canonical самостоятельных публичных страниц. Сначала изменение проверено локально; затем по отдельному явному запросу закоммичено и опубликовано, результат поставки ниже.

| Публичный путь | Canonical исходного production HTML и DOM |
|---|---|
| / | https://proanalize.ru/ |
| /about | https://proanalize.ru/about |
| /contacts | https://proanalize.ru/contacts |
| /privacy-policy | https://proanalize.ru/privacy-policy |
| /consent-personal-data | https://proanalize.ru/consent-personal-data |

Для trailing slash, query и fragment выбирается указанный чистый URL. /analysis по-прежнему перенаправляется на /. На служебных страницах, результатах и 404 canonical отсутствует, вместо неверного указания главной; noindex/статусы сохранены.

### Устройство

Один список public routes/origin: client/src/shared/config/canonical-pages.json. После npm run build автоматически запускается postbuild scripts/generate-page-html.mjs: из общего Vite index формирует root HTML с canonical, _pages/<page>.html с собственными тегами и _spa.html без canonical для служебных путей/ошибок. Основной текст приложения ещё не отрендерен сервером: это только генерация head, не реализация SSR/SSG контента.

Client Nginx выбирает нужный HTML по публичному пути. Вспомогательные HTML нельзя получить как дополнительные индексируемые URL: прямые /_pages/* и /_spa.html дают 404/noindex. JS/CSS общие, с прежними путями и кешированием. При добавлении новых публичных страниц требуется согласовать JSON routes, React Router и allowlist Nginx.

usePageCanonical/getCanonicalUrl обновляют ровно один тег при SPA-переходах, удаляют дубли и убирают canonical на непубличном пути. Origin фиксирован production-доменом, private result IDs никогда не используются для формирования canonical. В dev HTML шаблоне статический canonical удалён, поэтому до JS нет ложного указания на главную; после mount hook задаёт нужный тег. Для проверки исходного production HTML использовать Nginx harness: Vite dev/preview не воспроизводит серверную маршрутизацию production оболочек.

Общие hreflang ru/x-default на главную удалены: они избыточны для текущего одноязычного сайта и на самостоятельных страницах создавали неверную связь с главной. Lang, title, description, JSON-LD, favicon и контент в этой части не исправлялись. Sitemap не расширяется до редакционной проверки страниц; текущий root canonical с ней согласован.

### Проверка и ограничения

- До исправления новые HTTP regression cases воспроизвели неверные canonical исходного HTML на публичных/служебных/ошибочных URL.
- Build с postbuild и client lint успешны, прежние CSS/chunk warnings сохранены. Миграции/изменения БД отсутствуют; перед работой создан и проверен свежий локальный backup в игнорируемом sqlDump.
- Все 13 групп Nginx HTTP regression checks прошли, включая предыдущие robots/sitemap/noindex/redirect/status/API/assets и новые canonical по каждому публичному пути, query и завершающему /. Проверено отсутствие canonical на служебных/404 и недоступность вспомогательных HTML.
- В браузере DOM на /about с query/hash содержит ровно canonical /about; переход по React Link на privacy-policy обновляет его без полной загрузки; Back восстанавливает /about; /test не имеет canonical. Параметры не попадают в href. Данные анализов не вводились/не читались.
- git diff --check успешен. Изменения предыдущего этапа и старые задачи сохранены. Runtime API/БД/медицинская логика не менялись.

### Следующая поставка/откат

Для публикации собрать новый client image на базе действующего production SEO-release, сохранив более свежие production изменения, и добавить hook/config/generator, package postbuild, обновлённые index/AppContainer/client Nginx. Не переносить целиком старый локальный package.json поверх более свежего production: добавить только postbuild. Проверить, что npm run build создал все оболочки, и прогнать HTTP harness до переключения. Внешний proxy не требует новых изменений.

Build и client Nginx поставляются вместе: новая конфигурация требует _spa.html и _pages/*.html. Rollback — предыдущий цельный client image, затем reload proxy для обновления адреса upstream при необходимости; backend/БД не трогать. Текущая локальная реализация сама по себе не является публикацией. Перед очередной поставкой отдельно проверить прямые HTTP canonical на production и SPA-навигацию после обновления.

## Canonical: коммит и поставка — 2026-10-26

Код SEO и документы задачи 0009 включены в коммит 551eb67 — fix(seo): configure indexing and page-specific canonical URLs. Задачи 0007/0008, игнорируемые секреты, дампы и generated artifacts в коммит не включались. После поставки её результаты оформлены отдельным документационным коммитом.

Перед сборкой проверено совпадение текущего running client image с предыдущим SEO-stage1 image. Новый source release /var/analysis/releases/seo-canonical-551eb67 скопирован из действующего /var/analysis/releases/seo-20261026-stage1/client с добавлением canonical-файлов из коммита. В более свежий production package.json добавлен только postbuild; dependencies и другие production-изменения сохранены.

Новый образ analysis-client_analysis:seo-canonical-551eb67 собран на сервере. Его фактические HTML/assets извлечены в изолированный release для regression harness: client nginx -t и все 13 HTTP test methods с подслучаями успешны до публикации. Тестовые контейнеры/сеть удалены.

Предыдущий образ сохранён как analysis-client_analysis:before-seo-canonical-551eb67, image ID и proxy config — в /var/analysis/backups/seo-canonical-551eb67 (0700). Новый образ помечен штатным latest; точечно пересоздан только client_analysis через действующий compose project analysis с --no-deps --no-build --pull never. Внешний proxy config не менялся, выполнены nginx -t/reload для обновления upstream DNS после смены client container.

После переключения на сервере и повторно извне прошли 31 HTTP check этапа 1 и 24 проверки canonical исходного HTML: 5 публичных страниц, trailing slash/query, отсутствие canonical для noindex/404/вспомогательных оболочек. На production браузер подтвердил один canonical /about при query/hash, обновление на /privacy-policy при React Link и восстановление /about при Back.

Идентичность, image ID и StartedAt backend/PostgreSQL/PDF/proxy совпали с baseline перед подготовкой релиза; эти контейнеры не пересоздавались и не перезапускались. Proxy получил только reload. Медицинские данные не читались/не создавались, миграции не выполнялись. Автоматический rollback подготовлен, но не потребовался.

Rollback canonical: вернуть before-seo-canonical-551eb67 как latest, точечно пересоздать только client_analysis через действующий compose без build/deps/pull и nginx -t/reload. Если потребуется, сохранён также прежний proxy config; в этой поставке он не менялся. Перед rollback проверить отсутствие последующих пользовательских поставок. Backend/БД/PDF не трогать.

Как и при первой поставке, compose label у клиента относится к прежнему manifest с прежним build context. Для будущей сборки использовать актуальный source seo-canonical-551eb67 либо новый согласованный Git release, не запускать --build из старого manifest. Git push в рамках публикации не выполнялся: клиент доставлен проверенным образом из отдельного source release.

## Lang, title/description, favicon/logo и JSON-LD — реализация 2026-10-26

Выполнен отдельный пункт по запросу пользователя. Сначала проверен локально, затем по отдельному разрешению закоммичен и опубликован; результат поставки приведён ниже.

### Итог

- lang=ru в HTML и DOM. Для 5 публичных страниц заданы собственные title/description, совпадающие до и после JavaScript. Главная: «Расшифровка анализов онлайн — Проанализируй»; описание объясняет PDF/ручной ввод и сравнение с референсами, прямо указывает справочный характер без диагноза.
- Для 8 служебных маршрутов, результата и 404 также подготовлены нейтральные route-specific title/description. Ни значения анализов, ни имена пользователей, ни resultId не используются в metadata/JSON-LD. Служебные страницы остаются noindex без canonical и JSON-LD.
- Удалены конкурирующие useDocumentTitle на страницах и сам устаревший hook; H1/тексты страниц не менялись. Head управляется централизованно по pathname, включая Back/SPA-переходы, без сброса title на «Загрузите анализы».
- Удалены прежние MedicalWebPage/MedicalDiagnostics/aspect и обещание «точной диагностики». Публичная JSON-LD — единый graph Organization, WebSite и соответствующая WebPage/AboutPage/ContactPage. URL/name/description/inLanguage страницы совпадают с её canonical/title/meta description, @id стабильны и связаны внутри графа. Нет вымышленных врачей, квалификации, рейтингов, адресов или медицинских гарантий.
- Organization.logo исправлен с несуществующего /public/pa.svg на https://proanalize.ru/pa.svg. Favicon использует тот же SVG, type=image/svg+xml и sizes=any; файл не перерисовывался. На момент начала этой части production /pa.svg уже отвечал 200, а /public/pa.svg — 404: правка касается ошибочного URL разметки, а не изменения изображения или отключения защиты.

### Устройство и файлы

Единый config: client/src/shared/config/page-metadata.json. Общий engine client/src/shared/lib/seo/page-metadata.mjs применяется в postbuild и браузере, декларация .d.mts обеспечивает TypeScript-контракт. canonical.ts теперь делегирует тому же engine, сохраняя public allowlist из canonical-pages.json. Новых dependencies нет.

Генератор scripts/generate-page-html.mjs формирует те же public HTML-оболочки, дополнительные оболочки известных служебных страниц, _result.html и _spa.html для 404. Client Nginx выбирает соответствующую оболочку; CSS/JS общие. Служебные файлы не становятся самостоятельными публичными URL, статус/noindex сохраняются. Основной контент ещё рендерится React: это не SSR контента.

usePageMetadata устанавливает title/description/lang/favicon и единственный JSON-LD script, убирает дубли и удаляет graph на служебном/неизвестном пути. Query/hash не входят в metadata. Vite dev transformIndexHtml использует тот же engine, поэтому исходный HTML dev-сервера также соответствует DOM. Vite preview не заменяет production Nginx-проверки маршрутов.

### Проверка

- До исправления добавлены regression tests на язык, title/description, JSON-LD и favicon; исходные metadata/schema ошибки воспроизведены. Старые canonical/routing tests продолжили проходить.
- Client build/postbuild и lint успешны. В ходе реализации устранено новое предупреждение о разных JSON import attributes; остались только прежние CSS optimization/chunk size warnings.
- Все 16 групп HTTP test methods с подслучаями прошли на изолированном Nginx с dist/config, затем на отдельно собранном финальном Nginx runtime-слое с теми же COPY из dist. Во втором случае HTML/config не монтировались поверх image: проверены фактическая упаковка и доступ nginx worker к SVG. Runtime image собран только из публичного dist/config, без env/секретов в build context, и удалён после тестов. Это проверка финального runtime-слоя; полный повторный npm ci/Docker builder не запускался, TypeScript/Vite build выполнен отдельно выше.
- В harness проверяются source title/description, lang, JSON parsing/graph consistency, page URL/type/name/description, logo URL, отсутствие obsolete properties/диагностического обещания, GET SVG с правильным MIME и viewBox, прежние canonical/robots/sitemap/noindex/404/redirect/API/assets. Неверный JSON-LD не подменяется фикстурами. Внешний Schema.org/Rich Results validator не вызывался, eligibility расширенного результата не заявляется.
- Raw HTML Vite dev на всех 5 публичных страницах совпал с config до JS. В браузере на всех 5 страницах совпали lang/title/description/schema; SPA-переход на policy, Back, /test и 404 не дали дубликатов/старых metadata. Служебные страницы не содержат JSON-LD. Формы/анализы не отправлялись.
- Свежий локальный backup создан и проверен до изменений, БД/API/медицинская логика не менялись. git diff --check успешен, старые untracked 0007/0008 сохранены.

Опциональная проверка готового runtime image:

```bash
python3 client/scripts/verify-seo-routing.py --dist client/dist --client-image IMAGE_TAG
```

Без --client-image harness использует nginx:alpine с mounts dist/config. В обоих режимах proxy/API mocks находятся в отдельной сети без БД, порты опубликованы только на loopback, временные контейнеры/сеть удаляются.

### Ограничения и следующая поставка

Видимые about/contacts и тексты политики остаются прежними: достоверные сведения о проекте и редакционная/правовая проверка — отдельные пункты, metadata не должны считаться их подтверждением. Sitemap пока не расширялся. SSR, медицинский контент, вебмастеры и CWV не затрагивались.

При разрешённой публикации сохранить актуальные production изменения и dependencies, добавить metadata engine/config/type declarations/hook, генератор, шаблон, Vite config и обновлённый client Nginx. Удалить page-level useDocumentTitle imports/calls и файл hook, не откатывая другие изменения страниц production. Текущие production образы содержат более свежую групповую выборку: нельзя без проверки заменять весь production client устаревшей локальной копией. Проверить final build/image и всю HTTP-матрицу до переключения. Client HTML и Nginx поставляются вместе: новый config требует дополнительных служебных оболочек. Внешний proxy/БД не нуждаются в правках.

После публикации проверить source и DOM главной/самостоятельных/служебных/404 страниц, SVG, schema URLs и отсутствие обещания диагностики. Откат — предыдущий цельный client image и reload proxy для DNS при смене client container; backend/БД/PDF не трогать. Первоначальная локальная проверка завершилась без публикации; последующая разрешённая поставка описана ниже.

Источники: [Schema.org WebPage](https://schema.org/WebPage), [Google Organization](https://developers.google.com/search/docs/appearance/structured-data/organization), [Google favicon](https://developers.google.com/search/docs/appearance/favicon-in-search), [Vite transformIndexHtml](https://vite.dev/guide/api-plugin.html#transformindexhtml).

## Метаданные: коммит и production-поставка — 2026-10-26

Пользователь явно разрешил коммит и публикацию. Коммит 9fca0f9 — fix(seo): unify page metadata and structured data, без задач 0007/0008, secrets, дампов и generated artifacts. Результаты поставки записаны следующим документационным коммитом.

Перед сборкой running client image совпал с действующим canonical-release. Все изменяемые существующие source files проверены по SHA-256 на совпадение с родительской версией коммита; не было перезаписи неизвестных production-правок. Новый source /var/analysis/releases/seo-metadata-9fca0f9 подготовлен из /var/analysis/releases/seo-canonical-551eb67/client; файлы взяты строго из git show коммита, устаревший useDocumentTitle удалён. Более свежие production package/dependencies и групповая выборка сохранены.

Новый image analysis-client_analysis:seo-metadata-9fca0f9 собран на сервере. До переключения на фактическом image (без mounts поверх HTML/config) прошли nginx -t и все 16 HTTP test methods с подслучаями. Тестовые контейнеры/сеть удалены. Предыдущий image сохранён как analysis-client_analysis:before-seo-metadata-9fca0f9; image ID/proxy config/private diagnostics — в /var/analysis/backups/seo-metadata-9fca0f9 (0700).

Новый image помечен штатным latest, точечно пересоздан только client_analysis через действующий project analysis/compose b94f38614ee2 с --no-deps --no-build --pull never. Внешний proxy config не менялся, nginx -t/reload выполнены для обновления upstream DNS. Автоматический rollback подготовлен в rollout.py, не потребовался.

После поставки прошли 31 HTTP check этапа 1, 24 canonical source checks и 21 metadata/schema/icon check (76 всего) с сервера и повторно извне. Проверены GET/HEAD SVG (200, image/svg+xml, валидный SVG), метаданные публичных и служебных маршрутов, JSON-LD/URL/logo, отсутствие обещания диагностики, прежние redirects/noindex/404/API/assets. В браузере production на всех 5 public pages title/description/lang/favicon/schema согласованы; SPA-переход на policy, Back, /test и 404 также проверены. Внешний Rich Results/Schema.org валидатор не запускался, расширенные результаты не обещаются.

ID/image/StartedAt backend/PostgreSQL/PDF/proxy совпали с baseline перед сборкой и после поставки. Backend/БД/PDF не перезапускались, proxy получил только reload. Данные анализов не читались/не создавались, миграции и медицинская логика не менялись.

Rollback: before-seo-metadata-9fca0f9 вернуть как latest, точечно пересоздать только client_analysis через прежний manifest без build/deps/pull, nginx -t/reload и проверка HTTPS/главной/API. Proxy config сохранён, но в этой поставке не менялся; перед rollback учитывать последующие пользовательские релизы. БД/backend/PDF не трогать.

Текущий актуальный source — seo-metadata-9fca0f9. Прежний compose manifest всё ещё имеет старый build context: для следующей сборки использовать актуальный source/new согласованный Git release, не выполнять --build из старого manifest. Git push в origin не выполнялся: публикация сделана проверенным client image из отдельного source release. Локальные документы задач 0007/0008 оставлены вне SEO-коммитов.

## Рендеринг публичного контента — локально, 2026-10-26

Реализован этап build-time prerender/SSG для пяти публичных страниц: /, /about, /contacts, /privacy-policy, /consent-personal-data. На рабочий сервер эта часть не опубликована, коммит не создавался.

### Поведение

Исходный HTML теперь содержит реальное содержимое React-страниц: H1/описания, категории и названия показателей, текст документов, публичные ссылки. Это тот же AppContainer и те же компоненты, которые используются браузером; отдельной версии для роботов и проверки User-Agent нет. На главной видимым абзацем показано уже согласованное описание из metadata config, без новых медицинских интерпретаций.

React гидратирует публичный HTML через hydrateRoot. Форма, авторизационная часть навигации, модальные окна и cookie-блок подключаются через ClientOnly/useSyncExternalStore после первого согласованного прохода hydration. До JavaScript доступны текст и ссылки; вместо формы — сообщение о необходимости JS. ClientOnly также изолирует Suspense переводов: ожидание i18n не должно скрывать публичное содержимое.

Результаты, admin, logout/test и 404 не пререндерятся: остаются пустые CSR-оболочки, прежние noindex/status/metadata сохранены. Персональные значения, tokens, результатные ссылки и Redux state не сериализуются. Загрузка справочников и PDF по-прежнему происходит в браузере через существующие API после подключения формы.

Публичные аккордеоны используют native details/summary, поэтому раскрытие доступно без скриптов и с клавиатуры. Для списка с multiple=false используется нативная группировка name. В footer добавлены обычные ссылки «О проекте» и «Контакты». Тексты about/contacts остались прежними шаблонами: их достоверность и редактура по-прежнему отдельная задача, особенно перед расширением sitemap/продвижением.

### Устройство

- src/entry-server.tsx: renderPublicPage со строгой allowlist и новым пустым Redux store для каждой страницы, StaticRouter/InfoModalProvider. Используется React renderToString для синхронного статического контента, без ожидания данных.
- shared/store/index.ts: factory createAppStore; обычный browser singleton сохранён. Новых persisted/preloaded данных нет.
- AnalysisPage разделён на статический AnalysisIntroduction и прежний AnalysisForm. Обработчики формы/Redux actions/валидация перенесены без изменения алгоритма. Форму не разбивали на отдельный dynamic chunk: пробный lazy-вариант создал предупреждения циклических chunks существующих barrels, поэтому от него отказались.
- PublicNavigation и publicNavigationItems разделяют существующие гостевые пункты с Navigation. Logo tooltip стал статическим русским текстом и больше не требует i18n для SSR. LocalStorage чтение cookie-выбора осталось внутри browser-only компонента.
- postbuild собирает Vite SSR bundle в .prerender вне dist, затем generator добавляет body только public paths. Root получает data-prerendered=true; main.tsx выбирает hydrateRoot либо createRoot для CSR-only оболочек. .prerender игнорируется Git, runtime Dockerfile по-прежнему копирует только dist и Nginx config, Node runtime не добавлялся.
- Generator запрещает fetch/http/https обращения до импорта SSR entry и не использует API/БД. Повторный запуск на уже заполненном HTML отклоняется до записи, чтобы публичный body нельзя было случайно размножить на служебные пути; повторять нужно полную npm run build.
- Dev HTML plugin использует тот же entry через ssrLoadModule; типы/metadata/canonical предыдущих этапов сохранены.

### Исправление обнаруженной HTML-проблемы

Браузерная проверка выявила hydration mismatch в прежней политике: девять внешних p содержали ul либо вложенный p. Заменены только эти контейнеры на div с сохранением отступов; слова/ссылки/юридические утверждения не редактировались. Добавлен AST regression check для блоков внутри p. После правки все пять public pages гидратируются без отмеченных React hydration errors. Предупреждения не подавлялись, fallback на принудительный CSR вместо исправления не применялся.

### Проверки

- До реализации HTTP regression test воспроизвёл отсутствие H1/body на всех пяти public paths.
- Client build/postbuild и lint успешны. Остались только прежние CSS optimization/chunk size warnings. Новые JSON import/circular chunk warnings устранены.
- scripts/verify-public-render.mjs: строгая public allowlist, отказ private/unknown/query paths, детерминированный повторный render, отсутствие browser file input при build, запрет сети, проверка валидной вложенности документов; повторная генерация готового HTML отказывается и не меняет artifacts.
- 18 HTTP test methods с подслучаями успешны на dist/config и повторно на отдельном собранном Nginx runtime image. Проверены исходные H1/текст/ссылки/native details без JS, отсутствие prerender у private/service/error, недоступность server bundle, все прежние metadata/schema/canonical/robots/sitemap/noindex/redirect/API/assets cases. nginx -t успешен, runtime не содержит .prerender или node_modules.
- Финальный runtime-слой проверен из публичного dist/config без env/секретов в build context; полный повторный Docker npm ci не запускался, обычный tsc/Vite и SSR build прошли отдельно. Временные image/network/containers удалены.
- В браузере на всех 5 public pages проверены data-prerendered, один H1 и отсутствие hydration errors после исправления политики. На главной форма появляется вместо placeholder, пустая отправка показывает ожидаемую ошибку до сохранения. SPA-переход в about и Back сохраняют единственный H1 и возвращают рабочую форму.
- Дополнительно тестировалась временная копия фактического SSG HTML с удалёнными script tags (это не переключение глобального JS setting браузера): script count=0, содержимое читается, details открывается мышью и закрывается Enter, ссылка about открывает статическую страницу без скриптов. Desktop viewport 1365×900 и mobile 390×844: горизонтального переполнения не обнаружено. Viewport override сброшен. Скриншот mobile-проверки сохранён вне Git.
- Локальный POST /result/fromFile на одном синтетическом одностраничном PDF без медицинских значений вернул ожидаемое отсутствие findings; агрегированные количества сохранённых результатов/точек до и после совпали. UI file chooser upload и сохранение результата не выполнялись; реальные PDF/значения не использовались. Backend/Python код не менялся.
- Перед изменениями создан и проверен локальный backup в игнорируемом sqlDump. Схема/данные БД не менялись. git diff --check успешен, build/server bundles/dumps не входят в diff, старые untracked 0007/0008 сохранены.

Повторная проверка:

```bash
docker exec clientAnalysis npm run build
docker exec clientAnalysis npm run lint
docker exec clientAnalysis node scripts/verify-public-render.mjs
python3 client/scripts/verify-seo-routing.py --dist client/dist
```

### Поставка, откат и ограничения

Для следующей разрешённой публикации исходить из актуального production metadata-release, сохранить его дополнительные изменения группового выбора/dependencies. Добавить SSG entry/ClientOnly/разделение формы/navigation/native accordion/footer, перенести только структурную правку политики и обновить postbuild, main, generator, store factory и Vite config. Не перезаписывать старой локальной копией более свежие production компоненты группового выбора. Полная production сборка должна создать .prerender в builder и заполненный public dist; runtime по-прежнему только Nginx. Backend/БД/PDF перезапускать не требуется.

После поставки проверить raw body и DOM всех public paths, console hydration errors, работоспособность формы и публичной навигации; повторить private/noindex/404/metadata проверки. Откат — предыдущий цельный client image, nginx -t/reload для обновления upstream после смены контейнера. Изменений БД/down нет.

SSG обновляет публичный текст при сборке, динамические справочники остаются client-side. Полевые CWV/CrUX/Lighthouse не измерялись: улучшение ранжирования/скорости/CLS не заявляется. Существующие шаблоны контактов/описания проекта и фактическая точность текстов политики требуют отдельной редакционной проверки. Рендеринг не исправляет автоматически их содержание, нормативы или медицинские алгоритмы. Публикация и коммит этой части пока не выполнялись.

Источники: [React renderToString](https://react.dev/reference/react-dom/server/renderToString), [React hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot), [Vite SSG/SSR](https://vite.dev/guide/ssr.html#pre-rendering-ssg).

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

## Public rendering production deployment - 2026-10-26

Status: accepted after automated and browser verification. User explicitly authorized commit and deployment. Code commit: a412aa4 (feat(seo): prerender public pages with stable initial styles).

Current production source: /var/analysis/releases/seo-render-a412aa4/client. Current image: analysis-client_analysis:seo-render-a412aa4, also tagged latest. Built from the previous metadata production source, applying the committed client patch. Initial check rejected package.json and AnalysisPointGroupSelect differences without changing the running site. The compatible patch was checked/applied; only postbuild and SSR compatibility (useId, portal guard, non-suspending translations) were transferred into these two divergent files. Production dependencies/package-lock and Redux group selection logic were preserved and verified.

Backup: /var/analysis/backups/seo-render-a412aa4 (0700), including previous image identity, proxy config and private build/rollout diagnostics. Rollback image: analysis-client_analysis:before-seo-render-a412aa4. No secrets or medical data included in Git or task artifacts.

Candidate: full Docker client build passed. The actual runtime image passed nginx -t and all 18 isolated Nginx routing/rendering/metadata test groups. Runtime has no prerender bundle or node_modules. Only client_analysis was recreated using the existing analysis compose manifest with --no-deps --no-build --pull never; external proxy received nginx -t/reload for upstream DNS. Original backend/PostgreSQL/PDF/proxy IDs, images and StartedAt remained unchanged through preparation and rollout. No database operations or result saves were performed.

After rollout, 86 HTTPS checks passed both from the server and externally: 9 rendering/isolation, 32 HTTP/HEAD/routes/assets/API, 24 canonical and 21 metadata/schema/icon checks. Browser: all five public paths have a prerender marker, one H1, loaded built CSS and 20px header icons, with no console errors/hydration failures. Native accordion, SPA navigation and Back to the form passed; no horizontal overflow at the tested desktop width. Field CWV/CLS, slow-network and real PDF/save flows were not measured in this deployment.

Rollback: first confirm no subsequent release; tag before-seo-render-a412aa4 as latest, recreate only client_analysis through /var/analysis/releases/b94f38614ee2/docker-compose.yaml with project analysis and --no-deps --no-build --pull never --force-recreate, then nginx -t/reload in nginxProxy and rerun HTTPS checks. Do not rebuild from that older compose build context. Future builds must start from the current seo-render source to retain production-only improvements. Backend/database/PDF need no restart or rollback.

Git push was not performed; publication used the verified image from the isolated release. Local tasks 0007/0008 remain untracked and excluded.

## Этап 3 — доверие и методология, локально 26.10.2026

Подготовлены содержательные /about и /contacts с обычными ссылками из header и главной, без нового маршрута или API. Методология опирается на AnalysisResultService, unitConversion/reference-normalization.ts, ParseFileService, Python MAX_PAGES/MAX_FILE_SIZE и AgeInDaysSelector. Дата на странице — дата технической сверки, не медицинской рецензии. Общие сведения о различии лабораторных референсов и ограниченности одного результата сверены с https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/; эта публикация не объявляется источником значений в БД.

Заменены шаблонные реквизиты и неподтверждённые продуктовые обещания. Используется уже публичный адрес из footer, новый контакт не придуман. Библиография интервалов, авторы/рецензенты и квалификация не вымышлены, их отсутствие в публикации обозначено. Обновлены только descriptions двух страниц, existing JSON-LD остаётся без вымышленных author/reviewedBy/dateReviewed.

В политике и согласии исправлены утверждения о реализации: нет application-level шифрования значений, автоматического TTL30, гарантированной анонимности capability-ссылки; PDF обрабатывается на сервере, cookie аналитики возможны после согласия. Нельзя обещать непередачу URL результатов в Метрику при текущем tracking. Новую аналитику и обработку данных не добавляли. Остальные юридические положения и реквизиты оператора не считаются согласованными этим изменением; перед публикацией требуется содержательное согласование владельца. Сбор источников и медицинская рецензия остаются открытыми.

Build/lint, SSR checks без сети и 18 групп HTTP Nginx проходят. Regression подтверждён на предыдущей сборке и исправленной. Браузерные проверки контента/ссылок/canonical/hydration успешны. Миграции и медицинская логика не затронуты. Изменения пока локальные; при следующей поставке стартовать от seo-render-a412aa4, сохраняя production dependencies и group selector. Откат — прежний цельный клиентский image, без БД.

### Уточнение 26.10.2026
На основании прямого ответа пользователя добавлен подтверждённый автор/владелец на /about и /contacts, текущий публичный mailbox подтверждён. Новые квалификации/рецензенты не заявлены; оговорка об отсутствии подтверждённых источников и медицинского рецензирования сохранена. Regression проверяет видимое имя автора в обеих страницах.

## Поставка этапа 3 — 26.10.2026

Код 6df6e23 опубликован из /var/analysis/releases/seo-trust-6df6e23/client; current image analysis-client_analysis:seo-trust-6df6e23. Релиз основан на seo-render-a412aa4 с побайтовой проверкой каждого заменяемого source-файла относительно parent-коммита; более свежие production dependencies и group selector сохранены. Build, проверка фактического HTML кандидата, nginx -t и 18 групп Nginx harness успешны. После публикации 91 проверка HTTPS с сервера и извне и browser about/contacts/SPA/Back без ошибок. Backend/БД/PDF не перезапускались, proxy только reload.

Backup /var/analysis/backups/seo-trust-6df6e23, previous image analysis-client_analysis:before-seo-trust-6df6e23. Rollback после проверки отсутствия следующего релиза: пометить previous image как analysis-client_analysis:latest, точечно recreate client_analysis с project analysis через /var/analysis/releases/b94f38614ee2/docker-compose.yaml и --no-deps --no-build --pull never --force-recreate; nginx -t/reload в nginxProxy, повторить HTTPS-проверки. Не собирать из старого compose build context. Будущие сборки начинать от seo-trust-6df6e23 source; БД/down не требуются.

Владельцем подтверждены только авторство/владение и публичный контакт. Источники интервалов, медицинское рецензирование и полное юридическое согласование остаются открытыми; в опубликованном контенте они не вымышлены. Данные анализов и контакты пользователей не выгружались. Push в origin не выполнялся; поставлен проверенный client image.

## Этап 5 — измерения, 28.10.2026

Публичный baseline сохранён в baseline-20261028.json. Это снимок действующего production до отключения collector: пять canonical страниц отвечают 200, один H1/SSG/CSS присутствуют, sitemap 200 содержит только главную. HTTP elapsed 365–465 мс в этом запуске — время одного сетевого запроса, не LCP/INP/CLS и не доказательство качества CWV. PSI API mobile/desktop вернул HTTP 429; лабораторные и полевые показатели не получены, а не равны нулю. Новые попытки PSI не повторять до снятия квоты/доступа к инструменту. Скрипт measure-seo-baseline.py обращается только к фиксированным публичным URL и PSI канонической главной, сохраняет только выбранные агрегаты; --skip-performance нужен для HTTP-проверки без повторного PSI-запроса.

Google Search Console/Яндекс Вебмастер не проверены: доступных коннекторов нет, CUA сообщил отключённый браузер в настройках Work. Sitemap через кабинеты не отправлен. robots.txt уже сообщает URL sitemap, но это не подтверждение успешного приёма в кабинетах. Не использовать site:-поиск для числа проиндексированных страниц.

После открытия доступа выбрать подтверждённый ресурс proanalize.ru, не создавать новый доступ и не публиковать verification tokens без согласования. Проверить имеющуюся запись sitemap; если отсутствует, отправить https://proanalize.ru/sitemap.xml, записать дату/статус/последнее чтение и число обнаруженных URL. Не обещать индексацию. Текущий sitemap содержит одну страницу сознательно; расширение требует отдельной редакционной проверки, оно не делается ради количества URL.

Baseline владельца: последний полный доступный день D; окно D-27..D и предыдущее D-55..D-28 с одинаковыми фильтрами/часовым поясом источника. Снять по каждому источнику клики, показы, CTR, среднюю позицию, индексируемые/исключённые страницы и причины. Страницы фильтровать точным allowlist из canonical-pages.json. Не выгружать result/admin/API/404, query/hash и полные личные ссылки; поисковые фразы перед сохранением обезличить, персональные запросы исключить. Разницу Google/Яндекс и суммы строк/общего отчёта не считать ошибкой автоматически. Сохранять только публичные URL и агрегаты, без cookies/account email/token/данных посетителей.

CWV: отдельно mobile/desktop, URL-level и origin-level, период/coverage/no-data. Полевые p75 LCP/INP/CLS брать из отчёта CWV/CrUX, Lighthouse хранить отдельно с версией и настройками. При недоступности/недостатке данных фиксировать null и причину, не «passed». Свежую поставку 26–28 октября не оценивать причинно по длинному окну до неё. Повтор через сопоставимое полное окно после поставки, без гарантий позиций/цитирования. Автоматический мониторинг не создавался.

AI referral: пока нет безопасного источника, count=null/status=unavailable. Будущая схема может сохранять только агрегированную категорию разрешённого источника и canonical публичную посадочную страницу; не полные referrer/query/hash/промпты, не пользовательские ID. Such referrals measure detected visits, not all AI citations/answers; direct/unknown не переназначать ИИ. Сейчас никакая новая телеметрия не включается.

Устранение риска: удалён inline collector с location.href/document.referrer и webvisor/trackHash/clickmap/ecommerce/trackLinks. Consent banner не монтируется, legacy accept_ym не запускает collector, тип и вызов initYM удалены. Документы явно сообщают, что статистика сейчас отключена и прошлые условия Метрики не действуют для этой версии; ранее переданные сведения не удаляются этим изменением. Новых API/cookies/таблиц/идентификаторов не добавлено. Публичное измерение и отчёты поисковых систем не требуют возвращать session replay.

Проверки: build/lint, SSR без сети, 18 групп Nginx, build-scan всех HTML/JS на collector; 3 синтетических Python-теста (redaction неизвестного canonical, PSI429 не превращается в score0, сохранение только выбранных PSI агрегатов). Браузерный smoke/полевой CLS не выполнены из-за Work settings, это не подменено VM-тестами.

Источники методики (проверены 28.10.2026): https://support.google.com/webmasters/answer/7451001?hl=ru — отправка sitemap; https://support.google.com/webmasters/answer/7576553?hl=ru — Search Console performance; https://yandex.ru/support/webmaster/ru/indexing-options/sitemap — sitemap; https://yandex.ru/support/webmaster/ru/service/stat-all-pages — статистика; https://web.dev/articles/vitals?hl=ru — CWV; https://developers.google.com/speed/docs/insights/v5/get-started — PSI. Документация https://yandex.ru/support/metrica/ru/code/counter-initialize и https://yandex.ru/support/metrica/ru/code/counter-spa-setup подтверждает необходимость контроля URL/referrer. Это ссылки на документацию, не результаты измерения сайта.

### Фактическая поставка этапа 5: не выполнена, 28.10.2026
Commit 0e5cc67 подготовлен и проверен локально. SSH дважды недоступен (connection_timeout); никакой remote mutation не выполнен. Состояние опубликованного клиента не менялось — аналитика на production по baseline ещё включена. Нельзя утверждать, что приватность production уже исправлена.

Продолжение после восстановления SSH: подтвердить running image и source последнего действующего релиза, выполнить hash/patch-check, создать отдельный backup текущего client image/proxy config и source release от актуальной production-базы; сохранить её package-lock/dependencies/group selector. Собрать и проверить статический client image (nginx -t, 18 routing/render groups и отсутствие collector во всех runtime HTML/JS). Переключить только client_analysis через текущий compose без build/deps/pull, nginx -t/reload внешнего proxy, повторить публичные проверки и HTTP-only baseline. При провале вернуть сохранённый предыдущий image, recreate только клиента/reload proxy; БД не трогать. Браузерный smoke и доступ к кабинетам всё ещё требуются.

### Возврат прежних текстов, 02.11.2026
По прямому запросу пользователя восстановлены заголовки и содержимое трёх блоков из dede6ef в accordion.data.tsx. Файл совпадает с исторической версией. Client build/postbuild и lint успешны; изменения локальные, без публикации. API, схема и данные БД не менялись. Содержание восстановлено как прежний маркетинговый текст, без новой проверки его утверждений о приватности или референсах.

### Удаление ссылки из вступления, 02.11.2026
По запросу пользователя удалён отдельный абзац со ссылкой на /about в AnalysisIntroduction.tsx. Остальной контент и маршрут /about сохраняются. Build/postbuild и lint успешны. Изменение локальное.

### Удаление вводного описания, 02.11.2026
Из AnalysisIntroduction удалён абзац с текстом description и импорт metadata. SEO-метаданные не менялись. Client build/postbuild и lint успешны; изменение локальное, без изменений API/БД.

### Адаптивный подвал, 02.11.2026
На мобильных экранах (<640px) ссылки Basement расположены в двух равных столбцах CSS Grid. Длинные ссылки могут переноситься внутри слова; начиная с sm используется flex. Build/postbuild и lint успешны; визуальная проверка устройства не выполнялась. БД/API не менялись, публикации нет.

Уточнение 02.11.2026: по запросу пользователя порог подвала изменён с sm на lg (1024px), включая перенос длинных ссылок. Build/postbuild и lint успешны.

Уточнение 02.11.2026: последнее пожелание пользователя заменяет два столбца одним до 1024px (grid-cols-1); начиная с lg сохраняется flex. Build/postbuild и lint успешны. Изменения локальные.

### Публикация изменений главной и подвала, 02.11.2026
Релиз ui-b1be03b: /var/analysis/releases/ui-b1be03b/client; image analysis-client_analysis:ui-b1be03b (latest). Основа — текущий production seo-trust-6df6e23. Три изменённых source-файла проверены по хешам относительно исходной версии и заменены файлами из b1be03b. Production dependencies, package-lock и другая логика сохранены. Коммит 0e5cc67 не поставлялся.

Backup /var/analysis/backups/ui-b1be03b (0700), rollback image analysis-client_analysis:before-ui-b1be03b. Поставлен только клиент через действующий compose project analysis, manifest /var/analysis/releases/b94f38614ee2/docker-compose.yaml, с --no-deps --no-build --pull never --force-recreate. Собирать из старого compose context нельзя. nginxProxy получил nginx -t/reload. Backend/БД/PDF не менялись и не перезапускались.

Кандидат: nginx -t, новые/удалённые тексты, grid-cols-1 lg:flex, canonical, prerender успешны. После поставки 91 HTTPS-проверка из существующего harness успешна; дополнительно извне проверены пять публичных страниц, тексты и CSS подвала. Проверка мобильного устройства не выполнялась. Откат после проверки отсутствия более нового релиза: вернуть before-ui-b1be03b как latest, точечно пересоздать только client_analysis указанным compose без build/deps/pull, nginx -t/reload и повторить HTTPS-проверки.

### Метаданные главной, 05.11.2026
В page-metadata.json установлены запрошенные title и description главной. В page-metadata.mjs добавлена сущность WebApplication с бесплатным Offer 0 RUB в существующий JSON-LD @graph только для главной (и её alias /analysis). Общая реализация сохраняет совпадение исходного HTML/SSG и DOM при SPA-навигации. Локальные build/postbuild, lint и проверки точного содержимого собранного HTML/JSON-LD успешны. В браузере DOM отдельно не проверялся. API/БД и production не менялись.

### Публичные страницы групп, 05.11.2026
Девять групп списка получили статические публичные страницы с URL /analizy/<slug>/, ссылками с главной, существующими перечнями показателей и предупреждением о справочном характере. Справочник slug/title в analysis-groups.json соответствует порядку существующего списка; metadata и canonical определены для всех страниц. SSR и клиент используют один React-компонент и исходные перечни. Добавлены sitemap и маршруты Nginx с 301 на завершающий слеш и 404 для неизвестных адресов. Build/postbuild и lint успешны; изолированный Nginx проверен для каждой страницы. Редакционная медицинская проверка исходных текстов отдельно не выполнялась. Production и БД не менялись.

### Раздел «Статьи», 05.11.2026
Пункт общего верхнего меню открывает /articles, где размещены девять адаптивных карточек из analysis-groups.json. Страница включена в canonical, metadata, sitemap, SSG и маршрут Nginx. Client build/postbuild и lint успешны; проверены HTML карточек, canonical и локальный dev endpoint. Production не менялся.

Уточнение 05.11.2026: по запросу удалены дополнительные ссылки под списком групп на главной; ссылки на страницы групп доступны через /articles. Проверены lint и HTML локальной главной.

### Справочник на страницах групп, 05.11.2026
По прямому запросу пользователя справочные тексты и 1896 пар нормативов экспортированы read-only из локальной БД в analysis-reference-data.json. AnalysisGroupPage отображает исходное описание и диапазоны с границами возраста в днях, полом и единицами; сопоставление групп и point IDs явное. Дубли и обратные границы отфильтрованы при экспорте; отсутствие диапазона обозначается. Исправленные по указанию пользователя локальные нормы включены. Известная ошибка текста о ретикулоцитах отмечена рядом с исходным текстом со ссылкой на MedlinePlus. Тексты и нормы в целом не рецензированы; данные статические и требуют обновления при изменении БД. Build/postbuild и lint успешны; девять prerendered HTML проверены. Production не изменялся.

Уточнение 05.11.2026: страницы групп содержат хлебные крошки «Главная › название текущей страницы», с семантической навигацией и aria-current. Проверены lint и HTML локального dev-сервера.

Уточнение 05.11.2026: по просьбе пользователя диапазоны удалены со страниц и из статического JSON; прежнее описание экспорта нормативов выше отражает предыдущую версию. Описания остались. Build/postbuild, lint и проверка девяти HTML успешны.
