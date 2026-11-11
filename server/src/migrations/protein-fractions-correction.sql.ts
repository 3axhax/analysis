export const PROTEIN_FRACTIONS_CORRECTION_SQL = String.raw`
DO $$
DECLARE spec record; beta1 integer; new_desc integer; rows_count integer; ages_count integer;
BEGIN
 LOCK TABLE "analysisPoint", "analysisPointMinValue", "analysisPointMaxValue", analysis_point_units, analysis_type_point, translation, "analysisResultDescription", "analysisResultDescriptionCondition" IN SHARE ROW EXCLUSIVE MODE;
 IF (SELECT count(*) FROM "analysisType" WHERE id=2 AND name='protein_fractions')<>1 OR (SELECT count(*) FROM "analysisPointUnits" WHERE (id=1 AND name='%') OR (id=2 AND name='g/l'))<>2 THEN RAISE EXCEPTION 'Unexpected type or units'; END IF;
 IF (SELECT count(*) FROM "analysisPoint" WHERE (id=4 AND name='albumin_fraction') OR (id=5 AND name='alpha-1_globulin_fraction') OR (id=58 AND name='alpha-2_globulins') OR (id=59 AND name='beta_globulins') OR (id=60 AND name='beta-2_globulins') OR (id=61 AND name='gamma_globulins') OR (id=27 AND name='total_protein') OR (id=40 AND name='cholesterol'))<>8 THEN RAISE EXCEPTION 'Unexpected points'; END IF;
 IF EXISTS (SELECT 1 FROM "analysisPoint" WHERE name='beta-1_globulins' OR "translationRu"='Бета-1 глобулины (BETA1)' OR "translationEn"='Beta-1 globulins (BETA1)') OR EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='analysisPoint' AND submodule='beta-1_globulins') THEN RAISE EXCEPTION 'Beta-1 already exists'; END IF;
 IF (SELECT count(*) FROM analysis_type_point WHERE "typeId"=2 AND "pointId" IN (4,5))<>2 OR EXISTS (SELECT 1 FROM analysis_type_point WHERE "typeId"=2 AND "pointId" IN (58,59,60,61)) THEN RAISE EXCEPTION 'Unexpected category links'; END IF;
 IF (SELECT count(*) FROM "analysisResultDescription" WHERE "sourceId" IS NULL AND ((id=62 AND md5(description_ru)='744e96454b9b6d1b635df4ad1988183b') OR (id=63 AND md5(description_ru)='bbfc9327a5f513d0ce6861bbbca93bd5') OR (id=67 AND md5(description_ru)='bfe119db3a97578dc6e1c38bba7c9f77') OR (id=70 AND md5(description_ru)='40720d87a13e7381f17483e3121af33e') OR (id=71 AND md5(description_ru)='0545e87db32c531040998129fc8a85a1')))<>5 THEN RAISE EXCEPTION 'Unexpected descriptions'; END IF;
 IF (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=62)<>2 OR (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=62 AND "pointId" IN (4,27) AND status='1')<>2 THEN RAISE EXCEPTION 'Unexpected albumin rule'; END IF;
 IF EXISTS (SELECT 1 FROM "analysisResultDescription" d JOIN "analysisResultDescriptionCondition" c ON c."descriptionId"=d.id WHERE d."sourceId" IS NULL GROUP BY d.id HAVING (count(*)=1 AND count(*) FILTER (WHERE c."pointId"=4 AND c.status='1')=1) OR (count(*)=2 AND count(*) FILTER (WHERE c."pointId" IN (40,60) AND c.status='1')=2)) THEN RAISE EXCEPTION 'Rule already exists'; END IF;
 SELECT count(*) INTO ages_count FROM ages;
 IF ages_count<>20 OR (SELECT count(*) FROM gender WHERE name IN ('m','f'))<>2 THEN RAISE EXCEPTION 'Unexpected age or gender dictionary'; END IF;
 INSERT INTO analysis_type_point ("typeId","pointId") SELECT 2,x FROM unnest(ARRAY[58,59,60,61]) AS x;
 INSERT INTO "analysisPoint" (name,"translationRu","translationEn","translationParsing") VALUES ('beta-1_globulins','Бета-1 глобулины (BETA1)','Beta-1 globulins (BETA1)','BETA1_Beta-1 globulins_Бета-1 глобулины') RETURNING id INTO beta1;
 INSERT INTO translation (lang,namespace,module,submodule,value) VALUES ('ru','entities','analysisPoint','beta-1_globulins','Бета-1 глобулины (BETA1)'),('en','entities','analysisPoint','beta-1_globulins','Beta-1 globulins (BETA1)');
 INSERT INTO analysis_type_point ("typeId","pointId") VALUES (2,beta1);
 FOR spec IN SELECT * FROM (VALUES (5,1,2.9::float8,4.9::float8),(58,1,7.1::float8,11.8::float8),(61,2,6::float8,13::float8),(beta1,1,4.7::float8,7.2::float8)) AS t(point_id,unit_id,lo,hi) LOOP
  IF EXISTS (SELECT 1 FROM analysis_point_units WHERE "pointId"=spec.point_id AND "unitsId"=spec.unit_id) OR EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "pointId"=spec.point_id AND "unitId"=spec.unit_id) OR EXISTS (SELECT 1 FROM "analysisPointMaxValue" WHERE "pointId"=spec.point_id AND "unitId"=spec.unit_id) THEN RAISE EXCEPTION 'Target reference already exists'; END IF;
  INSERT INTO analysis_point_units ("pointId","unitsId") VALUES (spec.point_id,spec.unit_id);
  INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId","sourceId","lowInclusive",value) SELECT spec.point_id,a.id,g.id,spec.unit_id,NULL,false,spec.lo FROM ages a CROSS JOIN gender g WHERE g.name IN ('m','f');
  GET DIAGNOSTICS rows_count=ROW_COUNT; IF rows_count<>ages_count*2 THEN RAISE EXCEPTION 'Minimum count mismatch'; END IF;
  INSERT INTO "analysisPointMaxValue" ("pointId","ageId","genderId","unitId","sourceId",value) SELECT spec.point_id,a.id,g.id,spec.unit_id,NULL,spec.hi FROM ages a CROSS JOIN gender g WHERE g.name IN ('m','f');
  GET DIAGNOSTICS rows_count=ROW_COUNT; IF rows_count<>ages_count*2 THEN RAISE EXCEPTION 'Maximum count mismatch'; END IF;
 END LOOP;
 UPDATE "analysisResultDescription" SET description_ru='<ul><li>Митохондриальная дисфункция, дефицит клеточной энергии</li></ul>',"updatedAt"=now() WHERE id=62;
 UPDATE "analysisResultDescription" SET description_ru=replace(description_ru,'вирусные инфекций','вирусные инфекции'),"updatedAt"=now() WHERE id=63;
 UPDATE "analysisResultDescription" SET description_ru=replace(description_ru,'Фибринологическое лечение','Фибринолитическое лечение'),"updatedAt"=now() WHERE id=67;
 UPDATE "analysisResultDescription" SET description_ru=replace(replace(description_ru,'Поздняя стадии','Поздние стадии'),'паразитарных заболеваниях','паразитарных заболеваний'),"updatedAt"=now() WHERE id=71;
 INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES ('Повышение альбуминовой фракции может встречаться при обезвоживании. Для оценки учитываются единица измерения и другие данные.',NULL,now(),now()) RETURNING id INTO new_desc;
 INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (new_desc,4,'1');
 INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES ('Повышение бета-2-глобулинов и холестерина может встречаться при нарушениях липидного обмена. По этому сочетанию причину определить нельзя.',NULL,now(),now()) RETURNING id INTO new_desc;
 INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (new_desc,60,'1'),(new_desc,40,'1');
END $$;
`;
