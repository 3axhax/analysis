# Миграции через существующий startup

MigrationsService.onModuleInit по-прежнему создаёт журнал migrations и выполняет старые entity migrations. Затем последовательно вызывает:

1. MigrationsAnalysisPointUnits.addUnitNormalization —0002-unit-normalization.
2. MigrationsAnalysisPointUnits.addFerritinSourceUnit —0003-ferritin-source-unit.
3. MigrationsAnalysisResult.allowSourceOnlyMeasurements —0006-source-measurements.

Новый provider зарегистрирован в AppModule. Существующие имена markers и advisory locks сохранены: локальные ручные применения распознаются как выполненные и не перезаписывают aliases/коэффициенты/связи/данные. SQL тела перенесены без изменения семантики в src/migrations/unit-migrations.sql.ts. Параллельный механизм ручных up-файлов удалён, изменения доступны через обычный startup. Новых изменений схемы/содержимого сидов задача не добавляет.

runRecordedMigration выполняет проверку journal, SQL и marker в одной транзакции с advisory lock. При ошибке rollback и отказ startup; последующие зависимые миграции не выполняются. Ошибка не содержит SQL/персональных данных/credentials. Базовые legacy migrations не переписаны; атомарность и lock относятся к трём новым этапам.

## Поставка и совместимость

После backup и согласования поставляется обычная сборка backend, затем его startup сам применяет0002→0003→0006, если markers отсутствуют. Отдельный psql up не нужен. Для первого0002 сохранена исходная проверка ожидаемого каталога15units; при непредусмотренной конфигурации — отказ/rollback, а не автоматическая подмена. На уже обновлённой БД все этапы no-op, включая пользовательские дальнейшие изменения aliases/правил.

SQL является TypeScript payload и входит в dist, копирование server/scripts в production image не требуется. Build ограничен src и rootDir=src, чтобы штатный Docker entrypoint dist/main.js существовал (scripts ранее расширяли inferred rootDir). tsBuildInfoFile помещён внутрь dist: иначе deleteOutDir при повторном incremental build мог оставить валидный cache вне удалённого каталога и не восстановить выходные файлы. Проверены повторная сборка и загрузка compiled AppModule.

Down/verify SQL сохранены только для отдельно согласованного обслуживания. До rollback остановить новую версию, иначе следующий startup восстановит удалённые markers. Data-protection guards down не ослаблялись; при source-only/используемых данных нужен отдельный план без удаления измерений. Исходные удалённые up-скрипты доступны в истории Git.

## Проверки и данные

- Backup рабочей БД создан/проверен до задачи, сохранён вне tasks; содержимое не выводилось.
-190tests/21suites: marker compatibility, transaction scope, no-op, sanitized failure и порядок зависимостей; все старые regression tests тоже успешны. Read-only ESLint изменённых TS файлов и build успешны. Существующее ts-jest предупреждение не исправлялось.
-Три private восстановленные копии: современная БД, старая до0002 для полного Nest startup, и такая же старая для двух одновременных первых запусков MigrationsService. Обычный AppModule init проверен без override MigrationsService; отдельно проверен compiled AppModule. Повторные запуски не создают дубликатов; failing synthetic DDL откатывает таблицу и marker.
-После startup integration save/get проверил конверсию, coefficient1, source-only/missing-reference, atomicity, historical snapshots и legacy read. Синтетические записи очищены только на копии.
-Современная копия и рабочая БД: все20таблиц по counts/checksums неизменны. На старой копии новые columns/seed ожидаемо меняют shape каталога/измерений; нормативы/старые таблицы неизменны и пять старых полей всех измерений проверены отдельно — совпали. Медицинские значения/ссылки не публиковались.
-Corpus18/18:288/288 pairs,281/281 non-null units,288/288 triples, missing/extra/wrong/unscored=0. Python/PDF extraction не запускались, testData/gold не менялись; дополнительных фиксаций корпуса нет.
-Рабочий dev backend обновлён, health200; startup на уже обновлённой рабочей БД no-op. Три disposable копии удалены, восстановление возможно из сохранённых backups. Ручной browser smoke не нужен для изменения startup и не выполнялся. Коммит/push не выполнялись.
