import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { applyMigrations, openDatabase } from '../server/db/database'
import { startServer } from './test-server'

const directory = mkdtempSync(join(tmpdir(), 'mytodo-e2e-'))
const database = join(directory, 'tasks.sqlite')
const connection = openDatabase(database)
applyMigrations(connection)
connection.close()
const server = await startServer(database, 3100)
console.log(`Serveur de test prêt : ${server.origin}`)
let stopping = false
async function stop() {
  if (stopping) return
  stopping = true
  await server.stop()
  rmSync(directory, { recursive: true, force: true })
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
