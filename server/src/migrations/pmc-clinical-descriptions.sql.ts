export const PMC_CLINICAL_DESCRIPTIONS_SQL = `
DO $$
DECLARE
  root_id integer; adult_id integer; mcv_id integer; mcv_unit integer;
  source_id integer; description_id integer; item record; condition record;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource" WHERE parent_id IS NULL AND name='PubMed Central';
  SELECT id INTO STRICT adult_id FROM ages WHERE name='u18y' AND "intervalDayStart"=6481 AND "intervalDayEnd"=72000;
  SELECT id INTO STRICT mcv_id FROM "analysisPoint" WHERE name='mcv';
  SELECT u.id INTO STRICT mcv_unit FROM "analysisPointUnits" u JOIN analysis_point_units pu ON pu."unitsId"=u.id WHERE pu."pointId"=mcv_id AND u.code='fL';
  IF (SELECT count(*) FROM gender WHERE name IN ('m','f')) <> 2 THEN RAISE EXCEPTION 'Expected male and female groups'; END IF;
  IF EXISTS (SELECT 1 FROM "medicalSource" WHERE metadata->>'doi' IN ('10.1210/clinem/dgad681','10.3390/nu11102424','10.1089/thy.2023.0169')) THEN RAISE EXCEPTION 'PMC article already exists'; END IF;
  IF (SELECT count(*) FROM "analysisPoint" WHERE name IN ('tsh','ft3','ft4','hemoglobin')) <> 4 THEN RAISE EXCEPTION 'Missing required point'; END IF;
  FOR item IN SELECT * FROM (VALUES
    ('Moran и соавторы: ТТГ и свободные гормоны (2024)', '10.1210/clinem/dgad681', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10940260/', 'Moran C, Schoenmakers N, Halsall D, Oddy S, Lyons G, van den Berg S, Gurnell M, Chatterjee K', 'Approach to the Patient With Raised Thyroid Hormones and Nonsuppressed TSH', 2024, 'Introduction; Abstract; Table 4'),
    ('Begum и Latunde-Dada: анемия и воспаление (2019)', '10.3390/nu11102424', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6835368/', 'Begum S, Latunde-Dada GO', 'Anemia of Inflammation with An Emphasis on Chronic Kidney Disease', 2019, 'Introduction'),
    ('Van Uytfanghe и соавторы: тесты гормонов щитовидной железы (2023)', '10.1089/thy.2023.0169', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10517335/', 'Van Uytfanghe K et al.', 'Thyroid Stimulating Hormone and Thyroid Hormones: An American Thyroid Association-Commissioned Review', 2023, 'T3; direct fT4 assays; analytical interference')
  ) AS entries(name,doi,url,authors,title,year,section) LOOP
    INSERT INTO "medicalSource" (parent_id,name,metadata) VALUES (root_id,item.name,jsonb_build_object('doi',item.doi,'url',item.url,'authors',item.authors,'title',item.title,'year',item.year,'section',item.section,'license','CC BY 4.0','licenseUrl','https://creativecommons.org/licenses/by/4.0/','translation','Русский текст адаптирован сервисом','allowedAgeIds',jsonb_build_array(adult_id))) RETURNING id INTO source_id;
    IF item.doi='10.3390/nu11102424' THEN
      INSERT INTO "analysisPointMinValue" ("pointId","ageId","genderId","unitId",value,"sourceId") SELECT mcv_id,adult_id,id,mcv_unit,82,source_id FROM gender WHERE name IN ('m','f');
      INSERT INTO "analysisPointMaxValue" ("pointId","ageId","genderId","unitId",value,"sourceId") SELECT mcv_id,adult_id,id,mcv_unit,98,source_id FROM gender WHERE name IN ('m','f');
      INSERT INTO "sourceReferenceInheritance" ("sourceId","pointId") SELECT source_id,id FROM "analysisPoint" WHERE name='hemoglobin';
    ELSE
      INSERT INTO "sourceReferenceInheritance" ("sourceId","pointId") SELECT source_id,id FROM "analysisPoint" WHERE name IN ('tsh','ft4');
      IF item.doi='10.1089/thy.2023.0169' THEN INSERT INTO "sourceReferenceInheritance" ("sourceId","pointId") SELECT source_id,id FROM "analysisPoint" WHERE name='ft3'; END IF;
    END IF;
    FOR condition IN SELECT * FROM (VALUES
      ('10.1210/clinem/dgad681','Повышенный ТТГ вместе со сниженным свободным Т4 может соответствовать снижению функции щитовидной железы.','tsh','1','ft4','0'),
      ('10.1210/clinem/dgad681','Сниженный ТТГ вместе с повышенным свободным Т4 может встречаться при повышенной функции щитовидной железы.','tsh','0','ft4','1'),
      ('10.1210/clinem/dgad681','Повышенный свободный Т4 при неподвленном ТТГ — несогласованное сочетание. Оно может быть связано с лекарствами, сопутствующими состояниями или особенностями лабораторного измерения.','tsh','-1','ft4','1'),
      ('10.3390/nu11102424','Низкий гемоглобин при уменьшенном среднем объёме эритроцитов соответствует микроцитарному типу анемии. Такое сочетание может встречаться при недостатке железа, талассемии и некоторых других состояниях.','hemoglobin','0','mcv','0'),
      ('10.3390/nu11102424','Низкий гемоглобин при среднем объёме эритроцитов в этом диапазоне соответствует нормоцитарному типу анемии. Он может встречаться в том числе при воспалительных состояниях или гемолизе; показатель MCV сам по себе не определяет причину.','hemoglobin','0','mcv','-1'),
      ('10.3390/nu11102424','Низкий гемоглобин при увеличенном среднем объёме эритроцитов соответствует макроцитарному типу анемии. Среди возможных причин — недостаток витамина B12 или фолата.','hemoglobin','0','mcv','1'),
      ('10.1089/thy.2023.0169','Повышенный свободный Т4 при ТТГ в референсном диапазоне — несогласованное сочетание. На результаты способны влиять методы анализа, препараты и другие факторы.','tsh','-1','ft4','1'),
      ('10.1089/thy.2023.0169','Снижение ТТГ вместе с повышенным свободным Т3 может встречаться при повышенной функции щитовидной железы.','tsh','0','ft3','1')
    ) AS entries(doi,description,point1,status1,point2,status2) WHERE doi=item.doi LOOP
      INSERT INTO "analysisResultDescription" (description_ru,"sourceId","createdAt","updatedAt") VALUES (condition.description,source_id,now(),now()) RETURNING id INTO description_id;
      INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) SELECT description_id,id,condition.status1::"enum_analysisResultDescriptionCondition_status" FROM "analysisPoint" WHERE name=condition.point1;
      INSERT INTO "analysisResultDescriptionCondition" ("descriptionId","pointId",status) SELECT description_id,id,condition.status2::"enum_analysisResultDescriptionCondition_status" FROM "analysisPoint" WHERE name=condition.point2;
    END LOOP;
  END LOOP;
END $$;
`;
