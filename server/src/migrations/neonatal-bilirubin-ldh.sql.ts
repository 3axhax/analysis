export const NEONATAL_BILIRUBIN_LDH_SQL = String.raw`
DO $$
DECLARE old_id integer; new_id integer; s record; nmin integer; nmax integer; n integer;
BEGIN
 LOCK TABLE ages, "analysisPointMinValue", "analysisPointMaxValue", "medicalSource", translation IN SHARE ROW EXCLUSIVE MODE;
 SELECT id INTO STRICT old_id FROM ages WHERE name='0_1m' AND "intervalDayStart"=0 AND "intervalDayEnd"=30;
 IF EXISTS (SELECT 1 FROM ages WHERE name IN ('0d','1_3d','4_5d','6d','7_30d')) OR EXISTS (SELECT 1 FROM ages WHERE id<>old_id AND "intervalDayStart"<=30 AND "intervalDayEnd">=0) THEN RAISE EXCEPTION 'Unexpected ages'; END IF;
 IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata ? 'allowedAgeIds' AND jsonb_typeof(metadata->'allowedAgeIds')<>'array') THEN RAISE EXCEPTION 'Invalid source metadata'; END IF;
 IF EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "ageId"=old_id GROUP BY "pointId","genderId","unitId","sourceId" HAVING count(*)>1) OR EXISTS (SELECT 1 FROM "analysisPointMaxValue" WHERE "ageId"=old_id GROUP BY "pointId","genderId","unitId","sourceId" HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate reference'; END IF;
 IF (SELECT count(*) FROM "analysisPointMinValue" WHERE "ageId"=old_id AND "pointId"=37 AND "sourceId" IS NULL AND value=3.4)<>2 OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE "ageId"=old_id AND "pointId"=37 AND "sourceId" IS NULL AND value=21)<>2 THEN RAISE EXCEPTION 'Unexpected bilirubin'; END IF;
 IF (SELECT count(*) FROM "analysisPointMinValue" m JOIN ages a ON a.id=m."ageId" WHERE a.name='17_18y' AND m."pointId"=65 AND m."sourceId" IS NULL AND m.value=0)<>2 OR (SELECT count(*) FROM "analysisPointMaxValue" m JOIN ages a ON a.id=m."ageId" WHERE a.name='17_18y' AND m."pointId"=65 AND m."sourceId" IS NULL AND m.value=279)<>2 THEN RAISE EXCEPTION 'Unexpected LDH'; END IF;
 IF EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='ages' AND submodule IN ('0d','1_3d','4_5d','6d','7_30d')) OR EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='ages' AND submodule='0_1m' GROUP BY lang HAVING count(*)>1) THEN RAISE EXCEPTION 'Unexpected translations'; END IF;
 SELECT count(*) INTO nmin FROM "analysisPointMinValue" WHERE "ageId"=old_id;
 SELECT count(*) INTO nmax FROM "analysisPointMaxValue" WHERE "ageId"=old_id;
 IF nmin=0 OR nmax=0 THEN RAISE EXCEPTION 'Missing age references'; END IF;
 UPDATE ages SET name='7_30d',"intervalDayStart"=7 WHERE id=old_id;
 UPDATE translation SET submodule='7_30d',value=CASE WHEN lang='ru' THEN '7–30 дней' WHEN lang='en' THEN '7–30 days' ELSE value END WHERE namespace='entities' AND module='ages' AND submodule='0_1m';
 INSERT INTO translation(lang,namespace,module,submodule,value) SELECT 'ru','entities','ages','7_30d','7–30 дней' WHERE NOT EXISTS (SELECT 1 FROM translation WHERE lang='ru' AND namespace='entities' AND module='ages' AND submodule='7_30d');
 INSERT INTO translation(lang,namespace,module,submodule,value) SELECT 'en','entities','ages','7_30d','7–30 days' WHERE NOT EXISTS (SELECT 1 FROM translation WHERE lang='en' AND namespace='entities' AND module='ages' AND submodule='7_30d');
 FOR s IN SELECT * FROM (VALUES ('0d',0,0,'0 дней','0 days'),('1_3d',1,3,'1–3 дня','1–3 days'),('4_5d',4,5,'4–5 дней','4–5 days'),('6d',6,6,'6 дней','6 days')) AS x(name,start_day,end_day,ru,en) LOOP
  INSERT INTO ages(name,"intervalDayStart","intervalDayEnd") VALUES (s.name,s.start_day,s.end_day) RETURNING id INTO new_id;
  IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata->'allowedAgeIds' @> jsonb_build_array(new_id) AND NOT (metadata->'allowedAgeIds' @> jsonb_build_array(old_id))) THEN RAISE EXCEPTION 'New age already in source scope'; END IF;
  INSERT INTO translation(lang,namespace,module,submodule,value) VALUES ('ru','entities','ages',s.name,s.ru),('en','entities','ages',s.name,s.en);
  INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId","sourceId","lowInclusive",value) SELECT "pointId",new_id,"genderId","unitId","sourceId","lowInclusive",value FROM "analysisPointMinValue" WHERE "ageId"=old_id;
  GET DIAGNOSTICS n=ROW_COUNT; IF n<>nmin THEN RAISE EXCEPTION 'Min copy mismatch'; END IF;
  INSERT INTO "analysisPointMaxValue" ("pointId","ageId","genderId","unitId","sourceId",value) SELECT "pointId",new_id,"genderId","unitId","sourceId",value FROM "analysisPointMaxValue" WHERE "ageId"=old_id;
  GET DIAGNOSTICS n=ROW_COUNT; IF n<>nmax THEN RAISE EXCEPTION 'Max copy mismatch'; END IF;
  UPDATE "medicalSource" SET metadata=jsonb_set(metadata,'{allowedAgeIds}',(metadata->'allowedAgeIds') || jsonb_build_array(new_id),false) WHERE metadata->'allowedAgeIds' @> jsonb_build_array(old_id) AND NOT (metadata->'allowedAgeIds' @> jsonb_build_array(new_id));
  IF s.name IN ('1_3d','4_5d','6d') THEN
   UPDATE "analysisPointMinValue" SET value=CASE WHEN s.name='1_3d' THEN 58 ELSE 0 END WHERE "ageId"=new_id AND "pointId"=37 AND "sourceId" IS NULL;
   GET DIAGNOSTICS n=ROW_COUNT; IF n<>2 THEN RAISE EXCEPTION 'Bilirubin min mismatch'; END IF;
   UPDATE "analysisPointMaxValue" SET value=CASE s.name WHEN '1_3d' THEN 197 WHEN '4_5d' THEN 29 ELSE 37 END WHERE "ageId"=new_id AND "pointId"=37 AND "sourceId" IS NULL;
   GET DIAGNOSTICS n=ROW_COUNT; IF n<>2 THEN RAISE EXCEPTION 'Bilirubin max mismatch'; END IF;
  END IF;
 END LOOP;
 UPDATE "analysisPointMinValue" m SET value=135 FROM ages a WHERE a.id=m."ageId" AND a.name='17_18y' AND m."pointId"=65 AND m."sourceId" IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>2 THEN RAISE EXCEPTION 'LDH min mismatch'; END IF;
 UPDATE "analysisPointMaxValue" m SET value=214 FROM ages a WHERE a.id=m."ageId" AND a.name='17_18y' AND m."pointId"=65 AND m."sourceId" IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>2 THEN RAISE EXCEPTION 'LDH max mismatch'; END IF;
END $$;
`;
