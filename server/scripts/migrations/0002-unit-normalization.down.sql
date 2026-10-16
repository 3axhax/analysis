-- Manual rollback ONLY after explicit approval. Refuses to discard normalized results.
\set ON_ERROR_STOP on
BEGIN;
SELECT pg_advisory_xact_lock(20002);
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM migrations WHERE name='0002-unit-normalization') THEN
   RAISE EXCEPTION 'Migration is not applied';
 END IF;
 IF EXISTS(SELECT 1 FROM "analysisResultPointData" WHERE "sourceValue" IS NOT NULL) THEN
   RAISE EXCEPTION 'Normalized results exist; use compatible application rollback, not destructive schema rollback';
 END IF;
END $$;
DROP TRIGGER validate_result_conversion ON "analysisResultPointData";
DROP FUNCTION validate_result_unit_conversion();
DROP TRIGGER protect_used_conversion_rule ON "unitConversionRule";
DROP FUNCTION protect_used_unit_conversion_rule();
ALTER TABLE "analysisResultPointData"
 DROP CONSTRAINT normalized_source_fields,
 DROP COLUMN "sourceValue", DROP COLUMN "sourceUnitId", DROP COLUMN "sourceUnitText",
 DROP COLUMN "calculationValue", DROP COLUMN "conversionRuleId", DROP COLUMN "conversionRuleVersion",
 DROP COLUMN "appliedCoefficient", DROP COLUMN "referenceMin", DROP COLUMN "referenceMax";
DROP TABLE "unitConversionRule";
DELETE FROM analysis_point_units l USING "analysisPoint" p,"analysisPointUnits" u
 WHERE l."pointId"=p.id AND l."unitsId"=u.id AND u.name='g/dl' AND p.name IN ('hemoglobin','mchc');
-- FK constraints refuse deletion if this unit acquired any other use.
DELETE FROM "analysisPointUnits" WHERE name='g/dl' AND code='g/dL';
ALTER TABLE "analysisPointUnits" DROP CONSTRAINT units_id_kind_unique, DROP CONSTRAINT units_parsing_length;
DROP INDEX units_code_unique;
ALTER TABLE "analysisPointUnits" DROP COLUMN code, DROP COLUMN "translationParsing", DROP COLUMN "quantityKind";
DELETE FROM migrations WHERE name='0002-unit-normalization';
COMMIT;
