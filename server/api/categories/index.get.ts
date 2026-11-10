import { categoriesRepository, categoryError } from '../../utils/categories'
export default defineEventHandler(() => {
  try { return categoriesRepository().list() }
  catch (error) { categoryError(error) }
})
