export const PMC_LIVER_REVIEW_COMPLETION_SQL = `
DO $$
DECLARE
  root_id integer;
  reviewed_count integer;
BEGIN
  SELECT id INTO STRICT root_id
  FROM "medicalSource"
  WHERE parent_id IS NULL AND url='https://pmc.ncbi.nlm.nih.gov/'
  FOR UPDATE;

  WITH decisions(url, note) AS (
    VALUES
      ('https://pmc.ncbi.nlm.nih.gov/articles/PMC12868999/',
       'Сверены статья, дополнение и поправка 10.1111/joim.70090. Поправка уточняет число мужчин с APRI ≥1,5 и расчёт компромисса при направлении. Пороги APRI, FIB-4 и АСТ/АЛТ изучены для прогнозирования цирроза или ГЦК в валлийской когорте и зависят от группы и выбранного риска. Универсальные интервалы и условия расшифровки не добавлены.'),
      ('https://pmc.ncbi.nlm.nih.gov/articles/PMC11519095/',
       'Сверены резюме Diabetologia, рисунок 2 и приложение. Для взрослых из групп риска рисунок задаёт нижнюю границу FIB-4 1,3 до 65 лет включительно и 2,0 после 65 лет, верхнюю 2,67. Это часть маршрута оценки риска с учётом диабета, ожирения с дополнительными факторами или стойкого повышения печёночных ферментов. В общей расшифровке эти условия не фиксируются. Лицензия CC BY 4.0 подтверждена поправкой издателя 10.1007/s00125-024-06258-6.'),
      ('https://pmc.ncbi.nlm.nih.gov/articles/PMC12858224/',
       'Сверены статья и приложение с кодами исходов. В программе Gwent АСТ измеряют дополнительно при повышенном АЛТ, а АСТ/АЛТ ≥1 служит поводом направить пациента на оценку фиброза. Результаты оценивают внедрение этого маршрута. Порог отдельно от условий маршрута в общую расшифровку не внесён.'),
      ('https://pmc.ncbi.nlm.nih.gov/articles/PMC12402429/',
       'Сверены таблицы и приложение с методами и кодами. Исследованы частота зарегистрированного синдрома Жильбера и признаки до регистрации диагноза. Связи с утомляемостью и болью в животе не дают лабораторных порогов или нового сочетания показателей для расшифровки. Существующие описания не расширены.')
  )
  UPDATE "medicalSource" AS source
  SET status='ANALYZED', comment=decisions.note
  FROM decisions
  WHERE source.parent_id=root_id AND source.url=decisions.url AND source.status='PARTIAL';

  GET DIAGNOSTICS reviewed_count=ROW_COUNT;
  IF reviewed_count<>4 THEN
    RAISE EXCEPTION 'Expected four PMC review records, got %',reviewed_count;
  END IF;

  UPDATE "medicalSource"
  SET comment='Сверены зарегистрированные тематические подборки, включая четыре работы о фиброзе печени и синдроме Жильбера. Полнота охвата всего каталога PubMed Central не подтверждена.'
  WHERE id=root_id AND status='PARTIAL';
END $$;
`;
