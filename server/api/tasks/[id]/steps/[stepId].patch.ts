import { stepsRepository } from '../../../../utils/task-steps'
import { taskError } from '../../../../utils/tasks'

export default defineEventHandler(async (event) => {
  let input: unknown
  try { input = await readBody(event) }
  catch { throw createError({ statusCode: 400, statusMessage: 'JSON invalide', message: 'Le corps JSON est invalide.' }) }
  try { return stepsRepository().update(getRouterParam(event, 'id'), getRouterParam(event, 'stepId'), input) }
  catch (error) { taskError(error) }
})
