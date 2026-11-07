import { AnalysisResultDescriptionService } from './analysisResultDescription.service';
import { AnalysisResultDescriptionCondition } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.model';

describe('common description source isolation', () => {
  const repo = { findAndCountAll: jest.fn(), findOne: jest.fn() };
  const service = new AnalysisResultDescriptionService(repo as never, {} as never, {} as never, {} as never);
  beforeEach(() => { jest.resetAllMocks(); repo.findAndCountAll.mockResolvedValue({ count: 0, rows: [] }); });
  afterEach(() => jest.restoreAllMocks());
  it('limits list to sourceId null', async () => {
    await service.getAnalysisResultDescriptionsByQuery({ sourceId: null, currentPage: 1, recordPerPage: 20, filters: {} });
    expect(repo.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({ where: { sourceId: null } }));
  });
  it('rejects invalid point filter before querying', async () => {
    await expect(service.getAnalysisResultDescriptionsByQuery({ sourceId: null, currentPage: 1, recordPerPage: 20, filters: { analysisPoint: '1 OR 1=1' } as never })).rejects.toThrow();
    expect(repo.findAndCountAll).not.toHaveBeenCalled();
  });
  it('uses point ids rather than SQL interpolation', async () => {
    const query = jest.spyOn(AnalysisResultDescriptionCondition, 'findAll').mockResolvedValue([{ descriptionId: 7 }] as never);
    await service.getAnalysisResultDescriptionsByQuery({ sourceId: null, currentPage: 1, recordPerPage: 20, filters: { analysisPoint: 4 } });
    expect(query).toHaveBeenCalledWith(expect.objectContaining({ where: { pointId: 4 } }));
    expect(repo.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ sourceId: null }) }));
  });
  it('does not edit an existing description from another source', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.editAnalysisResultDescriptions({ id: 8, sourceId: null, description_ru: 'synthetic', analysisResultDescriptionConditions: [] })).rejects.toThrow();
    expect(repo.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 8, sourceId: null } }));
  });
});
