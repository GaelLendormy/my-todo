import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import type { StepOrder, StepUpdate } from '../../shared/types/task'
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

export class StepOrderChanged extends Error {}

export function parseStepOrder(input: unknown): StepOrder {
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).length !== 3 || Object.keys(input).some(key => !['stepId', 'direction', 'expectedOrder'].includes(key))
    || !('stepId' in input) || !('direction' in input) || !('expectedOrder' in input)) throw new InvalidTask('Déplacement invalide.')
  const stepId = parseId(input.stepId)
  if (input.direction !== 'up' && input.direction !== 'down') throw new InvalidTask('Direction invalide.')
  if (!Array.isArray(input.expectedOrder)) throw new InvalidTask('Ordre invalide.')
  const expectedOrder = input.expectedOrder.map(id => parseId(id))
  if (new Set(expectedOrder).size !== expectedOrder.length) throw new InvalidTask('Ordre invalide.')
  return { stepId, direction: input.direction, expectedOrder }
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
    move(id: unknown, input: unknown) {
      const taskId = parseId(id)
      const { stepId, direction, expectedOrder } = parseStepOrder(input)
      return connection.sqlite.transaction(() => {
        const current = readTask(connection, taskId)
        if (!current) throw new MissingTask('Cette tâche est absente.')
        requireStep(taskId, stepId)
        if (current.steps.length !== expectedOrder.length || current.steps.some((step, index) => step.id !== expectedOrder[index])) {
          throw new StepOrderChanged('L’ordre des étapes a changé. Relisez avant de déplacer à nouveau.')
        }
        const index = current.steps.findIndex(step => step.id === stepId)
        const destination = index + (direction === 'up' ? -1 : 1)
        if (destination < 0 || destination >= current.steps.length) return current
        const neighbor = current.steps[destination]!
        // Three writes free a positive position before exchanging unique positions.
        connection.db.update(taskSteps).set({ position: current.steps.length }).where(eq(taskSteps.id, stepId)).run()
        connection.db.update(taskSteps).set({ position: index }).where(eq(taskSteps.id, neighbor.id)).run()
        connection.db.update(taskSteps).set({ position: destination }).where(eq(taskSteps.id, stepId)).run()
        return readTask(connection, taskId)!
      }).immediate()
    },
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
