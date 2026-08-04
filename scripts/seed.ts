import Database from "better-sqlite3";

/**
 * Script de seed — crée la base et insère des tâches de démo.
 * Usage: npm run db:seed
 */
function seed() {
  const db = new Database("./data/todo.db");
  db.pragma("journal_mode = WAL");

  // Créer le schéma si nécessaire
  db.exec(`
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
  db.exec("DELETE FROM tasks;");

  const now = new Date().toISOString();
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

  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, description, priority, category, status, due_date, position)
    VALUES (@id, @title, @description, @priority, @category, @status, @due_date, @position)
  `);

  for (const task of tasks) {
    stmt.run(task);
  }

  console.log(`Seed terminé: ${tasks.length} tâches créées`);
  db.close();
}

seed();