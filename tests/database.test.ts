import { mkdtempSync, rmSync, symlinkSync, mkdirSync } from 'node:fs'
import { tmpdir, homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { applyMigrations, openDatabase } from '../server/db/database'
import { databasePath } from '../server/db/config'
import { taskRepository } from '../server/domain/tasks'

let directory: string
let connection: ReturnType<typeof openDatabase>
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'mytodo-unit-'))
  connection = openDatabase(join(directory, 'tasks.sqlite'))
  applyMigrations(connection)
})
afterEach(() => {
  if (connection.sqlite.open) connection.close()
  rmSync(directory, { recursive: true, force: true })
})

describe('persistance SQLite', () => {
  it('migre une base vierge, remigre sans perte et relit après fermeture', () => {
    const created = taskRepository(connection).create({ title: '  Acheter du pain  ' })
    expect(created.title).toBe('Acheter du pain')
    expect(created.completed).toBe(false)
    applyMigrations(connection)
    connection.close()
    connection = openDatabase(join(directory, 'tasks.sqlite'))
    expect(taskRepository(connection).list()).toEqual([created])
  })
  it.each(['', ' ', '\t\r\n', '\u00a0\u2003', '\0'])('contraint aussi le titre SQL %j', (title) => {
    expect(() => connection.sqlite.prepare('INSERT INTO tasks VALUES (?, ?, 0, 1)').run('id', title)).toThrow()
  })
  it('impose les états booléens', () => {
    expect(() => connection.sqlite.prepare('INSERT INTO tasks VALUES (?, ?, 2, 1)').run('id', 'Titre')).toThrow()
  })
  it('trie par création décroissante puis identifiant', () => {
    const insert = connection.sqlite.prepare('INSERT INTO tasks VALUES (?, ?, 0, ?)')
    insert.run('a', 'Premier', 1)
    insert.run('b', 'Égalité B', 2)
    insert.run('c', 'Égalité C', 2)
    expect(taskRepository(connection).list().map(task => task.id)).toEqual(['c', 'b', 'a'])
  })
})

describe('chemins isolés', () => {
  it('sépare les défauts développement/personnel et exige un chemin de test', () => {
    const dev = databasePath({}, directory)
    const personal = databasePath({ MYTODO_DATA_MODE: 'personal' }, directory)
    const test = databasePath({ MYTODO_DATA_MODE: 'test', MYTODO_DB_PATH: join(directory, 'test.sqlite') }, directory)
    expect(dev).toBe(join(directory, '.data/development/tasks.sqlite'))
    expect(personal).toBe(resolve(homedir(), '.local/share/my-todo/tasks.sqlite'))
    expect(new Set([dev, personal, test]).size).toBe(3)
    expect(() => databasePath({ MYTODO_DATA_MODE: 'test' }, directory)).toThrow()
    expect(() => databasePath({ MYTODO_DATA_MODE: 'test', MYTODO_DB_PATH: 'relative.sqlite' }, directory)).toThrow()
  })
  it('refuse les ressources HTTP et une base personnelle dans Git', () => {
    for (const path of ['public/tasks.sqlite', '.output/public/tasks.sqlite', 'app/tasks.sqlite']) {
      expect(() => databasePath({ MYTODO_DB_PATH: path }, directory)).toThrow()
    }
    expect(() => databasePath({ MYTODO_DATA_MODE: 'personal', MYTODO_DB_PATH: join(directory, 'tasks.sqlite') }, directory)).toThrow()
    mkdirSync(join(directory, 'public'))
    symlinkSync(join(directory, 'public'), join(directory, 'linked'))
    expect(() => databasePath({ MYTODO_DB_PATH: 'linked/tasks.sqlite' }, directory)).toThrow()
  })
})
