// Apply only the exact user-approved legacy corrections; retain all result provenance.
export const METHOD45_REFERENCE_CORRECTION_SQL = String.raw`
DO $$
DECLARE mchc integer; ggt integer; age_mchc integer; male integer; u_gl integer; u_ul integer; old_m integer; old_x integer; fixed_m integer; fixed_x integer;
BEGIN
 SELECT id INTO STRICT mchc FROM "analysisPoint" WHERE name='mchc';
 SELECT id INTO STRICT ggt FROM "analysisPoint" WHERE name='ggtp';
 SELECT id INTO STRICT age_mchc FROM ages WHERE name='1_3y';
 SELECT id INTO STRICT male FROM gender WHERE name='m';
 SELECT id INTO STRICT u_gl FROM "analysisPointUnits" WHERE code='g/L';
 SELECT id INTO STRICT u_ul FROM "analysisPointUnits" WHERE code='U/L';
 SELECT count(*) FILTER (WHERE value=390),count(*) FILTER (WHERE value=370) INTO old_m,fixed_m FROM "analysisPointMinValue" WHERE "pointId"=mchc AND "ageId"=age_mchc AND "unitId"=u_gl AND "sourceId" IS NULL;
 SELECT count(*) FILTER (WHERE value=370),count(*) FILTER (WHERE value=390) INTO old_x,fixed_x FROM "analysisPointMaxValue" WHERE "pointId"=mchc AND "ageId"=age_mchc AND "unitId"=u_gl AND "sourceId" IS NULL;
 IF old_m=2 AND old_x=2 AND fixed_m=0 AND fixed_x=0 THEN
   UPDATE "analysisPointMinValue" SET value=370 WHERE "pointId"=mchc AND "ageId"=age_mchc AND "unitId"=u_gl AND "sourceId" IS NULL;
   UPDATE "analysisPointMaxValue" SET value=390 WHERE "pointId"=mchc AND "ageId"=age_mchc AND "unitId"=u_gl AND "sourceId" IS NULL;
 ELSIF NOT (old_m=0 AND old_x=0 AND fixed_m=2 AND fixed_x=2) THEN RAISE EXCEPTION 'Unexpected MCHC bounds'; END IF;
 IF (SELECT count(*) FROM "analysisPointMinValue" mn JOIN ages a ON a.id=mn."ageId" WHERE mn."pointId"=ggt AND a.name IN ('12_15y','15_18y') AND mn."genderId"=male AND mn."unitId"=u_ul AND mn."sourceId" IS NULL)=4 AND (SELECT count(*) FROM "analysisPointMaxValue" mx JOIN ages a ON a.id=mx."ageId" WHERE mx."pointId"=ggt AND a.name IN ('12_15y','15_18y') AND mx."genderId"=male AND mx."unitId"=u_ul AND mx."sourceId" IS NULL)=4 THEN
   IF (SELECT count(*) FROM "analysisPointMinValue" WHERE id IN (6125,6128) AND "pointId"=ggt AND "genderId"=male AND "unitId"=u_ul AND "sourceId" IS NULL AND value=0)<>2 OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE id IN (6125,6128) AND "pointId"=ggt AND "genderId"=male AND "unitId"=u_ul AND "sourceId" IS NULL AND value=33)<>2 OR (SELECT count(*) FROM "analysisPointMinValue" WHERE id IN (6139,6140) AND "pointId"=ggt AND "genderId"=male AND "unitId"=u_ul AND "sourceId" IS NULL AND value=0)<>2 OR (SELECT count(*) FROM "analysisPointMaxValue" WHERE id IN (6139,6140) AND "pointId"=ggt AND "genderId"=male AND "unitId"=u_ul AND "sourceId" IS NULL AND value=45)<>2 THEN RAISE EXCEPTION 'Unexpected duplicate GGT bounds'; END IF;
   DELETE FROM "analysisPointMinValue" WHERE id IN (6125,6128);
   DELETE FROM "analysisPointMaxValue" WHERE id IN (6125,6128);
 ELSIF NOT ((SELECT count(*) FROM "analysisPointMinValue" WHERE id IN (6139,6140) AND "pointId"=ggt AND "genderId"=male AND "unitId"=u_ul AND "sourceId" IS NULL AND value=0)=2 AND (SELECT count(*) FROM "analysisPointMaxValue" WHERE id IN (6139,6140) AND "pointId"=ggt AND "genderId"=male AND "unitId"=u_ul AND "sourceId" IS NULL AND value=45)=2 AND (SELECT count(*) FROM "analysisPointMinValue" mn JOIN ages a ON a.id=mn."ageId" WHERE mn."pointId"=ggt AND a.name IN ('12_15y','15_18y') AND mn."genderId"=male AND mn."unitId"=u_ul AND mn."sourceId" IS NULL)=2 AND (SELECT count(*) FROM "analysisPointMaxValue" mx JOIN ages a ON a.id=mx."ageId" WHERE mx."pointId"=ggt AND a.name IN ('12_15y','15_18y') AND mx."genderId"=male AND mx."unitId"=u_ul AND mx."sourceId" IS NULL)=2) THEN RAISE EXCEPTION 'Unexpected GGT references'; END IF;
END $$;
`;
