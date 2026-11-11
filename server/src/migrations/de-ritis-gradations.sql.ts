export const DE_RITIS_GRADATIONS_SQL = String.raw`
DO $$
DECLARE point_id integer; low_id integer; high_id integer; desc_id integer; spec record; n integer;
BEGIN
 LOCK TABLE "analysisResultDescription", "analysisResultDescriptionCondition", "analysisPoint" IN SHARE ROW EXCLUSIVE MODE;
 SELECT id INTO STRICT point_id FROM "analysisPoint" WHERE name='de_ritis_ratio';
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='analysisResultDescription' AND column_name='deRitisRule') THEN RAISE EXCEPTION 'Rule column exists'; END IF;
 SELECT d.id INTO STRICT low_id FROM "analysisResultDescription" d JOIN "analysisResultDescriptionCondition" c ON c."descriptionId"=d.id WHERE d."sourceId" IS NULL AND md5(d.description_ru)='c6a19bbfcd80c00563641b8cc88f8566' AND c."pointId"=point_id AND c.status='0' AND (SELECT count(*) FROM "analysisResultDescriptionCondition" x WHERE x."descriptionId"=d.id)=1;
 SELECT d.id INTO STRICT high_id FROM "analysisResultDescription" d JOIN "analysisResultDescriptionCondition" c ON c."descriptionId"=d.id WHERE d."sourceId" IS NULL AND md5(d.description_ru)='fdcca9581092da9ef851fa0ea0520dc4' AND c."pointId"=point_id AND c.status='1' AND (SELECT count(*) FROM "analysisResultDescriptionCondition" x WHERE x."descriptionId"=d.id)=1;
 ALTER TABLE "analysisResultDescription" ADD COLUMN "deRitisRule" varchar(32);
 ALTER TABLE "analysisResultDescription" ADD CONSTRAINT description_de_ritis_rule_check CHECK ("deRitisRule" IS NULL OR ("sourceId" IS NULL AND "deRitisRule" IN ('gte_2','gte_1_7','eq_1_5','eq_1','lt_1','lt_1_5')));
 CREATE UNIQUE INDEX description_de_ritis_rule_unique ON "analysisResultDescription" ("deRitisRule") WHERE "deRitisRule" IS NOT NULL;
 UPDATE "analysisResultDescription" SET "deRitisRule"='gte_1_7',"updatedAt"=now() WHERE id=high_id;
 UPDATE "analysisResultDescription" SET "deRitisRule"='lt_1',description_ru='Если организм восстанавливается после травмы, гриппа или серьёзной лекарственной нагрузки, возможно усиление синтеза новых клеток — анаболизм, восстановление после интенсивных трат. При повышенной активности АСТ такое значение может встречаться при остром вирусном и хроническом гепатите, особенно на ранних стадиях, и при холестазе.',"updatedAt"=now() WHERE id=low_id;
 FOR spec IN SELECT * FROM (VALUES
  ('gte_2','1','Возможна избыточная гибель клеток печени. При длительном истощающем паразитозе КР может быть >1,5, обычно ≥2. Это может означать гигантскую нагрузку на печень и хроническую интоксикацию.'),
  ('eq_1_5','-1','Возможны заболевания сердца, мышечной ткани, преобладание процессов катаболизма, распада мышечных белков.'),
  ('eq_1','-1','Возможно замедление обмена веществ.'),
  ('lt_1_5','-1','Возможны анаболизм и заболевания печени.')
 ) AS x(rule_key,placeholder_status,description) LOOP
  INSERT INTO "analysisResultDescription" (description_ru,"sourceId","deRitisRule","createdAt","updatedAt") VALUES (spec.description,NULL,spec.rule_key,now(),now()) RETURNING id INTO desc_id;
  INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (desc_id,point_id,spec.placeholder_status::"enum_analysisResultDescriptionCondition_status");
 END LOOP;
 SELECT count(*) INTO n FROM "analysisResultDescription" WHERE "deRitisRule" IS NOT NULL;
 IF n<>6 OR (SELECT count(*) FROM "analysisResultDescriptionCondition" c JOIN "analysisResultDescription" d ON d.id=c."descriptionId" WHERE d."deRitisRule" IS NOT NULL AND c."pointId"=point_id)<>6 OR EXISTS (SELECT 1 FROM "analysisResultDescription" d WHERE d."deRitisRule" IS NOT NULL AND (SELECT count(*) FROM "analysisResultDescriptionCondition" c WHERE c."descriptionId"=d.id)<>1) THEN RAISE EXCEPTION 'Rule condition mismatch'; END IF;
END $$;
`;
