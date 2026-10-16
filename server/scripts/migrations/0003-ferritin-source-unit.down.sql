-- MANUAL rollback. Refuses to remove applicability used by normalized results.
\set ON_ERROR_STOP on
BEGIN;
SELECT pg_advisory_xact_lock(20003);
SELECT EXISTS(SELECT 1 FROM migrations WHERE name='0003-ferritin-source-unit') AS applied \gset
\if :applied
DO $$
DECLARE p INTEGER; src INTEGER;
BEGIN
  SELECT id INTO STRICT p FROM "analysisPoint" WHERE name='ferritin';
  SELECT id INTO STRICT src FROM "analysisPointUnits" WHERE name='ng/ml';
  IF EXISTS(SELECT 1 FROM "analysisResultPointData" WHERE "pointId"=p AND ("sourceUnitId"=src OR "unitId"=src)) THEN
    RAISE EXCEPTION 'Source unit is used by saved results; preserve applicability';
  END IF;
  IF (SELECT count(*) FROM analysis_point_units WHERE "pointId"=p AND "unitsId"=src)<>1 THEN
    RAISE EXCEPTION 'Source applicability differs from migration';
  END IF;
  DELETE FROM analysis_point_units WHERE "pointId"=p AND "unitsId"=src;
END $$;
DELETE FROM migrations WHERE name='0003-ferritin-source-unit';
\else
\echo '0003-ferritin-source-unit not applied; no changes'
\endif
COMMIT;
