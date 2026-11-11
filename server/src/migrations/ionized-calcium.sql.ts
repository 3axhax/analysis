export const IONIZED_CALCIUM_SQL = String.raw`
DO $$
DECLARE point_id integer; unit_id integer; desc_id integer; age_count integer; n integer;
BEGIN
 LOCK TABLE "analysisPoint", "analysisPointUnits", analysis_point_units, "analysisPointMinValue", "analysisPointMaxValue", translation, "analysisResultDescription", "analysisResultDescriptionCondition" IN SHARE ROW EXCLUSIVE MODE;
 IF EXISTS (SELECT 1 FROM "analysisPoint" WHERE name='ionized_calcium' OR "translationRu" ILIKE '%кальц%иониз%' OR "translationRu" ILIKE '%иониз%кальц%') OR EXISTS (SELECT 1 FROM translation WHERE namespace='entities' AND module='analysisPoint' AND submodule='ionized_calcium') THEN RAISE EXCEPTION 'Ionized calcium already exists'; END IF;
 SELECT id INTO STRICT unit_id FROM "analysisPointUnits" WHERE code='mmol/L';
 IF (SELECT count(*) FROM "analysisPoint" WHERE id=53 AND name='ca')<>1 OR (SELECT count(*) FROM gender WHERE name IN ('m','f'))<>2 THEN RAISE EXCEPTION 'Calcium baseline mismatch'; END IF;
 SELECT count(*) INTO age_count FROM ages; IF age_count=0 THEN RAISE EXCEPTION 'Missing age groups'; END IF;
 INSERT INTO "analysisPoint" (name,"translationRu","translationEn","translationParsing") VALUES ('ionized_calcium','Кальций ионизированный','Ionized calcium','Кальций ионизированный_Ионизированный кальций_Ca ионизированный_Ionized calcium_Ionised calcium') RETURNING id INTO point_id;
 INSERT INTO translation (lang,namespace,module,submodule,value) VALUES ('ru','entities','analysisPoint','ionized_calcium','Кальций ионизированный'),('en','entities','analysisPoint','ionized_calcium','Ionized calcium');
 INSERT INTO analysis_point_units ("pointId","unitsId") VALUES(point_id,unit_id);
 INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId","sourceId",value) SELECT point_id,a.id,g.id,unit_id,NULL,1.0 FROM ages a CROSS JOIN gender g WHERE g.name IN ('m','f'); GET DIAGNOSTICS n=ROW_COUNT; IF n<>age_count*2 THEN RAISE EXCEPTION 'Ionized calcium min count'; END IF;
 INSERT INTO "analysisPointMaxValue" ("pointId","ageId","genderId","unitId","sourceId",value) SELECT point_id,a.id,g.id,unit_id,NULL,1.3 FROM ages a CROSS JOIN gender g WHERE g.name IN ('m','f'); GET DIAGNOSTICS n=ROW_COUNT; IF n<>age_count*2 THEN RAISE EXCEPTION 'Ionized calcium max count'; END IF;
 INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES ('Гиперпаратиреоз.',NULL,now(),now()) RETURNING id INTO desc_id;
 INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (desc_id,point_id,'1');
 INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES ('Гипопаратиреоз, дефицит витамина Д, магния, псевдогипопаратиреоз (резистентность к паратгормону).',NULL,now(),now()) RETURNING id INTO desc_id;
 INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (desc_id,point_id,'0');
END $$;
`;
