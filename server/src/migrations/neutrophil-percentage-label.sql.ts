export const NEUTROPHIL_PERCENTAGE_LABEL_SQL = `
UPDATE "analysisPoint"
SET "translationRu" = 'Процентное соотношение нейтрофилов (NEU%)'
WHERE name = 'neutrophil-percentage'
  AND "translationRu" = 'Процентное соотношение (NEU%)';
`;
