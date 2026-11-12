import { createError } from 'h3'
import { serverConnection } from './database'
import { TaskHasSteps, InvalidTask, MissingTask, MissingTaskCategory, taskRepository } from '../domain/tasks'

export function repository() {
  return taskRepository(serverConnection())
}

export function taskError(error: unknown): never {
  if (error instanceof TaskHasSteps) throw createError({ statusCode: 409, data: { code: 'TASK_HAS_STEPS' }, message: error.message })
  if (error instanceof MissingTaskCategory) throw createError({ statusCode: 404, data: { code: 'CATEGORY_MISSING' }, message: error.message })
  if (error instanceof MissingTask) throw createError({ statusCode: 404, statusMessage: 'Tâche absente', message: error.message })
  if (error instanceof InvalidTask) throw createError({ statusCode: 400, statusMessage: 'Tâche invalide', message: error.message })
  throw createError({ statusCode: 503, statusMessage: 'Service indisponible', message: 'Les tâches sont momentanément indisponibles. Réessayez.' })
}
