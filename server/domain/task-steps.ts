import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import type { StepUpdate } from '../../shared/types/task'
import type { openDatabase } from '../db/database'
import { tasks, taskSteps } from '../db/schema'
import { InvalidTask, MissingTask, parseCreation, parseId } from './tasks'
import { readTask } from './task-reading'

export function parseStepUpdate(input: unknown): StepUpdate {
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || !Object.keys(input).length || Object.keys(input).some(key => !['title', 'completed'].includes(key))) throw new InvalidTask('Modification d’étape invalide.')
  const update: StepUpdate = {}
  if ('title' in input) update.title = parseCreation({ title: input.title }).title
  if ('completed' in input) {
    if (typeof input.completed !== 'boolean') throw new InvalidTask('État invalide.')
    update.completed = input.completed
  }
  return update
}

export function stepRepository(connection: ReturnType<typeof openDatabase>) {
  function mutate(id: unknown, action: (taskId: string) => void) {
    const taskId = parseId(id)
    return connection.sqlite.transaction(() => {
      if (!readTask(connection, taskId)) throw new MissingTask('Cette tâche est absente.')
      action(taskId)
      const current = readTask(connection, taskId)!
      // No steps: retain the parent's state immediately before deletion.
      if (current.steps.length) connection.db.update(tasks).set({ completed: current.steps.every(step => step.completed) }).where(eq(tasks.id, taskId)).run()
      return readTask(connection, taskId)!
    }).immediate()
  }
  function requireStep(taskId: string, stepId: string) {
    const where = and(eq(taskSteps.taskId, taskId), eq(taskSteps.id, stepId))
    if (!connection.db.select().from(taskSteps).where(where).get()) throw new MissingTask('Cette étape est absente de la tâche.')
    return where
  }
  return {
    create(id: unknown, input: unknown) {
      const { title } = parseCreation(input)
      return mutate(id, (taskId) => {
        const position = readTask(connection, taskId)!.steps.length
        connection.db.insert(taskSteps).values({ id: randomUUID(), taskId, title, completed: false, position }).run()
      })
    },
    update(id: unknown, stepId: unknown, input: unknown) {
      const target = parseId(stepId)
      const update = parseStepUpdate(input)
      return mutate(id, (taskId) => {
        connection.db.update(taskSteps).set(update).where(requireStep(taskId, target)).run()
      })
    },
    remove(id: unknown, stepId: unknown) {
      const target = parseId(stepId)
      return mutate(id, (taskId) => {
        connection.db.delete(taskSteps).where(requireStep(taskId, target)).run()
        const remaining = readTask(connection, taskId)!.steps
        // Free positive positions first: UNIQUE is checked at each row update.
        const offset = (remaining.at(-1)?.position ?? 0) + 1
        for (const step of remaining) connection.db.update(taskSteps).set({ position: step.position + offset }).where(eq(taskSteps.id, step.id)).run()
        remaining.forEach((step, position) => connection.db.update(taskSteps).set({ position }).where(eq(taskSteps.id, step.id)).run())
      })
    },
  }
}
