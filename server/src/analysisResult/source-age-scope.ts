export function sourceAppliesToAges(
  sourceAgeIds: readonly number[] | null | undefined,
  ageIds: readonly number[],
): boolean {
  return sourceAgeIds == null || sourceAgeIds.some((id) => ageIds.includes(id));
}
