import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/ui/page-header";

describe("PageHeader", () => {
  it("renders title as h1", () => {
    render(<PageHeader title="Mes tâches" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Mes tâches");
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Mes tâches" description="Gérez vos tâches" />);
    expect(screen.getByText("Gérez vos tâches")).toBeDefined();
  });

  it("does not render description when not provided", () => {
    render(<PageHeader title="Mes tâches" />);
    expect(screen.queryByText("Gérez")).toBeNull();
  });

  it("renders action when provided", () => {
    render(
      <PageHeader
        title="Mes tâches"
        action={<button>Nouvelle tâche</button>}
      />,
    );
    expect(screen.getByText("Nouvelle tâche")).toBeDefined();
  });

  it("has border-b class (bordures > ombres)", () => {
    render(<PageHeader title="Test" />);
    const header = screen.getByRole("banner");
    expect(header.className).toContain("border-b");
  });
});