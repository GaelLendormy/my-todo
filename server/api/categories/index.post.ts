import { categoriesRepository, categoryError } from '../../utils/categories'
export default defineEventHandler(async (event) => {
  let input: unknown
  try { input = await readBody(event) }
  catch { throw createError({ statusCode: 400, message: 'Le corps JSON est invalide.' }) }
  try {
    const saved = categoriesRepository().create(input)
    setResponseStatus(event, 201)
    return saved
  }
  catch (error) { categoryError(error) }
})
