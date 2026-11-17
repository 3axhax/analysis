export const PMC_ADDITIONAL_DESCRIPTIONS_SQL = `
DO $$
DECLARE root_id integer; moran_id integer; source_id integer; description_id integer;
BEGIN
 SELECT id INTO STRICT root_id FROM "medicalSource" WHERE parent_id IS NULL AND name='PubMed Central';
 SELECT id INTO STRICT moran_id FROM "medicalSource" WHERE parent_id=root_id AND metadata->>'doi'='10.1210/clinem/dgad681';
 IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata->>'doi'='10.1186/s12979-020-00208-7') THEN RAISE EXCEPTION 'Source already exists'; END IF;
 IF (SELECT count(*) FROM "analysisPoint" WHERE name IN ('tsh','ft4','hemoglobin','reticulocytes','ldh','indirect_bilirubin')) <> 6 THEN RAISE EXCEPTION 'Missing point'; END IF;
 IF (SELECT count(*) FROM "sourceReferenceInheritance" i JOIN "analysisPoint" p ON p.id=i."pointId" WHERE i."sourceId"=moran_id AND p.name IN ('tsh','ft4')) <> 2 THEN RAISE EXCEPTION 'Missing thyroid inheritance'; END IF;
 IF EXISTS (SELECT 1 FROM "analysisResultDescription" WHERE "sourceId"=moran_id AND description_ru='Несогласованное сочетание может быть связано с особенностями лабораторного измерения, лекарствами или сопутствующими состояниями.') THEN RAISE EXCEPTION 'Description exists'; END IF;
 INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES ('Несогласованное сочетание может быть связано с особенностями лабораторного измерения, лекарствами или сопутствующими состояниями.',moran_id,now(),now()) RETURNING id INTO description_id;
 INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) SELECT description_id,id,'1'::"enum_analysisResultDescriptionCondition_status" FROM "analysisPoint" WHERE name IN ('tsh','ft4');
 INSERT INTO "medicalSource" (parent_id,name,metadata) VALUES (root_id,'Michalak и соавторы: гемолитическая анемия (2020)',jsonb_build_object('doi','10.1186/s12979-020-00208-7','url','https://pmc.ncbi.nlm.nih.gov/articles/PMC7677104/','authors','Michalak SS, Olewicz-Gawlik A, Rupa-Matysek J, Wolny-Rokicka E, Nowakowska E, Gil L','title','Autoimmune hemolytic anemia: current knowledge and perspectives','year',2020,'section','AIHA diagnosis','license','CC BY 4.0','licenseUrl','https://creativecommons.org/licenses/by/4.0/','translation','Русский текст адаптирован сервисом')) RETURNING id INTO source_id;
 INSERT INTO "sourceReferenceInheritance" ("sourceId","pointId") SELECT source_id,id FROM "analysisPoint" WHERE name IN ('hemoglobin','reticulocytes','ldh','indirect_bilirubin');
 INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES ('Возможна гемолитическая анемия.',source_id,now(),now()) RETURNING id INTO description_id;
 INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) SELECT description_id,p.id,v.status::"enum_analysisResultDescriptionCondition_status" FROM (VALUES ('hemoglobin','0'),('reticulocytes','1'),('ldh','1'),('indirect_bilirubin','1')) v(name,status) JOIN "analysisPoint" p ON p.name=v.name;
 IF (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=description_id) <> 4 THEN RAISE EXCEPTION 'Missing condition'; END IF;
END $$;
`;
