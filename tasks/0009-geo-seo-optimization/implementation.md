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
