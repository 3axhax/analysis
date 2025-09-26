import { AnalysisPointCreationAttrs } from './analysisPoint.model';

export const analysisPointInitialData: AnalysisPointCreationAttrs[] = [
  {
    id: 1,
    name: 'hemoglobin',
    units: 'g/l',
  },
  {
    id: 2,
    name: 'erythrocyte',
    units: '10^12/l',
  },
  {
    id: 3,
    name: 'hematocrit',
    units: '%',
  },
  {
    id: 4,
    name: 'albumin_fraction',
    units: '%',
    alt_units: 'g/l',
  },
  {
    id: 5,
    name: 'alpha-1_globulin_fraction',
    units: '%',
    alt_units: 'g/l',
  },
  {
    id: 6,
    name: 'ph_acidity',
    units: 'g/l',
  },
  {
    id: 7,
    name: 'glucose',
    units: 'µmol/l',
  },
];
