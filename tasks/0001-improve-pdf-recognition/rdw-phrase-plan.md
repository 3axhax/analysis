# Название CV и исключение общего SD alias

Дата: 2026-10-14. Пользователь подтвердил добавление «Точность ширины распределения эритроцитов» к translationParsing rdw и удаление слишком общего alias «Ширина распределения эритроцитов» из кода. Новый DB point не создаётся. Read-only проверена ровно запись id11/rdw с прежним словарём; backup создан и проверен.

Доставка: explicit transactional data migration только translationParsing одной записи, exact precondition, dry-run по умолчанию, apply после rollback dry-run; reverse script возвращает прежний словарь только при ожидаемом состоянии. Все остальные поля/нормативы/units/результаты сохранить. В коде убрать оба русских EXTRA_NAMES rdw: специфичный CV теперь из БД, общий SD больше не alias. RDW/RDW-CV остаются поддерживаемыми, явный RDW-SD исключён.

Проверки: regression names/rows с одновременным CV и общим неподдерживаемым названием; без новой DB фразы не использовать её скрыто из кода; parser tests/build/lint/health. Новый snapshot с единственным изменением parsingWords, expected/input fingerprints сохраняются. Диагностика 06/12 и corpus без подмены changed-input fingerprints. Python и gold не менять. Rollback предыдущим кодом и обратной миграцией, не DB restore/очисткой результатов.
