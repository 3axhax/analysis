# Справочник дополнительных нутриционных показателей

Миграция 0074 добавляет 20 показателей, русские и английские названия, допустимые единицы и фразы распознавания. Для каждого материала, измеряемой величины и знаменателя используется своя запись. Выбор названий сверяли с [LOINC для ретинола](https://loinc.org/2923-1), [LOINC для суммарного 25(OH)D](https://loinc.org/83071-1) и [каталогом Mayo для тиаминдифосфата цельной крови](https://www.mayocliniclabs.com/test-catalog/Overview/42356). Для ферментных активностей в пересчёте на гемоглобин сверены отдельные методы [транскетолазы](https://doi.org/10.1177/000456328702400106) и [глутатионпероксидазы](https://pmc.ncbi.nlm.nih.gov/articles/PMC11351941/). Для витамина E зарегистрировано явно указанное [отношение к сумме липидов](https://doi.org/10.1177/000456328602300505). Отношение к общему холестерину или другому знаменателю к нему не привязывается.

| Показатель | English | Единицы | Фразы распознавания |
| --- | --- | --- | --- |
| Ретинол в сыворотке | Serum retinol | `umol/L`, `ug/L`, `mg/L`, `ug/dL` | Ретинол · Витамин A (ретинол) · Витамин А (ретинол) · Ретинол сыворотки · Serum vitamin A · Vitamin A (retinol) · Retinol |
| 25-ОН витамин D общий | Total 25-hydroxyvitamin D | `nmol/L`, `ng/mL` | 25(OH)D · 25-OH-D · 25 OH vitamin D total · 25 OH витамин D общий · 25(OH)D total · 25-ОН витамин Д общий · 25-гидроксивитамин D общий · 25-Hydroxyvitamin D Total · 25(OH)D2 + 25(OH)D3 |
| Альфа-токоферол | Alpha-tocopherol | `umol/L`, `mg/L`, `ug/dL` | α-токоферол · Vitamin E (alpha-tocopherol) · Витамин E (альфа-токоферол) · Витамин Е (альфа-токоферол) · α-Tocopherol |
| Отношение альфа-токоферола к общим липидам | Alpha-tocopherol to total lipids ratio | `mg/g` | α-токоферол / общие липиды · Альфа-токоферол/общие липиды · Alpha-tocopherol / total lipids · α-tocopherol/total lipids · Vitamin E/total lipids ratio |
| Тиаминдифосфат в цельной крови | Thiamine diphosphate in whole blood | `nmol/L` | ТДФ в цельной крови · Тиаминпирофосфат в цельной крови · Витамин B1 в цельной крови · Thiamine (Vitamin B1), Whole Blood · Whole blood TDP · Whole blood ThDP |
| Тиаминдифосфат в эритроцитах | Erythrocyte thiamine diphosphate | `nmol/L` | ТДФ в эритроцитах · Тиаминпирофосфат в эритроцитах · Thiamine diphosphate in erythrocytes · Erythrocyte TDP · Erythrocyte ThDP · eThDP |
| Активность транскетолазы эритроцитов | Erythrocyte transketolase activity | `U/g{Hb}` | Активность эритроцитарной транскетолазы · Базальная активность транскетолазы эритроцитов · Эритроцитарная транскетолаза, активность · Basal erythrocyte transketolase activity · ETK basal activity |
| Коэффициент активации глутатионредуктазы эритроцитов | Erythrocyte glutathione reductase activation coefficient | `1` | EGRAC · EGR AC · Коэффициент активации эритроцитарной глутатионредуктазы |
| N¹-метилникотинамид мочи на грамм креатинина | Urinary N1-methylnicotinamide per gram creatinine | `mg/g{creat}` | N1-метилникотинамид/креатинин · N-метилникотинамид/креатинин · N1-methylnicotinamide/creatinine · Urinary N1-MNA/creatinine |
| 2-пиридон мочи на грамм креатинина | Urinary N1-methyl-2-pyridone-5-carboxamide per gram creatinine | `mg/g{creat}` | 2-пиридон/креатинин · 2-Py/creatinine · Urinary 2-pyridone/creatinine · N1-methyl-2-pyridone-5-carboxamide/creatinine |
| Отношение 2-пиридона к N¹-метилникотинамиду в моче | Urinary 2-pyridone to N1-methylnicotinamide ratio | `1` | 2-пиридон/N1-метилникотинамид · 2-Py/N1-MNA · 2-Pyridone/N1-methylnicotinamide ratio |
| Фолат в сыворотке | Serum folate | `nmol/L`, `ng/mL` | Фолат сыворотки · Фолиевая кислота в сыворотке · Витамин B9 в сыворотке · Folate, Serum · Folic acid, Serum |
| Фолат в эритроцитах | Erythrocyte folate | `nmol/L`, `ng/mL` | Фолат эритроцитов · Эритроцитарный фолат · Фолиевая кислота в эритроцитах · RBC folate · Red blood cell folate · Folate, RBC |
| Гомоцистеин общий в плазме | Plasma total homocysteine | `umol/L` | Гомоцистеин плазмы · Общий гомоцистеин в плазме · Гомоцистеин (плазма) · Homocysteine, Plasma · Total homocysteine, Plasma · Plasma tHcy |
| Медь в сыворотке | Serum copper | `umol/L`, `ug/L`, `ug/dL` | Сывороточная медь · Медь сыворотки · Медь (сыворотка) · Copper, Serum · Cu, Serum |
| Цинк в сыворотке | Serum zinc | `umol/L`, `ug/L`, `ug/dL` | Сывороточный цинк · Цинк сыворотки · Цинк (сыворотка) · Zinc, Serum · Zn, Serum |
| Концентрация йода в моче | Urinary iodine concentration | `ug/L`, `umol/L` | Йод в моче · Йод мочи · Йод (моча) · Iodine, Urine · Urine iodine · Йодурия, концентрация |
| Селен в сыворотке | Serum selenium | `ug/L`, `umol/L`, `ug/dL` | Сывороточный селен · Селен сыворотки · Селен (сыворотка) · Selenium, Serum · Se, Serum |
| Селенопротеин P | Selenoprotein P | `mg/L` | Селенопротеин Р · Селенопротеин П · SELENOP · SePP |
| Активность глутатионпероксидазы эритроцитов | Erythrocyte glutathione peroxidase activity | `U/g{Hb}` | Активность эритроцитарной глутатионпероксидазы · Эритроцитарная глутатионпероксидаза, активность · Глутатионпероксидаза эритроцитов · Erythrocyte GPx · RBC GPx activity |

Неоднозначные сокращения без материала, например TDP и Cu, не назначают анализ. Для мочевых метаболитов выбрана форма на грамм креатинина; концентрации и суточную экскрецию она не подменяет. Для EGRAC и отношения 2-пиридона к N¹-метилникотинамиду используется безразмерная величина. Источники или нормы для новых показателей не создавались. Референсы и карточки предыдущих миграций сохраняются.

Пробная транзакция откатилась. Локально подтверждены маркер миграции, 20 показателей, 40 переводов, 35 связей с единицами и отсутствие новых интервалов для этих показателей. Проверены 104 фразы в индексе с полным локальным справочником и сохранение всех 20 показателей через публичный API на одном синтетическом результате. Для строк `RBC folate`, `Folate, RBC` и `RBC GPx activity` тест подтверждает, что RBC обозначает материал и не выбирает число эритроцитов.

Прошли 476 серверных тестов, проверка TypeScript и сборка клиента.
