export const MEDICAL_SOURCE_PARENT_ANALYSIS_STATUS_SQL = `
UPDATE "medicalSource" AS chapter
SET status = 'ANALYZED',
    comment = COALESCE(chapter.comment, 'Глава Iron разобрана в задаче 0010. Сохранены порог ферритина и интерпретация сочетания с пониженным гемоглобином.')
FROM "medicalSource" AS root
WHERE chapter.parent_id = root.id
  AND root.parent_id IS NULL
  AND root.name = 'Principles of Nutritional Assessment'
  AND chapter.url = 'https://nutritionalassessment.org/iron/'
  AND chapter.status IS NULL;

UPDATE "medicalSource" AS root
SET status = 'ANALYZED',
    comment = COALESCE(root.comment, 'Третье издание: сверены все 36 глав по оглавлению, включая ранее разобранную главу Iron. Задача 0041.')
WHERE root.parent_id IS NULL
  AND root.name = 'Principles of Nutritional Assessment'
  AND root.status IS NULL
  AND (
    SELECT count(*) = 36
       AND bool_and(COALESCE(chapter.status IN ('ANALYZED', 'REJECTED_LICENSE', 'REJECTED_YEAR'), false))
    FROM "medicalSource" AS chapter
    WHERE chapter.parent_id = root.id
  );

UPDATE "medicalSource" AS root
SET status = 'PARTIAL',
    comment = COALESCE(root.comment, 'Проверены отдельные подборки публикаций. Полный охват каталога не подтверждён.')
WHERE root.parent_id IS NULL
  AND root.name = 'PubMed Central'
  AND root.status IS NULL
  AND EXISTS (
    SELECT 1 FROM "medicalSource" AS article
    WHERE article.parent_id = root.id AND article.status IS NOT NULL
  );
`;
