import { categoriesRepository, categoryError } from '../../utils/categories'
export default defineEventHandler(async (event) => {
  let input: unknown
  try { input = await readBody(event) }
  catch { throw createError({ statusCode: 400, message: 'Le corps JSON est invalide.' }) }
  try { return categoriesRepository().update(getRouterParam(event, 'id'), input) }
  catch (error) { categoryError(error) }
})
