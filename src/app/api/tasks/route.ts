import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { createTaskSchema, taskFiltersSchema } from "@/lib/validations/task";
import { eq, like, and, asc, or, sql } from "drizzle-orm";

/**
 * GET /api/tasks — Liste les tâches avec filtres optionnels.
 *
 * Query params supportés :
 * - priority : filtre par priorité (low/medium/high/urgent)
 * - status : filtre par statut (backlog/todo/in-progress/done)
 * - category : filtre par catégorie
 * - q : recherche texte sur title et description (LIKE)
 *
 * Tri : par status (backlog > todo > in-progress > done) puis position croissante.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const rawFilters = {
    priority: searchParams.get("priority") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    q: searchParams.get("q") ?? undefined,
  };

  const parsed = taskFiltersSchema.safeParse(rawFilters);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Filtres invalides";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { priority, status, category, q } = parsed.data;

  const db = getDb();
  const conditions = [];

  if (priority) {
    conditions.push(eq(tasks.priority, priority));
  }
  if (status) {
    conditions.push(eq(tasks.status, status));
  }
  if (category) {
    conditions.push(eq(tasks.category, category));
  }
  if (q) {
    const searchPattern = `%${q}%`;
    conditions.push(
      or(
        like(tasks.title, searchPattern),
        sql`${tasks.description} LIKE ${searchPattern}`
      )
    );
  }

  // Tri: status (backlog=0, todo=1, in-progress=2, done=3) puis position
  const statusOrder = sql<number>`
    CASE ${tasks.status}
      WHEN 'backlog' THEN 0
      WHEN 'todo' THEN 1
      WHEN 'in-progress' THEN 2
      WHEN 'done' THEN 3
      ELSE 4
    END
  `;

  const result = await db
    .select()
    .from(tasks)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(statusOrder), asc(tasks.position));

  return NextResponse.json(result);
}

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