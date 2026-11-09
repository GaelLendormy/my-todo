import { databasePath } from '../server/db/config'
import { applyMigrations, openDatabase } from '../server/db/database'

const connection = openDatabase(databasePath())
try {
  applyMigrations(connection)
  console.log('Migrations appliquées.')
}
finally { connection.close() }
