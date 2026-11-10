import { mkdtempSync, rmSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fork } from 'node:child_process'
import { once } from 'node:events'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { applyMigrations, openDatabase } from '../server/db/database'
import { categoryRepository, DuplicateCategory } from '../server/domain/categories'
import { MissingTaskCategory, taskRepository } from '../server/domain/tasks'

let directory: string
let connection: ReturnType<typeof openDatabase>
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'mytodo-categories-'))
  connection = openDatabase(join(directory, 'tasks.sqlite'))
  applyMigrations(connection)
})
afterEach(() => {
  connection.close()
  rmSync(directory, { recursive: true, force: true })
})
it('migre une vraie base 0000 peuplée sans changer ses champs historiques', () => {
  const folder = join(directory, 'old')
  mkdirSync(join(folder, 'meta'), { recursive: true })
  writeFileSync(join(folder, '0000_tasks.sql'), readFileSync('migrations/0000_tasks.sql'))
  const journal = JSON.parse(readFileSync('migrations/meta/_journal.json', 'utf8'))
  journal.entries = journal.entries.slice(0, 1)
  writeFileSync(join(folder, 'meta/_journal.json'), JSON.stringify(journal))
  connection.close()
  connection = openDatabase(join(directory, 'old.sqlite'))
  applyMigrations(connection, folder)
  connection.sqlite.exec("INSERT INTO tasks (id, title, completed, created_at) VALUES ('a', 'Actif', 0, 10), ('b', 'Terminé', 1, 20)")
  const before = connection.sqlite.prepare('SELECT * FROM tasks ORDER BY id').all()
  applyMigrations(connection)
  applyMigrations(connection)
  expect(connection.sqlite.prepare('SELECT id,title,completed,created_at FROM tasks ORDER BY id').all()).toEqual(before)
  expect(taskRepository(connection).list().every(task => task.categoryId === null)).toBe(true)
  expect(connection.sqlite.pragma('foreign_keys', { simple: true })).toBe(1)
  expect(() => connection.sqlite.exec("UPDATE tasks SET category_id = 'absente' WHERE id = 'a'")).toThrow(/FOREIGN KEY/)
})
it.each([null, {}, [], { name: '' }, { name: ' \u2003\t ' }, { name: '\0' }, { name: 2 }, { name: 'A', extra: true }])('refuse %j sans écriture', (input) => {
  expect(() => categoryRepository(connection).create(input)).toThrow()
  expect(categoryRepository(connection).list()).toEqual([])
})
it('normalise Unicode, espaces et casse ; conserve accents, ponctuation et casse affichée', () => {
  const repo = categoryRepository(connection)
  const first = repo.create({ name: ' \u2003ÉTUDES\u0085  du\tsoir ' })
  expect(first.name).toBe('ÉTUDES du soir')
  expect(() => repo.create({ name: 'e\u0301tudes du soir' })).toThrow(DuplicateCategory)
  expect(repo.update(first.id, { name: 'études du soir' })).toEqual({ ...first, name: 'études du soir' })
  repo.create({ name: 'Etudes du soir' })
  repo.create({ name: 'études-du-soir' })
  const other = repo.create({ name: 'Maison' })
  expect(() => repo.update(other.id, { name: 'ÉTUDES du soir' })).toThrow(DuplicateCategory)
  expect(repo.list().find(c => c.id === other.id)?.name).toBe('Maison')
})
it('arbitre deux créations concurrentes sur deux connexions à la même base', async () => {
  const children = ['ÉTUDES', 'e\u0301tudes'].map(name => fork(new URL('./fixtures/create-category.ts', import.meta.url), [join(directory, 'tasks.sqlite'), name], { execArgv: ['--import', 'tsx'], stdio: ['ignore', 'ignore', 'inherit', 'ipc'] }))
  try {
    await Promise.all(children.map(child => once(child, 'message')))
    const results = children.map(child => once(child, 'message'))
    const exits = children.map(child => once(child, 'exit'))
    children.forEach(child => child.send('go'))
    expect((await Promise.all(results)).map(([result]) => result).sort()).toEqual(['created', 'duplicate'])
    await Promise.all(exits)
    expect(categoryRepository(connection).list()).toHaveLength(1)
  }
  finally { children.forEach(child => child.kill()) }
})
it('classe, déplace, retire ; refuse atomiquement une catégorie disparue sans confondre la tâche', () => {
  const cats = categoryRepository(connection)
  const repo = taskRepository(connection)
  const a = cats.create({ name: 'Maison' })
  const b = cats.create({ name: 'Travail' })
  const task = repo.create({ title: 'Original' })
  expect(task.categoryId).toBeNull()
  const classified = repo.update(task.id, { categoryId: a.id })
  expect(classified).toEqual({ ...task, categoryId: a.id })
  expect(repo.update(task.id, { categoryId: b.id })).toEqual({ ...task, categoryId: b.id })
  expect(repo.update(task.id, { categoryId: null })).toEqual(task)
  cats.remove(b.id)
  expect(() => repo.update(task.id, { title: 'Partiel interdit', categoryId: b.id })).toThrow(MissingTaskCategory)
  expect(repo.list()).toEqual([task])
  expect(() => repo.update(task.id, { categoryId: 42 })).toThrow('Identifiant invalide')
})
it('renomme sans perdre les associations puis déclasse actives et terminées de manière persistante', () => {
  const cats = categoryRepository(connection)
  const repo = taskRepository(connection)
  const category = cats.create({ name: 'Maison' })
  for (const completed of [false, true]) {
    const task = repo.create({ title: `Tâche ${completed}` })
    repo.update(task.id, { categoryId: category.id, completed })
  }
  const before = repo.list()
  cats.update(category.id, { name: 'Logement' })
  expect(repo.list()).toEqual(before)
  cats.remove(category.id)
  connection.close()
  connection = openDatabase(join(directory, 'tasks.sqlite'))
  expect(connection.sqlite.pragma('foreign_keys', { simple: true })).toBe(1)
  expect(taskRepository(connection).list()).toEqual(before.map(task => ({ ...task, categoryId: null })))
  expect(categoryRepository(connection).list()).toEqual([])
  expect(() => categoryRepository(connection).update(category.id, { name: 'Absent' })).toThrow('absente')
  expect(() => categoryRepository(connection).remove(category.id)).toThrow('absente')
})
