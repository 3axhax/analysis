import { MigrationsService } from './migrations.service';
import { runRecordedMigration } from './run-recorded-migration';
jest.mock('./run-recorded-migration', () => ({
  runRecordedMigration: jest.fn().mockResolvedValue(undefined),
}));

describe('startup migration ordering', () => {
  it('runs dependent unit/result migrations after the existing batch in order', async () => {
    const calls: string[] = [];
    const action = (name: string) =>
      jest.fn(async () => {
        await Promise.resolve();
        calls.push(name);
      });
    const args = [
      { query: action('journal'), addModels: jest.fn() },
      {
        addTranslationRuENParsingColumn: action('point-columns'),
        addPointHintRuENColumn: action('point-hints'),
        addParsingOrderColumn: action('point-order'),
      },
      { addIntervalsColumn: action('age') },
      {
        addAgeInDaysColumn: action('result-age'),
        allowSourceOnlyMeasurements: action('0006'),
      },
      {
        addUnitNormalization: action('0002'),
        addFerritinSourceUnit: action('0003'),
      },
    ] as unknown as ConstructorParameters<typeof MigrationsService>;
    await new MigrationsService(...args).onModuleInit();
    expect(calls.slice(-3)).toEqual(['0002', '0003', '0006']);
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0010-medical-sources',
      20010,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0011-medical-source-parent-id',
      20011,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0012-soppi-iron-source',
      20012,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0013-nutritional-iron-source',
      20013,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0014-iron-source-thresholds',
      20014,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0016-method45-reference-units',
      20016,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0017-method45-reference-correction',
      20017,
      expect.any(String),
    );
    expect(calls.indexOf('point-order')).toBeLessThan(calls.indexOf('0002'));
    expect(calls.indexOf('result-age')).toBeLessThan(calls.indexOf('0002'));
  });
  it('does not execute later dependencies when an earlier migration fails', async () => {
    const fail = jest.fn().mockRejectedValue(Error('migration failed'));
    const later = jest.fn();
    const ok = async () => {};
    const args = [
      { query: ok },
      {
        addTranslationRuENParsingColumn: ok,
        addPointHintRuENColumn: ok,
        addParsingOrderColumn: ok,
      },
      { addIntervalsColumn: ok },
      { addAgeInDaysColumn: ok, allowSourceOnlyMeasurements: later },
      { addUnitNormalization: fail, addFerritinSourceUnit: later },
    ] as unknown as ConstructorParameters<typeof MigrationsService>;
    await expect(new MigrationsService(...args).onModuleInit()).rejects.toThrow(
      'migration failed',
    );
    expect(later).not.toHaveBeenCalled();
  });
});
