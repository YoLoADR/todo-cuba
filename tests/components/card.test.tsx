import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/ui/card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeDefined();
  });

  it("has rounded-lg class (8px radius for containers)", () => {
    const { container } = render(<Card>Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("rounded-lg");
  });

  it("has border class (bordures > ombres)", () => {
    const { container } = render(<Card>Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border");
  });

  it("does not have shadow classes", () => {
    const { container } = render(<Card>Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain("shadow");
  });

  it("passes role and aria-label for accessibility", () => {
    const { container } = render(<Card role="region" aria-label="Task details">Details</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.getAttribute("role")).toBe("region");
    expect(card.getAttribute("aria-label")).toBe("Task details");
  });
});