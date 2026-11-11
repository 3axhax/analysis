export const NEONATAL_BILIRUBIN_RUH_SQL = String.raw`
DO $$
DECLARE old_id integer; new_id integer; nmin integer; nmax integer; n integer;
BEGIN
 LOCK TABLE ages, "analysisPointMinValue", "analysisPointMaxValue", "medicalSource", translation IN SHARE ROW EXCLUSIVE MODE;
 SELECT id INTO STRICT old_id FROM ages WHERE name='1_3d' AND "intervalDayStart"=1 AND "intervalDayEnd"=3;
 IF EXISTS (SELECT 1 FROM ages WHERE name IN ('1_2d','3d')) OR EXISTS (SELECT 1 FROM ages WHERE id<>old_id AND "intervalDayStart"<=3 AND "intervalDayEnd">=1) THEN RAISE EXCEPTION 'Unexpected age groups'; END IF;
 IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata ? 'allowedAgeIds' AND jsonb_typeof(metadata->'allowedAgeIds')<>'array') THEN RAISE EXCEPTION 'Invalid source age metadata'; END IF;
 IF EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "ageId"=old_id GROUP BY "pointId","genderId","unitId","sourceId" HAVING count(*)>1) OR EXISTS (SELECT 1 FROM "analysisPointMaxValue" WHERE "ageId"=old_id GROUP BY "pointId","genderId","unitId","sourceId" HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate references'; END IF;
 IF (SELECT count(*) FROM "analysisPointMinValue" m JOIN ages a ON a.id=m."ageId" WHERE m."pointId"=37 AND m."sourceId" IS NULL AND ((a.name='0d' AND m.value=3.4) OR (a.name='1_3d' AND m.value=58) OR (a.name IN ('4_5d','6d') AND m.value=0)))<>8 OR (SELECT count(*) FROM "analysisPointMaxValue" m JOIN ages a ON a.id=m."ageId" WHERE m."pointId"=37 AND m."sourceId" IS NULL AND ((a.name='0d' AND m.value=21) OR (a.name='1_3d' AND m.value=197) OR (a.name='4_5d' AND m.value=29) OR (a.name='6d' AND m.value=37)))<>8 THEN RAISE EXCEPTION 'Unexpected bilirubin references'; END IF;
 IF EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='ages' AND submodule IN ('1_2d','3d')) OR EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='ages' AND submodule='1_3d' GROUP BY lang HAVING count(*)>1) THEN RAISE EXCEPTION 'Unexpected translations'; END IF;
 SELECT count(*) INTO nmin FROM "analysisPointMinValue" WHERE "ageId"=old_id;
 SELECT count(*) INTO nmax FROM "analysisPointMaxValue" WHERE "ageId"=old_id;
 IF nmin=0 OR nmax=0 THEN RAISE EXCEPTION 'Missing references'; END IF;
 UPDATE ages SET name='1_2d',"intervalDayEnd"=2 WHERE id=old_id;
 INSERT INTO ages(name,"intervalDayStart","intervalDayEnd") VALUES ('3d',3,3) RETURNING id INTO new_id;
 IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata->'allowedAgeIds' @> jsonb_build_array(new_id) AND NOT (metadata->'allowedAgeIds' @> jsonb_build_array(old_id))) THEN RAISE EXCEPTION 'Unexpected source age'; END IF;
 UPDATE translation SET submodule='1_2d',value=CASE WHEN lang='ru' THEN '1–2 дня' WHEN lang='en' THEN '1–2 days' ELSE value END WHERE namespace='entities' AND module='ages' AND submodule='1_3d';
 INSERT INTO translation(lang,namespace,module,submodule,value) SELECT 'ru','entities','ages','1_2d','1–2 дня' WHERE NOT EXISTS (SELECT 1 FROM translation WHERE lang='ru' AND namespace='entities' AND module='ages' AND submodule='1_2d');
 INSERT INTO translation(lang,namespace,module,submodule,value) SELECT 'en','entities','ages','1_2d','1–2 days' WHERE NOT EXISTS (SELECT 1 FROM translation WHERE lang='en' AND namespace='entities' AND module='ages' AND submodule='1_2d');
 INSERT INTO translation(lang,namespace,module,submodule,value) VALUES ('ru','entities','ages','3d','3 дня'),('en','entities','ages','3d','3 days');
 INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId","sourceId","lowInclusive",value) SELECT "pointId",new_id,"genderId","unitId","sourceId","lowInclusive",value FROM "analysisPointMinValue" WHERE "ageId"=old_id;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>nmin THEN RAISE EXCEPTION 'Min copy mismatch'; END IF;
 INSERT INTO "analysisPointMaxValue" ("pointId","ageId","genderId","unitId","sourceId",value) SELECT "pointId",new_id,"genderId","unitId","sourceId",value FROM "analysisPointMaxValue" WHERE "ageId"=old_id;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>nmax THEN RAISE EXCEPTION 'Max copy mismatch'; END IF;
 UPDATE "medicalSource" SET metadata=jsonb_set(metadata,'{allowedAgeIds}',(metadata->'allowedAgeIds') || jsonb_build_array(new_id),false) WHERE metadata->'allowedAgeIds' @> jsonb_build_array(old_id) AND NOT (metadata->'allowedAgeIds' @> jsonb_build_array(new_id));
 UPDATE "analysisPointMinValue" m SET value=CASE WHEN a.name='6d' THEN 3.4 ELSE 0 END FROM ages a WHERE a.id=m."ageId" AND a.name IN ('0d','1_2d','3d','4_5d','6d') AND m."pointId"=37 AND m."sourceId" IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>10 THEN RAISE EXCEPTION 'Bilirubin min mismatch'; END IF;
 UPDATE "analysisPointMaxValue" m SET value=CASE a.name WHEN '0d' THEN 100 WHEN '1_2d' THEN 140 WHEN '3d' THEN 200 WHEN '4_5d' THEN 200 ELSE 21 END FROM ages a WHERE a.id=m."ageId" AND a.name IN ('0d','1_2d','3d','4_5d','6d') AND m."pointId"=37 AND m."sourceId" IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>10 THEN RAISE EXCEPTION 'Bilirubin max mismatch'; END IF;
END $$;
`;
