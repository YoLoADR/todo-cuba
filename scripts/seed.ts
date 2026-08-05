import { createClient } from "@libsql/client";

/**
 * Script de seed — crée la base et insère des tâches de démo.
 * Usage: npm run db:seed
 */
async function seed() {
  const client = createClient({ url: "file:data/todo.db" });

  // Créer le schéma si nécessaire
  await client.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      category TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      due_date TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Vider les tâches existantes
  await client.execute("DELETE FROM tasks;");

  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const tasks = [
    {
      id: crypto.randomUUID(),
      title: "Préparer le rapport Q3",
      description: "Finaliser et envoyer le rapport trimestriel",
      priority: "high",
      category: "Travail",
      status: "todo",
      due_date: dueDate,
      position: 0,
    },
    {
      id: crypto.randomUUID(),
      title: "Acheter du lait",
      description: "Penser au lait d'amande",
      priority: "low",
      category: "Courses",
      status: "todo",
      due_date: null,
      position: 1,
    },
    {
      id: crypto.randomUUID(),
      title: "Réviser le design system",
      description: "Vérifier la conformité Merenza",
      priority: "medium",
      category: "Travail",
      status: "in-progress",
      due_date: null,
      position: 0,
    },
    {
      id: crypto.randomUUID(),
      title: "Réservation dentiste",
      description: "Appeler pour rendez-vous",
      priority: "medium",
      category: "Santé",
      status: "done",
      due_date: null,
      position: 0,
    },
  ];

  for (const task of tasks) {
    await client.execute({
      sql: `INSERT INTO tasks (id, title, description, priority, category, status, due_date, position)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [task.id, task.title, task.description, task.priority, task.category, task.status, task.due_date, task.position],
    });
  }

  console.log(`Seed terminé: ${tasks.length} tâches créées`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
