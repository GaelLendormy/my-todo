import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { applyMigrations, openDatabase } from '../server/db/database'
import { taskRepository } from '../server/domain/tasks'
import { stepRepository, StepOrderChanged } from '../server/domain/task-steps'

let directory: string
let connection: ReturnType<typeof openDatabase>
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'mytodo-order-'))
  connection = openDatabase(join(directory, 'tasks.sqlite'))
  applyMigrations(connection)
})
afterEach(() => { connection.close(); rmSync(directory, { recursive: true, force: true }) })
function fixture() {
  const tasks = taskRepository(connection), steps = stepRepository(connection)
  const parent = tasks.create({ title: 'Parent' })
  tasks.update(parent.id, { priority: 'high', dueDate: '2024-02-29' })
  steps.create(parent.id, { title: 'A' })
  steps.create(parent.id, { title: 'B' })
  const task = steps.create(parent.id, { title: 'C' })
  const order = task.steps.map(step => step.id)
  return { tasks, steps, task, order }
}
it('déplace parmi les étapes terminées et conserve tous les contenus et champs parents', () => {
  const { tasks, steps, task, order } = fixture()
  const initial = steps.update(task.id, order[1], { completed: true })
  const moved = steps.move(task.id, { stepId: order[2], direction: 'up', expectedOrder: order })
  expect(moved).toEqual({ ...initial, steps: [initial.steps[0], { ...initial.steps[2], position: 1 }, { ...initial.steps[1], position: 2 }] })
  expect(steps.move(task.id, { stepId: order[2], direction: 'down', expectedOrder: moved.steps.map(s => s.id) })).toEqual(initial)
  expect(tasks.list()[0]).toEqual(initial)
})
it('bornes et étape unique sans aucune écriture ; vide et cibles absentes/autres parents', () => {
  const { tasks, steps, task, order } = fixture()
  const other = tasks.create({ title: 'Autre' })
  expect(() => steps.move(other.id, { stepId: order[0], direction: 'up', expectedOrder: [] })).toThrow('absente')
  expect(() => steps.move(task.id, { stepId: other.id, direction: 'up', expectedOrder: order })).toThrow('absente')
  const single = steps.create(other.id, { title: 'Unique' })
  connection.sqlite.exec("CREATE TRIGGER no_step_write BEFORE UPDATE ON task_steps BEGIN SELECT RAISE(ABORT, 'write'); END; CREATE TRIGGER no_parent_write BEFORE UPDATE ON tasks BEGIN SELECT RAISE(ABORT, 'write'); END")
  expect(steps.move(task.id, { stepId: order[0], direction: 'up', expectedOrder: order })).toEqual(task)
  expect(steps.move(task.id, { stepId: order[2], direction: 'down', expectedOrder: order })).toEqual(task)
  for (const direction of ['up', 'down']) expect(steps.move(other.id, { stepId: single.steps[0]!.id, direction, expectedOrder: single.steps.map(s => s.id) })).toEqual(single)
})
it.each([null, [], {}, { stepId: 3, direction: 'up', expectedOrder: [] }, { direction: 'left' }, { expectedOrder: 'a' }])('rejette corps invalide %j', input => {
  const { tasks, steps, task } = fixture()
  expect(() => steps.move(task.id, input)).toThrow()
  expect(tasks.list()[0]).toEqual(task)
})
it('rejette doublons, identifiants et champs inconnus sans écriture', () => {
  const { tasks, steps, task, order } = fixture()
  for (const extra of [{ expectedOrder: [order[0], order[0]] }, { expectedOrder: [null] }, { expectedOrder: ['invalid'] }, { direction: 'left' }, { position: 1 }, { stepId: null }]) {
    expect(() => steps.move(task.id, { stepId: order[1], direction: 'up', expectedOrder: order, ...extra })).toThrow()
    expect(tasks.list()[0]).toEqual(task)
  }
})
it('rollback après la première écriture de position', () => {
  const { tasks, steps, task, order } = fixture()
  connection.sqlite.exec("CREATE TRIGGER fail_order BEFORE UPDATE OF position ON task_steps WHEN NEW.position = 1 BEGIN SELECT RAISE(ABORT, 'injected'); END")
  expect(() => steps.move(task.id, { stepId: order[1], direction: 'down', expectedOrder: order })).toThrow('injected')
  expect(tasks.list()[0]).toEqual(task)
})
it.each(['add', 'remove', 'move', 'rename', 'complete'])('deux connexions avec ordre commun : %s externe', action => {
  const { tasks, steps, task, order } = fixture()
  const other = openDatabase(join(directory, 'tasks.sqlite'))
  try {
    expect(taskRepository(other).list()[0]!.steps.map(s => s.id)).toEqual(order)
    const external = stepRepository(other)
    if (action === 'add') external.create(task.id, { title: 'D' })
    if (action === 'remove') external.remove(task.id, order[2])
    if (action === 'move') external.move(task.id, { stepId: order[2], direction: 'up', expectedOrder: order })
    if (action === 'rename') external.update(task.id, order[0], { title: 'Renommée' })
    if (action === 'complete') external.update(task.id, order[0], { completed: true })
    const before = tasks.list()[0]!
    if (['add', 'remove', 'move'].includes(action)) {
      connection.sqlite.exec("CREATE TRIGGER no_write BEFORE UPDATE ON task_steps BEGIN SELECT RAISE(ABORT, 'write'); END")
      expect(() => steps.move(task.id, { stepId: order[1], direction: 'up', expectedOrder: order })).toThrow(StepOrderChanged)
      expect(tasks.list()[0]).toEqual(before)
    }
    else {
      const saved = steps.move(task.id, { stepId: order[1], direction: 'up', expectedOrder: order })
      expect(saved).toEqual({ ...before, steps: [{ ...before.steps[1], position: 0 }, { ...before.steps[0], position: 1 }, before.steps[2]] })
    }
  }
  finally { other.close() }
})
