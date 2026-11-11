export const INSULIN_REFERENCE_UNIT_SQL = String.raw`
DO $$
DECLARE p integer; micro_unit integer; milli_unit integer; n integer;
BEGIN
 LOCK TABLE "analysisPointMinValue", "analysisPointMaxValue", "analysisPointUnits", analysis_point_units, "unitConversionRule" IN SHARE ROW EXCLUSIVE MODE;
 SELECT id INTO STRICT p FROM "analysisPoint" WHERE name='insulin';
 SELECT id INTO STRICT micro_unit FROM "analysisPointUnits" WHERE code='u[iU]/L' AND "quantityKind"='immunoassay-activity-concentration';
 SELECT id INTO STRICT milli_unit FROM "analysisPointUnits" WHERE code='m[iU]/L' AND "quantityKind"='immunoassay-activity-concentration';
 IF (SELECT count(*) FROM "analysisPointMinValue" WHERE "pointId"=p AND "sourceId" IS NULL AND "unitId"=micro_unit AND value=2.5)<>60 OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE "pointId"=p AND "sourceId" IS NULL AND "unitId"=micro_unit AND value=24.9)<>60 OR (SELECT count(*) FROM "analysisPointMinValue" WHERE "pointId"=p AND "sourceId" IS NULL)<>60 OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE "pointId"=p AND "sourceId" IS NULL)<>60 THEN RAISE EXCEPTION 'Insulin reference baseline mismatch'; END IF;
 IF EXISTS (SELECT 1 FROM "unitConversionRule" WHERE "fromUnitId" IN (micro_unit,milli_unit) AND "toUnitId" IN (micro_unit,milli_unit) AND ("pointId" IS NULL OR "pointId"=p) AND active) THEN RAISE EXCEPTION 'Insulin conversion already exists'; END IF;
 INSERT INTO analysis_point_units("pointId","unitsId") VALUES(p,milli_unit) ON CONFLICT DO NOTHING;
 UPDATE "analysisPointUnits" SET "translationParsing"=concat_ws('_',"translationParsing",'мкЕд/мл') WHERE id=milli_unit AND NOT ('мкЕд/мл'=ANY(string_to_array(COALESCE("translationParsing",''),'_')));
 INSERT INTO "unitConversionRule"("pointId","fromUnitId","toUnitId","quantityKind",coefficient,version) VALUES (p,micro_unit,milli_unit,'immunoassay-activity-concentration',0.001,1),(p,milli_unit,micro_unit,'immunoassay-activity-concentration',1000,1);
 UPDATE "analysisPointMinValue" SET "unitId"=milli_unit,value=2.6 WHERE "pointId"=p AND "sourceId" IS NULL AND "unitId"=micro_unit; GET DIAGNOSTICS n=ROW_COUNT; IF n<>60 THEN RAISE EXCEPTION 'Unexpected insulin minimum count'; END IF;
 UPDATE "analysisPointMaxValue" SET "unitId"=milli_unit WHERE "pointId"=p AND "sourceId" IS NULL AND "unitId"=micro_unit; GET DIAGNOSTICS n=ROW_COUNT; IF n<>60 THEN RAISE EXCEPTION 'Unexpected insulin maximum count'; END IF;
END $$;
`;
