import { openDatabase } from '../../server/db/database'
import { categoryRepository, DuplicateCategory } from '../../server/domain/categories'

const connection = openDatabase(process.argv[2]!)
process.send?.('ready')
process.once('message', () => {
  try {
    categoryRepository(connection).create({ name: process.argv[3] })
    process.send?.('created')
  }
  catch (error) { process.send?.(error instanceof DuplicateCategory ? 'duplicate' : 'unexpected') }
  finally { connection.close(); process.disconnect() }
})
