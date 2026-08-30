# Статус задачи 0001

Обновлено: 2026-08-30.

## Принятое ограничение runtime

Статус: `принят`.

Решение пользователя от 2026-08-29:

- во время работы PDF-парсер не обращается к внешним ресурсам;
- разрешены только заранее подготовленные локальные зависимости, OCR engine, модели, traineddata, словари и профили;
- внешний Document AI/LLM исключён;
- требование offline runtime добавлено в архитектуру, этап OCR и критерии приёмки `plan.md`.

## Этап: анализ текущей реализации

Статус: `принят` как результат исследовательского этапа.

Сделано:

- изучен поток client → NestJS → FastAPI/pdfplumber → matcher → client;
- подтверждено игнорирование multipart-полей `pages` и `table_settings`;
- подтверждён небезопасный выход за диапазон страниц, если параметр передать как query;
- подтверждён обратный порядок координатных строк и неполный контракт `cols`;
- обнаружены singleton state, silent-success, full-text response/logging risks, публичный Python port, отсутствие OCR и resource limits;
- проверена клиентская обработка единиц и обнаружено обрезание decimal при смене unit;
- выполнен read-only агрегатный аудит словаря алиасов без вывода их значений;
- выполнен синтетический smoke test без использования медицинских PDF;
- синтетический PDF визуально проверен после рендера;
- сверены официальные документы FastAPI, pdfplumber, OCRmyPDF и Tesseract;
- сформированы варианты A–D и рекомендована последовательность A → B → при необходимости C.

Принятый результат:

- корневые причины и приоритеты зафиксированы в `plan.md`;
- изменения приложения и БД на этом этапе не выполнялись;
- реальный recall пока не измерен: для него нужен согласованный обезличенный benchmark.

Проверка:

- обязательная локальная резервная копия PostgreSQL создана и проверена через `pg_restore --list`; содержимое не выводилось и в Git не включается;
- dev-сервисы client, server, PostgreSQL и Python были запущены; Python/PostgreSQL healthy;
- три повторных вызова одностраничного синтетического PDF в прогретом Python-сервисе завершились HTTP 200 за 0.09–0.18 с;
- сквозной синтетический запрос через NestJS завершился HTTP 201; ответ содержал один ложноположительный finding и весь список из 67 points, размер ответа около 50 KiB;
- реальные PDF из `testData/` не читались и их содержимое не выводилось.

## Этап: реализация P0 hardening

Статус: `на проверке`.

Обновление 2026-08-29:

- пользователь подтвердил начало реализации задачи;
- принят порядок: synthetic regression tests → P0 hardening → matching/unit/client contract adapter → локальный OCR;
- по решению пользователя визуальные frontend-изменения полностью отменены и исключены из плана `0001`; компоненты `Dropfile`, `AnalysisPage` и `AnalysisPointSelectedItem` возвращены к исходному состоянию;
- схема и данные PostgreSQL не изменяются, ранее созданная и проверенная резервная копия остаётся достаточной для текущего этапа;
- максимальное число обрабатываемых страниц зафиксировано равным 5;
- нулевые, отрицательные, большие и неравные значения не должны молча искажаться или отбрасываться: допустимый числовой кандидат возвращается с warning и требует проверки;
- безопасная инвентаризация `testData/` подтвердила наличие локального PDF-корпуса без чтения или вывода имён и содержимого файлов.

Осталось:

- сформировать согласованный обезличенный benchmark с expected findings и целевыми метриками.

Реализовано:

- multipart-параметры объявлены через `Form(...)`, страницы валидируются и ограничены 1–5;
- Python проверяет размер до разбора, PDF signature, безопасно обрабатывает corrupt/unsupported input и не возвращает полный текст/traceback;
- line, text и coordinate extractors запускаются независимо, строки идут сверху вниз и дедуплицируются;
- CPU-парсинг выполняется в отдельном завершаемом процессе с timeout и memory limit; concurrency ограничена на NestJS и Python;
- `ParseFileService` больше не хранит request data в singleton-полях;
- ошибки parser-сервиса не маскируются успешным пустым ответом и Axios payload не логируется;
- добавлен компактный `status/findings/warnings/stats` контракт без `pointsList`, `all_text` и raw response;
- client изменён только на уровне типов/Redux adapter для чтения `findings`; визуальный слой не изменяется и дополнительные status/review элементы не добавляются;
- production parser port больше не публикуется, bind mount удалён, добавлены internal network, read-only root, tmpfs, capability/pid/memory limits;
- нулевые/отрицательные значения больше не создают пустой/частичный результат молча: `/result/save` отклоняет весь некорректный набор до создания parent result.

Проверка:

- backend: 3 suites, 15 tests passed; build passed;
- client: build и lint passed; остались прежние предупреждения Vite о CSS token и размере chunk;
- Python: 4 tests passed, compileall и health passed;
- synthetic image-only PDF: 1/1 page обработана локальным OCR; `rus`, `eng`, `osd` доступны;
- сквозной synthetic запрос через NestJS вернул контролируемый compact contract; ложный PDF отклонён HTTP 400;
- обе compose-конфигурации валидны; проверка external egress вернула `blocked`;
- в логах smoke-периода не найдены известные шаблоны `all_text`, buffer payload, traceback или synthetic value;
- `git diff --check` passed.

## Этап: OCR и профили лабораторий

Статус: `на проверке` для generic OCR; профили не начаты.

Реализовано:

- image-only и mixed/sparse-text страницы направляются в локальный Tesseract;
- заранее упакованы `rus+eng`, используется OSD-коррекция поворота;
- OCR запускается только в изолированном worker process, runtime download отсутствует;
- временные OCR-данные остаются внутри worker/tmpfs и не включаются в ответ.

Осталось:

- на разрешённом корпусе измерить recall, latency и memory;
- добавлять lab profiles только по измеримым провалам generic pipeline.

## Этап: проверка на локальном корпусе `testData`

Статус: `на проверке`.

Обновление 2026-08-29:

- пользователь явно разрешил локальную обработку потенциально чувствительных PDF из `testData`;
- проверены все 10 файлов через `POST /result/fromFile`, имена файлов, текст, названия показателей, значения и индивидуальные результаты не выводились и не сохранялись в Git;
- исходное число показателей посчитано как число строк результатов по структуре извлечённых таблиц; это локальная структурная оценка, а не медицинская верификация содержимого;
- во всех запросах получен HTTP 201, транспортных ошибок и timeout не было;
- 7 ответов имели статус `partial`, 3 — `unsupported`, статус `complete` не получен ни разу;
- в 233 строках показателей endpoint вернул 72 findings: агрегированное покрытие 30,9%; по файлам — 15/35, 15/35, 10/33, 9/24, 8/32, 0/1, 0/1, 7/39, 0/8 и 8/25;
- OCR не запускался: все проверенные документы имели пригодный текстовый слой;
- `alias_collisions_detected` присутствовал во всех 10 ответах, хотя это свойство глобального словаря, а не обязательно конкретного документа;
- `conflicting_values_require_review` присутствовал в 7 ответах; в одном из них все кандидаты были отброшены и итог стал `unsupported`;
- 66 из 72 findings получили `multiple_numeric_candidates`, поэтому корректность выбранного числа нельзя считать принятой без сравнения с локальным expected manifest;
- 2 findings не получили однозначную unit; это повторяющийся макет в двух файлах.

Принятый результат проверки:

- критерий приёмки «все файлы `testData` успешно и корректно распознаются» не выполнен;
- текущий generic pipeline технически стабилен на корпусе, но полнота matching недостаточна, а предупреждения не позволяют подтвердить корректность большинства значений;
- схема и данные PostgreSQL не изменялись.

Предлагаемые корректировки задачи:

1. Добавить локальный игнорируемый expected manifest для `testData` и runner, который выводит только агрегаты precision/recall и категории расхождений.
2. Объединять кандидаты одной физической строки до поиска конфликтов и приоритизировать структурную таблицу с определённой колонкой результата; числа из reference range, дат и примечаний не считать равноправными кандидатами значения.
3. Переносить роли колонок из заголовка на продолжения таблицы и следующие страницы одного макета.
4. Строить слоистый alias index: `translationParsing` как primary, RU/EN как exact fallback, короткие/confusable aliases только при строгом контексте; неоднозначный alias отмечать только если он реально встретился в документе.
5. Не добавлять глобальный `alias_collisions_detected` в каждый ответ: warning должен зависеть от затронутой строки и не переводить заведомо успешный документ в `partial`.
6. Добавить regression fixtures для трёх классов провала: отсутствие alias, конфликт разных extractors и несколько чисел в строке с result/reference колонками.
7. После исправления повторить этот же обезличенный прогон; целевое значение recall/precision зафиксировать по expected manifest, а не по эвристическому числу строк.
8. Устранить расхождение документации и `docker-compose.dev.yaml`: dev compose всё ещё декларирует публикацию `8000:8000`; либо удалить mapping, либо явно зафиксировать его как допустимый только для локальной отладки.

### Read-only анализ алиасов от 2026-08-29

- проанализированы 196 alias-записей для 67 показателей; код, схема и данные не изменялись;
- после нормализации осталось 189 уникальных алиасов и 7 коллизий, затрагивающих 12 показателей; 4 коллизии создаются или расширяются нормализацией;
- 51 алиас имеет длину не более трёх символов, при этом 49 из 139 point-document mentions на корпусе зависят только от коротких алиасов;
- все 67 показателей имеют `translationParsing`, поэтому текущий RU/EN fallback не используется;
- плоское добавление переводов создаёт 111 новых вариантов и увеличивает пары вложенности с 17 до 229, но не добавило mentions на текущем корпусе;
- подтверждено, что часть misses относится к словарю, а часть — к конфликтам извлечённых чисел и не исправляется модификацией алиасов;
- рекомендован слоистый индекс и точечная корректировка по expected manifest; подробности находятся в `alias-analysis.md`.

### Проверка полноты Python parser от 2026-08-30

- для всех 10 PDF выполнено независимое сравнение Poppler `pdftotext -layout` с таблицами `POST /extract-tables`;
- найдено 465 технических кандидатных строк в исходном layout-тексте, из них 458 (98,5%) присутствуют в ответе Python, 7 пропущены;
- Python вернул 73 дополнительные строки, отсутствующие в независимом наборе; это требует дедупликации/фильтрации, но само по себе не доказывает ошибку распознавания;
- в двух файлах Python передал 7/7 строк, но NestJS получил 0 findings; в ещё одном — 37/37 строк и 0 findings;
- результат подтверждает: основной провал текущего корпуса находится после Python, в aliases, выборе result/reference-значения, разрешении конфликтов, дедупликации и unit matching;
- детальная Python-специфичная таблица удалена по решению пользователя; сводные результаты текущего и baseline-прогонов сохранены в `test-results.md`.

### Откат NestJS matcher при сохранении новых контрактов от 2026-08-30

Статус: `на проверке`.

- NestJS matcher возвращён к старой логике: поиск alias только в первой ячейке, число — в следующей ячейке либо после alias в одноклеточной строке, берётся первый допустимый кандидат `0 < value < 3000`;
- сохранён новый контракт `findings/status/warnings/stats`, совместимый с текущим frontend data layer;
- сохранены новые `PdfParserService` и типы входного Python-ответа (`pages_processed`, `pages_ocr`, методы `lines/text/coordinates/ocr`);
- request state остаётся локальным, concurrency limit — 2;
- unit в legacy matcher намеренно возвращается как `null`, confidence — техническое значение `0.5`, warnings на finding не добавляются;
- smoke на 10 PDF: 8 ответов `complete`, 2 `unsupported`, HTTP 201 во всех случаях; findings по файлам: 27, 27, 12, 4, 13, 0, 0, 21, 8, 7;
- targeted NestJS tests: 5/5 passed, build passed;
- изменения `AnalysisResultService` и сервисного поля `units`, не относящиеся к новому контракту, откатлены.

## Этап: повторный анализ NestJS matching

Статус: `принят` как проектное решение; реализация не начата.

Обновление 2026-08-30:

- повторно сверены текущий legacy matcher, сохранённая экспериментальная conflict-aware реализация и агрегатные прогоны корпуса;
- подтверждено, что эксперимент дедуплицировал extractor-кандидаты после matching и удалял весь point при любом расхождении value/unit;
- подтверждено, что result/reference/date/note числа не имели разных ролей, из-за чего 66 из 72 findings получили `multiple_numeric_candidates`;
- зафиксированы дополнительные причины регрессии: глобальное исключение collision aliases, смешение canonical/confusable normalization, глобальный warning и противоречивый порядок `parsingOrder`/длины alias;
- принято ограничение следующего среза: Python parser, схема БД и данные справочника не меняются;
- выбран структурный TypeScript matcher с дедупликацией до matching, слоистым alias index, явными ролями колонок и legacy compatibility gate;
- до переключения endpoint обязательны ignored expected manifest и сравнение legacy/new по point precision/recall, exact value accuracy и unit accuracy;
- подробная архитектура, отклонённые варианты, этапы и тестовая матрица зафиксированы в `matching-solution.md`.

Осталось:

- получить решение пользователя о начале реализации предложенного среза;
- создать локальный expected manifest и benchmark harness;
- реализовать pure matcher и пройти compatibility gate до изменения рабочего ответа API.

## Этап: реализация структурного matcher

Статус: `на проверке`.

Обновление 2026-08-30:

- пользователь подтвердил реализацию этапов из `matching-solution.md`;
- рабочее дерево перед началом содержало только документальные изменения задачи 0001, созданные на предыдущем этапе анализа;
- существующая проверенная резервная копия PostgreSQL остаётся достаточной: Python, схема и данные БД не изменяются;
- принят безопасный порядок: characterization и benchmark harness → pure matcher → structure/dedup/aliases/units → shadow/feature flag → tests/build;
- рабочий ответ endpoint не переключается на новый matcher до прохождения compatibility gate по локальному expected manifest.

Реализовано:

- legacy matcher вынесен в отдельный pure-класс и покрыт characterization tests; его поведение по первой ячейке, первому числу и порогу 3000 сохранено;
- добавлен pure `StructuredPdfFindingMatcher`, не зависящий от HTTP, NestJS DI и БД-запросов;
- добавлены явные роли name/result/unit/reference, перенос совместимого контекста на таблицы-продолжения и отбрасывание header rows;
- одинаковые physical rows объединяются между extractors до matching по page + canonical row fingerprint; семантически одинаковые point/value кандидаты объединяются до разрешения конфликтов;
- alias index разделяет primary и RU/EN fallback, canonical и tolerant keys; короткие, collision и tolerant aliases требуют explicit name/result context;
- collision alias разрешается только по контексту конкретной строки, в том числе по однозначной разрешённой unit; глобальный warning не создаётся;
- result выбирается из структурной колонки, затем через контролируемые adjacent/same-cell fallbacks; range, date и multi-number cells не считаются scalar result;
- decimal comma/dot, scientific notation, inequality, zero, negative и большие числа разбираются без прежнего silent drop и получают review warnings;
- unit ищется только среди разрешённых units point и не назначается автоматически только потому, что разрешённая unit одна;
- добавлен агрегатный benchmark runner `npm run benchmark:pdf-matcher -- <dataset.json>`; он сравнивает legacy/structured по point precision/recall, exact value, unit accuracy/coverage и категориям ошибок без вывода строк документа;
- добавлен полностью синтетический benchmark fixture; локальный expected manifest с реальными данными остаётся ignored и не создан автоматически;
- режимы интеграции: `legacy` по умолчанию, `shadow` возвращает legacy и логирует только агрегатные counts, `structured` явно включает новый matcher через `PDF_MATCHER_MODE`;
- Python parser, схема и данные PostgreSQL не менялись.

Проверка:

- targeted matcher/service/benchmark tests: 30/30 passed;
- полный backend suite: 4 suites, 31/31 tests passed;
- backend build в dev-контейнере: passed;
- read-only ESLint затронутых TypeScript-файлов: passed;
- synthetic benchmark CLI: legacy miss и structured exact match корректно отражены только агрегатами;
- shadow test подтверждает отсутствие point name/value в aggregate log payload;
- server health внутри контейнера: `status=ok`.

Осталось до переключения default:

- вручную сформировать локальный ignored expected manifest для согласованного корпуса;
- прогнать benchmark и подтвердить, что structured не уступает legacy по point precision/recall и exact value accuracy;
- проверить unit accuracy на подтверждённых expected units;
- только после выполнения gate изменить runtime `PDF_MATCHER_MODE` с `legacy`/`shadow` на `structured`.

### Повторный прогон локального корпуса от 2026-08-30

- добавлен standalone runner `npm run benchmark:pdf-corpus -- <corpus>`: справочник читается в `READ ONLY` transaction с rollback, Python extraction и оба matcher выполняются без перезапуска NestJS;
- runner выводит только псевдоним файла, counts, status и warning codes; имена, строки, point names, значения и raw extraction не выводятся и не сохраняются;
- повторный legacy-контроль воспроизвёл прежние 119 findings и статусы 8 `complete` / 2 `unsupported`;
- structured matcher вернул 62 findings на 233 структурно посчитанные строки (26,6%), 7 `partial`, 3 `unsupported`, 0 `complete`;
- 47 findings не получили однозначную unit и имеют warnings; зафиксированы 4 ambiguous candidate groups в трёх документах;
- structured результат ниже legacy на 57 findings и ниже откатанного эксперимента на 10 findings;
- compatibility gate не пройден, runtime default остаётся `legacy`; `structured` разрешён только для benchmark/debug;
- обезличенная таблица и итоговое сравнение трёх прогонов добавлены в `test-results.md`.

## Этап: hybrid matcher с legacy fallback

Статус: `на проверке`.

Обновление 2026-08-30:

- пользователь подтвердил предметное допущение: короткие английские медицинские аббревиатуры в русскоязычных документах считаются точными aliases;
- пользователь разрешил допущение, что единственная разрешённая для point unit обычно является единицей документа;
- выбран упрощённый hybrid-подход: structured finding имеет приоритет, отсутствующий point дополняется legacy first-cell/second-cell finding с явным warning;
- короткий canonical English alias разрешается в первой/name ячейке без обязательного explicit header, но collision и tolerant aliases сохраняют строгий контекст;
- unit assumption применяется только при `point.units.length === 1`, не выбирает первую unit из нескольких и остаётся явно отмеченным warning;
- legacy runtime default сохраняется до прохождения expected benchmark.

Реализовано:

- добавлен pure `HybridPdfFindingMatcher`: structured findings имеют приоритет, legacy дополняет только отсутствующие point;
- каждый fallback finding получает `legacy_compatibility_fallback`, поэтому источник упрощённого решения остаётся видимым;
- canonical короткий английский alias длиной до трёх символов принимается в первой ячейке либо определённой name-column без обязательного заголовка;
- collision и tolerant aliases не ослаблены и по-прежнему требуют явного структурного контекста;
- если у point ровно одна разрешённая unit, она назначается с `unit_assumed_from_single_allowed`; при нескольких либо нуле units автоматического выбора нет;
- добавлен явный runtime-режим `PDF_MATCHER_MODE=hybrid`; default не изменён;
- corpus runner и synthetic benchmark расширены сравнением hybrid без вывода чувствительных данных.

Проверка:

- targeted matcher/service/benchmark tests: 35/35 passed;
- полный backend suite: 4 suites, 36/36 tests passed;
- backend build в dev-контейнере: passed;
- read-only ESLint затронутых TypeScript-файлов: passed;
- TypeScript compile check: passed;
- повторный read-only corpus benchmark: legacy 119, structured 71, hybrid 122 findings на 233 структурно посчитанные строки;
- короткие English aliases добавили structured matcher 9 findings относительно предыдущего прогона;
- hybrid добавил 51 legacy fallback finding и получил 3 findings сверх baseline;
- число findings без однозначной unit сократилось с 47 до 8; 90 units назначены по правилу единственной разрешённой unit;
- 98 hybrid findings имеют warnings; 8 документов получили `partial`, 2 — `unsupported`;
- подробные обезличенные результаты и выводы зафиксированы в `test-results.md`.

Решение:

- hybrid является кандидатом на expected benchmark, но raw coverage не подтверждает precision, exact value и unit accuracy;
- default остаётся `legacy`; `hybrid` разрешён для явной проверки, `shadow` — для безопасного сравнения агрегатов;
- до cutover необходимо проверить локальным expected manifest 51 fallback finding, 3 findings сверх legacy, 90 assumed units, четыре ambiguous groups и два документа без findings.

### Включение hybrid в test/dev окружении

Статус: `на проверке`.

Обновление 2026-08-30:

- по решению пользователя `PDF_MATCHER_MODE=hybrid` задан только для `server_analysis` в `docker-compose.dev.yaml`;
- production compose и безопасный runtime fallback `legacy` в коде не изменены;
- переключение не меняет схему или данные PostgreSQL и не требует миграции;
- пересоздан только контейнер `serverAnalysis`; остальные сервисы не перезапускались;
- внутри нового контейнера подтверждено значение `PDF_MATCHER_MODE=hybrid`;
- server health после старта: `status=ok`, environment=`development`;
- медицинские PDF для этой проверки не обрабатывались;
- rollback test/dev окружения: удалить override `PDF_MATCHER_MODE` из dev compose и пересоздать только server-контейнер.

### Минимальные правки abbreviation/legacy fallback

Статус: `на проверке`.

Обновление 2026-08-30:

- legacy first-cell matching переведён на общую canonical normalization, поэтому пунктуация вокруг однословного alias не блокирует совпадение;
- для одной строки сначала собираются допустимые point-кандидаты; уникальная English abbreviation длиной 2–5 символов имеет приоритет над generic alias;
- при отсутствии abbreviation-кандидата сохраняется прежний порядок `parsingOrder`/длины `translationParsing`;
- hybrid fallback помечает ячейку с несколькими числовыми токенами warning `legacy_multiple_numeric_candidates`;
- DB aliases, units, схема PostgreSQL и Python parser не менялись;
- добавлены synthetic regression tests для пунктуации, abbreviation-vs-generic и multi-number fallback;
- целевой smoke подтвердил наличие обоих ранее пропущенных point; findings выбранного документа: 28 → 30;
- повторный corpus-аудит: legacy 126, structured 72, hybrid 130 findings; подробности зафиксированы в `test-results.md`;
- synthetic matcher regression tests: 30/30 passed;
- полный backend suite: 4 suites, 40/40 tests passed;
- backend build и read-only ESLint затронутых файлов: passed;
- один обезличенный документ снизился на 1 finding, поэтому raw count не заменяет expected point/value verification.

## Этап: очистка отладочных артефактов и синхронизация документации

Статус: `на проверке`.

Обновление 2026-08-30:

- удалены локальные сгенерированные файлы expected-list из `testData`, не являющиеся частью тестового набора;
- `test-results.md` сохранён как источник агрегированных результатов и выводов;
- итоговое состояние hybrid, counts корпуса и целевой smoke-проверки отражены в `implementation.md`;
- изменённые TypeScript-файлы отформатированы Prettier, read-only ESLint выполнен без дополнительных тестовых прогонов.
