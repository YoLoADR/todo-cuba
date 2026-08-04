import { z } from "zod";
import { PRIORITIES, STATUSES } from "@/lib/db/schema";

/**
 * Schéma de validation Zod v4 pour le body POST /api/tasks.
 *
 * - title : requis, 1-200 caractères (trimmed), non vide
 * - description : optionnelle, max 2000 caractères
 * - priority : enum low/medium/high, défaut "medium"
 * - category : optionnelle, chaîne libre
 * - dueDate : optionnelle, format date ISO (YYYY-MM-DD)
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  description: z
    .string()
    .max(2000, "La description ne peut pas dépasser 2000 caractères")
    .optional(),
  priority: z
    .enum(PRIORITIES)
    .default("medium"),
  category: z.string().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format ISO (YYYY-MM-DD)")
    .optional(),
});

/** Type inféré pour le body validé de création de tâche. */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Schéma de validation de la réponse de l'API pour une tâche.
 * Permet de s'assurer que la réponse respecte le contrat.
 */
export const taskResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  priority: z.enum(PRIORITIES),
  category: z.string().nullable().optional(),
  status: z.enum(STATUSES),
  dueDate: z.string().nullable().optional(),
  position: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Type inféré pour la réponse d'une tâche. */
export type TaskResponse = z.infer<typeof taskResponseSchema>;

/**
 * Schéma de validation Zod v4 pour le body PATCH /api/tasks/:id.
 *
 * Tous les champs sont optionnels (partial update).
 * - title : optionnel, 1-200 caractères (trimmed)
 * - description : optionnelle, max 2000 caractères
 * - priority : optionnelle, enum PRIORITIES
 * - category : optionnelle, chaîne libre
 * - status : optionnel, enum STATUSES
 * - dueDate : optionnelle, format date ISO (YYYY-MM-DD)
 * - position : optionnel, entier
 */
export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne peut pas dépasser 200 caractères")
    .optional(),
  description: z
    .string()
    .max(2000, "La description ne peut pas dépasser 2000 caractères")
    .optional(),
  priority: z.enum(PRIORITIES).optional(),
  category: z.string().optional(),
  status: z.enum(STATUSES).optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format ISO (YYYY-MM-DD)")
    .optional(),
  position: z.number().int().optional(),
});

/** Type inféré pour le body validé de mise à jour partielle. */
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * Schéma de validation des query params pour GET /api/tasks.
 *
 * - priority : optionnel, enum PRIORITIES
 * - status : optionnel, enum STATUSES
 * - category : optionnel, chaîne libre
 * - q : optionnel, recherche texte sur title et description
 */
export const taskFiltersSchema = z.object({
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(STATUSES).optional(),
  category: z.string().optional(),
  q: z.string().optional(),
});

/** Type inféré pour les filtres de liste. */
export type TaskFilters = z.infer<typeof taskFiltersSchema>;