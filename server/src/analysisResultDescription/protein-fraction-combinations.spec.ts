import { AnalysisResultDescriptionService } from './analysisResultDescription.service';
import { StatusValue as S } from '../analysisResultDescriptionCondition/status-value.enum';

describe('protein fraction pattern descriptions', () => {
  const repo = { findAll: jest.fn() };
  const service = new AnalysisResultDescriptionService(repo as never, {} as never, {} as never, {} as never);
  const patterns: Array<Record<number, S>> = [
    {4:S.LOW,5:S.HIGH,58:S.HIGH},
    {4:S.LOW,58:S.HIGH,61:S.HIGH},
    {4:S.LOW,59:S.HIGH,61:S.HIGH},
    {4:S.LOW,58:S.HIGH,59:S.HIGH,61:S.LOW},
    {4:S.LOW,5:S.HIGH,58:S.HIGH,59:S.HIGH,61:S.HIGH},
  ];
  it.each(patterns)('requires every indicated status', async (pattern) => {
    const conditions=Object.entries(pattern).map(([pointId,status])=>({pointId:Number(pointId),status}));
    repo.findAll.mockResolvedValue([{get:()=>({sourceId:null,analysisResultDescriptionConditions:conditions})}]);
    expect(await service.getDescriptionsByConditions(pattern)).toHaveLength(1);
    for (const key of Object.keys(pattern)) {
      const missing={...pattern}; delete missing[Number(key)];
      expect(await service.getDescriptionsByConditions(missing)).toHaveLength(0);
      const wrong={...pattern,[key]:S.NORMAL};
      expect(await service.getDescriptionsByConditions(wrong)).toHaveLength(0);
    }
  });
});
