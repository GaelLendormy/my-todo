import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { applyMigrations, openDatabase } from '../server/db/database'
import type { Task } from '../shared/types/task'
import { startServer } from './test-server'

const directory = mkdtempSync(join(tmpdir(), 'mytodo-restart-'))
const database = join(directory, 'tasks.sqlite')
let server: Awaited<ReturnType<typeof startServer>> | undefined
try {
  const connection = openDatabase(database)
  applyMigrations(connection)
  connection.close()
  server = await startServer(database, 3101)
  const response = await fetch(`${server.origin}/api/tasks`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Origin': server.origin },
    body: JSON.stringify({ title: 'Tâche jetable après redémarrage' }),
  })
  assert.equal(response.status, 201)
  const created = await response.json() as Task
  await server.stop()
  server = await startServer(database, 3101)
  const tasks = await fetch(`${server.origin}/api/tasks`).then(response => response.json())
  assert.deepEqual(tasks, [created])
  const headers = { 'Content-Type': 'application/json', 'Origin': server.origin }
  const renamed = { ...created, title: 'Titre modifié persistant', completed: true }
  const patch = await fetch(`${server.origin}/api/tasks/${created.id}`, { method: 'PATCH', headers, body: JSON.stringify({ title: renamed.title, completed: true }) })
  assert.equal(patch.status, 200)
  assert.deepEqual(await patch.json(), renamed)
  const deletedIds: string[] = []
  for (const completed of [false, true]) {
    const task = await fetch(`${server.origin}/api/tasks`, { method: 'POST', headers, body: JSON.stringify({ title: 'Suppression jetable' }) }).then(r => r.json()) as Task
    if (completed) assert.equal((await fetch(`${server.origin}/api/tasks/${task.id}`, { method: 'PATCH', headers, body: JSON.stringify({ completed }) })).status, 200)
    assert.equal((await fetch(`${server.origin}/api/tasks/${task.id}`, { method: 'DELETE', headers })).status, 204)
    deletedIds.push(task.id)
  }
  await server.stop()
  server = await startServer(database, 3101)
  assert.deepEqual(await fetch(`${server.origin}/api/tasks`).then(r => r.json()), [renamed])
  for (const id of deletedIds) {
    assert.equal((await fetch(`${server.origin}/api/tasks/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ title: 'Tardif' }) })).status, 404)
  }
  assert.deepEqual(await fetch(`${server.origin}/api/tasks`).then(r => r.json()), [renamed])
  console.log('OK : création, titre/état modifiés et suppressions actives/terminées persistent après redémarrages ; aucune recréation tardive.')
}
finally {
  await server?.stop()
  rmSync(directory, { recursive: true, force: true })
}
