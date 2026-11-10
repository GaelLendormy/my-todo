import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { openDatabase } from '../db/database'
import { categories } from '../db/schema'
import { categoryKey, categoryName, sortCategories } from '../../shared/category-names'
import { parseId } from './tasks'

export class InvalidCategory extends Error {}
export class MissingCategory extends Error {}
export class DuplicateCategory extends Error {}

function parseName(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== 1
    || !('name' in input) || typeof input.name !== 'string') throw new InvalidCategory('Un nom texte est requis, sans autre propriété.')
  const name = categoryName(input.name)
  if (!name || name.includes('\0')) throw new InvalidCategory('Le nom doit contenir du texte sans caractère NUL.')
  return { name, nameKey: categoryKey(name) }
}
function translate(error: unknown): never {
  if ((error as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') throw new DuplicateCategory('Ce nom existe déjà. Actualisez puis sélectionnez la catégorie existante.')
  throw error
}
export function categoryRepository(connection: ReturnType<typeof openDatabase>) {
  return {
    list: () => sortCategories(connection.db.select({ id: categories.id, name: categories.name }).from(categories).all()),
    create(input: unknown) {
      const values = parseName(input)
      try {
        return connection.db.insert(categories).values({ id: randomUUID(), ...values }).returning({ id: categories.id, name: categories.name }).get()
      }
      catch (error) { translate(error) }
    },
    update(id: unknown, input: unknown) {
      const target = parseId(id)
      const values = parseName(input)
      try {
        const saved = connection.db.update(categories).set(values).where(eq(categories.id, target)).returning({ id: categories.id, name: categories.name }).get()
        if (!saved) throw new MissingCategory('Cette catégorie est absente.')
        return saved
      }
      catch (error) { translate(error) }
    },
    remove(id: unknown) {
      const target = parseId(id)
      const removed = connection.db.delete(categories).where(eq(categories.id, target)).returning().get()
      if (!removed) throw new MissingCategory('Cette catégorie est absente.')
    },
  }
}
