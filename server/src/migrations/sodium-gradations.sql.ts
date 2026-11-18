export const SODIUM_GRADATIONS_SQL = `
DO $$
DECLARE
  root_id integer; source_id integer; point_id integer; unit_id integer;
  description_id integer; condition_id integer; row_count integer;
  category record;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource" WHERE parent_id IS NULL AND name='PubMed Central';
  SELECT id INTO STRICT point_id FROM "analysisPoint" WHERE name='na';
  SELECT u.id INTO STRICT unit_id FROM "analysisPointUnits" u JOIN analysis_point_units pu ON pu."unitsId"=u.id WHERE pu."pointId"=point_id AND u.code='mmol/L';
  IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata->>'doi'='10.1007/s00508-024-02325-5') THEN
    RAISE EXCEPTION 'Sodium source already exists';
  END IF;
  INSERT INTO "medicalSource" (parent_id,name,metadata) VALUES
    (root_id,'Schwarz и соавторы: гипонатриемия (2024)',jsonb_build_object(
      'doi','10.1007/s00508-024-02325-5', 'url','https://pmc.ncbi.nlm.nih.gov/articles/PMC10904443/',
      'authors','Schwarz C, Lindner G, Windpessl M, Knechtelsdorfer M, Saemann MD',
      'title','Consensus recommendations on the diagnosis and treatment of hyponatremia from the Austrian Society for Nephrology 2024',
      'year',2024,'section','Definition der Hyponatriämie','license','CC BY 4.0',
      'licenseUrl','https://creativecommons.org/licenses/by/4.0/', 'translation','Русский текст переведён сервисом',
      'boundarySource','https://pmc.ncbi.nlm.nih.gov/articles/PMC11828805/',
      'boundaryNote','Дробные границы уточнены по дополнительному источнику')) RETURNING id INTO source_id;
  FOR category IN SELECT * FROM (VALUES
    (NULL::numeric,125::numeric,'Выраженная биохимическая гипонатриемия.'),
    (125::numeric,130::numeric,'Умеренная биохимическая гипонатриемия.'),
    (130::numeric,135::numeric,'Лёгкая биохимическая гипонатриемия.')
  ) AS v(lower_bound,upper_bound,description)
  LOOP
    INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt")
      VALUES (category.description,source_id,now(),now()) RETURNING id INTO description_id;
    INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId")
      VALUES (description_id,point_id) RETURNING id INTO condition_id;
    WITH inserted AS (
      INSERT INTO "analysisPointIntervalValue" ("sourceId","pointId","ageId","genderId","unitId","minValue","maxValue","minValueEqual","maxValueEqual",status)
      SELECT source_id,point_id,a.id,g.id,unit_id,category.lower_bound,category.upper_bound,
        CASE WHEN category.lower_bound IS NULL THEN NULL ELSE true END,false,'LOW'
      FROM ages a CROSS JOIN gender g RETURNING id
    )
    INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId","intervalId","pointId")
      SELECT condition_id,id,point_id FROM inserted;
    GET DIAGNOSTICS row_count = ROW_COUNT;
    IF row_count <> (SELECT count(*) FROM ages) * (SELECT count(*) FROM gender) OR row_count=0 THEN
      RAISE EXCEPTION 'Incomplete sodium intervals';
    END IF;
  END LOOP;
END $$;
`;
