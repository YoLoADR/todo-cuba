"use client";

import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./task-card";
import type { Task } from "@/lib/db/schema";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export function KanbanColumn({ id, title, tasks, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="bg-mrz-bg-elevated border border-mrz-border rounded-lg p-4 min-h-[200px]"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-mrz-text-primary">{title}</h2>
        <Badge variant="count">{tasks.length}</Badge>
      </div>
      
      {tasks.length === 0 ? (
        <div className="flex items-center justify-center h-full text-mrz-text-muted">
          <p>Aucune tâche</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}