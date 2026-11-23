export const CALIPER_REVIEW_COMPLETION_SQL = `
DO $$
DECLARE
  caliper_id integer;
  mindray_id integer;
  inserted_count integer;
BEGIN
  SELECT id INTO STRICT caliper_id FROM "medicalSource"
  WHERE parent_id IS NULL AND url='https://caliperproject.ca/';

  INSERT INTO "medicalSource" (parent_id,name,url,year,status,comment,metadata)
  SELECT caliper_id,CASE WHEN article.doi='10.1111/ijlh.14068'
    THEN 'Bohn и соавт. — общий анализ крови у детей, Mindray BC-6800Plus, Канада'
    ELSE article.title END,'https://doi.org/' || article.doi,article.year,
    article.status::"medicalSourceAnalysisStatus",article.comment,
    jsonb_strip_nulls(jsonb_build_object('doi',article.doi,'title',article.title,'authors',article.authors,
      'licenseUrl',article.license_url,
      'license',CASE WHEN article.license_url='https://creativecommons.org/licenses/by/4.0/' THEN 'CC BY 4.0' END,
      'section',CASE WHEN article.doi='10.1111/ijlh.14068' THEN 'Таблица 1' END,
      'assay',CASE WHEN article.doi='10.1111/ijlh.14068' THEN 'Mindray BC-6800Plus, цельная кровь с EDTA' END))
  FROM (VALUES
    ('10.1016/j.cjca.2024.01.023', 'Canadian Society of Clinical Chemists Harmonized Pediatric Lipid Reporting Recommendations for Clinical Laboratories', 2024, 'REJECTED_LICENSE', 'Victoria Higgins; Nicole M.A. White-Al Habeeb; Dana Bailey; Daniel R. Beriault; Ivan M. Blasutig; Christine P. Collier; Allison A. Venner; Khosrow Adeli', 'https://www.elsevier.com/tdm/userlicense/1.0/', 'В Crossref указаны условия анализа текста и данных Elsevier; разрешение на коммерческую адаптацию не подтверждено.'),
    ('10.1016/j.clinbiochem.2019.12.001', 'CALIPER paediatric reference intervals for the urea creatinine ratio in healthy children & adolescents.', 2020, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1016/j.clinbiochem.2021.04.014', 'Continuous reference intervals for 19 endocrine, fertility, and immunochemical markers in the CALIPER cohort of healthy children and adolescents', 2021, 'REJECTED_LICENSE', 'Alexandra Hall; Mary Kathryn Bohn; Siobhan Wilson; Victoria Higgins; Khosrow Adeli', 'https://www.elsevier.com/tdm/userlicense/1.0/', 'В Crossref указаны условия анализа текста и данных Elsevier; разрешение на коммерческую адаптацию не подтверждено.'),
    ('10.1016/j.clinbiochem.2021.09.004', 'Complex biological patterns of soluble cytokines and CD163 in childhood necessitating age-specific reference intervals for evidence-based clinical interpretation.', 2021, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1016/j.clinbiochem.2021.10.006', 'Pediatric reference intervals for 32 routine biochemical markers using the siemens healthineers atellica® CH assays in healthy children and adolescents.', 2022, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1016/j.clinbiochem.2022.06.005', 'Anti-mullerian hormone (AMH) reference values in the CALIPER cohort of healthy community children and adolescents', 2022, 'REJECTED_LICENSE', 'Ruth Ronn; Mary Kathryn Bohn; Ellen M. Greenblatt; Barry Hoffman; Khosrow Adeli', 'https://www.elsevier.com/tdm/userlicense/1.0/', 'В Crossref указаны условия анализа текста и данных Elsevier; разрешение на коммерческую адаптацию не подтверждено.'),
    ('10.1016/j.clinbiochem.2023.04.001', 'Comparison of reference intervals for biochemical and hematology markers derived by direct and indirect procedures based on the Isfahan cohort study', 2023, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1016/j.clinbiochem.2023.110644', 'Pediatric reference intervals for endocrine markers in healthy children and adolescents on the Liaison XL (DiaSorin) immunoassay system.', 2023, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1080/10408363.2017.1379945', 'The Canadian laboratory initiative on pediatric reference intervals: A CALIPER white paper', 2017, 'REJECTED_YEAR', NULL, NULL, 'Год выпуска раньше 2020, вне согласованного периода.'),
    ('10.1080/10408363.2021.1978923', 'Physiological and metabolic adaptations in pregnancy: importance of trimester-specific reference intervals to investigate maternal health and complications', 2022, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1093/ajcp/aqaa057', 'CALIPER Hematology Reference Standards (II)', 2020, 'REJECTED_LICENSE', 'Victoria Higgins; Houman Tahmasebi; Mary Kathryn Bohn; Alexandra Hall; Khosrow Adeli', 'https://academic.oup.com/journals/pages/open_access/funder_policies/chorus/standard_publication_model', 'Стандартная издательская модель Oxford University Press. Разрешение на коммерческую адаптацию не подтверждено.'),
    ('10.1093/ajcp/aqaa059', 'CALIPER Hematology Reference Standards (I).', 2020, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1093/clinchem/hvad167', 'Mining the Gap: Deriving Pregnancy Reference Intervals for Hematology Parameters Using Clinical Datasets', 2023, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1093/jalm/jfaa090', 'Normative Values of High-Sensitivity Cardiac Troponin T and N-Terminal pro-B-Type Natriuretic Peptide in Children and Adolescents: A Study from the CALIPER Cohort', 2021, 'REJECTED_LICENSE', 'Emily Lam; Victoria Higgins; Liyong Zhang; Man Khun Chan; Mary Kathryn Bohn; Karin Trajcevski; Peter Liu; Khosrow Adeli; Paul C Nathan', 'https://academic.oup.com/journals/pages/open_access/funder_policies/chorus/standard_publication_model', 'Стандартная издательская модель Oxford University Press. Разрешение на коммерческую адаптацию не подтверждено.'),
    ('10.1093/jalm/jfab155', 'Pediatric Reference Intervals for Point-of-Care Random Glucose in Healthy Children and Adolescents.', 2022, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1093/jalm/jfad012', 'Comprehensive Pediatric Reference Limits for High-Sensitivity Cardiac Troponin I and NT-proBNP in the CALIPER Cohort.', 2023, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1093/jalm/jfad019', 'Pediatric Reference Value Profiling of Essential Trace and Toxic Elements in Healthy Children and Adolescents Using High-Resolution and Triple Quadrupole Inductively Coupled Plasma Mass Spectrometry.', 2023, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1111/ijlh.13306', 'Complex biological patterns of hematology parameters in childhood necessitating age- and sex-specific reference intervals for evidence-based clinical interpretation.', 2020, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1111/ijlh.13670', 'Continuous reference curves for common hematology markers in the CALIPER cohort of healthy children and adolescents on the Sysmex XN-3000 system.', 2021, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1111/ijlh.14068', 'Comprehensive pediatric reference intervals for 79 hematology markers in the CALIPER cohort of healthy children and adolescents using the Mindray BC-6800Plus system.', 2023, 'ANALYZED', NULL, 'https://creativecommons.org/licenses/by/4.0/', 'Таблица 1: перенесены 10 диапазонов RBC, WBC и PLT. Прочие показатели таблицы и исследовательские параметры приложения в этот импорт не включены.'),
    ('10.1111/ijlh.14132', 'Pediatric reference intervals for hematology parameters in healthy infants and young children in Iran', 2023, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1136/bmj.k1950', 'Important considerations for interpreting biochemical tests in children', 2018, 'REJECTED_YEAR', NULL, NULL, 'Год выпуска раньше 2020, вне согласованного периода.'),
    ('10.1210/clinem/dgz161', 'Marked Influence of Adiposity on Laboratory Biomarkers in a Healthy Cohort of Children and Adolescents', 2020, 'REJECTED_LICENSE', 'Victoria Higgins; Arghavan Omidi; Houman Tahmasebi; Shervin Asgari; Kian Gordanifar; Michelle Nieuwesteeg; Khosrow Adeli', 'https://academic.oup.com/journals/pages/open_access/funder_policies/chorus/standard_publication_model', 'Стандартная издательская модель Oxford University Press. Разрешение на коммерческую адаптацию не подтверждено.'),
    ('10.1210/clinem/dgz261', 'Postprandial Dyslipidemia, Hyperinsulinemia, and Impaired Gut Peptides/Bile Acids in Adolescents with Obesity', 2020, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2019-0876', 'Influence of ethnicity on biochemical markers of health and disease in the CALIPER cohort of healthy children and adolescents', 2020, 'REJECTED_LICENSE', 'Houman Tahmasebi; Shervin Asgari; Alexandra Hall; Victoria Higgins; Ashfia Chowdhury; Rebecca Thompson; Mary Kathryn Bohn; Joseph Macri; Khosrow Adeli', NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2020-0041', 'Corrigendum to: Pediatric reference intervals for 29 Ortho VITROS 5600 immunoassays using the CALIPER cohort of healthy children and adolescents.', 2020, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2021-0050', 'Pediatric reference intervals for endocrine markers and fertility hormones in healthy children and adolescents on the Siemens Healthineers Atellica immunoassay system.', 2021, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2021-0336', 'Pediatric reference interval verification for common biochemical assays on the Abbott Alinity system', 2021, 'REJECTED_LICENSE', 'Mary Kathryn Bohn; Siobhan Wilson; Alexandra Hall; Youssef Massamiri; Ed Randell; Khosrow Adeli', NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2021-0337', 'Pediatric reference interval verification for endocrine and fertility hormone assays on the Abbott Alinity system', 2021, 'REJECTED_LICENSE', 'Mary Kathryn Bohn; Siobhan Wilson; Alexandra Hall; Khosrow Adeli', NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2022-0675', 'Determination of pediatric reference limits for 10 commonly measured autoantibodies.', 2022, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2022-0709', 'Pediatric reference interval verification for 17 specialized immunoassays and cancer markers on the Abbott Alinity i system in the CALIPER cohort of healthy children and adolescents', 2023, 'REJECTED_LICENSE', 'Mary Kathryn Bohn; Siobhan Wilson; Randal Schneider; Youssef Massamiri; Edward W. Randell; Khosrow Adeli', NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2022-1061', 'Definitions and major prerequisites of direct and indirect approaches for estimating reference limits', 2023, 'REJECTED_LICENSE', 'Rainer Haeckel; Khosrow Adeli; Graham Jones; Ken Sikaris; Werner Wosniok', NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2022-1077', 'LMS-based continuous reference percentiles for 14 laboratory parameters in the CALIPER cohort of healthy children and adolescents.', 2023, 'REJECTED_LICENSE', NULL, NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2022-1231', 'Highly sensitive tandem mass spectrometric measurement of serum estradiol without derivatization and pediatric reference intervals in children and adolescents', 2023, 'REJECTED_LICENSE', 'Ashley Di Meo; Mehrdad Yazdanpanah; Victoria Higgins; Matthew Nichols; Mary Kathryn Bohn; Agnes Tan; Shazina Zainab; Lusia Sepiashvili; Khosrow Adeli', NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2023-0256', 'Pediatric reference interval verification for 16 biochemical markers on the Alinity ci system in the CALIPER cohort of healthy children and adolescents', 2023, 'REJECTED_LICENSE', 'Mary Kathryn Bohn; Randal Schneider; Benjamin Jung; Khosrow Adeli', NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2023-0660', 'Pediatric reference intervals for serum neurofilament light and glial fibrillary acidic protein using the Canadian Laboratory Initiative on Pediatric Reference Intervals (CALIPER) cohort', 2024, 'REJECTED_LICENSE', 'Sophie Stukas; Jennifer Cooper; Victoria Higgins; Daniel Holmes; Khosrow Adeli; Cheryl L. Wellington', NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.1515/cclm-2025-1667', 'Continuous reference intervals for high-sensitivity cardiac troponin T in children: a closed-form approach with zlog transformation', 2026, 'ANALYZED', 'Inga M. Trulson; Georg Hoffmann; Khosrow Adeli; Mandy Vogel; Alexandra Kiess; Jonas Palm; Peter Ewert; Stefan Holdenrieder; Frank Klawonn', 'https://creativecommons.org/licenses/by/4.0/', 'Непрерывная модель высокочувствительного тропонина T на выборках CALIPER и LIFE Child. Справочник и интервальный механизм не представляют этот показатель и непрерывную модель.'),
    ('10.1515/cclm-2026-0627', 'Pediatric reference intervals for 27 routine chemistry analytes in healthy children and adolescents on the Roche cobas pro platform', 2026, 'REJECTED_LICENSE', 'Benjamin Jung; Mehdi Hooshmandi; Lusia Sepiashvili; Chien-Yi Lu; Kevin Paknia; Victoria Sealey; Olivia Landon; Khosrow Adeli', NULL, 'Отдельное разрешение на коммерческое использование и адаптацию не подтверждено по доступным сведениям издателя и библиографическим метаданным.'),
    ('10.3389/fmolb.2021.719866', 'Reference Standards for Newborn Screening of Metabolic Disorders by Tandem Mass Spectrometry: A Nationwide Study on Millions of Chinese Neonatal Populations', 2021, 'ANALYZED', 'Falin He; Rulai Yang; Xinwen Huang; Yaping Tian; Xiaofang Pei; Mary Kathryn Bohn; Lin Zou; Yan Wang; Haibo Li; Ting Wang; Maosheng Gu; Tao Jiang; Xigui Chen; Hui Zou; Hongwei Wei; Weibing Tian; Tian Tang; Khosrow Adeli; Zhiguo Wang', 'https://creativecommons.org/licenses/by/4.0/', 'Таблица 2: возрастные и половые диапазоны в сухих пятнах крови для специального неонатального MS/MS-скрининга. Сопоставимых показателей этого материала в сервисе нет.'),
    ('10.7555/jbr.34.20190094', 'Postprandial dyslipidemia in insulin resistant states in adolescent populations', 2020, 'ANALYZED', 'Victoria Higgins; Khosrow Adeli', 'https://creativecommons.org/licenses/by/4.0/', 'Обзор постпрандиальной дислипидемии и инсулинорезистентности у подростков. Публикация обсуждает нагрузочные протоколы и механизмы; собственных популяционных референсов для обычного лабораторного результата нет.')
  ) AS article(doi,title,year,status,authors,license_url,comment)
  WHERE NOT EXISTS (
    SELECT 1 FROM "medicalSource" existing
    WHERE existing.parent_id=caliper_id
      AND (existing.url='https://doi.org/' || article.doi OR existing.metadata->>'doi'=article.doi)
  );

  SELECT id INTO STRICT mindray_id FROM "medicalSource"
  WHERE parent_id=caliper_id AND url='https://doi.org/10.1111/ijlh.14068';

  INSERT INTO ages (name,"intervalDayStart","intervalDayEnd")
  SELECT 'days-' || v.day_start || '-' || v.day_end,v.day_start,v.day_end
  FROM (VALUES (30,359),(360,5039),(5040,6839),(30,1079),(1080,1799),
    (1800,6839),(360,4319),(4320,6839)) AS v(day_start,day_end)
  WHERE NOT EXISTS (SELECT 1 FROM ages WHERE "intervalDayStart"=v.day_start AND "intervalDayEnd"=v.day_end);

  INSERT INTO "medicalSourceAge" ("sourceId","ageId")
  SELECT mindray_id,a.id
  FROM (VALUES (30,359),(360,5039),(5040,6839),(30,1079),(1080,1799),
    (1800,6839),(360,4319),(4320,6839)) AS v(day_start,day_end)
  JOIN ages a ON a."intervalDayStart"=v.day_start AND a."intervalDayEnd"=v.day_end;

  INSERT INTO "analysisPointIntervalValue" ("sourceId","pointId","unitId","ageId","genderId",
    "minValue","maxValue","minValueEqual","maxValueEqual",status)
  SELECT mindray_id,p.id,u.id,a.id,g.id,b.lo,b.hi,b.lo_equal,b.hi_equal,b.status
  FROM (VALUES
    ('erythrocyte','10*12/L',30,359,NULL,3.11,5.11),
    ('erythrocyte','10*12/L',360,5039,NULL,4.08,4.95),
    ('erythrocyte','10*12/L',5040,6839,'f',4.07,5.13),
    ('erythrocyte','10*12/L',5040,6839,'m',4.42,5.64),
    ('leukocytes','10*9/L',30,1079,NULL,5.6,12.2),
    ('leukocytes','10*9/L',1080,1799,NULL,5.0,10.1),
    ('leukocytes','10*9/L',1800,6839,NULL,4.0,9.2),
    ('platelets','10*9/L',30,359,NULL,225,620),
    ('platelets','10*9/L',360,4319,NULL,222,444),
    ('platelets','10*9/L',4320,6839,NULL,190,388)
  ) r(point_name,unit_code,day_start,day_end,sex,lo,hi)
  JOIN "analysisPoint" p ON p.name=r.point_name
  JOIN analysis_point_units pu ON pu."pointId"=p.id
  JOIN "analysisPointUnits" u ON u.id=pu."unitsId" AND u.code=r.unit_code
  JOIN ages a ON a."intervalDayStart"=r.day_start AND a."intervalDayEnd"=r.day_end
  JOIN gender g ON g.name IN ('m','f') AND (r.sex IS NULL OR g.name=r.sex)
  CROSS JOIN LATERAL (VALUES
    (NULL::numeric,r.lo,NULL::boolean,false,'LOW'),
    (r.lo,r.hi,true,true,'NORMAL'),
    (r.hi,NULL::numeric,false,NULL::boolean,'HIGH')
  ) b(lo,hi,lo_equal,hi_equal,status);
  GET DIAGNOSTICS inserted_count=ROW_COUNT;
  IF inserted_count<>54 THEN RAISE EXCEPTION 'Expected 54 Mindray interval rows, got %',inserted_count; END IF;

  IF EXISTS (SELECT 1 FROM "medicalSource" WHERE parent_id=caliper_id
    AND (status IS NULL OR status='PARTIAL')) THEN
    RAISE EXCEPTION 'CALIPER review has unresolved records';
  END IF;

  UPDATE "medicalSource" SET status='ANALYZED',
    comment='Завершена сверка профильной подборки CALIPER за 2020–2026 годы по списку проекта и дополнительному поиску PubMed. Проверены годы, доступность и права. Для открытых работ зафиксирована применимость, добавлены интервалы из трёх публикаций. Веб-база CALIPER отдельно: права на её коммерческий перенос не подтверждены.'
  WHERE id=caliper_id;
END $$;
`;
