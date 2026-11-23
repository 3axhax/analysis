export const CALIPER_PEDIATRIC_REFERENCES_SQL = `
DO $$
DECLARE
  root_id integer;
  iran_id integer;
  canada_id integer;
  inserted_count integer;
BEGIN
  SELECT id INTO STRICT root_id FROM "medicalSource"
  WHERE url='https://caliperproject.ca/' AND parent_id IS NULL;

  INSERT INTO "medicalSource" (parent_id,name,url,year,status,comment,metadata)
  VALUES (root_id,'Abdollahian и соавт. — биохимия у детей, Alpha classic-AT plus, Иран',
    'https://doi.org/10.1111/jcmm.17646',2023,'ANALYZED',
    'Таблица 1: внесены семь диапазонов креатинина, мочевины и мочевой кислоты. Старт ограничен 3 сутками по критериям включения. Для обоих полов общий диапазон. Общий кальций, фосфат и hs-CRP отсутствуют в подходящей форме справочника. Распределение 25(OH)D не перенесено: авторы отмечают низкие значения в исследованной популяции.',
    jsonb_build_object('title','Age-specific reference intervals for routine biochemical parameters in healthy neonates, infants, and young children in Iran',
      'authors','Niloufar Abdollahian, Hamideh Ghazizadeh, Maryam Mohammadi-Bajgiran, Mehran Pashirzad et al.',
      'doi','10.1111/jcmm.17646','license','CC BY 4.0','licenseUrl','https://creativecommons.org/licenses/by/4.0/',
      'section','Таблица 1','assay','Alpha classic-AT plus, Pars Azmoun, сыворотка',
      'adaptation','Пересчёт из мг/дл в единицы справочника'))
  RETURNING id INTO iran_id;

  INSERT INTO "medicalSource" (parent_id,name,url,year,status,comment,metadata)
  VALUES (root_id,'Hamid и соавт. — гемоглобин и MCV, Sysmex XN-9000, Канада',
    'https://doi.org/10.1186/s12887-021-02709-w',2021,'ANALYZED',
    'Таблица 3: объединённые по полу годовые оценки, по три диапазона гемоглобина и MCV, возраст от 2 до 36 месяцев. Использованы оценки, непосредственно приведённые в таблице; обсуждаемая единая область гемоглобина 2–36 месяцев не имеет отдельной рассчитанной пары границ. Авторы отмечают небольшой объём выборки до 4 месяцев.',
    jsonb_build_object('title','Reference intervals for hemoglobin and mean corpuscular volume in an ethnically diverse community sample of Canadian children 2 to 36 months',
      'authors','Jemila S. Hamid, Eshetu G. Atenafu, Cornelia M. Borkhoff, Catherine S. Birken, Jonathon L. Maguire, Mary Kathryn Bohn, Khosrow Adeli, Mohamed Abdelhaleem, Patricia C. Parkin',
      'doi','10.1186/s12887-021-02709-w','license','CC BY 4.0','licenseUrl','https://creativecommons.org/licenses/by/4.0/',
      'section','Таблица 3, Year 1–3','assay','Sysmex XN-9000, цельная кровь с EDTA'))
  RETURNING id INTO canada_id;

  INSERT INTO ages (name,"intervalDayStart","intervalDayEnd")
  SELECT 'days-' || v.day_start || '-' || v.day_end,v.day_start,v.day_end
  FROM (VALUES (3,149),(150,899),(150,299),(300,899),(60,359),(360,719),(720,1080)) AS v(day_start,day_end)
  WHERE NOT EXISTS (SELECT 1 FROM ages WHERE "intervalDayStart"=v.day_start AND "intervalDayEnd"=v.day_end);

  INSERT INTO "medicalSourceAge" ("sourceId","ageId")
  SELECT v.source_id,a.id
  FROM (VALUES (iran_id,3,149),(iran_id,150,899),(iran_id,150,299),(iran_id,300,899),
    (canada_id,60,359),(canada_id,360,719),(canada_id,720,1080)) AS v(source_id,day_start,day_end)
  JOIN ages a ON a."intervalDayStart"=v.day_start AND a."intervalDayEnd"=v.day_end;

  INSERT INTO "analysisPointIntervalValue" ("sourceId","pointId","unitId","ageId","genderId",
    "minValue","maxValue","minValueEqual","maxValueEqual",status)
  SELECT r.source_id,p.id,u.id,a.id,g.id,b.lower_limit,b.upper_limit,b.lower_included,b.upper_included,b.status
  FROM (VALUES
    (iran_id,'creatinine','umol/L',3,149,0.22,0.44,88.4),
    (iran_id,'creatinine','umol/L',150,899,0.27,0.57,88.4),
    (iran_id,'urea','mmol/L',3,149,6.20,25.62,0.1665),
    (iran_id,'urea','mmol/L',150,299,6.94,38.12,0.1665),
    (iran_id,'urea','mmol/L',300,899,9.03,46.43,0.1665),
    (iran_id,'uric_acid','umol/L',3,149,2.66,10.17,59.48),
    (iran_id,'uric_acid','umol/L',150,899,2.30,8.20,59.48),
    (canada_id,'hemoglobin','g/L',60,359,101.0,131.8,1),
    (canada_id,'hemoglobin','g/L',360,719,103.6,133.7,1),
    (canada_id,'hemoglobin','g/L',720,1080,105.9,133.1,1),
    (canada_id,'mcv','fL',60,359,70.7,85.8,1),
    (canada_id,'mcv','fL',360,719,68.5,83.4,1),
    (canada_id,'mcv','fL',720,1080,71.3,83.5,1)
  ) AS r(source_id,point_name,unit_code,day_start,day_end,lo,hi,factor)
  JOIN "analysisPoint" p ON p.name=r.point_name
  JOIN analysis_point_units allowed ON allowed."pointId"=p.id
  JOIN "analysisPointUnits" u ON u.id=allowed."unitsId" AND u.code=r.unit_code
  JOIN ages a ON a."intervalDayStart"=r.day_start AND a."intervalDayEnd"=r.day_end
  JOIN gender g ON g.name IN ('m','f')
  CROSS JOIN LATERAL (VALUES
    (NULL::numeric,r.lo*r.factor,NULL::boolean,false,'LOW'),
    (r.lo*r.factor,r.hi*r.factor,true,true,'NORMAL'),
    (r.hi*r.factor,NULL::numeric,false,NULL::boolean,'HIGH')
  ) AS b(lower_limit,upper_limit,lower_included,upper_included,status);

  GET DIAGNOSTICS inserted_count=ROW_COUNT;
  IF inserted_count<>78 THEN RAISE EXCEPTION 'Expected 78 CALIPER interval rows, got %',inserted_count; END IF;

  UPDATE "medicalSource" SET status='PARTIAL',
    comment='Проверены и внесены два открытых исследования из подборки CALIPER. Раздел для специалистов содержит избранные и недавние работы; полный библиографический охват и права на перенос остальных наборов не подтверждены.'
  WHERE id=root_id;
END $$;
`;
