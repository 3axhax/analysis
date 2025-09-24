import { AnalysisPointCreationAttrs } from './analysisPoint.model';

export const analysisPointInitialData: AnalysisPointCreationAttrs[] = [
  {
    name: 'hemoglobin',
    description:
      'Белок, осуществляющий обмен кислорода между легкими и тканями организма. Имеет в своем составе железо. Зависит от эритроцитов -повышается при их увеличении и снижается, если их становится меньше.',
    testType: 'BLOOD_TEST',
  },
  {
    name: 'erythrocyte',
    description:
      'Самые многочисленные клетки крови, содержащие гемоглобин. Их основная функция доставлять кислород к тканям и органам.',
    testType: 'BLOOD_TEST',
  },
  {
    name: 'hematocrit',
    description:
      'Показывает отношение объема эритроцитов к объему жидкой части крови (чем больше, тем гуще кровь). Используется для оценки степени анемий и обезвоженности.',
    testType: 'BLOOD_TEST',
  },
];
