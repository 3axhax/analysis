-- MANUAL. Apply only after approval and a verified backup; test on a copy first.
\set ON_ERROR_STOP on
BEGIN;
SELECT pg_advisory_xact_lock(20003);
SELECT EXISTS(SELECT 1 FROM migrations WHERE name='0003-ferritin-source-unit') AS already_applied \gset
\if :already_applied
\echo '0003-ferritin-source-unit already applied; no changes'
\else
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
INSERT INTO migrations(name) VALUES('0003-ferritin-source-unit');
\endif
COMMIT;
