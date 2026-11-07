// Forward-only correction of source-specific thresholds and interpretations.
export const IRON_SOURCE_THRESHOLDS_SQL = `
ALTER TABLE "analysisPointMinValue"
  ADD COLUMN IF NOT EXISTS "lowInclusive" boolean NOT NULL DEFAULT false;

DO $$
DECLARE
  soppi integer;
  nutrition integer;
  hb integer;
  ferritin integer;
  iron integer;
  transferrin integer;
  tibc integer;
  hb_unit integer;
  adult integer;
  description_id integer;
  marker integer;
BEGIN
  SELECT id INTO STRICT soppi FROM "medicalSource" WHERE metadata->>'doi' = '10.1002/ccr3.1529';
  SELECT id INTO STRICT nutrition FROM "medicalSource" WHERE metadata->>'sourceKey' = 'nutritional-assessment-iron-2024';
  SELECT id INTO STRICT hb FROM "analysisPoint" WHERE name = 'hemoglobin';
  SELECT id INTO STRICT ferritin FROM "analysisPoint" WHERE name = 'ferritin';
  SELECT id INTO STRICT iron FROM "analysisPoint" WHERE name = 'ferrum';
  SELECT id INTO STRICT transferrin FROM "analysisPoint" WHERE name = 'transferrin';
  SELECT id INTO STRICT tibc FROM "analysisPoint" WHERE name = 'tibc';
  SELECT u.id INTO STRICT hb_unit FROM "analysisPointUnits" u JOIN analysis_point_units pu ON pu."unitsId"=u.id WHERE pu."pointId"=hb AND u.code='g/L';
  SELECT id INTO STRICT adult FROM ages WHERE name='u18y' AND "intervalDayStart"=6481 AND "intervalDayEnd"=72000;
  IF (SELECT count(*) FROM gender WHERE name IN ('m','f')) <> 2 THEN RAISE EXCEPTION 'Expected male and female reference groups'; END IF;
  IF (SELECT count(*) FROM "sourceReferenceInheritance" WHERE "sourceId" IN (soppi,nutrition) AND "pointId"=hb) <> 2 THEN RAISE EXCEPTION 'Expected inherited hemoglobin references'; END IF;
  IF EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "sourceId" IN (soppi,nutrition) AND "pointId"=hb) OR EXISTS (SELECT 1 FROM "analysisPointMaxValue" WHERE "sourceId" IN (soppi,nutrition) AND "pointId"=hb) THEN RAISE EXCEPTION 'Hemoglobin source references already exist'; END IF;

  DELETE FROM "sourceReferenceInheritance" WHERE "sourceId" IN (soppi,nutrition) AND "pointId"=hb;
  INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId",value,"sourceId","lowInclusive")
    SELECT hb,adult,id,hb_unit,CASE WHEN name='m' THEN 130 ELSE 120 END,soppi,true FROM gender WHERE name IN ('m','f');
  INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId",value,"sourceId","lowInclusive")
    SELECT hb,adult,id,hb_unit,CASE WHEN name='m' THEN 130 ELSE 120 END,nutrition,false FROM gender WHERE name IN ('m','f');
  UPDATE "analysisResultDescription" SET description_ru='Низкий ферритин может указывать на недостаток запасов железа, даже когда гемоглобин выше порога анемии, указанного в статье. Дефицит может оставаться незамеченным; для оценки важны симптомы, история кровопотерь и другие показатели.', "updatedAt"=now() WHERE "sourceId"=soppi;
  UPDATE "analysisResultDescription" SET description_ru='Сочетание низкого ферритина и гемоглобина может наблюдаться при дефиците железа с анемией. Для женщин использован порог для небеременных; при беременности он может отличаться. Для определения причины необходима оценка других показателей и клинического контекста.', "updatedAt"=now() WHERE "sourceId"=nutrition;
  UPDATE "medicalSource" SET metadata=metadata || '{"hemoglobinThresholdSource":"INACG / WHO / UNICEF, исторические пороги для уровня моря, таблица 17.7; для женщин — небеременные"}'::jsonb WHERE id=nutrition;

  FOREACH marker IN ARRAY ARRAY[iron,transferrin,tibc] LOOP
    INSERT INTO "sourceReferenceInheritance" ("sourceId","pointId") VALUES (nutrition,marker);
  END LOOP;
  INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES ('Низкое сывороточное железо в сочетании с повышенными трансферрином и общей железосвязывающей способностью может встречаться при недостатке железа. Для оценки причины необходимы другие показатели и клинический контекст. Статусы показателей определены по общим нормативам сервиса.',nutrition,now(),now()) RETURNING id INTO description_id;
  INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (description_id,iron,'0'),(description_id,transferrin,'1'),(description_id,tibc,'1');
  INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES ('Низкие сывороточное железо, трансферрин и общая железосвязывающая способность могут встречаться при воспалении и некоторых хронических заболеваниях. По этому сочетанию нельзя установить конкретную причину. Статусы показателей определены по общим нормативам сервиса.',nutrition,now(),now()) RETURNING id INTO description_id;
  INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (description_id,iron,'0'),(description_id,transferrin,'0'),(description_id,tibc,'0');
END $$;
`;
