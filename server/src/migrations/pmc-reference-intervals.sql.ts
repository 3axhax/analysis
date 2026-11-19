export const PMC_REFERENCE_INTERVALS_SQL = `
DO $$
DECLARE
  root_id integer;
  document_id integer;
  point_id integer;
  unit_id integer;
  description_id integer;
  condition_id integer;
  inserted_count integer;
  source record;
  reference record;
  rule record;
  condition record;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource"
    WHERE parent_id IS NULL AND name = 'PubMed Central';

  INSERT INTO "analysisPoint" (name, "translationRu", "translationEn", "pointHintRu")
    VALUES ('nlr', 'Отношение нейтрофилов к лимфоцитам (NLR)',
      'Neutrophil-to-lymphocyte ratio (NLR)', 'Рассчитывается по абсолютному числу нейтрофилов и лимфоцитов.')
    RETURNING id INTO point_id;
  SELECT id INTO STRICT unit_id FROM "analysisPointUnits" WHERE code = '1';
  INSERT INTO analysis_point_units ("pointId", "unitsId") VALUES (point_id, unit_id);

  FOR source IN SELECT * FROM (VALUES
    ('newborn', 'Friščić и соавт. — неонатальная биохимия (2024)', 'PMC11042559', '10.11613/BM.2024.020705',
      'Iva Friščić, Sonja Perkov, Andrea Radeljak, Jasminka Stipanović-Kastelić, Mirjana Mariana Kardum Paro',
      'CLSI-based verification and de novo establishment of reference intervals for common biochemical assays in Croatian newborns',
      2024, 'Table 2', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 0, 14),
    ('thyroid-younger', 'Allen и соавт. — тиреоидные показатели, 18–60 лет (2026)', 'PMC13550734', '10.1177/00045632261426852',
      'George F. G. Allen, Sarah Blampied, Kashyap A. Patel, Timothy J. McDonald, Andrew T. Hattersley, Bijay Vaidya',
      'Age-related reference intervals for thyroid function tests are beneficial in adults over 60 years',
      2026, 'Table 1: 18–60 years', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 18*360, 61*360-1),
    ('thyroid-older', 'Allen и соавт. — тиреоидные показатели, 61 год и старше (2026)', 'PMC13550734', '10.1177/00045632261426852',
      'George F. G. Allen, Sarah Blampied, Kashyap A. Patel, Timothy J. McDonald, Andrew T. Hattersley, Bijay Vaidya',
      'Age-related reference intervals for thyroid function tests are beneficial in adults over 60 years',
      2026, 'Table 1: above 60 years', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 61*360, NULL),
    ('liver-younger', 'Mu и соавт. — печёночная панель, 20–49 лет (2013)', 'PMC3772807', '10.1371/journal.pone.0072916',
      'Runqing Mu, Wenxiang Chen, Baishen Pan, Ling Wang, Xiaoke Hao, Xiaojun Huang et al.',
      'First Definition of Reference Intervals of Liver Function Tests in China: A Large-Population-Based Multi-Center Study about Healthy Adults',
      2013, 'Table 4: adjusted and validated intervals; ALTnp and ASTnp', 'CC BY', 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0072916#copyright', 20*360, 50*360-1),
    ('liver-older', 'Mu и соавт. — печёночная панель, 50–79 лет (2013)', 'PMC3772807', '10.1371/journal.pone.0072916',
      'Runqing Mu, Wenxiang Chen, Baishen Pan, Ling Wang, Xiaoke Hao, Xiaojun Huang et al.',
      'First Definition of Reference Intervals of Liver Function Tests in China: A Large-Population-Based Multi-Center Study about Healthy Adults',
      2013, 'Table 4: adjusted and validated intervals; ALTnp and ASTnp', 'CC BY', 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0072916#copyright', 50*360, 80*360-1),
    ('nlr', 'Almeida и соавт. — индексы ОАК, 35–74 года (2026)', 'PMC13691253', '10.1016/j.htct.2026.108552',
      'Nívea Aparecida de Almeida, Roberta Carvalho Figueiredo, Sandhi Maria Barreto, Letícia Gonçalves Resende Ferreira, Chams Bicalho Maluf, Pedro Guatimosim Vidigal, Danyelle Romana Alves Rios',
      'Reference intervals for indices derived from the complete blood count in the Longitudinal Study of Adult Health (ELSA-Brasil)',
      2026, 'Methods and Table 3: NLR', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 35*360, 75*360-1),
    ('patterns', 'Rajesh и соавт. — печёночные анализы в первичной помощи (2024)', 'PMC11026984', '10.7759/cureus.56541',
      'Rajesh R, Aditya Sangameshwar, Yi Yuan Tan, Kevin Teh Kim Jun, Tat Yean Tham, Mark Cheah Chang Chuen',
      'Approach to Abnormal Liver Biochemistries in the Primary Care Setting',
      2024, 'Table 1, Cholestatic Pattern and Mixed and Isolated Hyperbilirubinemia', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 18*360, NULL)
  ) AS v(key, name, pmcid, doi, authors, title, year, section, license, license_url, min_days, max_days)
  LOOP
    INSERT INTO "medicalSource" (parent_id, name, metadata) VALUES (
      root_id, source.name, jsonb_strip_nulls(jsonb_build_object(
        'doi', source.doi, 'url', 'https://pmc.ncbi.nlm.nih.gov/articles/' || source.pmcid || '/',
        'authors', source.authors, 'title', source.title, 'year', source.year,
        'section', source.section, 'license', source.license, 'licenseUrl', source.license_url,
        'translation', 'Данные и формулировки адаптированы сервисом',
        'minAgeDays', source.min_days, 'maxAgeDays', source.max_days
      ))) RETURNING id INTO document_id;

    FOR reference IN SELECT * FROM (VALUES
      ('newborn','k','mmol/L',NULL,3.4,5.2), ('newborn','mg','mmol/L',NULL,0.65,0.92),
      ('newborn','direct-bilirubin','umol/L',NULL,6,17),
      ('thyroid-younger','tsh','m[iU]/L',NULL,0.66,4.17), ('thyroid-younger','ft4','pmol/L',NULL,12.3,19.5),
      ('thyroid-younger','ft3','pmol/L',NULL,3.9,6.4),
      ('thyroid-older','tsh','m[iU]/L',NULL,0.60,5.34), ('thyroid-older','ft4','pmol/L',NULL,11.2,18.7),
      ('thyroid-older','ft3','pmol/L',NULL,3.8,5.9),
      ('liver','alanine_aminotransferase','U/L','m',9,50), ('liver','alanine_aminotransferase','U/L','f',7,40),
      ('liver','aspartate_aminotransferase','U/L','m',15,40), ('liver','aspartate_aminotransferase','U/L','f',13,35),
      ('liver','ggtp','U/L','m',10,60), ('liver','ggtp','U/L','f',7,45),
      ('liver','alkaline_phosphatase','U/L','m',45,125),
      ('liver-younger','alkaline_phosphatase','U/L','f',35,100),
      ('liver-older','alkaline_phosphatase','U/L','f',50,135),
      ('liver','total_protein','g/L',NULL,65,85), ('liver','albumin_fraction','g/L',NULL,40,55),
      ('liver','bilirubin','umol/L','m',6,30), ('liver','bilirubin','umol/L','f',5,24),
      ('nlr','nlr','1',NULL,0.95,3.28)
    ) AS v(key, point_name, unit_code, sex, lower_limit, upper_limit)
    WHERE v.key = source.key OR (v.key = 'liver' AND source.key LIKE 'liver-%')
    LOOP
      SELECT p.id, u.id INTO STRICT point_id, unit_id
      FROM "analysisPoint" p
      JOIN analysis_point_units pu ON pu."pointId" = p.id
      JOIN "analysisPointUnits" u ON u.id = pu."unitsId"
      WHERE p.name = reference.point_name AND u.code = reference.unit_code;
      INSERT INTO "analysisPointIntervalValue" (
        "sourceId", "pointId", "unitId", "ageId", "genderId",
        "minValue", "maxValue", "minValueEqual", "maxValueEqual", status
      )
      SELECT document_id, point_id, unit_id, age.id, sex.id,
        limits.lower_value, limits.upper_value, limits.lower_inclusive, limits.upper_inclusive, limits.status
      FROM ages age CROSS JOIN gender sex CROSS JOIN (VALUES
        (NULL::numeric, reference.lower_limit, NULL::boolean, false, 'LOW'),
        (reference.lower_limit, reference.upper_limit, true, true, 'NORMAL'),
        (reference.upper_limit, NULL::numeric, false, NULL::boolean, 'HIGH')
      ) AS limits(lower_value, upper_value, lower_inclusive, upper_inclusive, status)
      WHERE age."intervalDayEnd" >= source.min_days
        AND (source.max_days IS NULL OR age."intervalDayStart" <= source.max_days)
        AND (reference.sex IS NULL OR sex.name = reference.sex);
      GET DIAGNOSTICS inserted_count = ROW_COUNT;
      IF inserted_count = 0 THEN RAISE EXCEPTION 'Missing age or gender for %', reference.point_name; END IF;
    END LOOP;

    FOR rule IN SELECT * FROM (VALUES
      ('patterns', 'Повышение ЩФ и ГГТ может встречаться при холестатическом профиле.',
        ARRAY['alkaline_phosphatase','ggtp'], ARRAY['HIGH','HIGH']),
      ('patterns', 'При изолированном повышении непрямого билирубина возможны синдром Жильбера или гемолиз.',
        ARRAY['bilirubin','indirect_bilirubin','direct-bilirubin','alanine_aminotransferase','aspartate_aminotransferase','alkaline_phosphatase','ggtp'],
        ARRAY['HIGH','HIGH','NORMAL','NORMAL','NORMAL','NORMAL','NORMAL']),
      ('patterns', 'Изолированное повышение прямого билирубина может встречаться при холестазе или синдромах Дубина–Джонсона и Ротора.',
        ARRAY['bilirubin','direct-bilirubin','indirect_bilirubin','alanine_aminotransferase','aspartate_aminotransferase','alkaline_phosphatase','ggtp'],
        ARRAY['HIGH','HIGH','NORMAL','NORMAL','NORMAL','NORMAL','NORMAL']),
      ('nlr', 'Отношение нейтрофилов к лимфоцитам ниже референса ELSA-Brasil.', ARRAY['nlr'], ARRAY['LOW']),
      ('nlr', 'Отношение нейтрофилов к лимфоцитам выше референса ELSA-Brasil.', ARRAY['nlr'], ARRAY['HIGH'])
    ) AS v(key, text, points, statuses) WHERE v.key = source.key
    LOOP
      INSERT INTO "analysisResultDescription" (description_ru, "sourceId", "createdAt", "updatedAt")
        VALUES (rule.text, document_id, now(), now()) RETURNING id INTO description_id;
      FOR condition IN SELECT * FROM unnest(rule.points, rule.statuses) AS v(point_name, status_name)
      LOOP
        SELECT id INTO STRICT point_id FROM "analysisPoint" WHERE name = condition.point_name;
        INSERT INTO "analysisResultDescriptionCondition" ("descriptionId", "pointId")
          VALUES (description_id, point_id) RETURNING id INTO condition_id;
        INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId", "intervalId", "pointId")
        SELECT condition_id, i.id, point_id
        FROM "analysisPointIntervalValue" i JOIN ages age ON age.id = i."ageId"
        WHERE i."pointId" = point_id AND i.status = condition.status_name
          AND i."sourceId" IS NOT DISTINCT FROM (CASE WHEN source.key = 'nlr' THEN document_id END)
          AND age."intervalDayEnd" >= source.min_days;
        GET DIAGNOSTICS inserted_count = ROW_COUNT;
        IF inserted_count = 0 THEN RAISE EXCEPTION 'Missing intervals for %', condition.point_name; END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
`;
