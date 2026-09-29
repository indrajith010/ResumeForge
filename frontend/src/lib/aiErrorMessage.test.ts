import { describe, expect, it } from "vitest";
import { aiErrorMessage } from "./aiErrorMessage";

describe("aiErrorMessage", () => {
  it("gives a friendly message for connection failures", () => {
    const err = new Error("LM Studio unavailable: could not connect. Make sure LM Studio is running.");
    expect(aiErrorMessage(err)).toMatch(/Start LM Studio/);
  });

  it("gives a friendly message for timeouts", () => {
    const err = new Error("LM Studio unavailable: the request timed out. Try again.");
    expect(aiErrorMessage(err)).toMatch(/timed out/);
  });

  it("gives a friendly message for unexpected response formats", () => {
    const err = new Error("LM Studio unavailable: received an unexpected response format from the model.");
    expect(aiErrorMessage(err)).toMatch(/unexpected response/);
  });

  it("falls back to a generic unavailable message for a bare 503", () => {
    const err = new Error("Request failed: 503");
    expect(aiErrorMessage(err)).toMatch(/Start LM Studio/);
  });

  it("passes through unrelated error messages unchanged", () => {
    const err = new Error("Not authenticated");
    expect(aiErrorMessage(err)).toBe("Not authenticated");
  });

  it("handles non-Error values", () => {
    expect(aiErrorMessage("boom")).toBe("AI request failed");
  });
});
