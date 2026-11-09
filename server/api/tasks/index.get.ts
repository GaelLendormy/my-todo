import { repository, taskError } from '../../utils/tasks'

export default defineEventHandler(() => {
  try { return repository().list() }
  catch (error) { taskError(error) }
})
