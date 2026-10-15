# Повторный тест Python extraction, 2026-10-15

По запросу пользователя выполнить методологию на всех PDF, включая новый doc-18: проверить sources, один раз отправить каждый комплектный PDF текущему Python endpoint (pages1–5), оценить восстановимость name/value/unit/triple по source JSON без Nest aliases/БД/fuzzy. PDF визуально повторно не читать, source не менять. Backup БД создан и проверен; API healthy.

Результаты extraction держать только в приватном временном каталоге вне tasks, не перезаписывать testData/python-results. Не создавать DB-results или новые source JSON. Вывод — doc-XX, счётчики и метрики, без clinical payload. Проверка связанных логических строк и неоднозначных совпадений обязательна; число в reference не результат. Допустима точная уникальная uppercase аббревиатура из source-name согласно методологии, не внешний словарь.

Существующий повторно используемый evaluator в репозитории отсутствует; подготовить read-only временный harness без изменения Python production logic. Сначала сохранить один extraction на документ, затем проверять evidence offline, не отправляя повторно. В отчёт append новый dated block с четырьмя метриками, отдельно missing/invalid/error cases; исторические результаты сохранить. Проверки compile/health Python, schema/count/completeness, git diff check. DB/код/PDF/эталоны/фrozen snapshots не менять.
