import { databasePath } from '../db/config'
import { openDatabase } from '../db/database'

let connection: ReturnType<typeof openDatabase> | undefined
export function serverConnection() {
  connection ??= openDatabase(databasePath())
  return connection
}
