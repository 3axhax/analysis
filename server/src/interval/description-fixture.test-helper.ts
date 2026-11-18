import { evaluateIntervals, IntervalDescription, SourcedInterval } from './interval-evaluator';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';

// Convert status-labelled synthetic fixtures to explicit intervals; production
// descriptions are matched exclusively by their linked interval IDs.
export class DescriptionFixtureEvaluator {
  constructor(private readonly repository: { findAll(): Promise<any[]> }, ..._unused: unknown[]) {}

  async getDescriptionsByConditions(statuses: Record<number, StatusValue>, sourceId: number | null = null) {
    const rows = await this.repository.findAll();
    const intervals: SourcedInterval[] = [];
    const descriptions: IntervalDescription[] = [];
    const selected = rows.filter((row) => (row.get().sourceId ?? null) === sourceId);
    selected.forEach((row, index) => {
      const conditions = row.get().analysisResultDescriptionConditions.map((condition: { pointId: number; status: StatusValue }) => {
        const id = intervals.length + 1;
        const value = Number(condition.status) + 2;
        intervals.push({ id, pointId: condition.pointId, ageId: 1, genderId: 1, unitId: 1, minValue: value, maxValue: value, minValueEqual: true, maxValueEqual: true, sourceId, status: null });
        return { pointId: condition.pointId, intervalIds: [id] };
      });
      descriptions.push({ id: index, sourceId, conditions });
    });
    const inputs = Object.entries(statuses).map(([pointId, status]) => ({ measurement: { pointId: Number(pointId), ageId: 1, genderId: 1, unitId: 1, value: Number(status) + 2 }, allowedUnitIds: [1], rules: [] }));
    const matched = evaluateIntervals(inputs, intervals, descriptions).descriptions;
    return matched.map((description) => selected[description.id]);
  }
}
