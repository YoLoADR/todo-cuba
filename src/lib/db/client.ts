import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as schema from "./schema";

/**
 * Chemin de la base de données SQLite.
 * Configurable via DB_PATH, sinon ./data/todo.db par défaut.
 * En serverless (Netlify), le filesystem est en lecture seule sauf /tmp:
 * on utilise /tmp/todo.db pour pouvoir écrire.
 */
const DB_PATH = process.env.DB_PATH ?? (
  process.env.NETLIFY
    ? "/tmp/todo.db"
    : resolve(process.cwd(), "data/todo.db")
);

/**
 * S'assure que le répertoire parent existe.
 */
function ensureDirExists(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Retourne l'instance singleton de la base de données Drizzle.
 *
 * La connexion est créée à la première appel et réutilisée ensuite.
 * En mode test, on utilise une base en mémoire (in-memory) pour l'isolation.
 *
 * @returns Instance Drizzle ORM connectée à SQLite.
 */
export function getDb() {
  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    if (!dbInstance) {
      const sqlite = new Database(":memory:");
      sqlite.pragma("journal_mode = WAL");
      dbInstance = drizzle(sqlite, { schema });
      // Run migrations for in-memory DB
      createSchema(sqlite);
    }
    return dbInstance;
  }

  if (!dbInstance) {
    ensureDirExists(DB_PATH);
    const sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    dbInstance = drizzle(sqlite, { schema });
    // En serverless (Netlify), le FS est éphémère: initialiser le schéma + seed
    // à chaque cold start car /tmp est propre à l'instance Lambda.
    if (process.env.NETLIFY) {
      createSchema(sqlite);
      seedIfEmpty(sqlite);
    }
  }
  return dbInstance;
}

/**
 * Crée le schéma directement via SQL (utilisé pour la DB en mémoire en tests).
 */
function createSchema(sqlite: Database.Database): void {
  sqlite.exec(`
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
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
  `);
}

/**
 * Insère des tâches de démo si la table est vide (serverless cold start).
 */
function seedIfEmpty(sqlite: Database.Database): void {
  const row = sqlite.prepare("SELECT COUNT(*) as cnt FROM tasks").get() as { cnt: number };
  if (row.cnt > 0) return;

  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const demoTasks = [
    { id: crypto.randomUUID(), title: "Préparer le rapport Q3", description: "Finaliser et envoyer le rapport trimestriel", priority: "high", category: "Travail", status: "todo", due_date: dueDate, position: 0 },
    { id: crypto.randomUUID(), title: "Acheter du lait", description: "Penser au lait d'amande", priority: "low", category: "Courses", status: "todo", due_date: null, position: 1 },
    { id: crypto.randomUUID(), title: "Réviser le design system", description: "Vérifier la conformité Merenza", priority: "medium", category: "Travail", status: "in-progress", due_date: null, position: 0 },
    { id: crypto.randomUUID(), title: "Réservation dentiste", description: "Appeler pour rendez-vous", priority: "medium", category: "Santé", status: "done", due_date: null, position: 0 },
  ];

  const stmt = sqlite.prepare(`
    INSERT INTO tasks (id, title, description, priority, category, status, due_date, position)
    VALUES (@id, @title, @description, @priority, @category, @status, @due_date, @position)
  `);
  for (const t of demoTasks) stmt.run(t);
}

/**
 * Réinitialise l'instance (utile pour les tests).
 */
export function resetDb(): void {
  dbInstance = null;
}

/**
 * Initialise la base de données de développement en créant le schéma.
 */
export function initDevDb(): void {
  ensureDirExists(DB_PATH);
  const sqlite = new Database(DB_PATH);
  createSchema(sqlite);
  sqlite.close();
  console.log(`Database initialized at ${DB_PATH}`);
}