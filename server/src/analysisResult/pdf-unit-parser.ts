export interface PdfUnitEvidence {
  unitId: number | null;
  unit: string | null;
  unitText?: string | null;
  observed?: string;
  warning?: string;
}

// Only spelling variants or numerically identical quantities; never convert a value.
const aliases: Record<string, string[]> = {
  '%': ['%'],
  'g/l': ['g/l', 'г/л'],
  'g/dl': ['g/dl', 'г/дл'],
  '10^12/l': ['10^12/l', '10^12/л', 'млн/мкл', '10^6/мкл', '10^6/ul'],
  '10^9/l': ['10^9/l', '10^9/л', 'тыс/мкл', '10^3/мкл', '10^3/ul'],
  fl: ['fl', 'фл'],
  pg: ['pg', 'пг'],
  'mm/hour': ['mm/hour', 'mm/h', 'мм/час', 'мм/ч'],
  'µmol/l': ['µmol/l', 'umol/l', 'мкмоль/л'],
  'mkg/l': ['mkg/l', 'mcg/l', 'µg/l', 'ug/l', 'мкг/л', 'нг/мл', 'ng/ml'],
  'mg/dl': ['mg/dl', 'мг/дл'],
  'mmole/l': ['mmole/l', 'mmol/l', 'ммоль/л'],
  'unit/l': ['unit/l', 'u/l', 'iu/l', 'ед/л', 'е/л', 'ме/л'],
  'mkUnit/l': ['mkunit/l', 'µu/l', 'uiu/l', 'мкед/л', 'мкме/л'],
  'ng/ml': ['ng/ml', 'нг/мл', 'µg/l', 'мкг/л'],
  'mUnit/l': ['munit/l', 'mu/l', 'miu/l', 'мед/л', 'мме/л', 'мкме/мл'],
};
const normalize = (text: string) =>
  text
    .replace(
      /10([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/gu,
      (_, power: string) =>
        '10^' + [...power].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join(''),
    )
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[μµ]/gu, 'u')
    .replace(/[хx×*]\s*(?=10)/gu, '')
    .replace(/10\s*[×*]\s*(?=\d)/gu, '10^');
const compact = (text: string) => normalize(text).replace(/\s+/gu, '');
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function prefix(text: string, spellings: string[]) {
  let end = 0;
  for (const spelling of spellings) {
    const pattern = [...compact(spelling)].map(escape).join('\\s*');
    const match = new RegExp(
      '^\\s*\\(?\\s*' + pattern + '(?![\\p{L}\\p{N}^/])\\s*\\)?',
      'u',
    ).exec(text);
    if (match && match[0].length > end) end = match[0].length;
  }
  return end;
}

export function recognizePdfUnit(
  text: string,
  allowed: { id: number; name: string }[] = [],
): PdfUnitEvidence {
  const input = normalize(text.slice(0, 200))
    .replace(/^[\s*↑↓]+/u, '')
    .slice(0, 160);
  const known = Object.entries(aliases).flatMap(([key, spellings]) => {
    const end = prefix(input, spellings);
    return end ? [{ key, end }] : [];
  });
  // Some DB spellings are physically equivalent; one textual unit can match both.
  const longest = Math.max(0, ...known.map((m) => m.end));
  const matches = known.filter((m) => m.end === longest);
  if (!matches.length)
    return {
      unitId: null,
      unit: null,
      warning: allowed.length ? 'unit_not_found' : undefined,
    };
  const rest = input.slice(longest);
  if (Object.values(aliases).some((spellings) => prefix(rest, spellings)))
    return {
      unitId: null,
      unit: null,
      observed: matches[0].key,
      warning: 'ambiguous_unit',
    };
  const keys = new Set(matches.map((m) => m.key));
  const candidates = allowed.filter((unit) =>
    [...keys].some(
      (key) =>
        compact(key) === compact(unit.name) ||
        aliases[key].some((a) => compact(a) === compact(unit.name)),
    ),
  );
  const unique = [
    ...new Map(candidates.map((unit) => [unit.id, unit])).values(),
  ];
  if (unique.length !== 1)
    return {
      unitId: null,
      unit: null,
      observed: matches[0].key,
      warning: unique.length
        ? 'ambiguous_unit'
        : allowed.length
          ? 'unit_not_allowed'
          : undefined,
    };
  return {
    unitId: unique[0].id,
    unit: unique[0].name,
    observed: matches[0].key,
  };
}
