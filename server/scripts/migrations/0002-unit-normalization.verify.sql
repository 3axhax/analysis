-- Synthetic constraints test. Refuses to run against a working/production DB.
\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE src INTEGER; dst INTEGER; rule_id INTEGER; result_id INTEGER; age_id INTEGER; gender_id INTEGER; point_id INTEGER;
BEGIN
 IF current_database() NOT LIKE 'analysis_unitnorm_verify_%' THEN RAISE EXCEPTION 'Disposable verification database required'; END IF;
 SELECT id INTO src FROM "analysisPointUnits" WHERE name='g/dl';
 SELECT id INTO dst FROM "analysisPointUnits" WHERE name='g/l';
 SELECT id INTO point_id FROM "analysisPoint" WHERE name='hemoglobin';
 SELECT id INTO rule_id FROM "unitConversionRule" WHERE "fromUnitId"=src AND "toUnitId"=dst AND active;
 SELECT min(id) INTO age_id FROM ages; SELECT min(id) INTO gender_id FROM gender;
 IF src IS NULL OR dst IS NULL OR rule_id IS NULL OR point_id IS NULL THEN RAISE EXCEPTION 'Missing seed'; END IF;
 BEGIN
   INSERT INTO "unitConversionRule"("fromUnitId","toUnitId","quantityKind",coefficient,version) VALUES(src,dst,'mass-concentration',0,99);
   RAISE EXCEPTION 'Zero coefficient accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
   INSERT INTO "unitConversionRule"("fromUnitId","toUnitId","quantityKind",coefficient,version) VALUES(src,1,'mass-concentration',10,99);
   RAISE EXCEPTION 'Incompatible unit families accepted';
 EXCEPTION WHEN foreign_key_violation THEN NULL; END;
 INSERT INTO "analysisResult"("resultId","ageId","genderId","ageInDays","createdAt","updatedAt")
 VALUES('unit-normalization-synthetic-copy-only',age_id,gender_id,1,NOW(),NOW()) RETURNING id INTO result_id;
 INSERT INTO "analysisResultPointData"("resultId","pointId",value,"unitId","sourceValue","sourceUnitId","sourceUnitText","calculationValue","conversionRuleId","conversionRuleVersion","appliedCoefficient","referenceMin","referenceMax")
 VALUES(result_id,point_id,120,dst,12,src,'г/дл',120,rule_id,1,10,100,160);
 BEGIN
   UPDATE "unitConversionRule" SET coefficient=9 WHERE id=rule_id;
   RAISE EXCEPTION 'Used rule was mutable';
 EXCEPTION WHEN raise_exception THEN
   IF SQLERRM <> 'Create a new conversion rule version' THEN RAISE; END IF;
 END;
 BEGIN
   UPDATE "analysisResultPointData" SET "conversionRuleVersion"=NULL WHERE "resultId"=result_id;
   RAISE EXCEPTION 'Incomplete provenance accepted';
 EXCEPTION WHEN check_violation THEN NULL;
 WHEN raise_exception THEN IF SQLERRM <> 'Result conversion provenance mismatch' THEN RAISE; END IF; END;
END $$;
COMMIT;
