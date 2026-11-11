export const HOMA_AND_METABOLIC_COMBINATIONS_SQL = String.raw`
DO $$
DECLARE homa integer; unit_id integer; spec record; new_id integer; n integer; age_count integer;
BEGIN
 LOCK TABLE "analysisPoint", "analysisPointUnits", analysis_point_units, "analysisPointMinValue", "analysisPointMaxValue", translation, "analysisResultDescription", "analysisResultDescriptionCondition" IN SHARE ROW EXCLUSIVE MODE;
 IF EXISTS (SELECT 1 FROM "analysisPoint" WHERE name='homa_ir') OR EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='analysisPoint' AND submodule='homa_ir') THEN RAISE EXCEPTION 'HOMA already exists'; END IF;
 IF (SELECT count(*) FROM "analysisPoint" WHERE (id=40 AND name='cholesterol') OR (id=41 AND name='hdl-cholesterol') OR (id=42 AND name='ldl-cholesterol') OR (id=43 AND name='triglycerides') OR (id=44 AND name='glucose') OR (id=45 AND name='insulin') OR (id=66 AND name='glycated_hemoglobin'))<>7 THEN RAISE EXCEPTION 'Unexpected points'; END IF;
 SELECT id INTO STRICT unit_id FROM "analysisPointUnits" WHERE code='1';
 SELECT count(*) INTO age_count FROM ages; IF age_count=0 OR (SELECT count(*) FROM gender WHERE name IN ('m','f'))<>2 THEN RAISE EXCEPTION 'Missing demographics'; END IF;
 INSERT INTO "analysisPoint" (name,"translationRu","translationEn","translationParsing","pointHintRu") VALUES ('homa_ir','Индекс HOMA-IR','HOMA-IR index','','Расчётный показатель.') RETURNING id INTO homa;
 INSERT INTO translation (lang,namespace,module,submodule,value) VALUES ('ru','entities','analysisPoint','homa_ir','Индекс HOMA-IR'),('en','entities','analysisPoint','homa_ir','HOMA-IR index');
 INSERT INTO analysis_point_units ("pointId","unitsId") VALUES (homa,unit_id);
 INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId","sourceId","lowInclusive",value) SELECT homa,a.id,g.id,unit_id,NULL,false,0 FROM ages a CROSS JOIN gender g WHERE g.name IN ('m','f');
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>age_count*2 THEN RAISE EXCEPTION 'HOMA min count'; END IF;
 INSERT INTO "analysisPointMaxValue" ("pointId","ageId","genderId","unitId","sourceId",value) SELECT homa,a.id,g.id,unit_id,NULL,2.7 FROM ages a CROSS JOIN gender g WHERE g.name IN ('m','f');
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>age_count*2 THEN RAISE EXCEPTION 'HOMA max count'; END IF;
 FOR spec IN SELECT * FROM (VALUES
  (ARRAY[40,41,42,43],ARRAY['-1','0','-1','-1'],'Исключить заболевания кишечника, гипотиреоз (ТТГ, Т3св, Т4св), гипергликемию (глюкоза и инсулин), нарушение синтетической функции печени (АЛТ, АСТ), работать над жёлчью, сдать анализ на омега-3 индекс, нужны добавки для мембраны клетки, повысить физическую активность.'),
  (ARRAY[40,41,42,43],ARRAY['1','-1','1','1'],'Проверить состояние печени, здесь например, точно избыток простых углеводов, много сахаров, нет физической активности, даже если вес в норме.'),
  (ARRAY[44,45,66],ARRAY['-1','1','-1'],'Инсулинорезистентность. Дополнительный маркер ↑триглицериды. Также, повышенные свободные жирные кислоты - ранний признак повреждения мембраны клеток, окисления липидов.'),
  (ARRAY[44,45,66,homa],ARRAY['-1','-1','1','-1'],'Индекс homa в норме, а ГГ повышен – за счет хорошего обмена железа (эритроциты долго живут). Еще важно помнить, что ↑ГГ или ↑фрутозамин — это воспаление, гликация собственного белка, оксидативный стресс.'),
  (ARRAY[44,45],ARRAY['-1','0'],'Проверить с-пептид, улучшать чувствительность клеток к инсулину (физическая активность, закрыть дефициты).'),
  (ARRAY[44,45],ARRAY['1','-1'],'Дело может быть не в сахарном диабете. При повышении глюкозы нужно посмотреть остальные анализы, наладить питание, убрать источники стресса, вводить физическую нагрузку. Посмотреть уровень белка, кортизол.'),
  (ARRAY[44,45],ARRAY['1','0'],'Низкий уровень инсулина в комплексе с высокими значениями сахара - это гипергликемия и основной признак сахарного диабета 1,2 типа, нужно сдать остальные тесты. Патологическое состояние возникает не только при сахарном диабете, но и при панкреатите, заболеваниях печени, недостаточности гипофиза. Значительное повышение уровня глюкозы в крови приводит к нарушению в работе различных внутренних органов.')
 ) AS x(points,statuses,description) LOOP
  IF EXISTS (SELECT 1 FROM "analysisResultDescription" d JOIN "analysisResultDescriptionCondition" c ON c."descriptionId"=d.id WHERE d."sourceId" IS NULL GROUP BY d.id HAVING count(*)=cardinality(spec.points) AND count(*) FILTER (WHERE EXISTS (SELECT 1 FROM unnest(spec.points,spec.statuses) x(point_id,status) WHERE x.point_id=c."pointId" AND x.status=c.status::text))=cardinality(spec.points)) THEN RAISE EXCEPTION 'Combination already exists'; END IF;
  INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES (spec.description,NULL,now(),now()) RETURNING id INTO new_id;
  INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) SELECT new_id,x.point_id,x.status::"enum_analysisResultDescriptionCondition_status" FROM unnest(spec.points,spec.statuses) x(point_id,status);
  GET DIAGNOSTICS n=ROW_COUNT; IF n<>cardinality(spec.points) THEN RAISE EXCEPTION 'Condition count mismatch'; END IF;
 END LOOP;
END $$;
`;
