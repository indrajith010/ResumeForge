import { describe, expect, it } from "vitest";
import { formatDateRange } from "./resumeFormat";

describe("formatDateRange", () => {
  it("joins start and end dates when both are present", () => {
    expect(formatDateRange("Jan 2020", "Dec 2021")).toBe("Jan 2020 - Dec 2021");
  });

  it("appends 'Present' when only a start date is given", () => {
    expect(formatDateRange("Jan 2020", "")).toBe("Jan 2020 - Present");
  });

  it("returns just the end date when there is no start date", () => {
    expect(formatDateRange("", "Dec 2021")).toBe("Dec 2021");
  });

  it("returns an empty string when neither date is present", () => {
    expect(formatDateRange("", "")).toBe("");
  });
});
