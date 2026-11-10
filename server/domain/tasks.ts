import { randomUUID } from 'node:crypto'
import { desc, eq } from 'drizzle-orm'
import type { openDatabase } from '../db/database'
import { tasks } from '../db/schema'

export class InvalidTask extends Error {}
export class MissingTask extends Error {}
export class MissingTaskCategory extends Error {}

export function parseId(id: unknown): string {
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new InvalidTask('Identifiant invalide.')
  }
  return id
}

export function parseUpdate(input: unknown): { title?: string, completed?: boolean, categoryId?: string | null } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new InvalidTask('Modification invalide.')
  const keys = Object.keys(input)
  if (!keys.length || keys.some(key => key !== 'title' && key !== 'completed' && key !== 'categoryId')) throw new InvalidTask('Propriété de modification invalide.')
  const update: { title?: string, completed?: boolean, categoryId?: string | null } = {}
  if ('title' in input) update.title = parseCreation({ title: input.title }).title
  if ('completed' in input) {
    if (typeof input.completed !== 'boolean') throw new InvalidTask('État invalide.')
    update.completed = input.completed
  }
  if ('categoryId' in input) update.categoryId = input.categoryId === null ? null : parseId(input.categoryId)
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
    list: () => connection.db.select().from(tasks).orderBy(desc(tasks.createdAt), desc(tasks.id)).all(),
    update(id: unknown, input: unknown) {
      const target = parseId(id)
      const update = parseUpdate(input)
      let saved
      try { saved = connection.db.update(tasks).set(update).where(eq(tasks.id, target)).returning().get() }
      catch (error) {
        if ((error as { code?: string }).code === 'SQLITE_CONSTRAINT_FOREIGNKEY') throw new MissingTaskCategory('La catégorie choisie est absente. Actualisez puis remplacez-la dans votre brouillon.')
        throw error
      }
      if (!saved) throw new MissingTask('Cette tâche est absente.')
      return saved
    },
    remove(id: unknown) {
      const target = parseId(id)
      const removed = connection.db.delete(tasks).where(eq(tasks.id, target)).returning().get()
      if (!removed) throw new MissingTask('Cette tâche est absente.')
    },
    create(input: unknown) {
      const { title } = parseCreation(input)
      return connection.db.insert(tasks).values({ id: randomUUID(), title, completed: false, createdAt: Date.now() }).returning().get()
    },
  }
}
