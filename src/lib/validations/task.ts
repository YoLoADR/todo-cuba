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