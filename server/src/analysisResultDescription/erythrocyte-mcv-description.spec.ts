import { AnalysisResultDescriptionService } from './analysisResultDescription.service';
import { StatusValue as S } from '../analysisResultDescriptionCondition/status-value.enum';

describe('erythrocyte and MCV interpretation', () => {
  const repo = { findAll: jest.fn() };
  const service = new AnalysisResultDescriptionService(repo as never, {} as never, {} as never, {} as never);
  const description = (sourceId: number | null) => ({ get: () => ({ sourceId, analysisResultDescriptionConditions: [{ pointId: 2, status: S.LOW }, { pointId: 8, status: S.HIGH }] }) });
  beforeEach(() => repo.findAll.mockResolvedValue([description(null), description(12)]));
  it('matches both statuses only for the common source', async () => {
    expect(await service.getDescriptionsByConditions({ 2: S.LOW, 8: S.HIGH })).toEqual([expect.objectContaining({ get: expect.any(Function) })]);
  });
  it.each([
    [{ 2:S.NORMAL, 8:S.HIGH }], [{ 2:S.LOW, 8:S.NORMAL }], [{ 2:S.LOW }], [{ 8:S.HIGH }], [{}],
  ])('does not match missing or contradictory conditions', async (statuses) => {
    expect(await service.getDescriptionsByConditions(statuses)).toHaveLength(0);
  });
  it('does not use common rule for another source', async () => {
    repo.findAll.mockResolvedValue([description(null)]);
    expect(await service.getDescriptionsByConditions({ 2:S.LOW, 8:S.HIGH }, 12)).toHaveLength(0);
  });
});
