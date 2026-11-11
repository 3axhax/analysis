// Express the four available combinations without claiming a diagnosis.
export const BILIRUBIN_DESCRIPTION_CORRECTION_SQL = String.raw`
DO $$
DECLARE hb integer; alp integer; bilirubin integer; indirect integer; hb_status text; alp_status text; created_id integer;
        message text := 'Повышение общего и непрямого билирубина может встречаться при разных состояниях, в том числе при синдроме Жильбера. Причину по этому сочетанию определить нельзя; при оценке учитывают и другие показатели печени.';
BEGIN
 SELECT id INTO STRICT hb FROM "analysisPoint" WHERE name='hemoglobin';
 SELECT id INTO STRICT alp FROM "analysisPoint" WHERE name='alkaline_phosphatase';
 SELECT id INTO STRICT bilirubin FROM "analysisPoint" WHERE name='bilirubin';
 SELECT id INTO STRICT indirect FROM "analysisPoint" WHERE name='indirect_bilirubin';
 IF (SELECT count(*) FROM "analysisResultDescription" WHERE id=98 AND "sourceId" IS NULL AND md5(description_ru)='b286ff6c73ca1aa2d054c0b28155104d')<>1 OR
    (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=98)<>4 OR
    (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=98 AND "pointId" IN (hb,alp,bilirubin,indirect) AND status='1')<>4 THEN RAISE EXCEPTION 'Unexpected description 98'; END IF;
 IF EXISTS (SELECT 1 FROM "analysisResultDescription" d JOIN "analysisResultDescriptionCondition" c ON c."descriptionId"=d.id WHERE d."sourceId" IS NULL AND d.id<>98 GROUP BY d.id HAVING count(*)=4 AND count(*) FILTER (WHERE (c."pointId" IN (bilirubin,indirect) AND c.status='1') OR (c."pointId" IN (hb,alp) AND c.status IN ('-1','1')))=4) THEN RAISE EXCEPTION 'Alternative rule already exists'; END IF;
 UPDATE "analysisResultDescription" SET description_ru=message,"updatedAt"=now() WHERE id=98 AND "sourceId" IS NULL;
 FOREACH hb_status IN ARRAY ARRAY['-1','1'] LOOP
  FOREACH alp_status IN ARRAY ARRAY['-1','1'] LOOP
   IF hb_status='1' AND alp_status='1' THEN CONTINUE; END IF;
   INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES (message,NULL,now(),now()) RETURNING id INTO created_id;
   INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (created_id,bilirubin,'1'),(created_id,indirect,'1'),(created_id,hb,hb_status::"enum_analysisResultDescriptionCondition_status"),(created_id,alp,alp_status::"enum_analysisResultDescriptionCondition_status");
  END LOOP;
 END LOOP;
END $$;
`;
