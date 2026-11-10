import { categoriesRepository, categoryError } from '../../utils/categories'
export default defineEventHandler((event) => {
  try {
    categoriesRepository().remove(getRouterParam(event, 'id'))
    setResponseStatus(event, 204)
    return null
  }
  catch (error) { categoryError(error) }
})
