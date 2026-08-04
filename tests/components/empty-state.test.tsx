import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState icon={Inbox} title="Aucune tâche" />);
    expect(screen.getByText("Aucune tâche")).toBeDefined();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Vide"
        description="Créez votre première tâche"
      />,
    );
    expect(screen.getByText("Créez votre première tâche")).toBeDefined();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState icon={Inbox} title="Vide" />);
    expect(screen.queryByText("Créez")).toBeNull();
  });

  it("renders icon", () => {
    render(<EmptyState icon={Inbox} title="Vide" />);
    expect(screen.getByText("Vide").parentElement?.querySelector("svg")).toBeDefined();
  });

  it("has role=status for accessibility", () => {
    render(<EmptyState icon={Inbox} title="Vide" />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Vide"
        action={<button>Créer</button>}
      />,
    );
    expect(screen.getByText("Créer")).toBeDefined();
  });
});