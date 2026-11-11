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
  const alt = points.filter((p) => p.pointId === 32);
  const ast = points.filter((p) => p.pointId === 33);
  if (alt.length !== 1 || ast.length !== 1) return null;
  if ((alt[0].sourceUnitId ?? alt[0].unitId) !== enzymeUnitId || (ast[0].sourceUnitId ?? ast[0].unitId) !== enzymeUnitId) return null;
  try {
    const denominator = new D(alt[0].sourceValue ?? alt[0].value);
    const numerator = new D(ast[0].sourceValue ?? ast[0].value);
    if (!denominator.isFinite() || !numerator.isFinite() || denominator.lte(0) || numerator.lt(0)) return null;
    const ratio = numerator.div(denominator);
    return { numerator, denominator, ratio, sourceValue: ratio.toFixed(18) };
  } catch {
    return null;
  }
}
