import { MedicalSourceCrudService } from './medical-source-crud.service';
import { MedicalSourceAdminService } from './medical-source-admin.service';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { AnalysisPointMinValue } from '../analysisPointMinValue/analysisPointMinValue.model';
import { AnalysisPointMaxValue } from '../analysisPointMaxValue/analysisPointMaxValue.model';
import { AnalysisPointsUnits } from '../analysisPoint/analysisPoint-Units.model';
import { AnalysisResultDescription } from '../analysisResultDescription/analysisResultDescription.model';
import { AnalysisResultDescriptionCondition } from '../analysisResultDescriptionCondition/analysisResultDescriptionCondition.model';
import { SourceReferenceInheritance } from './source-reference-inheritance.model';
import { Age } from '../ages/ages.model';
import { Gender } from '../gender/gender.model';
import { StatusValue } from '../analysisResultDescriptionCondition/status-value.enum';

describe('source admin CRUD', () => {
  const sources = {
    assertDocument: jest.fn().mockResolvedValue(undefined),
    documentIdsForGroup: jest.fn().mockResolvedValue([10, 11]),
  };
  const service = new MedicalSourceCrudService(
    sources as unknown as MedicalSourceAdminService,
  );
  const tx = { LOCK: { UPDATE: 'UPDATE' } };
  const transaction = jest.fn(async (cb: (t: unknown) => unknown) => cb(tx));
  const limit = {
    ageId: 1,
    genderId: 2,
    unitId: 3,
    minValue: 0,
    maxValue: null,
    lowInclusive: true,
  };
  beforeAll(() => {
    Object.defineProperty(AnalysisPoint, 'sequelize', {
      configurable: true,
      value: { transaction },
    });
    Object.defineProperty(AnalysisResultDescription, 'sequelize', {
      configurable: true,
      value: { transaction },
    });
  });
  afterEach(() => jest.restoreAllMocks());
  afterAll(() => {
    delete (AnalysisPoint as any).sequelize;
    delete (AnalysisResultDescription as any).sequelize;
  });

  it('replaces only one document and point, preserving missing and zero bounds', async () => {
    jest.spyOn(AnalysisPoint, 'findByPk').mockResolvedValue({ id: 4 } as never);
    jest.spyOn(AnalysisPointMinValue, 'count').mockResolvedValue(1);
    jest.spyOn(AnalysisPointMaxValue, 'count').mockResolvedValue(0);
    jest.spyOn(Age, 'findByPk').mockResolvedValue({ id: 1 } as never);
    jest.spyOn(Gender, 'findByPk').mockResolvedValue({ id: 2 } as never);
    jest.spyOn(AnalysisPointsUnits, 'findOne').mockResolvedValue({} as never);
    const minDestroy = jest
      .spyOn(AnalysisPointMinValue, 'destroy')
      .mockResolvedValue(1);
    const maxDestroy = jest
      .spyOn(AnalysisPointMaxValue, 'destroy')
      .mockResolvedValue(0);
    const minCreate = jest
      .spyOn(AnalysisPointMinValue, 'create')
      .mockResolvedValue({} as never);
    const maxCreate = jest
      .spyOn(AnalysisPointMaxValue, 'create')
      .mockResolvedValue({} as never);
    await service.savePoint({
      sourceId: 10,
      originalSourceId: 10,
      groupId: 1,
      pointId: 4,
      limits: [limit],
      create: false,
    });
    expect(minDestroy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sourceId: 10, pointId: 4 } }),
    );
    expect(maxDestroy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sourceId: 10, pointId: 4 } }),
    );
    expect(minCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceId: 10,
        pointId: 4,
        value: 0,
        lowInclusive: true,
      }),
      expect.anything(),
    );
    expect(maxCreate).not.toHaveBeenCalled();
  });

  it('rejects cross-group documents, reversed or duplicated limits before changing records', async () => {
    await expect(
      service.savePoint({
        sourceId: 12,
        originalSourceId: 12,
        groupId: 1,
        pointId: 4,
        limits: [limit],
        create: false,
      }),
    ).rejects.toThrow();
    await expect(
      service.savePoint({
        sourceId: 10,
        originalSourceId: 10,
        groupId: 1,
        pointId: 4,
        limits: [{ ...limit, minValue: 5, maxValue: 4 }],
        create: false,
      }),
    ).rejects.toThrow();
    await expect(
      service.savePoint({
        sourceId: 10,
        originalSourceId: 10,
        groupId: 1,
        pointId: 4,
        limits: [limit, limit],
        create: false,
      }),
    ).rejects.toThrow();
  });

  it('creates an inheritance link without removing other links', async () => {
    jest.spyOn(AnalysisPointMinValue, 'count').mockResolvedValue(1);
    jest.spyOn(AnalysisPointMaxValue, 'count').mockResolvedValue(0);
    jest
      .spyOn(AnalysisResultDescription, 'create')
      .mockResolvedValue({ id: 30 } as never);
    const inherit = jest
      .spyOn(SourceReferenceInheritance, 'findOrCreate')
      .mockResolvedValue([{} as never, true]);
    const add = jest
      .spyOn(AnalysisResultDescriptionCondition, 'create')
      .mockResolvedValue({} as never);
    await service.saveDescription({
      sourceId: 10,
      groupId: 1,
      description: 'synthetic',
      conditions: [{ pointId: 4, status: StatusValue.LOW, mode: 'inherited' }],
    });
    expect(inherit).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sourceId: 10, pointId: 4 } }),
    );
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({
        descriptionId: 30,
        pointId: 4,
        status: StatusValue.LOW,
      }),
      expect.anything(),
    );
  });
  it('shows both an own reference and an existing inheritance link', async () => {
    jest.spyOn(AnalysisResultDescription, 'findAll').mockResolvedValue([
      { get: () => ({ id: 20, sourceId: 10, description_ru: 'synthetic', analysisResultDescriptionConditions: [{ pointId: 4, status: StatusValue.LOW, analysisPoint: { name: 'point', translationRu: 'Point' } }] }) },
    ] as never);
    jest.spyOn(SourceReferenceInheritance, 'findAll').mockResolvedValue([{ sourceId: 10, pointId: 4 }] as never);
    jest.spyOn(AnalysisPointMinValue, 'findAll').mockResolvedValue([{ sourceId: 10, pointId: 4 }] as never);
    jest.spyOn(AnalysisPointMaxValue, 'findAll').mockResolvedValue([] as never);
    await expect(service.listDescriptions(1)).resolves.toEqual([expect.objectContaining({ conditions: [expect.objectContaining({ pointId: 4, mode: 'both' })] })]);
  });

});
