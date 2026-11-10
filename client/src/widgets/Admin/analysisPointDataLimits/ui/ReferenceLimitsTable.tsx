import { useTranslation } from "react-i18next";
import { unitLabel } from "@entities/units";

export interface ReferenceLimit {
  age: string;
  gender: string;
  unit: string;
  minValue: number | string | null;
  maxValue: number | string | null;
  lowInclusive?: boolean;
}

function formatInterval(limit: ReferenceLimit): string {
  if (limit.minValue === null && limit.maxValue === null) return "Нет границ";
  if (limit.minValue === null) return `≤ ${limit.maxValue}`;
  if (limit.maxValue === null)
    return `${limit.lowInclusive ? ">" : "≥"} ${limit.minValue}`;
  if (limit.lowInclusive) return `> ${limit.minValue} – ≤ ${limit.maxValue}`;
  return `${limit.minValue} – ${limit.maxValue}`;
}

export const ReferenceLimitsTable = ({
  limits,
}: {
  limits: ReferenceLimit[];
}) => {
  const { t } = useTranslation("entities");
  const groups = new Map<string, ReferenceLimit[]>();
  for (const limit of limits) {
    const key = JSON.stringify([limit.unit, limit.age]);
    const group = groups.get(key) ?? [];
    group.push(limit);
    groups.set(key, group);
  }

  return (
    <table>
      <tbody>
        {Array.from(groups.values()).flatMap((group, groupIndex, all) => {
          const equalSexBounds =
            group.length === 2 &&
            new Set(group.map((l) => l.gender)).size === 2 &&
            group.every((l) => l.gender === "m" || l.gender === "f") &&
            group[0].minValue === group[1].minValue &&
            group[0].maxValue === group[1].maxValue &&
            !!group[0].lowInclusive === !!group[1].lowInclusive;
          const displayed = equalSexBounds ? [group[0]] : group;
          return displayed.map((limit, index) => (
            <tr
              key={`${groupIndex}-${index}`}
              className={
                index < displayed.length - 1 || groupIndex < all.length - 1
                  ? "border-b border-gray-300"
                  : ""
              }
            >
              {index === 0 && (
                <td className="p-2" rowSpan={displayed.length}>
                  {t(`ages.${limit.age}`)}
                </td>
              )}
              <td className="p-2">
                {equalSexBounds ? "" : t(`gender.${limit.gender}`)}
              </td>
              <td className="p-2 whitespace-nowrap">
                {formatInterval(limit)} {unitLabel(limit.unit)}
              </td>
            </tr>
          ));
        })}
      </tbody>
    </table>
  );
};
