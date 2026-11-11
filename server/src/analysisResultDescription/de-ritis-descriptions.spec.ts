import Decimal from 'decimal.js';
import { AnalysisResultDescriptionService } from './analysisResultDescription.service';
import { StatusValue as S } from '../analysisResultDescriptionCondition/status-value.enum';

const D = Decimal.clone({ precision: 80 });
const keys = ['gte_2', 'gte_1_7', 'eq_1_5', 'eq_1', 'lt_1', 'lt_1_5'];
function makeDescription(key: string | null, sourceId: number | null = null) {
  const value = { id: key, sourceId, deRitisRule: key, analysisResultDescriptionConditions: [{ id: 1, pointId: 99, status: S.HIGH, analysisPoint: { id: 99, name: 'de_ritis_ratio' } }] };
  return { get: () => structuredClone(value) };
}
function setup() {
  const rows = [...keys.map((key) => makeDescription(key)), makeDescription('unknown'), makeDescription(null), makeDescription(null, 3)];
  const repository = { findAll: jest.fn().mockResolvedValue(rows) };
  return new AnalysisResultDescriptionService(repository as never, {} as never, {} as never, {} as never);
}
function context(numerator: string, status: S | null = S.NORMAL) {
  return { pointId: 99, numerator: new D(numerator), denominator: new D(1), status };
}
describe('numeric de Ritis description matching', () => {
  it.each([
    ['0.9', ['lt_1', 'lt_1_5']],
    ['1', ['eq_1', 'lt_1_5']],
    ['1.5', []],
    ['1.699999', []],
    ['1.7', ['eq_1_5', 'gte_1_7']],
    ['1.700001', ['gte_1_7']],
    ['1.72', ['gte_1_7']],
    ['2', ['gte_1_7', 'gte_2']],
  ])('returns all numeric rules for %s independently of normal status', async (value, expected) => {
    const result = await setup().getDescriptionsByConditions({ 99: S.NORMAL }, null, context(value));
    expect(result.map((item) => item.deRitisRule).sort()).toEqual(expected.sort());
    for (const item of result) expect(item.analysisResultDescriptionConditions[0].status).toBe(S.NORMAL);
  });
  it('omits numeric rules when the inputs are absent', async () => {
    const result = await setup().getDescriptionsByConditions({ 99: S.HIGH });
    expect(result).toHaveLength(1);
    expect(result[0].get({ plain: true }).deRitisRule).toBeNull();
  });
  it('preserves ordinary and source-specific matching', async () => {
    const s = setup();
    expect(await s.getDescriptionsByConditions({ 99: S.HIGH }, 3, context('2', S.HIGH))).toHaveLength(1);
    const common = await s.getDescriptionsByConditions({ 99: S.HIGH }, null, context('2', S.HIGH));
    expect(common).toHaveLength(3);
  });
  it('permits numeric matching with missing reference status without inventing a status', async () => {
    const output = await setup().getDescriptionsByConditions({}, null, context('2', null));
    expect(output).toHaveLength(2);
    expect(output[0].analysisResultDescriptionConditions[0].status).toBeNull();
  });
});
