export const GGTP_POINT_CONSOLIDATION_SQL = String.raw`
DO $$
DECLARE n integer;
BEGIN
 LOCK TABLE "analysisPoint", "analysisPointMinValue", "analysisPointMaxValue", "analysisResultPointData", "analysisResultDescriptionCondition", analysis_point_units, analysis_type_point, "sourceReferenceInheritance", "unitConversionRule", translation IN SHARE ROW EXCLUSIVE MODE;
 IF NOT EXISTS (SELECT 1 FROM "analysisPoint" WHERE id=35 AND name='gamma-glutamyl-transpeptidase' AND "translationParsing"='GGTP_ГГТП_Гамма-глютамилтранспептидаза_Gamma-glutamyl transpeptidase') OR NOT EXISTS (SELECT 1 FROM "analysisPoint" WHERE id=62 AND name='ggtp' AND "translationParsing"='GGT_Gamma-glutamyl transpeptidase_Гамма-глютамилтранспептидаза') THEN RAISE EXCEPTION 'Unexpected GGT points'; END IF;
 IF EXISTS ((SELECT "ageId","genderId","unitId","sourceId","lowInclusive",value FROM "analysisPointMinValue" WHERE "pointId"=35 EXCEPT SELECT "ageId","genderId","unitId","sourceId","lowInclusive",value FROM "analysisPointMinValue" WHERE "pointId"=62) UNION ALL (SELECT "ageId","genderId","unitId","sourceId","lowInclusive",value FROM "analysisPointMinValue" WHERE "pointId"=62 EXCEPT SELECT "ageId","genderId","unitId","sourceId","lowInclusive",value FROM "analysisPointMinValue" WHERE "pointId"=35)) OR EXISTS ((SELECT "ageId","genderId","unitId","sourceId",value FROM "analysisPointMaxValue" WHERE "pointId"=35 EXCEPT SELECT "ageId","genderId","unitId","sourceId",value FROM "analysisPointMaxValue" WHERE "pointId"=62) UNION ALL (SELECT "ageId","genderId","unitId","sourceId",value FROM "analysisPointMaxValue" WHERE "pointId"=62 EXCEPT SELECT "ageId","genderId","unitId","sourceId",value FROM "analysisPointMaxValue" WHERE "pointId"=35)) THEN RAISE EXCEPTION 'GGT reference mismatch'; END IF;
 IF EXISTS ((SELECT "unitsId" FROM analysis_point_units WHERE "pointId"=35 EXCEPT SELECT "unitsId" FROM analysis_point_units WHERE "pointId"=62) UNION ALL (SELECT "unitsId" FROM analysis_point_units WHERE "pointId"=62 EXCEPT SELECT "unitsId" FROM analysis_point_units WHERE "pointId"=35)) OR (SELECT count(*) FROM analysis_point_units WHERE "pointId"=35)<>1 OR (SELECT count(*) FROM analysis_point_units WHERE "pointId"=62)<>1 THEN RAISE EXCEPTION 'GGT unit mismatch'; END IF;
 IF EXISTS (SELECT 1 FROM analysis_type_point WHERE "pointId"=35) OR EXISTS (SELECT 1 FROM "analysisResultDescriptionCondition" WHERE "pointId"=35) OR EXISTS (SELECT 1 FROM "sourceReferenceInheritance" WHERE "pointId" IN (35,62)) OR EXISTS (SELECT 1 FROM "unitConversionRule" WHERE "pointId" IN (35,62)) THEN RAISE EXCEPTION 'Unexpected point dependencies'; END IF;
 IF EXISTS (SELECT 1 FROM "analysisResultPointData" d WHERE d."pointId"=35 AND (NOT EXISTS (SELECT 1 FROM analysis_point_units u WHERE u."pointId"=62 AND u."unitsId"=d."unitId") OR (d."sourceUnitId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM analysis_point_units u WHERE u."pointId"=62 AND u."unitsId"=d."sourceUnitId")))) THEN RAISE EXCEPTION 'Unsupported saved unit'; END IF;
 IF EXISTS (SELECT 1 FROM "analysisResultPointData" d WHERE d."pointId"=35 AND NOT EXISTS (SELECT 1 FROM "analysisResultPointData" e WHERE e."resultId"=d."resultId" AND e."pointId"=62) GROUP BY d."resultId" HAVING count(*)>1) THEN RAISE EXCEPTION 'Multiple source measurements'; END IF;
 UPDATE "analysisPoint" SET "translationParsing"='GGT_GGTP_ГГТП_Gamma-glutamyl transpeptidase_Гамма-глютамилтранспептидаза' WHERE id=62;
 DELETE FROM "analysisResultPointData" d WHERE d."pointId"=35 AND EXISTS (SELECT 1 FROM "analysisResultPointData" e WHERE e."resultId"=d."resultId" AND e."pointId"=62);
 UPDATE "analysisResultPointData" SET "pointId"=62 WHERE "pointId"=35;
 DELETE FROM "analysisPointMinValue" WHERE "pointId"=35;
 DELETE FROM "analysisPointMaxValue" WHERE "pointId"=35;
 DELETE FROM translation WHERE namespace='entities' AND module='analysisPoint' AND submodule='gamma-glutamyl-transpeptidase';
 DELETE FROM "analysisPoint" WHERE id=35;
 GET DIAGNOSTICS n=ROW_COUNT; IF n<>1 THEN RAISE EXCEPTION 'Point deletion mismatch'; END IF;
END $$;
`;
