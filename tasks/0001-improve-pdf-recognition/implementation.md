# Реализация задачи 0001

Статус: реализованный срез `на проверке`.

В NestJS сохранена legacy-логика поиска параметров по данным Python, а внешний формат адаптирован к новому контракту `findings/status/warnings/stats`, который использует frontend. Подробности и результаты smoke находятся в `status.md` и `test-results.md`.

## Итоговое поведение

- PDF до 10 MiB обрабатывается локально, не более пяти страниц.
- Parser применяет line/text/coordinate extraction и включает локальный `rus+eng` OCR для image-only и mixed/sparse-text страниц.
- Параллельные запросы не разделяют справочник или findings; избыточный concurrency отклоняется HTTP 429.
- NestJS matcher сохраняет legacy-поиск: alias проверяется только в первой ячейке, число берётся из второй ячейки либо после alias в одноклеточной строке, выбирается первый допустимый кандидат `0 < value < 3000`.
- Переставленные колонки и конфликтующие кандидаты намеренно не разрешаются в этом compatibility-срезе; улучшенный conflict-aware matcher остаётся отдельной задачей.
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

## Миграция и rollback

DB migration не требуется. Поставка должна атомарно обновлять Python, server и client из-за нового API-контракта. Rollback — возврат всех трёх images к предыдущему релизу; возвращать небезопасный `all_text`, raw payload logging или публичный production parser port нельзя.

## Проверка

- backend: 3 suites / 15 tests passed, build passed;
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

- После явного разрешения все 10 файлов `testData/` проверены локально с выводом только обезличенных агрегатов. Получено 72 findings на 233 структурно посчитанные строки показателей (30,9%); 7 ответов `partial`, 3 `unsupported`, 0 `complete`. Поэтому критерий корректного распознавания всего корпуса не выполнен.
- Структурный подсчёт строк не заменяет локальный expected manifest: 66 из 72 findings имеют `multiple_numeric_candidates`, и правильность выбранных значений пока не подтверждена эталоном.
- Визуальный browser smoke больше не требуется для `0001`, поскольку все визуальные frontend-изменения отменены.
- Precision/recall, p95 и peak memory нельзя считать принятыми без обезличенного корпуса с expected findings.
- Generic unit matching использует разрешённые units показателя и их canonical names; отдельный проверенный словарь unit aliases и lab profiles пока не создан.
- Client по-прежнему автоматически назначает первую разрешённую unit и использует прежний `parseInt` при её ручной смене; исправление и отображение status/confidence/warnings вынесены в отдельную frontend-задачу.
- Схема числового результата не хранит исходный знак inequality; такой finding получает warning и требует ручной проверки.
- Медицинские нормативы и интерпретации не менялись; результат остаётся справочным и не является диагнозом.

## Обязательные корректировки перед приёмкой

1. Создать локальный ignored expected manifest для `testData` и агрегатный benchmark runner.
2. Отделить колонку результата от reference range, дат и примечаний; переносить роли колонок на продолжения таблиц и следующие страницы.
3. Дедуплицировать одну физическую строку между extractors до проверки конфликтов и приоритизировать структурный кандидат с определённой result-column.
4. Формировать слоистый alias index: `translationParsing` как primary, RU/EN как exact fallback, короткие/confusable aliases только при строгом контексте; предупреждать о коллизии только при фактическом совпадении неоднозначного alias в документе.
5. Дополнить проверяемый словарь вариантов unit без автоматического выбора при неоднозначности.
6. Добавить regression tests для трёх подтверждённых классов провала: отсутствие alias, конфликт extractors и несколько чисел в одной строке.
7. Согласовать и исправить dev mapping parser-порта `8000:8000` либо явно документировать его как локальное исключение.
8. Повторить обезличенный прогон всех 10 файлов и принимать результат только по expected precision/recall и unit accuracy.

Подробная последовательность реализации и критерии повторной проверки зафиксированы в `plan.md`; исходные агрегаты — в `test-results.md`, read-only аудит словаря — в `alias-analysis.md`.
