DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "analysisResultPointData" WHERE "calculationValue" IS NOT NULL OR "conversionRuleId" IS NOT NULL OR "conversionRuleVersion" IS NOT NULL OR "appliedCoefficient" IS NOT NULL OR "referenceMin" IS NOT NULL OR "referenceMax" IS NOT NULL) THEN
    RAISE EXCEPTION 'Historical calculation snapshots require review before removal';
  END IF;
END $$;
ALTER TABLE "analysisResultPointData" DROP CONSTRAINT normalized_source_fields;
ALTER TABLE "analysisResultPointData" DROP COLUMN "calculationValue", DROP COLUMN "conversionRuleId", DROP COLUMN "conversionRuleVersion", DROP COLUMN "appliedCoefficient", DROP COLUMN "referenceMin", DROP COLUMN "referenceMax";
ALTER TABLE "analysisResultPointData" ADD CONSTRAINT normalized_source_fields CHECK (
  ("sourceValue" IS NULL AND "sourceUnitId" IS NULL AND "sourceUnitText" IS NULL)
  OR ("sourceValue" IS NOT NULL AND "sourceUnitId" IS NOT NULL AND "sourceUnitText" IS NOT NULL AND "sourceValue" >= 0 AND "sourceValue" < 1e20 AND "sourceUnitId" = "unitId")
);
DROP TYPE IF EXISTS "enum_analysisResultDescriptionCondition_status";
