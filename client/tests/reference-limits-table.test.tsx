import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReferenceLimitsTable } from "../src/widgets/Admin/analysisPointDataLimits/ui/ReferenceLimitsTable";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("reference limits table", () => {
  afterEach(cleanup);
  it("groups matching sex ranges by age while preserving distinct limits", () => {
    render(
      <ReferenceLimitsTable
        limits={[
          {
            age: "adult",
            gender: "m",
            unit: "g/l",
            minValue: 10,
            maxValue: 20,
          },
          {
            age: "adult",
            gender: "f",
            unit: "g/l",
            minValue: 10,
            maxValue: 20,
          },
          {
            age: "child",
            gender: "m",
            unit: "g/l",
            minValue: 0,
            maxValue: null,
          },
          {
            age: "child",
            gender: "f",
            unit: "g/l",
            minValue: 2,
            maxValue: null,
            lowInclusive: true,
          },
        ]}
      />,
    );
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).queryByText("gender.m")).toBeNull();
    expect(within(rows[0]).getByText(/10 – 20/)).toBeTruthy();
    expect(within(rows[1]).getByText(/≥ 0/)).toBeTruthy();
    expect(within(rows[2]).getByText(/> 2/)).toBeTruthy();
    expect(
      within(rows[1]).getByText("ages.child").getAttribute("rowspan"),
    ).toBe("2");
  });
  it("keeps units and inclusive thresholds distinct", () => {
    render(
      <ReferenceLimitsTable
        limits={[
          {
            age: "adult",
            gender: "m",
            unit: "g/l",
            minValue: 5,
            maxValue: 10,
            lowInclusive: true,
          },
          { age: "adult", gender: "f", unit: "g/l", minValue: 5, maxValue: 10 },
          {
            age: "adult",
            gender: "m",
            unit: "g/dl",
            minValue: null,
            maxValue: 0,
          },
        ]}
      />,
    );
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText(/> 5 – ≤ 10/)).toBeTruthy();
    expect(screen.getByText(/≤ 0/)).toBeTruthy();
  });
});
