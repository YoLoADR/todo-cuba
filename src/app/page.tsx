"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { TaskFilters } from "@/components/task-filters";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import TaskForm from "@/components/task-form";
import type { Task, Status } from "@/lib/db/schema";
import type { TaskFilters as TaskFiltersType } from "@/lib/validations/task";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const buildQueryString = useCallback((f: TaskFiltersType): string => {
    const params = new URLSearchParams();
    if (f.priority) params.set("priority", f.priority);
    if (f.status) params.set("status", f.status);
    if (f.category) params.set("category", f.category);
    if (f.q) params.set("q", f.q);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, []);

  const fetchTasks = useCallback(
    async (f: TaskFiltersType) => {
      setError(null);
      try {
        const res = await fetch(`/api/tasks${buildQueryString(f)}`);
        if (!res.ok) throw new Error("Erreur lors du chargement des tâches");
        const data: Task[] = await res.json();
        setTasks(data);
      } catch {
        setError("Erreur lors du chargement des tâches");
      } finally {
        setLoading(false);
      }
    },
    [buildQueryString],
  );

  // Fetch on mount and when filters change
  /* eslint-disable react-hooks/set-state-in-effect -- fetch de données au montage et changement de filtres */
  useEffect(() => {
    fetchTasks(filters);
  }, [filters, fetchTasks]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleFilterChange = useCallback((newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters({});
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingTask(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTask(null);
  }, []);

  const handleSubmit = useCallback(
    async (data: {
      title: string;
      description?: string;
      priority?: string;
      category?: string;
      status?: string;
      dueDate?: string;
    }) => {
      if (editingTask) {
        await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      handleCloseForm();
      await fetchTasks(filters);
    },
    [editingTask, filters, fetchTasks, handleCloseForm],
  );

  const handleTaskMove = useCallback(
    async (taskId: string, newStatus: Status) => {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchTasks(filters);
    },
    [filters, fetchTasks],
  );

  const handleDelete = useCallback(
    async (taskId: string) => {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      await fetchTasks(filters);
    },
    [filters, fetchTasks],
  );

  return (
    <main className="min-h-screen p-4 md:p-8 space-y-6">
      <PageHeader
        title="Todo Cuba"
        action={
          <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
            Nouvelle tâche
          </Button>
        }
      />

      <TaskFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {error && (
        <div className="text-mrz-danger text-sm" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-mrz-text-muted">Chargement...</p>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      <TaskForm
        open={isFormOpen}
        onClose={handleCloseForm}
        initialData={editingTask ?? undefined}
        onSubmit={handleSubmit}
        mode={editingTask ? "edit" : "create"}
      />
    </main>
  );
}
