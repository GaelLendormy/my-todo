import { mkdtempSync, rmSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fork } from 'node:child_process'
import { once } from 'node:events'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { applyMigrations, openDatabase } from '../server/db/database'
import { taskRepository, TaskHasSteps } from '../server/domain/tasks'
import { stepRepository } from '../server/domain/task-steps'
import { categoryRepository } from '../server/domain/categories'

let directory: string
let connection: ReturnType<typeof openDatabase>
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'mytodo-steps-'))
  connection = openDatabase(join(directory, 'tasks.sqlite'))
  applyMigrations(connection)
})
afterEach(() => {
  connection.close()
  rmSync(directory, { recursive: true, force: true })
})
it.each([1, 3])('migre depuis %i migrations sans perte ni étape historique, remigre et rouvre', (count) => {
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
  if (count === 3) connection.sqlite.exec("INSERT INTO categories VALUES ('c','Maison','maison'); UPDATE tasks SET category_id='c', priority='high', due_date='2024-02-29'")
  const before = connection.sqlite.prepare('SELECT * FROM tasks ORDER BY id').all()
  applyMigrations(connection)
  applyMigrations(connection)
  connection.close()
  connection = openDatabase(join(directory, 'old.sqlite'))
  const after = connection.sqlite.prepare('SELECT * FROM tasks ORDER BY id').all()
  expect(after).toEqual(count === 3 ? before : before.map(row => ({ ...row as object, category_id: null, priority: null, due_date: null })))
  expect(taskRepository(connection).list().every(t => t.steps.length === 0)).toBe(true)
  if (count === 3) expect(categoryRepository(connection).list()).toEqual([{ id: 'c', name: 'Maison' }])
})
it('contraintes SQL titre, état, position, unicité, FK et cascade sur base vierge', () => {
  const task = taskRepository(connection).create({ title: 'Parent' })
  const insert = connection.sqlite.prepare('INSERT INTO task_steps (id,task_id,title,completed,position) VALUES (?,?,?,?,?)')
  for (const title of ['', ' ', '\t\r\n', '\u00a0\u2003', '\0']) expect(() => insert.run('s', task.id, title, 0, 0)).toThrow()
  for (const [completed, position] of [[2, 0], [0, -1], [0, 0.5], [0, 'invalid']]) expect(() => insert.run('s', task.id, 'T', completed, position)).toThrow()
  expect(() => insert.run('s', 'missing', 'T', 0, 0)).toThrow(/FOREIGN KEY/)
  insert.run('s', task.id, 'T', 0, 0)
  expect(() => insert.run('s2', task.id, 'T', 0, 0)).toThrow(/UNIQUE/)
  taskRepository(connection).remove(task.id)
  expect(connection.sqlite.prepare('SELECT * FROM task_steps').all()).toEqual([])
})
it('titres, progression, stabilité et conservation des champs, déclassification', () => {
  const repo = taskRepository(connection), steps = stepRepository(connection)
  const task = repo.create({ title: 'Parent' })
  const category = categoryRepository(connection).create({ name: 'Maison' })
  const parent = repo.update(task.id, { categoryId: category.id, priority: 'high', dueDate: '2024-02-29', completed: true })
  let saved = steps.create(task.id, { title: ' \u2003 Premier \n' })
  expect(saved).toMatchObject({ ...parent, completed: false, steps: [{ title: 'Premier', completed: false, position: 0 }] })
  const a = saved.steps[0]!
  saved = steps.create(task.id, { title: 'Premier' })
  const b = saved.steps[1]!
  expect(a.id).not.toBe(b.id)
  saved = steps.update(task.id, a.id, { completed: true })
  expect(saved.completed).toBe(false)
  expect(steps.update(task.id, a.id, { completed: true })).toEqual(saved)
  saved = steps.update(task.id, b.id, { completed: true, title: '  Deuxième ' })
  expect(saved.completed).toBe(true)
  expect(saved.steps.map(s => s.id)).toEqual([a.id, b.id])
  const reopened = steps.create(task.id, { title: 'Troisième' })
  expect(reopened.completed).toBe(false)
  expect(reopened.steps.slice(0, 2)).toEqual(saved.steps)
  saved = steps.remove(task.id, reopened.steps[2]!.id)
  expect(saved.completed).toBe(true)
  saved = steps.update(task.id, a.id, { completed: false })
  expect(saved.completed).toBe(false)
  saved = steps.remove(task.id, a.id)
  expect(saved.steps).toEqual([{ ...b, title: 'Deuxième', completed: true, position: 0 }])
  expect(saved.completed).toBe(true)
  expect(repo.update(task.id, { title: 'Modifié', priority: 'low' })).toEqual({ ...saved, title: 'Modifié', priority: 'low' })
  categoryRepository(connection).remove(category.id)
  expect(repo.list()[0]!.steps).toEqual(saved.steps)
  expect(repo.list()[0]!.categoryId).toBeNull()
})
it.each([true, false])('supprimer la dernière étape conserve completed=%j puis réalisation manuelle', (completed) => {
  const repo = taskRepository(connection), steps = stepRepository(connection)
  const task = repo.create({ title: 'P' })
  const a = steps.create(task.id, { title: 'A' }).steps[0]!
  steps.update(task.id, a.id, { completed })
  const simple = steps.remove(task.id, a.id)
  expect(simple).toEqual({ ...task, completed })
  expect(repo.update(task.id, { completed: !completed })).toEqual({ ...task, completed: !completed })
})
it.each([null, [], {}, { title: ' ' }, { title: 3 }, { completed: 1 }, { title: 'T', categoryId: null }, { steps: [] }, { position: 2 }])('refuse les entrées %j sans écriture', (input) => {
  const repo = taskRepository(connection), steps = stepRepository(connection)
  const task = repo.create({ title: 'P' })
  const saved = steps.create(task.id, { title: 'A' })
  expect(() => steps.create(task.id, input)).toThrow()
  expect(() => steps.update(task.id, saved.steps[0]!.id, input)).toThrow()
  expect(repo.list()).toEqual([saved])
})
it('appartenance, refus atomique du parent, cibles disparues et rollback après écriture', () => {
  const repo = taskRepository(connection), steps = stepRepository(connection)
  const task = repo.create({ title: 'P' }), other = repo.create({ title: 'Autre' })
  const saved = steps.create(task.id, { title: 'A' })
  const id = saved.steps[0]!.id
  expect(() => repo.update(task.id, { title: 'Interdit', completed: false, priority: 'high' })).toThrow(TaskHasSteps)
  expect(() => steps.update(other.id, id, { title: 'Interdit' })).toThrow('absente')
  expect(() => steps.remove(other.id, id)).toThrow('absente')
  connection.sqlite.exec("CREATE TRIGGER fail_parent BEFORE UPDATE OF completed ON tasks BEGIN SELECT RAISE(ABORT, 'injected'); END")
  expect(() => steps.update(task.id, id, { completed: true, title: 'Interdit' })).toThrow('injected')
  expect(() => steps.create(task.id, { title: 'Interdit' })).toThrow('injected')
  expect(repo.list().find(t => t.id === task.id)).toEqual(saved)
  connection.sqlite.exec('DROP TRIGGER fail_parent')
  const second = steps.create(task.id, { title: 'B' })
  connection.sqlite.exec("CREATE TRIGGER fail_position BEFORE UPDATE OF position ON task_steps BEGIN SELECT RAISE(ABORT, 'injected'); END")
  expect(() => steps.remove(task.id, id)).toThrow('injected')
  expect(repo.list().find(t => t.id === task.id)).toEqual(second)
  connection.sqlite.exec('DROP TRIGGER fail_position')
  repo.remove(task.id)
  expect(() => steps.create(task.id, { title: 'Tardif' })).toThrow('absente')
  expect(() => steps.update(task.id, id, { completed: true })).toThrow('absente')
  expect(() => steps.remove(task.id, id)).toThrow('absente')
  expect(connection.sqlite.prepare('SELECT * FROM task_steps').all()).toEqual([])
})
it.each(['add-complete', 'complete-add', 'add-delete'])('deux connexions concurrentes %s conservent la cohérence', async (mode) => {
  const repo = taskRepository(connection)
  const task = repo.create({ title: 'Concurrent' })
  const actions = mode === 'complete-add' ? ['complete', 'add'] : mode === 'add-delete' ? ['add', 'delete'] : ['add', 'complete']
  const children = actions.map(action => fork(new URL('./fixtures/mutate-steps.ts', import.meta.url), [join(directory, 'tasks.sqlite'), task.id, action], { execArgv: ['--import', 'tsx'], stdio: ['ignore', 'ignore', 'inherit', 'ipc'] }))
  try {
    await Promise.all(children.map(child => once(child, 'message')))
    const results = children.map(child => once(child, 'message'))
    const exits = children.map(child => once(child, 'exit'))
    children.forEach(child => child.send('go'))
    const messages = (await Promise.all(results)).map(([result]) => result)
    await Promise.all(exits)
    expect(messages.every(m => ['ok', 'missing', 'has-steps'].includes(String(m)))).toBe(true)
    const current = repo.list()[0]
    if (mode === 'add-delete') {
      expect(current).toBeUndefined()
      expect(connection.sqlite.prepare('SELECT * FROM task_steps').all()).toEqual([])
    }
    else {
      expect(current!.steps).toHaveLength(1)
      expect(current!.completed).toBe(false)
    }
  }
  finally { children.forEach(child => child.kill()) }
})
