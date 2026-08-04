import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as schema from "./schema";

/**
 * Chemin de la base de données SQLite.
 * Configurable via DB_PATH, sinon ./data/todo.db par défaut.
 */
const DB_PATH = process.env.DB_PATH ?? resolve(process.cwd(), "data/todo.db");

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