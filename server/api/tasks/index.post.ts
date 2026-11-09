import { repository, taskError } from '../../utils/tasks'

export default defineEventHandler(async (event) => {
  let input: unknown
  try { input = await readBody(event) }
  catch { throw createError({ statusCode: 400, statusMessage: 'JSON invalide', message: 'Le corps JSON est invalide.' }) }
  try {
    const task = repository().create(input)
    setResponseStatus(event, 201)
    return task
  }
  catch (error) { taskError(error) }
})
