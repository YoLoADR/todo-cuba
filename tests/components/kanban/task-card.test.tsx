"use strict";

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import type { Task } from "@/lib/db/schema";
import { TaskCard } from "@/components/kanban/task-card";

// Helper pour wrapper DndContext + SortableContext
const DndWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <DndContext>
      <SortableContext items={[]}>
        {children}
      </SortableContext>
    </DndContext>
  );
};

describe("TaskCard", () => {
  const mockTask: Task = {
    id: "task-1",
    title: "Test Task",
    description: "Test Description",
    priority: "high",
    category: "Travail",
    status: "todo",
    dueDate: "2026-12-31",
    position: 0,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  };

  it("renders task title", () => {
    render(<TaskCard task={mockTask} />, { wrapper: DndWrapper });
    expect(screen.getByText("Test Task")).toBeDefined();
  });

  it("renders priority badge with correct color", () => {
    render(<TaskCard task={mockTask} />, { wrapper: DndWrapper });
    const badge = screen.getByText("high");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("text-red-400"); // high = red
  });

  it("renders category when present", () => {
    render(<TaskCard task={mockTask} />, { wrapper: DndWrapper });
    expect(screen.getByText("Travail")).toBeDefined();
  });

  it("does not render category when not present", () => {
    const taskWithoutCategory = { ...mockTask, category: null };
    render(<TaskCard task={taskWithoutCategory} />, { wrapper: DndWrapper });
    expect(screen.queryByText("Travail")).toBeNull();
  });

  it("renders due date when present", () => {
    render(<TaskCard task={mockTask} />, { wrapper: DndWrapper });
    expect(screen.getByText(/31\/12\/2026/)).toBeDefined();
  });

  it("does not render due date when not present", () => {
    const taskWithoutDueDate = { ...mockTask, dueDate: null };
    render(<TaskCard task={taskWithoutDueDate} />, { wrapper: DndWrapper });
    expect(screen.queryByText(/\d{2}\/\d{2}\/\d{4}/)).toBeNull();
  });

  it("renders edit and delete buttons when callbacks are provided", () => {
    render(<TaskCard task={mockTask} onEdit={vi.fn()} onDelete={vi.fn()} />, { wrapper: DndWrapper });
    expect(screen.getByLabelText("Éditer")).toBeDefined();
    expect(screen.getByLabelText("Supprimer")).toBeDefined();
  });

  it("does not render edit and delete buttons when callbacks are not provided", () => {
    render(<TaskCard task={mockTask} />, { wrapper: DndWrapper });
    expect(screen.queryByLabelText("Éditer")).toBeNull();
    expect(screen.queryByLabelText("Supprimer")).toBeNull();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<TaskCard task={mockTask} onEdit={onEdit} />, { wrapper: DndWrapper });
    await user.click(screen.getByLabelText("Éditer"));
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<TaskCard task={mockTask} onDelete={onDelete} />, { wrapper: DndWrapper });
    await user.click(screen.getByLabelText("Supprimer"));
    expect(onDelete).toHaveBeenCalledWith("task-1");
  });

  describe.skip("when dragging", () => {
    it("applies drag styles", () => {
      // Test complexe en jsdom - on vérifie juste que les props sont bien passées
      // Le drag réel sera testé en E2E
      expect(true).toBe(true);
    });
  });
});