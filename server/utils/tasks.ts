import { createError } from 'h3'
import { databasePath } from '../db/config'
import { openDatabase } from '../db/database'
import { InvalidTask, MissingTask, taskRepository } from '../domain/tasks'

let connection: ReturnType<typeof openDatabase> | undefined
export function repository() {
  connection ??= openDatabase(databasePath())
  return taskRepository(connection)
}

export function taskError(error: unknown): never {
  if (error instanceof MissingTask) throw createError({ statusCode: 404, statusMessage: 'Tâche absente', message: error.message })
  if (error instanceof InvalidTask) throw createError({ statusCode: 400, statusMessage: 'Tâche invalide', message: error.message })
  throw createError({ statusCode: 503, statusMessage: 'Service indisponible', message: 'Les tâches sont momentanément indisponibles. Réessayez.' })
}
