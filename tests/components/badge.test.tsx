import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>High</Badge>);
    expect(screen.getByText("High")).toBeDefined();
  });

  it("has rounded-full class", () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText("Test").className).toContain("rounded-full");
  });

  it("has border class (bordures > ombres)", () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText("Test").className).toContain("border");
  });

  it("applies high priority variant classes", () => {
    render(<Badge variant="high">Haute</Badge>);
    const badge = screen.getByText("Haute");
    expect(badge.className).toContain("text-red-400");
  });

  it("applies done status variant classes", () => {
    render(<Badge variant="done">Terminé</Badge>);
    const badge = screen.getByText("Terminé");
    expect(badge.className).toContain("text-emerald-400");
  });

  it("does not have shadow classes", () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText("Test").className).not.toContain("shadow");
  });
});