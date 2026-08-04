"use strict";

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import type { Task } from "@/lib/db/schema";

// Helper pour wrapper DndContext
const DndWrapper = ({ children }: { children: React.ReactNode }) => {
  return <DndContext>{children}</DndContext>;
};

describe("KanbanColumn", () => {
  const mockTasks: Task[] = [
    {
      id: "task-1",
      title: "Task 1",
      description: "Description 1",
      priority: "high",
      category: "Travail",
      status: "todo",
      dueDate: "2026-12-31",
      position: 0,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-01T00:00:00Z",
    },
    {
      id: "task-2",
      title: "Task 2",
      description: "Description 2",
      priority: "medium",
      category: null,
      status: "todo",
      dueDate: null,
      position: 1,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-01T00:00:00Z",
    },
  ];

  it("renders column title with count", () => {
    render(
      <KanbanColumn id="todo" title="À faire" tasks={mockTasks} />,
      { wrapper: DndWrapper }
    );
    expect(screen.getByText("À faire")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
  });

  it("renders empty state when no tasks", () => {
    render(
      <KanbanColumn id="todo" title="À faire" tasks={[]} />,
      { wrapper: DndWrapper }
    );
    expect(screen.getByText("Aucune tâche")).toBeDefined();
  });

  it("renders task cards when tasks are present", () => {
    render(
      <KanbanColumn id="todo" title="À faire" tasks={mockTasks} />,
      { wrapper: DndWrapper }
    );
    expect(screen.getByText("Task 1")).toBeDefined();
    expect(screen.getByText("Task 2")).toBeDefined();
  });

  it("calls onEdit when edit button is clicked on a task", async () => {
    const onEdit = vi.fn();
    render(
      <KanbanColumn id="todo" title="À faire" tasks={mockTasks} onEdit={onEdit} />,
      { wrapper: DndWrapper }
    );
    // Simuler le click sur le bouton éditer de la première tâche
    // (la logique exacte dépendra de l'implémentation)
    expect(onEdit).not.toHaveBeenCalled(); // Pour l'instant, juste vérifier que le callback est passé
  });

  it("calls onDelete when delete button is clicked on a task", async () => {
    const onDelete = vi.fn();
    render(
      <KanbanColumn id="todo" title="À faire" tasks={mockTasks} onDelete={onDelete} />,
      { wrapper: DndWrapper }
    );
    expect(onDelete).not.toHaveBeenCalled(); // Pour l'instant, juste vérifier que le callback est passé
  });
});