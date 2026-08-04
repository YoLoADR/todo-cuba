"use client";

import { useCallback } from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PRIORITIES, STATUSES } from "@/lib/db/schema";
import type { TaskFilters as TaskFiltersType } from "@/lib/validations/task";

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFilterChange: (filters: TaskFiltersType) => void;
  onReset: () => void;
}

const PRIORITY_OPTIONS = [
  { value: "", label: "Toutes" },
  ...PRIORITIES.map((p) => ({ value: p, label: p })),
];

const STATUS_OPTIONS = [
  { value: "", label: "Tous" },
  ...STATUSES.map((s) => ({ value: s, label: s })),
];

export function TaskFilters({ filters, onFilterChange, onReset }: TaskFiltersProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({ ...filters, q: e.target.value || undefined });
    },
    [filters, onFilterChange],
  );

  const handlePriorityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onFilterChange({
        ...filters,
        priority: (value || undefined) as TaskFiltersType["priority"],
      });
    },
    [filters, onFilterChange],
  );

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onFilterChange({
        ...filters,
        status: (value || undefined) as TaskFiltersType["status"],
      });
    },
    [filters, onFilterChange],
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Input
        label="Recherche"
        type="search"
        icon={Search}
        value={filters.q ?? ""}
        onChange={handleSearchChange}
        placeholder="Rechercher..."
      />
      <Select
        label="Priorité"
        options={PRIORITY_OPTIONS}
        value={filters.priority ?? ""}
        onChange={handlePriorityChange}
      />
      <Select
        label="Statut"
        options={STATUS_OPTIONS}
        value={filters.status ?? ""}
        onChange={handleStatusChange}
      />
      <Button variant="ghost" icon={RotateCcw} onClick={onReset}>
        Réinitialiser
      </Button>
    </div>
  );
}
