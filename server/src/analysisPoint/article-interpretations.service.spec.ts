import { aggregateArticleDescriptions } from './article-interpretations.service';

type Description = Parameters<typeof aggregateArticleDescriptions>[0][number];

function description(
  id: number,
  rbc: 'NORMAL' | 'LOW',
  mcv: 'NORMAL' | 'LOW',
  mch: 'NORMAL' | 'LOW',
): Description {
  const statuses = ['LOW', rbc, mcv, mch] as const;
  return {
    id,
    sourceId: null,
    description_ru: 'Условная интерпретация',
    conditions: statuses.map((status, index) => ({
      id: id * 10 + index,
      analysisPoint: { id: index + 1, name: ['HGB', 'RBC', 'MCV', 'MCH'][index] },
      statuses: [status],
      inheritedSource: false,
      intervalIds: [index * 2 + (status === 'LOW' ? 1 : 2)],
    })),
  };
}

const alternatives = ['NORMAL', 'LOW'] as const;
const combinations = alternatives.flatMap((rbc, rbcIndex) =>
  alternatives.flatMap((mcv, mcvIndex) =>
    alternatives.map((mch, mchIndex) =>
      description(1 + rbcIndex * 4 + mcvIndex * 2 + mchIndex, rbc, mcv, mch),
    ),
  ),
);

describe('article interpretation aggregation', () => {
  it('combines all eight independent alternatives into one row', () => {
    const [row, ...rest] = aggregateArticleDescriptions(combinations);
    expect(rest).toHaveLength(0);
    expect(row.id).toBe(1);
    expect(row.conditions.map(({ statuses }) => statuses)).toEqual([
      ['LOW'], ['LOW', 'NORMAL'], ['LOW', 'NORMAL'], ['LOW', 'NORMAL'],
    ]);
  });

  it('keeps rows when even one combination is missing', () => {
    const incomplete = combinations.slice(1);
    expect(aggregateArticleDescriptions(incomplete)).toEqual(incomplete);
  });

  it('checks intervals even if two variants have the same display status', () => {
    const rows = [
      description(1, 'NORMAL', 'NORMAL', 'NORMAL'),
      description(2, 'NORMAL', 'LOW', 'NORMAL'),
    ];
    rows[1].conditions[1].intervalIds = [99];
    expect(aggregateArticleDescriptions(rows)).toEqual(rows);
  });
});
