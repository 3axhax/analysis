export const FISEHA_FEMALE_ALT_SQL = `
DO $$
DECLARE
  source_id integer;
  age_id integer;
  point_id integer;
  unit_id integer;
  gender_id integer;
BEGIN
  SELECT id INTO STRICT source_id FROM "medicalSource"
  WHERE metadata->>'doi' = '10.1371/journal.pone.0276825';

  SELECT scope."ageId" INTO STRICT age_id
  FROM "medicalSourceAge" scope JOIN ages age ON age.id = scope."ageId"
  WHERE scope."sourceId" = source_id
    AND age."intervalDayStart" = 6480 AND age."intervalDayEnd" = 20879;

  SELECT p.id, u.id INTO STRICT point_id, unit_id
  FROM "analysisPoint" p
  JOIN analysis_point_units pu ON pu."pointId" = p.id
  JOIN "analysisPointUnits" u ON u.id = pu."unitsId"
  WHERE p.name = 'alanine_aminotransferase' AND u.code = 'U/L';
  SELECT id INTO STRICT gender_id FROM gender WHERE name = 'f';

  IF EXISTS (
    SELECT 1 FROM "analysisPointIntervalValue"
    WHERE "sourceId" = source_id AND "pointId" = point_id AND "genderId" = gender_id
  ) THEN
    RAISE EXCEPTION 'Fiseha female ALT intervals already exist';
  END IF;

  -- Fiseha et al., Table 1, female 95% reference interval.
  INSERT INTO "analysisPointIntervalValue" (
    "sourceId", "ageId", "pointId", "unitId", "genderId",
    "minValue", "maxValue", "minValueEqual", "maxValueEqual", status
  ) VALUES
    (source_id, age_id, point_id, unit_id, gender_id, NULL, 7.9, NULL, false, 'LOW'),
    (source_id, age_id, point_id, unit_id, gender_id, 7.9, 48.0, true, true, 'NORMAL'),
    (source_id, age_id, point_id, unit_id, gender_id, 48.0, NULL, false, NULL, 'HIGH');
END $$;
`;
