export const DE_RITIS_REFERENCE_SQL = String.raw`
DO $$
DECLARE point_id integer; unit_id integer; age_count integer; n integer; desc_id integer;
BEGIN
 LOCK TABLE "analysisPoint", "analysisPointUnits", analysis_point_units, "analysisPointMinValue", "analysisPointMaxValue", translation, "analysisResultDescription", "analysisResultDescriptionCondition" IN SHARE ROW EXCLUSIVE MODE;
 IF EXISTS (SELECT 1 FROM "analysisPoint" WHERE name='de_ritis_ratio') OR EXISTS (SELECT 1 FROM "analysisPointUnits" WHERE name='без ед.' OR code='1') OR EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND ((module='analysisPoint' AND submodule='de_ritis_ratio') OR (module='units' AND submodule='без ед.'))) THEN RAISE EXCEPTION 'Target point or unit exists'; END IF;
 IF (SELECT count(*) FROM "analysisPoint" WHERE (id=32 AND name='alanine_aminotransferase') OR (id=33 AND name='aspartate_aminotransferase'))<>2 OR (SELECT count(*) FROM "analysisPointUnits" WHERE id=12 AND name='unit/l')<>1 OR (SELECT count(*) FROM analysis_point_units WHERE ("pointId"=32 OR "pointId"=33) AND "unitsId"=12)<>2 OR (SELECT count(*) FROM gender WHERE name IN ('m','f'))<>2 THEN RAISE EXCEPTION 'Unexpected points, units or gender'; END IF;
 SELECT count(*) INTO age_count FROM ages; IF age_count=0 THEN RAISE EXCEPTION 'Missing ages'; END IF;
 INSERT INTO "analysisPointUnits" (name,code,"translationParsing","quantityKind") VALUES ('без ед.','1','','ratio') RETURNING id INTO unit_id;
 INSERT INTO "analysisPoint" (name,"translationRu","translationEn","translationParsing","pointHintRu") VALUES ('de_ritis_ratio','Коэффициент де Ритиса','De Ritis ratio','','Отношение активности АСТ к АЛТ. Расчётный показатель.') RETURNING id INTO point_id;
 INSERT INTO translation (lang,namespace,module,submodule,value) VALUES ('ru','entities','analysisPoint','de_ritis_ratio','Коэффициент де Ритиса'),('en','entities','analysisPoint','de_ritis_ratio','De Ritis ratio'),('ru','entities','units','без ед.','без ед.'),('en','entities','units','без ед.','unitless');
 INSERT INTO analysis_point_units ("pointId","unitsId") VALUES (point_id,unit_id);
 INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId","sourceId","lowInclusive",value) SELECT point_id,a.id,g.id,unit_id,NULL,false,0.91 FROM ages a CROSS JOIN gender g WHERE g.name IN ('m','f');
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>age_count*2 THEN RAISE EXCEPTION 'Min count'; END IF;
 INSERT INTO "analysisPointMaxValue" ("pointId","ageId","genderId","unitId","sourceId",value) SELECT point_id,a.id,g.id,unit_id,NULL,1.75 FROM ages a CROSS JOIN gender g WHERE g.name IN ('m','f');
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>age_count*2 THEN RAISE EXCEPTION 'Max count'; END IF;
 INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES ('Коэффициент де Ритиса ниже справочного диапазона. Подобное соотношение может встречаться при заболеваниях печени и в период восстановления; его оценивают вместе с АСТ, АЛТ и другими данными. Само по себе оно не устанавливает причину.',NULL,now(),now()) RETURNING id INTO desc_id;
 INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (desc_id,point_id,'0');
 INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES ('Коэффициент де Ритиса выше справочного диапазона. Подобное соотношение может встречаться при изменениях печени или мышечной ткани; его оценивают вместе с АСТ, АЛТ и другими данными. Само по себе оно не устанавливает причину.',NULL,now(),now()) RETURNING id INTO desc_id;
 INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (desc_id,point_id,'1');
END $$;
`;
