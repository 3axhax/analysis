import Decimal from 'decimal.js';
import { RatioInput } from './de-ritis';

const D = Decimal.clone({ precision: 80 });

// HOMA-IR: glucose in mmol/L × insulin in µIU/mL / 22.5.
export function calculateHoma(points: RatioInput[], glucoseUnit: number, insulinMilliUnit: number, insulinMicroUnit: number) {
  const glucose = points.filter((point) => point.pointId === 44);
  const insulin = points.filter((point) => point.pointId === 45);
  if (glucose.length !== 1 || insulin.length !== 1 || (glucose[0].sourceUnitId ?? glucose[0].unitId) !== glucoseUnit) return null;
  const insulinUnit = insulin[0].sourceUnitId ?? insulin[0].unitId;
  if (insulinUnit !== insulinMilliUnit && insulinUnit !== insulinMicroUnit) return null;
  try {
    const g = new D(glucose[0].sourceValue ?? glucose[0].value);
    const i = new D(insulin[0].sourceValue ?? insulin[0].value);
    if (!g.isFinite() || !i.isFinite() || g.lt(0) || i.lt(0)) return null;
    const numerator = g.times(i).times(insulinUnit === insulinMicroUnit ? '0.001' : '1');
    const denominator = new D('22.5');
    const ratio = numerator.div(denominator);
    return { numerator, denominator, ratio, sourceValue: ratio.toFixed(18) };
  } catch { return null; }
}
