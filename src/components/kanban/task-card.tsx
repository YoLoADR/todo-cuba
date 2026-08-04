"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/db/schema";

const priorityToVariant: Record<Task["priority"], "low" | "medium" | "high"> = {
  low: "low",
  medium: "medium",
  high: "high",
  urgent: "high", // urgent utilise la même variante que high
};

const priorityColors: Record<Task["priority"], string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
  urgent: "text-red-400",
};

const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
};

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: "grab",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 mb-3 last:mb-0 bg-mrz-bg-elevated border-mrz-border"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-mrz-text-primary mb-2">{task.title}</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant={priorityToVariant[task.priority]} className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
            {task.category && (
              <Badge variant="default" className="text-mrz-text-secondary">
                {task.category}
              </Badge>
            )}
          </div>
          {task.dueDate && (
            <p className="text-sm text-mrz-text-secondary">
              Échéance: {formatDate(task.dueDate)}
            </p>
          )}
        </div>
        <div className="flex gap-2 ml-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Éditer"
              onClick={() => onEdit(task)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Supprimer"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}