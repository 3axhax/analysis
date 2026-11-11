export const IRON_PREGNANCY_DESCRIPTION_SQL = String.raw`
DO $$
BEGIN
  IF (SELECT count(*) FROM "analysisResultDescription"
      WHERE id=51 AND "sourceId" IS NULL
      AND md5(description_ru)='d874e13abdfa98952d42015f5cfce79c') <> 1
    OR (SELECT count(*) FROM "analysisResultDescriptionCondition"
        WHERE "descriptionId"=51) <> 2
    OR (SELECT count(*) FROM "analysisResultDescriptionCondition"
        WHERE "descriptionId"=51
        AND (("pointId"=22 AND status='0') OR ("pointId"=23 AND status='1'))) <> 2
  THEN RAISE EXCEPTION 'Unexpected description 51 or conditions'; END IF;
  UPDATE "analysisResultDescription"
  SET description_ru='Возможна беременность 3 триместр', "updatedAt"=now()
  WHERE id=51 AND "sourceId" IS NULL;
END $$;
`;
