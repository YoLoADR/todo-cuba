import { describe, it, expect } from "vitest";

describe("project setup", () => {
  it("vitest runs correctly", () => {
    expect(1 + 1).toBe(2);
  });

  it("jsdom is available", () => {
    expect(document).toBeDefined();
    expect(window).toBeDefined();
  });
});