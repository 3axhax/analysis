export const MEDICAL_SOURCE_REFERENCE_SET_STATUS_SQL = `
UPDATE "medicalSource" AS reference_set
SET status = 'ANALYZED'
FROM "medicalSource" AS article
WHERE reference_set.parent_id = article.id
  AND article.parent_id IS NOT NULL
  AND article.status = 'ANALYZED'
  AND reference_set.status IS NULL
  AND reference_set.published
  AND rtrim(reference_set.url, '/') = rtrim(article.url, '/');
`;
