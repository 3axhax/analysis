import { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import { PdfNameIndex } from './pdf-name-index';

const point = (id: number, name: string, translationRu: string, translationEn: string, parsingWords: string): AnalysisPointWithTranslation => ({ id, name, translationRu, translationEn, parsingWords, parsingOrder: 0, units: [] });
const total = point(53, 'ca', 'Кальций (Ca)', 'Calcium', 'Ca_Кальций');
const ionized = point(999, 'ionized_calcium', 'Кальций ионизированный', 'Ionized calcium', 'Кальций ионизированный_Ионизированный кальций_Ca ионизированный_Ionized calcium_Ionised calcium');
describe('PDF calcium fraction selection', () => {
  it.each(['Кальций ионизированный', 'Ионизированный кальций', 'CA ионизированный', 'Ionized calcium', 'Ionised calcium'])('selects ionized form for %s', (text) => {
    const result = new PdfNameIndex([total, ionized]).select(text);
    expect(result.ambiguous).toBe(false);
    expect(new Set(result.matches.map((match) => match.point.id))).toEqual(new Set([999]));
  });
  it('keeps ordinary calcium as total', () => {
    expect(new PdfNameIndex([total, ionized]).select('Кальций').matches[0]?.point.id).toBe(53);
  });
  it('never guesses total calcium from ionized modifiers without a specific match', () => {
    expect(new PdfNameIndex([total]).select('Кальций ионизированный').unsupported).toBe(true);
    expect(new PdfNameIndex([total, ionized]).select('Ca+').unsupported).toBe(true);
  });
});
