import { MigrationsService } from './migrations.service';

describe('startup migration ordering', () => {
  it('runs dependent unit/result migrations after the existing batch in order', async () => {
    const calls: string[] = [];
    const action = (name: string) =>
      jest.fn(async () => {
        await Promise.resolve();
        calls.push(name);
      });
    const args = [
      { query: action('journal') },
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
