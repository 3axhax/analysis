import type { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import type { PdfNameMatch } from './pdf-name-index';

type Form = 'count' | 'percentage';
const familyOf = (name: string) => /^(.*)-(count|percentage)$/.exec(name);

/** Exact aliases provide identity; markers classify a paired catalog form. */
export function resolveCatalogForms(
  text: string,
  matches: PdfNameMatch[],
  points: AnalysisPointWithTranslation[],
): { matches: PdfNameMatch[]; ambiguous: boolean; unsupported?: boolean } {
  const families = new Set(
    matches.flatMap((m) => {
      const family = familyOf(m.point.name);
      return family ? [family[1]] : [];
    }),
  );
  let resolved = [...matches];
  for (const family of families) {
    const group = matches.filter((m) => familyOf(m.point.name)?.[1] === family);
    const paired = points.filter((p) => familyOf(p.name)?.[1] === family);
    const first = [...group].sort(
      (a, b) => a.start - b.start || b.end - a.end,
    )[0];
    const beforeReference = text
      .slice(first.start)
      .split(/референ|норм[аы]|reference|коммент/iu)[0];
    const relativeEnd = first.end - first.start;
    const numeric = /\d+(?:[.,]\d+)?/.exec(beforeReference.slice(relativeEnd));
    const numberStart = numeric
      ? relativeEnd + numeric.index
      : beforeReference.length;
    const numberEnd = numeric
      ? numberStart + numeric[0].length
      : beforeReference.length;
    const context =
      beforeReference.slice(0, numberStart) +
      (/^\s*%/.exec(beforeReference.slice(numberEnd))?.[0] ?? '');
    const percentage = /%|процент|percent/iu.test(context);
    const count = /#|абс|absolute/iu.test(context);
    if (percentage && count) return { matches: [], ambiguous: true };
    const nameMatches = group.filter(
      (m) => m.start < first.start + numberStart,
    );
    const explicit = nameMatches.filter(
      (m) =>
        m.code ||
        /[%#]|абс|процент|percent|count|колич|число\s+\p{L}/iu.test(m.alias),
    );
    const explicitForms = new Set(
      explicit.map((m) => familyOf(m.point.name)?.[2] as Form),
    );
    const marker: Form | undefined = percentage
      ? 'percentage'
      : count
        ? 'count'
        : undefined;
    if (
      explicitForms.size > 1 ||
      (marker && [...explicitForms].some((form) => form !== marker))
    )
      return { matches: [], ambiguous: true };
    const form = marker ?? [...explicitForms][0];
    if (!form) return { matches: [], ambiguous: true };
    const target = paired.find((p) => p.name === `${family}-${form}`);
    if (!target) return { matches: [], ambiguous: false, unsupported: true };
    const selected = nameMatches.filter(
      (m) => m.point.id === target.id && explicit.includes(m),
    );
    const source = [...(selected.length ? selected : nameMatches)].sort(
      (a, b) => b.end - b.start - (a.end - a.start),
    )[0];
    resolved = resolved.filter((m) => familyOf(m.point.name)?.[1] !== family);
    resolved.push({ ...source, point: target });
  }
  return { matches: resolved, ambiguous: false };
}
