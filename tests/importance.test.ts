import { mkdtempSync, rmSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { applyMigrations, openDatabase } from '../server/db/database'
import { taskRepository } from '../server/domain/tasks'
import { categoryRepository } from '../server/domain/categories'
import { emptyFilters, isCivilDate, isOverdue, localCivilDate, selectTasks } from '../shared/task-selection'
import type { Task } from '../shared/types/task'
let directory: string
let connection: ReturnType<typeof openDatabase>
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'mytodo-importance-'))
  connection = openDatabase(join(directory, 'tasks.sqlite'))
  applyMigrations(connection)
})
afterEach(() => {
  connection.close()
  rmSync(directory, { recursive: true, force: true })
})
it.each([1, 2])('migre depuis %i migrations avec données et associations préservées', (count) => {
  const folder = join(directory, 'old')
  mkdirSync(join(folder, 'meta'), { recursive: true })
  const journal = JSON.parse(readFileSync('migrations/meta/_journal.json', 'utf8'))
  journal.entries = journal.entries.slice(0, count)
  for (const entry of journal.entries) writeFileSync(join(folder, `${entry.tag}.sql`), readFileSync(`migrations/${entry.tag}.sql`))
  writeFileSync(join(folder, 'meta/_journal.json'), JSON.stringify(journal))
  connection.close()
  connection = openDatabase(join(directory, 'old.sqlite'))
  applyMigrations(connection, folder)
  connection.sqlite.exec("INSERT INTO tasks (id,title,completed,created_at) VALUES ('a','Actif',0,10),('b','Terminé',1,20)")
  if (count === 2) {
    connection.sqlite.exec("INSERT INTO categories VALUES ('c','Maison','maison'); UPDATE tasks SET category_id = 'c'")
  }
  const before = connection.sqlite.prepare('SELECT * FROM tasks ORDER BY id').all() as Record<string, unknown>[]
  applyMigrations(connection)
  applyMigrations(connection)
  connection.close()
  connection = openDatabase(join(directory, 'old.sqlite'))
  expect(connection.sqlite.prepare('SELECT * FROM tasks ORDER BY id').all()).toEqual(before.map(row => ({ ...row, category_id: count === 2 ? 'c' : null, priority: null, due_date: null })))
  if (count === 2) expect(categoryRepository(connection).list()).toEqual([{ id: 'c', name: 'Maison' }])
})
it('défauts nuls, modification, retrait et conservation par titre/état/catégorie', () => {
  const repo = taskRepository(connection)
  const original = repo.create({ title: 'Original' })
  expect(original).toMatchObject({ priority: null, dueDate: null })
  const cat = categoryRepository(connection).create({ name: 'Maison' })
  const enriched = repo.update(original.id, { categoryId: cat.id, priority: 'high', dueDate: '2000-02-29' })
  expect(enriched).toEqual({ ...original, categoryId: cat.id, priority: 'high', dueDate: '2000-02-29' })
  for (const completed of [true, false]) expect(repo.update(original.id, { completed, title: 'Renommé' })).toEqual({ ...enriched, title: 'Renommé', completed })
  for (const priority of ['low', 'normal', 'high'] as const) expect(repo.update(original.id, { priority }).dueDate).toBe('2000-02-29')
  expect(repo.update(original.id, { priority: null, dueDate: null })).toMatchObject({ priority: null, dueDate: null, categoryId: cat.id })
})
it.each(['1900-02-29', '2026-02-29', '2026-02-31', '2026-04-31', '2026-00-01', '2026-13-01', '2026-01-00', '0000-01-01', '2026-1-01', '2026-01-01T00:00:00Z', '', 2, {}, true])('refuse atomiquement date %j', (dueDate) => {
  const repo = taskRepository(connection)
  const task = repo.create({ title: 'Original' })
  expect(() => repo.update(task.id, { title: 'Interdit', priority: 'high', dueDate })).toThrow('Date limite invalide')
  expect(repo.list()).toEqual([task])
})
it.each(['urgent', '', false, 2, {}, [], undefined])('refuse atomiquement priorité %j', (priority) => {
  const repo = taskRepository(connection)
  const task = repo.create({ title: 'Original' })
  expect(() => repo.update(task.id, { title: 'Interdit', dueDate: '2026-01-01', priority })).toThrow('Priorité invalide')
  expect(repo.list()).toEqual([task])
})
it('contraintes SQL ciblées de priorité et format civil', () => {
  const task = taskRepository(connection).create({ title: 'SQL' })
  for (const priority of ['urgent', '1', '']) expect(() => connection.sqlite.prepare('UPDATE tasks SET priority = ? WHERE id = ?').run(priority, task.id)).toThrow(/CHECK constraint failed/)
  for (const date of ['2026-1-01', 'abcd-12-01', '2026-01-01T00:00Z', '']) expect(() => connection.sqlite.prepare('UPDATE tasks SET due_date = ? WHERE id = ?').run(date, task.id)).toThrow(/CHECK constraint failed/)
})
it('valide le calendrier grégorien sans normalisation', () => {
  for (const date of ['0001-01-01', '2000-02-29', '2024-02-29', '1900-02-28', '9999-12-31']) expect(isCivilDate(date)).toBe(true)
})
it('sélection par intersection, valeurs absentes distinctes et ordre stable', () => {
  const base: Task = { id: 'a', title: 'A', completed: false, createdAt: 1, categoryId: null, priority: null, dueDate: null }
  const tasks: Task[] = [base, { ...base, id: 'b', categoryId: 'maison', priority: 'high', dueDate: '2026-11-09' }, { ...base, id: 'c', categoryId: 'maison', priority: 'high', dueDate: '2026-11-10' }, { ...base, id: 'd', completed: true, priority: 'high', dueDate: '2026-11-09' }, { ...base, id: 'e', dueDate: '2026-11-11' }]
  const filters = emptyFilters()
  const ids = (f = filters) => selectTasks(tasks, f, '2026-11-10').map(t => t.id)
  expect(ids()).toEqual(['a', 'b', 'c', 'd', 'e'])
  expect(ids({ ...filters, category: 'maison', priority: 'high', due: 'overdue' })).toEqual(['b'])
  expect(ids({ ...filters, category: 'none', priority: 'none', due: 'none' })).toEqual(['a'])
  expect(ids({ ...filters, due: 'today' })).toEqual(['c'])
  expect(ids({ ...filters, due: 'exact', date: '2026-11-09' })).toEqual(['b', 'd'])
  expect(ids({ ...filters, due: 'exact', date: '' })).toEqual([])
  expect(isOverdue(tasks[3]!, '2026-11-10')).toBe(false)
  expect(isOverdue({ ...tasks[3]!, completed: false }, '2026-11-10')).toBe(true)
  expect(isOverdue(tasks[2]!, '2026-11-11')).toBe(true)
})
it('construit le jour local avec ses composantes, sans passer par UTC', () => {
  const date = new Date(2026, 10, 10, 0, 15)
  date.toISOString = () => { throw new Error('UTC interdit') }
  expect(localCivilDate(date)).toBe('2026-11-10')
})
it('refuse une catégorie disparue avec brouillon enrichi sans écriture partielle', () => {
  const repo = taskRepository(connection)
  const category = categoryRepository(connection).create({ name: 'Disparue' })
  const task = repo.create({ title: 'Avant' })
  categoryRepository(connection).remove(category.id)
  expect(() => repo.update(task.id, { title: 'Après', categoryId: category.id, priority: 'high', dueDate: '2024-02-29' })).toThrow('catégorie choisie est absente')
  expect(repo.list()).toEqual([task])
})
