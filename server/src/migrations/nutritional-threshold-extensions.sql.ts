export const NUTRITIONAL_THRESHOLD_EXTENSIONS_SQL = `
DO $$
DECLARE
  root_id integer;
  d_source integer;
  e_source integer;
  copper_source integer;
  ratio_source integer;
  ratio_point integer;
  ratio_unit integer;
  age_id integer;
  description_id integer;
  condition_id integer;
  d_point integer;
  rule record;
  rows_added integer;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource"
  WHERE id=3 AND parent_id IS NULL AND name='Principles of Nutritional Assessment';
  SELECT id INTO STRICT d_source FROM "medicalSource"
  WHERE parent_id=root_id AND metadata->>'url'='https://nutritionalassessment.org/vitaminD/';
  SELECT id INTO STRICT e_source FROM "medicalSource"
  WHERE parent_id=root_id AND metadata->>'section'='18c.7.1, interpretive criteria for serum alpha-tocopherol';
  SELECT id INTO STRICT copper_source FROM "medicalSource"
  WHERE parent_id=root_id AND metadata->>'section'='24b.1, lower limit for serum copper in adults';
  SELECT "ageId" INTO STRICT age_id FROM "medicalSourceAge" WHERE "sourceId"=d_source;
  SELECT id INTO STRICT d_point FROM "analysisPoint" WHERE name='vitamin-d-25oh-total';

  INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt")
  VALUES ('При такой концентрации 25(OH)D возможно недостаточное обеспечение витамином D для здоровья костей.',
    d_source,now(),now()) RETURNING id INTO description_id;
  INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId")
  VALUES (description_id,d_point) RETURNING id INTO condition_id;
  WITH added AS (
    INSERT INTO "analysisPointIntervalValue" (
      "sourceId","ageId","pointId","unitId","genderId","minValue","maxValue","minValueEqual","maxValueEqual",status
    )
    SELECT d_source,age_id,d_point,u.id,g.id,v.low,v.high,true,false,'LOW'
    FROM (VALUES ('nmol/L',30,50),('ng/mL',12,20)) AS v(code,low,high)
    JOIN "analysisPointUnits" u ON u.code=v.code CROSS JOIN gender g WHERE g.name IN ('f','m')
    RETURNING id
  )
  INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId","intervalId","pointId")
  SELECT condition_id,id,d_point FROM added;
  GET DIAGNOSTICS rows_added = ROW_COUNT;
  IF rows_added <> 4 THEN RAISE EXCEPTION 'Unexpected vitamin D intervals'; END IF;

  INSERT INTO "analysisPointUnits" (name,code,"translationParsing","quantityKind")
  VALUES ('µmol/mmol','umol/mmol','мкмоль/ммоль_µmol/mmol_umol/mmol','ratio')
  RETURNING id INTO ratio_unit;
  INSERT INTO "analysisPoint" (name,"translationRu","translationEn","translationParsing")
  VALUES ('alpha-tocopherol-cholesterol-ratio','Отношение α-токоферола к общему холестерину',
    'Alpha-tocopherol to total cholesterol ratio',
    'Альфа-токоферол / общий холестерин_α-токоферол / общий холестерин_Alpha-tocopherol / total cholesterol_Vitamin E to total cholesterol ratio')
  RETURNING id INTO ratio_point;
  INSERT INTO analysis_point_units ("pointId","unitsId") VALUES (ratio_point,ratio_unit);
  INSERT INTO translation (lang,namespace,module,submodule,value) VALUES
    ('ru','entities','analysisPoint','alpha-tocopherol-cholesterol-ratio','Отношение α-токоферола к общему холестерину'),
    ('en','entities','analysisPoint','alpha-tocopherol-cholesterol-ratio','Alpha-tocopherol to total cholesterol ratio');
  INSERT INTO "medicalSource" (parent_id,name,metadata)
  SELECT root_id,'Витамин E — отношение α-токоферола к общему холестерину у взрослых',
    metadata || jsonb_build_object('section','18c.7.2, serum alpha-tocopherol to total cholesterol ratio')
  FROM "medicalSource" WHERE id=e_source RETURNING id INTO ratio_source;
  INSERT INTO "medicalSourceAge" ("sourceId","ageId") VALUES (ratio_source,age_id);
  INSERT INTO "analysisPointIntervalValue" (
    "sourceId","ageId","pointId","unitId","genderId","minValue","minValueEqual",status
  )
  SELECT ratio_source,age_id,ratio_point,ratio_unit,g.id,2.2,false,'NORMAL'
  FROM gender g WHERE g.name IN ('f','m');

  -- Translate only these published limits to mass units. Generic conversion rules
  -- require both units to have the same quantity kind.
  FOR rule IN SELECT * FROM (VALUES
    (e_source,'mg/L',0.4307::numeric),
    (e_source,'ug/dL',43.07::numeric),
    (copper_source,'ug/L',63.546::numeric),
    (copper_source,'ug/dL',6.3546::numeric)
  ) AS v(source_id,unit_code,coefficient)
  LOOP
    WITH added AS (
      INSERT INTO "analysisPointIntervalValue" (
        "sourceId","ageId","pointId","unitId","genderId","maxValue","maxValueEqual",status
      )
      SELECT i."sourceId",i."ageId",i."pointId",u.id,i."genderId",
        i."maxValue"*rule.coefficient,i."maxValueEqual",i.status
      FROM "analysisPointIntervalValue" i
      JOIN "analysisPointUnits" original ON original.id=i."unitId" AND original.code='umol/L'
      JOIN "analysisPointUnits" u ON u.code=rule.unit_code
      JOIN analysis_point_units pu ON pu."pointId"=i."pointId" AND pu."unitsId"=u.id
      WHERE i."sourceId"=rule.source_id AND i.status='LOW'
      RETURNING id,"pointId","genderId"
    )
    INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId","intervalId","pointId")
    SELECT DISTINCT link."conditionId",added.id,added."pointId"
    FROM added
    JOIN "analysisResultIntervalDescriptionCondition" link ON link."pointId"=added."pointId"
    JOIN "analysisPointIntervalValue" original ON original.id=link."intervalId"
      AND original."sourceId"=rule.source_id AND original."genderId"=added."genderId"
    JOIN "analysisPointUnits" u ON u.id=original."unitId" AND u.code='umol/L';
    GET DIAGNOSTICS rows_added = ROW_COUNT;
    IF rows_added <> 2 THEN RAISE EXCEPTION 'Unexpected mass unit intervals for %',rule.unit_code; END IF;
  END LOOP;
END $$;
`;
