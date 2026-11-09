import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { tasks } from './schema'

export function openDatabase(path: string) {
  mkdirSync(dirname(path), { recursive: true })
  const sqlite = new Database(path)
  sqlite.pragma('busy_timeout = 5000')
  const db = drizzle(sqlite, { schema: { tasks } })
  return { db, sqlite, close: () => sqlite.close() }
}

export function applyMigrations(connection: ReturnType<typeof openDatabase>, folder = resolve('migrations')) {
  migrate(connection.db, { migrationsFolder: folder })
}
