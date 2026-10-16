-- MANUAL: never discard or rewrite source-only rows to force rollback.
\set ON_ERROR_STOP on
BEGIN;
SELECT pg_advisory_xact_lock(20006);
SELECT EXISTS(SELECT 1 FROM migrations WHERE name='0006-source-measurements') AS applied \gset
\if :applied
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM "analysisResultPointData" WHERE "sourceValue" IS NOT NULL AND "calculationValue" IS NULL) THEN
  RAISE EXCEPTION 'Source-only measurements exist; preserve data and schema';
 END IF;
END $$;
ALTER TABLE "analysisResultPointData" DROP CONSTRAINT normalized_source_fields;
ALTER TABLE "analysisResultPointData" ADD CONSTRAINT normalized_source_fields CHECK(
 ("sourceValue" IS NULL AND "sourceUnitId" IS NULL AND "sourceUnitText" IS NULL AND "calculationValue" IS NULL AND "conversionRuleId" IS NULL AND "conversionRuleVersion" IS NULL AND "appliedCoefficient" IS NULL AND "referenceMin" IS NULL AND "referenceMax" IS NULL)
 OR
 ("sourceValue" IS NOT NULL AND "sourceUnitId" IS NOT NULL AND "sourceValue">=0 AND "sourceValue"<1e20
  AND "calculationValue" IS NOT NULL AND "calculationValue">=0 AND "calculationValue"<1e40
  AND "appliedCoefficient" IS NOT NULL AND "appliedCoefficient">0 AND "appliedCoefficient"<1e20
  AND "referenceMin" IS NOT NULL AND "referenceMax" IS NOT NULL AND "referenceMin"<="referenceMax"
  AND "calculationValue"="sourceValue"*"appliedCoefficient"
  AND (("sourceUnitId"="unitId" AND "conversionRuleId" IS NULL AND "conversionRuleVersion" IS NULL AND "appliedCoefficient"=1)
   OR ("sourceUnitId"<>"unitId" AND "conversionRuleId" IS NOT NULL AND "conversionRuleVersion" IS NOT NULL AND "conversionRuleVersion">0)))
);
DELETE FROM migrations WHERE name='0006-source-measurements';
\else
\echo '0006-source-measurements not applied; no changes'
\endif
COMMIT;
