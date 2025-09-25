import { AnalysisPointCreationAttrs } from './analysisPoint.model';

export const analysisPointInitialData: AnalysisPointCreationAttrs[] = [
  {
    id: 1,
    name: 'hemoglobin',
    description:
      'Белок, осуществляющий обмен кислорода между легкими и тканями организма. Имеет в своем составе железо. Зависит от эритроцитов -повышается при их увеличении и снижается, если их становится меньше.',
  },
  {
    id: 2,
    name: 'erythrocyte',
    description:
      'Самые многочисленные клетки крови, содержащие гемоглобин. Их основная функция доставлять кислород к тканям и органам.',
  },
  {
    id: 3,
    name: 'hematocrit',
    description:
      'Показывает отношение объема эритроцитов к объему жидкой части крови (чем больше, тем гуще кровь). Используется для оценки степени анемий и обезвоженности.',
  },
  {
    id: 4,
    name: 'albumin_fraction',
    description: '',
  },
  {
    id: 5,
    name: 'alpha-1_globulin_fraction',
    description: '',
  },
  {
    id: 6,
    name: 'ph_acidity',
    description: '',
  },
  {
    id: 7,
    name: 'Glucose',
    description: '',
  },
];
