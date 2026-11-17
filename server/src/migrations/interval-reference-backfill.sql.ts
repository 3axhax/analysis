/** Run in the same transaction as the schema migration after the read-only audit. */
export const INTERVAL_REFERENCE_BACKFILL_SQL = `
LOCK TABLE "analysisPointMinValue", "analysisPointMaxValue" IN SHARE MODE;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM "analysisPointMinValue"
    GROUP BY "sourceId", "pointId", "ageId", "genderId", "unitId" HAVING count(*) > 1
  ) OR EXISTS (
    SELECT 1 FROM "analysisPointMaxValue"
    GROUP BY "sourceId", "pointId", "ageId", "genderId", "unitId" HAVING count(*) > 1
  ) THEN RAISE EXCEPTION 'Duplicate interval boundary'; END IF;
  IF EXISTS (
    SELECT 1 FROM "analysisPointMinValue" lo JOIN "analysisPointMaxValue" hi
      ON lo."sourceId" IS NOT DISTINCT FROM hi."sourceId"
      AND (lo."pointId",lo."ageId",lo."genderId",lo."unitId") = (hi."pointId",hi."ageId",hi."genderId",hi."unitId")
    WHERE lo.value > hi.value OR lo.value::text IN ('NaN','Infinity','-Infinity') OR hi.value::text IN ('NaN','Infinity','-Infinity')
  ) THEN RAISE EXCEPTION 'Invalid interval boundary'; END IF;
END $$;
CREATE TEMP TABLE interval_reference_pairs ON COMMIT DROP AS
SELECT lo."sourceId", lo."pointId", lo."ageId", lo."genderId", lo."unitId",
       lo.value::text::numeric AS lower_bound, hi.value::text::numeric AS upper_bound,
       (lo."sourceId" IS NOT NULL AND lo."lowInclusive") AS low_inclusive
FROM "analysisPointMinValue" lo JOIN "analysisPointMaxValue" hi
  ON lo."sourceId" IS NOT DISTINCT FROM hi."sourceId"
  AND (lo."pointId",lo."ageId",lo."genderId",lo."unitId") = (hi."pointId",hi."ageId",hi."genderId",hi."unitId");
INSERT INTO "analysisPointIntervalValue" ("sourceId", "pointId", "ageId", "genderId", "unitId", "minValue", "maxValue", "minValueEqual", "maxValueEqual", status)
SELECT "sourceId", "pointId", "ageId", "genderId", "unitId", NULL, lower_bound, NULL, low_inclusive, 'LOW' FROM interval_reference_pairs
UNION ALL
SELECT "sourceId", "pointId", "ageId", "genderId", "unitId", lower_bound, upper_bound, NOT low_inclusive, true, 'NORMAL' FROM interval_reference_pairs WHERE lower_bound < upper_bound OR NOT low_inclusive
UNION ALL
SELECT "sourceId", "pointId", "ageId", "genderId", "unitId", upper_bound, NULL, false, NULL, 'HIGH' FROM interval_reference_pairs;
`;
