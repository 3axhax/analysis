export const PROLACTIN_DESCRIPTION_SQL = `
DO $$
BEGIN
  UPDATE "analysisPoint"
  SET "pointDescriptionRu" = $ru$Пролактин — белковый гормон, который поступает в кровь главным образом из лактотрофов передней доли гипофиза. Эти клетки синтезируют и выделяют его в кровоток, откуда он достигает тканей с рецепторами к пролактину. Лучше всего изучена его роль в подготовке молочной железы к лактации и в образовании молока.

Работу лактотрофов регулирует гипоталамус. Его нейроны выделяют дофамин, который поступает к гипофизу и через рецепторы D₂ сдерживает выделение пролактина. Сам пролактин может стимулировать активность этих нейронов. Так замыкается короткая петля обратной связи: гормон усиливает сигнал, ограничивающий его дальнейшее выделение.

Во время беременности пролактин вместе с другими гормонами участвует в подготовке молочной железы к кормлению. После родов снижение уровня прогестерона позволяет начаться активному образованию молока. Когда ребёнок сосёт грудь, сигнал от соска поступает в гипоталамус, тормозящее действие дофамина ослабевает и гипофиз выделяет больше пролактина. Этот ответ помогает поддерживать образование молока при последующих кормлениях.

Образование и выделение молока обеспечивают два разных гормональных сигнала:
- Пролактин действует на секреторные клетки молочной железы и поддерживает синтез молока.
- Окситоцин вызывает сокращение клеток вокруг альвеол, благодаря чему уже образовавшееся молоко продвигается по протокам.

Пролактин выделяется порциями, поэтому его концентрация меняется со временем. На этот ритм влияет сон: во время сна секреция обычно усиливается. Анализ показывает концентрацию гормона в конкретной пробе крови, тогда как секреция — процесс, который продолжается между измерениями.

В крови пролактин присутствует в нескольких молекулярных формах. Основная — мономер, то есть отдельная молекула гормона. Встречаются и более крупные формы, в том числе макропролактин, который часто представляет собой комплекс пролактина с антителом. Лабораторные иммунологические методы могут распознавать эти формы в разной степени, поэтому измеренная концентрация зависит от состава образца и используемого метода.

Источники
https://www.ncbi.nlm.nih.gov/books/NBK507829/
https://pmc.ncbi.nlm.nih.gov/articles/PMC6069739/
https://academic.oup.com/ejendo/article/186/3/P1/6954267$ru$,
      "pointDescriptionEn" = $en$Prolactin is a protein hormone that enters the bloodstream mainly from lactotrophs, specialized cells in the anterior pituitary gland. These cells produce and release prolactin into the blood, which carries it to tissues with prolactin receptors. Its best understood roles are preparing the mammary gland for lactation and supporting milk production.

The hypothalamus regulates lactotrophs. Its neurons release dopamine, which travels to the pituitary and restrains prolactin release through D₂ receptors. Prolactin itself can stimulate these neurons. This creates a short feedback loop in which the hormone strengthens a signal that limits its further release.

During pregnancy, prolactin works with other hormones to prepare the mammary gland for breastfeeding. After birth, the fall in progesterone allows active milk production to begin. When a baby suckles, signals from the nipple reach the hypothalamus, dopamine’s inhibitory effect eases, and the pituitary releases more prolactin. This response helps sustain milk production for subsequent feeds.

Milk production and milk release depend on two distinct hormonal signals:
- Prolactin acts on secretory cells in the mammary gland and supports milk synthesis.
- Oxytocin triggers contraction of cells around the alveoli, moving milk that has already been produced into the ducts.

Prolactin is released in pulses, so its concentration changes over time. Sleep affects this pattern, and secretion generally increases during sleep. A blood test measures the concentration in a particular sample, whereas secretion continues between measurements.

Prolactin circulates in several molecular forms. The main form is a monomer, or a single hormone molecule. Larger forms also occur, including macroprolactin, which often consists of prolactin bound to an antibody. Laboratory immunoassays can detect these forms to different degrees, so the measured concentration depends on the composition of the sample and the method used.

Sources
https://www.ncbi.nlm.nih.gov/books/NBK507829/
https://pmc.ncbi.nlm.nih.gov/articles/PMC6069739/
https://academic.oup.com/ejendo/article/186/3/P1/6954267$en$
  WHERE name = 'prolactin';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prolactin catalog entry is missing';
  END IF;
END $$;
`;
