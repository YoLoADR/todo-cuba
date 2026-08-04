import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { createTaskSchema } from "@/lib/validations/task";

/**
 * POST /api/tasks — Crée une nouvelle tâche.
 *
 * Étapes :
 * 1. Parse et valide le body avec createTaskSchema (Zod v4)
 * 2. Si invalide → 400 JSON { error: message }
 * 3. Génère un UUID v4, statut "todo", position 0
 * 4. Insère en DB via Drizzle
 * 5. Retourne 201 avec la tâche créée
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Le corps de la requête doit être du JSON valide" },
      { status: 400 }
    );
  }

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Données invalides";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { title, description, priority, category, dueDate } = parsed.data;
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const db = getDb();
  const [created] = await db
    .insert(tasks)
    .values({
      id,
      title,
      description: description ?? null,
      priority,
      category: category ?? null,
      status: "todo",
      dueDate: dueDate ?? null,
      position: 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}