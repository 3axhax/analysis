# Реализация задачи 0001

Статус: технический hardening частично принят; улучшение NestJS matching не принято.

После финального прогона расширенного корпуса structured/hybrid matcher не подтвердил улучшение исходного алгоритма: legacy вернул 150 findings, structured — 80, hybrid — 152 из 242 ожидаемых DB-показателей. Принятые этапы, решения, которые нельзя повторять, отказ от PDF-шаблонов и обязательная дальнейшая реализация зафиксированы в `decision-review.md`.

В NestJS сохранена legacy-логика поиска параметров по данным Python, реализованы структурный matcher и hybrid-режим с legacy fallback. Внешний формат остаётся `findings/status/warnings/stats`. Legacy является режимом по умолчанию до прохождения compatibility gate на локальном expected manifest. Подробности находятся в `matching-solution.md`, `status.md` и `test-results.md`.

## Итоговое поведение

- PDF до 10 MiB обрабатывается локально, не более пяти страниц.
- Parser применяет line/text/coordinate extraction и включает локальный `rus+eng` OCR для image-only и mixed/sparse-text страниц.
- Параллельные запросы не разделяют справочник или findings; избыточный concurrency отклоняется HTTP 429.
- NestJS matcher сохраняет legacy-поиск: alias проверяется в первой ячейке с canonical-нормализацией, уникальная короткая English abbreviation имеет приоритет, число берётся из второй ячейки либо после alias в одноклеточной строке, выбирается первый допустимый кандидат `0 < value < 3000`.
- Новый `StructuredPdfFindingMatcher` умеет определять name/result/unit/reference columns, переносить совместимый table context, дедуплицировать extractor rows до конфликтов и обрабатывать переставленные колонки.
- Alias index применяет primary → exact RU/EN fallback → contextual tolerant слои; неоднозначность относится к фактически совпавшей строке, а не ко всему словарю.
- Короткий canonical English alias длиной до трёх символов считается предметно точным в первой ячейке/name-column; collision и tolerant aliases сохраняют строгие ограничения.
- Structured matcher различает result, range/date/reference и несколько числовых кандидатов, поддерживает scientific notation/inequality и не отбрасывает zero/negative/large value без warning.
- Unit в structured-режиме определяется только при однозначном совпадении разрешённой unit в строке; единственная разрешённая unit не назначается без evidence.
- Hybrid сначала принимает structured findings, затем дополняет отсутствующие point результатами исходного first-cell/second-cell алгоритма с warning `legacy_compatibility_fallback`.
- Legacy first-cell matching использует canonical normalization; при конкуренции aliases уникальная English abbreviation длиной 2–5 символов приоритетнее generic alias.
- Если hybrid fallback берёт первое число из ячейки с несколькими числовыми токенами, finding получает `legacy_multiple_numeric_candidates`.
- В hybrid-режиме единственная разрешённая unit назначается как устойчивое предметное допущение с warning `unit_assumed_from_single_allowed`; при нескольких units выбор остаётся за пользователем.
- `PDF_MATCHER_MODE=legacy|shadow|structured|hybrid`: default — `legacy`; `shadow` не меняет ответ и пишет только безопасные агрегатные counts.
- В локальном test/dev-compose явно задан `PDF_MATCHER_MODE=hybrid`; production compose продолжает использовать default `legacy`.
- Unit не угадывается legacy matcher и возвращается как `null`; технический confidence установлен в `0.5`, warnings на finding не добавляются.
- Client адаптирован к полю `findings` только в data layer; визуальный frontend полностью сохранён в исходном виде по решению пользователя.
- Некорректный набор с пустыми units, zero/negative/non-finite value отклоняется до создания `analysisResult`, а не сохраняется частично.

## API, схема и конфигурация

`POST /result/fromFile` теперь возвращает:

```text
status
findings[]: id, name, value, unitId, unit, confidence, page, warnings[]
warnings[]
stats: pagesTotal, pagesProcessed, pagesOcr, candidates, matched
```

Старые `message`, `findingPoints`, `pointsList`, Python `all_text/fallback_text` и raw response удалены. Это намеренное breaking change; client types/Redux slice читают новый контракт без изменений компонентов UI.

Схема и данные PostgreSQL не менялись. В Python image заранее включены Tesseract и `rus/eng` traineddata. Production parser доступен только server-контейнеру через internal network; root filesystem read-only, `/tmp` — ограниченный tmpfs, заданы timeout/memory/pid/concurrency limits. Dev parser находится во внутренней сети, но `docker-compose.dev.yaml` всё ещё декларирует host mapping `8000:8000`; это расхождение с прежним описанием нужно устранить отдельной корректировкой конфигурации или документации.

Для сравнения matcher добавлена команда:

```text
npm run benchmark:pdf-matcher -- <dataset.json>
```

Dataset содержит catalog, сохранённый Python extraction и expected point/value/unit. Реальные dataset/manifest остаются только локально в ignored-каталоге; CLI выводит только агрегаты.

## Миграция и rollback

DB migration не требуется. Поставка должна атомарно обновлять Python, server и client из-за нового API-контракта. Rollback — возврат всех трёх images к предыдущему релизу; возвращать небезопасный `all_text`, raw payload logging или публичный production parser port нельзя.

## Проверка

- backend: 4 suites / 40 tests passed, build passed;
- targeted matcher/service/benchmark tests: 39 passed;
- read-only ESLint затронутых TypeScript-файлов passed;
- synthetic benchmark runner и feature modes `legacy/shadow/structured/hybrid` проверены;
- client: build и lint passed;
- Python: исходные 4 проверки P0 и актуальные 11 unit tests пройдены; compileall и health passed;
- synthetic image-only OCR smoke: success, 1 page processed, 1 OCR page;
- synthetic end-to-end: compact contract подтверждён, raw/full-text поля отсутствуют;
- invalid disguised PDF: HTTP 400;
- Tesseract languages: `rus`, `eng`, `osd`;
- dev/prod compose config validation passed;
- parser external egress check: blocked;
- privacy log-pattern check и `git diff --check`: passed.
- На том же корпусе выполнены текущий и baseline-прогоны; агрегаты и ограничения сопоставления сохранены в `test-results.md`.
- На расширенном корпусе из 17 документов Python extraction обработал 305/305 эталонных записей: name/value/triple — 100%, unit — 303/303; обезличенная история прогонов сохранена в `python-test-result.md`.

## Ограничения и оставшаяся проверка

- После явного разрешения все 10 файлов `testData/` проверены локально с выводом только обезличенных агрегатов. Экспериментальный conflict-aware matcher получил 72 findings на 233 структурно посчитанные строки (30,9%), после чего был откатан. Текущий legacy matcher получил 119 findings (51,1%), 8 ответов `complete` и 2 `unsupported`. Ни один raw count не доказывает корректность без expected manifest.
- Структурный подсчёт строк не заменяет локальный expected manifest: в откатанном эксперименте 66 из 72 findings имели `multiple_numeric_candidates`, а правильность findings обоих вариантов не подтверждена эталоном.
- Визуальный browser smoke больше не требуется для `0001`, поскольку все визуальные frontend-изменения отменены.
- Precision/recall нового matcher, p95 и peak memory нельзя считать принятыми без локального корпуса с expected findings; поэтому structured-режим не включён по умолчанию.
- Повторный standalone-прогон тех же 10 PDF дал 62 structured findings на 233 структурно посчитанные строки (26,6%) против 119 у legacy; compatibility gate не пройден. Детали без чувствительных данных находятся в `test-results.md`.
- После разрешения коротких английских aliases structured matcher дал 71 finding. Hybrid дал 122 findings (52,4%) против 119 у legacy, но 51 finding получен fallback, а 90 units — по допущению единственной разрешённой unit; без expected manifest это не основание для cutover.
- Текущий legacy matcher не определяет unit и возвращает `null`; hybrid использует единственную разрешённую unit только как явно отмеченное допущение. Проект безопасного unit matching и отдельного проверяемого словаря вариантов записи описан в `matching-solution.md`.
- Client по-прежнему автоматически назначает первую разрешённую unit и использует прежний `parseInt` при её ручной смене; исправление и отображение status/confidence/warnings вынесены в отдельную frontend-задачу.
- Схема числового результата не хранит исходный знак inequality; такой finding получает warning и требует ручной проверки.
- Медицинские нормативы и интерпретации не менялись; результат остаётся справочным и не является диагнозом.

## Обязательные корректировки перед приёмкой

1. Агрегатный benchmark runner реализован; требуется вручную заполнить локальный ignored expected manifest для `testData`.
2. Structure/result/reference, перенос table context, дедупликация, слоистые aliases, unit matching и regression tests реализованы в structured-режиме.
3. Semantic dedup ограничен текущим Python-контрактом без bbox: точное physical-row объединение использует page + normalized row fingerprint, близкие строки объединяются только после совпадения point/value.
4. Согласовать и исправить dev mapping parser-порта `8000:8000` либо явно документировать его как локальное исключение.
5. Обезличенный hybrid-прогон всех 10 файлов выполнен; включать hybrid по умолчанию только после expected precision/recall, exact value и unit accuracy gate.

Подробная последовательность реализации и критерии повторной проверки зафиксированы в `plan.md`; исходные агрегаты — в `test-results.md`, read-only аудит словаря — в `alias-analysis.md`.

## Актуальное состояние после минимальной правки (2026-08-30)

- В test/dev окружении включён `PDF_MATCHER_MODE=hybrid`; production default остаётся `legacy`.
- Для целевого документа ранее пропущенные DBIL и RBC теперь находятся: количество findings выросло с 28 до 30.
- По обезличенному корпусу: legacy — 126, structured — 72, hybrid — 130 findings; ожидаемый диапазон по анализу БД и файлов — 130–134 параметра.
- Проверки кода: backend 40/40 тестов, build и read-only ESLint пройдены ранее; в этом этапе выполнены форматирование и повторный lint.
- Python parser, схема БД и медицинские данные не изменялись. Локальные сгенерированные debug-файлы списков удалены, агрегированные результаты сохранены в `test-results.md`.

## Фильтрация повреждённого текстового слоя (2026-09-22)

В `python-microservice/app.py` добавлена универсальная проверка `is_probable_encoding_artifact()`. Она удаляет только достаточно длинные фрагменты без букв, в которых не менее 60% непробельных символов относятся к пунктуации/символам, а цифры занимают не более 30%. Проверка выполняется для строки целиком и для каждой ячейки в `clean_table()`.

Решение не использует PDF-шаблоны, названия лабораторий, медицинский справочник или NestJS matching. API-схема расширена только новым возможным значением `method = ocr-repair`; существующие поля не изменены.

После пользовательской проверки первоначальная фильтрация уточнена: повреждённый префикс находился в одной строке с корректными значением и единицей, поэтому удаление всей строки было недопустимо. `clean_table()` теперь умеет очищать повреждённый префикс как внутри одной ячейки, так и при его разбиении на несколько ведущих ячеек. Числовой хвост сохраняется.

Для восстановления названия добавлен локальный OCR только повреждённой области. Строка определяется по word-level фрагментам со шрифтом `unknown`; OCR выполняется на ограниченном crop и принимается только при наличии короткого латинского кода в скобках. Восстановленное название и исходный числовой хвост возвращаются как строка метода `ocr-repair`. Полностраничный OCR для такого документа не запускается.

Проверка:

- regression test удаляет известную синтетическую последовательность знаков;
- числовые диапазоны и короткие единицы сохраняются;
- Python unit tests — 9/9, `compileall` и health check пройдены;
- повторный прогон 14 PDF завершён без extraction errors; локальное OCR-восстановление потребовалось только целевому документу;
- потерь ранее присутствовавших эталонных названий не обнаружено;
- для целевой строки `ocr-repair` связывает восстановленный код с исходными значением и единицей, паразитный префикс отсутствует во всех методах;
- локальный `python-tmp.json` повторно перезаписан ответом обновлённого сервиса после пользовательской проверки.

Миграция и изменение БД не требуются. Rollback: удалить фильтрацию повреждённых префиксов, локальное OCR-восстановление, связанные regression tests и обработку метода `ocr-repair`.

## Канонизация смешанных Unicode-кодов (2026-09-22)

В Python extraction добавлена `normalize_mixed_script_codes()`. Она переводит безопасные кириллические гомоглифы в латиницу только для коротких токенов, которые одновременно содержат латинские и кириллические заглавные буквы. Полностью латинские коды, полностью кириллические сокращения, обычный русский текст и mixed-case слова не изменяются.

Канонизация выполняется в `clean_table()` после удаления повреждённых префиксов и до вычисления сигнатуры таблицы. Поэтому NestJS и локальные тесты получают единый латинский вариант независимо от extraction method.

Проверка:

- Python unit tests — 11/11, `compileall` и health check пройдены;
- 14/14 PDF обработаны без extraction errors;
- дифференциальная проверка файлов с изменившимися метриками подтвердила: смешанных кодов в текущем response не осталось, количество ячеек не изменилось;
- name recall вырос с 265/276 до 267/276;
- value recall вырос с 264/276 до 266/276;
- unit recall вырос с 260/274 до 265/274;
- triple recoverability вырос с 261/276 до 266/276;
- локальные responses пяти проблемных файлов и `python-tmp.json` перезаписаны результатами обновлённого сервиса.

Миграция БД не требуется. Rollback — удалить mapping гомоглифов, функцию канонизации, её вызов из `clean_table()` и соответствующие unit tests.

## Сопоставление тестового эталона по уникальному сокращению (2026-09-22)

Правило оценки Python extraction уточнено без изменения формата эталонных JSON и production-кода. Полное имя сопоставляется в первую очередь. Если оно разорвано между несколькими частями логической строки, допустим fallback по точному сокращению из эталонного `name`, если сокращение однозначно в пределах текущего PDF и связано с той же строкой результата.

Fuzzy matching, внешние aliases и медицинские синонимы не используются. Значение и единица для pair/triple-метрик по-прежнему должны находиться в evidence найденного параметра. Точечная проверка `13.pdf` восстановила три имени по кодам `HCT`, `MCHC` и `PDW`; name recall для файла по уточнённому правилу — 27/27.

Полный повторный прогон после уточнения правила обработал 14/14 PDF без extraction errors. Python unit tests — 11/11, `compileall` и health check пройдены. Итоговые метрики: name recall 276/276, value recall 275/276, unit recall 274/274, triple recoverability 275/276. Единственный оставшийся разрыв value/triple находится в `13.pdf`.

Последующий визуальный аудит по прямому указанию пользователя показал, что этот разрыв был вызван ошибкой ручного переноса значения `LYM%` в `13.json`, а не потерей данных Python parser. Эталон исправлен по исходному PDF. В явную операцию создания/пересоздания эталонов добавлены независимый второй проход и посимвольная сверка числового результата. Обычные тестовые расхождения не инициируют повторное чтение PDF.

## Повторное создание локальных эталонов (2026-09-22)

По прямому указанию пользователя заново прочитан весь локальный PDF-корпус: 17 документов, 24 страницы. Для каждого PDF рядом создан одноимённый ignored JSON по методологии из `testing-methodology.md`. Каждый объект содержит только `name`, `value`, `unit`; порядок записей соответствует документу.

В эталоны вошли 305 лабораторных записей: 303 числовых и 2 качественных. Персональные данные, референсные диапазоны, комментарии и служебные поля исключены. После первичного переноса отдельно проверены сокращения и единицы, затем выполнен независимый второй проход с визуальной сверкой переносов строк и посимвольной проверкой результатов.

Автоматическая проверка подтвердила 17/17 пар PDF/JSON, валидный JSON, точный набор ключей, ожидаемые количества записей, права доступа `0600` и отсутствие смешанных Unicode-кодов показателей. Две пустые единицы относятся только к качественным результатам без единицы в источнике. Приложение, схема БД и медицинская логика не изменялись.
