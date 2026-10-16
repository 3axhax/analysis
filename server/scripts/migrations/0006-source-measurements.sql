-- MANUAL: requires explicit approval, verified backup and copy verification.
-- Adds only a source-only state to the existing CHECK; does not rewrite rows.
\set ON_ERROR_STOP on
BEGIN;
SELECT pg_advisory_xact_lock(20006);
SELECT EXISTS(SELECT 1 FROM migrations WHERE name='0006-source-measurements') AS applied \gset
\if :applied
\echo '0006-source-measurements already applied; no changes'
\else
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM migrations WHERE name='0002-unit-normalization') THEN
  RAISE EXCEPTION 'Normalization prerequisite missing';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='"analysisResultPointData"'::regclass AND conname='normalized_source_fields') THEN
  RAISE EXCEPTION 'Reviewed source constraint missing';
 END IF;
END $$;
ALTER TABLE "analysisResultPointData" DROP CONSTRAINT normalized_source_fields;
ALTER TABLE "analysisResultPointData" ADD CONSTRAINT normalized_source_fields CHECK(
 ("sourceValue" IS NULL AND "sourceUnitId" IS NULL AND "sourceUnitText" IS NULL AND "calculationValue" IS NULL AND "conversionRuleId" IS NULL AND "conversionRuleVersion" IS NULL AND "appliedCoefficient" IS NULL AND "referenceMin" IS NULL AND "referenceMax" IS NULL)
 OR
 ("sourceValue" IS NOT NULL AND "sourceUnitId" IS NOT NULL AND "sourceValue">=0 AND "sourceValue"<1e20
  AND "sourceUnitId"="unitId" AND "sourceUnitText" IS NOT NULL
  AND "calculationValue" IS NULL AND "conversionRuleId" IS NULL AND "conversionRuleVersion" IS NULL
  AND "appliedCoefficient" IS NULL AND "referenceMin" IS NULL AND "referenceMax" IS NULL)
 OR
 ("sourceValue" IS NOT NULL AND "sourceUnitId" IS NOT NULL AND "sourceValue">=0 AND "sourceValue"<1e20
  AND "calculationValue" IS NOT NULL AND "calculationValue">=0 AND "calculationValue"<1e40
  AND "appliedCoefficient" IS NOT NULL AND "appliedCoefficient">0 AND "appliedCoefficient"<1e20
  AND "referenceMin" IS NOT NULL AND "referenceMax" IS NOT NULL AND "referenceMin"<="referenceMax"
  AND "calculationValue"="sourceValue"*"appliedCoefficient"
  AND (("sourceUnitId"="unitId" AND "conversionRuleId" IS NULL AND "conversionRuleVersion" IS NULL AND "appliedCoefficient"=1)
   OR ("sourceUnitId"<>"unitId" AND "conversionRuleId" IS NOT NULL AND "conversionRuleVersion" IS NOT NULL AND "conversionRuleVersion">0)))
);
INSERT INTO migrations(name) VALUES('0006-source-measurements');
\endif
COMMIT;
