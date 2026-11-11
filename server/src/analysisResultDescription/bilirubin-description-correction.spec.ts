import { AnalysisResultDescriptionService } from './analysisResultDescription.service';
import { StatusValue as S } from '../analysisResultDescriptionCondition/status-value.enum';

describe('bilirubin interpretation condition alternatives', () => {
  const model = (hb: S, alp: S, sourceId: number | null = null) => ({
    get: () => ({ sourceId, analysisResultDescriptionConditions: [
      { pointId: 37, status: S.HIGH }, { pointId: 39, status: S.HIGH },
      { pointId: 1, status: hb }, { pointId: 34, status: alp },
    ] }),
  });
  const variants = [model(S.NORMAL,S.NORMAL),model(S.NORMAL,S.HIGH),model(S.HIGH,S.NORMAL),model(S.HIGH,S.HIGH)];
  const repo = { findAll: jest.fn() };
  const service = new AnalysisResultDescriptionService(repo as never, {} as never, {} as never, {} as never);
  beforeEach(() => repo.findAll.mockResolvedValue([...variants,model(S.NORMAL,S.NORMAL,10)]));
  it.each([[S.NORMAL,S.NORMAL],[S.NORMAL,S.HIGH],[S.HIGH,S.NORMAL],[S.HIGH,S.HIGH]])('matches one common variant for hemoglobin %s and ALP %s', async (hb,alp) => {
    expect(await service.getDescriptionsByConditions({37:S.HIGH,39:S.HIGH,1:hb,34:alp})).toHaveLength(1);
  });
  it.each([
    [{37:S.NORMAL,39:S.HIGH,1:S.NORMAL,34:S.NORMAL}],
    [{37:S.HIGH,39:S.NORMAL,1:S.NORMAL,34:S.NORMAL}],
    [{37:S.HIGH,39:S.HIGH,1:S.LOW,34:S.NORMAL}],
    [{37:S.HIGH,39:S.HIGH,1:S.NORMAL,34:S.LOW}],
    [{39:S.HIGH,1:S.NORMAL,34:S.NORMAL}],
    [{37:S.HIGH,1:S.NORMAL,34:S.NORMAL}],
    [{37:S.HIGH,39:S.HIGH,34:S.NORMAL}],
    [{37:S.HIGH,39:S.HIGH,1:S.NORMAL}],
  ])('rejects missing or contradictory statuses', async (condition) => {
    expect(await service.getDescriptionsByConditions(condition)).toHaveLength(0);
  });
  it('isolates source-specific descriptions', async () => {
    repo.findAll.mockResolvedValue(variants);
    expect(await service.getDescriptionsByConditions({37:S.HIGH,39:S.HIGH,1:S.NORMAL,34:S.NORMAL},10)).toHaveLength(0);
  });
});
