import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "@/app/api/tasks/route";
import { getDb } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { resetDb } from "@/lib/db/client";

/**
 * Tests d'intégration API — POST /api/tasks
 * Issue #7 — US-1: CRUD — Créer une tâche
 */
describe("POST /api/tasks — création d'une tâche", () => {
  beforeEach(() => {
    // Réinitialise la DB en mémoire avant chaque test pour l'isolation
    resetDb();
    // Nettoie la table (au cas où le singleton n'a pas été reset)
    const db = getDb();
    db.delete(tasks).run();
  });

  it("crée une tâche avec un titre uniquement → 201, status todo, priority medium", async () => {
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "Acheter du lait" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.id).toBeDefined();
    expect(data.title).toBe("Acheter du lait");
    expect(data.status).toBe("todo");
    expect(data.priority).toBe("medium");
    expect(data.position).toBe(0);
    expect(data.createdAt).toBeDefined();
    expect(data.updatedAt).toBeDefined();
  });

  it("crée une tâche avec tous les champs → 201, tous présents", async () => {
    const payload = {
      title: "Préparer la réunion",
      description: "Slides + ordre du jour",
      priority: "high",
      category: "Travail",
      dueDate: "2026-12-31",
    };
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.title).toBe("Préparer la réunion");
    expect(data.description).toBe("Slides + ordre du jour");
    expect(data.priority).toBe("high");
    expect(data.category).toBe("Travail");
    expect(data.dueDate).toBe("2026-12-31");
    expect(data.status).toBe("todo");
    expect(data.position).toBe(0);
  });

  it("retourne 400 si le titre est vide", async () => {
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("retourne 400 si le titre ne contient que des espaces", async () => {
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "     " }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("retourne 400 si le titre dépasse 200 caractères", async () => {
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "x".repeat(201) }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("retourne 400 si la priorité est invalide", async () => {
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "Tâche", priority: "urgent" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("retourne 400 si la description dépasse 2000 caractères", async () => {
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "Tâche", description: "x".repeat(2001) }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});