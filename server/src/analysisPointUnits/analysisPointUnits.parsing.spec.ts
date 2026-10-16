import { AnalysisPointUnitsService } from './analysisPointUnits.service';
describe('unit parsing definition validation', () => {
  const setup = () => {
    const update = jest.fn().mockResolvedValue({});
    const units = [
      { id: 1, name: 'g/l', code: 'g/L', translationParsing: 'г/л', update },
      { id: 2, name: 'g/dl', code: 'g/dL', translationParsing: 'г/дл' },
    ];
    const repository = {
      findAll: jest.fn().mockResolvedValue(units),
      findByPk: jest.fn().mockResolvedValue(units[0]),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    };
    const service = new AnalysisPointUnitsService(
      repository as never,
      {
        editTranslationByParameters: jest
          .fn()
          .mockResolvedValue({ value: 'synthetic' }),
      } as never,
    );
    return { service, repository, update };
  };
  it('rejects colliding spellings before writes', async () => {
    const s = setup();
    await expect(
      s.service.addNewAnalysisPointUnits({
        name: 'different',
        translationParsing: 'г/л',
        translationRu: '',
        translationEn: '',
      }),
    ).rejects.toThrow('conflicting_or_invalid_unit_parsing');
    expect(s.repository.create).not.toHaveBeenCalled();
  });
  it('rejects empty/duplicate aliases and overlong definitions', async () => {
    for (const translationParsing of ['a__b', 'a_a', 'a'.repeat(4097)]) {
      const s = setup();
      await expect(
        s.service.addNewAnalysisPointUnits({
          name: 'different',
          translationParsing,
          translationRu: '',
          translationEn: '',
        }),
      ).rejects.toThrow();
      expect(s.repository.create).not.toHaveBeenCalled();
    }
  });
  it('preserves omitted parsing fields and does not mass-assign quantity or other fields', async () => {
    const s = setup();
    await s.service.editAnalysisPointUnits({
      id: 1,
      name: 'g/l',
      translationRu: '',
      translationEn: '',
      quantityKind: 'tampered',
    } as never);
    expect(s.update).toHaveBeenCalledWith({
      name: 'g/l',
      code: 'g/L',
      translationParsing: 'г/л',
    });
  });
});
