export const MEDICAL_SOURCE_ANALYSIS_LOG_SQL = `
CREATE TYPE "medicalSourceAnalysisStatus" AS ENUM (
  'ANALYZED', 'PARTIAL', 'REJECTED_LICENSE', 'REJECTED_YEAR'
);
ALTER TABLE "medicalSource"
  ADD COLUMN published boolean NOT NULL DEFAULT false,
  ADD COLUMN url text,
  ADD COLUMN year integer CHECK (year BETWEEN 1 AND 9999),
  ADD COLUMN status "medicalSourceAnalysisStatus",
  ADD COLUMN comment text;

UPDATE "medicalSource"
SET url = nullif(btrim(metadata->>'url'), ''),
    year = CASE WHEN metadata->>'year' ~ '^[1-9][0-9]{0,3}$' THEN (metadata->>'year')::integer END,
    metadata = metadata - 'url' - 'year';

CREATE TEMP TABLE medical_source_log_seed (
  url text PRIMARY KEY,
  status "medicalSourceAnalysisStatus" NOT NULL,
  comment text NOT NULL
) ON COMMIT DROP;

INSERT INTO medical_source_log_seed (url,status,comment) VALUES
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC5986027/', 'ANALYZED', 'Анализ проведён — задача 0010; CC BY 4.0. Проверены весь текст и оба рисунка Soppi. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC10940260/', 'ANALYZED', 'Анализ проведён — задача 0030; один дополнительный кандидат, требуется проверка перед внесением. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC6835368/', 'ANALYZED', 'Анализ проведён — задача 0016; CC BY 4.0. Проверены все разделы, обе таблицы и рисунок Begum и Latunde-Dada. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC10517335/', 'ANALYZED', 'Анализ проведён — задача 0030; CC BY 4.0. Проверены основной текст и все пять технических разделов приложения. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC12249883/', 'ANALYZED', 'Анализ проведён — задача 0030; нового общего правила без неподтверждённых условий не найдено. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC11707970/', 'ANALYZED', 'Анализ проведён — задача 0030; интервалы методозависимы, новые правила пока не готовы. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC11399640/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC-ND 4.0; ранее выполнен частичный анализ. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC12161641/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC-SA 4.0; ранее выполнен частичный анализ. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC10904443/', 'ANALYZED', 'Анализ проведён — задача 0030; кандидат по натрию требует уточнения границ и возраста. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC10515122/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC-SA. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC8637680/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC5719197/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC; задача 0016. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13508813/', 'ANALYZED', 'Анализ проведён — задача 0030; выявлены референсы активного B12 и MMA, требуется проверка применимости. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC7677104/', 'ANALYZED', 'Анализ проведён — задача 0030; найден кандидат с существующими показателями без гаптоглобина. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC11752444/', 'ANALYZED', 'Анализ проведён — задача 0030; CC BY 4.0. Проверены основной текст и оба приложения. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC8912638/', 'ANALYZED', 'Анализ проведён — задача 0030; общие правила для всех пользователей не подходят. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC9922947/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC-ND. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC11452171/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC12327948/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC11042559/', 'ANALYZED', 'Анализ проведён — задача 0035; CC BY 4.0, три собственных неонатальных интервала, 16 проверок CALIPER. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13550734/', 'ANALYZED', 'Анализ проведён — задача 0035; CC BY 4.0, сверены таблица 1, рисунок S1 и таблицы S1–S5. Сохранены интервалы основной таблицы. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC3772807/', 'ANALYZED', 'Анализ проведён — задача 0035; CC BY, семь референсов, маркировка ALTnp/ASTnp в таблице 4 сверена с PDF издателя. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13691253/', 'ANALYZED', 'Анализ проведён — задача 0035; CC BY 4.0, восемь интервалов, приложение сверено через CDN издателя. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC11026984/', 'ANALYZED', 'Анализ проведён — задача 0035; CC BY 4.0, комбинации печёночных тестов, R-фактор, границы 2 и 5 в таблице 1 не покрыты. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC12227826/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC 4.0. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC12982192/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC-ND 4.0. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC7448835/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC-ND 4.0. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC2632744/', 'ANALYZED', 'Анализ проведён — задача 0036; CC BY, перенесены выбранные консенсусные референсы ОАК и биохимии. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC9629653/', 'ANALYZED', 'Анализ проведён — задача 0036; CC BY 4.0, для АЛТ у женщин выбрана таблица 1 (7,9–48,0 U/L), строка внесена в локальную БД миграцией 0068. Исходные данные участников не пересчитывались. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC7979267/', 'ANALYZED', 'Анализ проведён — задача 0036; CC BY 4.0, сверены агрегированные приложения и материалы рецензирования. Подтверждены внесённые SI-референсы. Индивидуальные данные не пересчитывались. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'ANALYZED', 'Анализ проведён — задача 0036; CC BY 4.0, сверены все семь приложений. Перенесены выбранные авторами интервалы таблицы 3. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC2645400/', 'ANALYZED', 'Анализ проведён — задача 0036; CC BY 2.0, возрастные интервалы ТТГ и FT4, FT3 с года. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC7141356/', 'ANALYZED', 'Анализ проведён — задача 0036; CC BY 4.0, только верхняя граница ТТГ по полу и возрасту. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13116899/', 'ANALYZED', 'Анализ проведён — задача 0036; CC BY 4.0, прямые CMIA-референсы ферритина 60+. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC12927209/', 'ANALYZED', 'Анализ проведён — задача 0036; CC BY 4.0, добавлен детский NLR, три других индекса документированы. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC8011145/', 'ANALYZED', 'Анализ проведён — задача 0036; CC BY 4.0, сверены таблица 3 и три приложения. Импорт отложен до учёта доношенности. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13209222/', 'ANALYZED', 'Анализ проведён — задача 0036; CC BY 4.0, собственных референсов для переноса нет. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC8578761/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC-ND 4.0. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC10660733/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC 3.0. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13413918/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Импортированы 6 половых референсов. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13298108/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Импортированы 11 строк статьи. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13196472/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Сверены таблица 1 и приложение. Локально внесены 6 строк белка и альбумина и 90 строк ещё для 24 показателей. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13605354/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Нужны отдельные признаки материала и доношенности. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13467166/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Методическое сравнение, не выбран единственный набор для сервиса. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Сверены таблица 4 и приложения. Внесены 21 строка для 14 показателей, единица RDW-CV подтверждена. RBC исключён из-за неоднозначного масштаба. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13709999/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Не сопоставлялись с фракциями глобулинов электрофореза. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13402806/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Для самостоятельного импорта нужны первичные публикации каждой таблицы. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13562915/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Показатели CD-субпопуляций не эквивалентны общему числу лимфоцитов ОАК. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13525422/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Набор предполагает популяцию двух этнических групп, для тромбоцитов нужны отдельные условия. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13465239/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Импорт не выполнялся. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13025947/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Сверены таблицы прогнозов и валидации. Непрерывные модели не перенесены в фиксированные интервалы. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13457255/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Показатель отсутствует; исследование не даёт универсального порога постановки диагноза. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13555359/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Требуются отдельные показатели Sysmex; перенос на Д-димер или другие показатели коагулограммы невозможен. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13408599/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Требуются повторные измерения одного человека; универсальных порогов для одной формы нет. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13299395/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Признак фенотипа в форме отсутствует. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13761456/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Требуется признак материала образца. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC10932992/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Собственных числовых интервалов для переноса нет. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13631990/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Оба показателя отсутствуют в действующем справочнике; кандидаты для отдельной настройки. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC9366111/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0036. CC BY 4.0. Наборы оставлены кандидатами до выбора правила для разных разбивок. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC9644092/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC 4.0. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13563535/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC 4.0. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC11668252/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC 3.0. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13574458/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC 4.0. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC13384711/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC 4.0. |'),
  ('https://pmc.ncbi.nlm.nih.gov/articles/PMC12577142/', 'REJECTED_LICENSE', 'Не подходит по лицензии: CC BY-NC-ND 4.0. |'),
  ('https://nutritionalassessment.org/proteinb/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Возможные причины низкого сывороточного альбумина. |'),
  ('https://nutritionalassessment.org/calcium/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Сочетание низких общего кальция и сывороточного альбумина. |'),
  ('https://nutritionalassessment.org/phosphorus/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Кандидат на возрастные и половые референсы фосфата. |'),
  ('https://nutritionalassessment.org/magnesium/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Кандидат на референс сывороточного магния и пояснение возможной причины снижения. |'),
  ('https://nutritionalassessment.org/b12/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Подтверждены права на исходное датское исследование плазменного B12. |'),
  ('https://nutritionalassessment.org/biomarkers/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Биомаркеры, Gibson (2024). Импорт не выполнялся. |'),
  ('https://nutritionalassessment.org/proteina/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Аминокислоты и белок, Courtney-Martin и соавт. (2025). Импорт не выполнялся. |'),
  ('https://nutritionalassessment.org/vitamina/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Витамин A, Tanumihardjo (2025). Импорт не выполнялся. |'),
  ('https://nutritionalassessment.org/vitaminD/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Витамин D, Whiting и Gibson (2024). Миграция 0075: у взрослых внесены крайние пороги IOM. |'),
  ('https://nutritionalassessment.org/vitamine/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Витамин E, Zingg (2026). Миграция 0075: у взрослых внесена нижняя граница сывороточного α-токоферола. |'),
  ('https://nutritionalassessment.org/vitaminc/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Витамин C, Carr (2024). Данные внесены локально миграцией 0073. |'),
  ('https://nutritionalassessment.org/thiamine/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Тиамин, Whitfield (2024). Импорт не выполнялся. |'),
  ('https://nutritionalassessment.org/riboflavin/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Рибофлавин, Pentieva (2024). Импорт не выполнялся. |'),
  ('https://nutritionalassessment.org/niacin/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Ниацин, Gibson (2024). Импорт не выполнялся. |'),
  ('https://nutritionalassessment.org/folate/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Фолат, McNulty (2024). Импорт не выполнялся. |'),
  ('https://nutritionalassessment.org/copper/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Медь, McArdle (2024). Данные внесены локально миграцией 0073. Миграция 0075: отдельно внесён порог сывороточной меди для взрослых. |'),
  ('https://nutritionalassessment.org/zinc/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Цинк, Gibson (2024). Импорт не выполнялся. |'),
  ('https://nutritionalassessment.org/iodine/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Йод, Skeaff и Gibson (2026). Импорт не выполнялся. |'),
  ('https://nutritionalassessment.org/selenium/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Селен, Combs (2024). Импорт не выполнялся. |'),
  ('https://nutritionalassessment.org/nrv/', 'ANALYZED', 'Анализ проведён — дополнение к задаче 0041. CC BY 4.0. Референсные величины потребления, Gibson (2024). Импорт не выполнялся. |'),
  ('https://nutritionalassessment.org/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 1 (2026), введение и дизайн исследований. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/food/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 2 (2024), доступность продовольствия. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/individual/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 3 (2024), индивидуальное потребление пищи. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/chap04/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 4a (2025), состав продуктов. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/bioavailability/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 4b (2025), биодоступность. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/errors/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 5 (2025), ошибки измерения рациона. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/reproducibility/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 6 (2025), воспроизводимость оценки рациона. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/validity/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 7 (2025), валидность оценки рациона. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/evn/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 8b (2024), оценка потребления и рациона. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/diet/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 8c (2024), рекомендации и качество рациона. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/intant/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 9 (2024), введение в антропометрию. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/bodysize/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 10 (2024), размеры тела. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/bodycomposition/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 11 (2024), состав тела. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/anthro/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 13 (2024), оценка антропометрических данных. Новых данных для лабораторного справочника нет. |'),
  ('https://nutritionalassessment.org/bodylabmethods/', 'ANALYZED', 'Анализ проведён — задача 0041. CC BY 4.0. Глава 14 (2024), лабораторные методы оценки состава тела. Новых данных для лабораторного справочника нет. |');

-- Only this migration may move existing leaf documents under a new article.
ALTER TABLE "medicalSource" DISABLE TRIGGER medical_source_no_cycle;
DO $$
DECLARE
  entry record;
  root_id integer;
  article_id integer;
  matched_ids integer[];
  article_name text;
  article_year integer;
BEGIN
  FOR entry IN SELECT * FROM medical_source_log_seed ORDER BY url LOOP
    SELECT id INTO STRICT root_id FROM "medicalSource"
    WHERE parent_id IS NULL AND name = CASE
      WHEN entry.url LIKE 'https://pmc.ncbi.nlm.nih.gov/%' THEN 'PubMed Central'
      ELSE 'Principles of Nutritional Assessment'
    END;

    SELECT array_agg(id ORDER BY id),
      min(nullif(metadata->>'title', '')),
      CASE WHEN count(DISTINCT year)=1 THEN min(year) END
    INTO matched_ids, article_name, article_year
    FROM "medicalSource"
    WHERE parent_id=root_id AND rtrim(url, '/')=rtrim(entry.url, '/');

    IF cardinality(matched_ids)=1 THEN
      UPDATE "medicalSource" SET status=entry.status, comment=entry.comment
      WHERE id=matched_ids[1];
    ELSE
      IF entry.url='https://nutritionalassessment.org/' THEN
        article_name := 'Introduction, study design and evaluation in assessment';
        article_year := 2026;
      END IF;
      INSERT INTO "medicalSource" (parent_id,name,metadata,url,year,status,comment)
      VALUES (root_id,coalesce(article_name,regexp_replace(rtrim(entry.url,'/'), '^.*/', '')),
        '{}',entry.url,article_year,entry.status,entry.comment)
      RETURNING id INTO article_id;

      UPDATE "medicalSource" SET parent_id=article_id WHERE id=ANY(matched_ids);
    END IF;
  END LOOP;
END $$;
ALTER TABLE "medicalSource" ENABLE TRIGGER medical_source_no_cycle;

-- An ancestor is public whenever a descendant has public result data.
CREATE FUNCTION refresh_medical_source_publication() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(20077);
  WITH RECURSIVE public_sources(id) AS (
    (
      SELECT "sourceId" FROM "analysisPointIntervalValue" WHERE "sourceId" IS NOT NULL
      UNION
      SELECT "sourceId" FROM "analysisResultDescription" WHERE "sourceId" IS NOT NULL
    )
    UNION
    SELECT s.parent_id FROM "medicalSource" s JOIN public_sources p ON p.id=s.id
    WHERE s.parent_id IS NOT NULL
  ), desired AS (
    SELECT s.id, p.id IS NOT NULL AS published
    FROM "medicalSource" s LEFT JOIN public_sources p ON p.id=s.id
  )
  UPDATE "medicalSource" s SET published=d.published
  FROM desired d WHERE d.id=s.id AND s.published IS DISTINCT FROM d.published;
  RETURN NULL;
END $$;

CREATE TRIGGER medical_source_publication_tree
AFTER INSERT OR DELETE OR UPDATE OF parent_id ON "medicalSource"
FOR EACH STATEMENT EXECUTE FUNCTION refresh_medical_source_publication();

CREATE TRIGGER medical_source_publication_intervals
AFTER INSERT OR DELETE OR UPDATE OF "sourceId" OR TRUNCATE ON "analysisPointIntervalValue"
FOR EACH STATEMENT EXECUTE FUNCTION refresh_medical_source_publication();

CREATE TRIGGER medical_source_publication_descriptions
AFTER INSERT OR DELETE OR UPDATE OF "sourceId" OR TRUNCATE ON "analysisResultDescription"
FOR EACH STATEMENT EXECUTE FUNCTION refresh_medical_source_publication();

-- Backfill through the same function used on later hierarchy changes.
UPDATE "medicalSource" SET parent_id=parent_id WHERE false;
`;
