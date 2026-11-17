export const PMC_BLOOD_DESCRIPTIONS_SQL = `
DO $$
DECLARE
  root_id integer; source_id integer; description_id integer; item record;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource" WHERE parent_id IS NULL AND name='PubMed Central';
  IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata->>'doi'='10.1016/j.ymgme.2023.107735' OR metadata->>'url'='https://pmc.ncbi.nlm.nih.gov/articles/PMC11752444/') THEN
    RAISE EXCEPTION 'Source already exists';
  END IF;
  IF (SELECT count(*) FROM "analysisPoint" WHERE name IN ('hemoglobin','mcv','mch','ferritin','reticulocytes','ldh','indirect_bilirubin')) <> 7 THEN
    RAISE EXCEPTION 'Expected seven distinct points';
  END IF;
  IF EXISTS (
    SELECT 1 FROM "analysisPoint" p WHERE p.name IN ('hemoglobin','mcv','mch','ferritin','reticulocytes','ldh','indirect_bilirubin')
    AND (NOT EXISTS (SELECT 1 FROM "analysisPointMinValue" mi JOIN "analysisPointMaxValue" ma ON ma."pointId"=mi."pointId" AND ma."ageId"=mi."ageId" AND ma."genderId"=mi."genderId" AND ma."unitId"=mi."unitId" AND ma."sourceId" IS NULL WHERE mi."pointId"=p.id AND mi."sourceId" IS NULL AND mi.value<=ma.value)
      OR EXISTS (SELECT 1 FROM "analysisPointMinValue" mi JOIN "analysisPointMaxValue" ma ON ma."pointId"=mi."pointId" AND ma."ageId"=mi."ageId" AND ma."genderId"=mi."genderId" AND ma."unitId"=mi."unitId" AND ma."sourceId" IS NULL WHERE mi."pointId"=p.id AND mi."sourceId" IS NULL AND mi.value>ma.value))
  ) THEN RAISE EXCEPTION 'Missing or invalid reference'; END IF;
  INSERT INTO "medicalSource" (parent_id,name,metadata) VALUES (root_id,'Dunlea и соавторы: показатели крови и обмен веществ (2023)',jsonb_build_object('doi','10.1016/j.ymgme.2023.107735','url','https://pmc.ncbi.nlm.nih.gov/articles/PMC11752444/','authors','Dunlea E, Crushell E, Cotter M, Blau N, Ferreira CR','title','Clinical and biochemical footprints of inherited metabolic disease. XVI. Hematological abnormalities','year',2023,'section','2.7 Anemia','license','CC BY 4.0','licenseUrl','https://creativecommons.org/licenses/by/4.0/','translation','Русский текст адаптирован сервисом')) RETURNING id INTO source_id;
  INSERT INTO "sourceReferenceInheritance" ("sourceId","pointId") SELECT source_id,id FROM "analysisPoint" WHERE name IN ('hemoglobin','mcv','mch','ferritin','reticulocytes','ldh','indirect_bilirubin');
  FOR item IN SELECT * FROM (VALUES
    ('Возможна железодефицитная анемия.',ARRAY['hemoglobin','mcv','mch','ferritin'],ARRAY['0','0','0','0']),
    ('Возможна гемолитическая анемия.',ARRAY['hemoglobin','reticulocytes','ldh','indirect_bilirubin'],ARRAY['0','1','1','1'])
  ) AS descriptions(description,points,statuses) LOOP
    INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES (item.description,source_id,now(),now()) RETURNING id INTO description_id;
    INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status)
    SELECT description_id,p.id,s.status::"enum_analysisResultDescriptionCondition_status" FROM unnest(item.points,item.statuses) AS s(point,status) JOIN "analysisPoint" p ON p.name=s.point;
    IF (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=description_id) <> 4 THEN RAISE EXCEPTION 'Expected four conditions'; END IF;
  END LOOP;
END $$;
`;
