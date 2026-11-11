import type Decimal from 'decimal.js';

export const DE_RITIS_RULES = {
  gte_2: { operator: 'gte', threshold: '2', label: '≥ 2' },
  gte_1_7: { operator: 'gte', threshold: '1.7', label: '≥ 1,7' },
  // Stable database key; the corrected threshold is 1.7.
  eq_1_5: { operator: 'eq', threshold: '1.7', label: '= 1,7' },
  eq_1: { operator: 'eq', threshold: '1', label: '= 1' },
  lt_1: { operator: 'lt', threshold: '1', label: '< 1' },
  lt_1_5: { operator: 'lt', threshold: '1.5', label: '< 1,5' },
} as const;

export type DeRitisRuleKey = keyof typeof DE_RITIS_RULES;
export interface DeRitisRuleContext {
  pointId: number;
  numerator: Decimal;
  denominator: Decimal;
  status: import('../analysisResultDescriptionCondition/status-value.enum').StatusValue | null;
}

export function isDeRitisRuleKey(value: string): value is DeRitisRuleKey {
  return Object.prototype.hasOwnProperty.call(DE_RITIS_RULES, value);
}

export function matchesDeRitisRule(key: string, ratio: Pick<DeRitisRuleContext, 'numerator' | 'denominator'>): boolean {
  if (!isDeRitisRuleKey(key) || !ratio.numerator.isFinite() || !ratio.denominator.isFinite() || ratio.numerator.lt(0) || ratio.denominator.lte(0)) return false;
  const rule = DE_RITIS_RULES[key];
  const comparison = ratio.numerator.comparedTo(ratio.denominator.times(rule.threshold));
  return rule.operator === 'gte' ? comparison >= 0 : rule.operator === 'lt' ? comparison < 0 : comparison === 0;
}
