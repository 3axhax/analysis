// Shared startup SQL. Marker checks and transactions live in runRecordedMigration.
export const UNIT_NORMALIZATION_SQL = String.raw`
ALTER TABLE "analysisPointUnits"
  ADD COLUMN code VARCHAR(64),
  ADD COLUMN "translationParsing" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "quantityKind" VARCHAR(64);
CREATE UNIQUE INDEX units_code_unique ON "analysisPointUnits" (code) WHERE code IS NOT NULL;
ALTER TABLE "analysisPointUnits" ADD CONSTRAINT units_id_kind_unique UNIQUE(id,"quantityKind");
ALTER TABLE "analysisPointUnits" ADD CONSTRAINT units_parsing_length CHECK(length("translationParsing")<=4096);

UPDATE "analysisPointUnits" u SET code=s.code,"translationParsing"=s.parsing,"quantityKind"=s.kind
FROM (VALUES
 ('%','%','%','ratio'),
 ('g/l','g/L','г/л_g/l_g/L','mass-concentration'),
 ('10^12/l','10*12/L','10^12/л_10^12/l_х10^12/л_*10^12/л_млн/мкл_10^6/мкл','cell-concentration'),
 ('µmol/l','umol/L','мкмоль/л_µmol/l','molar-concentration'),
 ('fl','fL','фл_fl_fL','volume'),
 ('pg','pg','пг_pg','mass'),
 ('10^9/l','10*9/L','10^9/л_10^9/l_х10^9/л_*10^9/л_тыс/мкл_х10^3/мкл_10^3/мкл','cell-concentration'),
 ('mm/hour','mm/h','мм/ч_мм/час_mm/h_mm/hour','sedimentation-rate'),
 ('mkg/l','ug/L','мкг/л_mkg/l_mcg/l_µg/l','mass-concentration'),
 ('mg/dl','mg/dL','мг/дл_mg/dl_mg/dL','mass-concentration'),
 ('mmole/l','mmol/L','ммоль/л_mmole/l_mmol/l_mmol/L','molar-concentration'),
 ('unit/l','U/L','Ед/л_ед/л_Е/л_е/л_U/L_unit/l','enzyme-activity-concentration'),
 ('mkUnit/l','u[iU]/L','мкМЕ/л_мкЕд/л_mkUnit/l_µIU/L','immunoassay-activity-concentration'),
 ('ng/ml','ng/mL','нг/мл_ng/ml_ng/mL','mass-concentration'),
 ('mUnit/l','m[iU]/L','мМЕ/л_мЕд/л_mUnit/l_mIU/L_мкМЕ/мл','immunoassay-activity-concentration')
) AS s(name,code,parsing,kind) WHERE u.name=s.name;
DO $$ BEGIN
  IF (SELECT count(*) FROM "analysisPointUnits" WHERE code IS NOT NULL)<>15 THEN
    RAISE EXCEPTION 'Unit catalog differs from reviewed baseline';
  END IF;
END $$;
INSERT INTO "analysisPointUnits" (name,code,"translationParsing","quantityKind")
VALUES ('g/dl','g/dL','г/дл_g/dl_g/dL_г/100мл','mass-concentration');
INSERT INTO analysis_point_units("pointId","unitsId")
SELECT p.id,u.id FROM "analysisPoint" p CROSS JOIN "analysisPointUnits" u
WHERE p.name IN ('hemoglobin','mchc') AND u.name='g/dl'
AND NOT EXISTS(SELECT 1 FROM analysis_point_units l WHERE l."pointId"=p.id AND l."unitsId"=u.id);

CREATE TABLE "unitConversionRule" (
 id SERIAL PRIMARY KEY,
 "fromUnitId" INTEGER NOT NULL,
 "toUnitId" INTEGER NOT NULL,
 "quantityKind" VARCHAR(64) NOT NULL,
 "pointId" INTEGER REFERENCES "analysisPoint"(id),
 coefficient NUMERIC(38,18) NOT NULL CHECK(coefficient>0 AND coefficient<1e20),
 version INTEGER NOT NULL CHECK(version>0),
 active BOOLEAN NOT NULL DEFAULT TRUE,
 CHECK("fromUnitId"<>"toUnitId"),
 FOREIGN KEY("fromUnitId","quantityKind") REFERENCES "analysisPointUnits"(id,"quantityKind"),
 FOREIGN KEY("toUnitId","quantityKind") REFERENCES "analysisPointUnits"(id,"quantityKind")
);
CREATE UNIQUE INDEX conversion_rule_version_unique ON "unitConversionRule"("fromUnitId","toUnitId",COALESCE("pointId",0),version);
CREATE UNIQUE INDEX conversion_rule_active_unique ON "unitConversionRule"("fromUnitId","toUnitId",COALESCE("pointId",0)) WHERE active;
-- Direct dimensional scale changes only; identity k=1 is exact in code.
INSERT INTO "unitConversionRule"("fromUnitId","toUnitId","quantityKind",coefficient,version)
SELECT a.id,b.id,a."quantityKind",s.k,1
FROM (VALUES
 ('g/dl','g/l',10::NUMERIC),('g/l','g/dl',0.1::NUMERIC),
 ('µmol/l','mmole/l',0.001::NUMERIC),('mmole/l','µmol/l',1000::NUMERIC),
 ('ng/ml','mkg/l',1::NUMERIC),('mkg/l','ng/ml',1::NUMERIC),
 ('10^12/l','10^9/l',1000::NUMERIC),('10^9/l','10^12/l',0.001::NUMERIC)
) s(src,dst,k)
JOIN "analysisPointUnits" a ON a.name=s.src JOIN "analysisPointUnits" b ON b.name=s.dst;

ALTER TABLE "analysisResultPointData"
 ADD COLUMN "sourceValue" NUMERIC(38,18),
 ADD COLUMN "sourceUnitId" INTEGER REFERENCES "analysisPointUnits"(id),
 ADD COLUMN "sourceUnitText" VARCHAR(128),
 ADD COLUMN "calculationValue" NUMERIC(76,36),
 ADD COLUMN "conversionRuleId" INTEGER REFERENCES "unitConversionRule"(id),
 ADD COLUMN "conversionRuleVersion" INTEGER,
 ADD COLUMN "appliedCoefficient" NUMERIC(38,18),
 ADD COLUMN "referenceMin" NUMERIC(38,18),
 ADD COLUMN "referenceMax" NUMERIC(38,18),
 ADD CONSTRAINT normalized_source_fields CHECK(
   ("sourceValue" IS NULL AND "sourceUnitId" IS NULL AND "sourceUnitText" IS NULL AND "calculationValue" IS NULL AND "conversionRuleId" IS NULL AND "conversionRuleVersion" IS NULL AND "appliedCoefficient" IS NULL AND "referenceMin" IS NULL AND "referenceMax" IS NULL)
   OR
   ("sourceValue" IS NOT NULL AND "sourceUnitId" IS NOT NULL AND "sourceValue">=0 AND "sourceValue"<1e20
    AND "calculationValue" IS NOT NULL AND "calculationValue">=0 AND "calculationValue"<1e40
    AND "appliedCoefficient" IS NOT NULL AND "appliedCoefficient">0 AND "appliedCoefficient"<1e20
    AND "referenceMin" IS NOT NULL AND "referenceMax" IS NOT NULL AND "referenceMin"<="referenceMax"
    AND "calculationValue"="sourceValue"*"appliedCoefficient"
    AND (("sourceUnitId"="unitId" AND "conversionRuleId" IS NULL AND "conversionRuleVersion" IS NULL AND "appliedCoefficient"=1)
      OR ("sourceUnitId"<>"unitId" AND "conversionRuleId" IS NOT NULL AND "conversionRuleVersion" IS NOT NULL AND "conversionRuleVersion">0))));

CREATE FUNCTION validate_result_unit_conversion() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW."conversionRuleId" IS NOT NULL AND NOT EXISTS(
   SELECT 1 FROM "unitConversionRule" r WHERE r.id=NEW."conversionRuleId"
    AND r."fromUnitId"=NEW."sourceUnitId" AND r."toUnitId"=NEW."unitId"
    AND r.version=NEW."conversionRuleVersion" AND r.coefficient=NEW."appliedCoefficient"
    AND (r."pointId" IS NULL OR r."pointId"=NEW."pointId")
 ) THEN RAISE EXCEPTION 'Result conversion provenance mismatch'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_result_conversion BEFORE INSERT OR UPDATE ON "analysisResultPointData" FOR EACH ROW EXECUTE FUNCTION validate_result_unit_conversion();

CREATE FUNCTION protect_used_unit_conversion_rule() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM "analysisResultPointData" WHERE "conversionRuleId"=OLD.id) THEN
   IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Used conversion rule cannot be deleted'; END IF;
   IF (NEW."fromUnitId",NEW."toUnitId",NEW."pointId",NEW.coefficient,NEW.version,NEW."quantityKind")
       IS DISTINCT FROM (OLD."fromUnitId",OLD."toUnitId",OLD."pointId",OLD.coefficient,OLD.version,OLD."quantityKind") THEN
     RAISE EXCEPTION 'Create a new conversion rule version';
   END IF;
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER protect_used_conversion_rule BEFORE UPDATE OR DELETE ON "unitConversionRule" FOR EACH ROW EXECUTE FUNCTION protect_used_unit_conversion_rule();
`;

export const FERRITIN_SOURCE_UNIT_SQL = String.raw`
DO $$
DECLARE p INTEGER; src INTEGER; dst INTEGER;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM migrations WHERE name='0002-unit-normalization') THEN
    RAISE EXCEPTION 'Unit normalization prerequisite missing';
  END IF;
  SELECT id INTO STRICT p FROM "analysisPoint" WHERE name='ferritin';
  SELECT id INTO STRICT src FROM "analysisPointUnits" WHERE name='ng/ml' AND "quantityKind"='mass-concentration';
  SELECT id INTO STRICT dst FROM "analysisPointUnits" WHERE name='mkg/l' AND "quantityKind"='mass-concentration';
  IF (SELECT count(*) FROM "unitConversionRule" WHERE "fromUnitId"=src AND "toUnitId"=dst AND active AND ("pointId" IS NULL OR "pointId"=p))<>1
     OR NOT EXISTS(SELECT 1 FROM "unitConversionRule" WHERE "fromUnitId"=src AND "toUnitId"=dst AND active AND coefficient=1 AND ("pointId" IS NULL OR "pointId"=p))
     OR (SELECT count(*) FROM analysis_point_units WHERE "pointId"=p AND "unitsId"=dst)<>1 THEN
    RAISE EXCEPTION 'Reviewed conversion or target applicability differs';
  END IF;
  -- Refuse to adopt an unowned link: down must remove only our own change.
  IF EXISTS(SELECT 1 FROM analysis_point_units WHERE "pointId"=p AND "unitsId"=src) THEN
    RAISE EXCEPTION 'Source link already exists without migration marker';
  END IF;
  INSERT INTO analysis_point_units("pointId","unitsId") VALUES(p,src);
END $$;
`;

export const SOURCE_MEASUREMENTS_SQL = String.raw`
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
`;
