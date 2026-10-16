export interface PdfNumericToken {
  value: number;
  start: number;
  end: number;
  operator: boolean;
}

export function numericTokens(text: string): PdfNumericToken[] {
  const protectedSpans = [
    ...text.matchAll(/\b\d{1,4}[./]\d{1,2}[./]\d{1,4}\b/gu),
    ...text.matchAll(
      /[+-]?\d+(?:[.,]\d+)?\s*(?:[-–—]|\.\.|\bдо\b|\bto\b)\s*[+-]?\d+(?:[.,]\d+)?/giu,
    ),
    ...text.matchAll(/\b10\s*\^\s*\d+/gu),
    ...text.matchAll(/[AА]\d{2}(?:\.\d{2,3}){1,4}/gu),
    ...text.matchAll(/\b\d+-[\p{L}]+/gu),
  ].map((m) => ({ start: m.index, end: m.index + m[0].length }));
  return [
    ...text.matchAll(
      /(?:[<>≤≥]\s*)?(?:[+-]\s*)?(?:\d+(?:\s*[.,]\s*\d+)?|[.,]\d+)(?:[eE][+-]?\d+)?/gu,
    ),
  ].flatMap((m) => {
    const start = m.index,
      end = start + m[0].length;
    if (
      protectedSpans.some((s) => start < s.end && end > s.start) ||
      /[\p{L}\p{N}^]/u.test(text[start - 1] ?? '')
    )
      return [];
    const raw = m[0].replace(/\s+/g, '');
    const value = Number(raw.replace(/^[<>≤≥]/, '').replace(',', '.'));
    return Number.isFinite(value)
      ? [{ value, start, end, operator: /^[<>≤≥]/.test(raw) }]
      : [];
  });
}

export function parseResult(text: string): {
  value?: number;
  warning?: string;
} {
  const numbers = numericTokens(text);
  if (numbers.length !== 1)
    return {
      warning: numbers.length ? 'result_region_ambiguous' : 'result_not_found',
    };
  if (numbers[0].operator || numbers[0].value < 0 || numbers[0].value >= 3000)
    return { warning: 'unsupported_numeric_result' };
  if (
    numbers[0].value === 0 &&
    !/^\s*[*↑↓]*\s*$/u.test(text.slice(0, numbers[0].start))
  )
    return { warning: 'result_region_ambiguous' };
  return { value: numbers[0].value };
}
