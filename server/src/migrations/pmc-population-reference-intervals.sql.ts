export const PMC_POPULATION_REFERENCE_INTERVALS_SQL = `
DO $$
DECLARE
  root_id integer;
  document_id integer;
  point_id integer;
  unit_id integer;
  description_id integer;
  condition_id integer;
  inserted_count integer;
  source record;
  reference record;
  note record;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource"
    WHERE parent_id IS NULL AND name = 'PubMed Central';

  UPDATE "medicalSource"
  SET metadata = metadata || '{"derivedPoint":"nlr"}'::jsonb
  WHERE parent_id = root_id AND metadata->>'doi' = '10.1016/j.htct.2026.108552';

  IF NOT FOUND THEN RAISE EXCEPTION 'Missing Almeida NLR source'; END IF;

  FOR source IN SELECT * FROM (VALUES
    ('karita', 'Karita и соавт. — Восточная и Южная Африка, 18–59 лет (2009)', 'PMC2632744', '10.1371/journal.pone.0004401', 'Etienne Karita, Nzeera Ketter, Matt A Price, Kayitesi Kayitenkore, Pontiano Kaleebu, Annet Nanvubya, Omu Anzala, Walter Jaoko, Gaudensia Mutua, Eugene Ruzagira, Joseph Mulenga, Eduard J Sanders, Mary Mwangome, Susan Allen, Agnes Bwanika, Ubaldo Bahemuka, Ken Awuondo, Gloria Omosa, Bashir Farah, Pauli Amornkul, Josephine Birungi, Sarah Yates, Lisa Stoll-Johnson, Jill Gilmour, Gwynn Stevens, Erin Shutes, Olivier Manigart, Peter Hughes, Len Dally, Janet Scott, Wendy Stevens, Pat Fast, Anatoli Kamali, Chenxi Wang', 'CLSI-Derived Hematology and Biochemistry Reference Intervals for Healthy Adults in Eastern and Southern Africa', 2009, 'Tables 2 and 3, study consensus; selected whole-cohort estimates', 'CC BY', 'https://doi.org/10.1371/journal.pone.0004401', 6480, 21599, NULL),
    ('fiseha', 'Fiseha и соавт. — Северо-Восточная Эфиопия, 18–57 лет (2022)', 'PMC9629653', '10.1371/journal.pone.0276825', 'Temesgen Fiseha, Ermiyas Alemayehu, Ousman Mohammed Adem, Bruktawit Eshetu, Angesom Gebreweld, Donovan Anthony McGrowder', 'Reference intervals for common clinical chemistry parameters in healthy adults of Northeast Ethiopia', 2022, 'Table 1; total protein g/dL × 10', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 6480, 20879, NULL),
    ('baz-a', 'Baz и соавт. — биохимия, 18–44 года (2021)', 'PMC7979267', '10.1371/journal.pone.0236772', 'Heba Baz, Kiyoshi Ichihara, May Selim, Ahmed Awad, Sarah Aglan, Dalia Ramadan, Amina Hassab, Lamia Mansour, Ola Elgaddar, Colin Johnson', 'Establishment of reference intervals of clinical chemistry analytes for the adult population in Egypt', 2021, 'Table 3: SI limits; S3 Table confirms bilirubin units; C-RIDL Egypt', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 6480, 16199, NULL),
    ('baz-b', 'Baz и соавт. — биохимия, 45–65 лет (2021)', 'PMC7979267', '10.1371/journal.pone.0236772', 'Heba Baz, Kiyoshi Ichihara, May Selim, Ahmed Awad, Sarah Aglan, Dalia Ramadan, Amina Hassab, Lamia Mansour, Ola Elgaddar, Colin Johnson', 'Establishment of reference intervals of clinical chemistry analytes for the adult population in Egypt', 2021, 'Table 3: SI limits; S3 Table confirms bilirubin units; C-RIDL Egypt', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 16200, 23759, NULL),
    ('omuse', 'Omuse и соавт. — ОАК, городская Кения, 18–65 лет (2018)', 'PMC5991659', '10.1371/journal.pone.0198444', 'Geoffrey Omuse, Daniel Maina, Jane Mwangi, Caroline Wambua, Kiran Radia, Alice Kanyua, Elizabeth Kagotho, Mariza Hoffman, Peter Ojwang, Zul Premji, Kiyoshi Ichihara, Rajiv Erasmus, Michael Nagler', 'Complete blood count reference intervals from a healthy adult urban population in Kenya', 2018, 'Table 3, adopted LAVE limits in bold; hematocrit L/L × 100', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 6480, 23759, NULL),
    ('kapelari-0', 'Kapelari и соавт. — тиреоидные показатели, 1–29 дней (2008)', 'PMC2645400', '10.1186/1472-6823-8-15', 'Klaus Kapelari, Christine Kirchlechner, Wolfgang Högler, Katharina Schweitzer, Irene Virgolini, Roy Moncayo', 'Pediatric reference intervals for thyroid hormone levels from birth to adulthood: a retrospective study', 2008, 'Tables 1–3, 2.5th/97.5th percentiles; Advia Centaur', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0', 1, 29, NULL),
    ('kapelari-1', 'Kapelari и соавт. — тиреоидные показатели, 1–11 месяцев (2008)', 'PMC2645400', '10.1186/1472-6823-8-15', 'Klaus Kapelari, Christine Kirchlechner, Wolfgang Högler, Katharina Schweitzer, Irene Virgolini, Roy Moncayo', 'Pediatric reference intervals for thyroid hormone levels from birth to adulthood: a retrospective study', 2008, 'Tables 1–3, 2.5th/97.5th percentiles; Advia Centaur', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0', 30, 359, NULL),
    ('kapelari-2', 'Kapelari и соавт. — тиреоидные показатели, 1–5 лет (2008)', 'PMC2645400', '10.1186/1472-6823-8-15', 'Klaus Kapelari, Christine Kirchlechner, Wolfgang Högler, Katharina Schweitzer, Irene Virgolini, Roy Moncayo', 'Pediatric reference intervals for thyroid hormone levels from birth to adulthood: a retrospective study', 2008, 'Tables 1–3, 2.5th/97.5th percentiles; Advia Centaur', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0', 360, 2159, NULL),
    ('kapelari-3', 'Kapelari и соавт. — тиреоидные показатели, 6–10 лет (2008)', 'PMC2645400', '10.1186/1472-6823-8-15', 'Klaus Kapelari, Christine Kirchlechner, Wolfgang Högler, Katharina Schweitzer, Irene Virgolini, Roy Moncayo', 'Pediatric reference intervals for thyroid hormone levels from birth to adulthood: a retrospective study', 2008, 'Tables 1–3, 2.5th/97.5th percentiles; Advia Centaur', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0', 2160, 3959, NULL),
    ('kapelari-4', 'Kapelari и соавт. — тиреоидные показатели, 11–14 лет (2008)', 'PMC2645400', '10.1186/1472-6823-8-15', 'Klaus Kapelari, Christine Kirchlechner, Wolfgang Högler, Katharina Schweitzer, Irene Virgolini, Roy Moncayo', 'Pediatric reference intervals for thyroid hormone levels from birth to adulthood: a retrospective study', 2008, 'Tables 1–3, 2.5th/97.5th percentiles; Advia Centaur', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0', 3960, 5399, NULL),
    ('kapelari-5', 'Kapelari и соавт. — тиреоидные показатели, 15–18 лет (2008)', 'PMC2645400', '10.1186/1472-6823-8-15', 'Klaus Kapelari, Christine Kirchlechner, Wolfgang Högler, Katharina Schweitzer, Irene Virgolini, Roy Moncayo', 'Pediatric reference intervals for thyroid hormone levels from birth to adulthood: a retrospective study', 2008, 'Tables 1–3, 2.5th/97.5th percentiles; Advia Centaur', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0', 5400, 6839, NULL),
    ('raverot-0', 'Raverot и соавт. — верхняя граница ТТГ, 20–29 лет (2020)', 'PMC7141356', '10.3390/jcm9030792', 'Véronique Raverot, Maxime Bonjour, Juliette Abeillon du Payrat, Pauline Perrin, Florence Roucher-Boulez, Helene Lasolle, Fabien Subtil, Françoise Borson-Chazot', 'Age- and Sex-Specific TSH Upper-Limit Reference Intervals in the General French Population: There Is a Need to Adjust Our Actual Practices', 2020, 'Table 1: 97.5th percentile only, Abbott Architect i2000', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 7200, 10799, NULL),
    ('raverot-1', 'Raverot и соавт. — верхняя граница ТТГ, 30–39 лет (2020)', 'PMC7141356', '10.3390/jcm9030792', 'Véronique Raverot, Maxime Bonjour, Juliette Abeillon du Payrat, Pauline Perrin, Florence Roucher-Boulez, Helene Lasolle, Fabien Subtil, Françoise Borson-Chazot', 'Age- and Sex-Specific TSH Upper-Limit Reference Intervals in the General French Population: There Is a Need to Adjust Our Actual Practices', 2020, 'Table 1: 97.5th percentile only, Abbott Architect i2000', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 10800, 14399, NULL),
    ('raverot-2', 'Raverot и соавт. — верхняя граница ТТГ, 40–49 лет (2020)', 'PMC7141356', '10.3390/jcm9030792', 'Véronique Raverot, Maxime Bonjour, Juliette Abeillon du Payrat, Pauline Perrin, Florence Roucher-Boulez, Helene Lasolle, Fabien Subtil, Françoise Borson-Chazot', 'Age- and Sex-Specific TSH Upper-Limit Reference Intervals in the General French Population: There Is a Need to Adjust Our Actual Practices', 2020, 'Table 1: 97.5th percentile only, Abbott Architect i2000', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 14400, 17999, NULL),
    ('raverot-3', 'Raverot и соавт. — верхняя граница ТТГ, 50–59 лет (2020)', 'PMC7141356', '10.3390/jcm9030792', 'Véronique Raverot, Maxime Bonjour, Juliette Abeillon du Payrat, Pauline Perrin, Florence Roucher-Boulez, Helene Lasolle, Fabien Subtil, Françoise Borson-Chazot', 'Age- and Sex-Specific TSH Upper-Limit Reference Intervals in the General French Population: There Is a Need to Adjust Our Actual Practices', 2020, 'Table 1: 97.5th percentile only, Abbott Architect i2000', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 18000, 21599, NULL),
    ('raverot-4', 'Raverot и соавт. — верхняя граница ТТГ, 60–69 лет (2020)', 'PMC7141356', '10.3390/jcm9030792', 'Véronique Raverot, Maxime Bonjour, Juliette Abeillon du Payrat, Pauline Perrin, Florence Roucher-Boulez, Helene Lasolle, Fabien Subtil, Françoise Borson-Chazot', 'Age- and Sex-Specific TSH Upper-Limit Reference Intervals in the General French Population: There Is a Need to Adjust Our Actual Practices', 2020, 'Table 1: 97.5th percentile only, Abbott Architect i2000', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 21600, 25199, NULL),
    ('raverot-5', 'Raverot и соавт. — верхняя граница ТТГ, 70–79 лет (2020)', 'PMC7141356', '10.3390/jcm9030792', 'Véronique Raverot, Maxime Bonjour, Juliette Abeillon du Payrat, Pauline Perrin, Florence Roucher-Boulez, Helene Lasolle, Fabien Subtil, Françoise Borson-Chazot', 'Age- and Sex-Specific TSH Upper-Limit Reference Intervals in the General French Population: There Is a Need to Adjust Our Actual Practices', 2020, 'Table 1: 97.5th percentile only, Abbott Architect i2000', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 25200, 28799, NULL),
    ('raverot-6', 'Raverot и соавт. — верхняя граница ТТГ, 80–89 лет (2020)', 'PMC7141356', '10.3390/jcm9030792', 'Véronique Raverot, Maxime Bonjour, Juliette Abeillon du Payrat, Pauline Perrin, Florence Roucher-Boulez, Helene Lasolle, Fabien Subtil, Françoise Borson-Chazot', 'Age- and Sex-Specific TSH Upper-Limit Reference Intervals in the General French Population: There Is a Need to Adjust Our Actual Practices', 2020, 'Table 1: 97.5th percentile only, Abbott Architect i2000', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 28800, 32399, NULL),
    ('raverot-7', 'Raverot и соавт. — верхняя граница ТТГ, 90–108 лет (2020)', 'PMC7141356', '10.3390/jcm9030792', 'Véronique Raverot, Maxime Bonjour, Juliette Abeillon du Payrat, Pauline Perrin, Florence Roucher-Boulez, Helene Lasolle, Fabien Subtil, Françoise Borson-Chazot', 'Age- and Sex-Specific TSH Upper-Limit Reference Intervals in the General French Population: There Is a Need to Adjust Our Actual Practices', 2020, 'Table 1: 97.5th percentile only, Abbott Architect i2000', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 32400, 39239, NULL),
    ('seniorlab', 'Ludin и соавт. — ферритин SENIORLAB, 60 лет и старше (2026)', 'PMC13116899', '10.3390/jcm15083135', 'Galina Ludin, Rita Maria Baron, Urs E. Nydegger, Marlene Jarquin Campos, Pedro Medina Escobar, Benjamin Sakem, Harald Renz, Karin Jung, Lorenz Risch, Martin Risch, Silvia Giovannini', 'Reference Intervals for Serum Ferritin in Older Adults—Results from the Prospective SENIORLAB Study', 2026, 'Table 4: direct sex-stratified CMIA reference intervals', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 21600, NULL, NULL),
    ('zhang-0', 'Zhang и соавт. — детский NLR, 28 дней – до 2 лет (2026)', 'PMC12927209', '10.1186/s12865-025-00797-2', 'Xiaodan Zhang, Yaohui Song, Minggang Yin, Liangjun Zhang', 'Establishment of age-specific reference intervals for peripheral blood SII, NLR, PLR, and LMR in healthy children', 2026, 'Table 5: NLR from absolute counts; Zigong reference cohort', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 28, 719, 'nlr'),
    ('zhang-1', 'Zhang и соавт. — детский NLR, 2–5 лет (2026)', 'PMC12927209', '10.1186/s12865-025-00797-2', 'Xiaodan Zhang, Yaohui Song, Minggang Yin, Liangjun Zhang', 'Establishment of age-specific reference intervals for peripheral blood SII, NLR, PLR, and LMR in healthy children', 2026, 'Table 5: NLR from absolute counts; Zigong reference cohort', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 720, 2159, 'nlr'),
    ('zhang-2', 'Zhang и соавт. — детский NLR, 6–17 лет (2026)', 'PMC12927209', '10.1186/s12865-025-00797-2', 'Xiaodan Zhang, Yaohui Song, Minggang Yin, Liangjun Zhang', 'Establishment of age-specific reference intervals for peripheral blood SII, NLR, PLR, and LMR in healthy children', 2026, 'Table 5: NLR from absolute counts; Zigong reference cohort', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 2160, 6479, 'nlr')
  ) AS v(key, name, pmcid, doi, authors, title, year, section, license, license_url, min_days, max_days, derived_point)
  LOOP
    INSERT INTO "medicalSource" (parent_id, name, metadata) VALUES (
      root_id, source.name, jsonb_strip_nulls(jsonb_build_object(
        'doi', source.doi, 'url', 'https://pmc.ncbi.nlm.nih.gov/articles/' || source.pmcid || '/',
        'authors', source.authors, 'title', source.title, 'year', source.year,
        'section', source.section, 'license', source.license, 'licenseUrl', source.license_url,
        'translation', 'Референсы и формулировки адаптированы сервисом',
        'minAgeDays', source.min_days, 'maxAgeDays', source.max_days,
        'derivedPoint', source.derived_point
      ))) RETURNING id INTO document_id;

    FOR reference IN SELECT * FROM (VALUES
    ('karita', 'hemoglobin', 'g/dL', 'm', 12.2, 17.7),
    ('karita', 'hemoglobin', 'g/dL', 'f', 9.5, 15.8),
    ('karita', 'mcv', 'fL', NULL, 68, 98),
    ('karita', 'platelets', '10*9/L', NULL, 126, 438),
    ('karita', 'leukocytes', '10*9/L', NULL, 3.1, 9.1),
    ('karita', 'neutrophil-count', '10*9/L', NULL, 1, 5.3),
    ('karita', 'lymphocyte-count', '10*9/L', NULL, 1.2, 3.7),
    ('karita', 'monocyte-count', '10*9/L', NULL, 0.2, 0.78),
    ('karita', 'eosinophil-count', '10*9/L', NULL, 0.04, 1.53),
    ('karita', 'neutrophil-percentage', '%', NULL, 25, 66),
    ('karita', 'lymphocyte-percentage', '%', NULL, 23, 59),
    ('karita', 'monocyte-percentage', '%', NULL, 4.5, 13.1),
    ('karita', 'creatinine', 'umol/L', NULL, 47, 109),
    ('karita', 'bilirubin', 'umol/L', NULL, 2.9, 37),
    ('karita', 'aspartate_aminotransferase', 'U/L', NULL, 14, 60),
    ('karita', 'alanine_aminotransferase', 'U/L', NULL, 8, 61),
    ('karita', 'albumin_fraction', 'g/L', NULL, 35, 52),
    ('karita', 'total_protein', 'g/L', NULL, 58, 88),
    ('fiseha', 'alanine_aminotransferase', 'U/L', 'm', 14, 48.9),
    ('fiseha', 'aspartate_aminotransferase', 'U/L', 'm', 18.9, 63),
    ('fiseha', 'aspartate_aminotransferase', 'U/L', 'f', 15.9, 59),
    ('fiseha', 'alkaline_phosphatase', 'U/L', 'm', 55, 343.4),
    ('fiseha', 'alkaline_phosphatase', 'U/L', 'f', 50, 326.3),
    ('fiseha', 'total_protein', 'g/L', NULL, 54, 89),
    ('baz-a', 'na', 'mmol/L', NULL, 131, 148),
    ('baz-a', 'k', 'mmol/L', NULL, 3.4, 5.3),
    ('baz-a', 'cl', 'mmol/L', NULL, 94, 111),
    ('baz-a', 'ca', 'mmol/L', NULL, 2.17, 2.68),
    ('baz-a', 'p', 'mmol/L', NULL, 0.79, 1.52),
    ('baz-a', 'mg', 'mmol/L', NULL, 0.65, 1.05),
    ('baz-a', 'total_protein', 'g/L', NULL, 60, 82),
    ('baz-a', 'albumin_fraction', 'g/L', NULL, 36, 51),
    ('baz-a', 'urea', 'mmol/L', 'm', 2.7, 7.6),
    ('baz-a', 'urea', 'mmol/L', 'f', 2.1, 7.0),
    ('baz-a', 'creatinine', 'umol/L', 'm', 47, 105),
    ('baz-a', 'creatinine', 'umol/L', 'f', 41, 80),
    ('baz-a', 'uric_acid', 'umol/L', 'm', 168, 479),
    ('baz-a', 'ferrum', 'umol/L', NULL, 3, 26),
    ('baz-a', 'bilirubin', 'umol/L', 'm', 2.5, 20.6),
    ('baz-a', 'bilirubin', 'umol/L', 'f', 2.2, 12.4),
    ('baz-a', 'direct-bilirubin', 'umol/L', 'm', 0.62, 6.31),
    ('baz-a', 'direct-bilirubin', 'umol/L', 'f', 0.45, 3.65),
    ('baz-a', 'tibc', 'umol/L', 'm', 40, 78),
    ('baz-a', 'tibc', 'umol/L', 'f', 44, 85),
    ('baz-a', 'aspartate_aminotransferase', 'U/L', 'm', 12, 38),
    ('baz-a', 'aspartate_aminotransferase', 'U/L', 'f', 10, 32),
    ('baz-a', 'alanine_aminotransferase', 'U/L', 'm', 4, 66),
    ('baz-a', 'alkaline_phosphatase', 'U/L', 'm', 45, 131),
    ('baz-a', 'ggtp', 'U/L', 'm', 14, 72),
    ('baz-a', 'ldh', 'U/L', NULL, 91, 282),
    ('baz-a', 'alanine_aminotransferase', 'U/L', 'f', 4, 30),
    ('baz-a', 'alkaline_phosphatase', 'U/L', 'f', 31, 98),
    ('baz-a', 'ggtp', 'U/L', 'f', 11, 38),
    ('baz-a', 'uric_acid', 'umol/L', 'f', 145, 358),
    ('baz-b', 'na', 'mmol/L', NULL, 131, 148),
    ('baz-b', 'k', 'mmol/L', NULL, 3.4, 5.3),
    ('baz-b', 'cl', 'mmol/L', NULL, 94, 111),
    ('baz-b', 'ca', 'mmol/L', NULL, 2.17, 2.68),
    ('baz-b', 'p', 'mmol/L', NULL, 0.79, 1.52),
    ('baz-b', 'mg', 'mmol/L', NULL, 0.65, 1.05),
    ('baz-b', 'total_protein', 'g/L', NULL, 60, 82),
    ('baz-b', 'albumin_fraction', 'g/L', NULL, 36, 51),
    ('baz-b', 'urea', 'mmol/L', 'm', 2.7, 7.6),
    ('baz-b', 'urea', 'mmol/L', 'f', 2.1, 7.0),
    ('baz-b', 'creatinine', 'umol/L', 'm', 47, 105),
    ('baz-b', 'creatinine', 'umol/L', 'f', 41, 80),
    ('baz-b', 'uric_acid', 'umol/L', 'm', 168, 479),
    ('baz-b', 'ferrum', 'umol/L', NULL, 3, 26),
    ('baz-b', 'bilirubin', 'umol/L', 'm', 2.5, 20.6),
    ('baz-b', 'bilirubin', 'umol/L', 'f', 2.2, 12.4),
    ('baz-b', 'direct-bilirubin', 'umol/L', 'm', 0.62, 6.31),
    ('baz-b', 'direct-bilirubin', 'umol/L', 'f', 0.45, 3.65),
    ('baz-b', 'tibc', 'umol/L', 'm', 40, 78),
    ('baz-b', 'tibc', 'umol/L', 'f', 44, 85),
    ('baz-b', 'aspartate_aminotransferase', 'U/L', 'm', 12, 38),
    ('baz-b', 'aspartate_aminotransferase', 'U/L', 'f', 10, 32),
    ('baz-b', 'alanine_aminotransferase', 'U/L', 'm', 4, 66),
    ('baz-b', 'alkaline_phosphatase', 'U/L', 'm', 45, 131),
    ('baz-b', 'ggtp', 'U/L', 'm', 14, 72),
    ('baz-b', 'ldh', 'U/L', NULL, 91, 282),
    ('baz-b', 'alanine_aminotransferase', 'U/L', 'f', 3, 43),
    ('baz-b', 'alkaline_phosphatase', 'U/L', 'f', 38, 126),
    ('baz-b', 'ggtp', 'U/L', 'f', 12, 62),
    ('baz-b', 'uric_acid', 'umol/L', 'f', 162, 443),
    ('omuse', 'erythrocyte', '10*12/L', 'm', 4.94, 6.52),
    ('omuse', 'erythrocyte', '10*12/L', 'f', 4.31, 5.76),
    ('omuse', 'hemoglobin', 'g/dL', 'm', 14.5, 18.7),
    ('omuse', 'hemoglobin', 'g/dL', 'f', 12.0, 16.5),
    ('omuse', 'hematocrit', '%', 'm', 43.00, 55.00),
    ('omuse', 'hematocrit', '%', 'f', 36.00, 49.00),
    ('omuse', 'mcv', 'fL', NULL, 75.7, 95.6),
    ('omuse', 'mch', 'pg', NULL, 24.8, 32.8),
    ('omuse', 'mchc', 'g/dL', NULL, 32.2, 35.2),
    ('omuse', 'rdw', '%', NULL, 11.3, 15.2),
    ('omuse', 'leukocytes', '10*9/L', NULL, 3.08, 7.83),
    ('omuse', 'neutrophil-percentage', '%', NULL, 28.0, 63.3),
    ('omuse', 'lymphocyte-percentage', '%', NULL, 27.2, 60.0),
    ('omuse', 'monocyte-percentage', '%', 'm', 3.5, 14.3),
    ('omuse', 'monocyte-percentage', '%', 'f', 3.2, 11.0),
    ('omuse', 'eosinophil-percentage', '%', NULL, 1.1, 11.9),
    ('omuse', 'basophil-percentage', '%', NULL, 0.30, 1.10),
    ('omuse', 'neutrophil-count', '10*9/L', NULL, 1.05, 4.08),
    ('omuse', 'lymphocyte-count', '10*9/L', NULL, 1.29, 3.40),
    ('omuse', 'monocyte-count', '10*9/L', 'm', 0.15, 0.76),
    ('omuse', 'monocyte-count', '10*9/L', 'f', 0.14, 0.68),
    ('omuse', 'eosinophil-count', '10*9/L', NULL, 0.04, 0.59),
    ('omuse', 'basophil-count', '10*9/L', NULL, 0.01, 0.07),
    ('omuse', 'platelets', '10*9/L', 'm', 133, 356),
    ('omuse', 'platelets', '10*9/L', 'f', 152, 443),
    ('kapelari-0', 'tsh', 'm[iU]/L', NULL, 0.70, 18.10),
    ('kapelari-0', 'ft4', 'pmol/L', NULL, 8.50, 30.50),
    ('kapelari-1', 'tsh', 'm[iU]/L', NULL, 1.12, 8.21),
    ('kapelari-1', 'ft4', 'pmol/L', NULL, 9.17, 25.28),
    ('kapelari-2', 'tsh', 'm[iU]/L', NULL, 0.80, 6.26),
    ('kapelari-2', 'ft4', 'pmol/L', NULL, 10.45, 22.35),
    ('kapelari-2', 'ft3', 'pmol/L', 'f', 4.25, 7.61),
    ('kapelari-2', 'ft3', 'pmol/L', 'm', 3.96, 8.14),
    ('kapelari-3', 'tsh', 'm[iU]/L', NULL, 0.80, 5.40),
    ('kapelari-3', 'ft4', 'pmol/L', NULL, 10.60, 20.90),
    ('kapelari-3', 'ft3', 'pmol/L', 'f', 4.21, 7.58),
    ('kapelari-3', 'ft3', 'pmol/L', 'm', 4.05, 7.50),
    ('kapelari-4', 'tsh', 'm[iU]/L', NULL, 0.70, 4.61),
    ('kapelari-4', 'ft4', 'pmol/L', NULL, 10.40, 21.36),
    ('kapelari-4', 'ft3', 'pmol/L', 'f', 3.51, 7.30),
    ('kapelari-4', 'ft3', 'pmol/L', 'm', 4.63, 7.20),
    ('kapelari-5', 'tsh', 'm[iU]/L', NULL, 0.50, 4.33),
    ('kapelari-5', 'ft4', 'pmol/L', NULL, 10.57, 22.62),
    ('kapelari-5', 'ft3', 'pmol/L', 'f', 3.50, 6.90),
    ('kapelari-5', 'ft3', 'pmol/L', 'm', 4.20, 7.47),
    ('raverot-0', 'tsh', 'm[iU]/L', 'f', NULL, 4.32),
    ('raverot-0', 'tsh', 'm[iU]/L', 'm', NULL, 4.42),
    ('raverot-1', 'tsh', 'm[iU]/L', 'f', NULL, 4.39),
    ('raverot-1', 'tsh', 'm[iU]/L', 'm', NULL, 4.21),
    ('raverot-2', 'tsh', 'm[iU]/L', 'f', NULL, 4.53),
    ('raverot-2', 'tsh', 'm[iU]/L', 'm', NULL, 4.13),
    ('raverot-3', 'tsh', 'm[iU]/L', 'f', NULL, 4.78),
    ('raverot-3', 'tsh', 'm[iU]/L', 'm', NULL, 4.23),
    ('raverot-4', 'tsh', 'm[iU]/L', 'f', NULL, 4.93),
    ('raverot-4', 'tsh', 'm[iU]/L', 'm', NULL, 4.51),
    ('raverot-5', 'tsh', 'm[iU]/L', 'f', NULL, 5.2),
    ('raverot-5', 'tsh', 'm[iU]/L', 'm', NULL, 4.55),
    ('raverot-6', 'tsh', 'm[iU]/L', 'f', NULL, 5.23),
    ('raverot-6', 'tsh', 'm[iU]/L', 'm', NULL, 4.61),
    ('raverot-7', 'tsh', 'm[iU]/L', 'f', NULL, 5.71),
    ('raverot-7', 'tsh', 'm[iU]/L', 'm', NULL, 4.89),
    ('seniorlab', 'ferritin', 'ng/mL', 'f', 23, 241),
    ('seniorlab', 'ferritin', 'ng/mL', 'm', 19, 396),
    ('zhang-0', 'nlr', '1', NULL, 0.1, 0.92),
    ('zhang-1', 'nlr', '1', NULL, 0.35, 1.88),
    ('zhang-2', 'nlr', '1', NULL, 0.57, 2.3)
    ) AS v(source_key, point_name, unit_code, sex, lower_limit, upper_limit)
    WHERE v.source_key = source.key
    LOOP
      SELECT p.id, u.id INTO STRICT point_id, unit_id
      FROM "analysisPoint" p
      JOIN analysis_point_units pu ON pu."pointId" = p.id
      JOIN "analysisPointUnits" u ON u.id = pu."unitsId"
      WHERE p.name = reference.point_name AND u.code = reference.unit_code;
      INSERT INTO "analysisPointIntervalValue" (
        "sourceId", "pointId", "unitId", "ageId", "genderId",
        "minValue", "maxValue", "minValueEqual", "maxValueEqual", status
      )
      SELECT document_id, point_id, unit_id, age.id, sex.id,
        limits.lower_value, limits.upper_value, limits.lower_inclusive, limits.upper_inclusive, limits.status
      FROM ages age CROSS JOIN gender sex CROSS JOIN (VALUES
        (NULL::numeric, reference.lower_limit, NULL::boolean, false, 'LOW'),
        (reference.lower_limit, reference.upper_limit, true, true, 'NORMAL'),
        (reference.upper_limit, NULL::numeric, false, NULL::boolean, 'HIGH')
      ) AS limits(lower_value, upper_value, lower_inclusive, upper_inclusive, status)
      WHERE age."intervalDayEnd" >= source.min_days
        AND (source.max_days IS NULL OR age."intervalDayStart" <= source.max_days)
        AND (reference.sex IS NULL OR sex.name = reference.sex)
        AND (reference.lower_limit IS NOT NULL OR limits.status = 'HIGH');
      GET DIAGNOSTICS inserted_count = ROW_COUNT;
      IF inserted_count = 0 THEN
        RAISE EXCEPTION 'Missing age or gender for % in %', reference.point_name, source.key;
      END IF;
    END LOOP;

    FOR note IN SELECT * FROM (VALUES
      ('raverot-%', 'tsh', 'HIGH', 'ТТГ выше возрастной верхней границы по данным исследования в Лионе.'),
      ('zhang-%', 'nlr', 'LOW', 'Отношение нейтрофилов к лимфоцитам ниже возрастного референса исследования в Цзыгуне.'),
      ('zhang-%', 'nlr', 'HIGH', 'Отношение нейтрофилов к лимфоцитам выше возрастного референса исследования в Цзыгуне.')
    ) AS v(source_pattern, point_name, status_name, description)
    WHERE source.key LIKE v.source_pattern
    LOOP
      SELECT id INTO STRICT point_id FROM "analysisPoint" WHERE name = note.point_name;
      INSERT INTO "analysisResultDescription" (description_ru, "sourceId", "createdAt", "updatedAt")
        VALUES (note.description, document_id, now(), now()) RETURNING id INTO description_id;
      INSERT INTO "analysisResultDescriptionCondition" ("descriptionId", "pointId")
        VALUES (description_id, point_id) RETURNING id INTO condition_id;
      INSERT INTO "analysisResultIntervalDescriptionCondition" ("conditionId", "intervalId", "pointId")
      SELECT condition_id, i.id, point_id
      FROM "analysisPointIntervalValue" i
      WHERE i."pointId" = point_id AND i."sourceId" = document_id AND i.status = note.status_name;
      IF NOT FOUND THEN RAISE EXCEPTION 'Missing description intervals for % in %', note.point_name, source.key; END IF;
    END LOOP;
  END LOOP;
END $$;
`;
