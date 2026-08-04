import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { updateTaskSchema } from "@/lib/validations/task";
import { eq } from "drizzle-orm";

/**
 * GET /api/tasks/:id — Récupère une tâche par son ID.
 *
 * Retourne 200 avec la tâche, ou 404 si non trouvée.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, id),
  });

  if (!task) {
    return NextResponse.json(
      { error: "Tâche non trouvée" },
      { status: 404 }
    );
  }

  return NextResponse.json(task);
}

/**
 * PATCH /api/tasks/:id — Met à jour partiellement une tâche.
 *
 * Body validé avec updateTaskSchema (tous les champs optionnels).
 * Met à jour updatedAt automatiquement.
 * Retourne 200 avec la tâche mise à jour, 404 si non trouvée, 400 si body invalide.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Le corps de la requête doit être du JSON valide" },
      { status: 400 }
    );
  }

  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Données invalides";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const db = getDb();

  // Vérifie que la tâche existe
  const existing = await db.query.tasks.findFirst({
    where: eq(tasks.id, id),
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Tâche non trouvée" },
      { status: 404 }
    );
  }

  const updateData = parsed.data;
  const now = new Date().toISOString();

  const [updated] = await db
    .update(tasks)
    .set({
      ...updateData,
      updatedAt: now,
    })
    .where(eq(tasks.id, id))
    .returning();

  return NextResponse.json(updated);
}

/**
 * DELETE /api/tasks/:id — Supprime une tâche.
 *
 * Retourne 204 si supprimée, 404 si non trouvée.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const existing = await db.query.tasks.findFirst({
    where: eq(tasks.id, id),
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Tâche non trouvée" },
      { status: 404 }
    );
  }

  await db.delete(tasks).where(eq(tasks.id, id));

  return new NextResponse(null, { status: 204 });
}
