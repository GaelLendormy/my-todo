import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { applyMigrations, openDatabase } from '../server/db/database'
import type { Category } from '../shared/types/category'
import type { Task } from '../shared/types/task'
import { startServer } from './test-server'

// Only this newly created temporary directory is ever copied or removed.
const directory = mkdtempSync(join(tmpdir(), 'mytodo-recovery-'))
const database = join(directory, 'source', 'tasks.sqlite')
const backup = join(directory, 'backup')
const restored = join(directory, 'restored', 'tasks.sqlite')
let server: Awaited<ReturnType<typeof startServer>> | undefined
try {
  const connection = openDatabase(database)
  applyMigrations(connection)
  connection.close()
  server = await startServer(database, 3103)
  const headers = { 'Content-Type': 'application/json', 'Origin': server.origin }
  const category = await fetch(`${server.origin}/api/categories`, { method: 'POST', headers, body: JSON.stringify({ name: 'Restauration jetable' }) }).then(r => r.json()) as Category
  for (const title of ['M3 — tâche active jetable', 'M3 — tâche terminée jetable']) {
    const response: Response = await fetch(`${server.origin}/api/tasks`, {
      method: 'POST', headers, body: JSON.stringify({ title }),
    })
    assert.equal(response.status, 201)
    const task = await response.json() as Task
    const patch: Response = await fetch(`${server.origin}/api/tasks/${task.id}`, {
      method: 'PATCH', headers, body: JSON.stringify({ completed: title.includes('terminée'), categoryId: category.id }),
    })
    assert.equal(patch.status, 200)
  }
  const before = await fetch(`${server.origin}/api/tasks`).then(r => r.json()) as Task[]
  assert.equal(before.length, 2)
  assert.equal(before.filter(task => task.completed).length, 1)
  const categoriesBefore = await fetch(`${server.origin}/api/categories`).then(r => r.json())
  assert.deepEqual(categoriesBefore, [category])
  assert.ok(before.every(task => task.categoryId === category.id))
  await server.stop()
  server = undefined
  cpSync(join(directory, 'source'), backup, { recursive: true })
  cpSync(backup, join(directory, 'restored'), { recursive: true })
  assert.notEqual(restored, database)
  server = await startServer(restored, 3103)
  const response = await fetch(`${server.origin}/api/tasks`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), before)
  assert.deepEqual(await fetch(`${server.origin}/api/categories`).then(r => r.json()), categoriesBefore)
  console.log('OK : service arrêté avant copie ; sauvegarde puis restauration isolée ; titres, états, identifiants, catégories et associations relus par HTTP identiques.')
}
finally {
  await server?.stop()
  rmSync(directory, { recursive: true, force: true })
}
