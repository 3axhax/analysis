# AGENTS.md

## Назначение

Этот репозиторий — веб-сервис «Проанализируй» для предварительной расшифровки лабораторных анализов. Пользователь вручную вводит показатели или загружает PDF, указывает пол и возраст, после чего сервис сопоставляет значения с референсными диапазонами и выводит заранее подготовленные интерпретации. Результат носит справочный характер и не является диагнозом.

Работай от кода, локальной PostgreSQL и обезличенных fixtures. Персональные данные из медицинских PDF, сохранённые результаты, дампы БД, учётные данные и session tokens считаются чувствительными данными. Не выводи их содержимое в терминал, ответы, логи задач или Git.

Перед работой всегда выполняй `git status --short`. Репозиторий может содержать незавершённые изменения пользователя; не перезаписывай и не форматируй их без необходимости.

## Стек и структура

- Client: React 19, TypeScript, Vite 7, Redux Toolkit, React Router, i18next, Tailwind CSS.
- Server: NestJS 11, TypeScript, Sequelize 6 / `sequelize-typescript`, PostgreSQL.
- PDF parser: FastAPI, `pdfplumber`, Uvicorn; отдельный Python-контейнер.
- Production proxy: Nginx с TLS, SPA client и проксированием `/api/` в NestJS.
- `client/src`: Feature-Sliced-подобная структура `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- `server/src`: NestJS-модули по сущностям; основные домены — показатели, типы анализов, единицы, возрастные интервалы, нормативы, результаты, описания, переводы и авторизация.
- `python-microservice/app.py`: извлечение таблиц и текста из PDF.
- `docker-compose.dev.yaml`: dev-стек с bind mounts и портами приложения.
- `docker-compose.yaml`: production-подобный стек с Nginx и собранными образами.
- `sqlDump/` и `testData/`: локальные игнорируемые каталоги с потенциально чувствительными данными; не считай их fixtures, пригодными для публикации.

Отслеживаемые `server/.env` и `client/.env` должны содержать только безопасную для репозитория конфигурацию. Локальные `.postgres.env`, `server/.development.env` и `client/.dev.env` не копируй в задачи и ответы. Не печатай значения переменных окружения; для диагностики достаточно имён переменных и проверки соединения.

## Docker и базовые команды

Основной режим локальной разработки:

```bash
docker compose -f docker-compose.dev.yaml up -d --build
docker compose -f docker-compose.dev.yaml ps
docker compose -f docker-compose.dev.yaml logs --tail=100 server_analysis
```

Dev-порты:

- client: `http://localhost:5173`;
- NestJS API: `http://localhost:5050`;
- Node inspector: `localhost:9229`;
- PDF parser: `http://localhost:8000`;
- PostgreSQL: `localhost:5432`.

Health checks:

```bash
curl -fsS http://localhost:5050/health
curl -fsS http://localhost:8000/health
curl -fsSI http://localhost:5173/
```

Production-подобный стек запускай только по явной необходимости:

```bash
docker compose up -d --build
docker compose ps
```

Он публикует Nginx на `80/443`, использует сертификаты из `nginx/ssl` и конфигурацию для `proanalize.ru`. Не смешивай одновременно dev- и production-compose: у них одинаковые `container_name` и порты БД/PDF.

## Поток данных

1. Client загружает справочники показателей, типов анализов, единиц, пола и возраста через REST API.
2. Пользователь вводит показатели вручную либо отправляет PDF в `POST /result/fromFile` (лимит 10 MiB, ожидается PDF).
3. NestJS передаёт буфер в `python_pdf_parser:8000/extract-tables`; Python обрабатывает страницы 1–5 и возвращает таблицы и извлечённый текст.
4. `ParseFileService` сопоставляет строки с `analysisPoint.translationParsing` либо RU/EN-названиями, извлекает первое положительное число меньше 3000 и возвращает найденные показатели клиенту. Автораспознавание является подсказкой: пользователь должен проверить показатели и выбрать единицы.
5. `POST /result/save` определяет возрастной интервал и пол, создаёт `analysisResult`, затем сохраняет распознанные показатели в `analysisResultPointData`.
6. `POST /result/get` получает результат по случайному 40-символьному hex `resultId`, вычисляет статусы `LOW`, `NORMAL`, `HIGH` по min/max и подбирает описания, все условия которых совпали.
7. Client показывает результат на `/result/:resultId`; ссылку можно скопировать и открыть без авторизации.

Никогда не трактуй результат алгоритма как медицинский диагноз. Изменения сопоставления, диапазонов, единиц и текстов интерпретации требуют предметной проверки и тестов на граничных значениях.

## API и авторизация

- Публичные маршруты: справочники для формы, `POST /result/save`, `POST /result/get`, `POST /result/fromFile`, `POST /auth/login`, `GET /i18n/:lng/:ns` и health/root.
- Административные CRUD-маршруты для возрастов, единиц, показателей, описаний и переводов защищены `@Roles('ADMIN')` и `RolesGuard`.
- Глобальный `AuthGuard` только пытается найти пользователя по Bearer token и всегда возвращает `true`; фактическое ограничение доступа обеспечивает только `RolesGuard` на явно размеченных endpoints.
- Session token — случайный 32-символьный hex, хранится в `users-sessions` и в client `localStorage`. В текущей модели нет срока действия, logout/revocation и уникального DB-ограничения на token.
- Результат доступен любому, кто знает `resultId`; это capability-link, а не приватный кабинет. Не логируй и не публикуй такие ссылки.
- CORS сейчас отражает любой origin и разрешает credentials. Не расширяй публичную поверхность API; при изменениях авторизации добавляй негативные тесты для anonymous, USER, ADMIN, неверного и отозванного token.

## Модель PostgreSQL

Локальная БД: `analysisdb`, PostgreSQL 18. Основные группы таблиц:

- Справочники: `ages`, `gender`, `analysisType`, `analysisPoint`, `analysisPointUnits`, `translation`.
- Связи: `analysis_type_point`, `analysis_point_units`.
- Нормативы: `analysisPointMinValue` и `analysisPointMaxValue`, ключ по смыслу — point + age + gender + unit.
- Результаты: `analysisResult` и дочерняя `analysisResultPointData`.
- Интерпретации: `analysisResultDescription` и `analysisResultDescriptionCondition`.
- Доступ: `users`, `roles`, `users-roles`, `users-sessions`.
- Служебная таблица `migrations` учитывает самописные startup migrations.

Связи результата:

```text
analysisResult
  -> ages
  -> gender
  -> users (nullable; фактического FK в локальной схеме нет)
  -> analysisResultPointData[]
       -> analysisPoint
       -> analysisPointUnits

analysisPoint
  <-> analysisType через analysis_type_point
  <-> analysisPointUnits через analysis_point_units
  -> min/max по age + gender + unit

analysisResultDescription
  -> conditions[]: analysisPoint + LOW/NORMAL/HIGH
```

Схему меняй миграциями, а не ручным SQL как способом доставки. NestJS при старте выполняет `MigrationsService.onModuleInit()`: создаёт таблицу `migrations` и запускает идемпотентные `ALTER TABLE` для известных изменений. Поэтому даже обычный запуск server-контейнера потенциально изменяет схему.

Перед миграцией, восстановлением дампа, очисткой результатов или массовым CRUD обязательно:

1. показать план и область изменения;
2. сделать проверяемую резервную копию локальной БД вне `tasks/`;
3. получить явное подтверждение пользователя;
4. выполнить dry-run/read-only проверки;
5. проверить constraints, row counts и откат.

Для read-only диагностики используй агрегаты и каталог схемы:

```bash
docker exec postgresAnalysis sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -P pager=off -c "SELECT current_database(), current_user, version();"'
docker exec postgresAnalysis sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -P pager=off -c "SELECT table_name FROM information_schema.tables WHERE table_schema = '\''public'\'' ORDER BY table_name;"'
```

Не выбирай и не показывай `users.email`, `users.password`, session token, `analysisResult.resultId`, индивидуальные значения анализов или текст из PDF.

## Критически важная логика

- `AnalysisResultService.saveResult()` сначала создаёт родительский результат, затем параллельно сохраняет точки без общей транзакции. Ошибка посередине может оставить пустой или частичный результат.
- Сохраняются только точки, для которых найдены point/unit и `value > 0`; ноль и отрицательные значения молча отбрасываются.
- БД проверяет отдельные FK point и unit, но не проверяет, что unit разрешена именно для point через `analysis_point_units`.
- `getMinValueByPointGenderAge()` и `getMaxValueByPointGenderAge()` не принимают `unitId`, хотя нормативы зависят от единицы. Статус в описаниях проверяется с unit, а числовые min/max в ответе могут быть выбраны неоднозначно.
- Admin-редактирование показателя удаляет старые min/max и создаёт новые без транзакции. Аналогично CRUD описаний и переводов состоит из нескольких независимых операций.
- В `getAnalysisResultDescriptionsByQuery()` фильтр строится через `sequelize.literal`; вход типизирован как число, но любые изменения этого кода должны сохранять строгую DTO-валидацию или перейти на bind parameters.
- Python parser возвращает полный извлечённый текст (`all_text`) в межсервисном ответе и включает детали исключений в HTTP 500. Не логируй эти payloads; ограничивай страницы, размер и время обработки.
- `ParseFileService` хранит `findingPoints` и `pointsList` в полях singleton provider. Параллельные PDF-запросы могут смешивать состояние разных пользователей; перед расширением функции сделай состояние локальным для запроса.
- Python проверяет расширение имени файла, NestJS — MIME/type validator. Для защиты необходима проверка сигнатуры/валидности PDF, лимиты сложности и тесты повреждённых/зашифрованных/огромных документов.
- Публичное сохранение результатов не имеет rate limit, TTL и механизма удаления. Не добавляй новые сохраняемые персональные поля без отдельной модели согласия, retention и удаления.

## Текущее состояние локальной БД

Ориентир на 2026-08-29; перед расследованием пересчитывай read-only запросами:

- 19 пользовательских таблиц.
- Справочники: 14 возрастных интервалов, 2 пола, 4 типа анализов, около 67 показателей и 15 единиц.
- Нормативы: по 1 898 строк min/max; обнаружены 2 дубли полного ключа point + age + gender + unit и 2 диапазона, где min > max.
- Результаты: около 34 результатов и 616 значений; 2 результата без точек, 6 значений используют unit, отсутствующую в разрешённых units соответствующего point.
- 9 результатов имеют `ageInDays` вне текущего интервала связанной записи `ages`, вероятно после изменения справочника или исторической миграции.
- Интерпретации: около 133 описаний и 186 условий; дубли условий не найдены.
- Переводы: около 278 строк; найдены 4 дубли логического ключа lang + namespace + module + submodule, потому что DB-ограничения уникальности нет.
- Пользователи: 1, sessions: 9; orphan users/sessions и дубли token не найдены.
- В схеме мало индексов кроме PK/unique. На FK и частых lookup-полях результатов/нормативов отдельных индексов нет.

Эти аномалии не исправляй массово в рамках несвязанной задачи. Сначала установи происхождение, ожидаемую семантику единиц и выбери канонические записи вместе с пользователем.

## Проверка изменений

Backend:

```bash
docker exec serverAnalysis npm test -- --runInBand
docker exec serverAnalysis npm run build
```

Client:

```bash
docker exec clientAnalysis npm run build
docker exec clientAnalysis npm run lint
```

Python:

```bash
docker exec pythonPDFParser python -m compileall -q /app
docker exec pythonPDFParser curl -fsS http://localhost:8000/health
```

Скрипт backend `npm run lint` содержит `--fix` и меняет файлы; не используй его как read-only проверку чужих изменений. Автотестов мало: фактически присутствует стандартный `app.controller.spec.ts`, поэтому для доменной логики добавляй тест, воспроизводящий задачу.

Минимальная проверка медицинской логики должна покрывать:

- точное min/max и значения сразу ниже/выше границы;
- разные единицы одного показателя;
- границы возрастных интервалов и оба пола;
- неизвестные point/unit, дубли point и пустой набор;
- десятичную запятую/точку, ноль, отрицательное, очень большое и нечисловое значение;
- параллельные загрузки PDF и повторную отправку;
- доступ к admin endpoints без token, с USER и с ADMIN;
- отсутствие чувствительных данных в логах и ошибках.

Перед завершением задачи выполняй `git diff --check` и повторный `git status --short`. Не включай в diff сборочные результаты, дампы, PDF, `.env`, логи Nginx или uploads.

## Рабочие задачи

Каждую отдельную задачу веди в `tasks/` по правилам [`tasks/README.md`](tasks/README.md). До реализации создай `plan.md`, в процессе обновляй `status.md`, а после принятия решения добавь `implementation.md`.

В `AGENTS.md` держи только устойчивые знания о проекте. Детали конкретной реализации, временные SQL, результаты экспериментов и чек-лист приёмки остаются в каталоге соответствующей задачи.

## Известный технический долг

- Нет транзакций вокруг составных операций сохранения результата и admin CRUD.
- Нет полноценной системы миграций с `down`, блокировкой, общей транзакцией и отдельным CLI; миграции запускаются при старте приложения.
- Нет expiration/revocation sessions, rate limiting, TTL/удаления результатов и ограничения доступа владельцем.
- Capability-ссылки результатов публичны; privacy зависит только от энтропии `resultId` и неразглашения URL.
- У нормативов нет уникального ограничения полного логического ключа; часть lookup игнорирует unit.
- `analysisResult.userId` и `users-sessions.userId` в локальной схеме не защищены FK, несмотря на смысловую связь моделей.
- Нет составного FK, гарантирующего допустимость unit для point в сохранённом результате.
- PDF parser имеет request-unsafe singleton state в NestJS, возвращает лишний полный текст и использует эвристический разбор без confidence/источника.
- Справочные CRUD обновляют связанные таблицы и переводы неатомарно; rename может рассинхронизировать translation keys.
- В ответе `addNewAnalysisPoint()` поля RU/EN формируются из переменных в обратном порядке; это требует отдельного regression test перед исправлением.
- DTO и контроллеры местами используют слабые типы (`[]`, `any`) и ручную проверку body вместо полной валидации.
- Production-зависимости собираются с известными npm audit warnings; обновления выполняй отдельной задачей с проверкой совместимости, не через безусловный `audit fix --force`.
- В проекте нет содержательных README и покрытия ключевой доменной логики.
