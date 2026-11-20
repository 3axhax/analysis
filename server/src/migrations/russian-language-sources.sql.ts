export const RUSSIAN_LANGUAGE_SOURCES_SQL = `
DO $$
DECLARE
  journal record;
  article record;
  age_range record;
  parent_source_id integer;
  source_id integer;
  prolactin_source_id integer;
  cbc_source_id integer;
  rdw_sd_id integer;
  inserted_count integer;
  license_url constant text := 'https://creativecommons.org/licenses/by/4.0/';
BEGIN
  FOR journal IN SELECT * FROM (VALUES
    ('Пациентоориентированная медицина и фармация','https://pomph.ru/'),
    ('Медицина в Кузбассе','https://mednauki.ru/index.php/MK'),
    ('Учёные записки ПСПбГМУ им. акад. И. П. Павлова','https://www.sci-notes.ru/'),
    ('Молекулярная медицина','https://molmedjournal.ru/')
  ) AS v(name,url)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM "medicalSource" WHERE url=journal.url AND parent_id IS NULL) THEN
      INSERT INTO "medicalSource" (name,url,status,comment)
      VALUES (journal.name,journal.url,'PARTIAL',
        'В задаче 0044 проверена одна публикация. Полнота разбора каталога не подтверждена.');
    END IF;
  END LOOP;

  FOR article IN SELECT * FROM (VALUES
    ('prolactin','https://pmc.ncbi.nlm.nih.gov/',
      'Определение референсных интервалов пролактина для различных возрастных групп',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC10350613/','10.14341/probl13095',2023,'ANALYZED',
      'Г. С. Колесникова, Н. М. Малышева, З. Т. Зураева, Л. В. Никанкина, Г. А. Мельниченко',
      'Таблица 5: пять мужских возрастных групп. VITROS ECi 3600, сыворотка, забор 08:00–10:00. Возраст 40 лет в таблице не указан, старшая группа ограничена обследованным возрастом до 85 лет. Женские интервалы не перенесены: в методике указана фолликулярная фаза, а взрослая старшая группа описана как постменопауза.'),
    ('cbc','https://pomph.ru/',
      'Эритроцитарные показатели клинического анализа крови и их референсные интервалы у мужчин и женщин в возрасте от 18 до 45 лет',
      'https://doi.org/10.37489/2949-1924-0072','10.37489/2949-1924-0072',2024,'ANALYZED',
      'О. П. Речкина, Д. Д. Адамов, Т. Б. Стрибец, Н. А. Лапкина, А. А. Баранов, Л. А. Минеева, Н. В. Беляева, Н. В. Малахов',
      'Таблица 4, колонка собственных данных Mindray BC-6800: семь интервалов для женщин 18–45 лет, n=127. Для MCHC числовая шкала в таблице не соответствует напечатанным г/л. Мужская выборка n=31 оставлена вне импорта из-за малого объёма. Данные производителя и сравниваемых публикаций не переносились.'),
    ('iron','https://mednauki.ru/index.php/MK',
      'Белки-регуляторы метаболизма железа в дифференциальной диагностике железодефицитных анемий',
      'https://mednauki.ru/index.php/MK/ru/article/view/765',NULL,2022,'ANALYZED',
      'Г. С. Суржикова, С. А. Клочкова-Абельянц',
      'Изучены таблицы 1–3. Для порога ферритина из таблицы 2 нужны анемия и клинический контекст воспаления. Собственные результаты по гепсидину и растворимому рецептору трансферрина описывают группы с установленными диагнозами. Подходящих общих интервалов и самостоятельных правил не добавлено.'),
    ('trace','https://pmc.ncbi.nlm.nih.gov/',
      'Вовлеченность эссенциальных микроэлементов в патогенез заболеваний щитовидной железы: диагностические маркеры и аналитические методы определения',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC11931464/','10.14341/probl13402',2025,'ANALYZED',
      'Е. А. Трошина, Н. М. Платонова, Е. С. Сенюшкина, В. А. Иоутси, Е. С. Смолин, Л. В. Никанкина, З. Т. Зураева',
      'Год выпуска номера — 2025. В таблице 1 интервалы йода, селена и цинка заданы лабораторией без описания их расчёта. В таблице 2 популяционные медианы йода в моче. Групповые сравнения по заболеваниям щитовидной железы не задают условий для индивидуальной интерпретации.'),
    ('chemistry','https://www.sci-notes.ru/',
      'Коррекция референсных интервалов биохимических показателей с учетом возрастных особенностей в условиях многопрофильного стационара',
      'https://www.sci-notes.ru/jour/article/view/1263','10.24884/1607-4181-2026-33-1-115-125',2026,'ANALYZED',
      'Д. П. Пискунов, А. А. Кокшаров, А. С. Пушкин, Т. А. Ахмедов, М. А. Городнова, В. Л. Эмануэль',
      'Таблицы 1–3: непрямые оценки креатинина, мочевины и общего белка в выборке приёмного отделения офтальмологии, без учета анамнеза. Концентрационные единицы в таблицах не подписаны. Для креатинина у мужчин 75+ верхняя граница заметно расходится между методами. Интервалы не загружены.'),
    ('license','https://molmedjournal.ru/',
      'Изучение связи концентрации железа с показателями ферритина и трансферрина в сыворотке крови',
      'https://molmedjournal.ru/ru/24999490-2023-01-05','10.29296/24999490-2023-01-05',2023,'REJECTED_LICENSE',
      'В. В. Юрасов, А. Р. Садыков, Г. Д. Морозова, Е. Д. Намиот, А. А. Логвиненко, А. В. Скальный',
      'Проверены страница издателя, PDF и метаданные DOI. Право коммерческого использования и адаптации не подтверждено.')
  ) AS v(key,parent_url,title,url,doi,year,status,authors,comment)
  LOOP
    SELECT id INTO STRICT parent_source_id FROM "medicalSource"
    WHERE parent_id IS NULL AND url=article.parent_url;

    INSERT INTO "medicalSource" (parent_id,name,url,year,status,comment,metadata)
    VALUES (parent_source_id,
      CASE article.key
        WHEN 'prolactin' THEN 'Пролактин — VITROS ECi 3600, мужские группы, забор 08:00–10:00'
        WHEN 'cbc' THEN 'Эритроцитарные показатели — Mindray BC-6800, женщины 18–45 лет'
        ELSE article.title
      END,
      article.url,article.year,article.status::"medicalSourceAnalysisStatus",article.comment,
      jsonb_strip_nulls(jsonb_build_object('title',article.title,'authors',article.authors,'doi',article.doi,
        'license',CASE WHEN article.status<>'REJECTED_LICENSE' THEN 'CC BY 4.0' END,
        'licenseUrl',CASE WHEN article.status<>'REJECTED_LICENSE' THEN license_url END,
        'section',CASE article.key WHEN 'prolactin' THEN 'Таблица 5, мужские группы'
          WHEN 'cbc' THEN 'Таблица 4, собственные данные' END,
        'assay',CASE article.key WHEN 'prolactin' THEN 'VITROS ECi 3600'
          WHEN 'cbc' THEN 'Mindray BC-6800' END)))
    RETURNING id INTO source_id;

    IF article.key='prolactin' THEN prolactin_source_id := source_id; END IF;
    IF article.key='cbc' THEN cbc_source_id := source_id; END IF;
  END LOOP;

  INSERT INTO "analysisPoint" (name,"translationRu","translationEn","translationParsing")
  VALUES ('rdw-sd','Ширина распределения эритроцитов, стандартное отклонение (RDW-SD)',
    'Red cell distribution width, standard deviation (RDW-SD)',
    'RDW-SD_RDW SD_RDWSD_Ширина распределения эритроцитов, стандартное отклонение_Распределение эритроцитов по объёму (RDW-SD)_Red cell distribution width standard deviation')
  RETURNING id INTO rdw_sd_id;

  INSERT INTO translation (lang,namespace,module,submodule,value)
  SELECT 'ru','entities','analysisPoint',name,"translationRu" FROM "analysisPoint" WHERE id=rdw_sd_id;
  INSERT INTO translation (lang,namespace,module,submodule,value)
  SELECT 'en','entities','analysisPoint',name,"translationEn" FROM "analysisPoint" WHERE id=rdw_sd_id;

  INSERT INTO analysis_point_units ("pointId","unitsId")
  SELECT p.id,u.id
  FROM (VALUES ('rdw-sd','fL'),('prolactin','m[iU]/L')) AS v(point_name,unit_code)
  JOIN "analysisPoint" p ON p.name=v.point_name
  JOIN "analysisPointUnits" u ON u.code=v.unit_code
  ON CONFLICT DO NOTHING;

  FOR age_range IN SELECT * FROM (VALUES
    (prolactin_source_id,5,9),(prolactin_source_id,10,13),(prolactin_source_id,14,18),
    (prolactin_source_id,19,39),(prolactin_source_id,41,85),(cbc_source_id,18,45)
  ) AS v(source_id,start_year,end_year)
  LOOP
    INSERT INTO ages (name,"intervalDayStart","intervalDayEnd")
    SELECT 'days-' || bounds.start_day || '-' || bounds.end_day,bounds.start_day,bounds.end_day
    FROM (SELECT age_range.start_year*360 AS start_day,(age_range.end_year+1)*360-1 AS end_day) bounds
    WHERE NOT EXISTS (
      SELECT 1 FROM ages WHERE "intervalDayStart"=bounds.start_day AND "intervalDayEnd"=bounds.end_day
    );

    INSERT INTO "medicalSourceAge" ("sourceId","ageId")
    SELECT age_range.source_id,id FROM ages
    WHERE "intervalDayStart"=age_range.start_year*360 AND "intervalDayEnd"=(age_range.end_year+1)*360-1;
  END LOOP;

  INSERT INTO "analysisPointIntervalValue" ("sourceId","pointId","unitId","ageId","genderId",
    "minValue","maxValue","minValueEqual","maxValueEqual",status)
  SELECT r.source_id,p.id,u.id,a.id,g.id,band.min_value,band.max_value,band.min_equal,band.max_equal,band.status
  FROM (VALUES
    (prolactin_source_id,5,9,'m','prolactin','m[iU]/L',95,420),
    (prolactin_source_id,10,13,'m','prolactin','m[iU]/L',110,460),
    (prolactin_source_id,14,18,'m','prolactin','m[iU]/L',120,480),
    (prolactin_source_id,19,39,'m','prolactin','m[iU]/L',110,430),
    (prolactin_source_id,41,85,'m','prolactin','m[iU]/L',100,420),
    (cbc_source_id,18,45,'f','erythrocyte','10*12/L',3.97,5.02),
    (cbc_source_id,18,45,'f','hemoglobin','g/L',120.10,147.30),
    (cbc_source_id,18,45,'f','hematocrit','%',36.60,44.10),
    (cbc_source_id,18,45,'f','mcv','fL',85.30,96.20),
    (cbc_source_id,18,45,'f','mch','pg',27.65,32.80),
    (cbc_source_id,18,45,'f','rdw','%',11.98,14.03),
    (cbc_source_id,18,45,'f','rdw-sd','fL',39.19,47.36)
  ) AS r(source_id,start_year,end_year,sex,point_name,unit_code,lower_limit,upper_limit)
  JOIN "analysisPoint" p ON p.name=r.point_name
  JOIN analysis_point_units allowed ON allowed."pointId"=p.id
  JOIN "analysisPointUnits" u ON u.id=allowed."unitsId" AND u.code=r.unit_code
  JOIN ages a ON a."intervalDayStart"=r.start_year*360 AND a."intervalDayEnd"=(r.end_year+1)*360-1
  JOIN gender g ON g.name=r.sex
  CROSS JOIN LATERAL (VALUES
    (NULL::numeric,r.lower_limit,NULL::boolean,false,'LOW'),
    (r.lower_limit,r.upper_limit,true,true,'NORMAL'),
    (r.upper_limit,NULL::numeric,false,NULL::boolean,'HIGH')
  ) AS band(min_value,max_value,min_equal,max_equal,status);

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  IF inserted_count <> 36 THEN RAISE EXCEPTION 'Expected 36 Russian-language interval rows, got %', inserted_count; END IF;
END $$;
`;
