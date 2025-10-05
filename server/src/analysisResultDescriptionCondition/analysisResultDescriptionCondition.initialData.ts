import { AnalysisResultDescriptionConditionAttrs } from './analysisResultDescriptionCondition.model';
import { StatusValue } from './status-value.enum';

export const analysisResultDescriptionConditionInitialData: AnalysisResultDescriptionConditionAttrs[] =
  [
    { descriptionId: 1, pointId: 1, status: StatusValue.HIGH },
    { descriptionId: 2, pointId: 1, status: StatusValue.HIGH },
    { descriptionId: 2, pointId: 2, status: StatusValue.HIGH },
  ];
