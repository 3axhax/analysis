export const LIVER_ENZYME_COMBINATIONS_SQL = String.raw`
DO $$
DECLARE spec record; new_id integer; n integer;
BEGIN
 LOCK TABLE "analysisResultDescription", "analysisResultDescriptionCondition" IN SHARE ROW EXCLUSIVE MODE;
 IF (SELECT count(*) FROM "analysisPoint" WHERE (id=32 AND name='alanine_aminotransferase') OR (id=33 AND name='aspartate_aminotransferase') OR (id=34 AND name='alkaline_phosphatase') OR (id=62 AND name='ggtp'))<>4 THEN RAISE EXCEPTION 'Unexpected liver points'; END IF;
 FOR spec IN SELECT * FROM (VALUES
  (ARRAY['1','1','-1','-1'],'Повышение АЛТ и АСТ при нормальных щелочной фосфатазе и ГГТП может встречаться при различных состояниях, в том числе после вирусных заболеваний. Это сочетание само по себе не определяет причину.'),
  (ARRAY['0','0','-1','-1'],'Снижение АЛТ и АСТ при нормальных щелочной фосфатазе и ГГТП в методичке связывается с низким антиоксидантным статусом, особенно при сниженном билирубине. Само по себе сочетание не подтверждает причину.')
 ) x(statuses,description) LOOP
  IF EXISTS (SELECT 1 FROM "analysisResultDescription" d JOIN "analysisResultDescriptionCondition" c ON c."descriptionId"=d.id WHERE d."sourceId" IS NULL GROUP BY d.id HAVING count(*)=4 AND count(*) FILTER (WHERE EXISTS (SELECT 1 FROM unnest(ARRAY[32,33,34,62],spec.statuses) AS x(point_id,status) WHERE x.point_id=c."pointId" AND x.status=c.status::text))=4) THEN RAISE EXCEPTION 'Combination already exists'; END IF;
  INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES (spec.description,NULL,now(),now()) RETURNING id INTO new_id;
  INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) SELECT new_id,x.point_id,x.status::"enum_analysisResultDescriptionCondition_status" FROM unnest(ARRAY[32,33,34,62],spec.statuses) AS x(point_id,status);
  GET DIAGNOSTICS n=ROW_COUNT; IF n<>4 THEN RAISE EXCEPTION 'Conditions count mismatch'; END IF;
 END LOOP;
END $$;
`;
