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
  const previous = process.env.INTERVAL_MODEL_ENABLED;
  afterEach(() => {
    jest.clearAllMocks();
    if (previous === undefined) delete process.env.INTERVAL_MODEL_ENABLED;
    else process.env.INTERVAL_MODEL_ENABLED = previous;
  });
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
  it('does not run interval migrations by default', async () => {
    delete process.env.INTERVAL_MODEL_ENABLED;
    await service().onModuleInit();
    expect(prepareIntervalTransition).not.toHaveBeenCalled();
    expect(finishIntervalTransition).not.toHaveBeenCalled();
  });
  it('runs the two recorded migrations in order when explicitly enabled', async () => {
    process.env.INTERVAL_MODEL_ENABLED = 'true';
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
