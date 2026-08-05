import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "@/app/api/tasks/route";
import { getDb, resetDb } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";

/**
 * Tests d'intégration API — GET /api/tasks (liste avec filtres)
 * Issue #8 — US-1: CRUD — Lister les tâches
 */
describe("GET /api/tasks — liste des tâches", () => {
  beforeEach(async () => {
    resetDb();
    const db = await getDb();
    await db.delete(tasks);
  });

  it("retourne un tableau vide quand il n'y a pas de tâches → 200", async () => {
    const req = new Request("http://localhost/api/tasks");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });

  it("retourne toutes les tâches triées par status puis position → 200", async () => {
    const db = await getDb();
    const now = new Date().toISOString();

    // Insert tasks in reverse order to verify sorting
    await db.insert(tasks).values([
      { id: crypto.randomUUID(), title: "Tâche backlog", status: "backlog", position: 1, priority: "medium", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "Tâche done", status: "done", position: 0, priority: "medium", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "Tâche todo", status: "todo", position: 0, priority: "medium", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "Tâche in-progress", status: "in-progress", position: 0, priority: "medium", createdAt: now, updatedAt: now },
    ]);

    const req = new Request("http://localhost/api/tasks");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(4);
    // Expected order: backlog > todo > in-progress > done
    expect(data[0].status).toBe("backlog");
    expect(data[1].status).toBe("todo");
    expect(data[2].status).toBe("in-progress");
    expect(data[3].status).toBe("done");
  });

  it("filtre par status → 200", async () => {
    const db = await getDb();
    const now = new Date().toISOString();

    await db.insert(tasks).values([
      { id: crypto.randomUUID(), title: "Tâche A", status: "todo", position: 0, priority: "medium", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "Tâche B", status: "done", position: 0, priority: "medium", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "Tâche C", status: "todo", position: 1, priority: "medium", createdAt: now, updatedAt: now },
    ]);

    const req = new Request("http://localhost/api/tasks?status=todo");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data.every((t: { status: string }) => t.status === "todo")).toBe(true);
  });

  it("filtre par priority → 200", async () => {
    const db = await getDb();
    const now = new Date().toISOString();

    await db.insert(tasks).values([
      { id: crypto.randomUUID(), title: "Tâche urgente", status: "todo", position: 0, priority: "urgent", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "Tâche normale", status: "todo", position: 1, priority: "medium", createdAt: now, updatedAt: now },
    ]);

    const req = new Request("http://localhost/api/tasks?priority=urgent");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].priority).toBe("urgent");
  });

  it("filtre par category → 200", async () => {
    const db = await getDb();
    const now = new Date().toISOString();

    await db.insert(tasks).values([
      { id: crypto.randomUUID(), title: "Tâche travail", status: "todo", position: 0, priority: "medium", category: "Travail", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "Tâche perso", status: "todo", position: 1, priority: "medium", category: "Personnel", createdAt: now, updatedAt: now },
    ]);

    const req = new Request("http://localhost/api/tasks?category=Travail");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].category).toBe("Travail");
  });

  it("recherche texte (q) sur title → 200", async () => {
    const db = await getDb();
    const now = new Date().toISOString();

    await db.insert(tasks).values([
      { id: crypto.randomUUID(), title: "Acheter du lait", status: "todo", position: 0, priority: "medium", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "Préparer réunion", status: "todo", position: 1, priority: "medium", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "Acheter du pain", status: "todo", position: 2, priority: "medium", createdAt: now, updatedAt: now },
    ]);

    const req = new Request("http://localhost/api/tasks?q=Acheter");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data.every((t: { title: string }) => t.title.includes("Acheter"))).toBe(true);
  });

  it("recherche texte (q) sur description → 200", async () => {
    const db = await getDb();
    const now = new Date().toISOString();

    await db.insert(tasks).values([
      { id: crypto.randomUUID(), title: "Tâche 1", description: "faire les courses", status: "todo", position: 0, priority: "medium", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "Tâche 2", description: "appeler le médecin", status: "todo", position: 1, priority: "medium", createdAt: now, updatedAt: now },
    ]);

    const req = new Request("http://localhost/api/tasks?q=médecin");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("Tâche 2");
  });

  it("combine plusieurs filtres → 200", async () => {
    const db = await getDb();
    const now = new Date().toISOString();

    await db.insert(tasks).values([
      { id: crypto.randomUUID(), title: "Bug critique", status: "todo", position: 0, priority: "urgent", category: "Travail", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "Bug mineur", status: "todo", position: 1, priority: "low", category: "Travail", createdAt: now, updatedAt: now },
      { id: crypto.randomUUID(), title: "Courses urgentes", status: "in-progress", position: 0, priority: "urgent", category: "Personnel", createdAt: now, updatedAt: now },
    ]);

    const req = new Request("http://localhost/api/tasks?priority=urgent&category=Travail");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("Bug critique");
  });

  it("retourne 400 si le query param priority est invalide", async () => {
    const req = new Request("http://localhost/api/tasks?priority=invalid");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("retourne 400 si le query param status est invalide", async () => {
    const req = new Request("http://localhost/api/tasks?status=invalid");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
