import { MedicalSourceAdminService } from './medical-source-admin.service';
import { MedicalSource } from './medical-source.model';
import { AnalysisPointMinValue } from '../analysisPointMinValue/analysisPointMinValue.model';
import { AnalysisPointMaxValue } from '../analysisPointMaxValue/analysisPointMaxValue.model';
import { AnalysisPoint } from '../analysisPoint/analysisPoint.model';
import { SourceReferenceInheritance } from './source-reference-inheritance.model';

describe('MedicalSourceAdminService', () => {
  const service = new MedicalSourceAdminService();
  const sources = [
    { id: 1, parentId: null, name: 'Group' },
    { id: 2, parentId: 1, name: 'Document' },
    { id: 3, parentId: 1, name: 'Subgroup' },
    { id: 4, parentId: 3, name: 'Nested document' },
    { id: 5, parentId: null, name: 'Other group' },
  ];
  beforeEach(() =>
    jest.spyOn(MedicalSource, 'findAll').mockResolvedValue(sources as never),
  );
  afterEach(() => jest.restoreAllMocks());

  it('selects only documents belonging to the requested root group', async () => {
    await expect(service.documentIdsForGroup(1)).resolves.toEqual([2, 4]);
    await expect(service.documentIdsForGroup(3)).rejects.toThrow();
    await expect(service.assertDocument(3)).rejects.toThrow();
    await expect(service.assertDocument(2)).resolves.toBeUndefined();
  });

  it('separates document bounds, inheritable common bounds and existing links', async () => {
    jest
      .spyOn(AnalysisPointMinValue, 'findAll')
      .mockImplementation(
        async (options: any) =>
          (options.where.sourceId === null
            ? [{ pointId: 2 }, { pointId: 3 }]
            : [{ pointId: 1 }]) as never,
      );
    jest.spyOn(AnalysisPointMaxValue, 'findAll').mockResolvedValue([] as never);
    jest
      .spyOn(SourceReferenceInheritance, 'findAll')
      .mockResolvedValue([{ pointId: 2 }] as never);
    jest.spyOn(AnalysisPoint, 'findAll').mockResolvedValue([
      { id: 1, name: 'a', translationRu: 'A' },
      { id: 2, name: 'b', translationRu: 'B' },
      { id: 3, name: 'c', translationRu: 'C' },
    ] as never);
    await expect(service.pointOptions(2)).resolves.toEqual([
      {
        id: 1,
        name: 'a',
        translationRu: 'A',
        own: true,
        inheritable: false,
        inherited: false,
      },
      {
        id: 2,
        name: 'b',
        translationRu: 'B',
        own: false,
        inheritable: true,
        inherited: true,
      },
      {
        id: 3,
        name: 'c',
        translationRu: 'C',
        own: false,
        inheritable: true,
        inherited: false,
      },
    ]);
  });
});
