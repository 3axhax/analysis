import { AnalysisResultDescriptionService } from './analysisResultDescription.service';
import { StatusValue as S } from '../analysisResultDescriptionCondition/status-value.enum';

describe('protein fraction combinations', () => {
  const repo={findAll:jest.fn()};
  const service=new AnalysisResultDescriptionService(repo as never,{} as never,{} as never,{} as never);
  const rule=(conditions: Array<{pointId:number;status:S}>) => ({get:()=>({sourceId:null,analysisResultDescriptionConditions:conditions})});
  beforeEach(()=>repo.findAll.mockResolvedValue([
    rule([{pointId:4,status:S.HIGH}]),
    rule([{pointId:4,status:S.HIGH},{pointId:27,status:S.HIGH}]),
    rule([{pointId:60,status:S.HIGH},{pointId:40,status:S.HIGH}]),
  ]));
  it.each<Array<[Record<number,S>,number]>[number]>([
    [{4:S.HIGH},1], [{4:S.HIGH,27:S.HIGH},2], [{4:S.HIGH,27:S.NORMAL},1],
    [{60:S.HIGH,40:S.HIGH},1], [{60:S.HIGH},0], [{60:S.HIGH,40:S.NORMAL},0],
  ])('matches only satisfied conditions',async (statuses,count)=>{
    expect(await service.getDescriptionsByConditions(statuses)).toHaveLength(count);
  });
});
