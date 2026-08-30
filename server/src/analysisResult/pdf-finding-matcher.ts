import { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import {
  ExtractedTable,
  ExtractTablesResponse,
  ExtractionMethod,
} from '../pdf-parser/pdf-parser.types';
import {
  PdfAliasEntry,
  PdfColumnRoles,
  PdfFindingMatcher,
  PdfLogicalRow,
  PdfMatcherResult,
  PdfParsingFinding,
} from './pdf-matching.types';

const NUMBER_PATTERN =
  /([<>≤≥]\s*)?([+-]?(?:(?:\d+(?:[.,]\d+)?)|(?:[.,]\d+))(?:e[+-]?\d+)?)/giu;
const DATE_PATTERN = /\b\d{1,4}[./-]\d{1,2}[./-]\d{1,4}\b/u;
const RANGE_PATTERN =
  /[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)\s*(?:[-–—]|\.\.|\bдо\b|\bto\b)\s*[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)/iu;
const MIN_STRUCTURED_SCORE = 60;
const MIN_WINNING_MARGIN = 15;

const HEADER_KEYWORDS = {
  name: [
    'показатель',
    'исследование',
    'анализ',
    'parameter',
    'test',
    'analyte',
    'name',
  ],
  result: ['результат', 'значение', 'result', 'value'],
  unit: ['единица', 'ед изм', 'единицы измерения', 'unit', 'units'],
  reference: [
    'референс',
    'референтные значения',
    'норма',
    'reference',
    'range',
    'interval',
  ],
} as const;

interface DetectedRoles {
  roles: PdfColumnRoles;
  headerRow?: number;
}

interface AliasMatch {
  entry: PdfAliasEntry;
  cellIndex: number;
  exactCell: boolean;
  inNameColumn: boolean;
  tolerant: boolean;
  rank: number;
  matchedKey: string;
}

interface ParsedNumber {
  raw: string;
  value: number;
  inequality: boolean;
}

interface ParsedValue {
  value: number;
  warnings: string[];
  source: 'structured' | 'adjacent' | 'same-cell' | 'legacy';
}

interface UnitMatch {
  id: number;
  name: string;
}

interface StructuredCandidate extends PdfParsingFinding {
  score: number;
  methods: Set<ExtractionMethod>;
}

interface LegacyRowCandidate {
  point: AnalysisPointWithTranslation;
  value: number;
  uniqueEnglishAbbreviation: boolean;
}

export function canonicalPdfText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/[‐‑‒–—−]/g, '-')
    .toLocaleLowerCase('ru')
    .replace(/[^\p{L}\p{N}%+<>≤≥^-]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*/g, '-');
}

export function tolerantPdfText(value: string): string {
  const confusables: Record<string, string> = {
    а: 'a',
    е: 'e',
    о: 'o',
    р: 'p',
    с: 'c',
    у: 'y',
    х: 'x',
    к: 'k',
    м: 'm',
    т: 't',
    в: 'b',
    н: 'h',
  };
  return canonicalPdfText(value).replace(
    /[аеорсухкмтвн]/g,
    (character) => confusables[character] ?? character,
  );
}

function containsTokenSequence(value: string, expected: string): boolean {
  return ` ${value} `.includes(` ${expected} `);
}

function mergeRoles(
  primary: PdfColumnRoles,
  fallback?: PdfColumnRoles,
): PdfColumnRoles {
  return {
    name: primary.name ?? fallback?.name,
    result: primary.result ?? fallback?.result,
    unit: primary.unit ?? fallback?.unit,
    reference: [
      ...new Set([...primary.reference, ...(fallback?.reference ?? [])]),
    ],
    explicit: primary.explicit || Boolean(fallback?.explicit),
  };
}

export class LegacyPdfFindingMatcher implements PdfFindingMatcher {
  private readonly rowDataValueMaxLimit = 3000;

  match(
    extraction: ExtractTablesResponse,
    points: AnalysisPointWithTranslation[],
  ): PdfMatcherResult {
    const sortedPoints = [...points].sort((a, b) =>
      a.parsingOrder === b.parsingOrder
        ? b.parsingWords.length - a.parsingWords.length
        : b.parsingOrder - a.parsingOrder,
    );
    const aliasOwners = this.buildAliasOwners(points);
    const findings: PdfParsingFinding[] = [];
    let candidateRows = 0;
    for (const page of extraction.tables) {
      for (const table of page.tables) {
        for (const row of table.data) {
          candidateRows += 1;
          if (row.length === 0) continue;
          const rowCandidates: LegacyRowCandidate[] = [];
          for (const point of sortedPoints) {
            let pointCandidate: LegacyRowCandidate | undefined;
            for (const reference of this.getReferenceList(point)) {
              if (!this.findReferenceInString(row[0] ?? '', reference)) {
                continue;
              }
              const value =
                row.length === 1
                  ? this.findNumberAfterSubstring(row[0] ?? '', reference)
                  : this.findNumberAfterSubstring(row[1] ?? '', '');
              if (value > 0 && value < this.rowDataValueMaxLimit) {
                const uniqueEnglishAbbreviation =
                  this.isUniqueEnglishAbbreviation(
                    reference,
                    point.id,
                    aliasOwners,
                  );
                if (
                  !pointCandidate ||
                  (!pointCandidate.uniqueEnglishAbbreviation &&
                    uniqueEnglishAbbreviation)
                ) {
                  pointCandidate = {
                    point,
                    value,
                    uniqueEnglishAbbreviation,
                  };
                }
              }
            }
            if (pointCandidate) rowCandidates.push(pointCandidate);
          }
          const abbreviationCandidate = rowCandidates.find(
            (candidate) => candidate.uniqueEnglishAbbreviation,
          );
          const selected = abbreviationCandidate ?? rowCandidates[0];
          if (
            selected &&
            !findings.some((item) => item.id === selected.point.id)
          ) {
            findings.push({
              id: selected.point.id,
              name: selected.point.name,
              value: selected.value,
              unitId: null,
              unit: null,
              confidence: 0.5,
              page: page.page,
              warnings: [],
            });
          }
        }
      }
    }
    return {
      findings,
      warnings: findings.length === 0 ? ['no_supported_findings'] : [],
      stats: {
        candidateRows,
        logicalRows: candidateRows,
        pointCandidates: findings.length,
        ambiguous: 0,
      },
    };
  }

  getReferenceList(point: AnalysisPointWithTranslation): string[] {
    return (
      point.parsingWords !== ''
        ? point.parsingWords.split('_')
        : [point.translationRu, point.translationEn]
    )
      .map((reference) => reference.trim().toLowerCase())
      .filter((reference) => reference !== '');
  }

  findNumberAfterSubstring(text: string, searchString: string): number {
    const searchIndex =
      searchString !== ''
        ? text.toLowerCase().indexOf(searchString.toLowerCase())
        : 0;
    if (searchIndex === -1) return 0;
    const match = text
      .slice(searchIndex + searchString.length)
      .match(/(\d+[.,]\d+|\d+)/);
    if (!match) return 0;
    return parseFloat(match[1].replace(',', '.'));
  }

  findReferenceInString(value: string, reference: string): boolean {
    const normalizedValue = canonicalPdfText(value);
    const normalizedReference = canonicalPdfText(reference);
    if (!normalizedReference) return false;
    return containsTokenSequence(normalizedValue, normalizedReference);
  }

  private buildAliasOwners(
    points: AnalysisPointWithTranslation[],
  ): Map<string, Set<number>> {
    const owners = new Map<string, Set<number>>();
    for (const point of points) {
      for (const reference of this.getReferenceList(point)) {
        const alias = canonicalPdfText(reference);
        if (!alias) continue;
        const pointIds = owners.get(alias) ?? new Set<number>();
        pointIds.add(point.id);
        owners.set(alias, pointIds);
      }
    }
    return owners;
  }

  private isUniqueEnglishAbbreviation(
    reference: string,
    pointId: number,
    owners: Map<string, Set<number>>,
  ): boolean {
    const alias = canonicalPdfText(reference);
    if (!/^[a-z][a-z0-9-]{1,4}$/u.test(alias)) return false;
    const pointIds = owners.get(alias);
    return pointIds?.size === 1 && pointIds.has(pointId);
  }
}

export class HybridPdfFindingMatcher implements PdfFindingMatcher {
  private readonly legacyMatcher = new LegacyPdfFindingMatcher();
  private readonly structuredMatcher = new StructuredPdfFindingMatcher();

  match(
    extraction: ExtractTablesResponse,
    points: AnalysisPointWithTranslation[],
  ): PdfMatcherResult {
    const structured = this.structuredMatcher.match(extraction, points);
    const legacy = this.legacyMatcher.match(extraction, points);
    const pointsById = new Map(points.map((point) => [point.id, point]));
    const findings = structured.findings.map((finding) =>
      this.applyUnitAssumption(finding, pointsById.get(finding.id)),
    );
    const findingIds = new Set(findings.map((finding) => finding.id));

    for (const legacyFinding of legacy.findings) {
      if (findingIds.has(legacyFinding.id)) continue;
      const fallback: PdfParsingFinding = {
        ...legacyFinding,
        confidence: 0.45,
        warnings: [
          'legacy_compatibility_fallback',
          ...(this.hasMultipleNumericLegacyCandidate(
            extraction,
            pointsById.get(legacyFinding.id),
            legacyFinding.value,
          )
            ? ['legacy_multiple_numeric_candidates']
            : []),
        ],
      };
      findings.push(
        this.applyUnitAssumption(fallback, pointsById.get(fallback.id)),
      );
      findingIds.add(fallback.id);
    }

    const warnings = structured.warnings.filter(
      (warning) => warning !== 'no_supported_findings' || findings.length === 0,
    );
    return {
      findings: findings.sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
      warnings,
      stats: {
        candidateRows: structured.stats.candidateRows,
        logicalRows: structured.stats.logicalRows,
        pointCandidates:
          structured.stats.pointCandidates +
          findings.filter((finding) =>
            finding.warnings.includes('legacy_compatibility_fallback'),
          ).length,
        ambiguous: structured.stats.ambiguous,
      },
    };
  }

  private applyUnitAssumption(
    finding: PdfParsingFinding,
    point?: AnalysisPointWithTranslation,
  ): PdfParsingFinding {
    if (finding.unitId !== null) return { ...finding };
    const units = point?.units ?? [];
    if (units.length !== 1) {
      return {
        ...finding,
        warnings: [
          ...new Set([...finding.warnings, 'unit_requires_selection']),
        ],
      };
    }
    return {
      ...finding,
      unitId: units[0].id,
      unit: units[0].name,
      warnings: [
        ...new Set([
          ...finding.warnings.filter(
            (warning) => warning !== 'unit_requires_selection',
          ),
          'unit_assumed_from_single_allowed',
        ]),
      ],
    };
  }

  private hasMultipleNumericLegacyCandidate(
    extraction: ExtractTablesResponse,
    point: AnalysisPointWithTranslation | undefined,
    selectedValue: number,
  ): boolean {
    if (!point) return false;
    const references = this.legacyMatcher.getReferenceList(point);
    for (const page of extraction.tables) {
      for (const table of page.tables) {
        for (const row of table.data) {
          if (
            row.length < 2 ||
            !references.some((reference) =>
              this.legacyMatcher.findReferenceInString(row[0] ?? '', reference),
            )
          ) {
            continue;
          }
          const value = this.legacyMatcher.findNumberAfterSubstring(
            row[1] ?? '',
            '',
          );
          if (Math.abs(value - selectedValue) > 1e-9) continue;
          if ([...(row[1] ?? '').matchAll(NUMBER_PATTERN)].length > 1) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

export class StructuredPdfFindingMatcher implements PdfFindingMatcher {
  match(
    extraction: ExtractTablesResponse,
    points: AnalysisPointWithTranslation[],
  ): PdfMatcherResult {
    const aliases = this.buildAliasIndex(points);
    const logical = this.buildLogicalRows(extraction, aliases);
    const candidates: StructuredCandidate[] = [];
    const warnings = new Set<string>();
    let ambiguous = 0;

    for (const row of logical.rows) {
      const matches = this.findAliasMatches(row, aliases);
      if (matches.length === 0) continue;
      const selectedMatches = this.selectAliasMatches(matches);
      if (selectedMatches.length === 0) continue;

      const rowCandidates = selectedMatches
        .map((match) => this.createCandidate(row, match))
        .filter((candidate): candidate is StructuredCandidate =>
          Boolean(candidate),
        );

      const pointIds = new Set(rowCandidates.map((candidate) => candidate.id));
      if (pointIds.size > 1) {
        const withUnit = rowCandidates.filter(
          (candidate) => candidate.unitId !== null,
        );
        if (withUnit.length === 1) {
          candidates.push(withUnit[0]);
        } else {
          ambiguous += 1;
          warnings.add('ambiguous_alias_requires_review');
        }
        continue;
      }
      candidates.push(...rowCandidates);
    }

    const resolved = this.resolveCandidates(candidates);
    ambiguous += resolved.ambiguous;
    for (const warning of resolved.warnings) warnings.add(warning);
    if (resolved.findings.length === 0) warnings.add('no_supported_findings');

    return {
      findings: resolved.findings,
      warnings: [...warnings],
      stats: {
        candidateRows: logical.candidateRows,
        logicalRows: logical.rows.length,
        pointCandidates: candidates.length,
        ambiguous,
      },
    };
  }

  private buildAliasIndex(
    points: AnalysisPointWithTranslation[],
  ): PdfAliasEntry[] {
    const seeds: Array<
      Omit<PdfAliasEntry, 'canonicalCollision' | 'tolerantCollision'>
    > = [];
    for (const point of points) {
      const primary = point.parsingWords
        .split('_')
        .map((value) => value.trim())
        .filter(Boolean);
      const values: Array<{
        raw: string;
        source: PdfAliasEntry['source'];
      }> = [
        ...primary.map((raw) => ({ raw, source: 'primary' as const })),
        ...(point.translationRu
          ? [{ raw: point.translationRu, source: 'translationRu' as const }]
          : []),
        ...(point.translationEn
          ? [{ raw: point.translationEn, source: 'translationEn' as const }]
          : []),
      ];
      const seen = new Set<string>();
      for (const value of values) {
        const canonicalKey = canonicalPdfText(value.raw);
        if (!canonicalKey) continue;
        const deduplicationKey = `${value.source}:${canonicalKey}`;
        if (seen.has(deduplicationKey)) continue;
        seen.add(deduplicationKey);
        const compactLength = canonicalKey.replace(/\s/g, '').length;
        seeds.push({
          point,
          source: value.source,
          raw: value.raw,
          canonicalKey,
          tolerantKey: tolerantPdfText(value.raw),
          short: compactLength <= 3,
        });
      }
    }

    const canonicalIds = this.idsByKey(seeds, 'canonicalKey');
    const tolerantIds = this.idsByKey(seeds, 'tolerantKey');
    return seeds.map((seed) => ({
      ...seed,
      canonicalCollision: (canonicalIds.get(seed.canonicalKey)?.size ?? 0) > 1,
      tolerantCollision: (tolerantIds.get(seed.tolerantKey)?.size ?? 0) > 1,
    }));
  }

  private idsByKey(
    aliases: Array<
      Omit<PdfAliasEntry, 'canonicalCollision' | 'tolerantCollision'>
    >,
    key: 'canonicalKey' | 'tolerantKey',
  ): Map<string, Set<number>> {
    const result = new Map<string, Set<number>>();
    for (const alias of aliases) {
      const ids = result.get(alias[key]) ?? new Set<number>();
      ids.add(alias.point.id);
      result.set(alias[key], ids);
    }
    return result;
  }

  private buildLogicalRows(
    extraction: ExtractTablesResponse,
    aliases: PdfAliasEntry[],
  ): { rows: PdfLogicalRow[]; candidateRows: number } {
    const rowsByFingerprint = new Map<string, PdfLogicalRow>();
    const carriedRoles = new Map<number, PdfColumnRoles>();
    let candidateRows = 0;

    for (const page of extraction.tables) {
      for (const table of page.tables) {
        candidateRows += table.data.length;
        const detected = this.detectColumnRoles(table);
        const previous = carriedRoles.get(table.cols);
        let roles = detected.roles;
        if (
          !roles.explicit &&
          previous &&
          this.rolesCompatible(table.data, previous, aliases)
        ) {
          roles = mergeRoles(roles, previous);
        }
        roles = this.inferMissingRoles(table.data, roles, aliases);
        if (roles.explicit) carriedRoles.set(table.cols, roles);

        for (let index = 0; index < table.data.length; index += 1) {
          if (index === detected.headerRow) continue;
          const cells = table.data[index].map((cell) => cell ?? '');
          if (cells.every((cell) => canonicalPdfText(cell) === '')) continue;
          const fingerprint = `${page.page}:${cells
            .map(canonicalPdfText)
            .join('\u001f')}`;
          const existing = rowsByFingerprint.get(fingerprint);
          if (existing) {
            existing.methods.add(table.method);
            existing.roles = mergeRoles(existing.roles, roles);
            continue;
          }
          rowsByFingerprint.set(fingerprint, {
            page: page.page,
            cells,
            canonicalCells: cells.map(canonicalPdfText),
            methods: new Set([table.method]),
            roles,
          });
        }
      }
    }
    return { rows: [...rowsByFingerprint.values()], candidateRows };
  }

  private detectColumnRoles(table: ExtractedTable): DetectedRoles {
    for (
      let rowIndex = 0;
      rowIndex < Math.min(table.data.length, 8);
      rowIndex += 1
    ) {
      const row = table.data[rowIndex];
      const roles: PdfColumnRoles = {
        reference: [],
        explicit: false,
      };
      row.forEach((cell, column) => {
        const normalized = canonicalPdfText(cell);
        if (this.hasHeaderKeyword(normalized, HEADER_KEYWORDS.name)) {
          roles.name = column;
        }
        if (this.hasHeaderKeyword(normalized, HEADER_KEYWORDS.result)) {
          roles.result = column;
        }
        if (this.hasHeaderKeyword(normalized, HEADER_KEYWORDS.unit)) {
          roles.unit = column;
        }
        if (this.hasHeaderKeyword(normalized, HEADER_KEYWORDS.reference)) {
          roles.reference.push(column);
        }
      });
      if (
        roles.result !== undefined ||
        roles.unit !== undefined ||
        roles.reference.length > 0
      ) {
        roles.explicit = true;
        return { roles, headerRow: rowIndex };
      }
    }
    return { roles: { reference: [], explicit: false } };
  }

  private hasHeaderKeyword(
    value: string,
    keywords: readonly string[],
  ): boolean {
    return keywords.some((keyword) =>
      containsTokenSequence(value, canonicalPdfText(keyword)),
    );
  }

  private inferMissingRoles(
    rows: string[][],
    roles: PdfColumnRoles,
    aliases: PdfAliasEntry[],
  ): PdfColumnRoles {
    const result = { ...roles, reference: [...roles.reference] };
    const width = Math.max(0, ...rows.map((row) => row.length));
    if (result.name === undefined) {
      let best: { column: number; matches: number } | undefined;
      for (let column = 0; column < width; column += 1) {
        const matches = rows
          .slice(0, 20)
          .filter((row) =>
            this.cellContainsSafeAlias(row[column] ?? '', aliases),
          ).length;
        if (matches > 0 && (!best || matches > best.matches)) {
          best = { column, matches };
        }
      }
      result.name = best?.column;
    }
    if (result.result === undefined && result.name !== undefined) {
      let best: { column: number; ratio: number } | undefined;
      for (let column = 0; column < width; column += 1) {
        if (
          column === result.name ||
          column === result.unit ||
          result.reference.includes(column)
        ) {
          continue;
        }
        const populated = rows
          .slice(0, 20)
          .map((row) => row[column] ?? '')
          .filter((cell) => canonicalPdfText(cell) !== '');
        if (populated.length === 0) continue;
        const scalar = populated.filter((cell) =>
          this.isScalarNumericCell(cell),
        ).length;
        const ratio = scalar / populated.length;
        if (ratio >= 0.6 && (!best || ratio > best.ratio)) {
          best = { column, ratio };
        }
      }
      result.result = best?.column;
    }
    return result;
  }

  private rolesCompatible(
    rows: string[][],
    roles: PdfColumnRoles,
    aliases: PdfAliasEntry[],
  ): boolean {
    const dataRows = rows.slice(0, 12);
    const nameCells =
      roles.name === undefined
        ? []
        : dataRows
            .map((row) => row[roles.name ?? -1] ?? '')
            .filter((cell) => canonicalPdfText(cell) !== '');
    const textualNameRatio =
      nameCells.length === 0
        ? 0
        : nameCells.filter(
            (cell) =>
              /\p{L}/u.test(cell) && this.numberMatches(cell).length === 0,
          ).length / nameCells.length;
    const hasName =
      roles.name === undefined ||
      nameCells.some((cell) => this.cellContainsSafeAlias(cell, aliases)) ||
      textualNameRatio >= 0.6;
    const hasResult =
      roles.result === undefined ||
      dataRows.some((row) =>
        this.isScalarNumericCell(row[roles.result ?? -1] ?? ''),
      );
    return hasName && hasResult;
  }

  private cellContainsSafeAlias(
    value: string,
    aliases: PdfAliasEntry[],
  ): boolean {
    const normalized = canonicalPdfText(value);
    return aliases.some(
      (alias) =>
        alias.source === 'primary' &&
        !alias.short &&
        !alias.canonicalCollision &&
        containsTokenSequence(normalized, alias.canonicalKey),
    );
  }

  private isScalarNumericCell(value: string): boolean {
    if (DATE_PATTERN.test(value) || RANGE_PATTERN.test(value)) return false;
    return this.numberMatches(value).length === 1;
  }

  private findAliasMatches(
    row: PdfLogicalRow,
    aliases: PdfAliasEntry[],
  ): AliasMatch[] {
    const primaryCanonical = this.collectAliasMatches(
      row,
      aliases,
      'primary',
      false,
    );
    if (primaryCanonical.length > 0) return primaryCanonical;

    const fallbackCanonical = [
      ...this.collectAliasMatches(row, aliases, 'translationRu', false),
      ...this.collectAliasMatches(row, aliases, 'translationEn', false),
    ];
    if (fallbackCanonical.length > 0) return fallbackCanonical;

    const primaryTolerant = this.collectAliasMatches(
      row,
      aliases,
      'primary',
      true,
    );
    if (primaryTolerant.length > 0) return primaryTolerant;
    return [
      ...this.collectAliasMatches(row, aliases, 'translationRu', true),
      ...this.collectAliasMatches(row, aliases, 'translationEn', true),
    ];
  }

  private collectAliasMatches(
    row: PdfLogicalRow,
    aliases: PdfAliasEntry[],
    source: PdfAliasEntry['source'],
    tolerant: boolean,
  ): AliasMatch[] {
    const cells = tolerant
      ? row.cells.map(tolerantPdfText)
      : row.canonicalCells;
    const matches: AliasMatch[] = [];
    for (const entry of aliases) {
      if (entry.source !== source) continue;
      const key = tolerant ? entry.tolerantKey : entry.canonicalKey;
      if (!key) continue;
      let cellIndex = cells.findIndex((cell) =>
        containsTokenSequence(cell, key),
      );
      if (cellIndex < 0) continue;
      if (row.roles.name !== undefined && cellIndex !== row.roles.name) {
        const nameCell = cells[row.roles.name] ?? '';
        if (containsTokenSequence(nameCell, key)) {
          cellIndex = row.roles.name;
        }
      }
      const exactCell = cells[cellIndex] === key;
      const inNameColumn = row.roles.name === cellIndex;
      const collision = tolerant
        ? entry.tolerantCollision
        : entry.canonicalCollision;
      const strictContext =
        exactCell &&
        inNameColumn &&
        row.roles.explicit &&
        row.roles.result !== undefined;
      const originalShortContext =
        entry.short &&
        !collision &&
        !tolerant &&
        /^[A-Za-z][A-Za-z0-9-]{0,2}$/.test(entry.raw.trim()) &&
        (cellIndex === 0 || inNameColumn);
      if (
        (entry.short || collision || tolerant) &&
        !strictContext &&
        !originalShortContext
      ) {
        continue;
      }
      const rank =
        (tolerant ? 0 : 1000) +
        (row.roles.name === cellIndex ? 500 : 0) +
        (exactCell ? 250 : 0) +
        Math.min(key.length, 200) +
        Math.min(entry.point.parsingOrder ?? 0, 20);
      matches.push({
        entry,
        cellIndex,
        exactCell,
        inNameColumn,
        tolerant,
        rank,
        matchedKey: key,
      });
    }
    return matches;
  }

  private selectAliasMatches(matches: AliasMatch[]): AliasMatch[] {
    if (matches.length === 0) return [];
    const sorted = [...matches].sort((a, b) => b.rank - a.rank);
    const best = sorted[0];
    return sorted.filter(
      (match) =>
        match.rank === best.rank && match.matchedKey === best.matchedKey,
    );
  }

  private createCandidate(
    row: PdfLogicalRow,
    match: AliasMatch,
  ): StructuredCandidate | null {
    const parsed = this.findValue(row, match);
    if (!parsed) return null;
    const unitResult = this.findUnit(row, match.entry.point);
    const warnings = [...parsed.warnings, ...unitResult.warnings];
    let score =
      (match.tolerant ? 10 : 25) +
      (match.inNameColumn ? 25 : 0) +
      (match.exactCell ? 20 : 0) +
      (match.entry.source === 'primary' ? 15 : 5) +
      Math.min(match.matchedKey.length, 15);
    if (match.entry.short) score -= 15;
    if (
      match.entry.canonicalCollision ||
      (match.tolerant && match.entry.tolerantCollision)
    ) {
      score -= 15;
    }
    score += {
      structured: 35,
      adjacent: 20,
      'same-cell': 15,
      legacy: 5,
    }[parsed.source];
    if (unitResult.unit) score += 10;

    return {
      id: match.entry.point.id,
      name: match.entry.point.name,
      value: parsed.value,
      unitId: unitResult.unit?.id ?? null,
      unit: unitResult.unit?.name ?? null,
      confidence: Math.max(
        0.1,
        Math.min(0.99, Number((score / 140).toFixed(2))),
      ),
      page: row.page,
      warnings: [...new Set(warnings)],
      score,
      methods: new Set(row.methods),
    };
  }

  private findValue(row: PdfLogicalRow, match: AliasMatch): ParsedValue | null {
    const roles = row.roles;
    if (
      roles.result !== undefined &&
      roles.result !== match.cellIndex &&
      !roles.reference.includes(roles.result)
    ) {
      const structured = this.parseValueCell(
        row.cells[roles.result] ?? '',
        match.entry.point,
      );
      if (structured) return { ...structured, source: 'structured' };
    }

    for (
      let index = match.cellIndex + 1;
      index < row.cells.length;
      index += 1
    ) {
      if (index === roles.unit || roles.reference.includes(index)) continue;
      const adjacent = this.parseValueCell(row.cells[index], match.entry.point);
      if (adjacent) return { ...adjacent, source: 'adjacent' };
    }

    const sameCellRaw = row.cells[match.cellIndex] ?? '';
    const withoutAlias = this.removeAlias(sameCellRaw, match.entry.raw);
    const sameCell = this.parseValueCell(withoutAlias, match.entry.point);
    if (sameCell) return { ...sameCell, source: 'same-cell' };

    if (match.cellIndex === 0 && row.cells.length > 1) {
      const legacy = this.parseValueCell(row.cells[1] ?? '', match.entry.point);
      if (legacy) return { ...legacy, source: 'legacy' };
    }
    return null;
  }

  private parseValueCell(
    raw: string,
    point: AnalysisPointWithTranslation,
  ): Omit<ParsedValue, 'source'> | null {
    if (!raw || DATE_PATTERN.test(raw) || RANGE_PATTERN.test(raw)) return null;
    const numbers = this.removeUnitNumberTokens(
      raw,
      point,
      this.numberMatches(raw),
    );
    if (numbers.length !== 1) return null;
    const selected = numbers[0];
    const warnings: string[] = [];
    if (selected.inequality) warnings.push('inequality_requires_review');
    if (selected.value === 0) warnings.push('zero_value_requires_review');
    if (selected.value < 0) warnings.push('negative_value_requires_review');
    if (Math.abs(selected.value) >= 3000) {
      warnings.push('large_value_requires_review');
    }
    return { value: selected.value, warnings };
  }

  private numberMatches(value: string): ParsedNumber[] {
    return [...value.matchAll(NUMBER_PATTERN)]
      .map((match) => ({
        raw: match[2],
        value: Number(match[2].replace(',', '.')),
        inequality: Boolean(match[1]),
      }))
      .filter((match) => Number.isFinite(match.value));
  }

  private removeAlias(value: string, rawAlias: string): string {
    const escaped = rawAlias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return value.replace(new RegExp(escaped, 'iu'), ' ');
  }

  private removeUnitNumberTokens(
    value: string,
    point: AnalysisPointWithTranslation,
    numbers: ParsedNumber[],
  ): ParsedNumber[] {
    const result = [...numbers];
    const valueKey = canonicalPdfText(value);
    for (const unit of point.units ?? []) {
      const unitKey = canonicalPdfText(unit.name.replace(/_/g, ' '));
      if (!unitKey || !containsTokenSequence(valueKey, unitKey)) continue;
      const unitNumbers = this.numberMatches(unit.name);
      for (const unitNumber of [...unitNumbers].reverse()) {
        const index = result.findLastIndex(
          (number) => number.value === unitNumber.value,
        );
        if (index >= 0) result.splice(index, 1);
      }
    }
    return result;
  }

  private findUnit(
    row: PdfLogicalRow,
    point: AnalysisPointWithTranslation,
  ): { unit: UnitMatch | null; warnings: string[] } {
    const units = point.units ?? [];
    if (units.length === 0) return { unit: null, warnings: [] };
    const source =
      row.roles.unit !== undefined
        ? (row.cells[row.roles.unit] ?? '')
        : row.cells.join(' ');
    const sourceKey = canonicalPdfText(source);
    const sourceSymbols = this.symbolSignature(source);
    const matched = units.filter((unit) => {
      const unitKey = canonicalPdfText(unit.name.replace(/_/g, ' '));
      if (unitKey && containsTokenSequence(sourceKey, unitKey)) return true;
      const unitSymbols = this.symbolSignature(unit.name);
      return Boolean(
        unitSymbols &&
          unitSymbols.length >= 2 &&
          sourceSymbols.includes(unitSymbols),
      );
    });
    if (matched.length === 1) {
      return { unit: matched[0], warnings: [] };
    }
    if (matched.length > 1) {
      return { unit: null, warnings: ['ambiguous_unit'] };
    }
    return { unit: null, warnings: ['unit_requires_selection'] };
  }

  private symbolSignature(value: string): string {
    return value
      .normalize('NFKC')
      .toLocaleLowerCase('ru')
      .replace(/_/g, '/')
      .replace(/\s+/g, '')
      .replace(/[×·]/g, '*');
  }

  private resolveCandidates(candidates: StructuredCandidate[]): {
    findings: PdfParsingFinding[];
    warnings: string[];
    ambiguous: number;
  } {
    const semantic = new Map<string, StructuredCandidate[]>();
    for (const candidate of candidates) {
      const valueKey = Object.is(candidate.value, -0)
        ? '0'
        : candidate.value.toString();
      const key = `${candidate.id}:${valueKey}`;
      const group = semantic.get(key) ?? [];
      group.push(candidate);
      semantic.set(key, group);
    }

    const mergedByPoint = new Map<number, StructuredCandidate[]>();
    for (const group of semantic.values()) {
      const unitIds = new Set(
        group
          .map((candidate) => candidate.unitId)
          .filter((unitId): unitId is number => unitId !== null),
      );
      if (unitIds.size > 1) {
        for (const candidate of group) {
          const list = mergedByPoint.get(candidate.id) ?? [];
          list.push(candidate);
          mergedByPoint.set(candidate.id, list);
        }
        continue;
      }
      const best = [...group].sort((a, b) => b.score - a.score)[0];
      const methods = new Set(
        group.flatMap((candidate) => [...candidate.methods]),
      );
      const withUnit = group.find((candidate) => candidate.unitId !== null);
      const merged: StructuredCandidate = {
        ...best,
        unitId: withUnit?.unitId ?? null,
        unit: withUnit?.unit ?? null,
        methods,
        warnings: [
          ...new Set(group.flatMap((candidate) => candidate.warnings)),
        ],
        score: best.score + Math.min((methods.size - 1) * 5, 10),
      };
      merged.confidence = Math.max(
        0.1,
        Math.min(0.99, Number((merged.score / 140).toFixed(2))),
      );
      const list = mergedByPoint.get(merged.id) ?? [];
      list.push(merged);
      mergedByPoint.set(merged.id, list);
    }

    const findings: PdfParsingFinding[] = [];
    const warnings = new Set<string>();
    let ambiguous = 0;
    for (const group of mergedByPoint.values()) {
      const ranked = group
        .filter((candidate) => candidate.score >= MIN_STRUCTURED_SCORE)
        .sort((a, b) => b.score - a.score);
      if (ranked.length === 0) continue;
      const first = ranked[0];
      if (
        ranked.length > 1 &&
        first.value !== ranked[1].value &&
        first.score - ranked[1].score < MIN_WINNING_MARGIN
      ) {
        ambiguous += 1;
        warnings.add('conflicting_values_require_review');
        continue;
      }
      if (ranked.length > 1 && first.value !== ranked[1].value) {
        first.warnings = [
          ...new Set([...first.warnings, 'alternative_candidates_ignored']),
        ];
      }
      findings.push({
        id: first.id,
        name: first.name,
        value: first.value,
        unitId: first.unitId,
        unit: first.unit,
        confidence: first.confidence,
        page: first.page,
        warnings: first.warnings,
      });
    }
    return {
      findings: findings.sort((a, b) => a.name.localeCompare(b.name)),
      warnings: [...warnings],
      ambiguous,
    };
  }
}
