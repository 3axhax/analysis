import type { UnitConversionService } from '../unitConversion/unit-conversion.service';

export function sourceDetails(
  id: number,
  sources: Awaited<ReturnType<UnitConversionService['sourceCatalog']>>,
) {
  const byId = new Map(sources.map((source) => [source.id, source]));
  const source = byId.get(id);
  if (!source) return null;
  let root = source;
  const visited = new Set<number>();
  while (root.parentId !== null) {
    if (visited.has(root.id) || !byId.has(root.parentId))
      throw new Error('invalid_source_hierarchy');
    visited.add(root.id);
    root = byId.get(root.parentId)!;
  }
  return {
    id: source.id,
    name: source.name,
    url: source.url ?? null,
    year: source.year ?? null,
    metadata: source.metadata,
    rootId: root.id,
    rootName: root.name,
  };
}
