import {
  projectIntervalResult,
  ProjectionDescription,
  ProjectionSource,
} from './interval-result-projection';
import { SourcedInterval } from './interval-evaluator';

const sources: ProjectionSource[] = [
  { id: 1, parentId: null, name: 'root', metadata: {} },
  { id: 2, parentId: 1, name: 'description', metadata: {} },
  { id: 3, parentId: 1, name: 'interval', metadata: {} },
];
const interval: SourcedInterval = {
  id: 9,
  sourceId: 3,
  pointId: 4,
  ageId: 5,
  genderId: 6,
  unitId: 7,
  minValue: '1',
  maxValue: null,
  minValueEqual: true,
  maxValueEqual: null,
  status: null,
};
const description: ProjectionDescription = {
  id: 10,
  sourceId: 2,
  description_ru: 'example',
  conditions: [{ pointId: 4, intervalIds: [9] }],
};
describe('interval result projection', () => {
  it('keeps matching interval provenance independent of the description source', () => {
    const result = projectIntervalResult(
      5,
      [4, 8],
      [interval],
      [description],
      sources,
    );
    expect(result.points[1].intervals).toEqual([]);
    expect(result.sourceDescriptions[0].source.id).toBe(2);
    expect(
      result.sourceDescriptions[0].descriptions[0].conditions[0].intervals[0]
        .sourceId,
    ).toBe(3);
    expect(
      result.sourceDescriptions[0].descriptions[0].conditions[0].intervals[0]
        .status,
    ).toBeNull();
  });
  it('does not collapse overlapping statuses into an arbitrary single status', () => {
    const other = { ...interval, id: 11, status: 'NORMAL' as const };
    expect(
      projectIntervalResult(5, [4], [interval, other], [], sources).points[0]
        .intervals,
    ).toHaveLength(2);
  });
  it('honours a description source age restriction', () => {
    const scoped = sources.map((source) =>
      source.id === 2
        ? { ...source, metadata: { allowedAgeIds: [99] } }
        : source,
    );
    expect(
      projectIntervalResult(5, [4], [interval], [description], scoped)
        .sourceDescriptions,
    ).toEqual([]);
  });
  it('rejects a cyclic source hierarchy', () => {
    const cyclic = [{ ...sources[0], parentId: 2 }, sources[1], sources[2]];
    expect(() =>
      projectIntervalResult(5, [4], [interval], [description], cyclic),
    ).toThrow('invalid_source_hierarchy');
  });
});
