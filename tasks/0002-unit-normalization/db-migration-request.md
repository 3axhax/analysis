# Изменения БД на отдельное согласование

Итог 2026-10-15: пользователь явно разрешил этот этап. Миграция выполнена на копии, проверены повторный запуск, constraints и rollback; затем применена локально после проверенного backup. Копия удалена, backup сохранён. Нормативы и прежние результаты не изменены. Ниже сохранён исходный запрос; утверждение о неисполненном SQL историческое.

Дата:2026-10-15,16:44 UTC+05:00. Уточнения пользователя учтены: расчётная unit выбирается по конкретному интервалу point/age/gender, calculationUnitId в analysisPoint НЕ добавляется. Четыре многовариантных point не исключаются целиком, их нормативы не объединяются. Предыдущее предложение db-audit.md о63 фиксированных calculation units отменено.

## Точная область подготовленной миграции

Файл: server/scripts/migrations/0002-unit-normalization.sql, ручной psql script, не зарегистрирован в startup migrations. Состояние: черновик подготовлен; SQL ещё не выполнялся даже на копии. Нельзя считать dry-run/rollback/constraints проверенными до разрешённого запуска.

| Объект | Изменение |
|---|---|
| analysisPointUnits |3 новых поля: code, translationParsing, quantityKind; заполнить15 существующих строк, сохранить ID/name |
| analysisPointUnits |1 новая unit g/dl с собственными aliases и mass-concentration family;15→16 строк |
| analysis_point_units |2 новые разрешённые связи g/dl: hemoglobin и mchc;71→73 строк |
| unitConversionRule |Новая таблица с version/active/point applicability, decimal coefficient, FK в совпадающую quantityKind;8 прямых правил |
| analysisResultPointData |9 nullable полей: sourceValue/sourceUnitId/sourceUnitText/calculationValue/conversionRuleId/conversionRuleVersion/appliedCoefficient/referenceMin/referenceMax |
| migrations |1 новая служебная отметка0002-unit-normalization |

Правила from→to: g/dl→g/l×10, обратно×0.1;µmol/l→mmole/l×0.001, обратно×1000;ng/ml↔mkg/l×1;10^12/l→10^9/l×1000, обратно×0.001. Разрешённость исходной unit каждого point остаётся отдельной проверкой; наличие глобального коэффициента не разрешает любую unit всем показателям. Identity выполняется явно k=1 в коде. Mass↔molar, percent↔count и конверсия разных assay-method units отсутствуют.

## Ограничения/сохранность

-Транзакция и advisory lock; повторный запуск после отметки миграции — no-op. При отличии каталога от проверенных15 units — отказ/rollback, не тихая подмена.
-Уникальные коды/версии/активные правила; коэффициенты положительные finite NUMERIC(38,18); FK from/to требует одну quantityKind. Глобальный и point-specific конфликт дополнительно отвергает resolver.
-Результат хранит source NUMERIC(38,18), calculation NUMERIC(76,36), coefficient/версию и исходные reference bounds. CHECK связывает произведение/source/canonical и nullability, trigger проверяет provenance against rule.
-Использованную версию коэффициента нельзя переписать/удалить; деактивация разрешена, новая версия отдельная.
-Не выполнять backfill: старые результаты получают только NULL в новых полях. Существующие value/unitId и количество результатов/дочерних записей не меняются. Norm min/max остаются1898/1898, никакой консолидации/удаления дублей/исправления reversed ranges. Point rows67 без новых columns. Users/sessions/медицинские тексты не затрагиваются.
-Down script0002-unit-normalization.down.sql отказывается удалять schema, если появились нормализованные результаты. В этом случае откат только совместимой версией приложения с сохранением provenance, не потеря новых данных.

## Запрашиваемое разрешение и порядок

1. Разрешить создание отдельной временной локальной БД-копии из уже проверенного private backup и применение up/down там. Она содержит чувствительные данные, не публикуется и не выводится; не используется как corpus snapshot. После проверки удалить только эту явно созданную копию по подтверждённой области операции.
2. На копии проверить SQL syntax/constraints/counts/aliases/seed, повторный up, rollback без новых результатов и отказ destructive rollback после synthetic normalized result. Не читать/публиковать существующие индивидуальные медицинские записи.
3. Если проверки успешны и scope не изменился — после свежего backup применить ту же миграцию к локальной рабочей БД. Если проверка требует нового scope/исправления существующих данных — остановиться и согласовать.
4. Затем подключить подготовленные resolver/alias index к DB loader, save transaction, get/reference/description flow и исходному отображению клиента; выполнить сквозные проверки и обновить отчёт. Сейчас этот сквозной путь НЕ завершён и не активирован.

Это отдельное согласование DDL/DML, не повторный запрос согласия с уже утверждённым алгоритмом. Реализация безопасных независимых компонентов выполнена без изменения БД.
