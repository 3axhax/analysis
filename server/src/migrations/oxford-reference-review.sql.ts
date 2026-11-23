export const OXFORD_REFERENCE_REVIEW_SQL = `
DO $$
DECLARE
  root_id integer;
  prolactin_source_id integer;
  inserted_count integer;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource"
  WHERE parent_id IS NULL AND url='https://academic.oup.com/';

  INSERT INTO "medicalSource" (parent_id,name,url,year,status,comment,metadata)
  SELECT root_id,CASE WHEN article.doi='10.1093/jalm/jfag169'
    THEN 'Общий пролактин — Abbott Alinity i, мужчины 18–93 лет' ELSE article.title END,
    'https://doi.org/' || article.doi,article.year,article.status::"medicalSourceAnalysisStatus",
    article.comment,jsonb_strip_nulls(jsonb_build_object(
      'doi',article.doi,'title',article.title,'authors',article.authors,'licenseUrl',article.license_url,
      'section',CASE WHEN article.doi='10.1093/jalm/jfag169' THEN 'Таблица 1, мужская группа' END,
      'assay',CASE WHEN article.doi='10.1093/jalm/jfag169' THEN 'Abbott Alinity i, CMIA, сыворотка' END))
  FROM (VALUES
    ('10.1093/jalm/jfag169', 'Establishment of Sex-Specific Reference Intervals for Total and Post-PEG Prolactin on an Automated Analyzer', 2026, 'PARTIAL', 'Jessica Miller; Jason Leung; Pow Lee Cheng; Xiao Yan Wang; Maria Bhandari; Sophie Furlow; Tobias Fischer; Anselmo Fabros; Vathany Kulasingam', 'https://creativecommons.org/licenses/by/4.0/', 'Таблица 1: общий пролактин Abbott Alinity i у мужчин 18–93 лет, 72,3–634,0 мМЕ/л. Женская выборка исключает беременность. После ПЭГ измеряется другая фракция; диапазоны не перенесены. Доступ к дополнительному рисунку сопоставления методов не подтверждён.'),
    ('10.1093/clinchem/hvag128', 'How to Establish a Reference Interval: A Practical Approach', 2026, 'PARTIAL', 'Anouk Olthof; Romy W P M de Kroon; Niek F Dirks; Anita Boelen; Nannette Brouwer; Martin den Heijer; Jacquelien J Hillebrand; Mirjam Kruijt; Wendy P J den Elzen; Annemieke C Heijboer', 'https://creativecommons.org/licenses/by/4.0/', 'Методический обзор построения интервалов прямыми и непрямыми методами. Основной текст не даёт набора для импорта. Дополнительный файл отдельно не проверен.'),
    ('10.1093/jalm/jfag090', 'Accuracy of T3 Uptake Was Significantly Impacted by Unit Conversion and Reference Interval Change', 2026, 'PARTIAL', 'Francis Felix; Nga Yeung Tang', 'https://creativecommons.org/licenses/by/4.0/', 'Работа об измерении T3 uptake, которое не является FT3 или общим T3. Требуется отдельная сверка полного текста перед окончательным решением.'),
    ('10.1093/clinchem/hvag075', 'TSH Pediatric Reference Intervals: Lack of CALIPER Applicability to US-Based Populations', 2026, 'REJECTED_LICENSE', 'Jillian Kodger; Joe M El-Khoury', NULL, 'Разрешение на коммерческое использование и адаптацию не подтверждено по издательским и библиографическим сведениям.'),
    ('10.1093/jalm/jfag083', 'Result Interpretation in Skewed Populations-Are Common Reference Intervals Inadequate?', 2026, 'REJECTED_LICENSE', 'Dennis J Orton; Jessica L Gifford; Gregory A Kline', 'https://creativecommons.org/licenses/by-nc-nd/4.0/', 'Указана CC BY-NC-ND 4.0; коммерческое использование и адаптация не разрешены.'),
    ('10.1093/jalm/jfag076', 'Pediatric Glucose-6-Phosphate Dehydrogenase Reference Intervals Derived from Archived Phenotype and Genotype Test Results', 2026, 'REJECTED_LICENSE', 'Kwaku Baryeh; Kelly Doyle', 'https://creativecommons.org/licenses/by-nc-nd/4.0/', 'Указана CC BY-NC-ND 4.0; коммерческое использование и адаптация не разрешены.'),
    ('10.1093/labmed/lmaf091', 'Harmonization of thyroid function test measurements across multiple immunoassay platforms for a common reference interval', 2026, 'REJECTED_LICENSE', 'Gyu Won Cho; Min-Jeong Kim; Min Young Lee; Myeong Hee Kim; Woo In Lee; So Young Kang', NULL, 'Разрешение на коммерческое использование и адаптацию не подтверждено по издательским и библиографическим сведениям.'),
    ('10.1093/jalm/jfag029', 'Potassium Reference Intervals: A Need for Separate Reference Intervals for Serum and Plasma', 2026, 'REJECTED_LICENSE', 'Glen L Hortin; Joseph Leonard; Claude Bassil', 'https://creativecommons.org/licenses/by-nc-nd/4.0/', 'Указана CC BY-NC-ND 4.0; коммерческое использование и адаптация не разрешены.'),
    ('10.1093/jalm/jfaf208', 'Evaluation of Serum Kappa Free Light Chain Reference Interval Using a New Stabilized Calibrator', 2026, 'REJECTED_LICENSE', 'Derek Waggoner; Katie Thoren; Robert Maynard; Kwaku Twum; Nichole Korpi-Steiner', 'https://creativecommons.org/licenses/by-nc-nd/4.0/', 'Указана CC BY-NC-ND 4.0; коммерческое использование и адаптация не разрешены.'),
    ('10.1093/labmed/lmaf053', 'Development of trimester-specific reference intervals for thyroid hormones based on real-world data using a maximum likelihood method', 2026, 'ANALYZED', 'Xiaoyan Chen; Yinrui Zou; Yunxia Chu; Zhaoqi Gu; Xiangrong Yang; Yuqiang Huang; Zhaoxi Wang', 'https://creativecommons.org/licenses/by/4.0/', 'Интервалы ТТГ и FT4 по триместрам для TPO-Ab-отрицательных беременностей. В сервисе нет триместра и соответствующего клинического контекста для применения.'),
    ('10.1093/jalm/jfaf121', 'Reference Intervals for Ceruloplasmin Should Account for Age, Sex, Method, and Local Population', 2025, 'REJECTED_LICENSE', 'Bobby Li; Catherine Rollo; Richard King; Simon Thompson; Chris Florkowski', NULL, 'Разрешение на коммерческое использование и адаптацию не подтверждено по издательским и библиографическим сведениям.'),
    ('10.1093/jalm/jfaf084', 'Data-Driven Reference Intervals in Modern Laboratory Medicine: New Web Tools to Refine Vitamin D Status', 2025, 'REJECTED_LICENSE', 'Álex Barragán Muñoz; Aleix B Fabregat-Bolufer', NULL, 'Разрешение на коммерческое использование и адаптацию не подтверждено по издательским и библиографическим сведениям.'),
    ('10.1093/clinchem/hvae129', 'Clinical Decision-Making Suffers from Inequivalent Measurement Results and Inadequate Reference Intervals', 2024, 'PARTIAL', 'Marith van Schrojenstein Lantman; Miranda van Berkel; Philip Kuijper; Marloes Langelaan; Nannette Brouwer; Marc Thelen', 'https://creativecommons.org/licenses/by/4.0/', 'Сравнение результатов и референсов в контексте гармонизации. Требуется завершить сверку всех материалов.'),
    ('10.1210/clinem/dgae633', 'Serum Phosphate in the General Population: A Need for Sex-Specific Reference Intervals', 2025, 'REJECTED_LICENSE', 'Ariadne Bosman; Natalia Campos-Obando; Christian Ramakers; M Carola Zillikens', 'https://creativecommons.org/licenses/by-nc-nd/4.0/', 'Указана CC BY-NC-ND 4.0; коммерческое использование и адаптация не разрешены.'),
    ('10.1093/clinchem/hvae109', 'Reference Intervals Revisited: A Novel Model for Population-Based Reference Intervals, Using a Small Sample Size and Biological Variation Data', 2024, 'REJECTED_LICENSE', 'Abdurrahman Coşkun; Sverre Sandberg; Ibrahim Unsal; Deniz I Topcu; Aasne K Aarsand', 'https://academic.oup.com/pages/standard-publication-reuse-rights', 'Стандартная модель издателя. Отдельное разрешение на коммерческое использование и адаптацию не подтверждено.'),
    ('10.1093/clinchem/hvae089', 'Data Mining Reference Intervals by ICD-10 Stratified Differential Distributions', 2024, 'PARTIAL', 'Tobias U Blatter; David Schär; Harald Witte; Christos T Nakas; Alexander B Leichtle', 'https://creativecommons.org/licenses/by/4.0/', 'В работе на локальной больничной выборке сравниваются оценки креатинина по глобальному и дифференциальному распределению, стратифицированному по ICD-10. Нужна сверка применимости и приложений перед импортом.'),
    ('10.1093/labmed/lmae037', 'Patient-derived reference intervals for alkaline phosphatase to support appropriate utility for isoenzymes determinations and hypophosphatasia', 2024, 'REJECTED_LICENSE', 'Jonathan Joseph; Ibrahim A Hashim', 'https://academic.oup.com/pages/standard-publication-reuse-rights', 'Стандартная модель издателя. Отдельное разрешение на коммерческое использование и адаптацию не подтверждено.'),
    ('10.1210/jendso/bvae004', 'Age-specific Reference Intervals of Abbott Intact PTH-Potential Impacts on Clinical Care', 2024, 'ANALYZED', 'Tejas Kalaria; Alexander J Lawson; Joanne Duffy; Ashishkumar Agravatt; Steve Harris; Clare Ford; Rousseau Gama; Craig Webster; Tarekegn Geberhiwot', 'https://creativecommons.org/licenses/by/4.0/', 'Четыре возрастных интервала интактного ПТГ Abbott. Выборка отобрана по функции почек, 25(OH)D и нормальным кальцию с поправкой на альбумин и фосфату. Интактного ПТГ в справочнике нет; диапазоны не импортированы.'),
    ('10.1210/clinem/dgae057', 'The Clinical Impact of Sample Storage at -20 °C on Renin Reference Intervals and Aldosterone-Renin Ratio Calculations', 2024, 'PARTIAL', 'Ömer Özcan; Jacquelien J Hillebrand; Wendy den Elzen; Annemieke C Heijboer', 'https://creativecommons.org/licenses/by/4.0/', 'Исследование условий хранения образцов и влияния на активность ренина и альдостерон-рениновое отношение. Сверка полного материала не завершена.'),
    ('10.1093/jalm/jfad109', 'A Quantile-Quantile Toolbox for Reference Intervals', 2024, 'REJECTED_LICENSE', 'Douglas M Hawkins; Rianne N Esquivel', 'https://academic.oup.com/pages/standard-publication-reuse-rights', 'Стандартная модель издателя. Отдельное разрешение на коммерческое использование и адаптацию не подтверждено.'),
    ('10.1093/jalm/jfad110', 'Reference Intervals: A Hoffmann Method Improvement?', 2024, 'REJECTED_LICENSE', 'Dustin R Bunch; Christopher D Koch', NULL, 'Разрешение на коммерческое использование и адаптацию не подтверждено по издательским и библиографическим сведениям.'),
    ('10.1093/clinchem/hvad113', 'Personalized and Population-Based Reference Intervals for 48 Common Clinical Chemistry and Hematology Measurands: A Comparative Study', 2023, 'REJECTED_LICENSE', 'Abdurrahman Coşkun; Sverre Sandberg; Ibrahim Unsal; Coskun Cavusoglu; Mustafa Serteser; Meltem Kilercik; Aasne K Aarsand', 'https://academic.oup.com/pages/standard-publication-reuse-rights', 'Стандартная модель издателя. Отдельное разрешение на коммерческое использование и адаптацию не подтверждено.'),
    ('10.1093/clinchem/hvad099', 'Reference Interval Harmonization: Harnessing the Power of Big Data Analytics to Derive Common Reference Intervals across Populations and Testing Platforms', 2023, 'REJECTED_LICENSE', 'Mary Kathryn Bohn; Dana Bailey; Cynthia Balion; George Cembrowski; Christine Collier; Vincent De Guire; Victoria Higgins; Benjamin Jung; Zahraa Mohammed Ali; David Seccombe; Jennifer Taher; Albert K Y Tsui; Allison Venner; Khosrow Adeli', 'https://academic.oup.com/pages/standard-publication-reuse-rights', 'Стандартная модель издателя. Отдельное разрешение на коммерческое использование и адаптацию не подтверждено.'),
    ('10.1093/clinchem/hvad098', 'Reference Interval Harmonization: Will Big Data Provide a Solution?', 2023, 'REJECTED_LICENSE', 'Ferruccio Ceriotti; Matteo Vidali', 'https://academic.oup.com/pages/standard-publication-reuse-rights', 'Стандартная модель издателя. Отдельное разрешение на коммерческое использование и адаптацию не подтверждено.'),
    ('10.1093/jalm/jfad024', 'NT-proBNP Reference Intervals in Healthy U.S. Children, Adolescents, and Adults', 2023, 'REJECTED_LICENSE', 'Scott Mu; Justin B Echouffo-Tcheugui; Chiadi E Ndumele; Josef Coresh; Stephen Juraschek; Tammy Brady; John William McEvoy; Bige Ozkan; Olive Tang; Robert H Christenson; Elizabeth Selvin', 'https://academic.oup.com/pages/standard-publication-reuse-rights', 'Стандартная модель издателя. Отдельное разрешение на коммерческое использование и адаптацию не подтверждено.'),
    ('10.1093/jalm/jfad012', 'Comprehensive Pediatric Reference Limits for High-Sensitivity Cardiac Troponin I and NT-proBNP in the CALIPER Cohort', 2023, 'REJECTED_LICENSE', 'Mary Kathryn Bohn; Khosrow Adeli', NULL, 'Разрешение на коммерческое использование и адаптацию не подтверждено по издательским и библиографическим сведениям.'),
    ('10.1093/jalm/jfac122', 'Use of Computer Simulation for Calculating Reference Limits for Distribution Overlap', 2023, 'REJECTED_LICENSE', 'Matteo Vidali', NULL, 'Разрешение на коммерческое использование и адаптацию не подтверждено по издательским и библиографическим сведениям.'),
    ('10.1093/jalm/jfac101', 'Estimation of Reference Intervals from Routine Data Using the refineR Algorithm-A Practical Guide', 2023, 'PARTIAL', 'Tatjana Ammer; André Schützenmeister; Christopher M Rank; Kelly Doyle', 'https://creativecommons.org/licenses/by/4.0/', 'Руководство по применению алгоритма refineR к лабораторным данным. Приложения и примеры не сверены полностью.'),
    ('10.1093/jalm/jfac074', 'Reference Interval for Serum L-Homoarginine Determined with Enzyme-Linked Immunosorbent Assay in the Population-Based Study of Health in Pomerania', 2022, 'REJECTED_LICENSE', 'Edzard Schwedhelm; Kathrin Cordts; Eileen Moritz; Reinhard Wesemann; Chi-Un Choe; Rainer Böger; Till Ittermann; Marcus Dörr; Nele Friedrich; Martin Bahls', 'https://academic.oup.com/pages/standard-publication-reuse-rights', 'Стандартная модель издателя. Отдельное разрешение на коммерческое использование и адаптацию не подтверждено.'),
    ('10.1093/jalm/jfac015', 'Reference Intervals for Thyrotropin Hormone in the General Andean Population of Quito-Ecuador Using Electrochemiluminescence Assay', 2022, 'REJECTED_LICENSE', 'Diana Villagómez Torres; Klever V Sáenz-Flor; Pablo S Velepucha; Andree O Cordova', 'https://academic.oup.com/journals/pages/open_access/funder_policies/chorus/standard_publication_model', 'Стандартная модель издателя. Отдельное разрешение на коммерческое использование и адаптацию не подтверждено.'),
    ('10.1093/jalm/jfab155', 'Pediatric Reference Intervals for Point-of-Care Random Glucose in Healthy Children and Adolescents', 2022, 'REJECTED_LICENSE', 'Siobhan Wilson; Hannah Earle; Mary Kathryn Bohn; Alexandra Hall; Khosrow Adeli', NULL, 'Разрешение на коммерческое использование и адаптацию не подтверждено по издательским и библиографическим сведениям.'),
    ('10.1093/clinchem/hvab137', 'Data Mining Approaches to Reference Interval Studies', 2021, 'REJECTED_LICENSE', 'Amrom E Obstfeld; Khushbu Patel; James C Boyd; Julia Drees; Daniel T Holmes; John P A Ioannidis; Arjun K Manrai', NULL, 'Разрешение на коммерческое использование и адаптацию не подтверждено по издательским и библиографическим сведениям.'),
    ('10.1093/clinchem/hvaa208', 'Choice of Statistical Tools for Outlier Removal Causes Substantial Changes in Analyte Reference Intervals in Healthy Populations', 2020, 'REJECTED_LICENSE', 'Peter E Hickman; Gus Koerbin; Julia M Potter; Nicholas Glasgow; Juleen A Cavanaugh; Walter P Abhayaratna; Nic P West; Paul Glasziou', 'https://creativecommons.org/licenses/by-nc-nd/4.0/', 'Указана CC BY-NC-ND 4.0; коммерческое использование и адаптация не разрешены.'),
    ('10.1093/clinchem/hvaa271', 'Association of 152 Biomarker Reference Intervals with All-Cause Mortality in Participants of a General United States Survey from 1999 to 2010', 2021, 'PARTIAL', 'Nam Pho; Arjun K Manrai; John T Leppert; Glenn M Chertow; John P A Ioannidis; Chirag J Patel', 'http://creativecommons.org/licenses/by/4.0/', 'Когорта NHANES с оценкой связи диапазонов биомаркеров и смертности. Полный набор диапазонов и приложения требуют сверки.'),
    ('10.1093/jalm/jfaa045', 'Validation of the HAPPI Kids Continuous Age-Specific Pediatric Reference Intervals', 2020, 'REJECTED_LICENSE', 'Monsurul Hoq; Susan Matthews; Vicky Karlaftis; Janet Burgess; Susan Donath; John Carlin; Vera Ignjatovic; Paul Monagle', 'https://academic.oup.com/journals/pages/open_access/funder_policies/chorus/standard_publication_model', 'Стандартная модель издателя. Отдельное разрешение на коммерческое использование и адаптацию не подтверждено.'),
    ('10.1093/jalm/jfz001', 'Proposed Plasma Ammonia Reference Intervals in a Reference Group of Hospitalized Term and Preterm Neonates', 2020, 'REJECTED_LICENSE', 'Theresa Madigan; Darci R Block; William A Carey; Bethany D Kaemingk; Robin Patel', NULL, 'Разрешение на коммерческое использование и адаптацию не подтверждено по издательским и библиографическим сведениям.'),
    ('10.1093/jalm/jfaa017', 'In Search of Normality for Vitamin K1: Establishing Age-Dependent Reference Intervals in the Danish Population', 2020, 'REJECTED_LICENSE', 'Ida Boegh Andersen; Claus Lohman Brasen; Anne Schmedes; Ivan Brandslund; Jonna Skov Madsen', 'https://academic.oup.com/journals/pages/open_access/funder_policies/chorus/standard_publication_model', 'Стандартная модель издателя. Отдельное разрешение на коммерческое использование и адаптацию не подтверждено.'),
    ('10.1093/labmed/lmz096', 'Establishment of Reference Intervals for Alkaline Phosphatase in Pakistani Children Using a Data Mining Approach', 2020, 'REJECTED_LICENSE', 'Sibtain Ahmed; Jakob Zierk; Aysha Habib Khan', NULL, 'Разрешение на коммерческое использование и адаптацию не подтверждено по издательским и библиографическим сведениям.'),
    ('10.1210/clinem/dgz196', 'Sex-specific Estrogen Levels and Reference Intervals from Infancy to Late Adulthood Determined by LC-MS/MS', 2020, 'PARTIAL', 'Hanne Frederiksen; Trine Holm Johannsen; Stine Ehlern Andersen; Jakob Albrethsen; Selma Kløve Landersoe; Jørgen Holm Petersen; Anders Nyboe Andersen; Esben Thyssen Vestergaard; Mia Elbek Schorring; Allan Linneberg; Katharina M Main; Anna-Maria Andersson; Anders Juul', 'http://creativecommons.org/licenses/by/4.0/', 'Интервалы эстрогенов LC-MS/MS с учётом возраста, пола, пубертата и фазы цикла. Нужна сверка таблиц для групп, которые можно представить в сервисе.')
  ) AS article(doi,title,year,status,authors,license_url,comment)
  WHERE NOT EXISTS (
    SELECT 1 FROM "medicalSource" existing WHERE existing.parent_id=root_id
      AND (existing.url='https://doi.org/' || article.doi OR existing.metadata->>'doi'=article.doi)
  );

  SELECT id INTO STRICT prolactin_source_id FROM "medicalSource"
  WHERE parent_id=root_id AND url='https://doi.org/10.1093/jalm/jfag169';

  INSERT INTO ages (name,"intervalDayStart","intervalDayEnd")
  SELECT 'days-6480-33839',6480,33839
  WHERE NOT EXISTS (SELECT 1 FROM ages WHERE "intervalDayStart"=6480 AND "intervalDayEnd"=33839);

  INSERT INTO "medicalSourceAge" ("sourceId","ageId")
  SELECT prolactin_source_id,id FROM ages
  WHERE "intervalDayStart"=6480 AND "intervalDayEnd"=33839;

  INSERT INTO "analysisPointIntervalValue" ("sourceId","pointId","unitId","ageId","genderId",
    "minValue","maxValue","minValueEqual","maxValueEqual",status)
  SELECT prolactin_source_id,p.id,u.id,a.id,g.id,b.lo,b.hi,b.lo_equal,b.hi_equal,b.status
  FROM "analysisPoint" p
  JOIN analysis_point_units pu ON pu."pointId"=p.id
  JOIN "analysisPointUnits" u ON u.id=pu."unitsId" AND u.code='m[iU]/L'
  JOIN ages a ON a."intervalDayStart"=6480 AND a."intervalDayEnd"=33839
  JOIN gender g ON g.name='m'
  CROSS JOIN (VALUES
    (NULL::numeric,72.3,NULL::boolean,false,'LOW'),
    (72.3,634.0,true,true,'NORMAL'),
    (634.0,NULL::numeric,false,NULL::boolean,'HIGH')
  ) b(lo,hi,lo_equal,hi_equal,status)
  WHERE p.name='prolactin';
  GET DIAGNOSTICS inserted_count=ROW_COUNT;
  IF inserted_count<>3 THEN RAISE EXCEPTION 'Expected three Abbott prolactin rows, got %',inserted_count; END IF;

  UPDATE "medicalSource" SET comment=comment ||
    ' Повторная проверка у издателя и в репозитории University of Helsinki не дала файла приложения; основная статья подтверждает назначение сравнительных таблиц и рисунков.'
  WHERE parent_id=root_id AND url='https://academic.oup.com/jalm/article/7/6/1438/6678478' AND status='PARTIAL';

  UPDATE "medicalSource" SET status='PARTIAL',
    comment='Просмотрены 83 результата тематического поиска PubMed по шести журналам 2020–2026 годов; решения по профильной выборке записаны отдельно. Статус частичный: остались открытые публикации и недоступные приложения, в том числе к статье Pelanti.'
  WHERE id=root_id;
END $$;
`;
