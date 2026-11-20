export const NUTRITIONAL_ADULT_THRESHOLDS_SQL = `
DO $$
DECLARE
  root_id integer;
  adult_age_id integer;
  max_day integer;
  document_id integer;
  point_id integer;
  unit_id integer;
  description_id integer;
  condition_id integer;
  inserted_count integer;
  publication record;
  rule record;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource"
  WHERE id=3 AND parent_id IS NULL AND name='Principles of Nutritional Assessment';
  SELECT max("intervalDayEnd") INTO max_day FROM ages;
  IF max_day IS NULL OR max_day < 6480 THEN
    RAISE EXCEPTION 'Missing adult age coverage';
  END IF;

  SELECT id INTO adult_age_id FROM ages
  WHERE "intervalDayStart"=6480 AND "intervalDayEnd"=max_day ORDER BY id LIMIT 1;
  IF adult_age_id IS NULL THEN
    INSERT INTO ages (name,"intervalDayStart","intervalDayEnd")
    VALUES ('days-6480-' || max_day,6480,max_day) RETURNING id INTO adult_age_id;
  END IF;

  FOR publication IN SELECT * FROM (VALUES
    ('vitaminD','Витамин D — критерии IOM для взрослых','Whiting SJ, Gibson RS','Vitamin D',2024,
      'Table 18b.4, IOM column; serum total 25(OH)D',
      'https://www.ncbi.nlm.nih.gov/books/NBK56050/'),
    ('vitamine','Витамин E — сывороточный α-токоферол у взрослых','Zingg JM','Vitamin E',2026,
      '18c.7.1, interpretive criteria for serum alpha-tocopherol',NULL),
    ('copper','Медь — сывороточная концентрация у взрослых','McArdle HJ','Copper',2024,
      '24b.1, lower limit for serum copper in adults',NULL)
  ) AS v(slug,name,authors,title,year,section,reference_url)
  LOOP
    INSERT INTO "medicalSource" (parent_id,name,metadata)
    VALUES (root_id,publication.name,jsonb_strip_nulls(jsonb_build_object(
      'url','https://nutritionalassessment.org/' || publication.slug || '/',
      'authors',publication.authors,'title',publication.title,'year',publication.year,
      'section',publication.section,'referenceUrl',publication.reference_url,
      'license','CC BY 4.0','licenseUrl','https://creativecommons.org/licenses/by/4.0/'
    ))) RETURNING id INTO document_id;
  END LOOP;

  FOR rule IN SELECT * FROM (VALUES
    ('vitaminD','vitamin-d-25oh-total','nmol/L','LOW',NULL,30),
    ('vitaminD','vitamin-d-25oh-total','ng/mL','LOW',NULL,12),
    ('vitaminD','vitamin-d-25oh-total','nmol/L','HIGH',125,NULL),
    ('vitaminD','vitamin-d-25oh-total','ng/mL','HIGH',50,NULL),
    ('vitamine','alpha-tocopherol','umol/L','LOW',NULL,11.6),
    ('copper','serum-copper','umol/L','LOW',NULL,10)
  ) AS v(slug,point_name,unit_code,status_name,lower_limit,upper_limit)
  LOOP
    SELECT id INTO STRICT document_id FROM "medicalSource"
    WHERE parent_id=root_id AND metadata->>'url'='https://nutritionalassessment.org/' || rule.slug || '/'
      AND (rule.slug <> 'copper' OR metadata->>'section'='24b.1, lower limit for serum copper in adults');
    INSERT INTO "medicalSourceAge" ("sourceId","ageId")
    VALUES (document_id,adult_age_id) ON CONFLICT DO NOTHING;
    SELECT p.id,u.id INTO STRICT point_id,unit_id FROM "analysisPoint" p
    JOIN analysis_point_units pu ON pu."pointId"=p.id
    JOIN "analysisPointUnits" u ON u.id=pu."unitsId"
    WHERE p.name=rule.point_name AND u.code=rule.unit_code;

    INSERT INTO "analysisPointIntervalValue" (
      "sourceId","pointId","ageId","unitId","genderId","minValue","maxValue","minValueEqual","maxValueEqual",status
    )
    SELECT document_id,point_id,adult_age_id,unit_id,g.id,rule.lower_limit,rule.upper_limit,
      CASE WHEN rule.lower_limit IS NOT NULL THEN false END,
      CASE WHEN rule.upper_limit IS NOT NULL THEN false END,
      rule.status_name
    FROM gender g WHERE g.name IN ('f','m');
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    IF inserted_count <> 2 THEN RAISE EXCEPTION 'Unexpected gender rows for %',rule.point_name; END IF;
  END LOOP;

  FOR rule IN SELECT * FROM (VALUES
    ('vitaminD','vitamin-d-25oh-total','Низкая концентрация 25(OH)D связана с риском нарушения минерализации костей.'),
    ('vitamine','alpha-tocopherol','Низкий уровень α-токоферола может встречаться при нарушении всасывания жиров, в том числе при холестазе.'),
    ('copper','serum-copper','Низкая концентрация меди возможна при выраженном дефиците меди и при наследственных нарушениях её обмена, включая болезнь Вильсона.')
  ) AS v(slug,point_name,description)
  LOOP
    SELECT id INTO STRICT document_id FROM "medicalSource"
    WHERE parent_id=root_id AND metadata->>'url'='https://nutritionalassessment.org/' || rule.slug || '/'
      AND (rule.slug <> 'copper' OR metadata->>'section'='24b.1, lower limit for serum copper in adults');
    SELECT id INTO STRICT point_id FROM "analysisPoint" WHERE name=rule.point_name;
    INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt")
    VALUES (rule.description,document_id,now(),now()) RETURNING id INTO description_id;
    INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId")
    VALUES (description_id,point_id) RETURNING id INTO condition_id;
    INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId","intervalId","pointId")
    SELECT condition_id,i.id,point_id FROM "analysisPointIntervalValue" i
    WHERE i."pointId"=point_id AND i."sourceId"=document_id AND i.status='LOW';
    IF NOT FOUND THEN RAISE EXCEPTION 'Missing low intervals for %',rule.point_name; END IF;
  END LOOP;
END $$;
`;
