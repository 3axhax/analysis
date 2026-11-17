/** Transfer existing exact numeric rules without inferring new clinical limits. */
export const INTERVAL_DERITIS_BACKFILL_SQL = `
WITH specs(rule, lo, hi, lo_equal, hi_equal) AS (VALUES
  ('gte_2', 2::numeric, NULL::numeric, true, NULL::boolean),
  ('gte_1_7', 1.7::numeric, NULL::numeric, true, NULL::boolean),
  ('eq_1_5', 1.7::numeric, 1.7::numeric, true, true),
  ('eq_1', 1::numeric, 1::numeric, true, true),
  ('lt_1', NULL::numeric, 1::numeric, NULL::boolean, false),
  ('lt_1_5', NULL::numeric, 1.5::numeric, NULL::boolean, false)
), contexts AS (
  SELECT DISTINCT i."pointId",i."ageId",i."genderId",i."unitId"
  FROM "analysisPointIntervalValue" i JOIN "analysisPoint" p ON p.id=i."pointId"
  WHERE p.name='de_ritis_ratio' AND i."sourceId" IS NULL AND i.status='NORMAL'
), inserted AS (
  INSERT INTO "analysisPointIntervalValue" ("sourceId","pointId","ageId","genderId","unitId","minValue","maxValue","minValueEqual","maxValueEqual",status)
  SELECT NULL,c."pointId",c."ageId",c."genderId",c."unitId",s.lo,s.hi,s.lo_equal,s.hi_equal,NULL
  FROM contexts c CROSS JOIN specs s
  RETURNING *
)
INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId","intervalId","pointId")
SELECT c.id,i.id,c."pointId"
FROM inserted i
JOIN specs s ON i."minValue" IS NOT DISTINCT FROM s.lo AND i."maxValue" IS NOT DISTINCT FROM s.hi
  AND i."minValueEqual" IS NOT DISTINCT FROM s.lo_equal AND i."maxValueEqual" IS NOT DISTINCT FROM s.hi_equal
JOIN "analysisResultDescription" d ON d."deRitisRule"=s.rule AND d."sourceId" IS NULL
JOIN "analysisResultDescriptionCondition" c ON c."descriptionId"=d.id AND c."pointId"=i."pointId";
`;
