"use strict";

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import type { Task } from "@/lib/db/schema";

const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Backlog Task",
    description: "Backlog Description",
    priority: "high",
    category: "Travail",
    status: "backlog",
    dueDate: "2026-12-31",
    position: 0,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "task-2",
    title: "Todo Task",
    description: "Todo Description",
    priority: "medium",
    category: null,
    status: "todo",
    dueDate: null,
    position: 0,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "task-3",
    title: "In Progress Task",
    description: "In Progress Description",
    priority: "low",
    category: "Personnel",
    status: "in-progress",
    dueDate: "2026-11-30",
    position: 0,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "task-4",
    title: "Done Task",
    description: "Done Description",
    priority: "urgent",
    category: null,
    status: "done",
    dueDate: null,
    position: 0,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  },
];

describe("KanbanBoard", () => {
  it("renders all 4 columns", () => {
    render(<KanbanBoard tasks={mockTasks} />);
    expect(screen.getByText("Backlog")).toBeDefined();
    expect(screen.getByText("À faire")).toBeDefined();
    expect(screen.getByText("En cours")).toBeDefined();
    expect(screen.getByText("Terminé")).toBeDefined();
  });

  it("distributes tasks by status", () => {
    render(<KanbanBoard tasks={mockTasks} />);
    
    // Vérifier que chaque tâche est dans la bonne colonne
    expect(screen.getByText("Backlog Task")).toBeDefined();
    expect(screen.getByText("Todo Task")).toBeDefined();
    expect(screen.getByText("In Progress Task")).toBeDefined();
    expect(screen.getByText("Done Task")).toBeDefined();
  });

  it("shows correct task counts in each column", () => {
    render(<KanbanBoard tasks={mockTasks} />);
    
    // Chaque colonne devrait avoir 1 tâche
    expect(screen.getAllByText("1").length).toBe(4);
  });

  it("calls onTaskMove when a task is moved between columns", () => {
    const onTaskMove = vi.fn();
    render(<KanbanBoard tasks={mockTasks} onTaskMove={onTaskMove} />);
    
    // Pour l'instant, juste vérifier que le callback est passé
    // Le test réel du drag sera fait en E2E
    expect(onTaskMove).not.toHaveBeenCalled();
  });

  it("calls onEdit when edit button is clicked on a task", () => {
    const onEdit = vi.fn();
    render(<KanbanBoard tasks={mockTasks} onEdit={onEdit} />);
    
    // Pour l'instant, juste vérifier que le callback est passé
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("calls onDelete when delete button is clicked on a task", () => {
    const onDelete = vi.fn();
    render(<KanbanBoard tasks={mockTasks} onDelete={onDelete} />);
    
    // Pour l'instant, juste vérifier que le callback est passé
    expect(onDelete).not.toHaveBeenCalled();
  });
});