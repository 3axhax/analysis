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
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0018-cbc-missing-references',
      20018,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0019-cbc-reference-description-correction',
      20019,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0020-cbc-boundary-correction',
      20020,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0021-cbc-age-groups',
      20021,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0022-cbc-age-18-19',
      20022,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0023-cbc-erythrocyte-mcv-description',
      20023,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0024-bilirubin-description-correction',
      20024,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0025-cbc-reference-and-text-cleanup',
      20025,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0031-nitrogen-metabolism-correction',
      20031,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0032-liver-description-cleanup',
      20032,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(
      expect.anything(),
      '0033-liver-age-correction',
      20033,
      expect.any(String),
    );
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0034-neonatal-bilirubin-ldh', 20034, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0035-ggtp-point-consolidation', 20035, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0036-neonatal-bilirubin-ruh', 20036, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0037-liver-enzyme-combinations', 20037, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0038-de-ritis-reference', 20038, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0039-source-description-revision', 20039, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0040-source-description-typos', 20040, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0041-source-description-concision', 20041, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0042-de-ritis-gradations', 20042, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0043-description-wording', 20043, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0044-description-wording-remaining', 20044, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0045-lipid-glucose-typos', 20045, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0046-insulin-reference-unit', 20046, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0047-homa-metabolic-combinations', 20047, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0048-insulin-unit-display', 20048, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0049-lipid-insulin-description-correction', 20049, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0050-thyroid-electrolyte-typos', 20050, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0051-thyroid-electrolyte-corrections', 20051, expect.any(String));
    expect(runRecordedMigration).toHaveBeenCalledWith(expect.anything(), '0052-ionized-calcium', 20052, expect.any(String));
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
