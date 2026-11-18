import { MigrationsService } from '../migrations/migrations.service';
import {
  prepareIntervalTransition,
  finishIntervalTransition,
} from '../migrations/interval-transition';

jest.mock('../migrations/run-recorded-migration', () => ({
  runRecordedMigration: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../migrations/interval-transition', () => ({
  prepareIntervalTransition: jest.fn().mockResolvedValue(undefined),
  finishIntervalTransition: jest.fn().mockResolvedValue(undefined),
}));

describe('interval startup migrations', () => {
  afterEach(() => jest.clearAllMocks());
  function service() {
    const db = {
      query: jest.fn().mockResolvedValue(undefined),
      addModels: jest.fn(),
    };
    const point = {
      addTranslationRuENParsingColumn: jest.fn(),
      addPointHintRuENColumn: jest.fn(),
      addParsingOrderColumn: jest.fn(),
    };
    const ages = { addIntervalsColumn: jest.fn() };
    const result = {
      addAgeInDaysColumn: jest.fn(),
      allowSourceOnlyMeasurements: jest.fn(),
    };
    const units = {
      addUnitNormalization: jest.fn(),
      addFerritinSourceUnit: jest.fn(),
    };
    return new MigrationsService(
      db as never,
      point as never,
      ages as never,
      result as never,
      units as never,
    );
  }
  it('runs the interval migrations in order without a feature flag', async () => {
    await service().onModuleInit();
    expect(prepareIntervalTransition).toHaveBeenCalledTimes(1);
    expect(finishIntervalTransition).toHaveBeenCalledTimes(1);
    expect(
      jest.mocked(prepareIntervalTransition).mock.invocationCallOrder[0],
    ).toBeLessThan(
      jest.mocked(finishIntervalTransition).mock.invocationCallOrder[0],
    );
  });
});
