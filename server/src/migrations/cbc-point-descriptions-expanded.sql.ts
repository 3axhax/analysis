export const CBC_POINT_DESCRIPTIONS_EXPANDED_SQL = `
CREATE TEMP TABLE cbc_expanded_descriptions (
  name text PRIMARY KEY,
  description_ru text NOT NULL,
  description_en text NOT NULL
) ON COMMIT DROP;

INSERT INTO cbc_expanded_descriptions VALUES
  ('hemoglobin', 'Гемоглобин состоит из белковых цепей и групп гема, содержащих железо. Железо гема обратимо связывает кислород: гемоглобин присоединяет его в лёгких и отдаёт в тканях. Анализ показывает, сколько гемоглобина содержится в единице объёма цельной крови.

В одной молекуле гемоглобина четыре группы гема, и каждая может связать одну молекулу кислорода. Анализ измеряет концентрацию самого белка. Доля гемоглобина, связанного с кислородом, — отдельная величина, которую называют насыщением кислородом.

Источники
https://nutritionalassessment.org/iron/
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes', 'Hemoglobin consists of protein chains and iron-containing heme groups. Heme iron binds oxygen reversibly, allowing hemoglobin to pick up oxygen in the lungs and release it in tissues. The test measures how much hemoglobin is present per unit volume of whole blood.

A hemoglobin molecule has four heme groups, each of which can bind one oxygen molecule. This test measures the concentration of the protein itself. The fraction of hemoglobin carrying oxygen is a separate quantity called oxygen saturation.

Sources
https://nutritionalassessment.org/iron/
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes'),
  ('erythrocyte', 'Эритроциты образуются в костном мозге и содержат гемоглобин, с помощью которого доставляют кислород от лёгких к тканям. RBC показывает концентрацию самих клеток в крови. Содержание гемоглобина в одной клетке описывает отдельный показатель — MCH.

Зрелый эритроцит имеет форму двояковогнутого диска. За счёт этой формы у него относительно большая поверхность для газообмена, а гибкая клетка может менять форму, проходя через узкие капилляры. Подсчёт RBC учитывает клетки поштучно и сам по себе не описывает их форму или размер.

Источники
https://nutritionalassessment.org/iron/
https://doi.org/10.37489/2949-1924-0072
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes', 'Red blood cells are produced in the bone marrow and contain hemoglobin, which carries oxygen from the lungs to tissues. RBC counts the cells per unit volume of blood. A separate index, MCH, describes how much hemoglobin an average cell contains.

A mature red blood cell is shaped like a biconcave disc. This gives it a relatively large surface for gas exchange, and the flexible cell can change shape as it passes through narrow capillaries. RBC is a count and does not describe the cells’ shape or size.

Sources
https://nutritionalassessment.org/iron/
https://doi.org/10.37489/2949-1924-0072
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes'),
  ('hematocrit', 'Гематокрит показывает, какую часть общего объёма крови занимают эритроциты. Эта доля зависит и от количества клеток в единице объёма, и от их среднего размера. Поэтому одинаковое число эритроцитов может соответствовать разному гематокриту.

На анализаторе гематокрит может рассчитываться по числу эритроцитов и их среднему объёму. Показатель можно выразить в процентах или долей единицы. Доля используется, например, при пересчёте концентрации гемоглобина в цельной крови в концентрацию в суммарном объёме эритроцитов (MCHC).

Источники
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.37489/2949-1924-0072', 'Hematocrit is the proportion of the sample’s volume occupied by red blood cells. It depends on both the number of cells per unit volume and their average size. Samples with the same red blood cell count can therefore have different hematocrits.

An analyzer can calculate hematocrit from the red blood cell count and average cell volume. The result can be expressed as a percentage or as a fraction. The fraction can be used to convert whole-blood hemoglobin concentration to the concentration in the combined red blood cell volume (MCHC).

Sources
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.37489/2949-1924-0072'),
  ('mcv', 'MCV характеризует размер эритроцитов и выражается в фемтолитрах. Это среднее значение по измеренным клеткам.

На гистограмме объёмов видны не только типичные размеры клеток, но и то, как измерения распределены вокруг них. Если в образце одновременно есть группы более мелких и более крупных клеток, их объёмы усредняются в одном MCV. Чтобы понять, насколько однородны размеры, нужны сведения о распределении, например RDW.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.1186/s12887-021-02709-w', 'MCV describes red blood cell size and is reported in femtoliters. It is an average across the measured cells.

A volume histogram shows typical cell sizes and how measurements are distributed around them. If the sample contains groups of smaller and larger cells, both contribute to a single MCV. To see how uniform the sizes are, information about the distribution, such as RDW, is needed.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.1186/s12887-021-02709-w'),
  ('mch', 'MCH показывает, сколько гемоглобина содержит один эритроцит в среднем. Индекс получают из концентрации гемоглобина в цельной крови и числа эритроцитов в том же объёме. Результат выражают в пикограммах на клетку.

Масса гемоглобина на клетку зависит от объёма эритроцита и от концентрации гемоглобина в этом объёме. При одинаковой концентрации более крупная клетка может содержать больше гемоглобина по массе. Поэтому MCH отвечает на вопрос о количестве белка в клетке, а MCHC — о его концентрации.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.37489/2949-1924-0072', 'MCH describes how much hemoglobin the average red blood cell contains. It is calculated from the hemoglobin concentration in whole blood and the number of red blood cells in the same volume. The result is reported in picograms per cell.

The mass of hemoglobin per cell depends on the red cell’s volume and the hemoglobin concentration within it. At the same concentration, a larger cell can contain a greater mass of hemoglobin. MCH therefore describes how much hemoglobin a cell contains, while MCHC describes its concentration.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.37489/2949-1924-0072'),
  ('mchc', 'MCHC показывает, насколько плотно гемоглобином заполнен суммарный объём эритроцитов. Для расчёта концентрацию гемоглобина в цельной крови делят на гематокрит, выраженный долей. MCH описывает массу на клетку, а MCHC — концентрацию в объёме клеток.

Размер клетки помогает понять разницу между этими индексами. Небольшой эритроцит может содержать меньше гемоглобина по массе, чем крупный, при той же концентрации внутри клетки. Поскольку MCHC рассчитывают по суммарному объёму эритроцитов в образце, по нему нельзя увидеть, как концентрация различается от клетки к клетке.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'MCHC describes how concentrated hemoglobin is within the combined volume of red blood cells. It is calculated by dividing the whole-blood hemoglobin concentration by hematocrit expressed as a fraction. MCH describes mass per cell, while MCHC describes concentration within the cells.

Cell size helps explain the difference between these indices. A small red blood cell can contain a smaller mass of hemoglobin than a larger one while having the same concentration inside the cell. Because MCHC is calculated for the combined red blood cell volume in the sample, it does not show how the concentration varies from cell to cell.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('rdw', 'Анализатор строит распределение эритроцитов по объёму. RDW-CV выражает разброс размеров относительно характерного размера клеток. При одинаковом среднем объёме эритроцитов один образец может содержать клетки сходного размера, а другой — смесь более мелких и более крупных клеток.

На гистограмме по горизонтали отложен объём клетки, а по вертикали — частота клеток такого объёма. RDW-CV сводит сведения о ширине этого распределения к одному процентному значению. Само число не показывает, получился ли широкий профиль из-за плавного разброса размеров или из-за нескольких групп клеток разного объёма.

Источники
https://www.mindray.com/en/services/support-faq/hematology
https://doi.org/10.37489/2949-1924-0072', 'The analyzer builds a distribution of red blood cell volumes. RDW-CV expresses the spread of cell sizes relative to their typical size. Two samples can have the same average red blood cell volume even if one contains similarly sized cells and the other contains a mix of smaller and larger cells.

On the histogram, the horizontal axis represents cell volume and the vertical axis shows the frequency of cells of that volume. RDW-CV summarizes the width of this distribution as a single percentage. The number alone does not show whether the broad profile reflects a continuous spread of sizes or several groups of cells with different volumes.

Sources
https://www.mindray.com/en/services/support-faq/hematology
https://doi.org/10.37489/2949-1924-0072'),
  ('rdw-sd', 'RDW-SD описывает абсолютный разброс объёмов эритроцитов на гистограмме анализатора. Прибор определяет ширину распределения по своей методике и выражает результат в фемтолитрах. RDW-CV описывает относительный разброс и выводится в процентах.

На гистограмме два края выбранного сечения соответствуют двум объёмам. Расстояние между ними по оси объёма и даёт ширину в фемтолитрах. Высота, на которой прибор измеряет ширину, зависит от его методики, а само число не описывает форму всей кривой.

Источники
https://www.mindray.com/en/services/support-faq/hematology
https://doi.org/10.37489/2949-1924-0072', 'RDW-SD describes the absolute spread of red blood cell volumes on the analyzer’s histogram. The instrument determines the width using its own method and reports the result in femtoliters. RDW-CV describes relative spread and is reported as a percentage.

The two edges of a selected cross-section of the histogram correspond to two cell volumes. Their distance along the volume axis gives the width in femtoliters. The height at which the analyzer measures the width depends on its method, and the resulting number does not describe the shape of the whole curve.

Sources
https://www.mindray.com/en/services/support-faq/hematology
https://doi.org/10.37489/2949-1924-0072'),
  ('platelets', 'При повреждении сосудистой стенки тромбоциты прикрепляются к участку повреждения, активируются и сцепляются друг с другом. Так формируется первичная тромбоцитарная пробка. Показатель PLT описывает, сколько тромбоцитов циркулирует в единице объёма крови.

Тромбоциты образуются в костном мозге из фрагментов крупных клеток — мегакариоцитов. В крови они циркулируют до активации. PLT описывает количество этих частиц в образце, тогда как прикрепление к повреждённой стенке и образование пробки зависят от их работы.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/
https://pubmed.ncbi.nlm.nih.gov/9373252/
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-4-leukocytes-and-platelets', 'When a blood vessel is injured, platelets attach at the injury site, become activated, and stick to one another. This forms an initial platelet plug. PLT reports how many platelets are circulating per unit volume of blood.

Platelets form in the bone marrow from fragments of large cells called megakaryocytes. They circulate until they are activated. PLT describes how many of these particles are in the sample, while attachment to the injured vessel wall and plug formation depend on how the platelets function.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/
https://pubmed.ncbi.nlm.nih.gov/9373252/
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-4-leukocytes-and-platelets'),
  ('mpv', 'MPV показывает средний размер циркулирующих тромбоцитов и выражается в фемтолитрах. Анализатор определяет его по распределению измеренных тромбоцитов по объёму. PLT отражает число тромбоцитов, а MPV — их средний объём.

Среди циркулирующих тромбоцитов есть более мелкие и более крупные. Если их размеры распределены по-разному, среднее всё равно может оказаться одинаковым. Поэтому из MPV нельзя восстановить разброс размеров отдельных тромбоцитов или их количество в образце.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/
https://moodle.fondation-merieux.org/pluginfile.php/5030/mod_resource/content/1/BC-2800%20Mindray_User%20Manual.pdf', 'MPV is the average size of circulating platelets, reported in femtoliters. The analyzer derives it from the measured distribution of platelet volumes. PLT describes how many platelets there are, while MPV describes their average volume.

Circulating platelets include smaller and larger particles. Different size distributions can yield the same average. MPV therefore cannot reveal the variation in individual platelet sizes or the number of platelets in the sample.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/
https://moodle.fondation-merieux.org/pluginfile.php/5030/mod_resource/content/1/BC-2800%20Mindray_User%20Manual.pdf'),
  ('reticulocytes', 'Ретикулоциты образуются в костном мозге и завершают созревание после выхода в кровоток. Подсчёт ретикулоцитов помогает оценить, сколько новых эритроцитов поступает в кровь. Лаборатории могут указывать результат как абсолютное число или как долю эритроцитов.

На этой стадии клетка уже потеряла ядро, но в ней ещё остаётся РНК. По этому признаку ретикулоцит можно отличить от зрелого эритроцита. Поскольку стадия короткая, её клетки отражают недавнее образование эритроцитов, тогда как общий подсчёт эритроцитов включает клетки, которые давно находятся в кровотоке.

Источники
https://medlineplus.gov/lab-tests/reticulocyte-count/
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes', 'Reticulocytes develop in the bone marrow and finish maturing after entering the bloodstream. A reticulocyte count helps estimate how many new red blood cells are entering circulation. Laboratories may report an absolute count or a percentage of red blood cells.

At this stage the cell has already lost its nucleus but still contains some RNA. This helps distinguish a reticulocyte from a mature red blood cell. Because the stage is short, these cells reflect recent red cell production, while the total red cell count also includes cells that have been circulating much longer.

Sources
https://medlineplus.gov/lab-tests/reticulocyte-count/
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes'),
  ('leukocytes', 'Лейкоциты — клетки иммунной системы. К ним относятся нейтрофилы, лимфоциты, моноциты, эозинофилы и базофилы. WBC показывает их суммарное число в единице объёма крови.

Общий подсчёт объединяет разные звенья иммунной системы. Часть лейкоцитов перемещается из кровотока в ткани, поэтому анализ описывает клетки, циркулирующие в образце крови. Два образца с одинаковым WBC могут иметь разный состав лейкоцитов. Это различие видно в лейкоцитарной формуле.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'White blood cells are immune cells. They include neutrophils, lymphocytes, monocytes, eosinophils, and basophils. WBC measures their total number per unit volume of blood.

The total count combines several branches of the immune system. Some white blood cells leave the bloodstream and enter tissues, so the test captures cells circulating in the blood sample. Two samples with the same WBC can contain different mixes of white blood cells, which the differential can show.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('neutrophil-count', 'Абсолютное число нейтрофилов показывает их количество в единице объёма крови. Нейтрофилы относятся к клеткам врождённого иммунитета. Они мигрируют из крови к очагу воспаления, захватывают микроорганизмы и разрушают их.

В очаге воспаления нейтрофил может окружить и захватить микроорганизм. Внутри клетки захваченный материал контактирует с веществами из гранул. Подсчёт в крови показывает, сколько нейтрофилов циркулирует, пока эти процессы происходят в тканях.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute neutrophil count measures the number of these cells per unit volume of blood. Neutrophils are part of innate immunity. They move from the bloodstream to sites of inflammation, where they engulf and destroy microorganisms.

At a site of inflammation, a neutrophil can surround and engulf a microorganism. Inside the cell, the engulfed material comes into contact with substances from granules. The blood count measures circulating neutrophils while these processes take place in tissues.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('neutrophil-percentage', 'Показатель сравнивает число нейтрофилов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе нейтрофилов. Нейтрофилы относятся к клеткам врождённого иммунитета. Они мигрируют из крови к очагу воспаления, захватывают микроорганизмы и разрушают их.

Доля показывает, какую часть формулы составляют клетки, участвующие в таком быстром ответе. Чтобы получить их число на единицу объёма крови, долю нейтрофилов умножают на общее число лейкоцитов в той же пробе.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of neutrophils with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. Neutrophils are part of innate immunity. They move from the bloodstream to sites of inflammation, where they engulf and destroy microorganisms.

The percentage shows what share of the differential consists of cells involved in this rapid response. Multiplying their fraction by the total white blood cell count in the same sample gives the number of neutrophils per unit volume.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('lymphocyte-count', 'Абсолютное число лимфоцитов показывает их количество в единице объёма крови. В-лимфоциты могут превращаться в клетки, которые вырабатывают антитела. Т-лимфоциты координируют иммунный ответ или уничтожают заражённые клетки, а NK-клетки участвуют в ранней защите.

В обычном ОАК лимфоциты учитывают вместе. Поскольку В-, Т- и NK-клетки выполняют разные задачи, общее число лимфоцитов описывает размер всей группы в крови. Чтобы определить число клеток отдельных подтипов, их различают по поверхностным маркерам.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute lymphocyte count measures the number of these cells per unit volume of blood. B lymphocytes can develop into antibody-producing cells. T lymphocytes coordinate the immune response or kill infected cells, while natural killer cells contribute to early defense.

A routine CBC counts lymphocytes together. Because B cells, T cells, and natural killer cells perform different tasks, the total lymphocyte count describes the size of the whole group in blood. Individual subsets can be counted by distinguishing their surface markers.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('lymphocyte-percentage', 'Показатель сравнивает число лимфоцитов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе лимфоцитов. В-лимфоциты могут превращаться в клетки, которые вырабатывают антитела. Т-лимфоциты координируют иммунный ответ или уничтожают заражённые клетки, а NK-клетки участвуют в ранней защите.

Доля лимфоцитов складывается из нескольких подтипов, поэтому в стандартной формуле по этому проценту нельзя определить, какая часть приходится на В-, Т- или NK-клетки. Процент описывает общий вклад лимфоцитов в состав циркулирующих лейкоцитов.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of lymphocytes with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. B lymphocytes can develop into antibody-producing cells. T lymphocytes coordinate the immune response or kill infected cells, while natural killer cells contribute to early defense.

The lymphocyte percentage combines several subsets, so the routine differential cannot show how much of it consists of B cells, T cells, or natural killer cells. It describes the overall contribution of lymphocytes to the circulating white blood cell population.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('monocyte-count', 'Абсолютное число моноцитов показывает их количество в единице объёма крови. Моноциты циркулируют в крови и могут переходить в ткани, где часть из них превращается в макрофаги. Эти клетки поглощают микроорганизмы и клеточные остатки и участвуют в иммунном ответе.

После перехода в ткани клетки моноцитарного ряда могут участвовать в поглощении материала и в представлении его фрагментов клеткам адаптивного иммунитета. Абсолютное число моноцитов измеряют до этого этапа — в пробе крови, где моноциты ещё циркулируют.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute monocyte count measures the number of these cells per unit volume of blood. Monocytes circulate in the blood and can move into tissues, where some develop into macrophages. These cells take up microorganisms and cellular debris and contribute to the immune response.

After entering tissues, cells of the monocyte lineage can take up material and present fragments of it to cells of the adaptive immune system. The absolute monocyte count is measured before that stage, in a blood sample where the monocytes are still circulating.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('monocyte-percentage', 'Показатель сравнивает число моноцитов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе моноцитов. Моноциты циркулируют в крови и могут переходить в ткани, где часть из них превращается в макрофаги. Эти клетки поглощают микроорганизмы и клеточные остатки и участвуют в иммунном ответе.

Процент относится к моноцитам в пробе крови. Макрофаги, в которые часть моноцитов может превращаться после перехода в ткани, в эту долю не входят. Чтобы узнать число циркулирующих моноцитов на единицу объёма, долю умножают на общее число лейкоцитов.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of monocytes with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. Monocytes circulate in the blood and can move into tissues, where some develop into macrophages. These cells take up microorganisms and cellular debris and contribute to the immune response.

The percentage refers to monocytes in the blood sample. It does not include macrophages that some monocytes may become after entering tissues. Multiplying the fraction by the total white blood cell count gives the number of circulating monocytes per unit volume.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('eosinophil-count', 'Абсолютное число эозинофилов показывает их количество в единице объёма крови. Эозинофилы относятся к гранулоцитам. При активации они выделяют вещества из внутриклеточных гранул. Эти клетки участвуют в иммунных реакциях на паразитов и в аллергическом воспалении.

Часть эозинофилов находится в тканях, в том числе в слизистых оболочках. Там вещества из их гранул могут действовать вблизи места активации. Абсолютный показатель учитывает клетки, находящиеся в крови в момент взятия образца.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute eosinophil count measures the number of these cells per unit volume of blood. Eosinophils are granulocytes. When activated, they release substances from granules inside the cell. They participate in immune responses to parasites and in allergic inflammation.

Some eosinophils are found in tissues, including mucosal surfaces. There, substances released from their granules can act close to the site of activation. The absolute count covers the cells present in the bloodstream when the sample is taken.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('eosinophil-percentage', 'Показатель сравнивает число эозинофилов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе эозинофилов. Эозинофилы относятся к гранулоцитам. При активации они выделяют вещества из внутриклеточных гранул. Эти клетки участвуют в иммунных реакциях на паразитов и в аллергическом воспалении.

Доля описывает место эозинофилов среди других лейкоцитов в пробе крови. Она не показывает, сколько эозинофилов уже перешло в ткани или сколько веществ они выделили из гранул. Абсолютное число можно получить из доли и общего числа лейкоцитов.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of eosinophils with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. Eosinophils are granulocytes. When activated, they release substances from granules inside the cell. They participate in immune responses to parasites and in allergic inflammation.

The percentage describes how eosinophils contribute to the mix of white blood cells in the sample. It does not show how many eosinophils have already entered tissues or how much material their granules have released. The absolute count can be derived from their fraction and the total white blood cell count.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('basophil-count', 'Абсолютное число базофилов показывает их количество в единице объёма крови. Базофилы относятся к гранулоцитам. Базофилы играют роль в аллергических реакциях.

Гистамин хранится во внутриклеточных гранулах и высвобождается при активации базофила. Подсчёт показывает, сколько базофилов находится в крови, и не измеряет количество выделенного ими гистамина.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute basophil count measures the number of these cells per unit volume of blood. Basophils are granulocytes. Basophils play a role in allergic reactions.

Histamine is stored in granules inside the cell and released when a basophil is activated. The count measures how many basophils are in the bloodstream and does not measure how much histamine they have released.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('basophil-percentage', 'Показатель сравнивает число базофилов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе базофилов. Базофилы относятся к гранулоцитам. При активации они высвобождают гистамин и другие вещества, которые участвуют в воспалительной реакции. Базофилы играют роль в аллергических реакциях.

Этот процент характеризует состав лейкоцитов, циркулирующих в крови. Работа базофилов при активации и выделении гистамина — отдельный процесс. Доля клеток в формуле показывает их представленность в образце, но не степень их активации.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of basophils with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. Basophils are granulocytes. When activated, they release histamine and other substances that contribute to inflammation. Basophils play a role in allergic reactions.

This percentage describes the composition of the white blood cells circulating in blood. Basophil activation and histamine release are separate processes. The differential shows how well represented the cells are in the sample but not how active they are.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('nlr', 'NLR рассчитывают, деля абсолютное число нейтрофилов на абсолютное число лимфоцитов, выраженные в одинаковых единицах. Результат показывает, сколько нейтрофилов приходится на один лимфоцит.

У NLR нет единицы измерения: единицы обоих абсолютных чисел сокращаются при делении. Если оба числа меняются в одинаковой пропорции, NLR остаётся тем же. Поэтому отношение описывает соотношение двух групп клеток, а их исходное количество видно только по отдельным результатам.

Источники
https://doi.org/10.1186/s12865-025-00797-2', 'NLR is calculated by dividing the absolute neutrophil count by the absolute lymphocyte count, using the same units for both. The result expresses how many neutrophils there are per lymphocyte.

NLR is unitless because the units of the two absolute counts cancel out in division. If both counts change in the same proportion, NLR stays the same. The ratio describes the balance between the two cell groups, while their underlying numbers can be seen only in the individual counts.

Sources
https://doi.org/10.1186/s12865-025-00797-2'),
  ('esr', 'В методе Вестергрена образец крови с антикоагулянтом оставляют в вертикальной трубке. Эритроциты оседают, оставляя сверху слой плазмы. Через час измеряют высоту этого слоя. Склонность эритроцитов собираться в агрегаты влияет на оседание. В этом процессе участвуют белки плазмы, в том числе фибриноген.

Когда эритроциты объединяются, агрегаты оседают иначе, чем отдельные клетки. На высоту слоя плазмы влияет также доля объёма образца, занятая эритроцитами. Поэтому измерение отражает совместное влияние клеток и плазмы на оседание в пробирке.

Источники
https://onlinelibrary.wiley.com/doi/full/10.1111/j.1751-553X.2011.01302.x
https://pubmed.ncbi.nlm.nih.gov/15559996/', 'In the Westergren method, anticoagulated blood is left in a vertical tube. The red blood cells settle, leaving a layer of plasma above them. The height of that layer is measured after one hour. The tendency of red blood cells to form aggregates affects settling. Plasma proteins, including fibrinogen, contribute to this process.

When red blood cells form aggregates, they settle differently from individual cells. The height of the plasma layer also depends on the fraction of the sample occupied by red blood cells. The measurement thus reflects the combined effects of cells and plasma on settling in the tube.

Sources
https://onlinelibrary.wiley.com/doi/full/10.1111/j.1751-553X.2011.01302.x
https://pubmed.ncbi.nlm.nih.gov/15559996/');

DO $$
BEGIN
  IF (
    SELECT count(*)
    FROM cbc_expanded_descriptions s
    JOIN "analysisPoint" p USING (name)
    JOIN analysis_type_point j ON j."pointId" = p.id
    JOIN "analysisType" t ON t.id = j."typeId"
    WHERE t.name = 'general_blood_test'
  ) <> 24 THEN
    RAISE EXCEPTION 'Unexpected CBC catalog membership for expanded descriptions';
  END IF;
END $$;

UPDATE "analysisPoint" p
SET "pointDescriptionRu" = s.description_ru,
    "pointDescriptionEn" = s.description_en
FROM cbc_expanded_descriptions s
WHERE p.name = s.name;
`;
