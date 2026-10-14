import { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import { resolveCatalogForms } from './pdf-form-resolver';

// General analyte names and codes, not laboratory or document templates.
const EXTRA_NAMES: Record<string, string[]> = {
  'lymphocyte-count': [
    'LYM#',
    'LY#',
    'LY',
    'Количество лимфоцитов',
    'Лимфоциты, абс.',
  ],
  'lymphocyte-percentage': [
    'LYM%',
    'LY%',
    'Процент лимфоцитов',
    'Лимфоциты, %',
  ],
  'monocyte-count': [
    'MON#',
    'MO#',
    'MO',
    'Количество моноцитов',
    'Моноциты, абс.',
  ],
  'monocyte-percentage': ['MON%', 'MO%', 'Процент моноцитов', 'Моноциты, %'],
  'eosinophil-count': [
    'EOS#',
    'EO#',
    'EO',
    'Количество эозинофилов',
    'Эозинофилы, абс.',
  ],
  'eosinophil-percentage': [
    'EOS%',
    'EO%',
    'Процент эозинофилов',
    'Эозинофилы, %',
  ],
  'basophil-count': [
    'BAS#',
    'BA#',
    'BA',
    'Количество базофилов',
    'Базофилы, абс.',
  ],
  'basophil-percentage': ['BAS%', 'BA%', 'Процент базофилов', 'Базофилы, %'],
  mch: ['MCH', 'Среднее значение гемоглобина в клетке'],
  mchc: ['MCHC', 'Средняя концентрация клеточного гемоглобина'],
  mcv: ['MCV'],
  mpv: ['MPV'],
  rdw: ['RDW', 'RDW-CV'],
  platelets: ['PLT', 'Число тромбоцитов'],
  leukocytes: ['WBC'],
  erythrocyte: ['RBC'],
  hemoglobin: ['HGB'],
  hematocrit: ['HCT'],
  'hdl-cholesterol': ['HDL', 'Холестерин-ЛПВП', 'Холестерин ЛПВП'],
  'ldl-cholesterol': ['LDL', 'Холестерин-ЛПНП', 'Холестерин ЛПНП'],
  total_protein: ['TPROT'],
  'direct-bilirubin': ['DBIL', 'Билирубин прямой'],
  indirect_bilirubin: ['IBIL', 'Билирубин непрямой'],
  esr: ['СОЭ', 'ESR'],
  glycated_hemoglobin: ['HbA1c', 'Гликированный Hb'],
};

export interface NameToken {
  key: string;
  start: number;
  end: number;
  raw: string;
}
export interface PdfNameMatch {
  point: AnalysisPointWithTranslation;
  start: number;
  end: number;
  variant: string;
  code: boolean;
  alias: string;
}

export function nameTokens(text: string): NameToken[] {
  return [
    ...text.matchAll(/[\p{L}\p{N}]+(?:[-‐‑‒–—][\p{L}\p{N}]+)*(?:[%#])?|[%#]/gu),
  ].map((match) => ({
    key: match[0]
      .normalize('NFKC')
      .toLocaleLowerCase('ru')
      .replace(/ё/g, 'е')
      .replace(/[‐‑‒–—]/g, '-'),
    raw: match[0],
    start: match.index,
    end: match.index + match[0].length,
  }));
}

export function canonicalName(text: string): string {
  return nameTokens(text)
    .map((token) => token.key)
    .join(' ');
}

export function pointAliases(point: AnalysisPointWithTranslation): string[] {
  const labels = [point.translationRu, point.translationEn].filter(Boolean);
  return [
    ...new Set(
      [
        ...point.parsingWords.split('_'),
        ...labels,
        ...labels
          .map((name) => name.replace(/\([^)]*\)/g, ' '))
          .filter(
            (name) =>
              !/^(процентное соотношение|количество|число)\s*$/iu.test(
                name.trim(),
              ),
          ),
        ...(EXTRA_NAMES[point.name.trim()] ?? []),
      ]
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  ];
}

export class PdfNameIndex {
  private readonly points: AnalysisPointWithTranslation[];
  private readonly entries: {
    point: AnalysisPointWithTranslation;
    keys: string[];
    alias: string;
  }[];
  constructor(points: AnalysisPointWithTranslation[]) {
    this.points = points;
    this.entries = points
      .flatMap((point) =>
        pointAliases(point).map((alias) => ({
          point,
          keys: nameTokens(alias).map((t) => t.key),
          alias,
        })),
      )
      .filter((entry) => entry.keys.length > 0);
  }

  find(text: string): PdfNameMatch[] {
    const tokens = nameTokens(text);
    const matches: PdfNameMatch[] = [];
    for (const entry of this.entries) {
      const namePrefix = text.split(/\d|референ|reference|комментар/iu)[0];
      if (
        entry.point.name === 'rdw' &&
        /rdw\s*[-‐‑‒–—]?\s*sd|станд(?:артное)?\s+отклон/iu.test(namePrefix)
      )
        continue;
      for (let i = 0; i < tokens.length; i++) {
        let end = i + entry.keys.length;
        const codeTarget = /^[a-z]{2,5}[%#]?$/i.test(entry.alias);
        let found = entry.keys.every((key, j) => tokens[i + j]?.key === key);
        // Only exact reconstruction of letter fragments; never delete numeric boundaries.
        if (
          !found &&
          (entry.keys.join('').length >= 6 || codeTarget) &&
          entry.keys.every((key) => /^[\p{L}]+[%#]?$/u.test(key))
        ) {
          const target = entry.keys.join('');
          let joined = '';
          for (
            let j = i;
            j < tokens.length &&
            (codeTarget
              ? /^(?:[A-Z]+[%#]?|[%#])$/.test(tokens[j].raw)
              : /^[\p{L}]+$/u.test(tokens[j].key)) &&
            joined.length < target.length;
            j++
          ) {
            joined += tokens[j].key;
            if (joined === target) {
              found = true;
              end = j + 1;
              break;
            }
          }
        }
        if (!found || !tokens[end - 1]) continue;
        if (
          codeTarget &&
          !/[%#]$/.test(entry.keys.at(-1) ?? '') &&
          /^[%#]$/.test(tokens[end]?.key ?? '') &&
          !/\d/u.test(text.slice(tokens[end - 1].end, tokens[end].start))
        )
          continue;
        const start = tokens[i].start,
          stop = tokens[end - 1].end;
        const variant = entry.point.name === 'rdw' ? 'cv' : '';
        const code =
          /^[a-z][a-z0-9%#-]{1,5}$/i.test(entry.alias) &&
          /^[A-Z][A-Z0-9%#-]{1,5}$/.test(
            tokens
              .slice(i, end)
              .map((t) => t.raw)
              .join(''),
          );
        matches.push({
          point: entry.point,
          start,
          end: stop,
          variant,
          code,
          alias: entry.alias,
        });
      }
    }
    return matches;
  }

  select(text: string): {
    matches: PdfNameMatch[];
    ambiguous: boolean;
    unsupported?: boolean;
  } {
    const namePrefix = text.split(/\d|референ|reference|комментар/iu)[0];
    if (/rdw\s*[-‐‑‒–—]?\s*sd/iu.test(namePrefix))
      return { matches: [], ambiguous: false, unsupported: true };
    let matches = this.find(text);
    if (
      /юныенейтрофилы|палочкоядер|сегментоядер|незрел/iu.test(
        canonicalName(text).replace(/\s+/g, ''),
      )
    )
      matches = matches.filter((m) => !m.point.name.startsWith('neutrophil-'));
    // Unsupported or specific modifiers must not be collapsed into generic analytes.
    if (/не[-\s]*лпвп/iu.test(text))
      matches = matches.filter(
        (m) => !['cholesterol', 'hdl-cholesterol'].includes(m.point.name),
      );
    const forms = resolveCatalogForms(text, matches, this.points);
    if (forms.ambiguous || forms.unsupported) return forms;
    matches = forms.matches;
    const codes = matches.filter((m) => m.code);
    if (codes.length)
      matches = codes.filter(
        (m) =>
          !codes.some((other) => other.start <= m.start && other.end > m.end),
      );
    else
      matches = matches.filter(
        (m) =>
          !matches.some(
            (other) =>
              other.start <= m.start &&
              other.end >= m.end &&
              other.end - other.start > m.end - m.start,
          ),
      );
    const ids = new Set(matches.map((m) => m.point.id));
    return { matches: ids.size === 1 ? matches : [], ambiguous: ids.size > 1 };
  }
}
