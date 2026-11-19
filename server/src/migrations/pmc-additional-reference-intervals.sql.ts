export const PMC_ADDITIONAL_REFERENCE_INTERVALS_SQL = `
DO $$
DECLARE
  root_id integer;
  document_id integer;
  age_id integer;
  last_day integer;
  upper_day integer;
  point_id integer;
  unit_id integer;
  source record;
  reference record;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource"
  WHERE parent_id IS NULL AND name = 'PubMed Central';

  SELECT max("intervalDayEnd") INTO last_day FROM ages;

  FOR source IN SELECT * FROM (VALUES
    ('jordan', 'Mohammed и соавт. — показатели щитовидной железы, 18–79 лет', 'PMC13413918', '10.3390/medsci14030362', 'Areej Mohammed, Hussam Alshraideh, Munir Abu-Helalah, Abdulrahim Shamayleh, Antoni Torres, Silvia Baroni', 'A Robust Control Group Identification Approach for Reference Intervals of Thyroid Biomarkers: The Case of Jordan', 6480, 28799),
    ('turkey-tsh-child', 'Kiren и соавт. — ТТГ, 1–13 лет', 'PMC13298108', '10.3390/diagnostics16121800', 'Gülce Kiren, Gizem Yılmaz Çalık, Merve Güngören, Hikmet Can Çubukçu, Tar-Choon Aw', 'Age- and Sex-Specific Reference Intervals for TSH, FT4, and FT3 Derived from the Turkish Multi-Center Cohort', 360, 5039),
    ('turkey-tsh-teen', 'Kiren и соавт. — ТТГ, 14–17 лет', 'PMC13298108', '10.3390/diagnostics16121800', 'Gülce Kiren, Gizem Yılmaz Çalık, Merve Güngören, Hikmet Can Çubukçu, Tar-Choon Aw', 'Age- and Sex-Specific Reference Intervals for TSH, FT4, and FT3 Derived from the Turkish Multi-Center Cohort', 5040, 6479),
    ('turkey-ft4-child', 'Kiren и соавт. — FT4, 1–14 лет', 'PMC13298108', '10.3390/diagnostics16121800', 'Gülce Kiren, Gizem Yılmaz Çalık, Merve Güngören, Hikmet Can Çubukçu, Tar-Choon Aw', 'Age- and Sex-Specific Reference Intervals for TSH, FT4, and FT3 Derived from the Turkish Multi-Center Cohort', 360, 5399),
    ('turkey-ft4-teen', 'Kiren и соавт. — FT4, 15–17 лет', 'PMC13298108', '10.3390/diagnostics16121800', 'Gülce Kiren, Gizem Yılmaz Çalık, Merve Güngören, Hikmet Can Çubukçu, Tar-Choon Aw', 'Age- and Sex-Specific Reference Intervals for TSH, FT4, and FT3 Derived from the Turkish Multi-Center Cohort', 5400, 6479),
    ('turkey-adult', 'Kiren и соавт. — показатели щитовидной железы, 18+', 'PMC13298108', '10.3390/diagnostics16121800', 'Gülce Kiren, Gizem Yılmaz Çalık, Merve Güngören, Hikmet Can Çubukçu, Tar-Choon Aw', 'Age- and Sex-Specific Reference Intervals for TSH, FT4, and FT3 Derived from the Turkish Multi-Center Cohort', 6480, NULL),
    ('protein-infant', 'Liu и соавт. — общий белок и альбумин, 28 суток – до 6 месяцев', 'PMC13196472', '10.1016/j.plabm.2026.e00537', 'Qinlan Liu, Xiufa Zhang, Ling Zhuang, Yidan Wang, Xian Chen, Feng Wang', 'Establishment of reference intervals for 41 serum biochemical analytes in healthy Chinese children', 28, 179),
    ('protein-6m', 'Liu и соавт. — общий белок, 6–11 месяцев', 'PMC13196472', '10.1016/j.plabm.2026.e00537', 'Qinlan Liu, Xiufa Zhang, Ling Zhuang, Yidan Wang, Xian Chen, Feng Wang', 'Establishment of reference intervals for 41 serum biochemical analytes in healthy Chinese children', 180, 359),
    ('protein-1y', 'Liu и соавт. — общий белок, 1–5 лет', 'PMC13196472', '10.1016/j.plabm.2026.e00537', 'Qinlan Liu, Xiufa Zhang, Ling Zhuang, Yidan Wang, Xian Chen, Feng Wang', 'Establishment of reference intervals for 41 serum biochemical analytes in healthy Chinese children', 360, 2159),
    ('protein-6y', 'Liu и соавт. — общий белок, 6–17 лет', 'PMC13196472', '10.1016/j.plabm.2026.e00537', 'Qinlan Liu, Xiufa Zhang, Ling Zhuang, Yidan Wang, Xian Chen, Feng Wang', 'Establishment of reference intervals for 41 serum biochemical analytes in healthy Chinese children', 2160, 6479),
    ('albumin-6m', 'Liu и соавт. — альбумин, 6 месяцев – до 18 лет', 'PMC13196472', '10.1016/j.plabm.2026.e00537', 'Qinlan Liu, Xiufa Zhang, Ling Zhuang, Yidan Wang, Xian Chen, Feng Wang', 'Establishment of reference intervals for 41 serum biochemical analytes in healthy Chinese children', 180, 6479)
  ) AS v(key, name, pmcid, doi, authors, title, min_days, max_days)
  LOOP
    upper_day := coalesce(source.max_days, last_day);
    IF upper_day IS NULL OR upper_day < source.min_days THEN
      RAISE EXCEPTION 'Invalid age scope for %', source.key;
    END IF;
    SELECT id INTO age_id FROM ages
    WHERE "intervalDayStart" = source.min_days AND "intervalDayEnd" = upper_day
    ORDER BY id LIMIT 1;

    IF age_id IS NULL THEN
      INSERT INTO ages (name, "intervalDayStart", "intervalDayEnd")
      VALUES ('days-' || source.min_days || '-' || upper_day, source.min_days, upper_day)
      RETURNING id INTO age_id;
    END IF;

    INSERT INTO "medicalSource" (parent_id, name, metadata)
    VALUES (root_id, source.name, jsonb_build_object(
      'doi', source.doi, 'url', 'https://pmc.ncbi.nlm.nih.gov/articles/' || source.pmcid || '/',
      'authors', source.authors, 'title', source.title, 'year', 2026,
      'section', CASE source.pmcid
        WHEN 'PMC13413918' THEN 'Table 2, Jordanian reference intervals'
        WHEN 'PMC13298108' THEN 'Table 1, Snibe MAGLUMI, refineR'
        ELSE 'Table 1, serum total protein and albumin'
      END,
      'license', 'CC BY 4.0', 'licenseUrl', 'https://creativecommons.org/licenses/by/4.0/',
      'translation', 'Референсы перенесены из таблицы статьи'
    )) RETURNING id INTO document_id;
    INSERT INTO "medicalSourceAge" ("sourceId", "ageId") VALUES (document_id, age_id);

    FOR reference IN SELECT * FROM (VALUES
    ('jordan', 'tsh', 'm', 0.5, 4.18),
    ('jordan', 'tsh', 'f', 0.57, 4.61),
    ('jordan', 'ft4', 'm', 12, 21.16),
    ('jordan', 'ft4', 'f', 12.02, 24.69),
    ('jordan', 'ft3', 'm', 2.28, 4.17),
    ('jordan', 'ft3', 'f', 2.53, 3.71),
    ('turkey-tsh-child', 'tsh', NULL, 0.387, 5.6),
    ('turkey-tsh-teen', 'tsh', NULL, 0.634, 6.19),
    ('turkey-ft4-child', 'ft4', 'f', 12.29, 20.72),
    ('turkey-ft4-child', 'ft4', 'm', 11.73, 20.85),
    ('turkey-ft4-teen', 'ft4', NULL, 12.75, 21.36),
    ('turkey-adult', 'tsh', 'm', 0.495, 5.83),
    ('turkey-adult', 'tsh', 'f', 0.485, 6.4),
    ('turkey-adult', 'ft3', 'm', 3.46, 6.04),
    ('turkey-adult', 'ft3', 'f', 3.46, 5.76),
    ('turkey-adult', 'ft4', 'm', 12.82, 21.49),
    ('turkey-adult', 'ft4', 'f', 12.87, 21.36),
    ('protein-infant', 'total_protein', NULL, 47.00, 70.00),
    ('protein-6m', 'total_protein', NULL, 54.90, 74.30),
    ('protein-1y', 'total_protein', NULL, 59.60, 75.30),
    ('protein-6y', 'total_protein', NULL, 61.90, 80.70),
    ('protein-infant', 'albumin_fraction', NULL, 30.85, 47.63),
    ('albumin-6m', 'albumin_fraction', NULL, 37.98, 49.22)
    ) AS v(source_key, point_name, sex, lower_limit, upper_limit)
    WHERE v.source_key = source.key
    LOOP
      SELECT p.id, u.id INTO STRICT point_id, unit_id
      FROM "analysisPoint" p
      JOIN analysis_point_units pu ON pu."pointId" = p.id
      JOIN "analysisPointUnits" u ON u.id = pu."unitsId"
      WHERE p.name = reference.point_name
        AND u.code = CASE
          WHEN reference.point_name = 'tsh' THEN 'm[iU]/L'
          WHEN reference.point_name IN ('total_protein', 'albumin_fraction') THEN 'g/L'
          ELSE 'pmol/L'
        END;

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
END $$;
`;
