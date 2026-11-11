// Add the source's two-marker example without inferring a diagnosis.
export const CBC_ERYTHROCYTE_MCV_DESCRIPTION_SQL = String.raw`
DO $$
DECLARE erythrocyte_id integer; mcv_id integer; description_id integer;
BEGIN
 SELECT id INTO STRICT erythrocyte_id FROM "analysisPoint" WHERE name='erythrocyte';
 SELECT id INTO STRICT mcv_id FROM "analysisPoint" WHERE name='mcv';
 IF (SELECT count(*) FROM "analysisResultDescription" d JOIN "analysisResultDescriptionCondition" c ON c."descriptionId"=d.id WHERE d.id=8 AND d."sourceId" IS NULL AND c."pointId"=erythrocyte_id AND c.status='0')<>1 OR (SELECT count(*) FROM "analysisResultDescriptionCondition" WHERE "descriptionId"=8)<>1 THEN RAISE EXCEPTION 'Unexpected baseline erythrocyte description'; END IF;
 IF EXISTS (SELECT 1 FROM "analysisResultDescription" d JOIN "analysisResultDescriptionCondition" c ON c."descriptionId"=d.id WHERE d."sourceId" IS NULL GROUP BY d.id HAVING count(*)=2 AND count(*) FILTER (WHERE (c."pointId"=erythrocyte_id AND c.status='0') OR (c."pointId"=mcv_id AND c.status='1'))=2) THEN RAISE EXCEPTION 'Two-marker rule already exists'; END IF;
 INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES ('Снижение эритроцитов при повышенном MCV может встречаться при недостаточности витамина B12 или фолатов; по этому сочетанию причина не определяется.',NULL,now(),now()) RETURNING id INTO description_id;
 INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) VALUES (description_id,erythrocyte_id,'0'),(description_id,mcv_id,'1');
END $$;
`;
