/** Only straightforward status-based conditions; numerical rules need their own intervals. */
export const INTERVAL_CONDITION_BACKFILL_SQL = `
INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId", "intervalId", "pointId")
SELECT DISTINCT c.id, i.id, c."pointId"
FROM "analysisResultDescriptionCondition" c
JOIN "analysisResultDescription" d ON d.id=c."descriptionId"
JOIN "analysisPointIntervalValue" i ON i."pointId"=c."pointId"
  AND i.status=CASE c.status::text WHEN '0' THEN 'LOW' WHEN '-1' THEN 'NORMAL' WHEN '1' THEN 'HIGH' END
WHERE d."deRitisRule" IS NULL
  AND (
    i."sourceId" IS NOT DISTINCT FROM d."sourceId"
    OR (
      d."sourceId" IS NOT NULL AND i."sourceId" IS NULL
      AND EXISTS (SELECT 1 FROM "sourceReferenceInheritance" h WHERE h."sourceId"=d."sourceId" AND h."pointId"=c."pointId")
      AND NOT EXISTS (
        SELECT 1 FROM "analysisPointMinValue" lo
        WHERE lo."sourceId"=d."sourceId" AND lo."pointId"=c."pointId" AND lo."ageId"=i."ageId" AND lo."genderId"=i."genderId"
        UNION ALL
        SELECT 1 FROM "analysisPointMaxValue" hi
        WHERE hi."sourceId"=d."sourceId" AND hi."pointId"=c."pointId" AND hi."ageId"=i."ageId" AND hi."genderId"=i."genderId"
      )
    )
  );
`;
