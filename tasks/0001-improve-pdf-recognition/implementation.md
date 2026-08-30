# Реализация задачи 0001

Статус: реализованный срез `на проверке`.

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
- Python: 4 unit tests, compileall и health passed;
- synthetic image-only OCR smoke: success, 1 page processed, 1 OCR page;
- synthetic end-to-end: compact contract подтверждён, raw/full-text поля отсутствуют;
- invalid disguised PDF: HTTP 400;
- Tesseract languages: `rus`, `eng`, `osd`;
- dev/prod compose config validation passed;
- parser external egress check: blocked;
- privacy log-pattern check и `git diff --check`: passed.
- На том же корпусе выполнены текущий и baseline-прогоны; агрегаты и ограничения сопоставления сохранены в `test-results.md`. Детальные Python-специфичные отчёты удалены по решению пользователя.

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
