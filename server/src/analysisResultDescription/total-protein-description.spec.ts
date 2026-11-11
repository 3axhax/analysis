import { AnalysisResultDescriptionService } from './analysisResultDescription.service';
import { StatusValue as S } from '../analysisResultDescriptionCondition/status-value.enum';

describe('total protein combination descriptions', () => {
  const repo = { findAll: jest.fn() };
  const service = new AnalysisResultDescriptionService(repo as never, {} as never, {} as never, {} as never);
  const make = (albumin: S, urea: S) => ({ get: () => ({ sourceId: null, analysisResultDescriptionConditions: [{ pointId: 27, status: S.LOW }, { pointId: 4, status: albumin }, { pointId: 28, status: urea }] }) });
  beforeEach(() => repo.findAll.mockResolvedValue([make(S.LOW, S.LOW), make(S.NORMAL, S.HIGH)]));
  it.each([{ 27:S.LOW, 4:S.LOW, 28:S.LOW }, { 27:S.LOW, 4:S.NORMAL, 28:S.HIGH }])('matches each documented combination', async (statuses) => {
    expect(await service.getDescriptionsByConditions(statuses)).toHaveLength(1);
  });
  it.each<Record<number, S>>([{ 27:S.LOW, 4:S.LOW }, { 27:S.LOW, 28:S.HIGH }, { 27:S.HIGH, 4:S.NORMAL, 28:S.HIGH }, { 27:S.LOW, 4:S.HIGH, 28:S.HIGH }])('does not match missing or different statuses', async (statuses) => {
    expect(await service.getDescriptionsByConditions(statuses)).toHaveLength(0);
  });
});
