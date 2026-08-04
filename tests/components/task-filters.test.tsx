import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { TaskFilters } from "@/components/task-filters";
import type { TaskFilters as TaskFiltersType } from "@/lib/validations/task";

/**
 * Wrapper avec état pour tester le composant contrôlé TaskFilters.
 * Le composant est contrôlé (value={filters.q}) donc on a besoin
 * d'un vrai setState pour que la frappe au clavier fonctionne.
 */
function StatefulTaskFilters({
  initial,
  onFilterChange,
  onReset,
}: {
  initial: TaskFiltersType;
  onFilterChange: (f: TaskFiltersType) => void;
  onReset: () => void;
}) {
  const [filters, setFilters] = useState<TaskFiltersType>(initial);
  return (
    <TaskFilters
      filters={filters}
      onFilterChange={(f) => {
        setFilters(f);
        onFilterChange(f);
      }}
      onReset={() => {
        setFilters({});
        onReset();
      }}
    />
  );
}

describe("TaskFilters", () => {
  it("affiche la recherche, le select priorité, le select statut et le bouton réinitialiser", () => {
    render(
      <TaskFilters
        filters={{}}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Recherche")).toBeDefined();
    expect(screen.getByLabelText("Priorité")).toBeDefined();
    expect(screen.getByLabelText("Statut")).toBeDefined();
    expect(screen.getByText("Réinitialiser")).toBeDefined();
  });

  it("changer la recherche appelle onFilterChange avec q mis à jour", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <StatefulTaskFilters
        initial={{}}
        onFilterChange={onFilterChange}
        onReset={vi.fn()}
      />,
    );

    const searchInput = screen.getByLabelText("Recherche");
    await user.type(searchInput, "test");

    expect(onFilterChange).toHaveBeenCalled();
    const lastCall = onFilterChange.mock.lastCall?.[0] as TaskFiltersType;
    expect(lastCall).toMatchObject({ q: "test" });
  });

  it("changer le select priorité appelle onFilterChange avec priority mis à jour", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <TaskFilters
        filters={{}}
        onFilterChange={onFilterChange}
        onReset={vi.fn()}
      />,
    );

    const prioritySelect = screen.getByLabelText("Priorité");
    await user.selectOptions(prioritySelect, "high");

    expect(onFilterChange).toHaveBeenCalledTimes(1);
    const callArg = onFilterChange.mock.lastCall?.[0] as TaskFiltersType;
    expect(callArg).toMatchObject({ priority: "high" });
  });

  it("changer le select statut appelle onFilterChange avec status mis à jour", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <TaskFilters
        filters={{}}
        onFilterChange={onFilterChange}
        onReset={vi.fn()}
      />,
    );

    const statusSelect = screen.getByLabelText("Statut");
    await user.selectOptions(statusSelect, "done");

    expect(onFilterChange).toHaveBeenCalledTimes(1);
    const callArg = onFilterChange.mock.lastCall?.[0] as TaskFiltersType;
    expect(callArg).toMatchObject({ status: "done" });
  });

  it("bouton Réinitialiser appelle onReset", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(
      <TaskFilters
        filters={{}}
        onFilterChange={vi.fn()}
        onReset={onReset}
      />,
    );

    await user.click(screen.getByText("Réinitialiser"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("valeurs initiales affichées correctement (filters pré-remplis)", () => {
    const initialFilters: TaskFiltersType = {
      priority: "high",
      status: "in-progress",
      q: "chercher ceci",
    };

    render(
      <TaskFilters
        filters={initialFilters}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    const searchInput = screen.getByLabelText("Recherche") as HTMLInputElement;
    expect(searchInput.value).toBe("chercher ceci");

    const prioritySelect = screen.getByLabelText("Priorité") as HTMLSelectElement;
    expect(prioritySelect.value).toBe("high");

    const statusSelect = screen.getByLabelText("Statut") as HTMLSelectElement;
    expect(statusSelect.value).toBe("in-progress");
  });

  it("les options du select priorité contiennent 'Toutes' + les valeurs enum", () => {
    render(
      <TaskFilters
        filters={{}}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    const prioritySelect = screen.getByLabelText("Priorité") as HTMLSelectElement;
    const values = Array.from(prioritySelect.options).map((o) => o.value);
    expect(values).toContain("");
    expect(values).toContain("low");
    expect(values).toContain("medium");
    expect(values).toContain("high");
    expect(values).toContain("urgent");

    const labels = Array.from(prioritySelect.options).map((o) => o.label);
    expect(labels).toContain("Toutes");
  });

  it("les options du select statut contiennent 'Tous' + les valeurs enum", () => {
    render(
      <TaskFilters
        filters={{}}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    const statusSelect = screen.getByLabelText("Statut") as HTMLSelectElement;
    const values = Array.from(statusSelect.options).map((o) => o.value);
    expect(values).toContain("");
    expect(values).toContain("backlog");
    expect(values).toContain("todo");
    expect(values).toContain("in-progress");
    expect(values).toContain("done");

    const labels = Array.from(statusSelect.options).map((o) => o.label);
    expect(labels).toContain("Tous");
  });
});
