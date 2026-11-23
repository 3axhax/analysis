export const POINT_TITLE_CAPITALIZATION_SQL = `
CREATE TEMP TABLE point_title_corrections (
  name text NOT NULL,
  lang text NOT NULL,
  previous_title text NOT NULL,
  title text NOT NULL,
  PRIMARY KEY (name, lang)
) ON COMMIT DROP;

INSERT INTO point_title_corrections VALUES
  ('alkaline_phosphatase', 'ru', 'щелочная фосфатаза (ALP)', 'Щелочная фосфатаза (ALP)'),
  ('direct-bilirubin', 'ru', 'прямой билирубин (DBIL)', 'Прямой билирубин (DBIL)'),
  ('cholesterol', 'ru', 'холестерин (CHOL)', 'Холестерин (CHOL)'),
  ('p', 'ru', 'фосфор (P)', 'Фосфор (P)'),
  ('cl', 'ru', 'хлориды (Cl)', 'Хлориды (Cl)'),
  ('hematocrit', 'en', 'hematocrit (HCT)', 'Hematocrit (HCT)'),
  ('neutrophil-count', 'en', 'neutrophil-count', 'Neutrophil count'),
  ('aspartate_aminotransferase', 'en', 'aspartate aminotransferase (AST)', 'Aspartate aminotransferase (AST)'),
  ('alkaline_phosphatase', 'en', 'alkaline phosphatase (ALP)', 'Alkaline phosphatase (ALP)'),
  ('direct-bilirubin', 'en', 'direct bilirubin (DBIL)', 'Direct bilirubin (DBIL)'),
  ('indirect_bilirubin', 'en', 'indirect bilirubin (IBIL)', 'Indirect bilirubin (IBIL)'),
  ('cholesterol', 'en', 'cholesterol (CHOL)', 'Cholesterol (CHOL)');

UPDATE "analysisPoint" p
SET "translationRu" = c.title
FROM point_title_corrections c
WHERE p.name = c.name AND c.lang = 'ru' AND p."translationRu" = c.previous_title;

UPDATE "analysisPoint" p
SET "translationEn" = c.title
FROM point_title_corrections c
WHERE p.name = c.name AND c.lang = 'en' AND p."translationEn" = c.previous_title;

UPDATE translation t
SET value = c.title
FROM point_title_corrections c
WHERE t.namespace = 'entities' AND t.module = 'analysisPoint'
  AND t.submodule = c.name AND t.lang::text = c.lang AND t.value = c.previous_title;
`;
