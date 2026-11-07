import { sourceAppliesToAge } from './source-age-scope';

describe('source age scope', () => {
  it('leaves existing unrestricted sources unchanged', () => {
    expect(sourceAppliesToAge({}, 1)).toBe(true);
  });
  it('accepts only the explicitly permitted age groups', () => {
    expect(sourceAppliesToAge({ allowedAgeIds: [2] }, 2)).toBe(true);
    expect(sourceAppliesToAge({ allowedAgeIds: [2] }, 1)).toBe(false);
    expect(sourceAppliesToAge({ allowedAgeIds: '2' }, 2)).toBe(false);
  });
});
