import { AnalysisPointWithTranslation } from '../analysisPoint/analysisPoint.service';
import { ExtractTablesResponse } from '../pdf-parser/pdf-parser.types';
import { PdfFindingMatcher, PdfMatcherResult } from './pdf-matching.types';
import { canonicalName, pointAliases, PdfNameIndex } from './pdf-name-index';
import { rowEvidence, isMetadata, PdfRowEvidence } from './pdf-row-evidence';
import {
  headerColumns,
  inferResultColumns,
  resultRegion,
  ResultColumns,
} from './pdf-result-region';
import { parseResult, numericTokens } from './pdf-value-parser';
import { PairCandidate, resolvePdfPairs } from './pdf-pair-resolver';
import { recognizePdfUnit } from './pdf-unit-parser';
import {
  UnitAliasIndex,
  ConfiguredUnit,
} from '../unitConversion/unit-alias-index';

export const canonicalPdfText = canonicalName;

// Keep the existing service/CLI import; there is one deterministic implementation.
export class LegacyPdfFindingMatcher implements PdfFindingMatcher {
  match(
    extraction: ExtractTablesResponse,
    points: AnalysisPointWithTranslation[],
    unitCatalog?: ConfiguredUnit[],
  ): PdfMatcherResult {
    const index = new PdfNameIndex(points);
    const unitIndex = unitCatalog ? new UnitAliasIndex(unitCatalog) : undefined;
    const candidates: PairCandidate[] = [];
    const warnings = new Set<string>();
    let candidateRows = 0,
      namedRows = 0,
      ambiguous = 0;
    for (const page of extraction.tables) {
      for (let tableIndex = 0; tableIndex < page.tables.length; tableIndex++) {
        const table = page.tables[tableIndex];
        const tableRows = table.data.map((cells, row) =>
          rowEvidence(cells, {
            page: page.page,
            table: tableIndex,
            row,
            method: table.method,
          }),
        );
        let columns: ResultColumns | undefined = inferResultColumns(
          tableRows,
          index,
        );
        let pending: PdfRowEvidence | undefined;
        for (let rowIndex = 0; rowIndex < table.data.length; rowIndex++) {
          candidateRows++;
          let view = rowEvidence(table.data[rowIndex], {
            page: page.page,
            table: tableIndex,
            row: rowIndex,
            method: table.method,
          });
          let header = headerColumns(view);
          if (
            !header &&
            pending &&
            pending.cells.length === view.cells.length &&
            numericTokens(pending.text).length === 0 &&
            numericTokens(view.text).length === 0
          ) {
            header = headerColumns(
              rowEvidence(
                view.cells.map(
                  (cell, i) => `${pending?.cells[i] ?? ''} ${cell}`,
                ),
                view,
              ),
            );
          }
          if (header) {
            columns = header;
            pending = undefined;
            continue;
          }
          if (isMetadata(view.text) || !view.text.trim()) {
            pending = undefined;
            continue;
          }
          const selectName = (record: PdfRowEvidence) => {
            if (!columns || columns.name === undefined)
              return index.select(record.text);
            const start = record.spans[columns.name]?.start ?? 0;
            const endColumn =
              columns.result > columns.name ? columns.result : columns.name + 1;
            const end = record.spans[endColumn]?.start ?? record.text.length;
            const selected = index.select(record.text.slice(start, end));
            return {
              ...selected,
              matches: selected.matches.map((match) => ({
                ...match,
                start: match.start + start,
                end: match.end + start,
              })),
            };
          };
          let selected = selectName(view);
          if (selected.unsupported) {
            warnings.add('unsupported_name');
            pending = undefined;
            continue;
          }
          if (
            pending &&
            pending.cells.length === view.cells.length &&
            !selected.matches.length &&
            !selected.ambiguous
          ) {
            const combined = rowEvidence(
              view.cells.map((cell, i) =>
                [pending?.cells[i] ?? '', cell].filter(Boolean).join(' '),
              ),
              { ...pending, endRow: view.row },
            );
            const continued = selectName(combined);
            if (
              continued.matches.length &&
              numericTokens(view.text).length > 0
            ) {
              view = combined;
              selected = continued;
            }
          }
          if (selected.ambiguous) {
            warnings.add('ambiguous_name');
            ambiguous++;
            pending = undefined;
            continue;
          }
          if (!selected.matches.length) {
            if (
              columns &&
              /\p{L}/u.test(view.cells[columns.name ?? 0] ?? '') &&
              parseResult(
                view.cells.slice(columns.result, columns.end).join('\n'),
              ).value !== undefined
            )
              warnings.add('unrecognized_name');
            pending = numericTokens(view.text).length === 0 ? view : undefined;
            continue;
          }
          namedRows++;
          const name = [...selected.matches].sort(
            (a, b) => a.start - b.start || b.end - a.end,
          )[0];
          const region = resultRegion(view, name.end, columns);
          if (!columns) {
            const firstNumber = numericTokens(region.text)[0];
            const repeated = selected.matches
              .filter(
                (m) =>
                  m.start > name.end &&
                  firstNumber &&
                  m.start > region.start + firstNumber.start,
              )
              .sort((a, b) => a.start - b.start)[0];
            if (repeated && /[<>≤≥]/u.test(view.text.slice(repeated.end)))
              region.text = view.text.slice(region.start, repeated.start);
          }
          const parsed = parseResult(region.text);
          if (parsed.value === undefined) {
            if (parsed.warning) warnings.add(parsed.warning);
            pending = numericTokens(view.text).length === 0 ? view : undefined;
            continue;
          }
          pending = undefined;
          const token = numericTokens(region.text)[0];
          candidates.push({
            name,
            value: parsed.value,
            row: view,
            valueStart: region.start + token.start,
            rule: region.rule,
            unitEvidence: unitIndex
              ? unitIndex.recognizePrefix(
                  view.text.slice(region.start + token.end),
                  (name.point.units ?? []).map((unit) => unit.id),
                )
              : recognizePdfUnit(
                  view.text.slice(region.start + token.end),
                  name.point.units,
                ),
          });
        }
      }
    }
    const resolved = resolvePdfPairs(candidates);
    if (resolved.conflicts) warnings.add('conflicting_values');
    for (const finding of resolved.findings)
      for (const warning of finding.warnings) warnings.add(warning);
    if (!resolved.findings.length) warnings.add('no_supported_findings');
    return {
      findings: resolved.findings,
      warnings: [...warnings].sort(),
      stats: {
        candidateRows,
        logicalRows: namedRows,
        pointCandidates: candidates.length,
        ambiguous: ambiguous + resolved.conflicts,
      },
    };
  }
  getReferenceList(point: AnalysisPointWithTranslation): string[] {
    return pointAliases(point);
  }
  findReferenceInString(value: string, reference: string): boolean {
    return (' ' + canonicalName(value) + ' ').includes(
      ' ' + canonicalName(reference) + ' ',
    );
  }
  findNumberAfterSubstring(text: string, searchString: string): number {
    const start = searchString
      ? text.toLowerCase().indexOf(searchString.toLowerCase())
      : 0;
    return start < 0
      ? 0
      : (parseResult(text.slice(start + searchString.length)).value ?? 0);
  }
}
