export const PARTIAL_CATALOG_REVIEW_SQL = `
DO $$
DECLARE
  pmc_id integer;
  caliper_id integer;
  creatinine_source_id integer;
  inserted_count integer;
BEGIN
  SELECT id INTO STRICT pmc_id FROM "medicalSource"
  WHERE parent_id IS NULL AND url='https://pmc.ncbi.nlm.nih.gov/';
  SELECT id INTO STRICT caliper_id FROM "medicalSource"
  WHERE parent_id IS NULL AND url='https://caliperproject.ca/';

  INSERT INTO "medicalSource" (parent_id,name,url,year,status,comment,metadata)
  VALUES (pmc_id,'Креатинин у детей — Abbott Architect, Индонезия',
    'https://pmc.ncbi.nlm.nih.gov/articles/PMC12347179/',2025,'ANALYZED',
    'Таблицы 1–2, P2.5–P97.5: 36 референсов сывороточного креатинина по возрасту и полу. Непрямая оценка по данным скрининга в Индонезии. Внешней валидации нет. При расхождении с текстом после рисунка 2 использованы таблицы. Медианы, региональные сравнения и формулы СКФ не переносились.',
    jsonb_build_object(
      'title','Determining Reference Intervals and Median Blood Creatinine Levels in Children from Three Different Regional Populations',
      'authors','Ferdy Royland Marpaung, Hari Basuki Notobroto, Risky Vitria Prasetyo, Djoko Santoso, Etienne Cavalier, Aryati Aryati',
      'doi','10.3390/jcm14155373','license','CC BY 4.0',
      'licenseUrl','https://creativecommons.org/licenses/by/4.0/',
      'section','Таблицы 1–2, P2.5–P97.5','assay','Abbott Architect, ферментативный метод, IDMS',
      'conversion','mg/dL × 88.4 → µmol/L'))
  RETURNING id INTO creatinine_source_id;

  INSERT INTO "medicalSource" (parent_id,name,url,year,status,comment,metadata)
  SELECT article.parent_id,article.title,article.url,article.year,'REJECTED_LICENSE',
    'Лицензия CC BY-NC-ND 4.0 не разрешает коммерческое использование и адаптацию.',
    jsonb_build_object('doi',article.doi,'license','CC BY-NC-ND 4.0',
      'licenseUrl','https://creativecommons.org/licenses/by-nc-nd/4.0/')
  FROM (VALUES
    (pmc_id,'Paediatric Reference Intervals and Curves for Haemoglobin Estimated Using Direct Methods',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC12239707/',2025,'10.1111/ijlh.14489'),
    (pmc_id,'Pediatric Reference and Optimal Curves for Hemoglobin',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC13316602/',2026,'10.1001/jamanetworkopen.2026.20863'),
    (caliper_id,'Age-specific reference intervals for liver function tests in healthy neonates, infants, and young children in Iran',
      'https://doi.org/10.1002/jcla.24995',2023,'10.1002/jcla.24995')
  ) AS article(parent_id,title,url,year,doi)
  WHERE NOT EXISTS (
    SELECT 1 FROM "medicalSource" existing
    WHERE existing.parent_id=article.parent_id
      AND (existing.url=article.url OR existing.metadata->>'doi'=article.doi)
  );

  INSERT INTO ages (name,"intervalDayStart","intervalDayEnd")
  SELECT 'days-' || y*360 || '-' || ((y+1)*360-1),y*360,(y+1)*360-1
  FROM generate_series(0,17) AS y
  WHERE NOT EXISTS (
    SELECT 1 FROM ages WHERE "intervalDayStart"=y*360 AND "intervalDayEnd"=(y+1)*360-1
  );

  INSERT INTO "medicalSourceAge" ("sourceId","ageId")
  SELECT creatinine_source_id,a.id
  FROM generate_series(0,17) AS y
  JOIN ages a ON a."intervalDayStart"=y*360 AND a."intervalDayEnd"=(y+1)*360-1;

  INSERT INTO "analysisPointIntervalValue" ("sourceId","pointId","unitId","ageId","genderId",
    "minValue","maxValue","minValueEqual","maxValueEqual",status)
  SELECT creatinine_source_id,p.id,u.id,a.id,g.id,
    band.lower_limit,band.upper_limit,band.lower_included,band.upper_included,band.status
  FROM (VALUES
    (0,0.19,0.50,0.19,0.50),
    (1,0.21,0.83,0.16,0.41),
    (2,0.35,0.45,0.35,0.47),
    (3,0.17,0.51,0.19,0.44),
    (4,0.30,0.48,0.30,0.60),
    (5,0.30,0.70,0.26,0.60),
    (6,0.30,0.65,0.26,0.61),
    (7,0.23,0.71,0.30,0.60),
    (8,0.36,0.77,0.33,0.58),
    (9,0.30,0.73,0.39,0.64),
    (10,0.35,0.94,0.39,0.67),
    (11,0.46,0.75,0.38,0.84),
    (12,0.40,0.91,0.31,1.16),
    (13,0.39,0.93,0.35,0.79),
    (14,0.40,0.94,0.44,0.84),
    (15,0.55,1.02,0.33,0.79),
    (16,0.47,1.20,0.41,1.29),
    (17,0.60,1.04,0.56,1.11)
  ) AS r(age_year,male_lower,male_upper,female_lower,female_upper)
  CROSS JOIN LATERAL (VALUES
    ('m',r.male_lower*88.4,r.male_upper*88.4),
    ('f',r.female_lower*88.4,r.female_upper*88.4)
  ) AS limits(sex,lower_limit,upper_limit)
  JOIN gender g ON g.name=limits.sex
  JOIN ages a ON a."intervalDayStart"=r.age_year*360 AND a."intervalDayEnd"=(r.age_year+1)*360-1
  JOIN "analysisPoint" p ON p.name='creatinine'
  JOIN analysis_point_units allowed ON allowed."pointId"=p.id
  JOIN "analysisPointUnits" u ON u.id=allowed."unitsId" AND u.code='umol/L'
  CROSS JOIN LATERAL (VALUES
    (NULL::numeric,limits.lower_limit,NULL::boolean,false,'LOW'),
    (limits.lower_limit,limits.upper_limit,true,true,'NORMAL'),
    (limits.upper_limit,NULL::numeric,false,NULL::boolean,'HIGH')
  ) AS band(lower_limit,upper_limit,lower_included,upper_included,status);

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  IF inserted_count <> 108 THEN
    RAISE EXCEPTION 'Expected 108 pediatric creatinine interval rows, got %', inserted_count;
  END IF;
END $$;
`;
