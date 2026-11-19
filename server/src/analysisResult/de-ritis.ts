import Decimal from 'decimal.js';

const D = Decimal.clone({ precision: 80 });
export interface RatioInput {
  pointId: number;
  value: number | string;
  sourceValue?: number | string | null;
  unitId: number;
  sourceUnitId?: number | null;
}
export function calculateDeRitis(points: RatioInput[], enzymeUnitId: number) {
  return calculateResultRatio(points, 33, 32, enzymeUnitId);
}

export function calculateResultRatio(
  points: RatioInput[],
  numeratorId: number,
  denominatorId: number,
  unitId: number,
) {
  const numerators = points.filter((point) => point.pointId === numeratorId);
  const denominators = points.filter((point) => point.pointId === denominatorId);
  if (numerators.length !== 1 || denominators.length !== 1) return null;
  if ((denominators[0].sourceUnitId ?? denominators[0].unitId) !== unitId || (numerators[0].sourceUnitId ?? numerators[0].unitId) !== unitId) return null;
  try {
    const denominator = new D(denominators[0].sourceValue ?? denominators[0].value);
    const numerator = new D(numerators[0].sourceValue ?? numerators[0].value);
    if (!denominator.isFinite() || !numerator.isFinite() || denominator.lte(0) || numerator.lt(0)) return null;
    const ratio = numerator.div(denominator);
    return { numerator, denominator, ratio, sourceValue: ratio.toFixed(18) };
  } catch {
    return null;
  }
}
