export function sourceAppliesToAge(metadata: Record<string, unknown>, ageId: number): boolean {
  if (!('allowedAgeIds' in metadata)) return true;
  return Array.isArray(metadata.allowedAgeIds) && metadata.allowedAgeIds.includes(ageId);
}
