export const NUTRITIONAL_BIOMARKER_CATALOG_SQL = `
DO $$
DECLARE
  unit_spec record;
  point_spec record;
  unit_code text;
  unit_id integer;
  point_id integer;
BEGIN
  FOR unit_spec IN SELECT * FROM (VALUES
    ('nmol/l', 'nmol/L', 'нмоль/л_nmol/l_nmol/L', 'molar-concentration'),
    ('mg/l', 'mg/L', 'мг/л_mg/l_мкг/мл_µg/mL_ug/mL', 'mass-concentration'),
    ('µg/dl', 'ug/dL', 'мкг/дл_µg/dL_ug/dL_mcg/dL', 'mass-concentration'),
    ('mg/g', 'mg/g', 'мг/г_mg/g_µg/mg_мкг/мг', 'mass-ratio'),
    ('mg/g creat', 'mg/g{creat}', 'мг/г креатинина_mg/g creatinine_mg/g creat', 'mass-ratio'),
    ('U/g Hb', 'U/g{Hb}', 'Ед/г Hb_Ед/г гемоглобина_U/g Hb_IU/g Hb_U/g hemoglobin', 'enzyme-activity-per-mass')
  ) AS v(name, code, aliases, quantity_kind)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM "analysisPointUnits" u WHERE u.code=unit_spec.code) THEN
      INSERT INTO "analysisPointUnits" (name,code,"translationParsing","quantityKind")
      VALUES (unit_spec.name,unit_spec.code,unit_spec.aliases,unit_spec.quantity_kind);
    END IF;
  END LOOP;

  FOR point_spec IN SELECT * FROM (VALUES
    ('serum-retinol', 'Ретинол в сыворотке', 'Serum retinol', 'umol/L,ug/L,mg/L,ug/dL', 'Ретинол_Витамин A (ретинол)_Витамин А (ретинол)_Ретинол сыворотки_Serum vitamin A_Vitamin A (retinol)_Retinol'),
    ('vitamin-d-25oh-total', '25-ОН витамин D общий', 'Total 25-hydroxyvitamin D', 'nmol/L,ng/mL', '25(OH)D_25-OH-D_25 OH vitamin D total_25 OH витамин D общий_25(OH)D total_25-ОН витамин Д общий_25-гидроксивитамин D общий_25-Hydroxyvitamin D Total_25(OH)D2 + 25(OH)D3'),
    ('alpha-tocopherol', 'Альфа-токоферол', 'Alpha-tocopherol', 'umol/L,mg/L,ug/dL', 'α-токоферол_Vitamin E (alpha-tocopherol)_Витамин E (альфа-токоферол)_Витамин Е (альфа-токоферол)_α-Tocopherol'),
    ('alpha-tocopherol-total-lipids-ratio', 'Отношение альфа-токоферола к общим липидам', 'Alpha-tocopherol to total lipids ratio', 'mg/g', 'α-токоферол / общие липиды_Альфа-токоферол/общие липиды_Alpha-tocopherol / total lipids_α-tocopherol/total lipids_Vitamin E/total lipids ratio'),
    ('thiamine-diphosphate-whole-blood', 'Тиаминдифосфат в цельной крови', 'Thiamine diphosphate in whole blood', 'nmol/L', 'ТДФ в цельной крови_Тиаминпирофосфат в цельной крови_Витамин B1 в цельной крови_Thiamine (Vitamin B1), Whole Blood_Whole blood TDP_Whole blood ThDP'),
    ('thiamine-diphosphate-erythrocytes', 'Тиаминдифосфат в эритроцитах', 'Erythrocyte thiamine diphosphate', 'nmol/L', 'ТДФ в эритроцитах_Тиаминпирофосфат в эритроцитах_Thiamine diphosphate in erythrocytes_Erythrocyte TDP_Erythrocyte ThDP_eThDP'),
    ('erythrocyte-transketolase-activity', 'Активность транскетолазы эритроцитов', 'Erythrocyte transketolase activity', 'U/g{Hb}', 'Активность эритроцитарной транскетолазы_Базальная активность транскетолазы эритроцитов_Эритроцитарная транскетолаза, активность_Basal erythrocyte transketolase activity_ETK basal activity'),
    ('erythrocyte-glutathione-reductase-activation', 'Коэффициент активации глутатионредуктазы эритроцитов', 'Erythrocyte glutathione reductase activation coefficient', '1', 'EGRAC_EGR AC_Коэффициент активации эритроцитарной глутатионредуктазы'),
    ('urine-n1-methylnicotinamide-creatinine', 'N¹-метилникотинамид мочи на грамм креатинина', 'Urinary N1-methylnicotinamide per gram creatinine', 'mg/g{creat}', 'N1-метилникотинамид/креатинин_N-метилникотинамид/креатинин_N1-methylnicotinamide/creatinine_Urinary N1-MNA/creatinine'),
    ('urine-2-pyridone-creatinine', '2-пиридон мочи на грамм креатинина', 'Urinary N1-methyl-2-pyridone-5-carboxamide per gram creatinine', 'mg/g{creat}', '2-пиридон/креатинин_2-Py/creatinine_Urinary 2-pyridone/creatinine_N1-methyl-2-pyridone-5-carboxamide/creatinine'),
    ('urine-2-pyridone-n1-mna-ratio', 'Отношение 2-пиридона к N¹-метилникотинамиду в моче', 'Urinary 2-pyridone to N1-methylnicotinamide ratio', '1', '2-пиридон/N1-метилникотинамид_2-Py/N1-MNA_2-Pyridone/N1-methylnicotinamide ratio'),
    ('serum-folate', 'Фолат в сыворотке', 'Serum folate', 'nmol/L,ng/mL', 'Фолат сыворотки_Фолиевая кислота в сыворотке_Витамин B9 в сыворотке_Folate, Serum_Folic acid, Serum'),
    ('erythrocyte-folate', 'Фолат в эритроцитах', 'Erythrocyte folate', 'nmol/L,ng/mL', 'Фолат эритроцитов_Эритроцитарный фолат_Фолиевая кислота в эритроцитах_RBC folate_Red blood cell folate_Folate, RBC'),
    ('plasma-total-homocysteine', 'Гомоцистеин общий в плазме', 'Plasma total homocysteine', 'umol/L', 'Гомоцистеин плазмы_Общий гомоцистеин в плазме_Гомоцистеин (плазма)_Homocysteine, Plasma_Total homocysteine, Plasma_Plasma tHcy'),
    ('serum-copper', 'Медь в сыворотке', 'Serum copper', 'umol/L,ug/L,ug/dL', 'Сывороточная медь_Медь сыворотки_Медь (сыворотка)_Copper, Serum_Cu, Serum'),
    ('serum-zinc', 'Цинк в сыворотке', 'Serum zinc', 'umol/L,ug/L,ug/dL', 'Сывороточный цинк_Цинк сыворотки_Цинк (сыворотка)_Zinc, Serum_Zn, Serum'),
    ('urine-iodine-concentration', 'Концентрация йода в моче', 'Urinary iodine concentration', 'ug/L,umol/L', 'Йод в моче_Йод мочи_Йод (моча)_Iodine, Urine_Urine iodine_Йодурия, концентрация'),
    ('serum-selenium', 'Селен в сыворотке', 'Serum selenium', 'ug/L,umol/L,ug/dL', 'Сывороточный селен_Селен сыворотки_Селен (сыворотка)_Selenium, Serum_Se, Serum'),
    ('selenoprotein-p', 'Селенопротеин P', 'Selenoprotein P', 'mg/L', 'Селенопротеин Р_Селенопротеин П_SELENOP_SePP'),
    ('erythrocyte-glutathione-peroxidase-activity', 'Активность глутатионпероксидазы эритроцитов', 'Erythrocyte glutathione peroxidase activity', 'U/g{Hb}', 'Активность эритроцитарной глутатионпероксидазы_Эритроцитарная глутатионпероксидаза, активность_Глутатионпероксидаза эритроцитов_Erythrocyte GPx_RBC GPx activity')
  ) AS v(key, ru, en, unit_codes, aliases)
  LOOP
    INSERT INTO "analysisPoint" (name,"translationRu","translationEn","translationParsing")
    VALUES (point_spec.key,point_spec.ru,point_spec.en,point_spec.aliases)
    RETURNING id INTO point_id;
    INSERT INTO translation (lang,namespace,module,submodule,value) VALUES
      ('ru','entities','analysisPoint',point_spec.key,point_spec.ru),
      ('en','entities','analysisPoint',point_spec.key,point_spec.en);

    FOREACH unit_code IN ARRAY string_to_array(point_spec.unit_codes, ',')
    LOOP
      SELECT u.id INTO STRICT unit_id FROM "analysisPointUnits" u WHERE u.code=unit_code;
      INSERT INTO analysis_point_units ("pointId","unitsId") VALUES (point_id,unit_id);
    END LOOP;
  END LOOP;
END $$;
`;
