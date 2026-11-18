import { MedicalSourceAdminService } from './medical-source-admin.service';
import { MedicalSource } from './medical-source.model';

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

});
