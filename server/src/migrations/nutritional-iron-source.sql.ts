export const NUTRITIONAL_IRON_SOURCE_SQL = `
DO $$
DECLARE
  ferritin_id integer;
  hemoglobin_id integer;
  ferritin_unit_id integer;
  hemoglobin_unit_id integer;
  adult_age_id integer;
  root_id integer;
  document_id integer;
  description_id integer;
  gender_row record;
BEGIN
  SELECT id INTO STRICT ferritin_id FROM "analysisPoint" WHERE name = 'ferritin';
  SELECT id INTO STRICT hemoglobin_id FROM "analysisPoint" WHERE name = 'hemoglobin';
  SELECT u.id INTO STRICT ferritin_unit_id FROM "analysisPointUnits" u
    JOIN analysis_point_units pu ON pu."unitsId" = u.id
    WHERE pu."pointId" = ferritin_id AND u.code = 'ug/L';
  SELECT u.id INTO STRICT hemoglobin_unit_id FROM "analysisPointUnits" u
    JOIN analysis_point_units pu ON pu."unitsId" = u.id
    WHERE pu."pointId" = hemoglobin_id AND u.code = 'g/L';
  SELECT id INTO STRICT adult_age_id FROM ages WHERE name = 'u18y'
    AND "intervalDayStart" = 6481 AND "intervalDayEnd" = 72000;
  IF (SELECT count(*) FROM gender WHERE name IN ('m', 'f')) <> 2 THEN
    RAISE EXCEPTION 'Expected male and female reference groups';
  END IF;
  IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata->>'sourceKey' = 'nutritional-assessment-iron-2024') THEN
    RAISE EXCEPTION 'Source already exists';
  END IF;
  FOR gender_row IN SELECT id FROM gender WHERE name IN ('m', 'f') LOOP
    IF (SELECT count(*) FROM "analysisPointMinValue" WHERE "sourceId" IS NULL AND "pointId" = hemoglobin_id AND "ageId" = adult_age_id AND "genderId" = gender_row.id AND "unitId" = hemoglobin_unit_id) <> 1
      OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE "sourceId" IS NULL AND "pointId" = hemoglobin_id AND "ageId" = adult_age_id AND "genderId" = gender_row.id AND "unitId" = hemoglobin_unit_id) <> 1
      OR EXISTS (SELECT 1 FROM "analysisPointMinValue" lo JOIN "analysisPointMaxValue" hi ON hi."pointId" = lo."pointId" AND hi."ageId" = lo."ageId" AND hi."genderId" = lo."genderId" AND hi."unitId" = lo."unitId" AND hi."sourceId" IS NULL WHERE lo."sourceId" IS NULL AND lo."pointId" = hemoglobin_id AND lo."ageId" = adult_age_id AND lo."genderId" = gender_row.id AND lo."unitId" = hemoglobin_unit_id AND lo.value > hi.value) THEN
      RAISE EXCEPTION 'Adult hemoglobin reference missing or ambiguous';
    END IF;
  END LOOP;
  INSERT INTO "medicalSource" (parent_id, name, metadata)
    VALUES (NULL, 'Principles of Nutritional Assessment', '{"url":"https://nutritionalassessment.org/","type":"publication"}'::jsonb)
    RETURNING id INTO root_id;
  INSERT INTO "medicalSource" (parent_id, name, metadata)
    VALUES (root_id, 'Gibson и Friel: оценка обмена железа (2024)',
      '{"sourceKey":"nutritional-assessment-iron-2024","url":"https://nutritionalassessment.org/iron/","authors":"Gibson RS, Friel JK","title":"Principles of Nutritional Assessment: Iron, 3rd edition","year":2024,"license":"CC BY 4.0","licenseUrl":"https://creativecommons.org/licenses/by/4.0/","translation":"Русский текст адаптирован сервисом","section":"17.10, таблицы 17.33–17.34","underlyingSource":"Lynch et al., Biomarkers of Nutrition for Development (BOND) — Iron Review, 2018","underlyingSourceUrl":"https://pmc.ncbi.nlm.nih.gov/articles/PMC6297556/","scope":"Взрослые; ограничение для пилота"}'::jsonb)
    RETURNING id INTO document_id;
  INSERT INTO "sourceReferenceInheritance" ("sourceId", "pointId") VALUES (document_id, hemoglobin_id);
  INSERT INTO "analysisPointMinValue" ("pointId", "ageId", "genderId", "unitId", value, "sourceId")
    SELECT ferritin_id, adult_age_id, id, ferritin_unit_id, 15, document_id FROM gender WHERE name IN ('m', 'f');
  INSERT INTO "analysisResultDescription" (description_ru, "sourceId", "createdAt", "updatedAt")
    VALUES ('Сочетание низкого ферритина и сниженного гемоглобина может наблюдаться при дефиците железа с анемией. Для определения причины необходима оценка других показателей и клинического контекста.', document_id, now(), now())
    RETURNING id INTO description_id;
  INSERT INTO "analysisResultDescriptionCondition" ("descriptionId", "pointId", status)
    VALUES (description_id, ferritin_id, '0'), (description_id, hemoglobin_id, '0');
END $$;
`;
