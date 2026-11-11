export const PROTEIN_FRACTIONS_COMBINATIONS_SQL = String.raw`
DO $$
DECLARE spec record; new_id integer; actual_count integer;
BEGIN
 LOCK TABLE "analysisResultDescription", "analysisResultDescriptionCondition" IN SHARE ROW EXCLUSIVE MODE;
 IF (SELECT count(*) FROM "analysisPoint" WHERE (id=4 AND name='albumin_fraction') OR (id=5 AND name='alpha-1_globulin_fraction') OR (id=58 AND name='alpha-2_globulins') OR (id=59 AND name='beta_globulins') OR (id=61 AND name='gamma_globulins'))<>5 THEN RAISE EXCEPTION 'Unexpected protein fraction points'; END IF;
 FOR spec IN SELECT * FROM (VALUES
  (ARRAY[4,5,58],ARRAY['0','1','1'],'Снижение альбуминовой фракции и повышение альфа-1- и альфа-2-глобулинов может встречаться при остром воспалении. Это сочетание само по себе не устанавливает причину.'),
  (ARRAY[4,58,61],ARRAY['0','1','1'],'Снижение альбуминовой фракции и повышение альфа-2- и гамма-глобулинов может встречаться при хроническом воспалении. Это сочетание само по себе не устанавливает причину.'),
  (ARRAY[4,59,61],ARRAY['0','1','1'],'Снижение альбуминовой фракции и повышение бета- и гамма-глобулинов может встречаться при заболеваниях печени. Это сочетание само по себе не устанавливает причину.'),
  (ARRAY[4,58,59,61],ARRAY['0','1','1','0'],'Снижение альбуминовой фракции и гамма-глобулинов и повышение альфа-2- и бета-глобулинов может встречаться при заболеваниях почек. Это сочетание само по себе не устанавливает причину.'),
  (ARRAY[4,5,58,59,61],ARRAY['0','1','1','1','1'],'Снижение альбуминовой фракции и повышение альфа-1-, альфа-2-, бета- и гамма-глобулинов может встречаться при опухолевых заболеваниях. Это сочетание само по себе не устанавливает диагноз.')
 ) AS x(point_ids,statuses,description) LOOP
  IF EXISTS (SELECT 1 FROM "analysisResultDescription" d JOIN "analysisResultDescriptionCondition" c ON c."descriptionId"=d.id WHERE d."sourceId" IS NULL GROUP BY d.id HAVING count(*)=cardinality(spec.point_ids) AND count(*) FILTER (WHERE EXISTS (SELECT 1 FROM unnest(spec.point_ids,spec.statuses) AS x(point_id,status) WHERE x.point_id=c."pointId" AND x.status=c.status::text))=cardinality(spec.point_ids)) THEN RAISE EXCEPTION 'Protein fraction rule already exists'; END IF;
  INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES (spec.description,NULL,now(),now()) RETURNING id INTO new_id;
  INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) SELECT new_id,x.point_id,x.status::"enum_analysisResultDescriptionCondition_status" FROM unnest(spec.point_ids,spec.statuses) AS x(point_id,status);
  GET DIAGNOSTICS actual_count=ROW_COUNT;
  IF actual_count<>cardinality(spec.point_ids) THEN RAISE EXCEPTION 'Condition count mismatch'; END IF;
 END LOOP;
END $$;
`;
