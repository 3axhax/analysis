import { Sequelize } from 'sequelize-typescript';
import { IntervalAdminService, IntervalWrite } from './interval-admin.service';

const input: IntervalWrite = {
  id: 1,
  pointId: 2,
  ageId: 3,
  genderId: 4,
  unitId: 5,
  sourceId: null,
  minValue: '1',
  maxValue: '2',
  minValueEqual: true,
  maxValueEqual: false,
  status: null,
};
function setup(responses: unknown[]) {
  const query = jest
    .fn()
    .mockImplementation(() => Promise.resolve(responses.shift()));
  const db = {
    query,
    transaction: (fn: (transaction: object) => unknown) => fn({}),
  };
  return {
    service: new IntervalAdminService(db as unknown as Sequelize),
    query,
  };
}
describe('interval administration', () => {
  it('rejects empty intervals and invalid statuses before writing', async () => {
    const { service, query } = setup([]);
    await expect(
      service.save({ ...input, minValue: '2' }, true),
    ).rejects.toThrow('invalid_interval');
    await expect(
      service.save({ ...input, status: 'OTHER' as never }, true),
    ).rejects.toThrow('invalid_interval');
    expect(query).not.toHaveBeenCalled();
  });
  it('validates allowed units before inserting', async () => {
    const { service, query } = setup([[]]);
    await expect(service.save(input, true)).rejects.toThrow('unit_not_allowed');
    expect(query).toHaveBeenCalledTimes(1);
  });
  it('rejects a source outside its stated age scope before writing', async () => {
    const { service, query } = setup([[{ ageIds: [9] }]]);
    await expect(
      service.save({ ...input, sourceId: 10 }, true),
    ).rejects.toThrow('source_age_not_allowed');
    expect(query).toHaveBeenCalledTimes(1);
  });
  it('rejects conflicting reference ranges for overlapping ages', async () => {
    const { service, query } = setup([[{ id: 1 }], [], [{ id: 9 }]]);
    await expect(service.save({ ...input, status: 'NORMAL' }, true))
      .rejects.toThrow('conflicting_age_references');
    expect(query).toHaveBeenCalledTimes(3);
  });
  it('rejects a source group where a document is required', async () => {
    const { service, query } = setup([[]]);
    await expect(
      service.save({ ...input, sourceId: 10 }, true),
    ).rejects.toThrow('source_document_required');
    expect(query).toHaveBeenCalledTimes(1);
  });
  it('creates a status-free interval with parameterized values', async () => {
    const { service, query } = setup([[{ id: 1 }], [[{ id: 7 }], {}]]);
    expect(await service.save(input, true)).toEqual({ id: 7 });
    expect(query).toHaveBeenCalledTimes(2);
  });
  it('normalizes decimal commas before writing an interval', async () => {
    const { service, query } = setup([[{ id: 1 }], [[{ id: 7 }], {}]]);
    await service.save({ ...input, minValue: '1,5' }, true);
    expect(query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        replacements: { ...input, minValue: '1.5', maxValue: '2' },
      }),
    );
  });
  it('rejects intervals for another point before modifying links', async () => {
    const { service, query } = setup([[{ pointId: 2 }], [{ id: 1 }]]);
    await expect(service.setConditionIntervals(4, [1, 2])).rejects.toThrow(
      'interval_point_mismatch',
    );
    expect(query).toHaveBeenCalledTimes(2);
  });
  it('rejects duplicate links before modifying data', async () => {
    const { service, query } = setup([]);
    await expect(service.setConditionIntervals(4, [1, 1])).rejects.toThrow(
      'invalid_condition_intervals',
    );
    expect(query).not.toHaveBeenCalled();
  });
  it('does not delete an interval used by a condition', async () => {
    const { service, query } = setup([[{ id: 1 }], [{ present: true }]]);
    await expect(service.remove(1)).rejects.toThrow('interval_in_use');
    expect(query).toHaveBeenCalledTimes(2);
  });
  it('validates every condition before creating a description', async () => {
    const { service, query } = setup([[{ id: 1 }], []]);
    await expect(
      service.saveDescription({
        sourceId: null,
        description_ru: 'example',
        conditions: [
          { pointId: 2, intervalIds: [1] },
          { pointId: 3, intervalIds: [2] },
        ],
      }),
    ).rejects.toThrow('interval_point_mismatch');
    expect(query).toHaveBeenCalledTimes(2);
  });
  it('reads alternatives grouped under their condition', async () => {
    const { service } = setup([
      [{ id: 5, sourceId: null, description_ru: 'example' }],
      [
        { conditionId: 6, pointId: 2, intervalId: 1 },
        { conditionId: 6, pointId: 2, intervalId: 2 },
        { conditionId: 7, pointId: 3, intervalId: null },
      ],
    ]);
    expect(await service.getDescription(5)).toMatchObject({
      conditions: [
        { id: 6, pointId: 2, intervalIds: [1, 2] },
        { id: 7, pointId: 3, intervalIds: [] },
      ],
    });
  });
  it('creates a description with alternative intervals in one transaction', async () => {
    const { service, query } = setup([
      [{ id: 1 }, { id: 2 }],
      [{ id: 5 }],
      [{ id: 6 }],
      [],
      [],
    ]);
    expect(
      await service.saveDescription({
        sourceId: null,
        description_ru: 'example',
        conditions: [{ pointId: 2, intervalIds: [1, 2] }],
      }),
    ).toEqual({ id: 5 });
    expect(query).toHaveBeenCalledTimes(5);
    expect(query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        replacements: { conditionId: 6, intervalId: 1, pointId: 2 },
      }),
    );
    expect(query).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        replacements: { conditionId: 6, intervalId: 2, pointId: 2 },
      }),
    );
  });
});
