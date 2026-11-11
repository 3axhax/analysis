const labels: Record<string, string> = {
  gte_2: '≥ 2',
  gte_1_7: '≥ 1,7',
  eq_1_5: '= 1,7', // Legacy database key; the threshold was corrected.
  eq_1: '= 1',
  lt_1: '< 1',
  lt_1_5: '< 1,5',
};

export const deRitisRuleLabel = (rule: string): string => labels[rule] ?? '';
