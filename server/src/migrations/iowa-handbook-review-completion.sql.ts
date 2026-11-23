export const IOWA_HANDBOOK_REVIEW_COMPLETION_SQL = `
DO $$
DECLARE
  handbook_id integer;
BEGIN
  SELECT id INTO STRICT handbook_id FROM "medicalSource"
  WHERE parent_id IS NULL AND url='https://www.healthcare.uiowa.edu/';

  INSERT INTO "medicalSource" (parent_id,name,url,year,status,comment,metadata)
  SELECT handbook_id,entry.title,entry.url,entry.year,'REJECTED_LICENSE',
    'На проверенной странице не найдено отдельного разрешения на коммерческое использование и адаптацию. Справочник обозначен издателем как материал для сотрудников University of Iowa Health Care.',
    jsonb_build_object('publisher','University of Iowa Health Care',
      'licenseEvidenceUrl','https://www.healthcare.uiowa.edu/path_handbook/index.html')
  FROM (VALUES
    ('Magnesium (MG)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test1282.html', NULL),
    ('Ferritin (FRTN)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test793.html', NULL),
    ('Alkaline Phosphatase (ALP)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test1487.html', NULL),
    ('Hematocrit (Packed Cell Volume-PCV) (HCT)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test955.html', NULL),
    ('Hemoglobin (HB)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test960.html', NULL),
    ('Lipid Panel (LIPP)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test2064.html', NULL),
    ('Hemoglobin A1C (A1C)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test974.html', NULL),
    ('Basic Metabolic Panel W/Calcium (CHEM8) (BMP)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test2058.html', NULL),
    ('Aspartate Aminotransferase (AST with P5P) (AST)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test239.html', NULL),
    ('Transferrin (TRFN)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test1857.html', NULL),
    ('Urea Nitrogen (BUN)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test1889.html', NULL),
    ('Vitamin D, 25-Hydroxy (VITD25)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test2307.html', NULL),
    ('Uric Acid (URIC)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test1894.html', NULL),
    ('Chloride (CL)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test433.html', NULL),
    ('CBC (Complete Blood Count) (CBC)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test299.html', NULL),
    ('Phosphorus (PO4)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test1131.html', NULL),
    ('Iron Panel (IRON, TRANSFERRIN, TIBC and % SATURATION) (IRON)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test1151.html', NULL),
    ('Comprehensive Metabolic Panel (CMP)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test2060.html', NULL),
    ('Folate (FOLC)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test821.html', NULL),
    ('Triiodothyronine - Free (T-3) (FT3)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test843.html', NULL),
    ('Potassium (K)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test1535.html', NULL),
    ('Gamma-glutamyl transpeptidase (GGT)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test863.html', NULL),
    ('Glucose (GLU)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test883.html', NULL),
    ('Prolactin (PROL)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test1560.html', NULL),
    ('Sodium (NA)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test1728.html', NULL),
    ('C-Reactive Protein (CRP) (CRP)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test347.html', NULL),
    ('Urinalysis (UAS)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test2590.html', NULL),
    ('Calcium (Total) (CA)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test368.html', NULL),
    ('Cortisol (CORT)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test510.html', NULL),
    ('Creatinine (CRT)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test530.html', NULL),
    ('Alanine Aminotransferase (ALT with P5P) (ALT)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test71.html', NULL),
    ('Albumin (ALB)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test73.html', NULL),
    ('Vitamin B12 (B12)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test74.html', NULL),
    ('CBC with Automated Differential (CBC, DIFF)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test396.html', NULL),
    ('Insulin, Total (INSLT)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test2911.html', NULL),
    ('Thyroxine, Free by Equilibrium Dialysis (FT4D)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test2778.html', NULL),
    ('Urinalysis Microscopy (UAM)', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test3139.html', NULL),
    ('Changes to Reference Intervals for Ionized Calcium for Medical Center University (MCU), Medical Center North Liberty (MCNL), Medical Center Downtown (MCD), and Iowa River Landing', 'https://www.healthcare.uiowa.edu/path_handbook/lab_bulletins/bulletin_view.html?id=22', 2026),
    ('Changes to Reference Intervals for Parathyroid Hormone (PTH) for Medical Center University (MCU), Medical Center North Liberty (MCNL), and Iowa River Landing', 'https://www.healthcare.uiowa.edu/path_handbook/lab_bulletins/bulletin_view.html?id=12', 2025),
    ('Update to International Normalized Ratio (INR) Reference Interval', 'https://www.healthcare.uiowa.edu/path_handbook/lab_bulletins/archived/2023/LabBroadcast_8_1_23.html', 2023)
  ) AS entry(title,url,year)
  WHERE NOT EXISTS (
    SELECT 1 FROM "medicalSource" existing
    WHERE existing.parent_id=handbook_id AND lower(existing.url)=lower(entry.url)
  );

  IF EXISTS (SELECT 1 FROM "medicalSource" WHERE parent_id=handbook_id
    AND (status IS NULL OR status='PARTIAL')) THEN
    RAISE EXCEPTION 'Iowa handbook review has unresolved records';
  END IF;

  UPDATE "medicalSource" SET status='ANALYZED',
    comment='Завершена сверка открытого Laboratory Services Handbook: индекс 1322 карточек, оглавление приложений, текущие и архивные бюллетени 2020–2026 годов. Для профильной выборки не подтверждено разрешение на коммерческое использование и адаптацию. Результаты относятся к лабораторному справочнику University of Iowa Health Care.'
  WHERE id=handbook_id;
END $$;
`;
