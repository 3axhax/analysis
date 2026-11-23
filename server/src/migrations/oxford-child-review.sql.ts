export const OXFORD_CHILD_REVIEW_SQL = `
DO $$
DECLARE
  root_id integer;
  reviewed_count integer;
BEGIN
  SELECT id INTO STRICT root_id
  FROM "medicalSource"
  WHERE parent_id IS NULL AND url='https://academic.oup.com/'
  FOR UPDATE;

  WITH decisions(url, finished, note) AS (
    VALUES
      ('https://academic.oup.com/jalm/article/7/6/1438/6678478', false, 'Открытый основной PDF доступен у University of Helsinki. Отдельные сравнительные таблицы и рисунки приложения у издателя и в репозитории получить не удалось.'),
      ('https://doi.org/10.1093/clinchem/hvae089', true, 'Проверены полный текст и таблица 1. Возрастные и половые оценки креатинина сравнивают два варианта анализа ретроспективных больничных данных. Отбор по кластерам ICD-10 не имеет независимой проверки на референсной популяции. В общую расшифровку не перенесены.'),
      ('https://doi.org/10.1210/clinem/dgae057', true, 'Проверен полный текст. Парное сравнение оценивает криоактивацию ренина при хранении при −20 °C. Таблица с диапазонами обобщает другие работы с разными методами и условиями хранения. Собственных переносимых диапазонов авторы не установили.'),
      ('https://doi.org/10.1093/clinchem/hvaa271', true, 'Проверены полный текст, таблица S1 и рисунки S1–S3. 10-й и 90-й процентили служат границами отбора в анализе смертности NHANES. Дополнения описывают выбор переменных, чувствительность оценок и корреляции. Клинических границ или правил для общей расшифровки нет.'),
      ('https://doi.org/10.1210/clinem/dgz196', true, 'Проверены статья и приложение Figshare 10084145. Возрастные процентили E1 и E2 даны графиками. Таблица S8 даёт численные границы для женщин 24,7–43,9 года с разбивкой по фазам цикла, включая отдельную группу с подтверждённой овуляцией. Модель сервиса не учитывает фазу цикла; приближённые границы с графиков и фазовые диапазоны не импортированы.'),
      ('https://doi.org/10.1093/jalm/jfag169', false, 'Основная таблица повторно сверена. Открытый файл дополнительного рисунка 1 со сравнением методов получить не удалось.'),
      ('https://doi.org/10.1093/clinchem/hvag128', false, 'Основной текст методического обзора проверен. Отдельный DOCX приложения по публичной ссылке издателя получить не удалось.'),
      ('https://doi.org/10.1093/jalm/jfag090', false, 'PubMed и открытое оглавление подтверждают публикацию. Полный текст в открытом виде получить не удалось.'),
      ('https://doi.org/10.1093/jalm/jfac101', false, 'Основной текст и таблица проверены. Для завершения остались отдельный пример кода и дополнительные графики, на которые ссылается статья.')
  )
  UPDATE "medicalSource" AS source
  SET status=CASE WHEN decisions.finished THEN 'ANALYZED'::"medicalSourceAnalysisStatus"
                  ELSE source.status END,
      comment=CASE WHEN decisions.finished THEN decisions.note
           ELSE concat_ws(' ', source.comment, decisions.note) END
  FROM decisions
  WHERE source.parent_id=root_id AND source.url=decisions.url AND source.status='PARTIAL';

  GET DIAGNOSTICS reviewed_count=ROW_COUNT;
  IF reviewed_count<>9 THEN
    RAISE EXCEPTION 'Expected nine Oxford review records, got %',reviewed_count;
  END IF;

  UPDATE "medicalSource" SET
    comment='Сверена профильная выборка шести журналов по тематическому запросу PubMed за 2020–2026 годы. Корень частичный до проверки оставшихся открытых материалов, перечисленных в дочерних записях.'
  WHERE id=root_id AND status='PARTIAL';
END $$;
`;
