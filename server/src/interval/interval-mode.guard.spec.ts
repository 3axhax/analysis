import {
  IntervalEnabledGuard,
  LegacyIntervalWriteGuard,
} from './interval-mode.guard';

describe('interval rollout gates', () => {
  const previous = process.env.INTERVAL_MODEL_ENABLED;
  afterEach(() => {
    if (previous === undefined) delete process.env.INTERVAL_MODEL_ENABLED;
    else process.env.INTERVAL_MODEL_ENABLED = previous;
  });
  it('keeps interval administration disabled and legacy writes enabled by default', () => {
    delete process.env.INTERVAL_MODEL_ENABLED;
    expect(() => new IntervalEnabledGuard().canActivate()).toThrow();
    expect(new LegacyIntervalWriteGuard().canActivate()).toBe(true);
  });
  it('enables interval administration and blocks legacy writes together', () => {
    process.env.INTERVAL_MODEL_ENABLED = 'true';
    expect(new IntervalEnabledGuard().canActivate()).toBe(true);
    expect(() => new LegacyIntervalWriteGuard().canActivate()).toThrow(
      'legacy_interval_editor_unavailable',
    );
  });
});
