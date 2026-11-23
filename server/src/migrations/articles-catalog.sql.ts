export const ARTICLES_CATALOG_SQL = `
ALTER TABLE "analysisType"
  ADD COLUMN "urlAlias" varchar(255) UNIQUE CHECK ("urlAlias" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ADD COLUMN "articleOrder" integer;

ALTER TABLE "analysisPoint"
  ADD COLUMN "urlAlias" varchar(255) UNIQUE CHECK ("urlAlias" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ADD COLUMN "pointDescriptionRu" text,
  ADD COLUMN "pointDescriptionEn" text;

UPDATE "analysisPoint"
SET "pointHintRu" = 'Ретикулоциты — незрелые эритроциты. Их количество помогает оценить, как костный мозг образует новые эритроциты.'
WHERE name = 'reticulocytes'
  AND "pointHintRu" LIKE 'Характеризует степень разжижения крови%';

UPDATE "analysisPoint"
SET "urlAlias" = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')),
    "pointDescriptionRu" = "pointHintRu",
    "pointDescriptionEn" = "pointHintEn";

CREATE TEMP TABLE article_catalog_seed (
  name text PRIMARY KEY, alias text NOT NULL, position integer NOT NULL,
  title_ru text NOT NULL, title_en text NOT NULL, point_names text[] NOT NULL
) ON COMMIT DROP;

INSERT INTO article_catalog_seed VALUES
  ('general_blood_test', 'obshchiy-analiz-krovi', 1, 'Общий анализ крови с лейкоцитарной формулой и СОЭ', 'Complete blood count with differential and ESR',
   ARRAY['hemoglobin','erythrocyte','hematocrit','mcv','mch','mchc','rdw','rdw-sd','platelets','mpv','reticulocytes','leukocytes','neutrophil-count','neutrophil-percentage','lymphocyte-count','lymphocyte-percentage','monocyte-count','monocyte-percentage','eosinophil-count','eosinophil-percentage','basophil-count','basophil-percentage','nlr','esr']),
  ('ferrum_test', 'anemiya-i-zhelezo', 2, 'Анемия или избыток железа', 'Anemia or iron overload',
   ARRAY['ferrum','transferrin','ferritin','tibc','ceruloplasmin','transferrin-saturation']),
  ('liver', 'pechen', 3, 'Оценка работы печени', 'Liver tests',
   ARRAY['alanine_aminotransferase','aspartate_aminotransferase','alkaline_phosphatase','ggtp','ldh','bilirubin','direct-bilirubin','indirect_bilirubin','de_ritis_ratio']),
  ('thyroid', 'gormony', 4, 'Щитовидная железа', 'Thyroid',
   ARRAY['tsh','ft3','ft4','antibodies-to-thyroglobulin','antibody-to-thyroid-peroxidase','urine-iodine-concentration']),
  ('kidneys', 'pochki', 5, 'Оценка работы почек', 'Kidney tests',
   ARRAY['urea','creatinine','ammonia','uric_acid']),
  ('carbohydrate_metabolism', 'uglevodnyy-obmen', 6, 'Углеводный обмен', 'Carbohydrate metabolism',
   ARRAY['glucose','insulin','glycated_hemoglobin','fructosamine','c-peptide','homa_ir']),
  ('lipid_metabolism', 'lipidnyy-obmen', 7, 'Липидный обмен', 'Lipid metabolism',
   ARRAY['cholesterol','hdl-cholesterol','ldl-cholesterol','triglycerides']),
  ('protein_fractions', 'belkovyy-obmen', 8, 'Белковый обмен', 'Protein metabolism',
   ARRAY['total_protein','albumin_fraction','alpha-1_globulin_fraction','alpha-2_globulins','beta_globulins','beta-1_globulins','beta-2_globulins','gamma_globulins']),
  ('electrolytes', 'elektrolity', 9, 'Электролиты', 'Electrolytes',
   ARRAY['na','k','ca','ionized_calcium','mg','p','cl']),
  ('vitamins_and_trace_elements', 'vitaminy-i-mikroelementy', 10, 'Витамины и микроэлементы', 'Vitamins and trace elements',
   ARRAY['vitamin-b12-plasma','vitamin-c-plasma','serum-retinol','vitamin-d-25oh-total','alpha-tocopherol','alpha-tocopherol-total-lipids-ratio','thiamine-diphosphate-whole-blood','thiamine-diphosphate-erythrocytes','erythrocyte-transketolase-activity','erythrocyte-glutathione-reductase-activation','urine-n1-methylnicotinamide-creatinine','urine-2-pyridone-creatinine','urine-2-pyridone-n1-mna-ratio','serum-folate','erythrocyte-folate','plasma-total-homocysteine','serum-copper','serum-zinc','urine-iodine-concentration','serum-selenium','selenoprotein-p','erythrocyte-glutathione-peroxidase-activity','alpha-tocopherol-cholesterol-ratio']),
  ('inflammation', 'vospalenie', 11, 'Воспаление', 'Inflammation',
   ARRAY['c-reactive-protein','procalcitonin']),
  ('other_hormones', 'drugie-gormony', 12, 'Другие гормоны', 'Other hormones',
   ARRAY['prolactin']),
  ('mineral_metabolism', 'mineralnyy-obmen', 13, 'Минеральный обмен', 'Mineral metabolism',
   ARRAY['urine-calcium-24h']);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM article_catalog_seed s
    CROSS JOIN LATERAL unnest(s.point_names) AS n(name)
    WHERE (SELECT count(*) FROM "analysisPoint" p WHERE trim(p.name) = n.name) <> 1
  ) THEN
    RAISE EXCEPTION 'Missing or ambiguous article catalog point';
  END IF;
END $$;

INSERT INTO "analysisType" (name, "urlAlias", "articleOrder")
SELECT name, alias, position FROM article_catalog_seed
ON CONFLICT (name) DO UPDATE
SET "urlAlias" = EXCLUDED."urlAlias", "articleOrder" = EXCLUDED."articleOrder";

ALTER TABLE analysis_type_point ADD COLUMN "articleOrder" integer;

INSERT INTO analysis_type_point ("typeId", "pointId", "articleOrder")
SELECT t.id, p.id, n.position
FROM article_catalog_seed s
JOIN "analysisType" t ON t.name = s.name
CROSS JOIN LATERAL unnest(s.point_names) WITH ORDINALITY AS n(name, position)
JOIN "analysisPoint" p ON trim(p.name) = n.name
ON CONFLICT ("typeId", "pointId") DO UPDATE SET "articleOrder" = EXCLUDED."articleOrder";

UPDATE translation t SET value = CASE t.lang::text WHEN 'ru' THEN s.title_ru ELSE s.title_en END
FROM article_catalog_seed s
WHERE t.namespace = 'entities' AND t.module = 'analysisType' AND t.submodule = s.name
  AND t.lang::text IN ('ru', 'en');

-- Seed translations missing from the catalog.
INSERT INTO translation (lang, namespace, module, submodule, value)
SELECT (json_populate_record(NULL::translation, json_build_object('lang', v.lang))).lang, 'entities', 'analysisType', s.name, v.title
FROM article_catalog_seed s
CROSS JOIN LATERAL (VALUES ('ru', s.title_ru), ('en', s.title_en)) v(lang, title)
WHERE NOT EXISTS (
  SELECT 1 FROM translation t
  WHERE t.lang::text = v.lang AND t.namespace = 'entities' AND t.module = 'analysisType' AND t.submodule = s.name
);
`;
