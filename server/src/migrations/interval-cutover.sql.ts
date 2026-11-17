/** Final cutover only after all consumers have switched and reviewed data is linked. */
export const INTERVAL_CUTOVER_SQL = `
LOCK TABLE "analysisPointMinValue", "analysisPointMaxValue", "analysisResultDescriptionCondition", "analysisPointIntervalValue", "analysisResultIntervalDescriptionCondition" IN SHARE ROW EXCLUSIVE MODE;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "analysisResultDescriptionCondition" c WHERE NOT EXISTS (SELECT 1 FROM "analysisResultIntervalDescriptionCondition" l WHERE l."conditionId"=c.id)) THEN
    RAISE EXCEPTION 'Description conditions without intervals';
  END IF;
  IF EXISTS (
    SELECT 1 FROM "analysisPointMinValue" b WHERE NOT EXISTS (
      SELECT 1 FROM "analysisPointIntervalValue" i
      WHERE i."sourceId" IS NOT DISTINCT FROM b."sourceId" AND (i."pointId",i."ageId",i."genderId",i."unitId")=(b."pointId",b."ageId",b."genderId",b."unitId")
        AND (i."minValue"=b.value::text::numeric OR i."maxValue"=b.value::text::numeric)
    )
  ) OR EXISTS (
    SELECT 1 FROM "analysisPointMaxValue" b WHERE NOT EXISTS (
      SELECT 1 FROM "analysisPointIntervalValue" i
      WHERE i."sourceId" IS NOT DISTINCT FROM b."sourceId" AND (i."pointId",i."ageId",i."genderId",i."unitId")=(b."pointId",b."ageId",b."genderId",b."unitId")
        AND (i."minValue"=b.value::text::numeric OR i."maxValue"=b.value::text::numeric)
    )
  ) THEN RAISE EXCEPTION 'Reference boundaries without intervals'; END IF;
END $$;
ALTER TABLE "analysisResultDescriptionCondition" DROP COLUMN status;
ALTER TABLE "analysisResultDescription" DROP COLUMN "deRitisRule";
DROP TABLE "analysisPointMinValue";
DROP TABLE "analysisPointMaxValue";
`;
