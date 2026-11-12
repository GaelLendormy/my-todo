import { stepsRepository } from '../../../../utils/task-steps'
import { taskError } from '../../../../utils/tasks'

export default defineEventHandler((event) => {
  try { return stepsRepository().remove(getRouterParam(event, 'id'), getRouterParam(event, 'stepId')) }
  catch (error) { taskError(error) }
})
