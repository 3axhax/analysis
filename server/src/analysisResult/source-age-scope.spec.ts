import { sourceAppliesToAges } from './source-age-scope';

describe('source age scope', () => {
  it('allows sources with no scope restriction', () => {
    expect(sourceAppliesToAges(null, [1])).toBe(true);
  });
  it('accepts a source if at least one of the matching age groups is in its scope', () => {
    expect(sourceAppliesToAges([2, 3], [1, 2])).toBe(true);
    expect(sourceAppliesToAges([2, 3], [1, 4])).toBe(false);
    expect(sourceAppliesToAges([2, 3], [])).toBe(false);
  });
});
