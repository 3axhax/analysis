# Статус

2026-10-16,14:42 UTC+05:00 — реализовано, на проверке. Новые миграции подключены к MigrationsService последовательно после старого batch через entity providers. Имена marker/lock и SQL payload сохранены; сравнение payload с прежним SQL подтвердило равенство всех трёх тел. Старые ручные up-файлы заменены одним компилируемым источником; down/verify остаются для обслуживания.

Проверки:190tests/21suites, read-only ESLint, повторная build и наличие dist/main.js + migration payload. Полный AppModule init без override прошёл на старой и актуальной копиях; compiled AppModule тоже проверен. На третьей старой копии два одновременных первых startup применили новые миграции ровно один раз. Повтор — no-op; ошибка DDL откатывает и пробную таблицу, и marker. Integration save/get/source-only/snapshots после startup успешны. Corpus18/18,288/288 pairs/triples,281/281 units,0 missing/extra/wrong/unscored.

На актуальной копии и рабочей БД контрольные суммы всех20таблиц неизменны. На старой копии сохранились нормативы/прочие таблицы и все исходные пять полей измерений; полная JSON-сумма таблицы измерений меняется ожидаемо из-за девяти новых nullable колонок, поэтому старые поля сверены отдельно и совпали. Три disposable копии удалены после тестов, backups сохранены вне tasks. Health200 после обновления dev backend. Python/testData/gold не менялись, коммит/push не выполнялись.

В работе. Backup создан/проверен. Существующий MigrationsService и entity providers прочитаны; новые marker names в локальной БД уже есть. План — интеграция с сохранением marker/SQL семантики, без новых изменений рабочих данных. Подготовка providers/SQL payload и regression tests.
