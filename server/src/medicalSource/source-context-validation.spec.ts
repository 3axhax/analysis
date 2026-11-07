import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  GetAnalysisPointListQueryDto,
  AddNewAnalysisPointQueryDto,
} from '../analysisPoint/dto/analysisPoint.dto';
import {
  GetAnalysisResultDescriptionsListQueryDto,
  AddNewAnalysisResultDescriptionsQueryDto,
} from '../analysisResultDescription/dto/analysisResultDescriptions.dto';

describe('explicit common source context', () => {
  it.each([
    GetAnalysisPointListQueryDto,
    GetAnalysisResultDescriptionsListQueryDto,
  ])('requires an explicit null source for common lists', async (Dto) => {
    expect(
      (await validate(plainToInstance(Dto as new () => object, {}))).some(
        (e) => e.property === 'sourceId',
      ),
    ).toBe(true);
    expect(
      (
        await validate(
          plainToInstance(Dto as new () => object, { sourceId: 'null' }),
        )
      ).some((e) => e.property === 'sourceId'),
    ).toBe(false);
    expect(
      (
        await validate(
          plainToInstance(Dto as new () => object, { sourceId: '5' }),
        )
      ).some((e) => e.property === 'sourceId'),
    ).toBe(true);
  });
  it('requires an explicit null source in common mutations', async () => {
    for (const Dto of [
      AddNewAnalysisPointQueryDto,
      AddNewAnalysisResultDescriptionsQueryDto,
    ]) {
      expect(
        (await validate(plainToInstance(Dto as new () => object, {}))).some(
          (e) => e.property === 'sourceId',
        ),
      ).toBe(true);
      expect(
        (
          await validate(
            plainToInstance(Dto as new () => object, { sourceId: null }),
          )
        ).some((e) => e.property === 'sourceId'),
      ).toBe(false);
    }
  });
});
