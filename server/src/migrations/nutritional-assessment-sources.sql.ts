export const NUTRITIONAL_ASSESSMENT_SOURCES_SQL = `
DO $$
DECLARE
  root_id integer;
  document_id integer;
  age_id integer;
  point_id integer;
  unit_id integer;
  b12_id integer;
  description_id integer;
  condition_id integer;
  last_day integer;
  inserted_count integer;
  publication record;
  ref record;
  rule record;
  param record;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource"
  WHERE id=3 AND parent_id IS NULL AND name='Principles of Nutritional Assessment';
  SELECT max("intervalDayEnd") INTO last_day FROM ages;
  IF last_day IS NULL OR last_day < 65*360 THEN RAISE EXCEPTION 'Missing age coverage'; END IF;

  SELECT id INTO STRICT unit_id FROM "analysisPointUnits" WHERE code='pmol/L';
  INSERT INTO "analysisPoint" (name, "translationRu", "translationEn", "translationParsing")
  VALUES ('vitamin-b12-plasma', 'Витамин B12 общий (плазма)', 'Total vitamin B12 (plasma)',
    'Витамин B12 общий (плазма)_Витамин B12 (плазма)_Total vitamin B12 (plasma)_Vitamin B12 (plasma)')
  RETURNING id INTO b12_id;
  INSERT INTO analysis_point_units ("pointId", "unitsId") VALUES (b12_id, unit_id);
  INSERT INTO translation (lang, namespace, module, submodule, value) VALUES
    ('ru','entities','analysisPoint','vitamin-b12-plasma','Витамин B12 общий (плазма)'),
    ('en','entities','analysisPoint','vitamin-b12-plasma','Total vitamin B12 (plasma)');

  FOR publication IN SELECT * FROM (VALUES
    ('protein', 'Оценка белкового статуса', 'proteinb', 'Courtney-Martin G, Elango R, Haliburton B, Paoletti A, Gibson RS', 'Protein Assessment', 2025, '16b.1.2'),
    ('calcium', 'Кальций', 'calcium', 'Whiting SJ, Gibson RS', 'Calcium', 2024, '23a.8.1–23a.8.3'),
    ('phosphorus', 'Фосфор', 'phosphorus', 'Calvo MS, Whiting SJ, Uribarri J', 'Phosphorus', 2024, 'Table 23b.1'),
    ('magnesium', 'Магний', 'magnesium', 'Nielsen FH', 'Magnesium', 2024, '23c.8.1'),
    ('b12', 'Витамин B12 в плазме', 'b12', 'de Groot LGPGM, Gibson RS', 'Vitamin B12', 2024, 'Table 22b.2')
  ) AS v(key, name, slug, authors, title, year, section)
  LOOP
    INSERT INTO "medicalSource" (parent_id, name, metadata)
    VALUES (root_id, publication.name, jsonb_strip_nulls(jsonb_build_object(
      'url', 'https://nutritionalassessment.org/' || publication.slug || '/',
      'authors', publication.authors, 'title', publication.title, 'year', publication.year,
      'section', publication.section, 'license', 'CC BY 4.0',
      'licenseUrl', 'https://creativecommons.org/licenses/by/4.0/',
      'translation', 'Данные или формулировки адаптированы сервисом',
      'doi', CASE WHEN publication.key='b12' THEN '10.1016/j.cca.2021.12.015' END
    ))) RETURNING id INTO document_id;

    FOR ref IN SELECT * FROM (VALUES
      ('phosphorus','p','mmol/L',0,12*360-1,NULL,1.45,1.78),
      ('phosphorus','p','mmol/L',18*360,60*360,NULL,0.87,1.45),
      ('phosphorus','p','mmol/L',60*360+1,last_day,'m',0.74,1.20),
      ('phosphorus','p','mmol/L',60*360+1,last_day,'f',0.90,1.30),
      ('magnesium','mg','mmol/L',18*360,last_day,NULL,0.75,0.95),
      ('b12','vitamin-b12-plasma','pmol/L',0,360-1,NULL,180,1400),
      ('b12','vitamin-b12-plasma','pmol/L',360,12*360-1,NULL,260,1200),
      ('b12','vitamin-b12-plasma','pmol/L',12*360,18*360-1,NULL,200,800),
      ('b12','vitamin-b12-plasma','pmol/L',18*360,65*360-1,NULL,200,600),
      ('b12','vitamin-b12-plasma','pmol/L',65*360,last_day,NULL,200,600)
    ) AS v(key, point_name, unit_code, start_day, end_day, sex, lower_limit, upper_limit)
    WHERE v.key=publication.key
    LOOP
      SELECT id INTO age_id FROM ages WHERE "intervalDayStart"=ref.start_day AND "intervalDayEnd"=ref.end_day ORDER BY id LIMIT 1;
      IF age_id IS NULL THEN
        INSERT INTO ages (name,"intervalDayStart","intervalDayEnd")
        VALUES ('days-' || ref.start_day || '-' || ref.end_day, ref.start_day, ref.end_day) RETURNING id INTO age_id;
      END IF;
      INSERT INTO "medicalSourceAge" ("sourceId","ageId") VALUES (document_id,age_id) ON CONFLICT DO NOTHING;
      SELECT p.id,u.id INTO STRICT point_id,unit_id FROM "analysisPoint" p
      JOIN analysis_point_units pu ON pu."pointId"=p.id JOIN "analysisPointUnits" u ON u.id=pu."unitsId"
      WHERE p.name=ref.point_name AND u.code=ref.unit_code;
      INSERT INTO "analysisPointIntervalValue" (
        "sourceId","ageId","pointId","unitId","genderId","minValue","maxValue","minValueEqual","maxValueEqual",status
      )
      SELECT document_id,age_id,point_id,unit_id,g.id,v.lower_value,v.upper_value,v.lower_inclusive,v.upper_inclusive,v.status
      FROM gender g CROSS JOIN (VALUES
        (NULL::numeric,ref.lower_limit,NULL::boolean,false,'LOW'),
        (ref.lower_limit,ref.upper_limit,true,true,'NORMAL'),
        (ref.upper_limit,NULL::numeric,false,NULL::boolean,'HIGH')
      ) AS v(lower_value,upper_value,lower_inclusive,upper_inclusive,status)
      WHERE g.name IN ('f','m') AND (ref.sex IS NULL OR g.name=ref.sex);
      GET DIAGNOSTICS inserted_count = ROW_COUNT;
      IF inserted_count <> (CASE WHEN ref.sex IS NULL THEN 6 ELSE 3 END) THEN
        RAISE EXCEPTION 'Unexpected reference count for %', ref.point_name;
      END IF;
    END LOOP;

    FOR rule IN SELECT * FROM (VALUES
      ('protein','Снижение сывороточного альбумина возможно при воспалении, потере белка через почки или кишечник и снижении его синтеза при заболеваниях печени.',ARRAY['albumin_fraction'],ARRAY['g/L']),
      ('calcium','При снижении альбумина общий кальций может быть ниже из-за уменьшения его связанной с белком фракции.',ARRAY['ca','albumin_fraction'],ARRAY['mmol/L','g/L']),
      ('magnesium','Сывороточный магний может снижаться на фоне приёма диуретиков или ингибиторов протонной помпы.',ARRAY['mg'],ARRAY['mmol/L'])
    ) AS v(key, description, points, units) WHERE v.key=publication.key
    LOOP
      INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt")
      VALUES (rule.description,document_id,now(),now()) RETURNING id INTO description_id;
      FOR param IN SELECT * FROM unnest(rule.points,rule.units) AS v(point_name,unit_code)
      LOOP
        SELECT p.id,u.id INTO STRICT point_id,unit_id FROM "analysisPoint" p
        JOIN analysis_point_units pu ON pu."pointId"=p.id JOIN "analysisPointUnits" u ON u.id=pu."unitsId"
        WHERE p.name=param.point_name AND u.code=param.unit_code;
        INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId")
        VALUES (description_id,point_id) RETURNING id INTO condition_id;
        INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId","intervalId","pointId")
        SELECT condition_id,i.id,point_id FROM "analysisPointIntervalValue" i
        WHERE i."pointId"=point_id AND i."unitId"=unit_id AND i.status='LOW'
          AND i."sourceId" IS NOT DISTINCT FROM (CASE WHEN publication.key='magnesium' THEN document_id END);
        IF NOT FOUND THEN RAISE EXCEPTION 'Missing condition intervals for %', param.point_name; END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
`;
