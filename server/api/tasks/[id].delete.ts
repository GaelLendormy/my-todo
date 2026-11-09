import { repository, taskError } from '../../utils/tasks'

export default defineEventHandler((event) => {
  try {
    repository().remove(getRouterParam(event, 'id'))
    setResponseStatus(event, 204)
    return null
  }
  catch (error) { taskError(error) }
})
