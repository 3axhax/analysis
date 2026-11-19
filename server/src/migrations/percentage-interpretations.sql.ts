export const PERCENTAGE_INTERPRETATIONS_SQL = `
ALTER TABLE "analysisResultDescription"
  ADD COLUMN "alternativeToId" integer REFERENCES "analysisResultDescription"(id) ON DELETE SET NULL;

UPDATE translation
SET value = 'Процентное соотношение нейтрофилов (NEU%)'
WHERE lang = 'ru' AND namespace = 'entities' AND module = 'analysisPoint'
  AND submodule = 'neutrophil-percentage' AND value = 'Процентное соотношение (NEU%)';

DO $$
DECLARE
  rule record;
  description_text text;
  new_description_id integer;
  new_condition_id integer;
  target_point_id integer;
  linked_count integer;
  condition_index integer;
BEGIN
  -- The handbook lists both forms together on pp. 12–13.
  -- Keep the contextual WBC combinations and absolute-count notes separate (p. 17).
  UPDATE "analysisResultDescription"
  SET description_ru = 'Возможна вирусная инфекция.', "updatedAt" = now()
  WHERE id = 29 AND "sourceId" IS NULL AND description_ru = 'Вирусная инфекция';

  UPDATE "analysisResultDescription"
  SET description_ru = replace(replace(description_ru, 'Аутоиммуные', 'Аутоиммунные'), 'щитовидной железы )', 'щитовидной железы)'),
      "updatedAt" = now()
  WHERE id = 30 AND "sourceId" IS NULL;

  FOR rule IN SELECT * FROM (VALUES
    (27, ARRAY['neutrophil-percentage'], ARRAY['HIGH'], NULL),
    (28, ARRAY['neutrophil-percentage'], ARRAY['LOW'],
      '<ul><li>Иммунодефицит</li><li>Заболевания крови</li></ul>'),
    (29, ARRAY['neutrophil-percentage', 'lymphocyte-percentage'], ARRAY['LOW', 'HIGH'], NULL),
    (30, ARRAY['lymphocyte-percentage'], ARRAY['HIGH'], NULL),
    (32, ARRAY['lymphocyte-percentage'], ARRAY['LOW'], NULL),
    (34, ARRAY['monocyte-percentage'], ARRAY['HIGH'], NULL),
    (36, ARRAY['monocyte-percentage'], ARRAY['LOW'], NULL),
    (37, ARRAY['eosinophil-percentage'], ARRAY['HIGH'], NULL),
    (39, ARRAY['basophil-percentage'], ARRAY['HIGH'], NULL),
    (NULL, ARRAY['beta-1_globulins'], ARRAY['HIGH'],
      '<ul><li>Острое воспаление</li><li>Железодефицитная анемия</li><li>Нефротический синдром</li><li>Повышение эстрогенов</li><li>Приём КОК</li><li>Беременность</li><li>Опухоли</li></ul>'),
    (NULL, ARRAY['beta-1_globulins'], ARRAY['LOW'],
      '<ul><li>Печёночная недостаточность</li><li>Аутоиммунные состояния</li></ul>')
  ) AS rules(original_id, point_names, statuses, replacement_text)
  LOOP
    description_text := rule.replacement_text;
    IF description_text IS NULL THEN
      SELECT description_ru INTO STRICT description_text
      FROM "analysisResultDescription"
      WHERE id = rule.original_id AND "sourceId" IS NULL;
    END IF;

    INSERT INTO "analysisResultDescription" (description_ru, "sourceId", "alternativeToId", "createdAt", "updatedAt")
      VALUES (description_text, NULL, CASE WHEN rule.replacement_text IS NULL THEN rule.original_id END, now(), now())
      RETURNING id INTO new_description_id;

    FOR condition_index IN 1..cardinality(rule.point_names)
    LOOP
      SELECT id INTO STRICT target_point_id FROM "analysisPoint"
      WHERE name = rule.point_names[condition_index];

      INSERT INTO "analysisResultDescriptionCondition" ("descriptionId", "pointId")
        VALUES (new_description_id, target_point_id) RETURNING id INTO new_condition_id;

      INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId", "intervalId", "pointId")
      SELECT new_condition_id, interval_value.id, target_point_id
      FROM "analysisPointIntervalValue" interval_value
      JOIN "analysisPointUnits" unit ON unit.id = interval_value."unitId"
      WHERE interval_value."pointId" = target_point_id
        AND interval_value."sourceId" IS NULL
        AND interval_value.status = rule.statuses[condition_index]
        AND unit.code = '%';

      GET DIAGNOSTICS linked_count = ROW_COUNT;
      IF linked_count = 0 THEN
        RAISE EXCEPTION 'Missing common percentage intervals for %', rule.point_names[condition_index];
      END IF;
    END LOOP;
  END LOOP;
END $$;
`;
