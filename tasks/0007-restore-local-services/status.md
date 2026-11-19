# Статус

- Диагностика — принят: старые backend dependencies, отсутствующий parser, несовместимая схема после Git update.
- Backup — принят: создан и проверен pg_restore --list в игнорируемом sqlDump; содержимое не публиковалось.
- Зависимости — принят: npm ci в томе backend, build успешен, 185 tests / 19 suites прошли.
- Parser — принят: образ собран, сервис healthy, health из backend 200, 11 unittest прошли; compileall с PYTHONPYCACHEPREFIX=/tmp успешен. Стандартный compileall обнаружил недоступный для non-root записи cache volume, runtime это не блокирует.
- Миграции — принят: пользователь дал отдельное подтверждение. На disposable copy up/repeat/constraints/down/up успешны; 0002, 0003, 0006 применены локально; startup parsingOrder выполнена при запуске. Исторические результаты/поля измерений/нормативы и их counts неизменны, invalid constraints = 0.
- HTTP — принят: client и API health 200; публичные справочники 200; admin getFullList без токена 403; parser health из backend 200. Parser находится во внутренней сети, localhost:8000 недоступен с хоста.
- Очистка — принят: disposable DB удалена; backup сохранён; код приложения не менялся.
