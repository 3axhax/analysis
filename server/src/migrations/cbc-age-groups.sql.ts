// Split only documented CBC age transitions; retain old references and snapshots.
export const CBC_AGE_GROUPS_SQL = String.raw`
DO $$
DECLARE spec record; fix record; old_id integer; new_id integer; point_id integer; unit_id integer;
        gender_row record; prior_min integer; prior_max integer; omitted_min integer; omitted_max integer;
        moved_count integer; expected_move integer; group_count integer;
        old_phrase text := 'Повышается только при железодефицитной анемии';
        new_phrase text := 'Повышается при железодефицитной анемии';
BEGIN
 LOCK TABLE ages, "analysisPointMinValue", "analysisPointMaxValue", "analysisResult", "medicalSource", translation, "analysisResultDescription" IN SHARE ROW EXCLUSIVE MODE;
 IF (SELECT count(*) FROM gender WHERE name IN ('m','f'))<>2 THEN RAISE EXCEPTION 'Expected both genders'; END IF;
 IF (SELECT count(*) FROM "analysisResultDescription" WHERE id=17 AND "sourceId" IS NULL AND position(old_phrase in description_ru)>0 AND position(old_phrase in replace(description_ru,old_phrase,''))=0)<>1 THEN RAISE EXCEPTION 'Unexpected RDW description'; END IF;
 FOR spec IN SELECT * FROM (VALUES
  ('1_3y','1_2y','2_3y',361,720,1080,'1–2 года','2–3 года','1–2 years','2–3 years'),
  ('3_5y','3_4y','4_5y',1081,1440,1800,'3–4 года','4–5 лет','3–4 years','4–5 years'),
  ('6_9y','6_8y','8_9y',2161,2880,3240,'6–8 лет','8–9 лет','6–8 years','8–9 years'),
  ('15_18y','15_16y','16_18y',5401,5760,6480,'15–16 лет','16–18 лет','15–16 years','16–18 years')
 ) AS x(old_name,first_name,second_name,start_day,split_day,end_day,first_ru,second_ru,first_en,second_en)
 LOOP
  SELECT id INTO STRICT old_id FROM ages WHERE name=spec.old_name AND "intervalDayStart"=spec.start_day AND "intervalDayEnd"=spec.end_day;
  IF EXISTS (SELECT 1 FROM ages WHERE name IN (spec.first_name,spec.second_name)) THEN RAISE EXCEPTION 'Target age already exists'; END IF;
  IF EXISTS (SELECT 1 FROM ages WHERE id<>old_id AND "intervalDayStart"<=spec.end_day AND "intervalDayEnd">=spec.start_day) THEN RAISE EXCEPTION 'Overlapping age interval'; END IF;
  IF EXISTS (SELECT 1 FROM "analysisResult" WHERE "ageId"=old_id AND ("ageInDays" IS NULL OR "ageInDays" NOT BETWEEN spec.start_day AND spec.end_day)) THEN RAISE EXCEPTION 'Historical result outside original age range'; END IF;
  IF EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "ageId"=old_id GROUP BY "pointId","genderId","unitId","sourceId" HAVING count(*)>1) OR EXISTS (SELECT 1 FROM "analysisPointMaxValue" WHERE "ageId"=old_id GROUP BY "pointId","genderId","unitId","sourceId" HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate age reference key'; END IF;
  IF EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='ages' AND submodule IN (spec.first_name,spec.second_name)) OR EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='ages' AND submodule=spec.old_name GROUP BY lang HAVING count(*)>1) THEN RAISE EXCEPTION 'Unexpected age translations'; END IF;
  IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata ? 'allowedAgeIds' AND jsonb_typeof(metadata->'allowedAgeIds')<>'array') THEN RAISE EXCEPTION 'Invalid source age metadata'; END IF;
  SELECT count(*) INTO prior_min FROM "analysisPointMinValue" WHERE "ageId"=old_id;
  SELECT count(*) INTO prior_max FROM "analysisPointMaxValue" WHERE "ageId"=old_id;
  IF prior_min=0 OR prior_max=0 THEN RAISE EXCEPTION 'Missing original references'; END IF;
  SELECT count(*) INTO expected_move FROM "analysisResult" WHERE "ageId"=old_id AND "ageInDays">spec.split_day;
  UPDATE ages SET name=spec.first_name,"intervalDayEnd"=spec.split_day WHERE id=old_id;
  INSERT INTO ages (name,"intervalDayStart","intervalDayEnd") VALUES (spec.second_name,spec.split_day+1,spec.end_day) RETURNING id INTO new_id;
  IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata->'allowedAgeIds' @> jsonb_build_array(new_id) AND NOT (metadata->'allowedAgeIds' @> jsonb_build_array(old_id))) THEN RAISE EXCEPTION 'New age already referenced by source'; END IF;
  UPDATE translation SET submodule=spec.first_name,value=CASE WHEN lang='ru' THEN spec.first_ru WHEN lang='en' THEN spec.first_en ELSE value END WHERE namespace='entities' AND module='ages' AND submodule=spec.old_name;
  INSERT INTO translation (lang,namespace,module,submodule,value)
    SELECT 'ru','entities','ages',spec.first_name,spec.first_ru WHERE NOT EXISTS (SELECT 1 FROM translation WHERE lang='ru' AND namespace='entities' AND module='ages' AND submodule=spec.first_name);
  INSERT INTO translation (lang,namespace,module,submodule,value)
    SELECT 'en','entities','ages',spec.first_name,spec.first_en WHERE NOT EXISTS (SELECT 1 FROM translation WHERE lang='en' AND namespace='entities' AND module='ages' AND submodule=spec.first_name);
  INSERT INTO translation (lang,namespace,module,submodule,value) VALUES ('ru','entities','ages',spec.second_name,spec.second_ru),('en','entities','ages',spec.second_name,spec.second_en);
  SELECT count(*) INTO omitted_min FROM "analysisPointMinValue" v JOIN "analysisPoint" p ON p.id=v."pointId" WHERE v."ageId"=old_id AND v."sourceId" IS NULL AND ((spec.second_name='4_5y' AND p.name IN ('leukocytes','lymphocyte-count','lymphocyte-percentage','monocyte-count','monocyte-percentage')) OR (spec.second_name='8_9y' AND p.name='leukocytes'));
  SELECT count(*) INTO omitted_max FROM "analysisPointMaxValue" v JOIN "analysisPoint" p ON p.id=v."pointId" WHERE v."ageId"=old_id AND v."sourceId" IS NULL AND ((spec.second_name='4_5y' AND p.name IN ('leukocytes','lymphocyte-count','lymphocyte-percentage','monocyte-count','monocyte-percentage')) OR (spec.second_name='8_9y' AND p.name='leukocytes'));
  INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId","sourceId","lowInclusive",value)
   SELECT v."pointId",new_id,v."genderId",v."unitId",v."sourceId",v."lowInclusive",v.value FROM "analysisPointMinValue" v JOIN "analysisPoint" p ON p.id=v."pointId" WHERE v."ageId"=old_id AND (v."sourceId" IS NOT NULL OR NOT ((spec.second_name='4_5y' AND p.name IN ('leukocytes','lymphocyte-count','lymphocyte-percentage','monocyte-count','monocyte-percentage')) OR (spec.second_name='8_9y' AND p.name='leukocytes')));
  GET DIAGNOSTICS group_count = ROW_COUNT;
  IF group_count<>prior_min-omitted_min THEN RAISE EXCEPTION 'Minimum copy mismatch'; END IF;
  INSERT INTO "analysisPointMaxValue" ("pointId","ageId","genderId","unitId","sourceId",value)
   SELECT v."pointId",new_id,v."genderId",v."unitId",v."sourceId",v.value FROM "analysisPointMaxValue" v JOIN "analysisPoint" p ON p.id=v."pointId" WHERE v."ageId"=old_id AND (v."sourceId" IS NOT NULL OR NOT ((spec.second_name='4_5y' AND p.name IN ('leukocytes','lymphocyte-count','lymphocyte-percentage','monocyte-count','monocyte-percentage')) OR (spec.second_name='8_9y' AND p.name='leukocytes')));
  GET DIAGNOSTICS group_count = ROW_COUNT;
  IF group_count<>prior_max-omitted_max THEN RAISE EXCEPTION 'Maximum copy mismatch'; END IF;
  UPDATE "analysisResult" SET "ageId"=new_id WHERE "ageId"=old_id AND "ageInDays">spec.split_day;
  GET DIAGNOSTICS moved_count = ROW_COUNT;
  IF moved_count<>expected_move THEN RAISE EXCEPTION 'Result age move mismatch'; END IF;
  UPDATE "medicalSource" SET metadata=jsonb_set(metadata,'{allowedAgeIds}',(metadata->'allowedAgeIds') || jsonb_build_array(new_id),false) WHERE metadata->'allowedAgeIds' @> jsonb_build_array(old_id) AND NOT (metadata->'allowedAgeIds' @> jsonb_build_array(new_id));
 END LOOP;
 FOR fix IN SELECT * FROM (VALUES
   ('lymphocyte-percentage','1_2y','%',33::float8,60::float8,37::float8,60::float8),
   ('lymphocyte-count','2_3y','10^9/l',3::float8,9.5::float8,2::float8,8::float8),
   ('lymphocyte-percentage','2_3y','%',33::float8,60::float8,33::float8,55::float8),
   ('leukocytes','2_3y','10^9/l',6::float8,17.5::float8,5.5::float8,14.5::float8),
   ('monocyte-count','2_3y','10^9/l',0.03::float8,0.8::float8,0.05::float8,0.8::float8),
   ('leukocytes','15_16y','10^9/l',4::float8,9::float8,4.5::float8,11.5::float8),
   ('monocyte-count','15_16y','10^9/l',0.05::float8,0.82::float8,0.05::float8,0.4::float8),
   ('monocyte-percentage','15_16y','%',2::float8,8::float8,3::float8,9::float8)
 ) AS x(point_name,age_name,unit_name,old_lo,old_hi,new_lo,new_hi)
 LOOP
  SELECT id INTO STRICT point_id FROM "analysisPoint" WHERE name=fix.point_name;
  SELECT id INTO STRICT old_id FROM ages WHERE name=fix.age_name;
  SELECT id INTO STRICT unit_id FROM "analysisPointUnits" WHERE name=fix.unit_name;
  FOR gender_row IN SELECT id FROM gender WHERE name IN ('m','f') LOOP
   IF (SELECT count(*) FROM "analysisPointMinValue" WHERE "pointId"=point_id AND "ageId"=old_id AND "genderId"=gender_row.id AND "sourceId" IS NULL)<>1 OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE "pointId"=point_id AND "ageId"=old_id AND "genderId"=gender_row.id AND "sourceId" IS NULL)<>1 OR NOT EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "pointId"=point_id AND "ageId"=old_id AND "genderId"=gender_row.id AND "unitId"=unit_id AND "sourceId" IS NULL AND "lowInclusive"=false AND value=fix.old_lo) OR NOT EXISTS (SELECT 1 FROM "analysisPointMaxValue" WHERE "pointId"=point_id AND "ageId"=old_id AND "genderId"=gender_row.id AND "unitId"=unit_id AND "sourceId" IS NULL AND value=fix.old_hi) THEN RAISE EXCEPTION 'Unexpected targeted age reference'; END IF;
   UPDATE "analysisPointMinValue" SET value=fix.new_lo WHERE "pointId"=point_id AND "ageId"=old_id AND "genderId"=gender_row.id AND "unitId"=unit_id AND "sourceId" IS NULL;
   UPDATE "analysisPointMaxValue" SET value=fix.new_hi WHERE "pointId"=point_id AND "ageId"=old_id AND "genderId"=gender_row.id AND "unitId"=unit_id AND "sourceId" IS NULL;
  END LOOP;
 END LOOP;
 UPDATE "analysisResultDescription" SET description_ru=replace(description_ru,old_phrase,new_phrase),"updatedAt"=now() WHERE id=17 AND "sourceId" IS NULL;
END $$;
`;
