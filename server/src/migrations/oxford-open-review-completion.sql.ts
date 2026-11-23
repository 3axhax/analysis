export const OXFORD_OPEN_REVIEW_COMPLETION_SQL = `
DO $$
DECLARE
  root_id integer;
  reviewed_count integer;
BEGIN
  SELECT id INTO STRICT root_id
  FROM "medicalSource"
  WHERE parent_id IS NULL AND url='https://academic.oup.com/'
  FOR UPDATE;

  WITH decisions(url, note) AS (
    VALUES
      ('https://academic.oup.com/jalm/article/7/6/1438/6678478',
       'Итог по открытому тексту: применимые интервалы ТТГ, FT3 и FT4 для Siemens Atellica из таблицы 1 уже внесены. Сравнительные таблицы и рисунки приложения в открытом виде получить не удалось. Новых данных для переноса нет.'),
      ('https://doi.org/10.1093/jalm/jfag169',
       'Итог по таблицам 1 и 2: мужской интервал общего пролактина Abbott Alinity i уже внесён. Женская выборка исключает беременность, а измерение после осаждения ПЭГ требует отдельного показателя. Эти условия сервис пока не учитывает. Дополнительный рисунок сравнения протоколов в открытом виде получить не удалось.'),
      ('https://doi.org/10.1093/clinchem/hvag128',
       'Итог по открытому основному тексту: методический обзор прямых и непрямых способов установления референсов, без собственного набора интервалов или правил интерпретации для переноса. DOCX приложения в открытом виде получить не удалось.'),
      ('https://doi.org/10.1093/jalm/jfag090',
       'Проверка закрыта по доступным метаданным. Открытый полный текст не получен, численные границы не подтверждены. T3 uptake — отдельный тест, которого нет в справочнике. Данные не внесены.'),
      ('https://doi.org/10.1093/jalm/jfac101',
       'В таблице 1 проверены оценки для 12 показателей по рутинным данным ARUP Laboratories (Roche cobas c502/e602). Авторы представляют их как примеры непрямой оценки и обсуждают зависимость от локальной выборки. Для общей расшифровки без привязки к этим условиям оценки не внесены. Открытые отдельные графики и пример кода не получены.')
  )
  UPDATE "medicalSource" AS source
  SET status='ANALYZED', comment=decisions.note
  FROM decisions
  WHERE source.parent_id=root_id AND source.url=decisions.url AND source.status='PARTIAL';

  GET DIAGNOSTICS reviewed_count=ROW_COUNT;
  IF reviewed_count<>5 THEN
    RAISE EXCEPTION 'Expected five Oxford review records, got %',reviewed_count;
  END IF;

  IF EXISTS (
    SELECT 1 FROM "medicalSource" WHERE parent_id=root_id
      AND status IS DISTINCT FROM 'ANALYZED'
      AND status IS DISTINCT FROM 'REJECTED_LICENSE'
      AND status IS DISTINCT FROM 'REJECTED_YEAR'
  ) THEN
    RAISE EXCEPTION 'Oxford catalog still has unresolved children';
  END IF;

  UPDATE "medicalSource"
  SET status='ANALYZED',
      comment='Завершена сверка профильной выборки шести журналов по тематическому запросу PubMed за 2020–2026 годы. По материалам, которые не удалось получить в открытом виде, закрыта проверка доступности, а ограничения указаны в дочерних записях.'
  WHERE id=root_id AND status='PARTIAL';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Expected partial Oxford Academic catalog';
  END IF;
END $$;
`;
