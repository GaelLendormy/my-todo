import type { TaskUpdate } from '../../shared/types/task'
import { isCivilDate } from '../../shared/task-selection'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { openDatabase } from '../db/database'
import { readTask, readTasks } from './task-reading'
import { tasks } from '../db/schema'

export class InvalidTask extends Error {}
export class MissingTask extends Error {}
export class MissingTaskCategory extends Error {}
export class TaskHasSteps extends Error {}

export function parseId(id: unknown): string {
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new InvalidTask('Identifiant invalide.')
  }
  return id
}

export function parseUpdate(input: unknown): TaskUpdate {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new InvalidTask('Modification invalide.')
  const keys = Object.keys(input)
  if (!keys.length || keys.some(key => key !== 'title' && key !== 'completed' && key !== 'categoryId' && key !== 'priority' && key !== 'dueDate')) throw new InvalidTask('Propriété de modification invalide.')
  const update: TaskUpdate = {}
  if ('title' in input) update.title = parseCreation({ title: input.title }).title
  if ('completed' in input) {
    if (typeof input.completed !== 'boolean') throw new InvalidTask('État invalide.')
    update.completed = input.completed
  }
  if ('categoryId' in input) update.categoryId = input.categoryId === null ? null : parseId(input.categoryId)
  if ('priority' in input) {
    if (input.priority !== null && !['low', 'normal', 'high'].includes(input.priority as string)) throw new InvalidTask('Priorité invalide.')
    update.priority = input.priority as TaskUpdate['priority']
  }
  if ('dueDate' in input) {
    if (input.dueDate !== null && !isCivilDate(input.dueDate)) throw new InvalidTask('Date limite invalide : utilisez une date réelle YYYY-MM-DD.')
    update.dueDate = input.dueDate as string | null
  }
  return update
}

export function parseCreation(input: unknown): { title: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || Object.keys(input).length !== 1 || !('title' in input) || typeof input.title !== 'string') {
    throw new InvalidTask('Un titre texte est requis, sans autre propriété.')
  }
  const title = input.title.trim()
  if (!title || title.includes('\0')) throw new InvalidTask('Le titre doit contenir du texte.')
  return { title }
}

export function taskRepository(connection: ReturnType<typeof openDatabase>) {
  return {
    list: () => connection.sqlite.transaction(() => readTasks(connection))(),
    update(id: unknown, input: unknown) {
      const target = parseId(id)
      const update = parseUpdate(input)
      return connection.sqlite.transaction(() => {
        const current = readTask(connection, target)
        if (!current) throw new MissingTask('Cette tâche est absente.')
        if ('completed' in update && current.steps.length) throw new TaskHasSteps('La réalisation de cette tâche dépend de ses étapes.')
        let saved
        try { saved = connection.db.update(tasks).set(update).where(eq(tasks.id, target)).returning().get() }
        catch (error) {
          if ((error as { code?: string }).code === 'SQLITE_CONSTRAINT_FOREIGNKEY') throw new MissingTaskCategory('La catégorie choisie est absente. Actualisez puis remplacez-la dans votre brouillon.')
          throw error
        }
        if (!saved) throw new MissingTask('Cette tâche est absente.')
        return { ...saved, steps: current.steps }
      }).immediate()
    },
    remove(id: unknown) {
      const target = parseId(id)
      const removed = connection.db.delete(tasks).where(eq(tasks.id, target)).returning().get()
      if (!removed) throw new MissingTask('Cette tâche est absente.')
    },
    create(input: unknown) {
      const { title } = parseCreation(input)
      const saved = connection.db.insert(tasks).values({ id: randomUUID(), title, completed: false, createdAt: Date.now() }).returning().get()!
      return { ...saved, steps: [] }
    },
  }
}
