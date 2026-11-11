export const THYROID_ELECTROLYTE_CORRECTIONS_SQL = String.raw`
DO $$
DECLARE spec record; n integer; new_id integer; age_id integer; tsh_unit integer; sodium_unit integer;
BEGIN
 LOCK TABLE "analysisPointMinValue", "analysisPointMaxValue", "analysisResultDescription", "analysisResultDescriptionCondition" IN SHARE ROW EXCLUSIVE MODE;
 IF (SELECT count(*) FROM "analysisPoint" WHERE (id=48 AND name='tsh') OR (id=49 AND name='ft3') OR (id=50 AND name='ft4') OR (id=51 AND name='na') OR (id=52 AND name='k') OR (id=56 AND name='cl'))<>6 THEN RAISE EXCEPTION 'Point baseline mismatch'; END IF;
 SELECT id INTO STRICT tsh_unit FROM "analysisPointUnits" WHERE code='m[iU]/L';
 SELECT id INTO STRICT sodium_unit FROM "analysisPointUnits" WHERE code='mmol/L';
 FOR spec IN SELECT * FROM (VALUES
  ('6d',1.1::float,17::float,0.6::float,10::float),('7_30d',1.1,17,0.6,10),('1_2m',1.1,17,0.6,10),
  ('2_3m',0.6,10,0.4,5),('3_6m',0.6,10,0.4,5),('6_7m',0.6,10,0.4,5),('7_12m',0.6,10,0.4,5),('14_15y',0.4,3,0.4,2)
 ) AS x(age_name,old_min,old_max,new_min,new_max) LOOP
  SELECT id INTO STRICT age_id FROM ages WHERE name=spec.age_name;
  UPDATE "analysisPointMinValue" SET value=spec.new_min WHERE "pointId"=48 AND "ageId"=age_id AND "unitId"=tsh_unit AND "sourceId" IS NULL AND value=spec.old_min;
  GET DIAGNOSTICS n=ROW_COUNT; IF n<>2 THEN RAISE EXCEPTION 'TSH min mismatch %',spec.age_name; END IF;
  UPDATE "analysisPointMaxValue" SET value=spec.new_max WHERE "pointId"=48 AND "ageId"=age_id AND "unitId"=tsh_unit AND "sourceId" IS NULL AND value=spec.old_max;
  GET DIAGNOSTICS n=ROW_COUNT; IF n<>2 THEN RAISE EXCEPTION 'TSH max mismatch %',spec.age_name; END IF;
 END LOOP;
 SELECT id INTO STRICT age_id FROM ages WHERE name='10_12y';
 IF EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "pointId"=48 AND "ageId"=age_id AND "sourceId" IS NULL) OR EXISTS (SELECT 1 FROM "analysisPointMaxValue" WHERE "pointId"=48 AND "ageId"=age_id AND "sourceId" IS NULL) THEN RAISE EXCEPTION 'TSH age already has reference'; END IF;
 INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId","sourceId",value) SELECT 48,age_id,id,tsh_unit,NULL,0.4 FROM gender WHERE name IN ('m','f'); GET DIAGNOSTICS n=ROW_COUNT; IF n<>2 THEN RAISE EXCEPTION 'TSH added min count'; END IF;
 INSERT INTO "analysisPointMaxValue" ("pointId","ageId","genderId","unitId","sourceId",value) SELECT 48,age_id,id,tsh_unit,NULL,3 FROM gender WHERE name IN ('m','f'); GET DIAGNOSTICS n=ROW_COUNT; IF n<>2 THEN RAISE EXCEPTION 'TSH added max count'; END IF;
 IF (SELECT count(*) FROM "analysisPointMinValue" WHERE "pointId"=51 AND "sourceId" IS NULL AND "unitId"=sodium_unit AND value=138)<>60 OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE "pointId"=51 AND "sourceId" IS NULL AND "unitId"=sodium_unit AND value=145)<>60 THEN RAISE EXCEPTION 'Sodium reference mismatch'; END IF;
 UPDATE "analysisPointMinValue" SET value=136 WHERE "pointId"=51 AND "sourceId" IS NULL AND "unitId"=sodium_unit AND value=138; GET DIAGNOSTICS n=ROW_COUNT; IF n<>60 THEN RAISE EXCEPTION 'Sodium update count'; END IF;
 FOR spec IN SELECT * FROM (VALUES (113,'c5a2daefb0d434799109f0dd482a4c48'),(114,'3a26fdc61da887a78c09a3119ffb3dd7'),(115,'28837105ee7b5c202d67e3f8c428f944'),(116,'7a6657a98e74bea0e01ea183a440c4c3'),(118,'25f031324b06d5bc395def54d7f583f8'),(122,'d41d8cd98f00b204e9800998ecf8427e')) AS x(id,hash) LOOP
  IF NOT EXISTS (SELECT 1 FROM "analysisResultDescription" WHERE id=spec.id AND "sourceId" IS NULL AND md5(description_ru)=spec.hash) THEN RAISE EXCEPTION 'Description baseline mismatch %',spec.id; END IF;
 END LOOP;
 FOR spec IN SELECT * FROM (VALUES (114,'0','0'),(115,'1','-1'),(118,'0','-1')) AS x(id,tsh,ft3) LOOP
  IF (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=spec.id)<>2 OR NOT EXISTS (SELECT 1 FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=spec.id AND "pointId"=48 AND status::text=spec.tsh) OR NOT EXISTS (SELECT 1 FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=spec.id AND "pointId"=49 AND status::text=spec.ft3) THEN RAISE EXCEPTION 'Condition baseline mismatch %',spec.id; END IF;
  INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES(spec.id,50,(CASE WHEN spec.id=114 THEN '0' ELSE '-1' END)::"enum_analysisResultDescriptionCondition_status");
 END LOOP;
 UPDATE "analysisResultDescription" SET description_ru='<ul><li>уменьшение его выделения почками (заболевания почек)</li><li>чрезмерное поступление калия в организм, особенно в сочетании с нарушением функции почек</li><li>снижение эндокринной функции надпочечников – болезнь Аддисона, недостаточность коры надпочечников, снижение кортизола и альдостерона и нарушение водно-солевого обмена</li><li>ацидоз (нарушение кислотно-щелочного баланса организма)</li><li>снижение альдостерона</li><li>гемолиз эритроцитов</li><li>сгущение крови при обезвоживании</li><li>диабетический кетоз</li><li>псевдогипоальдостеронизм (почки задерживают слишком много калия и выделяют слишком много натрия и воды, приводя к артериальной гипотензии)</li></ul>',"updatedAt"=now() WHERE id=122 AND description_ru='' AND "sourceId" IS NULL;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'Potassium description mismatch'; END IF;
 FOR spec IN SELECT * FROM (VALUES
  (ARRAY[48,49,50],ARRAY['1','-1','0'],113,NULL::text),
  (ARRAY[48,49,50],ARRAY['0','-1','0'],114,NULL),
  (ARRAY[48,49,50],ARRAY['-1','0','0'],114,NULL),
  (ARRAY[48,49,50],ARRAY['-1','-1','0'],114,NULL),
  (ARRAY[48,49,50],ARRAY['0','-1','1'],116,NULL),
  (ARRAY[51,52,56],ARRAY['0','1','-1'],NULL,'Подозреваем гипофункцию надпочечников.'),
  (ARRAY[51,52,56],ARRAY['0','1','0'],NULL,'Подозреваем гипофункцию надпочечников.'),
  (ARRAY[51,52,56],ARRAY['0','-1','0'],NULL,'Подозреваем гипофункцию надпочечников.'),
  (ARRAY[51,52,56],ARRAY['1','0','-1'],NULL,'Подозреваем гиперфункцию надпочечников.'),
  (ARRAY[51,52,56],ARRAY['1','0','1'],NULL,'Подозреваем гиперфункцию надпочечников.'),
  (ARRAY[51,52,56],ARRAY['1','-1','-1'],NULL,'Подозреваем гиперфункцию надпочечников.'),
  (ARRAY[51,52,56],ARRAY['1','-1','1'],NULL,'Подозреваем гиперфункцию надпочечников.')
 ) AS x(points,statuses,copy_id,new_text) LOOP
  IF EXISTS (SELECT 1 FROM "analysisResultDescription" d JOIN "analysisResultDescriptionCondition" c ON c."descriptionId"=d.id WHERE d."sourceId" IS NULL GROUP BY d.id HAVING count(*)=cardinality(spec.points) AND count(*) FILTER (WHERE EXISTS (SELECT 1 FROM unnest(spec.points,spec.statuses) x(point_id,status) WHERE x.point_id=c."pointId" AND x.status=c.status::text))=cardinality(spec.points)) THEN RAISE EXCEPTION 'Combination already exists'; END IF;
  INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES (COALESCE(spec.new_text,(SELECT description_ru FROM "analysisResultDescription" WHERE id=spec.copy_id)),NULL,now(),now()) RETURNING id INTO new_id;
  INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) SELECT new_id,x.point_id,x.status::"enum_analysisResultDescriptionCondition_status" FROM unnest(spec.points,spec.statuses) x(point_id,status);
  GET DIAGNOSTICS n=ROW_COUNT; IF n<>cardinality(spec.points) THEN RAISE EXCEPTION 'New conditions mismatch'; END IF;
 END LOOP;
END $$;
`;
