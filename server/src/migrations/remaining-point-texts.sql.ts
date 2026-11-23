export const REMAINING_POINT_TEXTS_SQL = `
CREATE TEMP TABLE remaining_point_texts (
  name text PRIMARY KEY,
  hint_ru text NOT NULL,
  hint_en text NOT NULL,
  description_ru text NOT NULL,
  description_en text NOT NULL
) ON COMMIT DROP;

INSERT INTO remaining_point_texts VALUES
  ('albumin_fraction', 'Альбуминовая фракция отражает содержание альбумина среди белков сыворотки.', 'The albumin fraction represents albumin among serum proteins.', 'Альбуминовая фракция отражает содержание альбумина среди белков сыворотки. При электрофорезе альбумин образует отдельную зону. Этот белок синтезируется в печени, переносит ряд веществ, включая жирные кислоты, и участвует в удержании воды в сосудистом русле. Долю фракции и её концентрацию выражают в разных единицах.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/', 'The albumin fraction represents albumin among serum proteins. Albumin forms a distinct zone during electrophoresis. It is made in the liver, carries substances such as fatty acids, and helps retain water in the circulation. The fraction can be reported as a proportion or a concentration.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/'),
  ('alpha-1_globulin_fraction', 'Альфа-1 глобулины — группа белков, которые при электрофорезе образуют одну фракцию.', 'Alpha-1 globulins are a group of proteins that form one fraction on electrophoresis.', 'Альфа-1 глобулины — группа белков, которые при электрофорезе образуют одну фракцию. Один из её основных компонентов — альфа-1-антитрипсин, который ограничивает действие ряда ферментов, расщепляющих белки. Измерение фракции суммирует сигнал нескольких белков и не определяет каждый по отдельности.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/', 'Alpha-1 globulins are a group of proteins that form one fraction on electrophoresis. A major component is alpha-1 antitrypsin, which inhibits several protein-degrading enzymes. The fraction combines the signal from several proteins and does not measure each individually.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/'),
  ('ferrum', 'Анализ сывороточного железа измеряет железо, которое циркулирует преимущественно в связи с трансферрином.', 'Serum iron measures circulating iron, most of which is bound to transferrin.', 'Анализ сывороточного железа измеряет железо, которое циркулирует преимущественно в связи с трансферрином. Трансферрин переносит его между тканями, в том числе к клеткам костного мозга для образования гемоглобина. Сывороточная концентрация характеризует транспортируемое железо в момент взятия образца.

Источники
https://nutritionalassessment.org/iron/', 'Serum iron measures circulating iron, most of which is bound to transferrin. Transferrin carries iron between tissues, including to bone marrow cells making hemoglobin. The serum concentration describes circulating transport iron at the time of sampling.

Sources
https://nutritionalassessment.org/iron/'),
  ('transferrin', 'Трансферрин — белок, который переносит железо в крови.', 'Transferrin is the protein that carries iron in blood.', 'Трансферрин — белок, который переносит железо в крови. Он синтезируется в печени и обратимо связывает железо. На клетках есть рецепторы, через которые железо из трансферрина поступает внутрь. Анализ измеряет количество белка, включая молекулы со свободными местами связывания.

Источники
https://nutritionalassessment.org/iron/', 'Transferrin is the protein that carries iron in blood. The liver makes it, and it binds iron reversibly. Cells take up transferrin-bound iron through receptors. The test measures the protein, including molecules with unoccupied binding sites.

Sources
https://nutritionalassessment.org/iron/'),
  ('ferritin', 'Ферритин — белок, в котором клетки хранят железо.', 'Ferritin is the protein cells use to store iron.', 'Ферритин — белок, в котором клетки хранят железо. Его оболочка удерживает железо в форме, доступной для последующего использования. Небольшая часть ферритина циркулирует в крови. Измерение сывороточного ферритина используют как косвенную оценку запасов, поскольку количество железа в тканях этим анализом напрямую не измеряют.

Источники
https://nutritionalassessment.org/iron/', 'Ferritin is the protein cells use to store iron. Its shell holds iron in a form that can be made available later. A small amount circulates in blood. Serum ferritin is used as an indirect indicator of iron stores because the test does not measure tissue iron directly.

Sources
https://nutritionalassessment.org/iron/'),
  ('tibc', 'ОЖСС оценивает общее количество железа, которое могут связать белки сыворотки.', 'Total iron-binding capacity estimates how much iron serum proteins can bind in total.', 'ОЖСС оценивает общее количество железа, которое могут связать белки сыворотки. Большую часть этой способности обеспечивает трансферрин. Показатель включает как места связывания, уже занятые железом, так и свободные. Долю занятых мест отдельно характеризует насыщение трансферрина.

Источники
https://nutritionalassessment.org/iron/', 'Total iron-binding capacity estimates how much iron serum proteins can bind in total. Transferrin accounts for most of this capacity. The measure includes sites already occupied by iron and sites still available. Transferrin saturation describes the occupied fraction separately.

Sources
https://nutritionalassessment.org/iron/'),
  ('ceruloplasmin', 'Церулоплазмин — белок крови, связывающий большую часть меди в плазме.', 'Ceruloplasmin is a blood protein that binds most of the copper in plasma.', 'Церулоплазмин — белок крови, связывающий большую часть меди в плазме. Он образуется в печени и обладает ферроксидазной активностью: помогает окислять железо до формы, которую может связать трансферрин. Концентрация белка и его ферментная активность — разные измерения.

Источники
https://nutritionalassessment.org/copper/', 'Ceruloplasmin is a blood protein that binds most of the copper in plasma. The liver makes it, and its ferroxidase activity helps oxidize iron to a form that transferrin can bind. Protein concentration and enzyme activity are distinct measurements.

Sources
https://nutritionalassessment.org/copper/'),
  ('total_protein', 'Общий белок показывает суммарную концентрацию белков в сыворотке.', 'Total protein is the combined concentration of proteins in serum.', 'Общий белок показывает суммарную концентрацию белков в сыворотке. Основную долю обычно составляет альбумин, остальную — глобулины, включая транспортные белки и антитела. Одна суммарная величина не показывает, как белки распределены между фракциями, для этого используют отдельные измерения.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/', 'Total protein is the combined concentration of proteins in serum. Albumin usually accounts for the largest share, with globulins such as transport proteins and antibodies making up the rest. The total does not show how proteins are distributed among the fractions, which are assessed separately.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/'),
  ('urea', 'Мочевина — продукт, в который печень превращает часть азота при обмене аминокислот.', 'Urea is a product the liver makes from part of the nitrogen released during amino acid metabolism.', 'Мочевина — продукт, в который печень превращает часть азота при обмене аминокислот. В таком виде азот переносится кровью и выводится преимущественно почками. Анализ измеряет концентрацию всей молекулы мочевины. В бланках с обозначением BUN указывают только азот, входящий в её состав.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK305/', 'Urea is a product the liver makes from part of the nitrogen released during amino acid metabolism. It travels in blood and is eliminated mainly by the kidneys. A urea test reports the concentration of the whole molecule. A result labeled BUN reports only the nitrogen it contains.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK305/'),
  ('ammonia', 'Анализ амиака отражает содержание аммиака и аммония в крови.', 'The blood ammonia test reflects ammonia and ammonium in blood.', 'Анализ амиака отражает содержание аммиака и аммония в крови. Эти формы азота переходят одна в другую в зависимости от кислотности среды. Азот образуется, в частности, при обмене аминокислот и работе кишечных бактерий. Печень включает значительную его часть в мочевину, которая затем выводится почками.

Источники
https://medlineplus.gov/lab-tests/ammonia-levels/', 'The blood ammonia test reflects ammonia and ammonium in blood. These forms interconvert depending on acidity. Their nitrogen comes in part from amino acid metabolism and intestinal bacteria. The liver incorporates much of it into urea, which is then excreted by the kidneys.

Sources
https://medlineplus.gov/lab-tests/ammonia-levels/'),
  ('creatinine', 'Креатинин образуется из креатина и фосфокреатина, которые участвуют в энергетическом обмене мышц.', 'Creatinine forms from creatine and phosphocreatine, which participate in muscle energy metabolism.', 'Креатинин образуется из креатина и фосфокреатина, которые участвуют в энергетическом обмене мышц. Он поступает в кровь, фильтруется почками и в небольшой степени выделяется канальцами. Его концентрация отражает сочетание образования и выведения. Для расчётной скорости фильтрации используют отдельную формулу.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK305/', 'Creatinine forms from creatine and phosphocreatine, which participate in muscle energy metabolism. It enters blood, is filtered by the kidneys, and is also secreted to a small extent by renal tubules. Its concentration reflects both production and elimination. Estimated filtration is obtained using a separate equation.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK305/'),
  ('uric_acid', 'Мочевая кислота — конечный продукт распада пуринов у человека.', 'Uric acid is the final product of purine breakdown in humans.', 'Мочевая кислота — конечный продукт распада пуринов у человека. Пурины входят в состав ДНК и РНК и поступают из обмена собственных клеток и пищи. В крови соединение присутствует преимущественно в виде урата. Его концентрация связана с образованием и выведением через почки и кишечник.

Источники
https://medlineplus.gov/lab-tests/uric-acid-test/', 'Uric acid is the final product of purine breakdown in humans. Purines are components of DNA and RNA and come from the body’s own metabolism and food. In blood the compound is mostly present as urate. Its concentration reflects production and elimination through the kidneys and gut.

Sources
https://medlineplus.gov/lab-tests/uric-acid-test/'),
  ('alanine_aminotransferase', 'АЛТ — фермент, участвующий в обмене аминокислот.', 'ALT is an enzyme involved in amino acid metabolism.', 'АЛТ — фермент, участвующий в обмене аминокислот. Он переносит аминогруппу с аланина, связывая обмен аминокислот с образованием пирувата. Фермент содержится преимущественно в клетках печени, но встречается и в других тканях. В сыворотке измеряют его каталитическую активность.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC3866949/', 'ALT is an enzyme involved in amino acid metabolism. It transfers an amino group from alanine, linking amino acid metabolism to pyruvate formation. ALT is abundant in liver cells but is also found in other tissues. Serum testing measures its catalytic activity.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC3866949/'),
  ('aspartate_aminotransferase', 'АСТ — фермент, который переносит аминогруппу с аспартата.', 'AST transfers an amino group from aspartate.', 'АСТ — фермент, который переносит аминогруппу с аспартата. Реакция связывает обмен аминокислот с превращениями оксалоацетата. АСТ содержится в печени, мышцах и других тканях, причём у фермента есть цитозольная и митохондриальная формы. Анализ измеряет их суммарную активность в сыворотке.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC3866949/', 'AST transfers an amino group from aspartate. This reaction connects amino acid metabolism with oxaloacetate metabolism. AST occurs in the liver, muscle, and other tissues and has cytosolic and mitochondrial forms. The test measures their combined activity in serum.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC3866949/'),
  ('alkaline_phosphatase', 'Щелочная фосфатаза — семейство ферментов, отщепляющих фосфат при щелочной реакции среды.', 'Alkaline phosphatase is a family of enzymes that remove phosphate groups under alkaline conditions.', 'Щелочная фосфатаза — семейство ферментов, отщепляющих фосфат при щелочной реакции среды. Формы фермента есть в печени и костной ткани, а также в других тканях. Обычный анализ показывает суммарную активность этих форм. Для разделения вклада разных форм существуют исследования изоферментов.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK203/', 'Alkaline phosphatase is a family of enzymes that remove phosphate groups under alkaline conditions. Forms of the enzyme occur in the liver, bone, and other tissues. A routine test measures their combined activity. Isoenzyme tests can distinguish the contribution of specific forms.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK203/'),
  ('bilirubin', 'Общий билирубин охватывает формы пигмента, которые появляются при распаде гема, главным образом из гемоглобина.', 'Total bilirubin includes forms of the pigment produced when heme, chiefly from hemoglobin, is broken down.', 'Общий билирубин охватывает формы пигмента, которые появляются при распаде гема, главным образом из гемоглобина. Сначала билирубин переносится к печени в связи с альбумином. В печени он преобразуется в более водорастворимую форму и выделяется в желчь. Общий показатель объединяет фракции, которые в бланке могут быть указаны отдельно.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK413/', 'Total bilirubin includes forms of the pigment produced when heme, chiefly from hemoglobin, is broken down. Bilirubin first travels to the liver bound to albumin. The liver converts it to a more water-soluble form and excretes it into bile. The total combines fractions that may be reported separately.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK413/'),
  ('direct-bilirubin', 'Прямой билирубин — фракция, которую определяет прямая лабораторная реакция.', 'Direct bilirubin is the fraction measured by the direct laboratory reaction.', 'Прямой билирубин — фракция, которую определяет прямая лабораторная реакция. Её основу составляет билирубин, соединённый в печени с глюкуроновой кислотой. Это повышает его растворимость в воде и позволяет выделять его с желчью. В зависимости от метода в прямую фракцию может входить и билирубин, прочно связанный с альбумином.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK413/', 'Direct bilirubin is the fraction measured by the direct laboratory reaction. It consists mainly of bilirubin that the liver has joined to glucuronic acid, making it more water-soluble and allowing excretion into bile. Depending on the method, the direct fraction can also include bilirubin tightly bound to albumin.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK413/'),
  ('indirect_bilirubin', 'Непрямой билирубин отражает преимущественно неконъюгированный билирубин.', 'Indirect bilirubin mainly represents unconjugated bilirubin.', 'Непрямой билирубин отражает преимущественно неконъюгированный билирубин. Он образуется при распаде гема и плохо растворим в воде, поэтому переносится к печени в связи с альбумином. В лабораторном бланке его обычно получают как разность общего и прямого билирубина.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK413/', 'Indirect bilirubin mainly represents unconjugated bilirubin. It forms when heme is broken down and is poorly soluble in water, so it travels to the liver bound to albumin. Laboratories usually report it as the difference between total and direct bilirubin.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK413/'),
  ('cholesterol', 'Общий холестерин показывает суммарное количество холестерина, переносимого разными липопротеинами крови.', 'Total cholesterol measures the combined amount of cholesterol carried by different lipoproteins in blood.', 'Общий холестерин показывает суммарное количество холестерина, переносимого разными липопротеинами крови. Холестерин входит в состав клеточных мембран и служит исходным веществом для синтеза стероидных гормонов и желчных кислот. Поскольку холестерин плохо растворим в воде, он циркулирует в составе частиц. Общая концентрация не показывает распределение между ними.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK305896/', 'Total cholesterol measures the combined amount of cholesterol carried by different lipoproteins in blood. Cholesterol is a component of cell membranes and a starting material for steroid hormones and bile acids. Because it is poorly soluble in water, it circulates in particles. The total does not show how cholesterol is distributed among them.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK305896/'),
  ('hdl-cholesterol', 'ЛПВП-холестерин показывает количество холестерина, переносимого липопротеинами высокой плотности.', 'HDL cholesterol is the amount of cholesterol carried in high-density lipoproteins.', 'ЛПВП-холестерин показывает количество холестерина, переносимого липопротеинами высокой плотности. Частицы ЛПВП участвуют в переносе холестерина от клеток к печени напрямую или через обмен с другими частицами. Лабораторное значение сообщает, сколько холестерина находится в этой фракции, и не измеряет скорость переноса.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK305896/', 'HDL cholesterol is the amount of cholesterol carried in high-density lipoproteins. HDL particles participate in moving cholesterol from cells toward the liver, directly or by exchange with other particles. The test measures how much cholesterol is in this fraction, not the rate of transport.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK305896/'),
  ('ldl-cholesterol', 'ЛПНП-холестерин показывает количество холестерина, переносимого липопротеинами низкой плотности.', 'LDL cholesterol is the amount of cholesterol carried in low-density lipoproteins.', 'ЛПНП-холестерин показывает количество холестерина, переносимого липопротеинами низкой плотности. Эти частицы образуются при переработке других липопротеинов и доставляют холестерин к клеткам через рецепторы ЛПНП. В бланке указывают количество переносимого холестерина, которое может быть измерено или рассчитано в зависимости от метода.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK305896/', 'LDL cholesterol is the amount of cholesterol carried in low-density lipoproteins. These particles form during the processing of other lipoproteins and deliver cholesterol to cells through LDL receptors. The report gives the amount of cholesterol carried, which may be measured or calculated depending on the method.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK305896/'),
  ('triglycerides', 'Триглицериды — соединения глицерина с тремя жирными кислотами, в которых организм переносит и запасает энергию.', 'Triglycerides consist of glycerol and three fatty acids and are a form in which the body transports and stores energy.', 'Триглицериды — соединения глицерина с тремя жирными кислотами, в которых организм переносит и запасает энергию. В крови их несут главным образом хиломикроны из кишечника и ЛПОНП из печени. Ферменты высвобождают из этих частиц жирные кислоты, которые ткани могут использовать или запасать.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK305896/', 'Triglycerides consist of glycerol and three fatty acids and are a form in which the body transports and stores energy. They circulate mainly in chylomicrons from the intestine and VLDL from the liver. Enzymes release fatty acids from these particles for tissues to use or store.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK305896/'),
  ('glucose', 'Глюкоза — сахар, который служит источником энергии для клеток.', 'Glucose is a sugar that supplies energy to cells.', 'Глюкоза — сахар, который служит источником энергии для клеток. Она поступает из кишечника после еды и выделяется печенью между приёмами пищи. Часть глюкозы ткани расходуют, а часть может запасаться в виде гликогена. Анализ показывает её концентрацию в момент взятия образца.

Источники
https://openstax.org/books/biology-2e/pages/37-3-regulation-of-body-processes', 'Glucose is a sugar that supplies energy to cells. It enters blood from the intestine after meals and is released by the liver between meals. Tissues use some glucose and may store some as glycogen. The test measures its concentration at the time of sampling.

Sources
https://openstax.org/books/biology-2e/pages/37-3-regulation-of-body-processes'),
  ('insulin', 'Инсулин — гормон бета-клеток поджелудочной железы, участвующий в регуляции глюкозы.', 'Insulin is a pancreatic beta-cell hormone that helps regulate glucose.', 'Инсулин — гормон бета-клеток поджелудочной железы, участвующий в регуляции глюкозы. При поступлении глюкозы инсулин помогает мышцам и жировой ткани её поглощать и ограничивает выделение глюкозы печенью. Концентрация в пробе зависит и от секреции гормона, и от того, как быстро он выводится из кровотока.

Источники
https://openstax.org/books/biology-2e/pages/37-3-regulation-of-body-processes', 'Insulin is a pancreatic beta-cell hormone that helps regulate glucose. When glucose enters the circulation, insulin promotes its uptake by muscle and fat and limits glucose release by the liver. Its concentration in the sample reflects both secretion and clearance.

Sources
https://openstax.org/books/biology-2e/pages/37-3-regulation-of-body-processes'),
  ('fructosamine', 'Фруктозамин отражает содержание белков сыворотки, к которым присоединилась глюкоза.', 'Fructosamine reflects serum proteins to which glucose has attached, with albumin usually making the largest contribution.', 'Фруктозамин отражает содержание белков сыворотки, к которым присоединилась глюкоза. Главный вклад обычно вносит альбумин. Такое присоединение происходит без участия фермента, пока белок циркулирует. По времени фруктозамин охватывает более короткий период, чем HbA1c, поскольку белки сыворотки обновляются быстрее эритроцитов.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/', 'Fructosamine reflects serum proteins to which glucose has attached, with albumin usually making the largest contribution. This attachment occurs without an enzyme as proteins circulate. It represents a shorter period than HbA1c because serum proteins turn over faster than red blood cells.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/'),
  ('c-peptide', 'С-пептид образуется при превращении проинсулина в инсулин.', 'C-peptide is generated when proinsulin is processed into insulin.', 'С-пептид образуется при превращении проинсулина в инсулин. Бета-клетки выделяют обе молекулы вместе. Инсулин и С-пептид затем удаляются из крови с разной скоростью, поэтому их концентрации различаются. С-пептид помогает оценивать, сколько инсулина вырабатывают собственные бета-клетки.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/', 'C-peptide is generated when proinsulin is processed into insulin. Beta cells release the two products together. Insulin and C-peptide then leave the circulation at different rates, so their concentrations differ. C-peptide helps assess insulin production by the body’s own beta cells.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/'),
  ('tsh', 'ТТГ — гормон гипофиза, который стимулирует щитовидную железу.', 'TSH is a pituitary hormone that stimulates the thyroid gland.', 'ТТГ — гормон гипофиза, который стимулирует щитовидную железу. Он связывается с рецепторами её клеток и поддерживает образование и выделение тиреоидных гормонов. Тиреоидные гормоны, в свою очередь, влияют на секрецию ТТГ по механизму обратной связи. Так гипофиз и щитовидная железа регулируют друг друга.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK279113/', 'TSH is a pituitary hormone that stimulates the thyroid gland. It binds receptors on thyroid cells and supports the production and release of thyroid hormones. Thyroid hormones in turn affect TSH secretion through feedback. This links the activity of the pituitary and thyroid glands.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK279113/'),
  ('ft3', 'Свободный Т3 — доля трийодтиронина, которая не связана с транспортными белками крови.', 'Free T3 is the fraction of triiodothyronine not bound to transport proteins in blood.', 'Свободный Т3 — доля трийодтиронина, которая не связана с транспортными белками крови. Часть Т3 выделяет щитовидная железа, а значительная часть образуется в тканях из Т4. Т3 связывается с ядерными рецепторами и регулирует активность генов. Общий Т3 включает свободную и связанную части.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK279113/', 'Free T3 is the fraction of triiodothyronine not bound to transport proteins in blood. The thyroid secretes some T3, and much of it is generated from T4 in tissues. T3 binds nuclear receptors and regulates gene activity. Total T3 includes both free and protein-bound hormone.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK279113/'),
  ('ft4', 'Свободный Т4 — доля тироксина, которая не связана с транспортными белками крови.', 'Free T4 is the fraction of thyroxine not bound to transport proteins in blood.', 'Свободный Т4 — доля тироксина, которая не связана с транспортными белками крови. Тироксин составляет основную часть гормонов, выделяемых щитовидной железой. В тканях часть Т4 превращается в Т3. Измерение свободной фракции отличается от общего Т4, который включает также белково-связанный гормон.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK279113/', 'Free T4 is the fraction of thyroxine not bound to transport proteins in blood. Thyroxine is the principal hormone secreted by the thyroid gland. Some T4 is converted into T3 in tissues. Free T4 differs from total T4, which also includes protein-bound hormone.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK279113/'),
  ('na', 'Анализ натрия измеряет концентрацию основного положительного иона внеклеточной жидкости.', 'The sodium test measures the principal positive ion in extracellular fluid.', 'Анализ натрия измеряет концентрацию основного положительного иона внеклеточной жидкости. Натрий вместе с другими растворёнными веществами влияет на перемещение воды между клетками и окружающей средой. Его концентрация зависит от соотношения натрия и воды. Она не равна общему количеству натрия в организме.

Источники
https://medlineplus.gov/lab-tests/sodium-blood-test/', 'The sodium test measures the principal positive ion in extracellular fluid. Together with other dissolved substances, sodium influences how water moves between cells and their surroundings. Its concentration depends on the balance between sodium and water and is not the same as total body sodium.

Sources
https://medlineplus.gov/lab-tests/sodium-blood-test/'),
  ('k', 'Калий — основной положительный ион внутри клеток.', 'Potassium is the main positive ion inside cells.', 'Калий — основной положительный ион внутри клеток. Разница концентраций калия внутри и снаружи клетки участвует в формировании электрического потенциала её мембраны. Это важно для работы мышц и нервов. Анализ крови измеряет внеклеточную концентрацию, хотя большая часть калия находится внутри клеток.

Источники
https://medlineplus.gov/lab-tests/potassium-blood-test/', 'Potassium is the main positive ion inside cells. The difference in potassium concentration across the cell membrane helps establish its electrical potential, which is important for muscle and nerve function. A blood test measures the extracellular concentration even though most potassium is inside cells.

Sources
https://medlineplus.gov/lab-tests/potassium-blood-test/'),
  ('ca', 'Общий кальций включает свободные ионы кальция и кальций, связанный с белками или небольшими молекулами.', 'Total calcium includes free calcium ions and calcium bound to proteins or small molecules.', 'Общий кальций включает свободные ионы кальция и кальций, связанный с белками или небольшими молекулами. Свободные ионы участвуют в клеточной сигнализации, мышечном сокращении и свёртывании крови. Поэтому общий кальций характеризует суммарное содержание этих форм в пробе, а ионизированный кальций определяют отдельно.

Источники
https://nutritionalassessment.org/calcium/', 'Total calcium includes free calcium ions and calcium bound to proteins or small molecules. Free ions take part in cell signaling, muscle contraction, and blood clotting. Total calcium combines these forms in the sample, while ionized calcium is measured separately.

Sources
https://nutritionalassessment.org/calcium/'),
  ('mg', 'Анализ магния измеряет его концентрацию в крови, где находится лишь небольшая часть магния организма.', 'The magnesium test measures its concentration in blood, which contains only a small share of body magnesium.', 'Анализ магния измеряет его концентрацию в крови, где находится лишь небольшая часть магния организма. Большая часть распределена в костях и мягких тканях. Магний взаимодействует с АТФ и участвует во многих реакциях ферментов. Концентрация в пробе описывает циркулирующую часть, а не все запасы.

Источники
https://nutritionalassessment.org/magnesium/', 'The magnesium test measures its concentration in blood, which contains only a small share of body magnesium. Most is distributed in bone and soft tissues. Magnesium interacts with ATP and participates in many enzyme reactions. Blood concentration describes the circulating portion rather than total stores.

Sources
https://nutritionalassessment.org/magnesium/'),
  ('p', 'Под названием «фосфор» в биохимическом анализе крови обычно измеряют неорганический фосфат.', 'In blood chemistry, a test labeled phosphorus usually measures inorganic phosphate.', 'Под названием «фосфор» в биохимическом анализе крови обычно измеряют неорганический фосфат. Фосфат входит в структуру костей, АТФ и нуклеиновых кислот, но анализ оценивает циркулирующую неорганическую фракцию. Её концентрация связана с поступлением из кишечника, обменом с тканями и выведением почками.

Источники
https://nutritionalassessment.org/phosphorus/', 'In blood chemistry, a test labeled phosphorus usually measures inorganic phosphate. Phosphate is part of bone, ATP, and nucleic acids, but the test measures the circulating inorganic fraction. Its concentration reflects intestinal uptake, exchange with tissues, and excretion by the kidneys.

Sources
https://nutritionalassessment.org/phosphorus/'),
  ('cl', 'Хлорид — основной отрицательно заряженный ион внеклеточной жидкости.', 'Chloride is the principal negatively charged ion in extracellular fluid.', 'Хлорид — основной отрицательно заряженный ион внеклеточной жидкости. Он помогает уравновешивать положительные заряды и участвует в поддержании водного и кислотно-основного баланса. Анализ измеряет концентрацию хлорида в крови, где его содержание связано с обменом натрия и бикарбоната.

Источники
https://medlineplus.gov/lab-tests/chloride-blood-test/', 'Chloride is the principal negatively charged ion in extracellular fluid. It helps balance positive charges and participates in fluid and acid–base balance. The test measures chloride in blood, where its concentration is linked to sodium and bicarbonate handling.

Sources
https://medlineplus.gov/lab-tests/chloride-blood-test/'),
  ('alpha-2_globulins', 'Альфа-2 глобулины — группа белков, образующих общую зону на электрофореграмме.', 'Alpha-2 globulins are proteins that share a zone on the electrophoresis trace.', 'Альфа-2 глобулины — группа белков, образующих общую зону на электрофореграмме. В неё входят, в частности, гаптоглобин, связывающий свободный гемоглобин, и альфа-2-макроглобулин, который связывает протеазы. Измерение объединяет вклад этих и других белков с близкой электрофоретической подвижностью.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/', 'Alpha-2 globulins are proteins that share a zone on the electrophoresis trace. They include haptoglobin, which binds free hemoglobin, and alpha-2 macroglobulin, which binds proteases. The measurement combines these and other proteins with similar electrophoretic mobility.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/'),
  ('beta_globulins', 'Бета-глобулины — белки сыворотки, которые образуют бета-зону при электрофорезе.', 'Beta globulins are serum proteins that form the beta zone on electrophoresis.', 'Бета-глобулины — белки сыворотки, которые образуют бета-зону при электрофорезе. Среди них есть белки транспорта, например трансферрин, и белки иммунной системы, включая компоненты комплемента. При более детальном разделении зону делят на бета-1 и бета-2. Суммарная фракция объединяет их вклад.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/', 'Beta globulins are serum proteins that form the beta zone on electrophoresis. They include transport proteins such as transferrin and immune proteins such as complement components. A higher-resolution separation distinguishes beta-1 and beta-2. The combined fraction includes both contributions.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/'),
  ('beta-2_globulins', 'Бета-2 глобулины составляют одну из двух частей бета-зоны электрофореграммы.', 'Beta-2 globulins form one of the two regions of the beta zone on an electrophoresis trace.', 'Бета-2 глобулины составляют одну из двух частей бета-зоны электрофореграммы. В эту область может попадать компонент комплемента C3, участвующий в иммунной защите. Состав пика зависит от метода разделения. Результат отражает суммарный сигнал зоны, а концентрацию C3 измеряют отдельно.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/
https://www.mycts.org/Portals/0/Assay_PI/Source%20Plasma/Serum%20Protein.pdf', 'Beta-2 globulins form one of the two regions of the beta zone on an electrophoresis trace. This region can include complement component C3, which participates in immune defense. Peak composition depends on the separation method. The result reports the zone as a whole, while C3 can be measured separately.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/
https://www.mycts.org/Portals/0/Assay_PI/Source%20Plasma/Serum%20Protein.pdf'),
  ('gamma_globulins', 'Гамма-глобулины — фракция сывороточных белков, которую выделяют электрофорезом.', 'Gamma globulins are a fraction of serum proteins separated by electrophoresis.', 'Гамма-глобулины — фракция сывороточных белков, которую выделяют электрофорезом. Значительную часть составляют иммуноглобулины, вырабатываемые плазматическими клетками. Некоторые иммуноглобулины могут мигрировать и в соседние зоны, поэтому гамма-фракция не заменяет измерения отдельных классов антител.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/', 'Gamma globulins are a fraction of serum proteins separated by electrophoresis. Immunoglobulins produced by plasma cells account for much of the fraction. Some immunoglobulins can migrate into neighboring zones, so the gamma fraction does not replace tests for individual antibody classes.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/'),
  ('ggtp', 'ГГТП — фермент, который переносит гамма-глутамильные группы и участвует в обмене глутатиона.', 'GGT transfers gamma-glutamyl groups and helps metabolize glutathione.', 'ГГТП — фермент, который переносит гамма-глутамильные группы и участвует в обмене глутатиона. Он связан с клеточными мембранами и встречается, в частности, в печени и желчевыводящих путях. Анализ измеряет активность фермента в сыворотке и не разделяет её по отдельным органам.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK203/', 'GGT transfers gamma-glutamyl groups and helps metabolize glutathione. It is associated with cell membranes and occurs in tissues including the liver and biliary tract. The test measures enzyme activity in serum without assigning it to an individual organ.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK203/'),
  ('ldh', 'ЛДГ — фермент, который обеспечивает обратимое превращение пирувата и лактата.', 'LDH catalyzes the reversible conversion of pyruvate and lactate.', 'ЛДГ — фермент, который обеспечивает обратимое превращение пирувата и лактата. Реакция связана с обменом NADH и NAD⁺ и участвует в поддержании гликолиза. Разные формы ЛДГ встречаются во многих тканях. Обычный анализ измеряет их суммарную активность в крови.

Источники
https://medlineplus.gov/lab-tests/lactate-dehydrogenase-ldh-test/
https://www.ncbi.nlm.nih.gov/books/NBK591140/', 'LDH catalyzes the reversible conversion of pyruvate and lactate. The reaction is coupled to NADH and NAD⁺ and supports glycolysis. Different forms of LDH occur in many tissues. A routine test measures their combined activity in blood.

Sources
https://medlineplus.gov/lab-tests/lactate-dehydrogenase-ldh-test/
https://www.ncbi.nlm.nih.gov/books/NBK591140/'),
  ('glycated_hemoglobin', 'Гликированный гемоглобин образуется, когда глюкоза без участия ферментов присоединяется к гемоглобину в эритроцитах.', 'Glycated hemoglobin forms when glucose attaches to hemoglobin in red cells without an enzyme.', 'Гликированный гемоглобин образуется, когда глюкоза без участия ферментов присоединяется к гемоглобину в эритроцитах. По мере циркуляции клеток такое соединение накапливается, поэтому результат зависит от контакта клеток с глюкозой за предшествующее время. HbA1c — конкретная стандартизованная фракция гликированного гемоглобина.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/', 'Glycated hemoglobin forms when glucose attaches to hemoglobin in red cells without an enzyme. It accumulates as the cells circulate, so the result reflects their previous exposure to glucose. HbA1c is a specific standardized fraction of glycated hemoglobin.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC10516260/'),
  ('antibodies-to-thyroglobulin', 'АТТГ — антитела, которые распознают тиреоглобулин.', 'TgAb are antibodies that recognize thyroglobulin.', 'АТТГ — антитела, которые распознают тиреоглобулин. Этот белок образуется в щитовидной железе и служит основой для образования её гормонов. Иммунологический анализ выявляет антитела к белку. Сам тиреоглобулин измеряют отдельным исследованием.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK279113/', 'TgAb are antibodies that recognize thyroglobulin. The thyroid makes this protein and uses it as a scaffold for hormone synthesis. An immunoassay detects antibodies against the protein. Thyroglobulin itself is measured by a separate test.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK279113/'),
  ('antibody-to-thyroid-peroxidase ', 'АТПО — антитела к тиреопероксидазе, ферменту щитовидной железы.', 'TPOAb are antibodies against thyroid peroxidase, an enzyme in the thyroid gland.', 'АТПО — антитела к тиреопероксидазе, ферменту щитовидной железы. Тиреопероксидаза участвует в присоединении йода к остаткам тирозина в тиреоглобулине и в образовании тиреоидных гормонов. Анализ определяет антитела к ферменту, а не скорость его работы.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK279113/', 'TPOAb are antibodies against thyroid peroxidase, an enzyme in the thyroid gland. Thyroid peroxidase helps attach iodine to tyrosine residues in thyroglobulin and form thyroid hormones. The assay detects antibodies against the enzyme rather than measuring how fast it works.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK279113/'),
  ('beta-1_globulins', 'Бета-1 глобулины составляют одну из частей бета-зоны при электрофорезе сыворотки.', 'Beta-1 globulins form one part of the beta zone in serum electrophoresis.', 'Бета-1 глобулины составляют одну из частей бета-зоны при электрофорезе сыворотки. Один из главных компонентов этой части — трансферрин, который переносит железо в крови. Анализ измеряет общий сигнал белков в зоне. Содержание трансферрина можно измерить независимо.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK204/
https://www.mycts.org/Portals/0/Assay_PI/Source%20Plasma/Serum%20Protein.pdf', 'Beta-1 globulins form one part of the beta zone in serum electrophoresis. A major component is transferrin, the protein that carries iron in blood. The measurement combines the proteins in that zone. Transferrin concentration can also be measured independently.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK204/
https://www.mycts.org/Portals/0/Assay_PI/Source%20Plasma/Serum%20Protein.pdf'),
  ('de_ritis_ratio', 'Коэффициент де Ритиса — отношение активности АСТ к активности АЛТ.', 'The De Ritis ratio is AST activity divided by ALT activity.', 'Коэффициент де Ритиса — отношение активности АСТ к активности АЛТ. Для расчёта обе активности должны быть выражены в одинаковых единицах. АСТ и АЛТ участвуют в обмене аминокислот, но распределены в тканях по-разному. Коэффициент описывает их соотношение и не показывает абсолютную активность каждого фермента.

Источники
https://pmc.ncbi.nlm.nih.gov/articles/PMC3866949/', 'The De Ritis ratio is AST activity divided by ALT activity. The two activities must use the same units. AST and ALT participate in amino acid metabolism but have different tissue distributions. The ratio describes their relative activities without giving the absolute activity of either enzyme.

Sources
https://pmc.ncbi.nlm.nih.gov/articles/PMC3866949/'),
  ('homa_ir', 'HOMA-IR — расчётная оценка инсулинорезистентности по глюкозе и инсулину натощак.', 'HOMA-IR estimates insulin resistance from fasting glucose and insulin.', 'HOMA-IR — расчётная оценка инсулинорезистентности по глюкозе и инсулину натощак. Модель использует обратную связь между выделением инсулина и контролем глюкозы в состоянии натощак. В классической формуле произведение глюкозы в ммоль/л и инсулина в мкМЕ/мл делят на 22,5. Результат получают расчётом, без прямого измерения ответа тканей на инсулин.

Источники
https://pubmed.ncbi.nlm.nih.gov/3899825/', 'HOMA-IR estimates insulin resistance from fasting glucose and insulin. The model uses feedback between insulin secretion and glucose control in the fasting state. The classic equation multiplies glucose in mmol/L by insulin in μIU/mL and divides by 22.5. It is a calculated estimate, without directly measuring tissue responses to insulin.

Sources
https://pubmed.ncbi.nlm.nih.gov/3899825/'),
  ('ionized_calcium', 'Ионизированный кальций — свободные ионы кальция в крови.', 'Ionized calcium is the free calcium ion fraction in blood.', 'Ионизированный кальций — свободные ионы кальция в крови. Эта фракция доступна для процессов клеточной сигнализации, сокращения мышц и свёртывания. Часть кальция связывается с белками, а равновесие между свободной и связанной формами зависит, в частности, от кислотности. Ионизированный кальций измеряют отдельно от общего.

Источники
https://nutritionalassessment.org/calcium/', 'Ionized calcium is the free calcium ion fraction in blood. This fraction is available for cell signaling, muscle contraction, and clotting. Some calcium is protein-bound, and the balance between the free and bound forms depends in part on acidity. Ionized calcium is measured separately from total calcium.

Sources
https://nutritionalassessment.org/calcium/'),
  ('vitamin-b12-plasma', 'Показатель отражает суммарную концентрацию витамина B12 в плазме.', 'This measure is the total vitamin B12 concentration in plasma.', 'Показатель отражает суммарную концентрацию витамина B12 в плазме. Кобаламин циркулирует в составе комплексов с транспортными белками, включая транскобаламин и гаптокоррин. Общий анализ учитывает обе связанные фракции. Доставку B12 в клетки обеспечивает преимущественно комплекс с транскобаламином.

Источники
https://nutritionalassessment.org/b12/', 'This measure is the total vitamin B12 concentration in plasma. Cobalamin circulates bound to transport proteins, including transcobalamin and haptocorrin. The total assay includes both fractions. Delivery of B12 to cells is mediated primarily by the transcobalamin-bound fraction.

Sources
https://nutritionalassessment.org/b12/'),
  ('vitamin-c-plasma', 'Показатель отражает концентрацию витамина C в плазме.', 'This test measures vitamin C concentration in plasma.', 'Показатель отражает концентрацию витамина C в плазме. Аскорбат участвует в окислительно-восстановительных реакциях и помогает ферментам, которые обеспечивают созревание коллагена. Плазменная концентрация описывает циркулирующую часть витамина в момент взятия пробы и может зависеть от недавнего поступления.

Источники
https://nutritionalassessment.org/vitaminc/', 'This test measures vitamin C concentration in plasma. Ascorbate participates in redox reactions and supports enzymes involved in collagen maturation. The plasma concentration represents circulating vitamin C at sampling and can be affected by recent intake.

Sources
https://nutritionalassessment.org/vitaminc/'),
  ('serum-retinol', 'Сывороточный ретинол измеряет одну из циркулирующих форм витамина A.', 'Serum retinol measures a circulating form of vitamin A.', 'Сывороточный ретинол измеряет одну из циркулирующих форм витамина A. Печень выделяет ретинол в кровь в комплексе с ретинол-связывающим белком. В тканях из него образуются соединения, участвующие в зрении и регуляции экспрессии генов. Измеряют концентрацию в сыворотке, а не количество витамина, запасённое в печени.

Источники
https://nutritionalassessment.org/vitamina/', 'Serum retinol measures a circulating form of vitamin A. The liver releases retinol into blood bound to retinol-binding protein. Tissues convert it to compounds involved in vision and regulation of gene expression. The test measures serum concentration rather than vitamin A stored in the liver.

Sources
https://nutritionalassessment.org/vitamina/'),
  ('vitamin-d-25oh-total', 'Общий 25-ОН витамин D отражает суммарное содержание 25-гидроксилированных форм витамина D₂ и D₃.', 'Total 25-hydroxyvitamin D measures the combined 25-hydroxylated forms of vitamins D₂ and D₃.', 'Общий 25-ОН витамин D отражает суммарное содержание 25-гидроксилированных форм витамина D₂ и D₃. Они образуются преимущественно в печени из поступившего или синтезированного витамина D. Этот показатель отличается от активного 1,25-дигидроксивитамина D, который образуется при следующем превращении, главным образом в почках.

Источники
https://nutritionalassessment.org/vitaminD/', 'Total 25-hydroxyvitamin D measures the combined 25-hydroxylated forms of vitamins D₂ and D₃. These are formed mainly in the liver from absorbed or synthesized vitamin D. This measurement differs from active 1,25-dihydroxyvitamin D, which is produced in a subsequent conversion, mainly in the kidneys.

Sources
https://nutritionalassessment.org/vitaminD/'),
  ('alpha-tocopherol', 'Альфа-токоферол — одна из форм витамина E, преимущественно удерживаемая организмом.', 'Alpha-tocopherol is a form of vitamin E preferentially retained by the body.', 'Альфа-токоферол — одна из форм витамина E, преимущественно удерживаемая организмом. Он переносится кровью в составе липопротеинов и помогает защищать липиды мембран от цепного окисления. Анализ измеряет его концентрацию. Отношения к липидам или холестерину рассчитывают отдельно.

Источники
https://nutritionalassessment.org/vitamine/', 'Alpha-tocopherol is a form of vitamin E preferentially retained by the body. It travels in lipoproteins and helps protect membrane lipids from oxidation chain reactions. The test measures its concentration. Ratios to lipids or cholesterol are calculated separately.

Sources
https://nutritionalassessment.org/vitamine/'),
  ('alpha-tocopherol-total-lipids-ratio', 'Показатель выражает количество альфа-токоферола относительно содержания общих липидов в пробе.', 'This ratio expresses alpha-tocopherol relative to the total lipid content of the sample.', 'Показатель выражает количество альфа-токоферола относительно содержания общих липидов в пробе. Альфа-токоферол переносится липопротеинами, поэтому нормирование на липиды учитывает различия в количестве переносчиков. Знаменатель — общие липиды. Отношение к одному только холестерину рассчитывают отдельно.

Источники
https://nutritionalassessment.org/vitamine/
https://doi.org/10.1177/000456328602300505', 'This ratio expresses alpha-tocopherol relative to the total lipid content of the sample. Alpha-tocopherol travels in lipoproteins, so lipid adjustment accounts for differences in the amount of its carriers. The denominator is total lipids. A ratio to cholesterol alone is a separate measure.

Sources
https://nutritionalassessment.org/vitamine/
https://doi.org/10.1177/000456328602300505'),
  ('thiamine-diphosphate-whole-blood', 'Анализ измеряет тиаминдифосфат, активную коферментную форму витамина B1, в цельной крови.', 'This test measures thiamine diphosphate, an active coenzyme form of vitamin B1, in whole blood.', 'Анализ измеряет тиаминдифосфат, активную коферментную форму витамина B1, в цельной крови. Большая часть измеряемого вещества находится в эритроцитах, которые остаются в образце вместе с плазмой. Внутри клеток тиаминдифосфат помогает ферментам обмена углеводов, включая транскетолазу.

Источники
https://nutritionalassessment.org/thiamine/
https://www.mayocliniclabs.com/test-catalog/Overview/42356', 'This test measures thiamine diphosphate, an active coenzyme form of vitamin B1, in whole blood. Most of the measured compound is in red cells, which remain in the sample along with plasma. Within cells, thiamine diphosphate supports enzymes of carbohydrate metabolism, including transketolase.

Sources
https://nutritionalassessment.org/thiamine/
https://www.mayocliniclabs.com/test-catalog/Overview/42356'),
  ('thiamine-diphosphate-erythrocytes', 'Показатель измеряет тиаминдифосфат непосредственно в эритроцитарной фракции.', 'This measure quantifies thiamine diphosphate specifically in the red blood cell fraction.', 'Показатель измеряет тиаминдифосфат непосредственно в эритроцитарной фракции. Эта форма витамина B1 необходима транскетолазе и другим ферментам обмена углеводов. Материал измерения здесь — эритроциты, поэтому результат не следует подменять концентрацией тиаминдифосфата в цельной крови.

Источники
https://nutritionalassessment.org/thiamine/', 'This measure quantifies thiamine diphosphate specifically in the red blood cell fraction. This form of vitamin B1 is required by transketolase and other enzymes of carbohydrate metabolism. The sample is red cells, so the result is distinct from a whole-blood thiamine diphosphate concentration.

Sources
https://nutritionalassessment.org/thiamine/'),
  ('erythrocyte-transketolase-activity', 'Показатель измеряет базальную активность транскетолазы эритроцитов.', 'This test measures the basal activity of red blood cell transketolase.', 'Показатель измеряет базальную активность транскетолазы эритроцитов. Этот фермент переносит фрагменты сахаров в пентозофосфатном пути и работает с тиаминдифосфатом в качестве кофактора. Базальная активность определяется без добавления кофактора. Коэффициент активации потребовал бы дополнительного измерения после его добавления.

Источники
https://nutritionalassessment.org/thiamine/
https://doi.org/10.1177/000456328702400106', 'This test measures the basal activity of red blood cell transketolase. The enzyme transfers sugar fragments in the pentose phosphate pathway and uses thiamine diphosphate as a cofactor. Basal activity is measured without adding cofactor. An activation coefficient would require a second measurement after adding it.

Sources
https://nutritionalassessment.org/thiamine/
https://doi.org/10.1177/000456328702400106'),
  ('erythrocyte-glutathione-reductase-activation', 'EGRAC показывает, во сколько раз активность глутатионредуктазы эритроцитов меняется после добавления ФАД.', 'EGRAC compares red blood cell glutathione reductase activity after adding FAD with activity before addition.', 'EGRAC показывает, во сколько раз активность глутатионредуктазы эритроцитов меняется после добавления ФАД. ФАД образуется из рибофлавина и помогает ферменту восстанавливать глутатион. В лаборатории сравнивают активность в двух условиях, с добавленным ФАД и без него, поэтому результат выражается отношением.

Источники
https://nutritionalassessment.org/riboflavin/', 'EGRAC compares red blood cell glutathione reductase activity after adding FAD with activity before addition. FAD is derived from riboflavin and helps the enzyme regenerate reduced glutathione. Comparing activity under these two laboratory conditions produces a ratio.

Sources
https://nutritionalassessment.org/riboflavin/'),
  ('urine-n1-methylnicotinamide-creatinine', 'Показатель выражает количество N¹-метилникотинамида в моче относительно креатинина.', 'This measure reports urinary N¹-methylnicotinamide relative to creatinine.', 'Показатель выражает количество N¹-метилникотинамида в моче относительно креатинина. Метаболит образуется при переработке никотинамида, связанного с обменом коферментов NAD и NADP. Деление на концентрацию креатинина учитывает различия в разведении мочи. Полученное отношение отличается от количества метаболита, выделенного за сутки.

Источники
https://nutritionalassessment.org/niacin/', 'This measure reports urinary N¹-methylnicotinamide relative to creatinine. The metabolite forms during processing of nicotinamide associated with NAD and NADP metabolism. Dividing by urinary creatinine accounts for differences in urine dilution. The ratio is distinct from the amount excreted over a full day.

Sources
https://nutritionalassessment.org/niacin/'),
  ('urine-2-pyridone-creatinine', 'Показатель выражает количество 2-пиридона в моче относительно креатинина.', 'This measure reports urinary 2-pyridone relative to creatinine.', 'Показатель выражает количество 2-пиридона в моче относительно креатинина. 2-пиридон образуется при дальнейшем превращении N¹-метилникотинамида и выводится с мочой. Нормирование на креатинин учитывает разбавление образца, но даёт отношение, а не суточную экскрецию метаболита.

Источники
https://nutritionalassessment.org/niacin/', 'This measure reports urinary 2-pyridone relative to creatinine. 2-Pyridone forms during further metabolism of N¹-methylnicotinamide and is excreted in urine. Creatinine adjustment accounts for sample dilution but produces a ratio rather than daily excretion.

Sources
https://nutritionalassessment.org/niacin/'),
  ('urine-2-pyridone-n1-mna-ratio', 'Показатель сравнивает два метаболита никотинамида в одном образце мочи.', 'This measure compares two nicotinamide metabolites in the same urine sample.', 'Показатель сравнивает два метаболита никотинамида в одном образце мочи. N¹-метилникотинамид может превращаться в 2-пиридон, поэтому отношение показывает относительное распределение между продуктами этого пути обмена. Из него нельзя узнать, сколько каждого метаболита было выведено за сутки.

Источники
https://nutritionalassessment.org/niacin/', 'This measure compares two nicotinamide metabolites in the same urine sample. N¹-methylnicotinamide can be converted to 2-pyridone, so their ratio describes relative amounts along this metabolic pathway. It does not provide the daily amount excreted of either metabolite.

Sources
https://nutritionalassessment.org/niacin/'),
  ('serum-folate', 'Сывороточный фолат показывает концентрацию циркулирующих форм витамина B9.', 'Serum folate measures the circulating forms of vitamin B9.', 'Сывороточный фолат показывает концентрацию циркулирующих форм витамина B9. Производные фолата переносят одноуглеродные группы, необходимые, в частности, для синтеза нуклеотидов. Содержание в сыворотке реагирует на недавнее поступление фолата быстрее, чем его содержание в эритроцитах.

Источники
https://nutritionalassessment.org/folate/', 'Serum folate measures the circulating forms of vitamin B9. Folate derivatives transfer one-carbon groups needed, among other things, for nucleotide synthesis. Serum concentration responds to recent folate intake more quickly than red blood cell folate.

Sources
https://nutritionalassessment.org/folate/'),
  ('erythrocyte-folate', 'Эритроцитарный фолат измеряет фолаты в красных клетках крови.', 'Red blood cell folate measures folates within red cells.', 'Эритроцитарный фолат измеряет фолаты в красных клетках крови. Эти клетки накапливают фолат преимущественно в период образования в костном мозге и удерживают его по мере циркуляции. Поэтому показатель отражает более продолжительный период поступления и обмена фолата, чем сывороточная концентрация.

Источники
https://nutritionalassessment.org/folate/', 'Red blood cell folate measures folates within red cells. The cells accumulate folate mainly as they are formed in the bone marrow and retain it while circulating. The result thus reflects a longer period of folate intake and metabolism than the serum concentration.

Sources
https://nutritionalassessment.org/folate/'),
  ('plasma-total-homocysteine', 'Общий гомоцистеин измеряет суммарное содержание форм гомоцистеина в плазме.', 'Total homocysteine measures the combined forms of homocysteine in plasma.', 'Общий гомоцистеин измеряет суммарное содержание форм гомоцистеина в плазме. Гомоцистеин образуется при обмене метионина. Он может превращаться обратно в метионин по пути с участием фолата и витамина B12 либо использоваться в пути образования цистеина, где участвует витамин B6. Анализ объединяет свободные и связанные формы.

Источники
https://nutritionalassessment.org/folate/', 'Total homocysteine measures the combined forms of homocysteine in plasma. Homocysteine arises during methionine metabolism. It can be recycled to methionine through a pathway involving folate and vitamin B12 or enter the pathway toward cysteine, which involves vitamin B6. The assay includes free and bound forms.

Sources
https://nutritionalassessment.org/folate/'),
  ('serum-copper', 'Сывороточная медь измеряет концентрацию меди, циркулирующей в составе белковых комплексов.', 'Serum copper measures copper circulating in protein complexes.', 'Сывороточная медь измеряет концентрацию меди, циркулирующей в составе белковых комплексов. Основную часть переносит церулоплазмин, а меньшая доля связана с другими белками. Медь входит в состав ферментов, участвующих в обмене железа и клеточных окислительных реакциях. Анализ отражает циркулирующую медь, а не её общее количество в тканях.

Источники
https://nutritionalassessment.org/copper/', 'Serum copper measures copper circulating in protein complexes. Ceruloplasmin carries most of it, with smaller amounts bound to other proteins. Copper is a component of enzymes involved in iron metabolism and cellular oxidation reactions. The test measures circulating copper rather than total tissue copper.

Sources
https://nutritionalassessment.org/copper/'),
  ('serum-zinc', 'Сывороточный цинк показывает концентрацию цинка в сыворотке, где он переносится преимущественно в связи с белками.', 'Serum zinc measures zinc in serum, where it is largely carried by proteins.', 'Сывороточный цинк показывает концентрацию цинка в сыворотке, где он переносится преимущественно в связи с белками. Цинк участвует в работе многих ферментов и в стабилизации белков, регулирующих активность генов. Анализ измеряет небольшую циркулирующую часть цинка организма.

Источники
https://nutritionalassessment.org/zinc/', 'Serum zinc measures zinc in serum, where it is largely carried by proteins. Zinc is involved in many enzyme reactions and stabilizes proteins that regulate gene activity. The test measures the small circulating portion of the body’s zinc.

Sources
https://nutritionalassessment.org/zinc/'),
  ('urine-iodine-concentration', 'Концентрация йода в моче показывает, сколько йода приходится на единицу объёма пробы.', 'Urinary iodine concentration measures iodine per unit volume of urine.', 'Концентрация йода в моче показывает, сколько йода приходится на единицу объёма пробы. После всасывания часть йода используется щитовидной железой для синтеза гормонов, а значительная доля поступившего йода выводится почками. Результат разовой пробы зависит от её разведения и отличается от количества йода, выведенного за сутки.

Источники
https://nutritionalassessment.org/iodine/', 'Urinary iodine concentration measures iodine per unit volume of urine. After absorption, the thyroid uses some iodine to make hormones, and a substantial share of intake is excreted by the kidneys. A spot concentration depends on urine dilution and differs from the amount excreted over a full day.

Sources
https://nutritionalassessment.org/iodine/'),
  ('serum-selenium', 'Сывороточный селен измеряет суммарную концентрацию селена в сыворотке.', 'Serum selenium measures total selenium concentration in serum.', 'Сывороточный селен измеряет суммарную концентрацию селена в сыворотке. Селен входит в состав нескольких белков, включая селенопротеин P и глутатионпероксидазы. Эти белки участвуют в переносе селена и восстановлении перекисей. Показатель объединяет вклад разных форм селена и не измеряет активность отдельного фермента.

Источники
https://nutritionalassessment.org/selenium/', 'Serum selenium measures total selenium concentration in serum. Selenium is a component of several proteins, including selenoprotein P and glutathione peroxidases. These proteins participate in selenium transport and peroxide reduction. The measurement combines different selenium forms and does not measure the activity of an individual enzyme.

Sources
https://nutritionalassessment.org/selenium/'),
  ('selenoprotein-p', 'Селенопротеин P — белок, который переносит селен в крови.', 'Selenoprotein P carries selenium in blood.', 'Селенопротеин P — белок, который переносит селен в крови. Он образуется преимущественно в печени, а клетки ряда тканей получают из него селен через рецепторы. Анализ определяет концентрацию этого белка. Суммарный селен включает вклад и других циркулирующих соединений.

Источники
https://nutritionalassessment.org/selenium/', 'Selenoprotein P carries selenium in blood. It is produced mainly by the liver, and some tissues acquire selenium from it through receptors. This assay measures the concentration of the protein. Total selenium also includes other circulating compounds.

Sources
https://nutritionalassessment.org/selenium/'),
  ('erythrocyte-glutathione-peroxidase-activity', 'Показатель измеряет активность глутатионпероксидазы в эритроцитах.', 'This test measures glutathione peroxidase activity in red blood cells.', 'Показатель измеряет активность глутатионпероксидазы в эритроцитах. Этот селенсодержащий фермент использует восстановленный глутатион для обезвреживания перекисей. В анализе оценивают скорость ферментативной реакции и выражают её на единицу гемоглобина. Это функциональное измерение, отличное от концентрации селена.

Источники
https://nutritionalassessment.org/selenium/
https://pmc.ncbi.nlm.nih.gov/articles/PMC11351941/', 'This test measures glutathione peroxidase activity in red blood cells. The selenium-containing enzyme uses reduced glutathione to reduce peroxides. The assay measures the rate of the enzyme reaction and reports it per unit of hemoglobin. It is a functional measurement distinct from selenium concentration.

Sources
https://nutritionalassessment.org/selenium/
https://pmc.ncbi.nlm.nih.gov/articles/PMC11351941/'),
  ('alpha-tocopherol-cholesterol-ratio', 'Показатель сравнивает концентрацию альфа-токоферола с концентрацией общего холестерина.', 'This measure compares alpha-tocopherol concentration with total cholesterol concentration.', 'Показатель сравнивает концентрацию альфа-токоферола с концентрацией общего холестерина. Альфа-токоферол переносится липопротеинами, поэтому отношение учитывает липидный контекст его циркуляции. В знаменателе используется именно холестерин, что отличает этот показатель от отношения к общим липидам.

Источники
https://nutritionalassessment.org/vitamine/', 'This measure compares alpha-tocopherol concentration with total cholesterol concentration. Alpha-tocopherol circulates in lipoproteins, so the ratio considers the lipid context of its transport. The denominator is cholesterol, which distinguishes it from the ratio to total lipids.

Sources
https://nutritionalassessment.org/vitamine/'),
  ('prolactin', 'Пролактин — гормон передней доли гипофиза, участвующий в образовании молока.', 'Prolactin is an anterior pituitary hormone that supports milk production.', 'Пролактин — гормон передней доли гипофиза, участвующий в образовании молока. Его выделение обычно сдерживает дофамин, поступающий из гипоталамуса. При стимуляции соска этот тормозящий сигнал ослабевает. Анализ измеряет циркулирующий гормон, а способы измерения могут по-разному учитывать его крупные молекулярные формы.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK507829/
https://academic.oup.com/jes/article/8/6/bvae069/7642642', 'Prolactin is an anterior pituitary hormone that supports milk production. Dopamine from the hypothalamus normally restrains its secretion, and nipple stimulation reduces that inhibitory signal. The test measures circulating hormone, and assays can differ in how they detect larger molecular forms.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK507829/
https://academic.oup.com/jes/article/8/6/bvae069/7642642'),
  ('urine-calcium-24h', 'Кальций в суточной моче показывает количество кальция, выделенного почками за 24 часа.', 'Twenty-four-hour urine calcium is the amount of calcium excreted by the kidneys over a full day.', 'Кальций в суточной моче показывает количество кальция, выделенного почками за 24 часа. Почки фильтруют кальций из крови и возвращают большую часть в кровоток. Остаток поступает в мочу. Суточный результат учитывает и концентрацию кальция, и объём собранной мочи.

Источники
https://nutritionalassessment.org/calcium/', 'Twenty-four-hour urine calcium is the amount of calcium excreted by the kidneys over a full day. The kidneys filter calcium from blood and reabsorb most of it. The remainder passes into urine. The daily result takes into account both the calcium concentration and the collected urine volume.

Sources
https://nutritionalassessment.org/calcium/'),
  ('transferrin-saturation', 'Насыщение трансферрина железом показывает долю его железосвязывающей способности, которая уже занята железом.', 'Transferrin saturation is the proportion of transferrin’s iron-binding capacity that is occupied.', 'Насыщение трансферрина железом показывает долю его железосвязывающей способности, которая уже занята железом. При расчёте концентрацию сывороточного железа сравнивают с ОЖСС в одинаковых единицах и выражают отношение в процентах. Показатель описывает заполненность переносчика, в то время как ОЖСС характеризует его суммарную способность связывать железо.

Источники
https://nutritionalassessment.org/iron/', 'Transferrin saturation is the proportion of transferrin’s iron-binding capacity that is occupied. It is calculated by comparing serum iron with total iron-binding capacity in matching units and expressing the ratio as a percentage. It describes how full the carrier is, while total iron-binding capacity describes how much iron it can bind overall.

Sources
https://nutritionalassessment.org/iron/'),
  ('c-reactive-protein', 'С-реактивный белок — белок острой фазы, который вырабатывает преимущественно печень.', 'C-reactive protein is an acute-phase protein produced mainly by the liver.', 'С-реактивный белок — белок острой фазы, который вырабатывает преимущественно печень. Сигналы воспалительного ответа, в том числе интерлейкин-6, усиливают его синтез. Циркулирующий СРБ может связываться с молекулами на повреждённых клетках и микробах, участвуя во врождённом иммунном ответе. Анализ измеряет концентрацию белка.

Источники
https://doi.org/10.1172/JCI18921', 'C-reactive protein is an acute-phase protein produced mainly by the liver. Inflammatory signals, including interleukin-6, increase its production. Circulating CRP can bind molecules on damaged cells and microbes as part of the innate immune response. The test measures its concentration.

Sources
https://doi.org/10.1172/JCI18921'),
  ('procalcitonin', 'Прокальцитонин — белковый предшественник гормона кальцитонина.', 'Procalcitonin is the protein precursor of calcitonin.', 'Прокальцитонин — белковый предшественник гормона кальцитонина. В обычных условиях клетки щитовидной железы перерабатывают его в кальцитонин. При системном воспалительном ответе его могут образовывать и другие ткани, выделяя в кровоток без полного превращения. Анализ измеряет прокальцитонин отдельно от кальцитонина.

Источники
https://pubmed.ncbi.nlm.nih.gov/11232031/', 'Procalcitonin is the protein precursor of calcitonin. Under ordinary conditions, cells in the thyroid process it into calcitonin. During a systemic inflammatory response, other tissues can also produce and release procalcitonin into the circulation without fully processing it. The test measures procalcitonin separately from calcitonin.

Sources
https://pubmed.ncbi.nlm.nih.gov/11232031/');

DO $$
BEGIN
  IF (
    SELECT count(*) FROM remaining_point_texts s
    JOIN "analysisPoint" p USING (name)
    WHERE NOT EXISTS (
      SELECT 1
      FROM analysis_type_point j
      JOIN "analysisType" t ON t.id = j."typeId"
      WHERE j."pointId" = p.id AND t.name = 'general_blood_test'
    )
  ) <> 76 THEN
    RAISE EXCEPTION 'Unexpected catalog membership for remaining point texts';
  END IF;
END $$;

UPDATE "analysisPoint" p
SET "pointHintRu" = s.hint_ru,
    "pointHintEn" = s.hint_en,
    "pointDescriptionRu" = s.description_ru,
    "pointDescriptionEn" = s.description_en
FROM remaining_point_texts s
WHERE p.name = s.name;
`;
