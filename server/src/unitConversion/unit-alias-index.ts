export interface ConfiguredUnit {
  id: number;
  name: string;
  code?: string | null;
  translationParsing: string;
}

// Preserve case: m and M are different prefixes. micro glyphs alone are equivalent.
export const unitSpellingKey = (value: string) =>
  value
    .replace(
      /10([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/gu,
      (_, exponent: string) =>
        '10^' + [...exponent].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join(''),
    )
    .normalize('NFKC')
    .replace(/[µμ]/gu, 'u')
    .replace(/\s+/gu, '');

export class UnitAliasIndex {
  private readonly aliases = new Map<string, Set<number>>();
  private readonly units = new Map<number, ConfiguredUnit>();
  readonly issues: { unitId: number; code: string }[] = [];
  constructor(units: ConfiguredUnit[]) {
    for (const unit of units) {
      if (
        !Number.isSafeInteger(unit.id) ||
        unit.id <= 0 ||
        this.units.has(unit.id)
      )
        throw new Error('invalid_unit_catalog');
      this.units.set(unit.id, unit);
      if (
        typeof unit.translationParsing !== 'string' ||
        unit.translationParsing.length > 4096
      )
        throw new Error('invalid_unit_parsing');
      const parts = unit.translationParsing
        ? unit.translationParsing.split('_')
        : [];
      const seen = new Set<string>();
      for (const part of parts) {
        const key = unitSpellingKey(part);
        if (!key) {
          this.issues.push({ unitId: unit.id, code: 'empty_unit_alias' });
          continue;
        }
        if (seen.has(key))
          this.issues.push({ unitId: unit.id, code: 'duplicate_unit_alias' });
        seen.add(key);
      }
      for (const spelling of [unit.name, unit.code ?? '', ...parts]) {
        const key = unitSpellingKey(spelling);
        if (!key) continue;
        const ids = this.aliases.get(key) ?? new Set<number>();
        ids.add(unit.id);
        this.aliases.set(key, ids);
      }
    }
    for (const ids of this.aliases.values())
      if (ids.size > 1)
        for (const unitId of ids)
          this.issues.push({ unitId, code: 'colliding_unit_alias' });
  }
  resolve(spelling: string, allowedUnitIds: number[]) {
    const ids = this.aliases.get(unitSpellingKey(spelling));
    if (!ids?.size) return { unit: null, warning: 'unit_not_found' } as const;
    // A globally colliding spelling cannot be guessed from point applicability.
    if (ids.size !== 1)
      return { unit: null, warning: 'ambiguous_unit' } as const;
    const id = [...ids][0];
    if (!allowedUnitIds.includes(id))
      return { unit: null, warning: 'unit_not_allowed' } as const;
    return { unit: this.units.get(id)!, warning: null } as const;
  }

  recognizePrefix(text: string, allowedUnitIds: number[]) {
    const scan = (raw: string) => {
      const leading = /^\s*[*↑↓]*\s*\(?\s*/u.exec(raw)?.[0].length ?? 0;
      const input = raw.slice(leading, leading + 128);
      let found:
        | {
            text: string;
            end: number;
            resolved: ReturnType<UnitAliasIndex['resolve']>;
          }
        | undefined;
      for (let end = 1; end <= input.length; end++) {
        if (/[\p{L}\p{N}^/]/u.test(input[end] ?? '')) continue;
        const spelling = input.slice(0, end).trim();
        if (!this.aliases.has(unitSpellingKey(spelling))) continue;
        found = {
          text: spelling,
          end: leading + end,
          resolved: this.resolve(spelling, allowedUnitIds),
        };
      }
      return found;
    };
    const found = scan(text);
    if (!found)
      return {
        unitId: null,
        unit: null,
        unitText: null,
        warning: 'unit_not_found',
      };
    if (scan(text.slice(found.end).replace(/^\s*\)/u, '')))
      return {
        unitId: null,
        unit: null,
        unitText: null,
        observed: found.text,
        warning: 'ambiguous_unit',
      };
    if (!found.resolved.unit)
      return {
        unitId: null,
        unit: null,
        unitText: found.text,
        observed: found.text,
        warning: found.resolved.warning,
      };
    return {
      unitId: found.resolved.unit.id,
      unit: found.resolved.unit.name,
      unitText: found.text,
      observed: String(found.resolved.unit.id),
      warning: undefined,
    };
  }
}
