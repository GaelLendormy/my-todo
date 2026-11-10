import { createError } from 'h3'
import { categoryRepository, DuplicateCategory, InvalidCategory, MissingCategory } from '../domain/categories'
import { InvalidTask } from '../domain/tasks'
import { serverConnection } from './database'

export function categoriesRepository() { return categoryRepository(serverConnection()) }
export function categoryError(error: unknown): never {
  if (error instanceof MissingCategory) throw createError({ statusCode: 404, message: error.message })
  if (error instanceof DuplicateCategory) throw createError({ statusCode: 409, message: error.message })
  if (error instanceof InvalidCategory || error instanceof InvalidTask) throw createError({ statusCode: 400, message: error.message })
  throw createError({ statusCode: 503, message: 'Les catégories sont momentanément indisponibles. Réessayez.' })
}
