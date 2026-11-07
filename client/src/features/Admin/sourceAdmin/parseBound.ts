export function parseBound(value: number | string | null): number | null {
  if (value === null || (typeof value === "string" && value.trim() === ""))
    return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (
    typeof value !== "string" ||
    !/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value.trim())
  )
    throw new Error("Invalid bound");
  const parsed = Number(value.trim().replace(",", "."));
  if (!Number.isFinite(parsed)) throw new Error("Invalid bound");
  return parsed;
}
