// Keep adult source scope while applying the documented MCHC interval at ages 18–19.
export const CBC_AGE_18_19_SQL = String.raw`
DO $$
DECLARE adult_id integer; previous_id integer; new_id integer; mchc_id integer; unit_id integer;
        prior_min integer; prior_max integer; copied integer; expected_move integer; moved integer;
BEGIN
 LOCK TABLE ages, "analysisPointMinValue", "analysisPointMaxValue", "analysisResult", "medicalSource", translation IN SHARE ROW EXCLUSIVE MODE;
 SELECT id INTO STRICT adult_id FROM ages WHERE name='u18y' AND "intervalDayStart"=6481 AND "intervalDayEnd"=72000;
 SELECT id INTO STRICT previous_id FROM ages WHERE name='16_18y' AND "intervalDayStart"=5761 AND "intervalDayEnd"=6480;
 SELECT id INTO STRICT mchc_id FROM "analysisPoint" WHERE name='mchc';
 SELECT id INTO STRICT unit_id FROM "analysisPointUnits" WHERE name='g/l';
 IF EXISTS (SELECT 1 FROM ages WHERE name IN ('18_19y','u19y')) THEN RAISE EXCEPTION 'Target age already exists'; END IF;
 IF EXISTS (SELECT 1 FROM ages WHERE id NOT IN (adult_id,previous_id) AND "intervalDayStart"<=6839 AND "intervalDayEnd">=6480) THEN RAISE EXCEPTION 'Unexpected overlapping ages'; END IF;
 IF (SELECT count(*) FROM gender WHERE name IN ('m','f'))<>2 OR NOT EXISTS (SELECT 1 FROM analysis_point_units WHERE "pointId"=mchc_id AND "unitsId"=unit_id) THEN RAISE EXCEPTION 'Unexpected gender or unit'; END IF;
 IF EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "ageId"=adult_id GROUP BY "pointId","genderId","unitId","sourceId" HAVING count(*)>1) OR EXISTS (SELECT 1 FROM "analysisPointMaxValue" WHERE "ageId"=adult_id GROUP BY "pointId","genderId","unitId","sourceId" HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate adult reference key'; END IF;
 IF (SELECT count(*) FROM "analysisPointMinValue" WHERE "ageId"=adult_id AND "pointId"=mchc_id AND "unitId"=unit_id AND "sourceId" IS NULL AND "lowInclusive"=false AND value=300)<>2 OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE "ageId"=adult_id AND "pointId"=mchc_id AND "unitId"=unit_id AND "sourceId" IS NULL AND value=380)<>2 OR (SELECT count(*) FROM "analysisPointMinValue" WHERE "ageId"=adult_id AND "pointId"=mchc_id AND "sourceId" IS NULL)<>2 OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE "ageId"=adult_id AND "pointId"=mchc_id AND "sourceId" IS NULL)<>2 THEN RAISE EXCEPTION 'Unexpected adult MCHC'; END IF;
 IF EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='ages' AND submodule IN ('18_19y','u19y')) OR EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='ages' AND submodule='u18y' GROUP BY lang HAVING count(*)>1) THEN RAISE EXCEPTION 'Unexpected age translations'; END IF;
 IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata ? 'allowedAgeIds' AND jsonb_typeof(metadata->'allowedAgeIds')<>'array') THEN RAISE EXCEPTION 'Invalid source age metadata'; END IF;
 SELECT count(*) INTO prior_min FROM "analysisPointMinValue" WHERE "ageId"=adult_id;
 SELECT count(*) INTO prior_max FROM "analysisPointMaxValue" WHERE "ageId"=adult_id;
 IF prior_min=0 OR prior_max=0 THEN RAISE EXCEPTION 'Missing adult references'; END IF;
 SELECT count(*) INTO expected_move FROM "analysisResult" WHERE ("ageId"=adult_id AND "ageInDays" BETWEEN 6480 AND 6839) OR ("ageId"=previous_id AND "ageInDays"=6480);
 UPDATE ages SET "intervalDayEnd"=6479 WHERE id=previous_id;
 UPDATE ages SET name='u19y',"intervalDayStart"=6840 WHERE id=adult_id;
 INSERT INTO ages (name,"intervalDayStart","intervalDayEnd") VALUES ('18_19y',6480,6839) RETURNING id INTO new_id;
 IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata->'allowedAgeIds' @> jsonb_build_array(new_id) AND NOT (metadata->'allowedAgeIds' @> jsonb_build_array(adult_id))) THEN RAISE EXCEPTION 'New age already referenced by source'; END IF;
 UPDATE translation SET submodule='u19y',value=CASE WHEN lang='ru' THEN '19 лет и старше' WHEN lang='en' THEN '19 years and older' ELSE value END WHERE namespace='entities' AND module='ages' AND submodule='u18y';
 INSERT INTO translation (lang,namespace,module,submodule,value) SELECT 'ru','entities','ages','u19y','19 лет и старше' WHERE NOT EXISTS (SELECT 1 FROM translation WHERE lang='ru' AND namespace='entities' AND module='ages' AND submodule='u19y');
 INSERT INTO translation (lang,namespace,module,submodule,value) SELECT 'en','entities','ages','u19y','19 years and older' WHERE NOT EXISTS (SELECT 1 FROM translation WHERE lang='en' AND namespace='entities' AND module='ages' AND submodule='u19y');
 INSERT INTO translation (lang,namespace,module,submodule,value) VALUES ('ru','entities','ages','18_19y','18–19 лет'),('en','entities','ages','18_19y','18–19 years');
 INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId","sourceId","lowInclusive",value) SELECT "pointId",new_id,"genderId","unitId","sourceId","lowInclusive",value FROM "analysisPointMinValue" WHERE "ageId"=adult_id;
 GET DIAGNOSTICS copied=ROW_COUNT;
 IF copied<>prior_min THEN RAISE EXCEPTION 'Adult minimum copy mismatch'; END IF;
 INSERT INTO "analysisPointMaxValue" ("pointId","ageId","genderId","unitId","sourceId",value) SELECT "pointId",new_id,"genderId","unitId","sourceId",value FROM "analysisPointMaxValue" WHERE "ageId"=adult_id;
 GET DIAGNOSTICS copied=ROW_COUNT;
 IF copied<>prior_max THEN RAISE EXCEPTION 'Adult maximum copy mismatch'; END IF;
 UPDATE "analysisPointMinValue" SET value=330 WHERE "pointId"=mchc_id AND "ageId"=new_id AND "unitId"=unit_id AND "sourceId" IS NULL;
 GET DIAGNOSTICS copied=ROW_COUNT;
 IF copied<>2 THEN RAISE EXCEPTION 'New MCHC minimum mismatch'; END IF;
 UPDATE "analysisPointMaxValue" SET value=340 WHERE "pointId"=mchc_id AND "ageId"=new_id AND "unitId"=unit_id AND "sourceId" IS NULL;
 GET DIAGNOSTICS copied=ROW_COUNT;
 IF copied<>2 THEN RAISE EXCEPTION 'New MCHC maximum mismatch'; END IF;
 UPDATE "analysisResult" SET "ageId"=new_id WHERE ("ageId"=adult_id AND "ageInDays" BETWEEN 6480 AND 6839) OR ("ageId"=previous_id AND "ageInDays"=6480);
 GET DIAGNOSTICS moved=ROW_COUNT;
 IF moved<>expected_move THEN RAISE EXCEPTION 'Result age move mismatch'; END IF;
 UPDATE "medicalSource" SET metadata=jsonb_set(metadata,'{allowedAgeIds}',(metadata->'allowedAgeIds') || jsonb_build_array(new_id),false) WHERE metadata->'allowedAgeIds' @> jsonb_build_array(adult_id) AND NOT (metadata->'allowedAgeIds' @> jsonb_build_array(new_id));
END $$;
`;
