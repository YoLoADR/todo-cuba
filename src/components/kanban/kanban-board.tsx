"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import type { Task, Status } from "@/lib/db/schema";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove?: (taskId: string, newStatus: Status) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

const statusTitles: Record<Status, string> = {
  backlog: "Backlog",
  todo: "À faire",
  "in-progress": "En cours",
  done: "Terminé",
};

export function KanbanBoard({ tasks, onTaskMove, onEdit, onDelete }: KanbanBoardProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const newStatus = over.id as Status;
      if (onTaskMove) {
        onTaskMove(active.id as string, newStatus);
      }
    }
  };

  // Filtrer les tâches par statut
  const tasksByStatus: Record<Status, Task[]> = {
    backlog: tasks.filter((task) => task.status === "backlog"),
    todo: tasks.filter((task) => task.status === "todo"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done"),
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusTitles).map(([status, title]) => {
          const statusKey = status as Status;
          return (
            <SortableContext key={statusKey} items={tasksByStatus[statusKey].map((task) => task.id)}>
              <KanbanColumn
                id={statusKey}
                title={title}
                tasks={tasksByStatus[statusKey]}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </SortableContext>
          );
        })}
      </div>
    </DndContext>
  );
}