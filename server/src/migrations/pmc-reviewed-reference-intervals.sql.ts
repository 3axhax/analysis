export const PMC_REVIEWED_REFERENCE_INTERVALS_SQL = `
CREATE TEMP TABLE reviewed_reference (
  publication_key text, lower_day integer, upper_day integer, point_name text, unit_code text,
  sex text, lower_limit numeric, upper_limit numeric,
  CHECK (lower_day <= upper_day AND lower_limit < upper_limit)
) ON COMMIT DROP;

INSERT INTO reviewed_reference VALUES
  ('shenzhen', 28, 359, 'aspartate_aminotransferase', 'U/L', NULL, 22.29, 75.70),
  ('shenzhen', 360, 719, 'aspartate_aminotransferase', 'U/L', NULL, 24.48, 55.68),
  ('shenzhen', 720, 2519, 'aspartate_aminotransferase', 'U/L', NULL, 21.91, 44.81),
  ('shenzhen', 2520, 4679, 'aspartate_aminotransferase', 'U/L', NULL, 13.30, 38.58),
  ('shenzhen', 4680, 6479, 'aspartate_aminotransferase', 'U/L', 'm', 11.21, 33.44),
  ('shenzhen', 4680, 6479, 'aspartate_aminotransferase', 'U/L', 'f', 10.33, 27.44),
  ('shenzhen', 28, 359, 'alanine_aminotransferase', 'U/L', NULL, 8.38, 70.94),
  ('shenzhen', 360, 2519, 'alanine_aminotransferase', 'U/L', NULL, 8.42, 30.91),
  ('shenzhen', 2520, 6479, 'alanine_aminotransferase', 'U/L', 'm', 7.15, 46.55),
  ('shenzhen', 2520, 6479, 'alanine_aminotransferase', 'U/L', 'f', 6.25, 28.18),
  ('shenzhen', 28, 179, 'alkaline_phosphatase', 'U/L', NULL, 135.47, 517.64),
  ('shenzhen', 180, 359, 'alkaline_phosphatase', 'U/L', NULL, 118.61, 361.88),
  ('shenzhen', 360, 2519, 'alkaline_phosphatase', 'U/L', NULL, 157.74, 379.32),
  ('shenzhen', 2520, 3959, 'alkaline_phosphatase', 'U/L', NULL, 153.48, 396.12),
  ('shenzhen', 3960, 5399, 'alkaline_phosphatase', 'U/L', 'm', 122.97, 530.94),
  ('shenzhen', 3960, 5399, 'alkaline_phosphatase', 'U/L', 'f', 77.39, 384.43),
  ('shenzhen', 5400, 6479, 'alkaline_phosphatase', 'U/L', NULL, 37.71, 238.28),
  ('shenzhen', 28, 179, 'ggtp', 'U/L', NULL, 13.45, 159.03),
  ('shenzhen', 180, 6479, 'ggtp', 'U/L', NULL, 8.64, 35.41),
  ('shenzhen', 28, 89, 'bilirubin', 'umol/L', NULL, 2.04, 30.40),
  ('shenzhen', 90, 359, 'bilirubin', 'umol/L', NULL, 1.38, 9.96),
  ('shenzhen', 360, 4319, 'bilirubin', 'umol/L', NULL, 2.42, 12.75),
  ('shenzhen', 4320, 6479, 'bilirubin', 'umol/L', NULL, 3.82, 17.20),
  ('shenzhen', 28, 89, 'direct-bilirubin', 'umol/L', NULL, 1.30, 15.63),
  ('shenzhen', 90, 209, 'direct-bilirubin', 'umol/L', NULL, 0.54, 5.15),
  ('shenzhen', 210, 359, 'direct-bilirubin', 'umol/L', NULL, 0.45, 3.40),
  ('shenzhen', 360, 3599, 'direct-bilirubin', 'umol/L', NULL, 0.73, 4.52),
  ('shenzhen', 3600, 6479, 'direct-bilirubin', 'umol/L', NULL, 1.00, 7.11),
  ('shenzhen', 28, 719, 'creatinine', 'umol/L', NULL, 16.88, 34.54),
  ('shenzhen', 720, 1439, 'creatinine', 'umol/L', NULL, 21.74, 42.19),
  ('shenzhen', 1440, 4319, 'creatinine', 'umol/L', NULL, 27.83, 54.36),
  ('shenzhen', 4320, 6479, 'creatinine', 'umol/L', 'm', 39.77, 93.51),
  ('shenzhen', 4320, 6479, 'creatinine', 'umol/L', 'f', 35.24, 77.70),
  ('shenzhen', 28, 179, 'urea', 'mmol/L', NULL, 0.99, 5.32),
  ('shenzhen', 180, 359, 'urea', 'mmol/L', NULL, 1.13, 5.92),
  ('shenzhen', 360, 6479, 'urea', 'mmol/L', 'm', 2.85, 7.03),
  ('shenzhen', 360, 6479, 'urea', 'mmol/L', 'f', 2.37, 6.36),
  ('shenzhen', 28, 359, 'uric_acid', 'umol/L', NULL, 99.91, 386.35),
  ('shenzhen', 360, 3959, 'uric_acid', 'umol/L', NULL, 159.96, 368.38),
  ('shenzhen', 3960, 6479, 'uric_acid', 'umol/L', 'm', 194.76, 480.95),
  ('shenzhen', 3960, 6479, 'uric_acid', 'umol/L', 'f', 123.90, 395.65),
  ('shenzhen', 28, 719, 'cholesterol', 'mmol/L', NULL, 2.30, 5.58),
  ('shenzhen', 720, 3599, 'cholesterol', 'mmol/L', NULL, 2.63, 5.78),
  ('shenzhen', 3600, 6479, 'cholesterol', 'mmol/L', NULL, 2.49, 5.16),
  ('shenzhen', 28, 719, 'triglycerides', 'mmol/L', NULL, 0.44, 2.54),
  ('shenzhen', 720, 3599, 'triglycerides', 'mmol/L', NULL, 0.31, 2.08),
  ('shenzhen', 3600, 6479, 'triglycerides', 'mmol/L', NULL, 0.35, 1.85),
  ('shenzhen', 28, 149, 'ldl-cholesterol', 'mmol/L', NULL, 0.91, 3.00),
  ('shenzhen', 150, 719, 'ldl-cholesterol', 'mmol/L', NULL, 1.22, 3.48),
  ('shenzhen', 720, 3959, 'ldl-cholesterol', 'mmol/L', NULL, 1.28, 3.40),
  ('shenzhen', 3960, 6479, 'ldl-cholesterol', 'mmol/L', NULL, 1.28, 3.27),
  ('shenzhen', 28, 209, 'hdl-cholesterol', 'mmol/L', NULL, 0.40, 2.30),
  ('shenzhen', 210, 719, 'hdl-cholesterol', 'mmol/L', NULL, 0.62, 1.80),
  ('shenzhen', 720, 3959, 'hdl-cholesterol', 'mmol/L', NULL, 0.80, 2.21),
  ('shenzhen', 3960, 6479, 'hdl-cholesterol', 'mmol/L', NULL, 0.82, 2.01),
  ('shenzhen', 28, 179, 'na', 'mmol/L', NULL, 136.35, 147.96),
  ('shenzhen', 180, 359, 'na', 'mmol/L', NULL, 136.81, 146.93),
  ('shenzhen', 360, 6479, 'na', 'mmol/L', NULL, 136.40, 143.86),
  ('shenzhen', 28, 359, 'k', 'mmol/L', NULL, 3.90, 5.90),
  ('shenzhen', 360, 2519, 'k', 'mmol/L', NULL, 3.80, 5.20),
  ('shenzhen', 2520, 6479, 'k', 'mmol/L', NULL, 3.70, 5.00),
  ('shenzhen', 28, 179, 'cl', 'mmol/L', NULL, 103.00, 114.00),
  ('shenzhen', 180, 6479, 'cl', 'mmol/L', NULL, 102.00, 111.00),
  ('shenzhen', 28, 719, 'ca', 'mmol/L', NULL, 2.34, 2.73),
  ('shenzhen', 720, 1799, 'ca', 'mmol/L', NULL, 2.39, 2.68),
  ('shenzhen', 1800, 6479, 'ca', 'mmol/L', NULL, 2.36, 2.63),
  ('shenzhen', 28, 119, 'mg', 'mmol/L', NULL, 0.80, 1.07),
  ('shenzhen', 120, 719, 'mg', 'mmol/L', NULL, 0.80, 1.10),
  ('shenzhen', 720, 6479, 'mg', 'mmol/L', NULL, 0.80, 1.00),
  ('shenzhen', 28, 179, 'p', 'mmol/L', NULL, 1.48, 2.48),
  ('shenzhen', 180, 359, 'p', 'mmol/L', NULL, 1.39, 2.25),
  ('shenzhen', 360, 2159, 'p', 'mmol/L', NULL, 1.31, 1.96),
  ('shenzhen', 2160, 6479, 'p', 'mmol/L', 'm', 1.19, 1.98),
  ('shenzhen', 2160, 6479, 'p', 'mmol/L', 'f', 1.13, 1.88),
  ('shenzhen', 28, 1079, 'ldh', 'U/L', NULL, 196.16, 468.09),
  ('shenzhen', 1080, 2879, 'ldh', 'U/L', NULL, 193.49, 335.66),
  ('shenzhen', 2880, 4319, 'ldh', 'U/L', NULL, 144.68, 294.75),
  ('shenzhen', 4320, 6479, 'ldh', 'U/L', NULL, 131.57, 241.08),
  ('shenzhen', 28, 89, 'ferrum', 'umol/L', NULL, 2.95, 25.93),
  ('shenzhen', 90, 359, 'ferrum', 'umol/L', NULL, 2.21, 19.09),
  ('shenzhen', 360, 6479, 'ferrum', 'umol/L', NULL, 2.56, 23.84),
  ('shenzhen', 28, 179, 'ferritin', 'ng/mL', NULL, 13.32, 553.78),
  ('shenzhen', 180, 2159, 'ferritin', 'ng/mL', NULL, 11.71, 173.50),
  ('shenzhen', 2160, 6479, 'ferritin', 'ng/mL', 'm', 16.75, 145.47),
  ('shenzhen', 2160, 6479, 'ferritin', 'ng/mL', 'f', 11.25, 135.03),
  ('shenzhen', 28, 359, 'transferrin', 'g/L', NULL, 1.31, 3.06),
  ('shenzhen', 360, 6479, 'transferrin', 'g/L', NULL, 1.60, 3.20),
  ('shenzhen', 28, 89, 'tibc', 'umol/L', NULL, 27.35, 63.95),
  ('shenzhen', 90, 359, 'tibc', 'umol/L', NULL, 40.15, 74.81),
  ('shenzhen', 360, 6479, 'tibc', 'umol/L', NULL, 39.93, 72.14);


-- The final cohort includes participants from age 10 and has an open upper age group.
INSERT INTO reviewed_reference VALUES
  ('dhaka', 3600, NULL, 'hemoglobin', 'g/dL', 'm', 12.1, 16.7),
  ('dhaka', 3600, NULL, 'hemoglobin', 'g/dL', 'f', 10.2, 14.4),
  ('dhaka', 3600, NULL, 'hematocrit', '%', 'm', 38.4, 50.6),
  ('dhaka', 3600, NULL, 'hematocrit', '%', 'f', 33.6, 44.1),
  ('dhaka', 3600, NULL, 'mchc', 'g/dL', 'm', 30.9, 34.9),
  ('dhaka', 3600, NULL, 'mchc', 'g/dL', 'f', 29.9, 33.9),
  ('dhaka', 3600, NULL, 'mcv', 'fL', NULL, 75.4, 93.9),
  ('dhaka', 3600, NULL, 'mch', 'pg', NULL, 23.4, 30.6),
  ('dhaka', 3600, NULL, 'rdw', '%', 'm', 11.7, 14.7),
  ('dhaka', 3600, NULL, 'rdw', '%', 'f', 11.7, 15.4),
  ('dhaka', 3600, NULL, 'leukocytes', '10*9/L', NULL, 4.93, 11.8),
  ('dhaka', 3600, NULL, 'neutrophil-percentage', '%', NULL, 40.4, 73.7),
  ('dhaka', 3600, NULL, 'lymphocyte-percentage', '%', NULL, 21.5, 48.6),
  ('dhaka', 3600, NULL, 'monocyte-percentage', '%', 'm', 2.17, 5.27),
  ('dhaka', 3600, NULL, 'monocyte-percentage', '%', 'f', 1.83, 4.62),
  ('dhaka', 3600, NULL, 'eosinophil-percentage', '%', 'm', 1.45, 15.6),
  ('dhaka', 3600, NULL, 'eosinophil-percentage', '%', 'f', 0.87, 11.8),
  ('dhaka', 3600, NULL, 'basophil-percentage', '%', NULL, 0.02, 0.34),
  ('dhaka', 3600, NULL, 'platelets', '10*9/L', 'm', 97.2, 412),
  ('dhaka', 3600, NULL, 'platelets', '10*9/L', 'f', 113, 451),
  ('dhaka', 3600, NULL, 'mpv', 'fL', NULL, 9.23, 13.4);
UPDATE reviewed_reference SET upper_day = (SELECT max("intervalDayEnd") FROM ages) WHERE publication_key = 'dhaka';

DO $$
DECLARE
  root_id integer;
  document_id integer;
  age_id integer;
  point_id integer;
  unit_id integer;
  source record;
  reference record;
  publication record;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource"
  WHERE parent_id IS NULL AND name = 'PubMed Central';

  FOR publication IN SELECT * FROM (VALUES
    ('shenzhen', 'Liu и соавт. — детская биохимия, 28 суток – 17 лет', '10.1016/j.plabm.2026.e00537', 'PMC13196472', 'Qinlan Liu, Xiufa Zhang, Ling Zhuang, Yidan Wang, Xian Chen, Feng Wang', 'Establishment of reference intervals for 41 serum biochemical analytes in healthy Chinese children', 'Table 1, serum biochemistry'),
    ('dhaka', 'Haq и соавт. — ОАК городской Дакки, от 10 лет', '10.3390/biom16070968', 'PMC13406479', 'Md. Ahsanul Haq, Kiyoshi Ichihara, Dewan Zubaer Islam, Md. Jakarea, Mohammad Mehedi Hasan, Anjan Kumar Roy, Evana Akhtar, Rubhana Raqib, Protim Sarker, Jordi Camps', 'Defining Reference Intervals for Complete Blood Count and Micronutrient Parameters in Urban Bangladeshi Population', 'Table 4, parametric with LAVE')
  ) AS v(key, name, doi, pmcid, authors, title, section)
  LOOP
    INSERT INTO "medicalSource" (parent_id, name, metadata)
    VALUES (root_id, publication.name, jsonb_build_object(
      'doi', publication.doi, 'url', 'https://pmc.ncbi.nlm.nih.gov/articles/' || publication.pmcid || '/',
      'authors', publication.authors, 'title', publication.title, 'year', 2026,
      'section', publication.section, 'license', 'CC BY 4.0',
      'licenseUrl', 'https://creativecommons.org/licenses/by/4.0/'
    )) RETURNING id INTO document_id;

    FOR source IN SELECT DISTINCT lower_day, upper_day FROM reviewed_reference
    WHERE publication_key = publication.key ORDER BY 1, 2
    LOOP
      SELECT id INTO age_id FROM ages
      WHERE "intervalDayStart" = source.lower_day AND "intervalDayEnd" = source.upper_day
      ORDER BY id LIMIT 1;

      IF age_id IS NULL THEN
        INSERT INTO ages (name, "intervalDayStart", "intervalDayEnd")
        VALUES ('days-' || source.lower_day || '-' || source.upper_day, source.lower_day, source.upper_day)
        RETURNING id INTO age_id;
      END IF;

      INSERT INTO "medicalSourceAge" ("sourceId", "ageId") VALUES (document_id, age_id);

      FOR reference IN SELECT * FROM reviewed_reference r
      WHERE r.publication_key = publication.key AND r.lower_day = source.lower_day AND r.upper_day = source.upper_day
      LOOP
        SELECT p.id, u.id INTO STRICT point_id, unit_id
        FROM "analysisPoint" p
        JOIN analysis_point_units pu ON pu."pointId" = p.id
        JOIN "analysisPointUnits" u ON u.id = pu."unitsId"
        WHERE p.name = reference.point_name
          AND u.code = reference.unit_code;

        INSERT INTO "analysisPointIntervalValue" (
          "sourceId", "pointId", "unitId", "ageId", "genderId",
          "minValue", "maxValue", "minValueEqual", "maxValueEqual", status
        )
        SELECT document_id, point_id, unit_id, age_id, g.id,
          limits.lower_value, limits.upper_value, limits.lower_inclusive, limits.upper_inclusive, limits.status
        FROM gender g CROSS JOIN (VALUES
          (NULL::numeric, reference.lower_limit, NULL::boolean, false, 'LOW'),
          (reference.lower_limit, reference.upper_limit, true, true, 'NORMAL'),
          (reference.upper_limit, NULL::numeric, false, NULL::boolean, 'HIGH')
        ) AS limits(lower_value, upper_value, lower_inclusive, upper_inclusive, status)
        WHERE g.name IN ('f', 'm') AND (reference.sex IS NULL OR g.name = reference.sex);
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
`;
