import { AnalysisResultDescriptionService } from './analysisResultDescription.service';
import { StatusValue as S } from '../analysisResultDescriptionCondition/status-value.enum';

describe('de Ritis description administration', () => {
  const condition = { pointId: 99, status: S.HIGH };
  const row = { id: 5, deRitisRule: 'gte_2', analysisResultDescriptionConditions: [condition], update: jest.fn() };
  const repo = { findOne: jest.fn() };
  const conditionService = { deleteConditionByDescriptionId: jest.fn(), addCondition: jest.fn() };
  const service = new AnalysisResultDescriptionService(repo as never, {} as never, {} as never, conditionService as never);
  beforeEach(() => { jest.clearAllMocks(); repo.findOne.mockResolvedValue(row); row.update.mockResolvedValue(row); });
  it('allows editing text while preserving the numeric rule and condition', async () => {
    await service.editAnalysisResultDescriptions({ id: 5, sourceId: null, description_ru: 'Новое описание', analysisResultDescriptionConditions: [{ analysisPoint: { id: 99 }, status: S.HIGH }] as never });
    expect(row.update).toHaveBeenCalledWith({ description_ru: 'Новое описание' });
    expect(conditionService.deleteConditionByDescriptionId).not.toHaveBeenCalled();
    expect(conditionService.addCondition).not.toHaveBeenCalled();
  });
  it('rejects a changed condition before modifying any data', async () => {
    await expect(service.editAnalysisResultDescriptions({ id: 5, sourceId: null, description_ru: 'Новое описание', analysisResultDescriptionConditions: [{ analysisPoint: { id: 99 }, status: S.LOW }] as never })).rejects.toThrow('de_ritis_rule_conditions_fixed');
    expect(row.update).not.toHaveBeenCalled();
    expect(conditionService.deleteConditionByDescriptionId).not.toHaveBeenCalled();
  });
});
