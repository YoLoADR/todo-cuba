import { describe, it, expect, beforeEach } from "vitest";
import { GET, PATCH, DELETE } from "@/app/api/tasks/[id]/route";
import { getDb, resetDb } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Tests d'intégration API — GET/PATCH/DELETE /api/tasks/:id
 * Issue #9 — US-1: CRUD — Lire, modifier, supprimer une tâche
 */
describe("GET /api/tasks/:id — lecture d'une tâche", () => {
  beforeEach(async () => {
    resetDb();
    const db = await getDb();
    await db.delete(tasks);
  });

  it("retourne la tâche si elle existe → 200", async () => {
    const db = await getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.insert(tasks).values({
      id,
      title: "Ma tâche",
      status: "todo",
      priority: "medium",
      position: 0,
      createdAt: now,
      updatedAt: now,
    });

    const req = new Request(`http://localhost/api/tasks/${id}`);
    const res = await GET(req, { params: Promise.resolve({ id }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe(id);
    expect(data.title).toBe("Ma tâche");
  });

  it("retourne 404 si la tâche n'existe pas", async () => {
    const fakeId = crypto.randomUUID();
    const req = new Request(`http://localhost/api/tasks/${fakeId}`);
    const res = await GET(req, { params: Promise.resolve({ id: fakeId }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBeDefined();
  });
});

describe("PATCH /api/tasks/:id — mise à jour partielle", () => {
  beforeEach(async () => {
    resetDb();
    const db = await getDb();
    await db.delete(tasks);
  });

  it("met à jour le titre → 200", async () => {
    const db = await getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.insert(tasks).values({
      id,
      title: "Ancien titre",
      status: "todo",
      priority: "medium",
      position: 0,
      createdAt: now,
      updatedAt: now,
    });

    const req = new Request(`http://localhost/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title: "Nouveau titre" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.title).toBe("Nouveau titre");
    expect(data.id).toBe(id);
    // updatedAt should be more recent
    expect(new Date(data.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(now).getTime());
  });

  it("met à jour le status → 200", async () => {
    const db = await getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.insert(tasks).values({
      id,
      title: "Tâche",
      status: "todo",
      priority: "medium",
      position: 0,
      createdAt: now,
      updatedAt: now,
    });

    const req = new Request(`http://localhost/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "in-progress" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("in-progress");
  });

  it("met à jour plusieurs champs → 200", async () => {
    const db = await getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.insert(tasks).values({
      id,
      title: "Tâche",
      status: "todo",
      priority: "low",
      position: 0,
      createdAt: now,
      updatedAt: now,
    });

    const req = new Request(`http://localhost/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: "Tâche modifiée",
        priority: "urgent",
        status: "done",
        position: 5,
      }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.title).toBe("Tâche modifiée");
    expect(data.priority).toBe("urgent");
    expect(data.status).toBe("done");
    expect(data.position).toBe(5);
  });

  it("retourne 404 si la tâche n'existe pas", async () => {
    const fakeId = crypto.randomUUID();
    const req = new Request(`http://localhost/api/tasks/${fakeId}`, {
      method: "PATCH",
      body: JSON.stringify({ title: "Nouveau" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: fakeId }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBeDefined();
  });

  it("retourne 400 si le body est invalide (titre vide)", async () => {
    const db = await getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.insert(tasks).values({
      id,
      title: "Tâche",
      status: "todo",
      priority: "medium",
      position: 0,
      createdAt: now,
      updatedAt: now,
    });

    const req = new Request(`http://localhost/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title: "" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("retourne 400 si le body est invalide (priorité invalide)", async () => {
    const db = await getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.insert(tasks).values({
      id,
      title: "Tâche",
      status: "todo",
      priority: "medium",
      position: 0,
      createdAt: now,
      updatedAt: now,
    });

    const req = new Request(`http://localhost/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ priority: "critical" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("retourne 400 si le body n'est pas du JSON valide", async () => {
    const db = await getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.insert(tasks).values({
      id,
      title: "Tâche",
      status: "todo",
      priority: "medium",
      position: 0,
      createdAt: now,
      updatedAt: now,
    });

    const req = new Request(`http://localhost/api/tasks/${id}`, {
      method: "PATCH",
      body: "not-json",
    });
    const res = await PATCH(req, { params: Promise.resolve({ id }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});

describe("DELETE /api/tasks/:id — suppression d'une tâche", () => {
  beforeEach(async () => {
    resetDb();
    const db = await getDb();
    await db.delete(tasks);
  });

  it("supprime la tâche et retourne 204", async () => {
    const db = await getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.insert(tasks).values({
      id,
      title: "Tâche à supprimer",
      status: "todo",
      priority: "medium",
      position: 0,
      createdAt: now,
      updatedAt: now,
    });

    const req = new Request(`http://localhost/api/tasks/${id}`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id }) });

    expect(res.status).toBe(204);

    // Verify it's actually deleted
    const task = await db.query.tasks.findFirst({ where: eq(tasks.id, id) });
    expect(task).toBeUndefined();
  });

  it("retourne 404 si la tâche n'existe pas", async () => {
    const fakeId = crypto.randomUUID();
    const req = new Request(`http://localhost/api/tasks/${fakeId}`, {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: Promise.resolve({ id: fakeId }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBeDefined();
  });
});
