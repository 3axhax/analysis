/** Previously reviewed source-specific one-sided thresholds, transferred without inventing a norm. */
export const INTERVAL_ONE_SIDED_VALUES_SQL = `
CREATE TEMP TABLE interval_one_sided_source ON COMMIT DROP AS
SELECT lo."sourceId",lo."pointId",lo."ageId",lo."genderId",lo."unitId",
       lo.value::text::numeric AS boundary,lo."lowInclusive",p.name AS point_name,
       s.metadata->>'doi' AS doi,s.metadata->>'sourceKey' AS source_key
FROM "analysisPointMinValue" lo
JOIN "analysisPoint" p ON p.id=lo."pointId"
JOIN "medicalSource" s ON s.id=lo."sourceId"
WHERE p.name IN ('hemoglobin','ferritin')
  AND (s.metadata->>'doi'='10.1002/ccr3.1529' OR s.metadata->>'sourceKey'='nutritional-assessment-iron-2024')
  AND NOT EXISTS (
    SELECT 1 FROM "analysisPointMaxValue" hi WHERE hi."sourceId"=lo."sourceId"
      AND (hi."pointId",hi."ageId",hi."genderId",hi."unitId")=(lo."pointId",lo."ageId",lo."genderId",lo."unitId")
  );
DO $$ BEGIN
  IF (SELECT count(*) FROM interval_one_sided_source)<>16
     OR (SELECT count(*) FROM interval_one_sided_source WHERE "lowInclusive")<>4
     OR (SELECT count(*) FROM interval_one_sided_source WHERE doi='10.1002/ccr3.1529' AND point_name='hemoglobin' AND "lowInclusive")<>4
     OR EXISTS (SELECT 1 FROM interval_one_sided_source WHERE boundary::text IN ('NaN','Infinity','-Infinity'))
  THEN RAISE EXCEPTION 'Reviewed one-sided thresholds changed'; END IF;
END $$;
INSERT INTO "analysisPointIntervalValue" ("sourceId","pointId","ageId","genderId","unitId","minValue","maxValue","minValueEqual","maxValueEqual",status)
SELECT "sourceId","pointId","ageId","genderId","unitId",NULL,boundary,NULL,"lowInclusive",'LOW'
FROM interval_one_sided_source;
-- Soppi's hemoglobin condition means strictly above its inclusive LOW threshold; it is not a general normal range.
INSERT INTO "analysisPointIntervalValue" ("sourceId","pointId","ageId","genderId","unitId","minValue","maxValue","minValueEqual","maxValueEqual",status)
SELECT "sourceId","pointId","ageId","genderId","unitId",boundary,NULL,false,NULL,NULL
FROM interval_one_sided_source WHERE doi='10.1002/ccr3.1529' AND point_name='hemoglobin';
`;

export const INTERVAL_ONE_SIDED_CONDITIONS_SQL = `
DO $$ BEGIN
  IF (SELECT count(*) FROM "analysisResultDescriptionCondition" c
      JOIN "analysisResultDescription" d ON d.id=c."descriptionId"
      JOIN "medicalSource" s ON s.id=d."sourceId"
      JOIN "analysisPoint" p ON p.id=c."pointId"
      WHERE s.metadata->>'doi'='10.1002/ccr3.1529' AND p.name='hemoglobin' AND c.status::text='-1')<>1
  THEN RAISE EXCEPTION 'Reviewed above-threshold condition changed'; END IF;
END $$;
INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId","intervalId","pointId")
SELECT c.id,i.id,c."pointId"
FROM "analysisResultDescriptionCondition" c
JOIN "analysisResultDescription" d ON d.id=c."descriptionId"
JOIN "medicalSource" s ON s.id=d."sourceId"
JOIN "analysisPoint" p ON p.id=c."pointId"
JOIN "analysisPointIntervalValue" i ON i."sourceId"=d."sourceId" AND i."pointId"=c."pointId" AND i.status IS NULL
JOIN interval_one_sided_source b ON (b."sourceId",b."pointId",b."ageId",b."genderId",b."unitId")=(i."sourceId",i."pointId",i."ageId",i."genderId",i."unitId")
  AND i."minValue"=b.boundary AND i."minValueEqual"=false AND i."maxValue" IS NULL
WHERE s.metadata->>'doi'='10.1002/ccr3.1529' AND p.name='hemoglobin' AND c.status::text='-1';
`;
