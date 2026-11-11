export const LIVER_AGE_CORRECTION_SQL = String.raw`
DO $$
DECLARE s record; old_id integer; new_id integer; adult_id integer; nmin integer; nmax integer; n integer;
BEGIN
 LOCK TABLE ages, "analysisPointMinValue", "analysisPointMaxValue", "medicalSource", translation IN SHARE ROW EXCLUSIVE MODE;
 IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata ? 'allowedAgeIds' AND jsonb_typeof(metadata->'allowedAgeIds')<>'array') THEN RAISE EXCEPTION 'Invalid source metadata'; END IF;
 IF EXISTS (SELECT 1 FROM ages WHERE name IN ('4y','6_7y','7_8y','12_13y','13_14y','16_17y','17_18y')) THEN RAISE EXCEPTION 'Target age exists'; END IF;
 IF (SELECT count(*) FROM "analysisPointMinValue" m JOIN ages a ON a.id=m."ageId" WHERE m."sourceId" IS NULL AND ((a.name='3_4y' AND m."pointId"=33 AND m.value=0) OR (a.name='6_8y' AND m."pointId" IN (32,33) AND m.value=0) OR (a.name='12_14y' AND m."pointId"=33 AND m.value=0) OR (a.name='12_14y' AND m."pointId"=34 AND ((m."genderId"=1 AND m.value=116) OR (m."genderId"=2 AND m.value=57))) OR (a.name='18_19y' AND m."pointId"=34 AND ((m."genderId"=1 AND m.value=40) OR (m."genderId"=2 AND m.value=35)))))<>12 THEN RAISE EXCEPTION 'Unexpected old minimum'; END IF;
 IF (SELECT count(*) FROM "analysisPointMaxValue" m JOIN ages a ON a.id=m."ageId" WHERE m."sourceId" IS NULL AND ((a.name='3_4y' AND m."pointId"=33 AND m.value=48) OR (a.name='6_8y' AND ((m."pointId"=32 AND m.value=37) OR (m."pointId"=33 AND m.value=44))) OR (a.name='12_14y' AND ((m."pointId"=33 AND m.value=39) OR (m."pointId"=34 AND ((m."genderId"=1 AND m.value=468) OR (m."genderId"=2 AND m.value=254))))) OR (a.name='18_19y' AND m."pointId"=34 AND ((m."genderId"=1 AND m.value=130) OR (m."genderId"=2 AND m.value=105)))))<>12 THEN RAISE EXCEPTION 'Unexpected old maximum'; END IF;
 FOR s IN SELECT * FROM (VALUES
  ('3_4y','3_4y','4y',1081,1440,1440,'3–4 года','3–4 years','4 года','4 years'),
  ('6_8y','6_7y','7_8y',2161,2880,2520,'6–7 лет','6–7 years','7–8 лет','7–8 years'),
  ('12_14y','12_13y','13_14y',4321,5039,4680,'12–13 лет','12–13 years','13–14 лет','13–14 years'),
  ('16_18y','16_17y','17_18y',5761,6479,6120,'16–17 лет','16–17 years','17–18 лет','17–18 years')
 ) AS x(old_name,first_name,second_name,start_day,end_day,split_day,first_ru,first_en,second_ru,second_en) LOOP
  SELECT id INTO STRICT old_id FROM ages WHERE name=s.old_name AND "intervalDayStart"=s.start_day AND "intervalDayEnd"=s.end_day;
  IF EXISTS (SELECT 1 FROM ages WHERE id<>old_id AND "intervalDayStart"<=s.end_day AND "intervalDayEnd">=s.start_day) THEN RAISE EXCEPTION 'Overlapping age'; END IF;
  IF EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "ageId"=old_id GROUP BY "pointId","genderId","unitId","sourceId" HAVING count(*)>1) OR EXISTS (SELECT 1 FROM "analysisPointMaxValue" WHERE "ageId"=old_id GROUP BY "pointId","genderId","unitId","sourceId" HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate reference'; END IF;
  IF EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='ages' AND submodule=s.old_name GROUP BY lang HAVING count(*)>1) OR (s.first_name<>s.old_name AND EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='ages' AND submodule=s.first_name)) OR EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='ages' AND submodule=s.second_name) THEN RAISE EXCEPTION 'Unexpected age translations'; END IF;
  SELECT count(*) INTO nmin FROM "analysisPointMinValue" WHERE "ageId"=old_id;
  SELECT count(*) INTO nmax FROM "analysisPointMaxValue" WHERE "ageId"=old_id;
  IF nmin=0 OR nmax=0 THEN RAISE EXCEPTION 'Missing references'; END IF;
  UPDATE ages SET name=s.first_name,"intervalDayEnd"=s.split_day-1 WHERE id=old_id;
  INSERT INTO ages(name,"intervalDayStart","intervalDayEnd") VALUES (s.second_name,s.split_day,s.end_day) RETURNING id INTO new_id;
  IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata->'allowedAgeIds' @> jsonb_build_array(new_id) AND NOT (metadata->'allowedAgeIds' @> jsonb_build_array(old_id))) THEN RAISE EXCEPTION 'New age in metadata'; END IF;
  UPDATE translation SET submodule=s.first_name,value=CASE WHEN lang='ru' THEN s.first_ru WHEN lang='en' THEN s.first_en ELSE value END WHERE namespace='entities' AND module='ages' AND submodule=s.old_name;
  INSERT INTO translation(lang,namespace,module,submodule,value) SELECT 'ru','entities','ages',s.first_name,s.first_ru WHERE NOT EXISTS (SELECT 1 FROM translation WHERE lang='ru' AND namespace='entities' AND module='ages' AND submodule=s.first_name);
  INSERT INTO translation(lang,namespace,module,submodule,value) SELECT 'en','entities','ages',s.first_name,s.first_en WHERE NOT EXISTS (SELECT 1 FROM translation WHERE lang='en' AND namespace='entities' AND module='ages' AND submodule=s.first_name);
  INSERT INTO translation(lang,namespace,module,submodule,value) VALUES ('ru','entities','ages',s.second_name,s.second_ru),('en','entities','ages',s.second_name,s.second_en);
  INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId","sourceId","lowInclusive",value) SELECT "pointId",new_id,"genderId","unitId","sourceId","lowInclusive",value FROM "analysisPointMinValue" WHERE "ageId"=old_id;
  GET DIAGNOSTICS n=ROW_COUNT; IF n<>nmin THEN RAISE EXCEPTION 'Min copy mismatch'; END IF;
  INSERT INTO "analysisPointMaxValue" ("pointId","ageId","genderId","unitId","sourceId",value) SELECT "pointId",new_id,"genderId","unitId","sourceId",value FROM "analysisPointMaxValue" WHERE "ageId"=old_id;
  GET DIAGNOSTICS n=ROW_COUNT; IF n<>nmax THEN RAISE EXCEPTION 'Max copy mismatch'; END IF;
  UPDATE "medicalSource" SET metadata=jsonb_set(metadata,'{allowedAgeIds}',(metadata->'allowedAgeIds') || jsonb_build_array(new_id),false) WHERE metadata->'allowedAgeIds' @> jsonb_build_array(old_id) AND NOT (metadata->'allowedAgeIds' @> jsonb_build_array(new_id));
 END LOOP;
 UPDATE "analysisPointMaxValue" m SET value=59 FROM ages a WHERE m."ageId"=a.id AND a.name='3_4y' AND m."pointId"=33 AND m."sourceId" IS NULL AND m.value=48;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>2 THEN RAISE EXCEPTION 'AST 3–4 mismatch'; END IF;
 UPDATE "analysisPointMaxValue" m SET value=CASE m."pointId" WHEN 32 THEN 29 ELSE 48 END FROM ages a WHERE m."ageId"=a.id AND a.name='6_7y' AND m."pointId" IN (32,33) AND m."sourceId" IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>4 THEN RAISE EXCEPTION 'ALT AST 6–7 mismatch'; END IF;
 UPDATE "analysisPointMaxValue" m SET value=CASE m."pointId" WHEN 33 THEN 44 ELSE 417 END FROM ages a WHERE m."ageId"=a.id AND a.name='12_13y' AND m."pointId" IN (33,34) AND m."sourceId" IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>4 THEN RAISE EXCEPTION 'AST ALP 12–13 max mismatch'; END IF;
 UPDATE "analysisPointMinValue" m SET value=129 FROM ages a WHERE m."ageId"=a.id AND a.name='12_13y' AND m."pointId"=34 AND m."sourceId" IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>2 THEN RAISE EXCEPTION 'ALP 12–13 min mismatch'; END IF;
 UPDATE "analysisPointMinValue" m SET value=CASE m."genderId" WHEN 1 THEN 55 ELSE 45 END FROM ages a WHERE m."ageId"=a.id AND a.name IN ('17_18y','18_19y') AND m."pointId"=34 AND m."sourceId" IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>4 THEN RAISE EXCEPTION 'ALP 17–19 min mismatch'; END IF;
 UPDATE "analysisPointMaxValue" m SET value=CASE m."genderId" WHEN 1 THEN 149 ELSE 87 END FROM ages a WHERE m."ageId"=a.id AND a.name IN ('17_18y','18_19y') AND m."pointId"=34 AND m."sourceId" IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>4 THEN RAISE EXCEPTION 'ALP 17–19 max mismatch'; END IF;
END $$;
`;
