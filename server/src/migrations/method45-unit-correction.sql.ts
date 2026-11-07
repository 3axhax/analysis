// Correct mislabeled legacy reference units without rewriting stored measurements.
export const METHOD45_UNIT_CORRECTION_SQL = String.raw`
DO $$
DECLARE ft3 integer; ft4 integer; alt integer; urea integer; umol integer; mmol integer; percent_unit integer; enzyme integer; pmol integer; n integer; point integer;
BEGIN
 SELECT id INTO STRICT ft3 FROM "analysisPoint" WHERE name='ft3';
 SELECT id INTO STRICT ft4 FROM "analysisPoint" WHERE name='ft4';
 SELECT id INTO STRICT alt FROM "analysisPoint" WHERE name='alanine_aminotransferase';
 SELECT id INTO STRICT urea FROM "analysisPoint" WHERE name='urea';
 SELECT id INTO STRICT umol FROM "analysisPointUnits" WHERE code='umol/L';
 SELECT id INTO STRICT mmol FROM "analysisPointUnits" WHERE code='mmol/L';
 SELECT id INTO STRICT percent_unit FROM "analysisPointUnits" WHERE code='%';
 SELECT id INTO STRICT enzyme FROM "analysisPointUnits" WHERE code='U/L';
 IF EXISTS (SELECT 1 FROM "analysisPointUnits" WHERE code='pmol/L' AND "quantityKind" IS DISTINCT FROM 'molar-concentration') THEN RAISE EXCEPTION 'Existing pmol unit has incompatible quantity'; END IF;
 INSERT INTO "analysisPointUnits"(name,code,"translationParsing","quantityKind") SELECT 'pmol/l','pmol/L','пмоль/л_pmol/l_pmol/L','molar-concentration' WHERE NOT EXISTS(SELECT 1 FROM "analysisPointUnits" WHERE code='pmol/L');
 SELECT id INTO STRICT pmol FROM "analysisPointUnits" WHERE code='pmol/L';
 FOREACH point IN ARRAY ARRAY[ft3,ft4] LOOP
  IF (SELECT count(*) FROM "analysisPointMinValue" WHERE "pointId"=point AND "sourceId" IS NULL AND "unitId"=umol)<>28 OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE "pointId"=point AND "sourceId" IS NULL AND "unitId"=umol)<>28 THEN RAISE EXCEPTION 'Thyroid reference preconditions failed'; END IF;
  IF EXISTS(SELECT 1 FROM "analysisPointMinValue" WHERE "pointId"=point AND "sourceId" IS NULL AND "unitId"=pmol) OR EXISTS(SELECT 1 FROM "analysisPointMaxValue" WHERE "pointId"=point AND "sourceId" IS NULL AND "unitId"=pmol) THEN RAISE EXCEPTION 'Thyroid target reference exists'; END IF;
  INSERT INTO analysis_point_units("pointId","unitsId") VALUES(point,pmol) ON CONFLICT DO NOTHING;
  UPDATE "analysisPointMinValue" SET "unitId"=pmol WHERE "pointId"=point AND "sourceId" IS NULL AND "unitId"=umol;
  UPDATE "analysisPointMaxValue" SET "unitId"=pmol WHERE "pointId"=point AND "sourceId" IS NULL AND "unitId"=umol;
  INSERT INTO "unitConversionRule"("pointId","fromUnitId","toUnitId","quantityKind",coefficient,version) VALUES(point,umol,pmol,'molar-concentration',1000000,1),(point,pmol,umol,'molar-concentration',0.000001,1);
 END LOOP;
 IF (SELECT count(*) FROM "analysisPointMinValue" WHERE "pointId"=alt AND "sourceId" IS NULL AND "unitId"=percent_unit)<>27 OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE "pointId"=alt AND "sourceId" IS NULL AND "unitId"=percent_unit)<>27 THEN RAISE EXCEPTION 'ALT preconditions failed'; END IF;
 UPDATE "analysisPointMinValue" SET "unitId"=enzyme WHERE "pointId"=alt AND "sourceId" IS NULL AND "unitId"=percent_unit;
 UPDATE "analysisPointMaxValue" SET "unitId"=enzyme WHERE "pointId"=alt AND "sourceId" IS NULL AND "unitId"=percent_unit;
 DELETE FROM analysis_point_units WHERE "pointId"=alt AND "unitsId"=percent_unit;
 IF (SELECT count(*) FROM "analysisPointMinValue" WHERE "pointId"=urea AND "sourceId" IS NULL AND "unitId"=umol)<>4 OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE "pointId"=urea AND "sourceId" IS NULL AND "unitId"=umol)<>4 THEN RAISE EXCEPTION 'Urea preconditions failed'; END IF;
 UPDATE "analysisPointMinValue" SET "unitId"=mmol WHERE "pointId"=urea AND "sourceId" IS NULL AND "unitId"=umol;
 UPDATE "analysisPointMaxValue" SET "unitId"=mmol WHERE "pointId"=urea AND "sourceId" IS NULL AND "unitId"=umol;
END $$;
`;
