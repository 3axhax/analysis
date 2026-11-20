export const OXFORD_ACADEMIC_SOURCES_SQL = `
DO $$
DECLARE
  root_id integer;
  study_id integer;
  thyroid_id integer;
  prolactin_id integer;
  roche_id integer;
  siemens_id integer;
  thyroid_age_id integer;
  prolactin_age_id integer;
  age_range record;
  study record;
  point_spec record;
  point_id integer;
  unit_id integer;
  calcium_unit_id integer;
  inserted_count integer;
  license_url constant text := 'https://creativecommons.org/licenses/by/4.0/';
BEGIN
  INSERT INTO "medicalSource" (name,url,status,comment)
  VALUES ('Oxford Academic','https://academic.oup.com/','PARTIAL',
    'В задаче 0043 проверена выборка из десяти публикаций по лабораторной медицине. Полный каталог не сверялся.')
  RETURNING id INTO root_id;

  FOR study IN SELECT * FROM (VALUES
    ('ferritin', 'Reevaluating Ferritin Reference Intervals: Defining Limits Based on Iron-Sufficient Population Studies, Clinical Relevance, and Healthcare Efficiency',
      'https://academic.oup.com/jalm/article/11/1/193/8275449','10.1093/jalm/jfaf151',2025,'ANALYZED',
      '169 небеременных женщин 18–40 лет с достаточными запасами железа, Roche Elecsys e801. P5–P95: 19,7–133 нг/мл. Поле беременности отсутствует. Обсуждаемые пороги скрининга не применялись. Опубликовано онлайн в 2025 году, в номере 2026 года.'),
    ('calcium', 'Reference Intervals for 24-Hour Urinary Calcium Excretion and Its Association With Bone Metabolism: A Multicenter Study',
      'https://academic.oup.com/jcem/article/110/11/e3783/8046085','10.1210/clinem/dgae805',2025,'ANALYZED',
      'Сверены таблицы и приложение S1a–S2b (10.6084/m9.figshare.27297990, CC BY 4.0). Добавлен показатель кальция в моче за 24 часа. Перцентили приведены для описания распределения, а пороги гиперкальциурии зависят от цели анализа. Для отношения к креатинину не подтверждена единица шкалы приложения.'),
    ('comparability', 'Clinical Decision-Making Suffers from Inequivalent Measurement Results and Inadequate Reference Intervals',
      'https://academic.oup.com/clinchem/article/70/11/1383/7759346','10.1093/clinchem/hvae129',2024,'ANALYZED',
      'Сравнение лабораторных методов и локальных интервалов креатинина, гемоглобина и ферритина на заданном клиническом примере. Для ферритина значения зависят от цепочки калибровки. Универсальный диапазон из работы не добавлен.'),
    ('prolactin', 'Clinical Impact of New Reference Intervals for the Roche Prolactin II Immunoassay',
      'https://academic.oup.com/jes/article/8/6/bvae069/7642642','10.1210/jendso/bvae069',2024,'ANALYZED',
      'Таблица 1: первичные диапазоны для мужчин 18–50 лет добавлены отдельно для Roche e801 и Siemens Atellica IM. Женские группы стратифицированы по гормональной контрацепции. Такой признак и беременность в результате не учитываются, поэтому женские интервалы не загружены.'),
    ('thyroid', 'Changing Immunochemistry Platforms: Thyroid Function Test Comparison and Reference Intervals Based on Clinical Needs',
      'https://academic.oup.com/jalm/article/7/6/1438/6678478','10.1093/jalm/jfac067',2022,'PARTIAL',
      'Таблица 1: расчётные интервалы 15–59 лет для Siemens Atellica, одна запись на человека после исключения выбросов. FT3 и FT4 пересчитаны в пмоль/л. Рабочие границы лаборатории и диапазоны производителей не загружены. Приложение с сопоставлением методов не получено.'),
    ('adolescents', 'Changes in Thyroid Function Across Adolescence: A Longitudinal Study',
      'https://academic.oup.com/jcem/article/105/4/e1162/5700334','10.1210/clinem/dgz331',2020,'REJECTED_LICENSE',
      'Оригинальная статья содержит уведомление All rights reserved. Права на коммерческую адаптацию не подтверждены.'),
    ('pregnancy', 'TSH and FT4 Reference Interval Recommendations and Prevalence of Gestational Thyroid Dysfunction: Quantification of Current Diagnostic Approaches',
      'https://academic.oup.com/jcem/article/109/3/868/7280923','10.1210/clinem/dgad564',2023,'ANALYZED',
      'Сравниваются подходы к интерпретации ТТГ и FT4 по триместрам беременности. Для применения нужен срок беременности, которого нет в форме результата. Опубликовано онлайн в 2023 году, в номере 2024 года.'),
    ('personalized', 'A Parametric Empirical Bayes Approach to Personalized Reference Intervals and Reference Change Values',
      'https://academic.oup.com/clinchem/article/71/11/1147/8239765','10.1093/clinchem/hvaf092',2025,'ANALYZED',
      'Персонализированные границы рассчитываются по серии измерений и параметрам вариабельности. Подход требует истории измерений одного человека. Статические референсы из примеров не переносились.'),
    ('inflammation', 'The Relationship Between Ferritin and BMI is Mediated by Inflammation Among Women in Higher-Income Countries, But Not in Most Lower-Income Countries Nor Among Young Children: A Multi-Country Analysis',
      'https://doi.org/10.1093/cdn/nzac139','10.1093/cdn/nzac139',2022,'ANALYZED',
      'Влияние воспаления на связь ферритина с ИМТ менялось между выборками. Работа не устанавливает единого порога ферритина или правила коррекции для отдельного результата.'),
    ('benchmark', 'RIbench: A Proposed Benchmark for the Standardized Evaluation of Indirect Methods for Reference Interval Estimation',
      'https://academic.oup.com/clinchem/article/68/11/1410/6764777','10.1093/clinchem/hvac142',2022,'ANALYZED',
      'Сверены дизайн, таблица 1 и назначение тестовых наборов. Симулированные распределения предназначены для проверки статистических методов, их границы не являются новыми клиническими референсами.')
  ) AS candidate(key,title,url,doi,year,status,comment)
  LOOP
    INSERT INTO "medicalSource" (parent_id,name,url,year,status,comment,metadata)
    VALUES (root_id,study.title,study.url,study.year,study.status::"medicalSourceAnalysisStatus",study.comment,
      jsonb_build_object('title',study.title,'doi',study.doi,'authors',CASE study.key
        WHEN 'ferritin' THEN 'Jillian Kodger, Joe El-Khoury, Nalan Yurtsever'
        WHEN 'calcium' THEN 'Li Shen et al.'
        WHEN 'comparability' THEN 'Marith van Schrojenstein Lantman et al.'
        WHEN 'prolactin' THEN 'Erin Earll, Bradley R. Javorsky, Jenna Sarvaideo, Joely A. Straseski, Robert D. Nerenz'
        WHEN 'thyroid' THEN 'Jonna Pelanti et al.'
        WHEN 'adolescents' THEN 'Purdey J. Campbell et al.'
        WHEN 'pregnancy' THEN 'Joris A. J. Osinga et al.'
        WHEN 'personalized' THEN 'Eirik Åsen Røys et al.'
        WHEN 'inflammation' THEN 'Jennie N. Davis et al.'
        WHEN 'benchmark' THEN 'Tatjana Ammer et al.'
      END) || CASE
        WHEN study.status='REJECTED_LICENSE' THEN '{}'::jsonb
        ELSE jsonb_build_object('license','CC BY 4.0','licenseUrl',license_url)
      END)
    RETURNING id INTO study_id;

    IF study.key='thyroid' THEN
      thyroid_id := study_id;
      UPDATE "medicalSource" SET metadata=metadata || jsonb_build_object(
        'section','Table 1: single results, outliers removed by Tukey',
        'assay','Siemens Atellica IM')
      WHERE id=thyroid_id;
    ELSIF study.key='prolactin' THEN
      prolactin_id := study_id;
    END IF;
  END LOOP;

  INSERT INTO "medicalSource" (parent_id,name,url,year,status,metadata)
  SELECT parent.id, 'Пролактин — Roche Elecsys Prolactin II (cobas e801)', parent.url, parent.year,
    'ANALYZED', parent.metadata || jsonb_build_object('section','Table 1: Roche (this study), male','assay','Roche cobas e801')
  FROM "medicalSource" parent WHERE id=prolactin_id RETURNING id INTO roche_id;
  INSERT INTO "medicalSource" (parent_id,name,url,year,status,metadata)
  SELECT parent.id, 'Пролактин — Siemens Atellica IM', parent.url, parent.year,
    'ANALYZED', parent.metadata || jsonb_build_object('section','Table 1: Siemens (this study), male','assay','Siemens Atellica IM')
  FROM "medicalSource" parent WHERE id=prolactin_id RETURNING id INTO siemens_id;

  SELECT id INTO calcium_unit_id FROM "analysisPointUnits" WHERE code='mmol/24h';
  IF calcium_unit_id IS NULL THEN
    INSERT INTO "analysisPointUnits" (name,code,"translationParsing","quantityKind")
    VALUES ('ммоль/24 ч','mmol/24h','ммоль/24 ч_ммоль/сут_mmol/24h_mmol/day','molar-excretion')
    RETURNING id INTO calcium_unit_id;
  END IF;

  FOR point_spec IN SELECT * FROM (VALUES
    ('prolactin', 'Пролактин (PRL)', 'Prolactin (PRL)',
      'Пролактин_Пролактин (PRL)_Prolactin_PRL', 'ng/mL',
      'Референс пролактина зависит от метода измерения. Сверьте название метода с бланком.',
      'Prolactin reference intervals vary by assay. Check the method on your report.'),
    ('urine-calcium-24h', 'Кальций в суточной моче', '24-hour urinary calcium excretion',
      'Кальций в суточной моче_Кальций суточной мочи_Суточная экскреция кальция_Кальций мочи за 24 часа_24-hour urinary calcium_24-hour urinary calcium excretion_UCaE 24h',
      'mmol/24h', 'Кальций, выделенный с мочой за полные 24 часа.',
      'Calcium excreted in urine over a complete 24-hour collection.')
  ) AS v(key,ru,en,aliases,unit_code,hint_ru,hint_en)
  LOOP
    INSERT INTO "analysisPoint" (name,"translationRu","translationEn","translationParsing","pointHintRu","pointHintEn")
    VALUES (point_spec.key,point_spec.ru,point_spec.en,point_spec.aliases,point_spec.hint_ru,point_spec.hint_en)
    RETURNING id INTO point_id;
    INSERT INTO translation (lang,namespace,module,submodule,value) VALUES
      ('ru','entities','analysisPoint',point_spec.key,point_spec.ru),
      ('en','entities','analysisPoint',point_spec.key,point_spec.en);
    SELECT id INTO STRICT unit_id FROM "analysisPointUnits" WHERE code=point_spec.unit_code;
    INSERT INTO analysis_point_units ("pointId","unitsId") VALUES (point_id,unit_id);
  END LOOP;

  FOR age_range IN SELECT * FROM (VALUES (15*360,60*360-1), (18*360,51*360-1)) AS v(start_day,end_day)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM ages WHERE "intervalDayStart"=age_range.start_day AND "intervalDayEnd"=age_range.end_day) THEN
      INSERT INTO ages (name,"intervalDayStart","intervalDayEnd")
      VALUES ('days-' || age_range.start_day || '-' || age_range.end_day, age_range.start_day,age_range.end_day);
    END IF;
  END LOOP;
  SELECT id INTO STRICT thyroid_age_id FROM ages WHERE "intervalDayStart"=15*360 AND "intervalDayEnd"=60*360-1;
  SELECT id INTO STRICT prolactin_age_id FROM ages WHERE "intervalDayStart"=18*360 AND "intervalDayEnd"=51*360-1;
  INSERT INTO "medicalSourceAge" ("sourceId","ageId") VALUES
    (thyroid_id,thyroid_age_id),(roche_id,prolactin_age_id),(siemens_id,prolactin_age_id);

  INSERT INTO "analysisPointIntervalValue" ("sourceId","pointId","unitId","ageId","genderId",
    "minValue","maxValue","minValueEqual","maxValueEqual",status)
  SELECT r.source_id,p.id,u.id,r.age_id,g.id,band.min_value,band.max_value,band.min_equal,band.max_equal,band.status
  FROM (VALUES
    (thyroid_id,thyroid_age_id,'tsh','m[iU]/L',NULL::text,0.4::numeric,3.8::numeric),
    (thyroid_id,thyroid_age_id,'ft4','pmol/L',NULL,round(0.9*10000/776.87,2),round(1.6*10000/776.87,2)),
    (thyroid_id,thyroid_age_id,'ft3','pmol/L',NULL,round(220.8*10/650.97,2),round(415.6*10/650.97,2)),
    (roche_id,prolactin_age_id,'prolactin','ng/mL','m',4.2,22.8),
    (siemens_id,prolactin_age_id,'prolactin','ng/mL','m',2.9,14.5)
  ) AS r(source_id,age_id,point_name,unit_code,sex,lower_limit,upper_limit)
  JOIN "analysisPoint" p ON p.name=r.point_name
  JOIN analysis_point_units allowed ON allowed."pointId"=p.id
  JOIN "analysisPointUnits" u ON u.id=allowed."unitsId" AND u.code=r.unit_code
  JOIN gender g ON r.sex IS NULL OR g.name=r.sex
  CROSS JOIN LATERAL (VALUES
    (NULL::numeric,r.lower_limit,NULL::boolean,false,'LOW'),
    (r.lower_limit,r.upper_limit,true,true,'NORMAL'),
    (r.upper_limit,NULL::numeric,false,NULL::boolean,'HIGH')
  ) AS band(min_value,max_value,min_equal,max_equal,status);
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  IF inserted_count <> 24 THEN RAISE EXCEPTION 'Expected 24 Oxford Academic interval rows, got %', inserted_count; END IF;
END $$;
`;
