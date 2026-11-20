export const NUTRITIONAL_ASSESSMENT_MICRONUTRIENTS_SQL = `
DO $$
DECLARE
  root_id integer;
  copper_source integer;
  vitamin_source integer;
  copper_point integer;
  vitamin_point integer;
  unit_id integer;
  age_id integer;
  first_day integer;
  last_day integer;
  description_id integer;
  condition_id integer;
  rule record;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource"
  WHERE id=3 AND parent_id IS NULL AND name='Principles of Nutritional Assessment';

  INSERT INTO "medicalSource" (parent_id,name,metadata)
  SELECT root_id,v.name,jsonb_build_object(
    'url','https://nutritionalassessment.org/' || v.slug || '/',
    'authors',v.authors,'title',v.title,'year',2024,'section',v.section,
    'license','CC BY 4.0','licenseUrl','https://creativecommons.org/licenses/by/4.0/',
    'translation','Данные или формулировки адаптированы сервисом'
  )
  FROM (VALUES
    ('Медь и церулоплазмин','copper','McArdle HJ','Copper','Serum ceruloplasmin, factors affecting ceruloplasmin'),
    ('Витамин C','vitaminc','Carr AC','Vitamin C','Table 19.1, plasma ascorbic acid')
  ) AS v(name,slug,authors,title,section);
  SELECT id INTO STRICT copper_source FROM "medicalSource" WHERE parent_id=root_id AND metadata->>'url'='https://nutritionalassessment.org/copper/';
  SELECT id INTO STRICT vitamin_source FROM "medicalSource" WHERE parent_id=root_id AND metadata->>'url'='https://nutritionalassessment.org/vitaminc/';

  SELECT id INTO STRICT copper_point FROM "analysisPoint" WHERE name='ceruloplasmin';
  SELECT id INTO STRICT unit_id FROM "analysisPointUnits" WHERE code='umol/L';
  INSERT INTO "analysisPoint" (name,"translationRu","translationEn","translationParsing")
  VALUES ('vitamin-c-plasma','Витамин C (плазма)','Vitamin C (plasma)',
    'Витамин C (плазма)_Аскорбиновая кислота (плазма)_Vitamin C (plasma)_Plasma ascorbic acid')
  RETURNING id INTO vitamin_point;
  INSERT INTO analysis_point_units ("pointId","unitsId") VALUES (vitamin_point,unit_id);
  INSERT INTO translation (lang,namespace,module,submodule,value) VALUES
    ('ru','entities','analysisPoint','vitamin-c-plasma','Витамин C (плазма)'),
    ('en','entities','analysisPoint','vitamin-c-plasma','Vitamin C (plasma)');

  SELECT min("intervalDayStart"),max("intervalDayEnd") INTO first_day,last_day FROM ages;
  IF first_day IS NULL OR last_day IS NULL THEN RAISE EXCEPTION 'Missing age coverage'; END IF;
  SELECT id INTO age_id FROM ages WHERE "intervalDayStart"=first_day AND "intervalDayEnd"=last_day ORDER BY id LIMIT 1;
  IF age_id IS NULL THEN
    INSERT INTO ages (name,"intervalDayStart","intervalDayEnd")
    VALUES ('days-' || first_day || '-' || last_day,first_day,last_day) RETURNING id INTO age_id;
  END IF;
  INSERT INTO "medicalSourceAge" ("sourceId","ageId") VALUES (vitamin_source,age_id);
  INSERT INTO "analysisPointIntervalValue" (
    "sourceId","pointId","ageId","unitId","genderId","maxValue","maxValueEqual",status
  )
  SELECT vitamin_source,vitamin_point,age_id,unit_id,g.id,11,false,'LOW'
  FROM gender g WHERE g.name IN ('f','m');

  FOR rule IN SELECT * FROM (VALUES
    (copper_source,copper_point,'mg/dL','LOW',
      'Низкий церулоплазмин может встречаться при выраженном дефиците меди и наследственных нарушениях её обмена, в том числе при болезни Вильсона.'),
    (copper_source,copper_point,'mg/dL','HIGH',
      'Церулоплазмин может повышаться при воспалении, беременности и приёме эстрогенсодержащих препаратов.'),
    (vitamin_source,vitamin_point,'umol/L','LOW',
      'Концентрация аскорбиновой кислоты в плазме может снижаться при длительном недостаточном поступлении витамина C.')
  ) AS v(source_id,point_id,unit_code,status_name,description)
  LOOP
    INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt")
    VALUES (rule.description,rule.source_id,now(),now()) RETURNING id INTO description_id;
    INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId")
    VALUES (description_id,rule.point_id) RETURNING id INTO condition_id;
    INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId","intervalId","pointId")
    SELECT condition_id,i.id,rule.point_id
    FROM "analysisPointIntervalValue" i JOIN "analysisPointUnits" u ON u.id=i."unitId"
    WHERE i."pointId"=rule.point_id AND u.code=rule.unit_code AND i.status=rule.status_name
      AND i."sourceId" IS NOT DISTINCT FROM (CASE WHEN rule.source_id=vitamin_source THEN vitamin_source END);
    IF NOT FOUND THEN RAISE EXCEPTION 'Missing condition intervals for %',rule.point_id; END IF;
  END LOOP;
END $$;
`;
