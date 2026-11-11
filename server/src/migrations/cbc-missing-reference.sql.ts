// Fill only explicitly identified gaps; never replace an existing reference.
export const CBC_MISSING_REFERENCE_SQL = String.raw`
DO $$
DECLARE item record; gender_row record; point_id integer; age_id integer; unit_id integer; lo_count integer; hi_count integer;
BEGIN
  FOR item IN SELECT * FROM (VALUES
    ('mchc', '9_10y', 'g/l', 280::double precision, 360::double precision),
    ('monocyte-count', 'u18y', '10^9/l', 0.05::double precision, 0.82::double precision),
    ('lymphocyte-percentage', '1_2m', '%', 46::double precision, 65::double precision)
  ) AS expected(point_name, age_name, unit_name, lo, hi)
  LOOP
    SELECT id INTO STRICT point_id FROM "analysisPoint" WHERE name=item.point_name;
    SELECT id INTO STRICT age_id FROM ages WHERE name=item.age_name;
    SELECT id INTO STRICT unit_id FROM "analysisPointUnits" WHERE name=item.unit_name;
    IF NOT EXISTS (SELECT 1 FROM analysis_point_units WHERE "pointId"=point_id AND "unitsId"=unit_id) THEN
      RAISE EXCEPTION 'Missing permitted unit for %', item.point_name;
    END IF;
    IF (SELECT count(*) FROM gender WHERE name IN ('m','f')) <> 2 THEN
      RAISE EXCEPTION 'Expected both genders';
    END IF;
    FOR gender_row IN SELECT id FROM gender WHERE name IN ('m','f') LOOP
      SELECT count(*) INTO lo_count FROM "analysisPointMinValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_row.id AND "sourceId" IS NULL;
      SELECT count(*) INTO hi_count FROM "analysisPointMaxValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_row.id AND "sourceId" IS NULL;
      IF lo_count=0 AND hi_count=0 THEN
        INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId","sourceId","lowInclusive",value) VALUES (point_id,age_id,gender_row.id,unit_id,NULL,false,item.lo);
        INSERT INTO "analysisPointMaxValue" ("pointId","ageId","genderId","unitId","sourceId",value) VALUES (point_id,age_id,gender_row.id,unit_id,NULL,item.hi);
      ELSIF NOT (lo_count=1 AND hi_count=1 AND
        EXISTS (SELECT 1 FROM "analysisPointMinValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_row.id AND "unitId"=unit_id AND "sourceId" IS NULL AND "lowInclusive"=false AND value=item.lo) AND
        EXISTS (SELECT 1 FROM "analysisPointMaxValue" WHERE "pointId"=point_id AND "ageId"=age_id AND "genderId"=gender_row.id AND "unitId"=unit_id AND "sourceId" IS NULL AND value=item.hi)) THEN
        RAISE EXCEPTION 'Unexpected existing reference for %', item.point_name;
      END IF;
    END LOOP;
  END LOOP;
END $$;
`;
