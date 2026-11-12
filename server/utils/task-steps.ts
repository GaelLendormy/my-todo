import { serverConnection } from './database'
import { stepRepository } from '../domain/task-steps'

export function stepsRepository() {
  return stepRepository(serverConnection())
}
