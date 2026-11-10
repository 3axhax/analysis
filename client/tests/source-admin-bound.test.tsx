import { describe, expect, it } from "vitest";
import { parseBound } from "../src/features/Admin/sourceAdmin/parseBound";

describe("reference bound input", () => {
  it("distinguishes missing values, zero and decimal separators", () => {
    expect(parseBound("")).toBeNull();
    expect(parseBound("0")).toBe(0);
    expect(parseBound("1,25")).toBe(1.25);
    expect(parseBound("1.25")).toBe(1.25);
  });
  it("does not silently turn invalid input into a missing bound", () => {
    expect(() => parseBound("1abc")).toThrow();
    expect(() => parseBound("1,2,3")).toThrow();
    expect(() => parseBound("1e999")).toThrow();
  });
});
