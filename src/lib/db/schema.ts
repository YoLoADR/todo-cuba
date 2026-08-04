import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Priorité d'une tâche.
 * - low: faible priorité
 * - medium: priorité normale (défaut)
 * - high: haute priorité
 * - urgent: priorité maximale
 */
export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

/**
 * Statut d'une tâche (colonne Kanban).
 * - backlog: Backlog (à trier)
 * - todo: À faire
 * - in-progress: En cours
 * - done: Terminé
 */
export const STATUSES = ["backlog", "todo", "in-progress", "done"] as const;
export type Status = (typeof STATUSES)[number];

/**
 * Catégories suggérées (l'utilisateur peut saisir du texte libre).
 */
export const SUGGESTED_CATEGORIES = [
  "Travail",
  "Personnel",
  "Courses",
  "Santé",
  "Autre",
] as const;

/**
 * Table des tâches.
 *
 * Champs :
 * - id : identifiant unique (UUID v4)
 * - title : titre de la tâche (1-200 caractères, requis)
 * - description : description optionnelle (max 2000 caractères)
 * - priority : niveau d'urgence (low/medium/high/urgent, défaut medium)
 * - category : catégorie libre (nullable)
 * - status : colonne Kanban (backlog/todo/in-progress/done, défaut todo)
 * - dueDate : date d'échéance au format ISO 8601 (nullable)
 * - position : ordre dans la colonne Kanban (défaut 0)
 * - createdAt : date de création (ISO 8601 datetime)
 * - updatedAt : date de dernière modification (ISO 8601 datetime)
 */
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority", { enum: PRIORITIES }).notNull().default("medium"),
  category: text("category"),
  status: text("status", { enum: STATUSES }).notNull().default("todo"),
  dueDate: text("due_date"),
  position: integer("position").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

/**
 * Type inféré pour une tâche (select).
 */
export type Task = typeof tasks.$inferSelect;

/**
 * Type inféré pour l'insertion d'une tâche.
 */
export type NewTask = typeof tasks.$inferInsert;