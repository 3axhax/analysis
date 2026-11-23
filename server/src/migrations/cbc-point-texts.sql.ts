export const CBC_POINT_TEXTS_SQL = `
CREATE TEMP TABLE cbc_point_texts (
  name text PRIMARY KEY,
  hint_ru text NOT NULL,
  hint_en text NOT NULL,
  description_ru text NOT NULL,
  description_en text NOT NULL
) ON COMMIT DROP;

INSERT INTO cbc_point_texts VALUES
  ('hemoglobin', 'Концентрация гемоглобина — белка эритроцитов, который переносит кислород.', 'The concentration of hemoglobin, the oxygen-carrying protein in red blood cells.', 'Гемоглобин состоит из белковых цепей и групп гема, содержащих железо. Железо гема обратимо связывает кислород: гемоглобин присоединяет его в лёгких и отдаёт в тканях. Анализ показывает, сколько гемоглобина содержится в единице объёма цельной крови.

Источники
https://nutritionalassessment.org/iron/', 'Hemoglobin consists of protein chains and iron-containing heme groups. Heme iron binds oxygen reversibly, allowing hemoglobin to pick up oxygen in the lungs and release it in tissues. The test measures how much hemoglobin is present per unit volume of whole blood.

Sources
https://nutritionalassessment.org/iron/'),
  ('erythrocyte', 'Число эритроцитов в единице объёма крови. Эти клетки переносят кислород.', 'The number of red blood cells per unit volume of blood. These cells carry oxygen.', 'Эритроциты образуются в костном мозге и содержат гемоглобин, с помощью которого доставляют кислород от лёгких к тканям. RBC показывает концентрацию самих клеток в крови. Содержание гемоглобина в одной клетке описывает отдельный показатель — MCH.

Источники
https://nutritionalassessment.org/iron/
https://doi.org/10.37489/2949-1924-0072', 'Red blood cells are produced in the bone marrow and contain hemoglobin, which carries oxygen from the lungs to tissues. RBC counts the cells per unit volume of blood. A separate index, MCH, describes how much hemoglobin an average cell contains.

Sources
https://nutritionalassessment.org/iron/
https://doi.org/10.37489/2949-1924-0072'),
  ('hematocrit', 'Доля объёма цельной крови, которую занимают эритроциты.', 'The fraction of whole blood volume occupied by red blood cells.', 'Гематокрит показывает, какую часть общего объёма крови занимают эритроциты. Эта доля зависит и от количества клеток в единице объёма, и от их среднего размера. Поэтому одинаковое число эритроцитов может соответствовать разному гематокриту.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.37489/2949-1924-0072', 'Hematocrit is the proportion of the sample’s volume occupied by red blood cells. It depends on both the number of cells per unit volume and their average size. Samples with the same red blood cell count can therefore have different hematocrits.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.37489/2949-1924-0072'),
  ('mcv', 'Средний объём одного эритроцита.', 'The average volume of a red blood cell.', 'MCV характеризует размер эритроцитов и выражается в фемтолитрах. Это среднее значение по измеренным клеткам. Если в образце есть разные по размеру эритроциты, средний объём не показывает, насколько сильно их размеры различаются. Разброс описывают показатели RDW.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.1186/s12887-021-02709-w', 'MCV describes red blood cell size and is reported in femtoliters. It is an average across the measured cells. If the cells vary in size, their average volume does not show how wide that variation is. RDW indices describe the spread.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.1186/s12887-021-02709-w'),
  ('mch', 'Средняя масса гемоглобина в одном эритроците.', 'The average mass of hemoglobin in a red blood cell.', 'MCH показывает, сколько гемоглобина содержит один эритроцит в среднем. Индекс получают из концентрации гемоглобина в цельной крови и числа эритроцитов в том же объёме. Результат выражают в пикограммах на клетку.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.37489/2949-1924-0072', 'MCH describes how much hemoglobin the average red blood cell contains. It is calculated from the hemoglobin concentration in whole blood and the number of red blood cells in the same volume. The result is reported in picograms per cell.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.37489/2949-1924-0072'),
  ('mchc', 'Средняя концентрация гемоглобина в объёме, занятом эритроцитами.', 'The average concentration of hemoglobin in the volume occupied by red blood cells.', 'MCHC показывает, насколько плотно гемоглобином заполнен суммарный объём эритроцитов. Для расчёта концентрацию гемоглобина в цельной крови делят на гематокрит, выраженный долей. MCH описывает массу на клетку, а MCHC — концентрацию в объёме клеток.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'MCHC describes how concentrated hemoglobin is within the combined volume of red blood cells. It is calculated by dividing the whole-blood hemoglobin concentration by hematocrit expressed as a fraction. MCH describes mass per cell, while MCHC describes concentration within the cells.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('rdw', 'Относительный разброс эритроцитов по объёму, выраженный в процентах.', 'The relative spread of red blood cell volumes, expressed as a percentage.', 'Анализатор строит распределение эритроцитов по объёму. RDW-CV выражает разброс размеров относительно характерного размера клеток. При одинаковом среднем объёме эритроцитов один образец может содержать клетки сходного размера, а другой — смесь более мелких и более крупных клеток.

Источники
https://www.mindray.com/en/services/support-faq/hematology
https://doi.org/10.37489/2949-1924-0072', 'The analyzer builds a distribution of red blood cell volumes. RDW-CV expresses the spread of cell sizes relative to their typical size. Two samples can have the same average red blood cell volume even if one contains similarly sized cells and the other contains a mix of smaller and larger cells.

Sources
https://www.mindray.com/en/services/support-faq/hematology
https://doi.org/10.37489/2949-1924-0072'),
  ('rdw-sd', 'Ширина распределения эритроцитов по объёму, выраженная в фемтолитрах.', 'The width of the red blood cell volume distribution, expressed in femtoliters.', 'RDW-SD описывает абсолютный разброс объёмов эритроцитов на гистограмме анализатора. Прибор определяет ширину распределения по своей методике и выражает результат в фемтолитрах. RDW-CV описывает относительный разброс и выводится в процентах.

Источники
https://www.mindray.com/en/services/support-faq/hematology
https://doi.org/10.37489/2949-1924-0072', 'RDW-SD describes the absolute spread of red blood cell volumes on the analyzer’s histogram. The instrument determines the width using its own method and reports the result in femtoliters. RDW-CV describes relative spread and is reported as a percentage.

Sources
https://www.mindray.com/en/services/support-faq/hematology
https://doi.org/10.37489/2949-1924-0072'),
  ('platelets', 'Число тромбоцитов в единице объёма крови. Они участвуют в остановке кровотечения.', 'The number of platelets per unit volume of blood. Platelets help stop bleeding.', 'При повреждении сосудистой стенки тромбоциты прикрепляются к участку повреждения, активируются и сцепляются друг с другом. Так формируется первичная тромбоцитарная пробка. Показатель PLT описывает, сколько тромбоцитов циркулирует в единице объёма крови.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/
https://pubmed.ncbi.nlm.nih.gov/9373252/', 'When a blood vessel is injured, platelets attach at the injury site, become activated, and stick to one another. This forms an initial platelet plug. PLT reports how many platelets are circulating per unit volume of blood.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/
https://pubmed.ncbi.nlm.nih.gov/9373252/'),
  ('mpv', 'Средний объём одного тромбоцита.', 'The average volume of a platelet.', 'MPV показывает средний размер циркулирующих тромбоцитов и выражается в фемтолитрах. Анализатор определяет его по распределению измеренных тромбоцитов по объёму. PLT отражает число тромбоцитов, а MPV — их средний объём.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/
https://moodle.fondation-merieux.org/pluginfile.php/5030/mod_resource/content/1/BC-2800%20Mindray_User%20Manual.pdf', 'MPV is the average size of circulating platelets, reported in femtoliters. The analyzer derives it from the measured distribution of platelet volumes. PLT describes how many platelets there are, while MPV describes their average volume.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/
https://moodle.fondation-merieux.org/pluginfile.php/5030/mod_resource/content/1/BC-2800%20Mindray_User%20Manual.pdf'),
  ('reticulocytes', 'Ретикулоциты — незрелые эритроциты. Их количество отражает образование новых эритроцитов костным мозгом.', 'Reticulocytes are immature red blood cells. Their count reflects the bone marrow’s production of new red blood cells.', 'Ретикулоциты образуются в костном мозге и завершают созревание после выхода в кровоток. Подсчёт ретикулоцитов помогает оценить, сколько новых эритроцитов поступает в кровь. Лаборатории могут указывать результат как абсолютное число или как долю эритроцитов.

Источники
https://medlineplus.gov/lab-tests/reticulocyte-count/', 'Reticulocytes develop in the bone marrow and finish maturing after entering the bloodstream. A reticulocyte count helps estimate how many new red blood cells are entering circulation. Laboratories may report an absolute count or a percentage of red blood cells.

Sources
https://medlineplus.gov/lab-tests/reticulocyte-count/'),
  ('leukocytes', 'Суммарное число лейкоцитов в единице объёма крови.', 'The total number of white blood cells per unit volume of blood.', 'Лейкоциты — клетки иммунной системы. К ним относятся нейтрофилы, лимфоциты, моноциты, эозинофилы и базофилы. WBC показывает их суммарное количество в крови, а лейкоцитарная формула описывает вклад разных типов клеток.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'White blood cells are immune cells. They include neutrophils, lymphocytes, monocytes, eosinophils, and basophils. WBC measures their total number per unit volume of blood, while the differential describes the contribution of the individual cell types.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('neutrophil-count', 'Абсолютное число нейтрофилов в единице объёма крови.', 'The absolute number of neutrophils per unit volume of blood.', 'Абсолютное число нейтрофилов показывает их количество в единице объёма крови. Нейтрофилы относятся к клеткам врождённого иммунитета. Они мигрируют из крови к очагу воспаления, захватывают микроорганизмы и разрушают их.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute neutrophil count measures the number of these cells per unit volume of blood. Neutrophils are part of innate immunity. They move from the bloodstream to sites of inflammation, where they engulf and destroy microorganisms.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('neutrophil-percentage', 'Доля нейтрофилов среди всех лейкоцитов, выраженная в процентах.', 'The percentage of white blood cells that are neutrophils.', 'Показатель сравнивает число нейтрофилов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе нейтрофилов. Нейтрофилы относятся к клеткам врождённого иммунитета. Они мигрируют из крови к очагу воспаления, захватывают микроорганизмы и разрушают их.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of neutrophils with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. Neutrophils are part of innate immunity. They move from the bloodstream to sites of inflammation, where they engulf and destroy microorganisms.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('lymphocyte-count', 'Абсолютное число лимфоцитов в единице объёма крови.', 'The absolute number of lymphocytes per unit volume of blood.', 'Абсолютное число лимфоцитов показывает их количество в единице объёма крови. В-лимфоциты могут превращаться в клетки, которые вырабатывают антитела. Т-лимфоциты координируют иммунный ответ или уничтожают заражённые клетки, а NK-клетки участвуют в ранней защите.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute lymphocyte count measures the number of these cells per unit volume of blood. B lymphocytes can develop into antibody-producing cells. T lymphocytes coordinate the immune response or kill infected cells, while natural killer cells contribute to early defense.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('lymphocyte-percentage', 'Доля лимфоцитов среди всех лейкоцитов, выраженная в процентах.', 'The percentage of white blood cells that are lymphocytes.', 'Показатель сравнивает число лимфоцитов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе лимфоцитов. В-лимфоциты могут превращаться в клетки, которые вырабатывают антитела. Т-лимфоциты координируют иммунный ответ или уничтожают заражённые клетки, а NK-клетки участвуют в ранней защите.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of lymphocytes with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. B lymphocytes can develop into antibody-producing cells. T lymphocytes coordinate the immune response or kill infected cells, while natural killer cells contribute to early defense.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('monocyte-count', 'Абсолютное число моноцитов в единице объёма крови.', 'The absolute number of monocytes per unit volume of blood.', 'Абсолютное число моноцитов показывает их количество в единице объёма крови. Моноциты циркулируют в крови и могут переходить в ткани, где часть из них превращается в макрофаги. Эти клетки поглощают микроорганизмы и клеточные остатки и участвуют в иммунном ответе.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute monocyte count measures the number of these cells per unit volume of blood. Monocytes circulate in the blood and can move into tissues, where some develop into macrophages. These cells take up microorganisms and cellular debris and contribute to the immune response.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('monocyte-percentage', 'Доля моноцитов среди всех лейкоцитов, выраженная в процентах.', 'The percentage of white blood cells that are monocytes.', 'Показатель сравнивает число моноцитов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе моноцитов. Моноциты циркулируют в крови и могут переходить в ткани, где часть из них превращается в макрофаги. Эти клетки поглощают микроорганизмы и клеточные остатки и участвуют в иммунном ответе.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of monocytes with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. Monocytes circulate in the blood and can move into tissues, where some develop into macrophages. These cells take up microorganisms and cellular debris and contribute to the immune response.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('eosinophil-count', 'Абсолютное число эозинофилов в единице объёма крови.', 'The absolute number of eosinophils per unit volume of blood.', 'Абсолютное число эозинофилов показывает их количество в единице объёма крови. Эозинофилы относятся к гранулоцитам. При активации они выделяют вещества из внутриклеточных гранул. Эти клетки участвуют в иммунных реакциях на паразитов и в аллергическом воспалении.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute eosinophil count measures the number of these cells per unit volume of blood. Eosinophils are granulocytes. When activated, they release substances from granules inside the cell. They participate in immune responses to parasites and in allergic inflammation.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('eosinophil-percentage', 'Доля эозинофилов среди всех лейкоцитов, выраженная в процентах.', 'The percentage of white blood cells that are eosinophils.', 'Показатель сравнивает число эозинофилов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе эозинофилов. Эозинофилы относятся к гранулоцитам. При активации они выделяют вещества из внутриклеточных гранул. Эти клетки участвуют в иммунных реакциях на паразитов и в аллергическом воспалении.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of eosinophils with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. Eosinophils are granulocytes. When activated, they release substances from granules inside the cell. They participate in immune responses to parasites and in allergic inflammation.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('basophil-count', 'Абсолютное число базофилов в единице объёма крови.', 'The absolute number of basophils per unit volume of blood.', 'Абсолютное число базофилов показывает их количество в единице объёма крови. Базофилы относятся к гранулоцитам. При активации они высвобождают гистамин и другие вещества, которые участвуют в воспалительной реакции. Базофилы играют роль в аллергических реакциях.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute basophil count measures the number of these cells per unit volume of blood. Basophils are granulocytes. When activated, they release histamine and other substances that contribute to inflammation. Basophils play a role in allergic reactions.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('basophil-percentage', 'Доля базофилов среди всех лейкоцитов, выраженная в процентах.', 'The percentage of white blood cells that are basophils.', 'Показатель сравнивает число базофилов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе базофилов. Базофилы относятся к гранулоцитам. При активации они высвобождают гистамин и другие вещества, которые участвуют в воспалительной реакции. Базофилы играют роль в аллергических реакциях.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of basophils with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. Basophils are granulocytes. When activated, they release histamine and other substances that contribute to inflammation. Basophils play a role in allergic reactions.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('nlr', 'Отношение абсолютного числа нейтрофилов к абсолютному числу лимфоцитов.', 'The ratio of the absolute neutrophil count to the absolute lymphocyte count.', 'NLR рассчитывают, деля абсолютное число нейтрофилов на абсолютное число лимфоцитов, выраженные в одинаковых единицах. Результат показывает, сколько нейтрофилов приходится на один лимфоцит. Значение зависит от обеих величин, поэтому одинаковое отношение возможно при разных абсолютных числах клеток.

Источники
https://doi.org/10.1186/s12865-025-00797-2', 'NLR is calculated by dividing the absolute neutrophil count by the absolute lymphocyte count, using the same units for both. The result expresses how many neutrophils there are per lymphocyte. It depends on both counts, so different absolute counts can produce the same ratio.

Sources
https://doi.org/10.1186/s12865-025-00797-2'),
  ('esr', 'Показатель того, как быстро эритроциты оседают в образце крови.', 'A measure of how quickly red blood cells settle in a blood sample.', 'В методе Вестергрена образец крови с антикоагулянтом оставляют в вертикальной трубке. Эритроциты оседают, оставляя сверху слой плазмы. Через час измеряют высоту этого слоя. Склонность эритроцитов собираться в агрегаты влияет на оседание. В этом процессе участвуют белки плазмы, в том числе фибриноген.

Источники
https://onlinelibrary.wiley.com/doi/full/10.1111/j.1751-553X.2011.01302.x
https://pubmed.ncbi.nlm.nih.gov/15559996/', 'In the Westergren method, anticoagulated blood is left in a vertical tube. The red blood cells settle, leaving a layer of plasma above them. The height of that layer is measured after one hour. The tendency of red blood cells to form aggregates affects settling. Plasma proteins, including fibrinogen, contribute to this process.

Sources
https://onlinelibrary.wiley.com/doi/full/10.1111/j.1751-553X.2011.01302.x
https://pubmed.ncbi.nlm.nih.gov/15559996/');

DO $$
BEGIN
  IF (
    SELECT count(*) FROM cbc_point_texts s
    JOIN "analysisPoint" p USING (name)
    JOIN analysis_type_point j ON j."pointId" = p.id
    JOIN "analysisType" t ON t.id = j."typeId"
    WHERE t.name = 'general_blood_test'
  ) <> 24 THEN
    RAISE EXCEPTION 'Unexpected CBC catalog membership for point text migration';
  END IF;
END $$;

UPDATE "analysisPoint" p
SET "pointHintRu" = s.hint_ru, "pointHintEn" = s.hint_en,
    "pointDescriptionRu" = s.description_ru, "pointDescriptionEn" = s.description_en
FROM cbc_point_texts s
WHERE p.name = s.name;
`;
