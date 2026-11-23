export const POINT_DESCRIPTIONS_LONG_FORM_SQL = `
CREATE TEMP TABLE point_descriptions_long_form (
  name text PRIMARY KEY CHECK (name <> 'prolactin'),
  description_ru text NOT NULL,
  description_en text NOT NULL
) ON COMMIT DROP;

INSERT INTO point_descriptions_long_form VALUES
  ('hemoglobin', 'Гемоглобин состоит из белковых цепей и групп гема, содержащих железо. Железо гема обратимо связывает кислород: гемоглобин присоединяет его в лёгких и отдаёт в тканях. Анализ показывает, сколько гемоглобина содержится в единице объёма цельной крови.

В одной молекуле гемоглобина четыре группы гема, и каждая может связать одну молекулу кислорода. Анализ измеряет концентрацию самого белка. Доля гемоглобина, связанного с кислородом, — отдельная величина, которую называют насыщением кислородом.

Концентрация относится ко всему объёму пробы, включая плазму. Если объём плазмы меняется, концентрация гемоглобина может измениться даже при той же массе гемоглобина в кровотоке. Поэтому в бланке указывают концентрацию, а не массу всего циркулирующего гемоглобина.

Источники
https://nutritionalassessment.org/iron/
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes', 'Hemoglobin consists of protein chains and iron-containing heme groups. Heme iron binds oxygen reversibly, allowing hemoglobin to pick up oxygen in the lungs and release it in tissues. The test measures how much hemoglobin is present per unit volume of whole blood.

A hemoglobin molecule has four heme groups, each of which can bind one oxygen molecule. This test measures the concentration of the protein itself. The fraction of hemoglobin carrying oxygen is a separate quantity called oxygen saturation.

The concentration refers to the whole sample volume, including plasma. If plasma volume changes, the concentration can change even when the mass of hemoglobin in circulation stays the same. The report therefore gives a concentration rather than the total mass of circulating hemoglobin.

Sources
https://nutritionalassessment.org/iron/
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes'),
  ('erythrocyte', 'Эритроциты образуются в костном мозге и содержат гемоглобин, с помощью которого доставляют кислород от лёгких к тканям. RBC показывает концентрацию самих клеток в крови. Содержание гемоглобина в одной клетке описывает отдельный показатель — MCH.

Зрелый эритроцит имеет форму двояковогнутого диска. За счёт этой формы у него относительно большая поверхность для газообмена, а гибкая клетка может менять форму, проходя через узкие капилляры. Подсчёт RBC учитывает клетки поштучно и сам по себе не описывает их форму или размер.

Кровь постоянно обновляет популяцию эритроцитов: костный мозг выпускает новые клетки, а старые удаляются из кровотока. В подсчёт RBC входят клетки разных возрастов. Ретикулоциты выделяют отдельно, чтобы описать недавнее пополнение этой популяции.

Источники
https://nutritionalassessment.org/iron/
https://doi.org/10.37489/2949-1924-0072
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes', 'Red blood cells are produced in the bone marrow and contain hemoglobin, which carries oxygen from the lungs to tissues. RBC counts the cells per unit volume of blood. A separate index, MCH, describes how much hemoglobin an average cell contains.

A mature red blood cell is shaped like a biconcave disc. This gives it a relatively large surface for gas exchange, and the flexible cell can change shape as it passes through narrow capillaries. RBC is a count and does not describe the cells’ shape or size.

The red cell population is continually renewed: bone marrow releases new cells and older cells are removed from circulation. The RBC count includes cells of different ages. Reticulocytes are counted separately to describe recent additions to that population.

Sources
https://nutritionalassessment.org/iron/
https://doi.org/10.37489/2949-1924-0072
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes'),
  ('hematocrit', 'Гематокрит показывает, какую часть общего объёма крови занимают эритроциты. Эта доля зависит и от количества клеток в единице объёма, и от их среднего размера. Поэтому одинаковое число эритроцитов может соответствовать разному гематокриту.

На анализаторе гематокрит может рассчитываться по числу эритроцитов и их среднему объёму. Показатель можно выразить в процентах или долей единицы. Доля используется, например, при пересчёте концентрации гемоглобина в цельной крови в концентрацию в суммарном объёме эритроцитов (MCHC).

Гематокрит можно получить и при центрифугировании: эритроциты уплотняются, и измеряют долю столбика, которую они занимают. Автоматический анализатор может оценить ту же величину по числу клеток и среднему объёму. В обоих случаях знаменатель — объём цельной крови.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.37489/2949-1924-0072', 'Hematocrit is the proportion of the sample’s volume occupied by red blood cells. It depends on both the number of cells per unit volume and their average size. Samples with the same red blood cell count can therefore have different hematocrits.

An analyzer can calculate hematocrit from the red blood cell count and average cell volume. The result can be expressed as a percentage or as a fraction. The fraction can be used to convert whole-blood hemoglobin concentration to the concentration in the combined red blood cell volume (MCHC).

Hematocrit can also be determined by centrifugation, which packs the red cells so that their share of the column can be measured. An automated analyzer can estimate the same quantity from the count and average cell volume. In both cases the denominator is whole-blood volume.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.37489/2949-1924-0072'),
  ('mcv', 'MCV характеризует размер эритроцитов и выражается в фемтолитрах. Это среднее значение по измеренным клеткам.

На гистограмме объёмов видны не только типичные размеры клеток, но и то, как измерения распределены вокруг них. Если в образце одновременно есть группы более мелких и более крупных клеток, их объёмы усредняются в одном MCV. Чтобы понять, насколько однородны размеры, нужны сведения о распределении, например RDW.

При автоматическом подсчёте анализатор получает информацию об объёме множества отдельных клеток. MCV сводит эти измерения к одному числу, удобному для сравнения проб. Для вопроса о том, есть ли разные по размеру группы клеток, нужна сама гистограмма или другой показатель распределения.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.1186/s12887-021-02709-w', 'MCV describes red blood cell size and is reported in femtoliters. It is an average across the measured cells.

A volume histogram shows typical cell sizes and how measurements are distributed around them. If the sample contains groups of smaller and larger cells, both contribute to a single MCV. To see how uniform the sizes are, information about the distribution, such as RDW, is needed.

An automated count produces volume information for many individual cells. MCV summarizes those measurements as one number for comparing samples. To tell whether the sample contains distinct groups of cell sizes, the histogram or another measure of the distribution is needed.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.1186/s12887-021-02709-w'),
  ('mch', 'MCH показывает, сколько гемоглобина содержит один эритроцит в среднем. Индекс получают из концентрации гемоглобина в цельной крови и числа эритроцитов в том же объёме. Результат выражают в пикограммах на клетку.

Масса гемоглобина на клетку зависит от объёма эритроцита и от концентрации гемоглобина в этом объёме. При одинаковой концентрации более крупная клетка может содержать больше гемоглобина по массе. Поэтому MCH отвечает на вопрос о количестве белка в клетке, а MCHC — о его концентрации.

Единица измерения MCH — пикограмм — относится к массе. Это расчёт по всей пробе: общее количество гемоглобина соотносят с числом клеток, а не взвешивают белок в каждом эритроците. MCH показывает среднее для популяции клеток.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.37489/2949-1924-0072', 'MCH describes how much hemoglobin the average red blood cell contains. It is calculated from the hemoglobin concentration in whole blood and the number of red blood cells in the same volume. The result is reported in picograms per cell.

The mass of hemoglobin per cell depends on the red cell’s volume and the hemoglobin concentration within it. At the same concentration, a larger cell can contain a greater mass of hemoglobin. MCH therefore describes how much hemoglobin a cell contains, while MCHC describes its concentration.

The picogram used for MCH is a unit of mass. The index is calculated across the sample by relating hemoglobin to the cell count rather than weighing the protein in each cell. MCH is an average for the cell population.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://doi.org/10.37489/2949-1924-0072'),
  ('mchc', 'MCHC показывает, насколько плотно гемоглобином заполнен суммарный объём эритроцитов. Для расчёта концентрацию гемоглобина в цельной крови делят на гематокрит, выраженный долей. MCH описывает массу на клетку, а MCHC — концентрацию в объёме клеток.

Размер клетки помогает понять разницу между этими индексами. Небольшой эритроцит может содержать меньше гемоглобина по массе, чем крупный, при той же концентрации внутри клетки. Поскольку MCHC рассчитывают по суммарному объёму эритроцитов в образце, по нему нельзя увидеть, как концентрация различается от клетки к клетке.

При расчёте важно, в каком виде записан гематокрит. Если он указан в процентах, его сначала переводят в долю. После деления единица результата остаётся единицей концентрации, например граммами на литр, но теперь она относится к объёму эритроцитов, а не цельной крови.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'MCHC describes how concentrated hemoglobin is within the combined volume of red blood cells. It is calculated by dividing the whole-blood hemoglobin concentration by hematocrit expressed as a fraction. MCH describes mass per cell, while MCHC describes concentration within the cells.

Cell size helps explain the difference between these indices. A small red blood cell can contain a smaller mass of hemoglobin than a larger one while having the same concentration inside the cell. Because MCHC is calculated for the combined red blood cell volume in the sample, it does not show how the concentration varies from cell to cell.

The calculation depends on how hematocrit is expressed. A percentage is first converted to a fraction. The result is still expressed as a concentration, for example in grams per liter, but now refers to red cell volume rather than whole-blood volume.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK260/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('rdw', 'Анализатор строит распределение эритроцитов по объёму. RDW-CV выражает разброс размеров относительно характерного размера клеток. При одинаковом среднем объёме эритроцитов один образец может содержать клетки сходного размера, а другой — смесь более мелких и более крупных клеток.

На гистограмме по горизонтали отложен объём клетки, а по вертикали — частота клеток такого объёма. RDW-CV сводит сведения о ширине этого распределения к одному процентному значению. Само число не показывает, получился ли широкий профиль из-за плавного разброса размеров или из-за нескольких групп клеток разного объёма.

RDW-CV и MCV дополняют друг друга: первый характеризует относительную неоднородность, второй — положение среднего объёма. По одному RDW-CV нельзя определить, преобладают ли небольшие или крупные клетки. Это свойство процентной сводки, которая описывает ширину распределения.

Источники
https://www.mindray.com/en/services/support-faq/hematology
https://doi.org/10.37489/2949-1924-0072', 'The analyzer builds a distribution of red blood cell volumes. RDW-CV expresses the spread of cell sizes relative to their typical size. Two samples can have the same average red blood cell volume even if one contains similarly sized cells and the other contains a mix of smaller and larger cells.

On the histogram, the horizontal axis represents cell volume and the vertical axis shows the frequency of cells of that volume. RDW-CV summarizes the width of this distribution as a single percentage. The number alone does not show whether the broad profile reflects a continuous spread of sizes or several groups of cells with different volumes.

RDW-CV and MCV complement each other: the former describes relative variation and the latter gives the average volume. RDW-CV alone cannot show whether smaller or larger cells predominate. The percentage summarizes the breadth of the distribution.

Sources
https://www.mindray.com/en/services/support-faq/hematology
https://doi.org/10.37489/2949-1924-0072'),
  ('rdw-sd', 'RDW-SD описывает абсолютный разброс объёмов эритроцитов на гистограмме анализатора. Прибор определяет ширину распределения по своей методике и выражает результат в фемтолитрах. RDW-CV описывает относительный разброс и выводится в процентах.

На гистограмме два края выбранного сечения соответствуют двум объёмам. Расстояние между ними по оси объёма и даёт ширину в фемтолитрах. Высота, на которой прибор измеряет ширину, зависит от его методики, а само число не описывает форму всей кривой.

Поскольку измеряется расстояние по шкале объёма, оно остаётся величиной в фемтолитрах. Результат нельзя перевести в RDW-CV простой сменой единиц: относительный индекс рассчитывают иначе. Название индекса и метод анализатора поэтому важны для сопоставления двух чисел.

Источники
https://www.mindray.com/en/services/support-faq/hematology
https://doi.org/10.37489/2949-1924-0072', 'RDW-SD describes the absolute spread of red blood cell volumes on the analyzer’s histogram. The instrument determines the width using its own method and reports the result in femtoliters. RDW-CV describes relative spread and is reported as a percentage.

The two edges of a selected cross-section of the histogram correspond to two cell volumes. Their distance along the volume axis gives the width in femtoliters. The height at which the analyzer measures the width depends on its method, and the resulting number does not describe the shape of the whole curve.

Because the measurement is a distance on the volume scale, it remains a quantity in femtoliters. It cannot be converted to RDW-CV by changing units alone because the relative index is calculated differently. Both the index name and the analyzer’s method matter when comparing the numbers.

Sources
https://www.mindray.com/en/services/support-faq/hematology
https://doi.org/10.37489/2949-1924-0072'),
  ('platelets', 'При повреждении сосудистой стенки тромбоциты прикрепляются к участку повреждения, активируются и сцепляются друг с другом. Так формируется первичная тромбоцитарная пробка. Показатель PLT описывает, сколько тромбоцитов циркулирует в единице объёма крови.

Тромбоциты образуются в костном мозге из фрагментов крупных клеток — мегакариоцитов. В крови они циркулируют до активации. PLT описывает количество этих частиц в образце, тогда как прикрепление к повреждённой стенке и образование пробки зависят от их работы.

В бланке и лабораторных исследованиях можно встретить три разные оценки:
- PLT показывает, сколько тромбоцитов приходится на объём крови.
- MPV показывает средний объём тромбоцита.
- Тесты агрегации оценивают способность тромбоцитов объединяться.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/
https://pubmed.ncbi.nlm.nih.gov/9373252/
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-4-leukocytes-and-platelets', 'When a blood vessel is injured, platelets attach at the injury site, become activated, and stick to one another. This forms an initial platelet plug. PLT reports how many platelets are circulating per unit volume of blood.

Platelets form in the bone marrow from fragments of large cells called megakaryocytes. They circulate until they are activated. PLT describes how many of these particles are in the sample, while attachment to the injured vessel wall and plug formation depend on how the platelets function.

Laboratory testing can describe platelets in three different ways:
- PLT gives the number of platelets per unit volume of blood.
- MPV gives the average platelet volume.
- Aggregation tests assess the ability of platelets to stick together.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/
https://pubmed.ncbi.nlm.nih.gov/9373252/
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-4-leukocytes-and-platelets'),
  ('mpv', 'MPV показывает средний размер циркулирующих тромбоцитов и выражается в фемтолитрах. Анализатор определяет его по распределению измеренных тромбоцитов по объёму. PLT отражает число тромбоцитов, а MPV — их средний объём.

Среди циркулирующих тромбоцитов есть более мелкие и более крупные. Если их размеры распределены по-разному, среднее всё равно может оказаться одинаковым. Поэтому из MPV нельзя восстановить разброс размеров отдельных тромбоцитов или их количество в образце.

MPV рассчитывают из событий, которые анализатор распознал как тромбоциты. Границы выделения этой группы и метод расчёта могут различаться между приборами. Это характеристика размеров частиц, а способность тромбоцитов формировать пробку оценивается другими тестами.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/
https://moodle.fondation-merieux.org/pluginfile.php/5030/mod_resource/content/1/BC-2800%20Mindray_User%20Manual.pdf', 'MPV is the average size of circulating platelets, reported in femtoliters. The analyzer derives it from the measured distribution of platelet volumes. PLT describes how many platelets there are, while MPV describes their average volume.

Circulating platelets include smaller and larger particles. Different size distributions can yield the same average. MPV therefore cannot reveal the variation in individual platelet sizes or the number of platelets in the sample.

MPV is calculated from events that the analyzer identifies as platelets. The way instruments distinguish those events and calculate the mean can differ. MPV characterizes particle size, while platelet plug formation is assessed by other tests.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC13406479/
https://moodle.fondation-merieux.org/pluginfile.php/5030/mod_resource/content/1/BC-2800%20Mindray_User%20Manual.pdf'),
  ('reticulocytes', 'Ретикулоциты образуются в костном мозге и завершают созревание после выхода в кровоток. Подсчёт ретикулоцитов помогает оценить, сколько новых эритроцитов поступает в кровь. Лаборатории могут указывать результат как абсолютное число или как долю эритроцитов.

На этой стадии клетка уже потеряла ядро, но в ней ещё остаётся РНК. По этому признаку ретикулоцит можно отличить от зрелого эритроцита. Поскольку стадия короткая, её клетки отражают недавнее образование эритроцитов, тогда как общий подсчёт эритроцитов включает клетки, которые давно находятся в кровотоке.

Процент ретикулоцитов показывает их долю среди эритроцитов. Абсолютный результат показывает число этих незрелых клеток в объёме крови. Если знаменатель меняется, одинаковый процент может соответствовать разному абсолютному числу, поэтому при чтении названия важен формат отчёта.

Источники
https://medlineplus.gov/lab-tests/reticulocyte-count/
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes', 'Reticulocytes develop in the bone marrow and finish maturing after entering the bloodstream. A reticulocyte count helps estimate how many new red blood cells are entering circulation. Laboratories may report an absolute count or a percentage of red blood cells.

At this stage the cell has already lost its nucleus but still contains some RNA. This helps distinguish a reticulocyte from a mature red blood cell. Because the stage is short, these cells reflect recent red cell production, while the total red cell count also includes cells that have been circulating much longer.

The reticulocyte percentage gives their share of all red blood cells. An absolute result gives the number of immature cells per volume of blood. If the denominator changes, the same percentage can correspond to different absolute counts, so the reporting format matters.

Sources
https://medlineplus.gov/lab-tests/reticulocyte-count/
https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes'),
  ('leukocytes', 'Лейкоциты — клетки иммунной системы. К ним относятся нейтрофилы, лимфоциты, моноциты, эозинофилы и базофилы. WBC показывает их суммарное число в единице объёма крови.

Общий подсчёт объединяет разные звенья иммунной системы. Часть лейкоцитов перемещается из кровотока в ткани, поэтому анализ описывает клетки, циркулирующие в образце крови. Два образца с одинаковым WBC могут иметь разный состав лейкоцитов. Это различие видно в лейкоцитарной формуле.

Лейкоцитарный подсчёт и формула вместе отвечают на разные вопросы. Общий показатель даёт число клеток, а формула показывает относительный и, в зависимости от бланка, абсолютный вклад подтипов. Абсолютный вклад можно получить, умножив долю подтипа на общий результат WBC.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'White blood cells are immune cells. They include neutrophils, lymphocytes, monocytes, eosinophils, and basophils. WBC measures their total number per unit volume of blood.

The total count combines several branches of the immune system. Some white blood cells leave the bloodstream and enter tissues, so the test captures cells circulating in the blood sample. Two samples with the same WBC can contain different mixes of white blood cells, which the differential can show.

The total white cell count and the differential answer different questions. The total gives the number of cells, while the differential gives the relative and, depending on the report, absolute contribution of cell types. Multiplying the cell type’s fraction by WBC gives its absolute contribution.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('neutrophil-count', 'Абсолютное число нейтрофилов показывает их количество в единице объёма крови. Нейтрофилы относятся к клеткам врождённого иммунитета. Они мигрируют из крови к очагу воспаления, захватывают микроорганизмы и разрушают их.

В очаге воспаления нейтрофил может окружить и захватить микроорганизм. Внутри клетки захваченный материал контактирует с веществами из гранул. Подсчёт в крови показывает, сколько нейтрофилов циркулирует, пока эти процессы происходят в тканях.

Нейтрофилы образуются в костном мозге, переходят в кровь и могут покидать её при сигнале из тканей. Поскольку распределение клеток между кровью и тканями меняется, результат относится к циркулирующей части популяции. Абсолютное число сообщает о ней в пересчёте на объём крови.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute neutrophil count measures the number of these cells per unit volume of blood. Neutrophils are part of innate immunity. They move from the bloodstream to sites of inflammation, where they engulf and destroy microorganisms.

At a site of inflammation, a neutrophil can surround and engulf a microorganism. Inside the cell, the engulfed material comes into contact with substances from granules. The blood count measures circulating neutrophils while these processes take place in tissues.

Neutrophils are produced in the bone marrow, enter blood, and can leave it in response to tissue signals. Because their distribution between circulation and tissues changes, the result refers to the circulating portion of the population. The absolute count reports it per unit volume of blood.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('neutrophil-percentage', 'Показатель сравнивает число нейтрофилов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе нейтрофилов. Нейтрофилы относятся к клеткам врождённого иммунитета. Они мигрируют из крови к очагу воспаления, захватывают микроорганизмы и разрушают их.

Доля показывает, какую часть формулы составляют клетки, участвующие в таком быстром ответе. Чтобы получить их число на единицу объёма крови, долю нейтрофилов умножают на общее число лейкоцитов в той же пробе.

Общее число лейкоцитов — знаменатель этой доли. Если сравниваются два образца с разным WBC, один и тот же процент нейтрофилов может соответствовать разному числу нейтрофилов на литр. Поэтому относительная и абсолютная строки отвечают на разные вопросы.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of neutrophils with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. Neutrophils are part of innate immunity. They move from the bloodstream to sites of inflammation, where they engulf and destroy microorganisms.

The percentage shows what share of the differential consists of cells involved in this rapid response. Multiplying their fraction by the total white blood cell count in the same sample gives the number of neutrophils per unit volume.

Total white cell count is the denominator of this fraction. In two samples with different WBC counts, the same neutrophil percentage can represent different numbers of neutrophils per liter. The relative and absolute lines therefore answer different questions.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('lymphocyte-count', 'Абсолютное число лимфоцитов показывает их количество в единице объёма крови. В-лимфоциты могут превращаться в клетки, которые вырабатывают антитела. Т-лимфоциты координируют иммунный ответ или уничтожают заражённые клетки, а NK-клетки участвуют в ранней защите.

В обычном ОАК лимфоциты учитывают вместе. Поскольку В-, Т- и NK-клетки выполняют разные задачи, общее число лимфоцитов описывает размер всей группы в крови. Чтобы определить число клеток отдельных подтипов, их различают по поверхностным маркерам.

Многие лимфоциты перемещаются между кровью и лимфоидными органами. В пробе подсчитывается только циркулирующая часть, доступная в момент взятия крови. Количественный результат не описывает, какие клетки уже распознали антиген или насколько активно они отвечают.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute lymphocyte count measures the number of these cells per unit volume of blood. B lymphocytes can develop into antibody-producing cells. T lymphocytes coordinate the immune response or kill infected cells, while natural killer cells contribute to early defense.

A routine CBC counts lymphocytes together. Because B cells, T cells, and natural killer cells perform different tasks, the total lymphocyte count describes the size of the whole group in blood. Individual subsets can be counted by distinguishing their surface markers.

Many lymphocytes move between blood and lymphoid organs. The sample counts only the circulating portion available when blood is drawn. The result does not show which cells have recognized an antigen or how actively they are responding.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('lymphocyte-percentage', 'Показатель сравнивает число лимфоцитов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе лимфоцитов. В-лимфоциты могут превращаться в клетки, которые вырабатывают антитела. Т-лимфоциты координируют иммунный ответ или уничтожают заражённые клетки, а NK-клетки участвуют в ранней защите.

Доля лимфоцитов складывается из нескольких подтипов, поэтому в стандартной формуле по этому проценту нельзя определить, какая часть приходится на В-, Т- или NK-клетки. Процент описывает общий вклад лимфоцитов в состав циркулирующих лейкоцитов.

Каждая клетка, учтённая как лимфоцит, вносит одинаковый вклад в процент. Поэтому и изменение других лейкоцитов, и изменение самого числа лимфоцитов могут поменять долю. Абсолютный подсчёт добавляет информацию о том, сколько лимфоцитов находится в единице объёма.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of lymphocytes with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. B lymphocytes can develop into antibody-producing cells. T lymphocytes coordinate the immune response or kill infected cells, while natural killer cells contribute to early defense.

The lymphocyte percentage combines several subsets, so the routine differential cannot show how much of it consists of B cells, T cells, or natural killer cells. It describes the overall contribution of lymphocytes to the circulating white blood cell population.

Each cell identified as a lymphocyte contributes equally to the percentage. Changes in other white cells as well as changes in lymphocyte count can therefore alter the fraction. The absolute count adds information on how many lymphocytes occur per unit volume.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('monocyte-count', 'Абсолютное число моноцитов показывает их количество в единице объёма крови. Моноциты циркулируют в крови и могут переходить в ткани, где часть из них превращается в макрофаги. Эти клетки поглощают микроорганизмы и клеточные остатки и участвуют в иммунном ответе.

После перехода в ткани клетки моноцитарного ряда могут участвовать в поглощении материала и в представлении его фрагментов клеткам адаптивного иммунитета. Абсолютное число моноцитов измеряют до этого этапа — в пробе крови, где моноциты ещё циркулируют.

Моноциты составляют часть популяции фагоцитирующих клеток, но результат подсчёта относится именно к крови. После выхода из кровотока клетки могут отличаться по свойствам и месту действия. ОАК не измеряет количество тканевых макрофагов или их способность поглощать материал.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute monocyte count measures the number of these cells per unit volume of blood. Monocytes circulate in the blood and can move into tissues, where some develop into macrophages. These cells take up microorganisms and cellular debris and contribute to the immune response.

After entering tissues, cells of the monocyte lineage can take up material and present fragments of it to cells of the adaptive immune system. The absolute monocyte count is measured before that stage, in a blood sample where the monocytes are still circulating.

Monocytes belong to a broader population of phagocytic cells, but the count specifically describes blood. After leaving the bloodstream, those cells can take on different properties and roles. A CBC does not measure the number of tissue macrophages or their ability to engulf material.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('monocyte-percentage', 'Показатель сравнивает число моноцитов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе моноцитов. Моноциты циркулируют в крови и могут переходить в ткани, где часть из них превращается в макрофаги. Эти клетки поглощают микроорганизмы и клеточные остатки и участвуют в иммунном ответе.

Процент относится к моноцитам в пробе крови. Макрофаги, в которые часть моноцитов может превращаться после перехода в ткани, в эту долю не входят. Чтобы узнать число циркулирующих моноцитов на единицу объёма, долю умножают на общее число лейкоцитов.

В числителе доли — моноциты, в знаменателе — все лейкоциты той же пробы. Если число моноцитов сохраняется, изменение других групп клеток всё равно может изменить процент. Это объясняет, почему процент и абсолютное число представлены отдельными строками.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of monocytes with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. Monocytes circulate in the blood and can move into tissues, where some develop into macrophages. These cells take up microorganisms and cellular debris and contribute to the immune response.

The percentage refers to monocytes in the blood sample. It does not include macrophages that some monocytes may become after entering tissues. Multiplying the fraction by the total white blood cell count gives the number of circulating monocytes per unit volume.

The numerator is the number of monocytes and the denominator is all white cells in the same sample. Even if the monocyte count stays the same, a change in other groups can alter the percentage. This is why the percentage and absolute count are reported separately.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('eosinophil-count', 'Абсолютное число эозинофилов показывает их количество в единице объёма крови. Эозинофилы относятся к гранулоцитам. При активации они выделяют вещества из внутриклеточных гранул. Эти клетки участвуют в иммунных реакциях на паразитов и в аллергическом воспалении.

Часть эозинофилов находится в тканях, в том числе в слизистых оболочках. Там вещества из их гранул могут действовать вблизи места активации. Абсолютный показатель учитывает клетки, находящиеся в крови в момент взятия образца.

В гранулах эозинофилов содержатся белки, которые клетка может выделить в ответ на сигнал. Само присутствие клетки в анализе не говорит о том, выделила ли она эти вещества. Абсолютный результат описывает число циркулирующих клеток, тогда как их активность в тканях — другая характеристика.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute eosinophil count measures the number of these cells per unit volume of blood. Eosinophils are granulocytes. When activated, they release substances from granules inside the cell. They participate in immune responses to parasites and in allergic inflammation.

Some eosinophils are found in tissues, including mucosal surfaces. There, substances released from their granules can act close to the site of activation. The absolute count covers the cells present in the bloodstream when the sample is taken.

Eosinophil granules contain proteins that the cell can release in response to a signal. Counting a cell does not indicate whether it has released those substances. The absolute count describes circulating cells, while their activity in tissues is a different characteristic.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('eosinophil-percentage', 'Показатель сравнивает число эозинофилов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе эозинофилов. Эозинофилы относятся к гранулоцитам. При активации они выделяют вещества из внутриклеточных гранул. Эти клетки участвуют в иммунных реакциях на паразитов и в аллергическом воспалении.

Доля описывает место эозинофилов среди других лейкоцитов в пробе крови. Она не показывает, сколько эозинофилов уже перешло в ткани или сколько веществ они выделили из гранул. Абсолютное число можно получить из доли и общего числа лейкоцитов.

Процент получается из подсчёта клеток, отнесённых к эозинофилам, на фоне общего числа лейкоцитов. В двух пробах с одинаковой долей могут быть разные абсолютные числа эозинофилов, если WBC различается. Чтобы сопоставить количество клеток на объём, используют абсолютную строку.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of eosinophils with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. Eosinophils are granulocytes. When activated, they release substances from granules inside the cell. They participate in immune responses to parasites and in allergic inflammation.

The percentage describes how eosinophils contribute to the mix of white blood cells in the sample. It does not show how many eosinophils have already entered tissues or how much material their granules have released. The absolute count can be derived from their fraction and the total white blood cell count.

The percentage comes from counting cells identified as eosinophils relative to all white cells. Samples with the same fraction can have different absolute counts if their WBC counts differ. The absolute line is used to compare cell numbers per unit volume.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('basophil-count', 'Абсолютное число базофилов показывает их количество в единице объёма крови. Базофилы относятся к гранулоцитам. Базофилы играют роль в аллергических реакциях.

Гистамин хранится во внутриклеточных гранулах и высвобождается при активации базофила. Подсчёт показывает, сколько базофилов находится в крови, и не измеряет количество выделенного ими гистамина.

Сам подсчёт характеризует популяцию клеток в крови. Функциональный ответ развивается, когда соответствующие сигналы активируют базофил, а его гранулы высвобождают содержимое. По числу клеток нельзя установить, сколько из них находится в таком состоянии.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'The absolute basophil count measures the number of these cells per unit volume of blood. Basophils are granulocytes. Basophils play a role in allergic reactions.

Histamine is stored in granules inside the cell and released when a basophil is activated. The count measures how many basophils are in the bloodstream and does not measure how much histamine they have released.

The count characterizes the population of cells in blood. A functional response occurs when signals activate a basophil and its granules release their contents. The cell count does not identify how many cells are in that state.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('basophil-percentage', 'Показатель сравнивает число базофилов с общим числом лейкоцитов. Доля может меняться, когда меняется число других лейкоцитов, даже при том же абсолютном числе базофилов. Базофилы относятся к гранулоцитам. При активации они высвобождают гистамин и другие вещества, которые участвуют в воспалительной реакции. Базофилы играют роль в аллергических реакциях.

Этот процент характеризует состав лейкоцитов, циркулирующих в крови. Работа базофилов при активации и выделении гистамина — отдельный процесс. Доля клеток в формуле показывает их представленность в образце, но не степень их активации.

Базофилы входят в небольшую часть лейкоцитарной формулы, и процент зависит от полного подсчёта клеток в пробе. Если нужно описать количество базофилов в литре крови, их долю соотносят с WBC. Так одно измерение дополняет представление о составе клеток, а другое — об их числе.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/', 'This measure compares the number of basophils with the total white blood cell count. Their percentage can change when other white blood cell counts change, even if their absolute count stays the same. Basophils are granulocytes. When activated, they release histamine and other substances that contribute to inflammation. Basophils play a role in allergic reactions.

This percentage describes the composition of the white blood cells circulating in blood. Basophil activation and histamine release are separate processes. The differential shows how well represented the cells are in the sample but not how active they are.

Basophils make up a small part of the differential, and their percentage depends on the entire white cell count. Relating their fraction to WBC gives the number of basophils per liter. One result describes composition and the other gives cell numbers.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK27092/
https://www.ncbi.nlm.nih.gov/books/NBK261/
https://pmc.ncbi.nlm.nih.gov/articles/PMC5991659/'),
  ('nlr', 'NLR рассчитывают, деля абсолютное число нейтрофилов на абсолютное число лимфоцитов, выраженные в одинаковых единицах. Результат показывает, сколько нейтрофилов приходится на один лимфоцит.

У NLR нет единицы измерения: единицы обоих абсолютных чисел сокращаются при делении. Если оба числа меняются в одинаковой пропорции, NLR остаётся тем же. Поэтому отношение описывает соотношение двух групп клеток, а их исходное количество видно только по отдельным результатам.

Для расчёта нужны результаты обеих клеточных популяций из одной пробы. При нулевом знаменателе отношение не определяется. Если отношение рассчитано, для восстановления каждого исходного числа всё равно требуется дополнительная информация.

Источники
https://doi.org/10.1186/s12865-025-00797-2', 'NLR is calculated by dividing the absolute neutrophil count by the absolute lymphocyte count, using the same units for both. The result expresses how many neutrophils there are per lymphocyte.

NLR is unitless because the units of the two absolute counts cancel out in division. If both counts change in the same proportion, NLR stays the same. The ratio describes the balance between the two cell groups, while their underlying numbers can be seen only in the individual counts.

The calculation requires both cell populations from the same sample. A zero denominator makes the ratio undefined. Even when the ratio can be calculated, additional information is needed to recover either original count.

Sources
https://doi.org/10.1186/s12865-025-00797-2'),
  ('esr', 'В методе Вестергрена образец крови с антикоагулянтом оставляют в вертикальной трубке. Эритроциты оседают, оставляя сверху слой плазмы. Через час измеряют высоту этого слоя. Склонность эритроцитов собираться в агрегаты влияет на оседание. В этом процессе участвуют белки плазмы, в том числе фибриноген.

Когда эритроциты объединяются, агрегаты оседают иначе, чем отдельные клетки. На высоту слоя плазмы влияет также доля объёма образца, занятая эритроцитами. Поэтому измерение отражает совместное влияние клеток и плазмы на оседание в пробирке.

В классической пробе результат выражают как высоту слоя плазмы в миллиметрах за установленный час. Это наблюдение за оседанием в вертикальной трубке, где клетки в течение опыта могут образовывать агрегаты. Оно не измеряет скорость движения эритроцитов внутри кровеносных сосудов.

Источники
https://onlinelibrary.wiley.com/doi/full/10.1111/j.1751-553X.2011.01302.x
https://pubmed.ncbi.nlm.nih.gov/15559996/', 'In the Westergren method, anticoagulated blood is left in a vertical tube. The red blood cells settle, leaving a layer of plasma above them. The height of that layer is measured after one hour. The tendency of red blood cells to form aggregates affects settling. Plasma proteins, including fibrinogen, contribute to this process.

When red blood cells form aggregates, they settle differently from individual cells. The height of the plasma layer also depends on the fraction of the sample occupied by red blood cells. The measurement thus reflects the combined effects of cells and plasma on settling in the tube.

In the classic test, the plasma layer is measured in millimeters after a fixed hour. It is an observation in a vertical tube, where cells can form aggregates during the test. It does not measure how fast red cells move through blood vessels.

Sources
https://onlinelibrary.wiley.com/doi/full/10.1111/j.1751-553X.2011.01302.x
https://pubmed.ncbi.nlm.nih.gov/15559996/'),
  ('albumin_fraction', 'Альбуминовая фракция отражает содержание альбумина среди белков сыворотки. При электрофорезе альбумин образует отдельную зону.

Этот белок синтезируется в печени, переносит ряд веществ, включая жирные кислоты, и участвует в удержании воды в сосудистом русле. Долю фракции и её концентрацию выражают в разных единицах.

На электрофореграмме сначала оценивают вклад альбумина в общий сигнал белков. Если лаборатория выдаёт концентрацию фракции, её можно получить из доли и концентрации общего белка. Одинаковая доля при разных значениях общего белка поэтому может соответствовать разной концентрации альбумина.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/', 'The albumin fraction represents albumin among serum proteins. Albumin forms a distinct zone during electrophoresis.

It is made in the liver, carries substances such as fatty acids, and helps retain water in the circulation. The fraction can be reported as a proportion or a concentration.

On the electrophoresis trace the albumin contribution to the total protein signal is assessed first. If the laboratory reports a fraction concentration, it can derive it from the fraction and total protein concentration. The same fraction can therefore correspond to different albumin concentrations when total protein differs.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/'),
  ('alpha-1_globulin_fraction', 'Альфа-1 глобулины — группа белков, которые при электрофорезе образуют одну фракцию. Один из её основных компонентов — альфа-1-антитрипсин, который ограничивает действие ряда ферментов, расщепляющих белки.

Измерение фракции суммирует сигнал нескольких белков и не определяет каждый по отдельности. Белки разделяются по тому, как они перемещаются в электрическом поле при заданных условиях.

Несколько белков попадают в альфа-1-зону из-за близкой подвижности. Поэтому анализ альфа-1-фракции и отдельное количественное определение альфа-1-антитрипсина описывают разные величины.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/', 'Alpha-1 globulins are a group of proteins that form one fraction on electrophoresis. A major component is alpha-1 antitrypsin, which inhibits several protein-degrading enzymes.

The fraction combines the signal from several proteins and does not measure each individually. Proteins are separated by how they move in an electric field under defined conditions.

Several proteins enter the alpha-1 zone because they have similar mobility. The alpha-1 fraction and a separate quantitative alpha-1 antitrypsin test therefore describe different quantities.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/'),
  ('ferrum', 'Анализ сывороточного железа измеряет железо, которое циркулирует преимущественно в связи с трансферрином. Трансферрин переносит его между тканями, в том числе к клеткам костного мозга для образования гемоглобина.

Сывороточная концентрация характеризует транспортируемое железо в момент взятия образца. При лабораторном измерении железо высвобождают из комплекса с транспортным белком, чтобы определить его количество.

Это позволяет оценить, сколько железа находилось в циркулирующем пуле. Способность сыворотки связать дополнительное железо оценивают другим показателем — ОЖСС.

Источники
https://nutritionalassessment.org/iron/', 'Serum iron measures circulating iron, most of which is bound to transferrin. Transferrin carries iron between tissues, including to bone marrow cells making hemoglobin.

The serum concentration describes circulating transport iron at the time of sampling. In the laboratory, iron is released from its transport complex so its amount can be measured.

This estimates how much iron was in the circulating pool. The capacity of serum to bind additional iron is assessed separately using TIBC.

Sources
https://nutritionalassessment.org/iron/'),
  ('transferrin', 'Трансферрин — белок, который переносит железо в крови. Он синтезируется в печени и обратимо связывает железо.

На клетках есть рецепторы, через которые железо из трансферрина поступает внутрь. Анализ измеряет количество белка, включая молекулы со свободными местами связывания.

У молекулы трансферрина есть два места для связывания железа. Они могут быть заняты полностью, частично или оставаться свободными. Поэтому количество трансферрина и доля его занятых мест несут разную информацию: первая величина описывает переносчик, а вторая — его загрузку.

Источники
https://nutritionalassessment.org/iron/', 'Transferrin is the protein that carries iron in blood. The liver makes it, and it binds iron reversibly.

Cells take up transferrin-bound iron through receptors. The test measures the protein, including molecules with unoccupied binding sites.

A transferrin molecule has two iron-binding sites. They may both be occupied, only partly occupied, or remain empty. Transferrin concentration and the fraction of occupied sites therefore describe the carrier and its loading, respectively.

Sources
https://nutritionalassessment.org/iron/'),
  ('ferritin', 'Ферритин — белок, в котором клетки хранят железо. Его оболочка удерживает железо в форме, доступной для последующего использования.

Небольшая часть ферритина циркулирует в крови. Измерение сывороточного ферритина используют как косвенную оценку запасов, поскольку количество железа в тканях этим анализом напрямую не измеряют.

Для хранения клетка помещает железо внутрь ферритина, где оно отделено от остальной клеточной среды. При необходимости этот запас может быть мобилизован. Измеряемый в крови ферритин — небольшая циркулирующая часть белка, поэтому анализ измеряет концентрацию белка, а не массу хранящегося в нём железа.

Источники
https://nutritionalassessment.org/iron/', 'Ferritin is the protein cells use to store iron. Its shell holds iron in a form that can be made available later.

A small amount circulates in blood. Serum ferritin is used as an indirect indicator of iron stores because the test does not measure tissue iron directly.

A cell stores iron inside ferritin, separating it from the surrounding cell environment. The store can be mobilized when needed. Blood ferritin is a small circulating portion of the protein, so the assay measures protein concentration rather than the mass of iron stored inside it.

Sources
https://nutritionalassessment.org/iron/'),
  ('tibc', 'ОЖСС оценивает общее количество железа, которое могут связать белки сыворотки. Большую часть этой способности обеспечивает трансферрин.

Показатель включает как места связывания, уже занятые железом, так и свободные. Долю занятых мест отдельно характеризует насыщение трансферрина.

Один способ оценить общую ёмкость — сложить измеренное сывороточное железо и незанятую железосвязывающую способность. Оба результата должны быть выражены в одинаковых единицах. Такое сложение показывает полную ёмкость, а не только количество железа, которое уже переносится кровью.

Источники
https://nutritionalassessment.org/iron/', 'Total iron-binding capacity estimates how much iron serum proteins can bind in total. Transferrin accounts for most of this capacity.

The measure includes sites already occupied by iron and sites still available. Transferrin saturation describes the occupied fraction separately.

One way to estimate total capacity is to add measured serum iron and unsaturated iron-binding capacity. Both must use the same units. This gives total capacity, rather than only the iron already being carried in blood.

Sources
https://nutritionalassessment.org/iron/'),
  ('ceruloplasmin', 'Церулоплазмин — белок крови, связывающий большую часть меди в плазме. Он образуется в печени и обладает ферроксидазной активностью: помогает окислять железо до формы, которую может связать трансферрин.

Концентрация белка и его ферментная активность — разные измерения. В обмене железа церулоплазмин действует на его химическую форму, а трансферрин связывает и переносит получившееся железо.

Это последовательные роли двух белков. Измерение церулоплазмина не показывает, какая часть мест связывания трансферрина уже занята.

Источники
https://nutritionalassessment.org/copper/', 'Ceruloplasmin is a blood protein that binds most of the copper in plasma. The liver makes it, and its ferroxidase activity helps oxidize iron to a form that transferrin can bind.

Protein concentration and enzyme activity are distinct measurements. In iron metabolism, ceruloplasmin acts on iron’s chemical form, while transferrin binds and carries the resulting iron.

These are successive roles of two proteins. Measuring ceruloplasmin does not show what share of transferrin’s binding sites is occupied.

Sources
https://nutritionalassessment.org/copper/'),
  ('total_protein', 'Общий белок показывает суммарную концентрацию белков в сыворотке. Основную долю обычно составляет альбумин, остальную — глобулины, включая транспортные белки и антитела.

Одна суммарная величина не показывает, как белки распределены между фракциями, для этого используют отдельные измерения. Материал исследования важен: сыворотка остаётся после свёртывания крови, когда значительная часть фибриногена уже ушла в сгусток.

В плазме фибриноген сохраняется. Поэтому под общим белком сыворотки понимают сумму белков именно в сывороточном образце.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/', 'Total protein is the combined concentration of proteins in serum. Albumin usually accounts for the largest share, with globulins such as transport proteins and antibodies making up the rest.

The total does not show how proteins are distributed among the fractions, which are assessed separately. The sample matters: serum is what remains after clotting, when much of the fibrinogen has entered the clot.

Plasma retains fibrinogen. Serum total protein therefore describes the proteins in the serum sample specifically.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/'),
  ('urea', 'Мочевина — продукт, в который печень превращает часть азота при обмене аминокислот. В таком виде азот переносится кровью и выводится преимущественно почками.

Анализ измеряет концентрацию всей молекулы мочевины. В бланках с обозначением BUN указывают только азот, входящий в её состав.

После образования мочевина циркулирует в крови и поступает в почечный фильтрат. Часть профильтрованной мочевины возвращается в кровь через канальцы. Сывороточная концентрация складывается из образования, распределения и выведения, поэтому не равна количеству мочевины, удаляемому с мочой за сутки.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK305/', 'Urea is a product the liver makes from part of the nitrogen released during amino acid metabolism. It travels in blood and is eliminated mainly by the kidneys.

A urea test reports the concentration of the whole molecule. A result labeled BUN reports only the nitrogen it contains.

After formation, urea travels in blood and enters the renal filtrate. Some filtered urea returns to the blood through the tubules. Serum concentration reflects production, distribution, and elimination, so it is distinct from the amount excreted in urine over a day.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK305/'),
  ('ammonia', 'Анализ амиака отражает содержание аммиака и аммония в крови. Эти формы азота переходят одна в другую в зависимости от кислотности среды.

Азот образуется, в частности, при обмене аминокислот и работе кишечных бактерий. Печень включает значительную его часть в мочевину, которая затем выводится почками.

Анализ представляет собой измерение азотистых соединений, уже находившихся в крови в момент взятия пробы. Мочевина образуется на следующем этапе переработки, поэтому показатели аммиака и мочевины относятся к разным этапам одного пути. По одному результату нельзя узнать скорость всех реакций этого пути.

Источники
https://medlineplus.gov/lab-tests/ammonia-levels/', 'The blood ammonia test reflects ammonia and ammonium in blood. These forms interconvert depending on acidity.

Their nitrogen comes in part from amino acid metabolism and intestinal bacteria. The liver incorporates much of it into urea, which is then excreted by the kidneys.

The test measures nitrogen compounds present in blood at sampling. Urea forms at a later processing step, so ammonia and urea describe different stages of one pathway. One result cannot reveal the rates of all reactions in that pathway.

Sources
https://medlineplus.gov/lab-tests/ammonia-levels/'),
  ('creatinine', 'Креатинин образуется из креатина и фосфокреатина, которые участвуют в энергетическом обмене мышц. Он поступает в кровь, фильтруется почками и в небольшой степени выделяется канальцами.

Его концентрация отражает сочетание образования и выведения. Для расчётной скорости фильтрации используют отдельную формулу.

Часть креатинина, которая оказывается в моче, зависит от его доставки к почкам, фильтрации и секреции. Из концентрации в крови можно рассчитать оценку фильтрации с использованием других сведений. Само лабораторное измерение креатинина и полученная расчётом оценка — два разных результата.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK305/', 'Creatinine forms from creatine and phosphocreatine, which participate in muscle energy metabolism. It enters blood, is filtered by the kidneys, and is also secreted to a small extent by renal tubules.

Its concentration reflects both production and elimination. Estimated filtration is obtained using a separate equation.

The amount of creatinine reaching urine depends on delivery to the kidneys, filtration, and secretion. Blood concentration and other information can be used to estimate filtration. The creatinine measurement and the calculated estimate are separate results.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK305/'),
  ('uric_acid', 'Мочевая кислота — конечный продукт распада пуринов у человека. Пурины входят в состав ДНК и РНК и поступают из обмена собственных клеток и пищи.

В крови соединение присутствует преимущественно в виде урата. Его концентрация связана с образованием и выведением через почки и кишечник.

Почки не только фильтруют урат, но и возвращают или выделяют его через канальцы. Поэтому концентрация в крови не равна его выделению с мочой. Это разные способы описать обмен одного вещества — циркулирующее количество на объём и выведение за выбранный промежуток времени.

Источники
https://medlineplus.gov/lab-tests/uric-acid-test/', 'Uric acid is the final product of purine breakdown in humans. Purines are components of DNA and RNA and come from the body’s own metabolism and food.

In blood the compound is mostly present as urate. Its concentration reflects production and elimination through the kidneys and gut.

The kidneys filter urate and also reabsorb or secrete it through the tubules. Blood concentration therefore differs from urinary excretion. These describe the same compound in different ways: circulating amount per volume and elimination over time.

Sources
https://medlineplus.gov/lab-tests/uric-acid-test/'),
  ('alanine_aminotransferase', 'АЛТ — фермент, участвующий в обмене аминокислот. Он переносит аминогруппу с аланина, связывая обмен аминокислот с образованием пирувата.

Фермент содержится преимущественно в клетках печени, но встречается и в других тканях. В сыворотке измеряют его каталитическую активность.

При определении активности измеряют, насколько быстро фермент ведёт реакцию в заданных условиях. Результат в единицах активности зависит от количества активного фермента в пробе и условий метода. Он не сообщает, сколько АЛТ находится внутри клеток печени или других тканей.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC3866949/', 'ALT is an enzyme involved in amino acid metabolism. It transfers an amino group from alanine, linking amino acid metabolism to pyruvate formation.

ALT is abundant in liver cells but is also found in other tissues. Serum testing measures its catalytic activity.

An activity assay measures how fast an enzyme carries out a reaction under specified conditions. The result depends on the active enzyme in the sample and the conditions of the method. It does not give the amount of ALT inside liver cells or other tissues.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC3866949/'),
  ('aspartate_aminotransferase', 'АСТ — фермент, который переносит аминогруппу с аспартата. Реакция связывает обмен аминокислот с превращениями оксалоацетата.

АСТ содержится в печени, мышцах и других тканях, причём у фермента есть цитозольная и митохондриальная формы. Анализ измеряет их суммарную активность в сыворотке.

Обычный анализ АСТ не разделяет цитозольную и митохондриальную формы. При измерении обе могут вносить вклад в общую скорость реакции в пробе. Это отличает суммарную активность от отдельных измерений, которые определяли бы конкретную форму или источник фермента.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC3866949/', 'AST transfers an amino group from aspartate. This reaction connects amino acid metabolism with oxaloacetate metabolism.

AST occurs in the liver, muscle, and other tissues and has cytosolic and mitochondrial forms. The test measures their combined activity in serum.

A routine AST assay does not distinguish cytosolic and mitochondrial AST. Both forms can contribute to the overall reaction rate in the sample. Total activity thus differs from a test designed to identify a particular form or source.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC3866949/'),
  ('alkaline_phosphatase', 'Щелочная фосфатаза — семейство ферментов, отщепляющих фосфат при щелочной реакции среды. Формы фермента есть в печени и костной ткани, а также в других тканях.

Обычный анализ показывает суммарную активность этих форм. Для разделения вклада разных форм существуют исследования изоферментов.

В тканях разные изоформы выполняют свою работу в разных условиях. Например, костная форма связана с минерализацией, а печёночная относится к ферментам, присутствующим у желчных канальцев. Биохимический анализ оценивает их общую активность, не взвешивая количество белка в каждой ткани.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK203/', 'Alkaline phosphatase is a family of enzymes that remove phosphate groups under alkaline conditions. Forms of the enzyme occur in the liver, bone, and other tissues.

A routine test measures their combined activity. Isoenzyme tests can distinguish the contribution of specific forms.

Different isoforms work in different tissue environments. For example, the bone form is associated with mineralization, while the liver form occurs near bile canaliculi. The chemistry assay measures combined activity rather than the mass of protein in each tissue.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK203/'),
  ('bilirubin', 'Общий билирубин охватывает формы пигмента, которые появляются при распаде гема, главным образом из гемоглобина. Сначала билирубин переносится к печени в связи с альбумином.

В печени он преобразуется в более водорастворимую форму и выделяется в желчь. Общий показатель объединяет фракции, которые в бланке могут быть указаны отдельно.

Путь билирубина включает две разные задачи: доставить плохо растворимую форму к печени и сделать её пригодной для выведения с желчью. Анализ на общий билирубин даёт одну суммарную величину. Определение фракций показывает, как эта величина делится на прямую и непрямую части по лабораторному методу.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK413/', 'Total bilirubin includes forms of the pigment produced when heme, chiefly from hemoglobin, is broken down. Bilirubin first travels to the liver bound to albumin.

The liver converts it to a more water-soluble form and excretes it into bile. The total combines fractions that may be reported separately.

Bilirubin metabolism has two distinct steps: getting the poorly soluble form to the liver and making it suitable for excretion in bile. A total bilirubin test provides one combined measure. Fraction testing shows how the total is divided into direct and indirect components by the method.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK413/'),
  ('direct-bilirubin', 'Прямой билирубин — фракция, которую определяет прямая лабораторная реакция. Её основу составляет билирубин, соединённый в печени с глюкуроновой кислотой.

Это повышает его растворимость в воде и позволяет выделять его с желчью. В зависимости от метода в прямую фракцию может входить и билирубин, прочно связанный с альбумином.

Слово «прямой» относится к способу измерения. Часть билирубина реагирует в условиях анализа без обработки, необходимой для измерения всего билирубина. Из-за вклада других реагирующих форм прямой результат близок к конъюгированной фракции, но эти понятия не во всех методах полностью совпадают.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK413/', 'Direct bilirubin is the fraction measured by the direct laboratory reaction. It consists mainly of bilirubin that the liver has joined to glucuronic acid, making it more water-soluble and allowing excretion into bile.

Depending on the method, the direct fraction can also include bilirubin tightly bound to albumin. The word “direct” describes the measurement method.

Part of the bilirubin reacts without the treatment needed to measure total bilirubin. Because other forms may contribute to that response, direct bilirubin approximates the conjugated fraction but is not identical to it in every method.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK413/'),
  ('indirect_bilirubin', 'Непрямой билирубин отражает преимущественно неконъюгированный билирубин. Он образуется при распаде гема и плохо растворим в воде, поэтому переносится к печени в связи с альбумином.

В лабораторном бланке его обычно получают как разность общего и прямого билирубина. В типичном бланке непрямая фракция — вычисляемая величина.

Она использует два измерения одной пробы, поэтому особенности расчёта общего и прямого билирубина могут влиять и на разность. Этот результат относится к распределению пигмента в образце, а не к скорости распада гемоглобина.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK413/', 'Indirect bilirubin mainly represents unconjugated bilirubin. It forms when heme is broken down and is poorly soluble in water, so it travels to the liver bound to albumin.

Laboratories usually report it as the difference between total and direct bilirubin. In a typical report, the indirect fraction is a calculated quantity.

It uses two measurements from the same sample, so aspects of the total and direct methods can affect their difference. The result describes pigment distribution in the sample rather than the rate of hemoglobin breakdown.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK413/'),
  ('cholesterol', 'Общий холестерин показывает суммарное количество холестерина, переносимого разными липопротеинами крови. Холестерин входит в состав клеточных мембран и служит исходным веществом для синтеза стероидных гормонов и желчных кислот.

Поскольку холестерин плохо растворим в воде, он циркулирует в составе частиц. Общая концентрация не показывает распределение между ними.

Лабораторный итог объединяет свободный холестерин и холестерин, связанный с жирными кислотами в форме эфиров. Во фракциях эти формы упакованы по-разному, но в общем показателе их вклады суммируются. Отдельные строки ЛПВП и ЛПНП помогают описать распределение холестерина между группами частиц.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK305896/
https://www.ncbi.nlm.nih.gov/books/NBK355892/', 'Total cholesterol measures the combined amount of cholesterol carried by different lipoproteins in blood. Cholesterol is a component of cell membranes and a starting material for steroid hormones and bile acids.

Because it is poorly soluble in water, it circulates in particles. The total does not show how cholesterol is distributed among them.

The laboratory total includes free cholesterol and cholesterol esterified to fatty acids. These forms are packaged differently in lipoprotein particles, but their contributions are summed in the total. Separate HDL and LDL results describe cholesterol distribution across particle groups.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK305896/
https://www.ncbi.nlm.nih.gov/books/NBK355892/'),
  ('hdl-cholesterol', 'ЛПВП-холестерин показывает количество холестерина, переносимого липопротеинами высокой плотности. Частицы ЛПВП участвуют в переносе холестерина от клеток к печени напрямую или через обмен с другими частицами.

Лабораторное значение сообщает, сколько холестерина находится в этой фракции, и не измеряет скорость переноса. Когда частица ЛПВП принимает холестерин, часть его превращается в эфиры и перемещается внутрь частицы.

Так частица может переносить холестерин в кровотоке и передавать его в другие звенья обмена. Измерение ЛПВП-холестерина описывает груз в этой группе частиц, а не число самих частиц.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK305896/', 'HDL cholesterol is the amount of cholesterol carried in high-density lipoproteins. HDL particles participate in moving cholesterol from cells toward the liver, directly or by exchange with other particles.

The test measures how much cholesterol is in this fraction, not the rate of transport. When an HDL particle accepts cholesterol, some is esterified and moves into its core.

The particle can carry cholesterol through the blood and pass it to other parts of the transport pathway. HDL cholesterol measures the cargo in this particle group rather than the number of particles.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK305896/'),
  ('ldl-cholesterol', 'ЛПНП-холестерин показывает количество холестерина, переносимого липопротеинами низкой плотности. Эти частицы образуются при переработке других липопротеинов и доставляют холестерин к клеткам через рецепторы ЛПНП.

В бланке указывают количество переносимого холестерина, которое может быть измерено или рассчитано в зависимости от метода. ЛПНП образуются по мере того, как частицы-предшественники теряют часть триглицеридов.

Состав получившихся частиц может отличаться, поэтому одинаковое количество холестерина может переноситься разным числом частиц. ЛПНП-холестерин измеряет суммарный груз этой группы.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK305896/', 'LDL cholesterol is the amount of cholesterol carried in low-density lipoproteins. These particles form during the processing of other lipoproteins and deliver cholesterol to cells through LDL receptors.

The report gives the amount of cholesterol carried, which may be measured or calculated depending on the method. LDL forms as precursor particles lose some of their triglycerides.

The resulting particles can differ in composition, so the same amount of cholesterol can be carried by different numbers of particles. LDL cholesterol measures the combined cargo of this group.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK305896/'),
  ('triglycerides', 'Триглицериды — соединения глицерина с тремя жирными кислотами, в которых организм переносит и запасает энергию. В крови их несут главным образом хиломикроны из кишечника и ЛПОНП из печени.

Ферменты высвобождают из этих частиц жирные кислоты, которые ткани могут использовать или запасать. После доставки к тканям липопротеинлипаза расщепляет триглицериды на поверхности капилляров.

Высвобождённые жирные кислоты могут служить топливом или снова включаться в запасаемые липиды. Анализ крови показывает, сколько триглицеридов находится в циркулирующем пуле, а не скорость их поступления в клетки.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK305896/', 'Triglycerides consist of glycerol and three fatty acids and are a form in which the body transports and stores energy. They circulate mainly in chylomicrons from the intestine and VLDL from the liver.

Enzymes release fatty acids from these particles for tissues to use or store. After delivery to tissues, lipoprotein lipase breaks down triglycerides at capillary surfaces.

Released fatty acids can be used as fuel or incorporated into stored lipids again. A blood test measures the circulating triglyceride pool, not how fast those fatty acids enter cells.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK305896/'),
  ('glucose', 'Глюкоза — сахар, который служит источником энергии для клеток. Она поступает из кишечника после еды и выделяется печенью между приёмами пищи.

Часть глюкозы ткани расходуют, а часть может запасаться в виде гликогена. Анализ показывает её концентрацию в момент взятия образца.

Когда источник глюкозы из пищи временно исчезает, печень может расщеплять запасы гликогена и образовывать глюкозу из других веществ. Так в крови поддерживается поток глюкозы для тканей. Результат разовой пробы описывает концентрацию в конкретный момент, а показатели гликирования охватывают более долгий период.

Источники
https://openstax.org/books/biology-2e/pages/37-3-regulation-of-body-processes', 'Glucose is a sugar that supplies energy to cells. It enters blood from the intestine after meals and is released by the liver between meals.

Tissues use some glucose and may store some as glycogen. The test measures its concentration at the time of sampling.

When dietary glucose is temporarily unavailable, the liver can break down glycogen and produce glucose from other substances. This helps maintain delivery to tissues. A single sample describes concentration at a specific moment, while glycation measures cover a longer period.

Sources
https://openstax.org/books/biology-2e/pages/37-3-regulation-of-body-processes'),
  ('insulin', 'Инсулин — гормон бета-клеток поджелудочной железы, участвующий в регуляции глюкозы. При поступлении глюкозы инсулин помогает мышцам и жировой ткани её поглощать и ограничивает выделение глюкозы печенью.

Концентрация в пробе зависит и от секреции гормона, и от того, как быстро он выводится из кровотока. В мышечной и жировой клетке сигнал от рецептора инсулина помогает переместить переносчики глюкозы к мембране.

В результате глюкоза легче попадает внутрь этих клеток. Концентрация инсулина в крови описывает присутствие гормона, а силу клеточного ответа напрямую не измеряет.

Источники
https://openstax.org/books/biology-2e/pages/37-3-regulation-of-body-processes', 'Insulin is a pancreatic beta-cell hormone that helps regulate glucose. When glucose enters the circulation, insulin promotes its uptake by muscle and fat and limits glucose release by the liver.

Its concentration in the sample reflects both secretion and clearance. In muscle and fat cells, insulin receptor signaling helps move glucose transporters to the cell membrane.

This facilitates glucose uptake into these cells. Blood insulin concentration describes the presence of the hormone without directly measuring the strength of the cellular response.

Sources
https://openstax.org/books/biology-2e/pages/37-3-regulation-of-body-processes'),
  ('fructosamine', 'Фруктозамин отражает содержание белков сыворотки, к которым присоединилась глюкоза. Главный вклад обычно вносит альбумин.

Такое присоединение происходит без участия фермента, пока белок циркулирует. По времени фруктозамин охватывает более короткий период, чем HbA1c, поскольку белки сыворотки обновляются быстрее эритроцитов.

Поскольку большая часть измеряемого сигнала связана с альбумином, вклад в итог зависит и от концентрации циркулирующих белков, и от степени их гликирования. Фруктозамин отражает то, что накопилось на белках за время их циркуляции. Он отличается от измерения свободной глюкозы в той же пробе.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/', 'Fructosamine reflects serum proteins to which glucose has attached, with albumin usually making the largest contribution. This attachment occurs without an enzyme as proteins circulate.

It represents a shorter period than HbA1c because serum proteins turn over faster than red blood cells. Because albumin accounts for much of the signal, the total depends on both circulating protein concentrations and their degree of glycation.

Fructosamine reflects what accumulated on proteins over their time in circulation. It differs from measuring free glucose in the same sample.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/'),
  ('c-peptide', 'С-пептид образуется при превращении проинсулина в инсулин. Бета-клетки выделяют обе молекулы вместе.

Инсулин и С-пептид затем удаляются из крови с разной скоростью, поэтому их концентрации различаются. С-пептид помогает оценивать, сколько инсулина вырабатывают собственные бета-клетки.

В молекуле проинсулина С-пептид соединяет участки, которые становятся цепями инсулина. Когда соединительный участок удаляется, из одного предшественника получаются инсулин и одна молекула С-пептида. Поэтому измерение С-пептида можно связать с тем, как бета-клетки обрабатывают и выделяют собственный гормон.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/', 'C-peptide is generated when proinsulin is processed into insulin. Beta cells release the two products together.

Insulin and C-peptide then leave the circulation at different rates, so their concentrations differ. C-peptide helps assess insulin production by the body’s own beta cells.

In proinsulin, C-peptide connects the portions that become insulin’s chains. Processing removes that connecting segment, producing insulin and one C-peptide molecule from each precursor. The measurement can therefore be related to how beta cells process and release their own hormone.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/'),
  ('tsh', 'ТТГ — гормон гипофиза, который стимулирует щитовидную железу. Он связывается с рецепторами её клеток и поддерживает образование и выделение тиреоидных гормонов.

Тиреоидные гормоны, в свою очередь, влияют на секрецию ТТГ по механизму обратной связи. Так гипофиз и щитовидная железа регулируют друг друга.

В этой цепочке участвуют три уровня:
- Гипоталамус выделяет тиреотропин-рилизинг-гормон, который стимулирует гипофиз.
- Гипофиз выделяет ТТГ, который действует на щитовидную железу.
- Щитовидная железа выделяет Т₄ и Т₃. В анализе ТТГ измеряется сигнал гипофиза.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK279113/
https://www.ncbi.nlm.nih.gov/books/NBK285550/', 'TSH is a pituitary hormone that stimulates the thyroid gland. It binds receptors on thyroid cells and supports the production and release of thyroid hormones.

Thyroid hormones in turn affect TSH secretion through feedback. This links the activity of the pituitary and thyroid glands.

Three levels take part in this pathway:
- The hypothalamus releases thyrotropin-releasing hormone, which stimulates the pituitary.
- The pituitary releases TSH, which acts on the thyroid gland.
- The thyroid releases T₄ and T₃. The TSH assay measures the pituitary signal.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK279113/
https://www.ncbi.nlm.nih.gov/books/NBK285550/'),
  ('ft3', 'Свободный Т3 — доля трийодтиронина, которая не связана с транспортными белками крови. Часть Т3 выделяет щитовидная железа, а значительная часть образуется в тканях из Т4.

Т3 связывается с ядерными рецепторами и регулирует активность генов. Общий Т3 включает свободную и связанную части.

Ферменты-дейодиназы удаляют атом йода из Т₄, образуя Т₃ в ряде тканей. Свободный Т₃ в пробе связан с динамическим равновесием между образованием, использованием и связыванием с белками. Анализ описывает свободную концентрацию в крови, а не количество Т₃, которое образовалось внутри конкретной ткани.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK279113/
https://www.ncbi.nlm.nih.gov/books/NBK285545/', 'Free T3 is the fraction of triiodothyronine not bound to transport proteins in blood. The thyroid secretes some T3, and much of it is generated from T4 in tissues.

T3 binds nuclear receptors and regulates gene activity. Total T3 includes both free and protein-bound hormone.

Deiodinase enzymes remove an iodine atom from T₄ to produce T₃ in several tissues. Free T₃ in a sample reflects a dynamic balance among production, use, and protein binding. The test measures the free concentration in blood, not the amount produced inside a particular tissue.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK279113/
https://www.ncbi.nlm.nih.gov/books/NBK285545/'),
  ('ft4', 'Свободный Т4 — доля тироксина, которая не связана с транспортными белками крови. Тироксин составляет основную часть гормонов, выделяемых щитовидной железой.

В тканях часть Т4 превращается в Т3. Измерение свободной фракции отличается от общего Т4, который включает также белково-связанный гормон.

Белки-переносчики удерживают большую часть Т₄ и находятся в равновесии со свободной фракцией. Если количество связывающих белков меняется, общий и свободный Т₄ могут вести себя по-разному. Измерение FT4 выделяет именно свободную часть этой системы транспорта.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK279113/', 'Free T4 is the fraction of thyroxine not bound to transport proteins in blood. Thyroxine is the principal hormone secreted by the thyroid gland.

Some T4 is converted into T3 in tissues. Free T4 differs from total T4, which also includes protein-bound hormone.

Carrier proteins hold most T₄ and are in equilibrium with the free fraction. If the amount of binding protein changes, total and free T₄ can behave differently. FT4 focuses specifically on the unbound part of this transport system.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK279113/'),
  ('na', 'Анализ натрия измеряет концентрацию основного положительного иона внеклеточной жидкости. Натрий вместе с другими растворёнными веществами влияет на перемещение воды между клетками и окружающей средой.

Его концентрация зависит от соотношения натрия и воды. Она не равна общему количеству натрия в организме.

Организм регулирует количество воды и натрия совместной работой почек и гормональных сигналов. Изменение количества воды может менять концентрацию даже без такого же изменения общего количества натрия. Поэтому значение в бланке связано прежде всего с соотношением растворённого вещества и объёма воды.

Источники
https://medlineplus.gov/lab-tests/sodium-blood-test/', 'The sodium test measures the principal positive ion in extracellular fluid. Together with other dissolved substances, sodium influences how water moves between cells and their surroundings.

Its concentration depends on the balance between sodium and water and is not the same as total body sodium. The kidneys and hormonal signals jointly regulate the amounts of water and sodium.

A change in water content can change concentration without an equivalent change in the total amount of sodium. The reported value therefore reflects the balance of dissolved sodium and water volume.

Sources
https://medlineplus.gov/lab-tests/sodium-blood-test/'),
  ('k', 'Калий — основной положительный ион внутри клеток. Разница концентраций калия внутри и снаружи клетки участвует в формировании электрического потенциала её мембраны.

Это важно для работы мышц и нервов. Анализ крови измеряет внеклеточную концентрацию, хотя большая часть калия находится внутри клеток.

Клеточные насосы помогают поддерживать разницу концентраций натрия и калия через мембрану. Перемещение калия между клетками и внеклеточной жидкостью может менять результат крови даже без немедленного изменения общего количества калия. Почки участвуют в регулировании его выведения.

Источники
https://medlineplus.gov/lab-tests/potassium-blood-test/', 'Potassium is the main positive ion inside cells. The difference in potassium concentration across the cell membrane helps establish its electrical potential, which is important for muscle and nerve function.

A blood test measures the extracellular concentration even though most potassium is inside cells. Cell membrane pumps help maintain differences in sodium and potassium concentration across the membrane.

Movement of potassium between cells and extracellular fluid can change the blood result without an immediate change in total body potassium. The kidneys help regulate its excretion.

Sources
https://medlineplus.gov/lab-tests/potassium-blood-test/'),
  ('ca', 'Общий кальций включает свободные ионы кальция и кальций, связанный с белками или небольшими молекулами. Свободные ионы участвуют в клеточной сигнализации, мышечном сокращении и свёртывании крови.

Поэтому общий кальций характеризует суммарное содержание этих форм в пробе, а ионизированный кальций определяют отдельно. Основную белково-связанную долю кальция переносит альбумин.

Изменение количества этого белка может изменить вклад связанной формы в общий результат. Поэтому общий кальций и измерение свободных ионов отвечают на разные вопросы о пробе.

Источники
https://nutritionalassessment.org/calcium/', 'Total calcium includes free calcium ions and calcium bound to proteins or small molecules. Free ions take part in cell signaling, muscle contraction, and blood clotting.

Total calcium combines these forms in the sample, while ionized calcium is measured separately. Albumin carries most protein-bound calcium.

A change in the amount of albumin can change the bound contribution to the total result. Total calcium and a direct measurement of free ions therefore answer different questions about the sample.

Sources
https://nutritionalassessment.org/calcium/'),
  ('mg', 'Анализ магния измеряет его концентрацию в крови, где находится лишь небольшая часть магния организма. Большая часть распределена в костях и мягких тканях.

Магний взаимодействует с АТФ и участвует во многих реакциях ферментов. Концентрация в пробе описывает циркулирующую часть, а не все запасы.

Внутри клетки магний связывается с АТФ, а многие ферменты работают именно с этим комплексом. Циркулирующий магний обменивается с тканями, а почки регулируют его выведение. Анализ концентрации в крови описывает один доступный для измерения отсек этого обмена.

Источники
https://nutritionalassessment.org/magnesium/', 'The magnesium test measures its concentration in blood, which contains only a small share of body magnesium. Most is distributed in bone and soft tissues.

Magnesium interacts with ATP and participates in many enzyme reactions. Blood concentration describes the circulating portion rather than total stores.

Inside cells, magnesium binds ATP, and many enzymes use that complex. Circulating magnesium exchanges with tissues, and the kidneys regulate its excretion. The blood test describes one accessible compartment of this system.

Sources
https://nutritionalassessment.org/magnesium/'),
  ('p', 'Под названием «фосфор» в биохимическом анализе крови обычно измеряют неорганический фосфат. Фосфат входит в структуру костей, АТФ и нуклеиновых кислот, но анализ оценивает циркулирующую неорганическую фракцию.

Её концентрация связана с поступлением из кишечника, обменом с тканями и выведением почками. Почки возвращают часть профильтрованного фосфата в кровь, а остальное выделяют.

Баланс регулируют гормоны, которые также влияют на обмен фосфата с кишечником и костной тканью. Концентрация в пробе отражает результат этих процессов в момент измерения.

Источники
https://nutritionalassessment.org/phosphorus/', 'In blood chemistry, a test labeled phosphorus usually measures inorganic phosphate. Phosphate is part of bone, ATP, and nucleic acids, but the test measures the circulating inorganic fraction.

Its concentration reflects intestinal uptake, exchange with tissues, and excretion by the kidneys. The kidneys reabsorb some filtered phosphate and excrete the rest.

Hormones regulate this balance and also influence phosphate exchange with the intestine and bone. The sample concentration reflects the combined result of these processes at measurement.

Sources
https://nutritionalassessment.org/phosphorus/'),
  ('cl', 'Хлорид — основной отрицательно заряженный ион внеклеточной жидкости. Он помогает уравновешивать положительные заряды и участвует в поддержании водного и кислотно-основного баланса.

Анализ измеряет концентрацию хлорида в крови, где его содержание связано с обменом натрия и бикарбоната. При переносе углекислого газа эритроциты могут обменивать через мембрану хлорид и бикарбонат.

Почки также регулируют содержание электролитов в организме. Анализ крови показывает концентрацию циркулирующего хлорида и не измеряет скорость этих потоков.

Источники
https://medlineplus.gov/lab-tests/chloride-blood-test/', 'Chloride is the principal negatively charged ion in extracellular fluid. It helps balance positive charges and participates in fluid and acid–base balance.

The test measures chloride in blood, where its concentration is linked to sodium and bicarbonate handling. During carbon dioxide transport, red blood cells can exchange chloride and bicarbonate across their membranes.

The kidneys also regulate body electrolytes. A blood test gives the circulating chloride concentration without measuring the rates of those movements.

Sources
https://medlineplus.gov/lab-tests/chloride-blood-test/'),
  ('alpha-2_globulins', 'Альфа-2 глобулины — группа белков, образующих общую зону на электрофореграмме. В неё входят, в частности, гаптоглобин, связывающий свободный гемоглобин, и альфа-2-макроглобулин, который связывает протеазы.

Измерение объединяет вклад этих и других белков с близкой электрофоретической подвижностью. Зона альфа-2 образуется после разделения белков по их электрофоретической подвижности.

Площадь зоны отражает общий вклад всех белков, расположившихся здесь. Чтобы узнать вклад конкретного компонента, например гаптоглобина, его определяют отдельно.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/', 'Alpha-2 globulins are proteins that share a zone on the electrophoresis trace. They include haptoglobin, which binds free hemoglobin, and alpha-2 macroglobulin, which binds proteases.

The measurement combines these and other proteins with similar electrophoretic mobility. The alpha-2 zone forms after proteins are separated by electrophoretic mobility.

Its area reflects the combined contribution of all proteins in that region. The contribution of a particular component, such as haptoglobin, requires a separate measurement.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/'),
  ('beta_globulins', 'Бета-глобулины — белки сыворотки, которые образуют бета-зону при электрофорезе. Среди них есть белки транспорта, например трансферрин, и белки иммунной системы, включая компоненты комплемента.

При более детальном разделении зону делят на бета-1 и бета-2. Суммарная фракция объединяет их вклад.

При электрофорезе фракцию можно выразить как долю общего сигнала или пересчитать в концентрацию. Это результат для зоны, в которую попали белки с близкой подвижностью. Если отчёт разделяет бета-зону, бета-1 и бета-2 следует читать как отдельные части этого общего результата.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/', 'Beta globulins are serum proteins that form the beta zone on electrophoresis. They include transport proteins such as transferrin and immune proteins such as complement components.

A higher-resolution separation distinguishes beta-1 and beta-2. The combined fraction includes both contributions.

Electrophoresis can report the fraction as a share of the total signal or convert it to a concentration. It describes a zone containing proteins of similar mobility. When the report splits the beta zone, beta-1 and beta-2 are distinct parts of that combined result.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/'),
  ('beta-2_globulins', 'Бета-2 глобулины составляют одну из двух частей бета-зоны электрофореграммы. В эту область может попадать компонент комплемента C3, участвующий в иммунной защите.

Состав пика зависит от метода разделения. Результат отражает суммарный сигнал зоны, а концентрацию C3 измеряют отдельно.

Бета-2-зона определяется местом белков на электрофореграмме, а не общностью их функций. Компоненты, попавшие в одну область, измеряются вместе. Поэтому принадлежность C3 к этой области объясняет часть сигнала, но не позволяет по фракции вычислить концентрацию одного C3.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/
https://www.mycts.org/Portals/0/Assay_PI/Source%20Plasma/Serum%20Protein.pdf', 'Beta-2 globulins form one of the two regions of the beta zone on an electrophoresis trace. This region can include complement component C3, which participates in immune defense.

Peak composition depends on the separation method. The result reports the zone as a whole, while C3 can be measured separately.

The beta-2 zone is defined by the position of proteins on the trace rather than a shared function. Components that migrate into the same region are measured together. The presence of C3 in the region helps explain part of its signal but cannot be used to calculate C3 concentration alone.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/
https://www.mycts.org/Portals/0/Assay_PI/Source%20Plasma/Serum%20Protein.pdf'),
  ('gamma_globulins', 'Гамма-глобулины — фракция сывороточных белков, которую выделяют электрофорезом. Значительную часть составляют иммуноглобулины, вырабатываемые плазматическими клетками.

Некоторые иммуноглобулины могут мигрировать и в соседние зоны, поэтому гамма-фракция не заменяет измерения отдельных классов антител. Иммуноглобулины разных классов и с разной электрофоретической подвижностью могут формировать широкий общий профиль.

Количественная гамма-фракция сводит этот профиль к одной величине. Она не показывает, какие антигены распознают антитела или каков вклад каждого класса.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/', 'Gamma globulins are a fraction of serum proteins separated by electrophoresis. Immunoglobulins produced by plasma cells account for much of the fraction.

Some immunoglobulins can migrate into neighboring zones, so the gamma fraction does not replace tests for individual antibody classes. Different immunoglobulin classes and mobilities can generate a broad combined profile.

The gamma fraction summarizes that profile as one quantity. It does not show which antigens the antibodies recognize or how much each class contributes.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/'),
  ('ggtp', 'ГГТП — фермент, который переносит гамма-глутамильные группы и участвует в обмене глутатиона. Он связан с клеточными мембранами и встречается, в частности, в печени и желчевыводящих путях.

Анализ измеряет активность фермента в сыворотке и не разделяет её по отдельным органам. Глутатион участвует в окислительно-восстановительных реакциях, а ГГТП помогает перерабатывать его компоненты у поверхности клеток.

Для определения активности ферменту предоставляют субстрат в условиях лабораторного метода. Полученный сигнал относится к активности в пробе, а не к запасу глутатиона в тканях.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK203/', 'GGT transfers gamma-glutamyl groups and helps metabolize glutathione. It is associated with cell membranes and occurs in tissues including the liver and biliary tract.

The test measures enzyme activity in serum without assigning it to an individual organ. Glutathione participates in redox reactions, and GGT helps process its components at cell surfaces.

To measure activity, the laboratory supplies a substrate under defined assay conditions. The resulting signal concerns enzyme activity in the sample, not tissue glutathione stores.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK203/'),
  ('ldh', 'ЛДГ — фермент, который обеспечивает обратимое превращение пирувата и лактата. Реакция связана с обменом NADH и NAD⁺ и участвует в поддержании гликолиза.

Разные формы ЛДГ встречаются во многих тканях. Обычный анализ измеряет их суммарную активность в крови.

При превращении пирувата в лактат окисляется NADH, и образующийся NAD⁺ может снова участвовать в гликолизе. ЛДГ ускоряет и обратное превращение, если условия реакции этому способствуют. Лабораторное определение измеряет каталитическую активность, а не содержание лактата в пробе.

Источники
https://medlineplus.gov/lab-tests/lactate-dehydrogenase-ldh-test/
https://www.ncbi.nlm.nih.gov/books/NBK591140/', 'LDH catalyzes the reversible conversion of pyruvate and lactate. The reaction is coupled to NADH and NAD⁺ and supports glycolysis.

Different forms of LDH occur in many tissues. A routine test measures their combined activity in blood.

Conversion of pyruvate to lactate oxidizes NADH, allowing the regenerated NAD⁺ to participate in glycolysis again. LDH also accelerates the reverse conversion under suitable conditions. The laboratory assay measures catalytic activity rather than lactate concentration.

Sources
https://medlineplus.gov/lab-tests/lactate-dehydrogenase-ldh-test/
https://www.ncbi.nlm.nih.gov/books/NBK591140/'),
  ('glycated_hemoglobin', 'Гликированный гемоглобин образуется, когда глюкоза без участия ферментов присоединяется к гемоглобину в эритроцитах. По мере циркуляции клеток такое соединение накапливается, поэтому результат зависит от контакта клеток с глюкозой за предшествующее время.

HbA1c — конкретная стандартизованная фракция гликированного гемоглобина. Эритроциты в пробе находятся на разных этапах своего срока жизни.

Более старые клетки дольше контактировали с глюкозой, чем недавно образованные. Поэтому показатель гликирования объединяет вклад клеток разных возрастов и описывает прошлую экспозицию, тогда как анализ глюкозы показывает её концентрацию в момент взятия крови.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/', 'Glycated hemoglobin forms when glucose attaches to hemoglobin in red cells without an enzyme. It accumulates as the cells circulate, so the result reflects their previous exposure to glucose.

HbA1c is a specific standardized fraction of glycated hemoglobin. The red cells in the sample are at different stages of their life span.

Older cells have had longer exposure to glucose than recently produced cells. Glycation therefore combines contributions from cells of different ages and describes previous exposure, whereas a glucose assay measures concentration at sampling.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/'),
  ('antibodies-to-thyroglobulin', 'АТТГ — антитела, которые распознают тиреоглобулин. Этот белок образуется в щитовидной железе и служит основой для образования её гормонов.

Иммунологический анализ выявляет антитела к белку. Сам тиреоглобулин измеряют отдельным исследованием.

Тиреоглобулин находится в фолликулах щитовидной железы. На его молекуле йодированные остатки служат основой для образования гормонов, которые затем высвобождаются из белка. АТТГ определяют по связыванию антител с этим белком в условиях лабораторного метода.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK279113/
https://www.ncbi.nlm.nih.gov/books/NBK285550/', 'TgAb are antibodies that recognize thyroglobulin. The thyroid makes this protein and uses it as a scaffold for hormone synthesis.

An immunoassay detects antibodies against the protein. Thyroglobulin itself is measured by a separate test.

Thyroglobulin is found in thyroid follicles. Iodinated residues on the molecule are used to form hormones, which are subsequently released from the protein. TgAb testing detects antibodies binding to that protein under assay conditions.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK279113/
https://www.ncbi.nlm.nih.gov/books/NBK285550/'),
  ('antibody-to-thyroid-peroxidase ', 'АТПО — антитела к тиреопероксидазе, ферменту щитовидной железы. Тиреопероксидаза участвует в присоединении йода к остаткам тирозина в тиреоглобулине и в образовании тиреоидных гормонов.

Анализ определяет антитела к ферменту, а не скорость его работы. Фермент действует у поверхности клеток, обращённой к содержимому фолликула.

В этой области происходят йодирование и соединение йодированных остатков при образовании гормонов. Иммунологический результат описывает присутствие антител, способных распознать фермент, а содержание Т₃ и Т₄ измеряют отдельно.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK279113/
https://www.ncbi.nlm.nih.gov/books/NBK285550/', 'TPOAb are antibodies against thyroid peroxidase, an enzyme in the thyroid gland. Thyroid peroxidase helps attach iodine to tyrosine residues in thyroglobulin and form thyroid hormones.

The assay detects antibodies against the enzyme rather than measuring how fast it works. The enzyme acts at the cell surface facing the follicular contents.

Iodination and coupling of iodinated residues occur there during hormone formation. The immunoassay reports antibodies that recognize the enzyme, while T₃ and T₄ are measured separately.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK279113/
https://www.ncbi.nlm.nih.gov/books/NBK285550/'),
  ('beta-1_globulins', 'Бета-1 глобулины составляют одну из частей бета-зоны при электрофорезе сыворотки. Один из главных компонентов этой части — трансферрин, который переносит железо в крови.

Анализ измеряет общий сигнал белков в зоне. Содержание трансферрина можно измерить независимо.

Границу между бета-1 и бета-2 выделяют по профилю разделения. Выделенная бета-1-зона включает суммарный сигнал белков с похожей подвижностью даже тогда, когда трансферрин даёт основную часть сигнала. Для измерения именно переносчика железа нужен тест на трансферрин.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/
https://www.mycts.org/Portals/0/Assay_PI/Source%20Plasma/Serum%20Protein.pdf', 'Beta-1 globulins form one part of the beta zone in serum electrophoresis. A major component is transferrin, the protein that carries iron in blood.

The measurement combines the proteins in that zone. Transferrin concentration can also be measured independently.

The boundary between beta-1 and beta-2 is identified from the separation profile. The beta-1 zone includes the combined signal of proteins of similar mobility, even when transferrin contributes most of that signal. A transferrin assay is needed to measure the iron carrier itself.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/
https://www.mycts.org/Portals/0/Assay_PI/Source%20Plasma/Serum%20Protein.pdf'),
  ('de_ritis_ratio', 'Коэффициент де Ритиса — отношение активности АСТ к активности АЛТ. Для расчёта обе активности должны быть выражены в одинаковых единицах.

АСТ и АЛТ участвуют в обмене аминокислот, но распределены в тканях по-разному. Коэффициент описывает их соотношение и не показывает абсолютную активность каждого фермента.

Для отношения используют активности из одной пробы и приводят их к одинаковым единицам. При делении единицы сокращаются, поэтому результат безразмерный. Одинаковое отношение получается и тогда, когда обе активности одновременно отличаются в одинаковое число раз.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC3866949/', 'The De Ritis ratio is AST activity divided by ALT activity. The two activities must use the same units.

AST and ALT participate in amino acid metabolism but have different tissue distributions. The ratio describes their relative activities without giving the absolute activity of either enzyme.

The calculation uses the activities from one sample in matching units. The units cancel in division, making the result dimensionless. The same ratio can occur when both activities differ by the same factor.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC3866949/'),
  ('homa_ir', 'HOMA-IR — расчётная оценка инсулинорезистентности по глюкозе и инсулину натощак. Модель использует обратную связь между выделением инсулина и контролем глюкозы в состоянии натощак.

В классической формуле произведение глюкозы в ммоль/л и инсулина в мкМЕ/мл делят на 22,5. Результат получают расчётом, без прямого измерения ответа тканей на инсулин.

В основе модели лежит равновесие в состоянии натощак, когда выделение инсулина и продукция глюкозы печенью влияют друг на друга. Для расчёта берут два результата, полученных в этих условиях. Модель даёт оценку по их сочетанию и отличается от методов, которые отслеживают реакцию организма на введение инсулина.

Источники
https://pubmed.ncbi.nlm.nih.gov/3899825/', 'HOMA-IR estimates insulin resistance from fasting glucose and insulin. The model uses feedback between insulin secretion and glucose control in the fasting state.

The classic equation multiplies glucose in mmol/L by insulin in μIU/mL and divides by 22.5. It is a calculated estimate, without directly measuring tissue responses to insulin.

The model rests on the fasting balance in which insulin secretion and liver glucose production affect each other. It uses two measurements obtained under those conditions. It estimates insulin resistance from their combination, unlike methods that track the response to administered insulin.

Sources
https://pubmed.ncbi.nlm.nih.gov/3899825/'),
  ('ionized_calcium', 'Ионизированный кальций — свободные ионы кальция в крови. Эта фракция доступна для процессов клеточной сигнализации, сокращения мышц и свёртывания.

Часть кальция связывается с белками, а равновесие между свободной и связанной формами зависит, в частности, от кислотности. Ионизированный кальций измеряют отдельно от общего.

Электродный метод определяет активность свободных ионов в пробе. Поскольку связывание кальция с белками зависит от кислотности, изменение pH образца может изменить измеряемую свободную долю. Эта особенность относится именно к ионизированному кальцию, тогда как общий тест объединяет формы кальция.

Источники
https://nutritionalassessment.org/calcium/
https://pubmed.ncbi.nlm.nih.gov/11205698/', 'Ionized calcium is the free calcium ion fraction in blood. This fraction is available for cell signaling, muscle contraction, and clotting.

Some calcium is protein-bound, and the balance between the free and bound forms depends in part on acidity. Ionized calcium is measured separately from total calcium.

An electrode method detects free ion activity in the sample. Because calcium binding to proteins depends on acidity, a change in sample pH can change the measured free fraction. This is a feature of ionized calcium, while the total test combines calcium forms.

Sources
https://nutritionalassessment.org/calcium/
https://pubmed.ncbi.nlm.nih.gov/11205698/'),
  ('vitamin-b12-plasma', 'Показатель отражает суммарную концентрацию витамина B12 в плазме. Кобаламин циркулирует в составе комплексов с транспортными белками, включая транскобаламин и гаптокоррин.

Общий анализ учитывает обе связанные фракции. Доставку B12 в клетки обеспечивает преимущественно комплекс с транскобаламином.

Транспортные белки различаются тем, куда направляют связанный кобаламин. Комплекс B12 с транскобаламином может связываться с рецепторами клеток, а общий тест суммирует его с другими формами. Поэтому концентрация общего B12 и отдельно измеряемая концентрация связанного с транскобаламином B12 описывают разные части одного пула.

Источники
https://nutritionalassessment.org/b12/', 'This measure is the total vitamin B12 concentration in plasma. Cobalamin circulates bound to transport proteins, including transcobalamin and haptocorrin.

The total assay includes both fractions. Delivery of B12 to cells is mediated primarily by the transcobalamin-bound fraction.

Transport proteins differ in where they deliver their cobalamin cargo. The B12–transcobalamin complex can bind cell receptors, while a total assay combines it with other forms. Total B12 and separately measured transcobalamin-bound B12 therefore describe different parts of the same pool.

Sources
https://nutritionalassessment.org/b12/'),
  ('vitamin-c-plasma', 'Показатель отражает концентрацию витамина C в плазме. Аскорбат участвует в окислительно-восстановительных реакциях и помогает ферментам, которые обеспечивают созревание коллагена.

Плазменная концентрация описывает циркулирующую часть витамина в момент взятия пробы и может зависеть от недавнего поступления. При синтезе коллагена аскорбат помогает ферментам модифицировать определённые аминокислоты.

Благодаря этому формирующаяся структура коллагена становится устойчивее. Плазменное измерение характеризует доступную в крови форму витамина и не измеряет напрямую синтез коллагена в тканях.

Источники
https://nutritionalassessment.org/vitaminc/', 'This test measures vitamin C concentration in plasma. Ascorbate participates in redox reactions and supports enzymes involved in collagen maturation.

The plasma concentration represents circulating vitamin C at sampling and can be affected by recent intake. During collagen synthesis, ascorbate helps enzymes modify particular amino acids.

This contributes to stability of the developing collagen structure. Plasma measurement describes the vitamin available in blood without directly measuring collagen synthesis in tissues.

Sources
https://nutritionalassessment.org/vitaminc/'),
  ('serum-retinol', 'Сывороточный ретинол измеряет одну из циркулирующих форм витамина A. Печень выделяет ретинол в кровь в комплексе с ретинол-связывающим белком.

В тканях из него образуются соединения, участвующие в зрении и регуляции экспрессии генов. Измеряют концентрацию в сыворотке, а не количество витамина, запасённое в печени.

У ретинола разные пути в разных тканях. В зрительной системе его производное участвует в восприятии света, а ретиноевые кислоты действуют через рецепторы, регулирующие экспрессию генов. Сывороточный анализ измеряет исходную транспортируемую форму и не объединяет все эти производные.

Источники
https://nutritionalassessment.org/vitamina/', 'Serum retinol measures a circulating form of vitamin A. The liver releases retinol into blood bound to retinol-binding protein.

Tissues convert it to compounds involved in vision and regulation of gene expression. The test measures serum concentration rather than vitamin A stored in the liver.

Retinol has different pathways in different tissues. A derivative is involved in light detection in the visual system, while retinoic acids act through receptors that regulate gene expression. A serum assay measures the transported parent form and does not combine all these derivatives.

Sources
https://nutritionalassessment.org/vitamina/'),
  ('vitamin-d-25oh-total', 'Общий 25-ОН витамин D отражает суммарное содержание 25-гидроксилированных форм витамина D₂ и D₃. Они образуются преимущественно в печени из поступившего или синтезированного витамина D.

Этот показатель отличается от активного 1,25-дигидроксивитамина D, который образуется при следующем превращении, главным образом в почках. После первого превращения 25-гидроксивитамин D циркулирует преимущественно в связи с транспортными белками.

Это доступный для измерения промежуточный пул, из которого могут образовываться другие метаболиты. Строка «общий 25-ОН витамин D» суммирует именно формы 25(OH)D, а не все продукты обмена витамина D.

Источники
https://nutritionalassessment.org/vitaminD/', 'Total 25-hydroxyvitamin D measures the combined 25-hydroxylated forms of vitamins D₂ and D₃. These are formed mainly in the liver from absorbed or synthesized vitamin D.

This measurement differs from active 1,25-dihydroxyvitamin D, which is produced in a subsequent conversion, mainly in the kidneys. After the first conversion, 25-hydroxyvitamin D circulates mainly bound to carrier proteins.

It is a measurable intermediate pool from which other metabolites can form. Total 25-hydroxyvitamin D sums the 25(OH)D forms specifically, rather than all products of vitamin D metabolism.

Sources
https://nutritionalassessment.org/vitaminD/'),
  ('alpha-tocopherol', 'Альфа-токоферол — одна из форм витамина E, преимущественно удерживаемая организмом. Он переносится кровью в составе липопротеинов и помогает защищать липиды мембран от цепного окисления.

Анализ измеряет его концентрацию. Отношения к липидам или холестерину рассчитывают отдельно.

В мембранах альфа-токоферол может прерывать цепь окисления липидов, реагируя с промежуточными радикалами. В сывороточном анализе измеряют концентрацию молекулы, циркулирующей с липопротеинами. Защитное действие в мембранах и количество токоферола в пробе — связанные, но разные величины.

Источники
https://nutritionalassessment.org/vitamine/', 'Alpha-tocopherol is a form of vitamin E preferentially retained by the body. It travels in lipoproteins and helps protect membrane lipids from oxidation chain reactions.

The test measures its concentration. Ratios to lipids or cholesterol are calculated separately.

In membranes, alpha-tocopherol can interrupt lipid oxidation chains by reacting with intermediate radicals. A serum assay measures the molecule circulating in lipoproteins. Membrane protection and the amount of tocopherol in the sample are related but distinct quantities.

Sources
https://nutritionalassessment.org/vitamine/'),
  ('alpha-tocopherol-total-lipids-ratio', 'Показатель выражает количество альфа-токоферола относительно содержания общих липидов в пробе. Альфа-токоферол переносится липопротеинами, поэтому нормирование на липиды учитывает различия в количестве переносчиков.

Знаменатель — общие липиды. Отношение к одному только холестерину рассчитывают отдельно.

При одинаковой концентрации токоферола больший знаменатель даёт меньшее отношение. Такой расчёт позволяет сопоставить содержание токоферола с количеством липидов, рядом с которыми он переносится. Важно использовать именно общие липиды, а не самовольно заменять их холестерином или триглицеридами.

Источники
https://nutritionalassessment.org/vitamine/
https://doi.org/10.1177/000456328602300505', 'This ratio expresses alpha-tocopherol relative to the total lipid content of the sample. Alpha-tocopherol travels in lipoproteins, so lipid adjustment accounts for differences in the amount of its carriers.

The denominator is total lipids. A ratio to cholesterol alone is a separate measure.

For the same tocopherol concentration, a larger denominator gives a smaller ratio. The calculation relates tocopherol to the quantity of lipids alongside which it travels. The denominator must be total lipids, rather than cholesterol or triglycerides alone.

Sources
https://nutritionalassessment.org/vitamine/
https://doi.org/10.1177/000456328602300505'),
  ('thiamine-diphosphate-whole-blood', 'Анализ измеряет тиаминдифосфат, активную коферментную форму витамина B1, в цельной крови. Большая часть измеряемого вещества находится в эритроцитах, которые остаются в образце вместе с плазмой.

Внутри клеток тиаминдифосфат помогает ферментам обмена углеводов, включая транскетолазу. Состав образца задаёт, что попадает в результат: в цельной крови учитываются сохранённые клетки и жидкая часть.

Измерение относится к концентрации тиаминдифосфата во всей пробе. Это прямое определение кофермента, отличное от измерения активности зависящего от него фермента.

Источники
https://nutritionalassessment.org/thiamine/
https://www.mayocliniclabs.com/test-catalog/Overview/42356', 'This test measures thiamine diphosphate, an active coenzyme form of vitamin B1, in whole blood. Most of the measured compound is in red cells, which remain in the sample along with plasma.

Within cells, thiamine diphosphate supports enzymes of carbohydrate metabolism, including transketolase. Sample composition determines what contributes to the result: whole blood retains the blood cells and liquid fraction.

The concentration applies across that sample. It directly measures the coenzyme rather than the activity of an enzyme that depends on it.

Sources
https://nutritionalassessment.org/thiamine/
https://www.mayocliniclabs.com/test-catalog/Overview/42356'),
  ('thiamine-diphosphate-erythrocytes', 'Показатель измеряет тиаминдифосфат непосредственно в эритроцитарной фракции. Эта форма витамина B1 необходима транскетолазе и другим ферментам обмена углеводов.

Материал измерения здесь — эритроциты, поэтому результат не следует подменять концентрацией тиаминдифосфата в цельной крови. Эритроцитарный анализ сосредоточен на внутриклеточном пуле.

Подготовка образца отделяет его от внеклеточных компонентов крови, а результат относят к этому материалу. Изменить название на «в цельной крови» без изменения метода и пересчёта нельзя.

Источники
https://nutritionalassessment.org/thiamine/', 'This measure quantifies thiamine diphosphate specifically in the red blood cell fraction. This form of vitamin B1 is required by transketolase and other enzymes of carbohydrate metabolism.

The sample is red cells, so the result is distinct from a whole-blood thiamine diphosphate concentration. The red cell assay focuses on the intracellular pool.

Sample preparation separates it from extracellular blood components, and the result applies to that material. It cannot be relabeled as a whole-blood concentration without changes to the method and calculation.

Sources
https://nutritionalassessment.org/thiamine/'),
  ('erythrocyte-transketolase-activity', 'Показатель измеряет базальную активность транскетолазы эритроцитов. Этот фермент переносит фрагменты сахаров в пентозофосфатном пути и работает с тиаминдифосфатом в качестве кофактора.

Базальная активность определяется без добавления кофактора. Коэффициент активации потребовал бы дополнительного измерения после его добавления.

При лабораторной реакции оценивается превращение субстрата за определённое время. В справочнике активность выражена относительно количества гемоглобина в эритроцитарной пробе, что позволяет учесть объём исследованного материала. Показатель относится к скорости реакции, а не к концентрации витамина B1.

Источники
https://nutritionalassessment.org/thiamine/
https://doi.org/10.1177/000456328702400106', 'This test measures the basal activity of red blood cell transketolase. The enzyme transfers sugar fragments in the pentose phosphate pathway and uses thiamine diphosphate as a cofactor.

Basal activity is measured without adding cofactor. An activation coefficient would require a second measurement after adding it.

The assay follows substrate conversion over a defined time. In the catalog, activity is reported relative to the amount of hemoglobin in the red cell sample, which accounts for the amount of material tested. The result describes a reaction rate rather than vitamin B1 concentration.

Sources
https://nutritionalassessment.org/thiamine/
https://doi.org/10.1177/000456328702400106'),
  ('erythrocyte-glutathione-reductase-activation', 'EGRAC показывает, во сколько раз активность глутатионредуктазы эритроцитов меняется после добавления ФАД. ФАД образуется из рибофлавина и помогает ферменту восстанавливать глутатион.

В лаборатории сравнивают активность в двух условиях, с добавленным ФАД и без него, поэтому результат выражается отношением. Глутатионредуктаза поддерживает запас восстановленного глутатиона, необходимого клетке для окислительно-восстановительных реакций.

Если добавление ФАД изменяет скорость реакции, это видно при сравнении с исходной активностью. Коэффициент выражает относительное изменение и не равен концентрации рибофлавина.

Источники
https://nutritionalassessment.org/riboflavin/', 'EGRAC compares red blood cell glutathione reductase activity after adding FAD with activity before addition. FAD is derived from riboflavin and helps the enzyme regenerate reduced glutathione.

Comparing activity under these two laboratory conditions produces a ratio. Glutathione reductase maintains reduced glutathione used in cellular redox reactions.

If adding FAD changes the reaction rate, comparison with baseline activity captures that change. The coefficient is relative and is not a riboflavin concentration.

Sources
https://nutritionalassessment.org/riboflavin/'),
  ('urine-n1-methylnicotinamide-creatinine', 'Показатель выражает количество N¹-метилникотинамида в моче относительно креатинина. Метаболит образуется при переработке никотинамида, связанного с обменом коферментов NAD и NADP.

Деление на концентрацию креатинина учитывает различия в разведении мочи. Полученное отношение отличается от количества метаболита, выделенного за сутки.

Никотинамид может метилироваться при переработке продуктов распада никотинамидных коферментов. Измеряемый метаболит затем обнаруживают в моче. Для этого формата два вещества определяют в одном образце, а результат дают как массу N¹-метилникотинамида на грамм креатинина.

Источники
https://nutritionalassessment.org/niacin/', 'This measure reports urinary N¹-methylnicotinamide relative to creatinine. The metabolite forms during processing of nicotinamide associated with NAD and NADP metabolism.

Dividing by urinary creatinine accounts for differences in urine dilution. The ratio is distinct from the amount excreted over a full day.

Nicotinamide can be methylated during processing of nicotinamide coenzyme breakdown products. The resulting metabolite is detected in urine. In this reporting format both substances are assessed in one sample, and the result is given as mass of N¹-methylnicotinamide per gram of creatinine.

Sources
https://nutritionalassessment.org/niacin/'),
  ('urine-2-pyridone-creatinine', 'Показатель выражает количество 2-пиридона в моче относительно креатинина. 2-пиридон образуется при дальнейшем превращении N¹-метилникотинамида и выводится с мочой.

Нормирование на креатинин учитывает разбавление образца, но даёт отношение, а не суточную экскрецию метаболита. В отличие от измерения N¹-метилникотинамида, этот анализ относится к продукту следующего превращения.

Деление на креатинин использует другой показатель концентрации той же пробы мочи. Оно не показывает, какая доля исходного N¹-метилникотинамида превратилась в 2-пиридон, поскольку исходный метаболит здесь не является знаменателем.

Источники
https://nutritionalassessment.org/niacin/', 'This measure reports urinary 2-pyridone relative to creatinine. 2-Pyridone forms during further metabolism of N¹-methylnicotinamide and is excreted in urine.

Creatinine adjustment accounts for sample dilution but produces a ratio rather than daily excretion. Unlike an N¹-methylnicotinamide test, this assay measures the product of a subsequent conversion.

Dividing by creatinine uses a different concentration from the same urine sample. It does not show the fraction of N¹-methylnicotinamide converted into 2-pyridone, because the precursor is not the denominator.

Sources
https://nutritionalassessment.org/niacin/'),
  ('urine-2-pyridone-n1-mna-ratio', 'Показатель сравнивает два метаболита никотинамида в одном образце мочи. N¹-метилникотинамид может превращаться в 2-пиридон, поэтому отношение показывает относительное распределение между продуктами этого пути обмена.

Из него нельзя узнать, сколько каждого метаболита было выведено за сутки. У этого отношения оба компонента относятся к одному пути обмена.

Показатель может меняться из-за изменения числителя, знаменателя или обоих, поэтому одного отношения недостаточно для восстановления исходных значений. Оно отличается от измерений каждого метаболита на грамм креатинина.

Источники
https://nutritionalassessment.org/niacin/', 'This measure compares two nicotinamide metabolites in the same urine sample. N¹-methylnicotinamide can be converted to 2-pyridone, so their ratio describes relative amounts along this metabolic pathway.

It does not provide the daily amount excreted of either metabolite. Both components of this ratio belong to the same pathway.

The ratio can change because of the numerator, denominator, or both, so a ratio alone cannot recover the original values. It differs from measurements of each metabolite per gram of creatinine.

Sources
https://nutritionalassessment.org/niacin/'),
  ('serum-folate', 'Сывороточный фолат показывает концентрацию циркулирующих форм витамина B9. Производные фолата переносят одноуглеродные группы, необходимые, в частности, для синтеза нуклеотидов.

Содержание в сыворотке реагирует на недавнее поступление фолата быстрее, чем его содержание в эритроцитах. Фолатные производные участвуют и в превращениях, которые связывают одноуглеродный обмен с образованием метионина.

Сывороточная проба описывает вещества, находящиеся вне клеток в момент взятия крови. Содержание фолата, накопленного эритроцитами, измеряют отдельно.

Источники
https://nutritionalassessment.org/folate/', 'Serum folate measures the circulating forms of vitamin B9. Folate derivatives transfer one-carbon groups needed, among other things, for nucleotide synthesis.

Serum concentration responds to recent folate intake more quickly than red blood cell folate. Folate derivatives also participate in reactions linking one-carbon metabolism to methionine formation.

A serum sample describes substances outside cells at blood collection. Folate accumulated by red blood cells is measured separately.

Sources
https://nutritionalassessment.org/folate/'),
  ('erythrocyte-folate', 'Эритроцитарный фолат измеряет фолаты в красных клетках крови. Эти клетки накапливают фолат преимущественно в период образования в костном мозге и удерживают его по мере циркуляции.

Поэтому показатель отражает более продолжительный период поступления и обмена фолата, чем сывороточная концентрация. Поскольку зрелые эритроциты циркулируют после завершения формирования, проба содержит клетки, которые накопили фолат в разные периоды.

Измерение объединяет их вклад. Это помогает понять, почему эритроцитарный и сывороточный показатели отражают неодинаковые временные окна.

Источники
https://nutritionalassessment.org/folate/', 'Red blood cell folate measures folates within red cells. The cells accumulate folate mainly as they are formed in the bone marrow and retain it while circulating.

The result thus reflects a longer period of folate intake and metabolism than the serum concentration. Because mature red cells circulate after formation, the sample contains cells that accumulated folate at different times.

The assay combines their contributions. This explains why red cell and serum folate describe different time windows.

Sources
https://nutritionalassessment.org/folate/'),
  ('plasma-total-homocysteine', 'Общий гомоцистеин измеряет суммарное содержание форм гомоцистеина в плазме. Гомоцистеин образуется при обмене метионина.

Он может превращаться обратно в метионин по пути с участием фолата и витамина B12 либо использоваться в пути образования цистеина, где участвует витамин B6. Анализ объединяет свободные и связанные формы.

В крови гомоцистеин присутствует в нескольких формах, в том числе связанных с белками и в составе дисульфидов. Для определения общего гомоцистеина метод учитывает эти формы вместе. Поэтому результат отличается от определения только свободного гомоцистеина или отдельного витамина, участвующего в его обмене.

Источники
https://nutritionalassessment.org/folate/', 'Total homocysteine measures the combined forms of homocysteine in plasma. Homocysteine arises during methionine metabolism.

It can be recycled to methionine through a pathway involving folate and vitamin B12 or enter the pathway toward cysteine, which involves vitamin B6. The assay includes free and bound forms.

Homocysteine occurs in blood in several forms, including protein-bound forms and disulfides. A total homocysteine assay accounts for these forms together. The result differs from a measurement of free homocysteine alone or of an individual vitamin involved in its metabolism.

Sources
https://nutritionalassessment.org/folate/'),
  ('serum-copper', 'Сывороточная медь измеряет концентрацию меди, циркулирующей в составе белковых комплексов. Основную часть переносит церулоплазмин, а меньшая доля связана с другими белками.

Медь входит в состав ферментов, участвующих в обмене железа и клеточных окислительных реакциях. Анализ отражает циркулирующую медь, а не её общее количество в тканях.

Всосавшаяся медь проходит через печень, где часть её включается в церулоплазмин, а часть направляется по другим путям обмена. При суммарном измерении меди вклад разных переносчиков объединяется. Отдельное определение церулоплазмина измеряет концентрацию белка, а не всю медь в пробе.

Источники
https://nutritionalassessment.org/copper/', 'Serum copper measures copper circulating in protein complexes. Ceruloplasmin carries most of it, with smaller amounts bound to other proteins.

Copper is a component of enzymes involved in iron metabolism and cellular oxidation reactions. The test measures circulating copper rather than total tissue copper.

Absorbed copper passes through the liver, where some is incorporated into ceruloplasmin and some follows other routes. A total copper measurement combines contributions from different carriers. A separate ceruloplasmin test measures the protein rather than all copper in the sample.

Sources
https://nutritionalassessment.org/copper/'),
  ('serum-zinc', 'Сывороточный цинк показывает концентрацию цинка в сыворотке, где он переносится преимущественно в связи с белками. Цинк участвует в работе многих ферментов и в стабилизации белков, регулирующих активность генов.

Анализ измеряет небольшую циркулирующую часть цинка организма. Белки крови, в частности альбумин, помогают удерживать цинк в циркулирующей форме.

Цинк распределяется между кровью и клетками, где входит в состав разных белков. Сывороточное измерение описывает концентрацию в одном из этих отсеков и не суммирует цинк всех тканей.

Источники
https://nutritionalassessment.org/zinc/', 'Serum zinc measures zinc in serum, where it is largely carried by proteins. Zinc is involved in many enzyme reactions and stabilizes proteins that regulate gene activity.

The test measures the small circulating portion of the body’s zinc. Blood proteins, including albumin, help carry zinc in circulation.

Zinc is distributed between blood and cells, where it is incorporated into different proteins. A serum measurement describes concentration in one of these compartments rather than adding up zinc across tissues.

Sources
https://nutritionalassessment.org/zinc/'),
  ('urine-iodine-concentration', 'Концентрация йода в моче показывает, сколько йода приходится на единицу объёма пробы. После всасывания часть йода используется щитовидной железой для синтеза гормонов, а значительная доля поступившего йода выводится почками.

Результат разовой пробы зависит от её разведения и отличается от количества йода, выведенного за сутки. При одинаковом количестве выделенного йода более разбавленная проба даёт меньшую концентрацию.

Измеряемый показатель поэтому относится к единице объёма, как указано в бланке. Для оценки количества, выделенного за заданное время, требуется также знать объём собранной мочи.

Источники
https://nutritionalassessment.org/iodine/', 'Urinary iodine concentration measures iodine per unit volume of urine. After absorption, the thyroid uses some iodine to make hormones, and a substantial share of intake is excreted by the kidneys.

A spot concentration depends on urine dilution and differs from the amount excreted over a full day. The same excreted amount of iodine gives a lower concentration in a more dilute sample.

The result is therefore expressed per unit volume as stated in the report. Estimating the amount excreted over a defined time also requires the volume of urine collected.

Sources
https://nutritionalassessment.org/iodine/'),
  ('serum-selenium', 'Сывороточный селен измеряет суммарную концентрацию селена в сыворотке. Селен входит в состав нескольких белков, включая селенопротеин P и глутатионпероксидазы.

Эти белки участвуют в переносе селена и восстановлении перекисей. Показатель объединяет вклад разных форм селена и не измеряет активность отдельного фермента.

В сыворотке разные соединения вносят вклад в общий результат. Анализ элемента суммирует содержащийся в них селен, независимо от функции конкретного белка. Измерение селенопротеина P или активности глутатионпероксидазы задаёт другой вопрос о конкретном компоненте обмена.

Источники
https://nutritionalassessment.org/selenium/', 'Serum selenium measures total selenium concentration in serum. Selenium is a component of several proteins, including selenoprotein P and glutathione peroxidases.

These proteins participate in selenium transport and peroxide reduction. The measurement combines different selenium forms and does not measure the activity of an individual enzyme.

Several compounds in serum contribute to the total. An elemental assay sums their selenium regardless of the function of any individual protein. A selenoprotein P or glutathione peroxidase assay asks a different question about a particular part of selenium metabolism.

Sources
https://nutritionalassessment.org/selenium/'),
  ('selenoprotein-p', 'Селенопротеин P — белок, который переносит селен в крови. Он образуется преимущественно в печени, а клетки ряда тканей получают из него селен через рецепторы.

Анализ определяет концентрацию этого белка. Суммарный селен включает вклад и других циркулирующих соединений.

Транспорт селена этим белком связан с тем, что селен включён в его структуру. При измерении селенопротеина P количественно определяют именно белок-переносчик. В анализе общего селена учитывается элемент в разных соединениях, поэтому значения не подменяют друг друга.

Источники
https://nutritionalassessment.org/selenium/', 'Selenoprotein P carries selenium in blood. It is produced mainly by the liver, and some tissues acquire selenium from it through receptors.

This assay measures the concentration of the protein. Total selenium also includes other circulating compounds.

The protein transports selenium because selenium is incorporated into its structure. The selenoprotein P assay quantifies that carrier specifically. A total selenium assay counts the element in several compounds, so the results are not interchangeable.

Sources
https://nutritionalassessment.org/selenium/'),
  ('erythrocyte-glutathione-peroxidase-activity', 'Показатель измеряет активность глутатионпероксидазы в эритроцитах. Этот селенсодержащий фермент использует восстановленный глутатион для обезвреживания перекисей.

В анализе оценивают скорость ферментативной реакции и выражают её на единицу гемоглобина. Это функциональное измерение, отличное от концентрации селена.

Восстановление перекиси расходует восстановленный глутатион, а его окисленная форма может снова восстанавливаться другими ферментами. В лаборатории скорость работы глутатионпероксидазы оценивают в заданных условиях. Пересчёт на гемоглобин связывает результат с количеством исследованного эритроцитарного материала.

Источники
https://nutritionalassessment.org/selenium/
https://pmc.ncbi.nlm.nih.gov/articles/PMC11351941/', 'This test measures glutathione peroxidase activity in red blood cells. The selenium-containing enzyme uses reduced glutathione to reduce peroxides.

The assay measures the rate of the enzyme reaction and reports it per unit of hemoglobin. It is a functional measurement distinct from selenium concentration.

Reducing a peroxide consumes reduced glutathione, whose oxidized form can be recycled by other enzymes. The assay measures glutathione peroxidase activity under specified conditions. Normalization to hemoglobin relates the result to the amount of red cell material tested.

Sources
https://nutritionalassessment.org/selenium/
https://pmc.ncbi.nlm.nih.gov/articles/PMC11351941/'),
  ('alpha-tocopherol-cholesterol-ratio', 'Показатель сравнивает концентрацию альфа-токоферола с концентрацией общего холестерина. Альфа-токоферол переносится липопротеинами, поэтому отношение учитывает липидный контекст его циркуляции.

В знаменателе используется именно холестерин, что отличает этот показатель от отношения к общим липидам. Для расчёта в одной пробе определяют токоферол и общий холестерин.

Результат может меняться при изменении любой из двух концентраций. Поэтому отношение уточняет, сколько токоферола приходится на заданное количество холестерина, но не заменяет исходное измерение токоферола.

Источники
https://nutritionalassessment.org/vitamine/', 'This measure compares alpha-tocopherol concentration with total cholesterol concentration. Alpha-tocopherol circulates in lipoproteins, so the ratio considers the lipid context of its transport.

The denominator is cholesterol, which distinguishes it from the ratio to total lipids. The calculation uses tocopherol and total cholesterol measured in one sample.

The result can change if either concentration changes. The ratio describes tocopherol per amount of cholesterol but does not replace the original tocopherol measurement.

Sources
https://nutritionalassessment.org/vitamine/'),
  ('urine-calcium-24h', 'Кальций в суточной моче показывает количество кальция, выделенного почками за 24 часа. Почки фильтруют кальций из крови и возвращают большую часть в кровоток.

Остаток поступает в мочу. Суточный результат учитывает и концентрацию кальция, и объём собранной мочи.

При суточном сборе концентрацию относят ко всему объёму мочи, собранному за период. Разовая концентрация может быть такой же при другом объёме и потому дать другое общее количество при пересчёте. Суточное измерение отвечает на вопрос о выведенной массе или количестве вещества за сутки.

Источники
https://nutritionalassessment.org/calcium/', 'Twenty-four-hour urine calcium is the amount of calcium excreted by the kidneys over a full day. The kidneys filter calcium from blood and reabsorb most of it.

The remainder passes into urine. The daily result takes into account both the calcium concentration and the collected urine volume.

In a daily collection the concentration is related to the entire urine volume collected over the period. The same concentration in a different volume would yield a different total amount. The daily result gives the mass or amount of substance excreted in a day.

Sources
https://nutritionalassessment.org/calcium/'),
  ('transferrin-saturation', 'Насыщение трансферрина железом показывает долю его железосвязывающей способности, которая уже занята железом. При расчёте концентрацию сывороточного железа сравнивают с ОЖСС в одинаковых единицах и выражают отношение в процентах.

Показатель описывает заполненность переносчика, в то время как ОЖСС характеризует его суммарную способность связывать железо.

Две величины в формуле описывают разные стороны переноса железа:
- Сывороточное железо показывает, сколько железа уже переносится в крови.
- ОЖСС оценивает, сколько железа переносчики могли бы связать в общей сложности. При одинаковом сывороточном железе разная ОЖСС даёт разное насыщение.

Источники
https://nutritionalassessment.org/iron/', 'Transferrin saturation is the proportion of transferrin’s iron-binding capacity that is occupied. It is calculated by comparing serum iron with total iron-binding capacity in matching units and expressing the ratio as a percentage.

It describes how full the carrier is, while total iron-binding capacity describes how much iron it can bind overall.

The calculation uses two measurements that describe different aspects of iron transport:
- Serum iron measures how much iron is already being carried.
- TIBC estimates how much iron the carriers could bind in total. With the same serum iron, different TIBC values give different saturation results.

Sources
https://nutritionalassessment.org/iron/'),
  ('c-reactive-protein', 'С-реактивный белок — белок острой фазы, который вырабатывает преимущественно печень. Сигналы воспалительного ответа, в том числе интерлейкин-6, усиливают его синтез.

Циркулирующий СРБ может связываться с молекулами на повреждённых клетках и микробах, участвуя во врождённом иммунном ответе. Анализ измеряет концентрацию белка.

СРБ связывает определённые молекулярные структуры, например фосфохолин на поверхности некоторых частиц. Такое связывание может участвовать в распознавании материала врождённой иммунной системой. Анализ крови измеряет циркулирующую концентрацию СРБ, а не количество связанного белка в конкретной ткани.

Источники
https://doi.org/10.1172/JCI18921', 'C-reactive protein is an acute-phase protein produced mainly by the liver. Inflammatory signals, including interleukin-6, increase its production.

Circulating CRP can bind molecules on damaged cells and microbes as part of the innate immune response. The test measures its concentration.

CRP binds particular molecular structures, such as phosphocholine on some surfaces. This can contribute to recognition of material by the innate immune system. A blood test measures circulating CRP rather than the amount bound in a particular tissue.

Sources
https://doi.org/10.1172/JCI18921'),
  ('procalcitonin', 'Прокальцитонин — белковый предшественник гормона кальцитонина. В обычных условиях клетки щитовидной железы перерабатывают его в кальцитонин.

При системном воспалительном ответе его могут образовывать и другие ткани, выделяя в кровоток без полного превращения. Анализ измеряет прокальцитонин отдельно от кальцитонина.

Прокальцитонин и кальцитонин относятся к разным этапам обработки одного белкового предшественника. При лабораторном измерении используют реагенты, распознающие прокальцитонин в крови. Получается отдельное измерение предшественника, из которого нельзя вычислить концентрацию кальцитонина.

Источники
https://pubmed.ncbi.nlm.nih.gov/11232031/', 'Procalcitonin is the protein precursor of calcitonin. Under ordinary conditions, cells in the thyroid process it into calcitonin.

During a systemic inflammatory response, other tissues can also produce and release procalcitonin into the circulation without fully processing it. The test measures procalcitonin separately from calcitonin.

Procalcitonin and calcitonin represent different stages of processing a protein precursor. The laboratory assay uses reagents that recognize procalcitonin in blood. It measures the precursor separately and cannot be used to calculate calcitonin concentration.

Sources
https://pubmed.ncbi.nlm.nih.gov/11232031/');

DO $$
BEGIN
  IF (
    SELECT count(*)
    FROM point_descriptions_long_form s
    JOIN "analysisPoint" p USING (name)
  ) <> 99 THEN
    RAISE EXCEPTION 'Unexpected catalog membership for long-form descriptions';
  END IF;
END $$;

UPDATE "analysisPoint" p
SET "pointDescriptionRu" = s.description_ru,
    "pointDescriptionEn" = s.description_en
FROM point_descriptions_long_form s
WHERE p.name = s.name;
`;
