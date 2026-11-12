import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { applyMigrations, openDatabase } from '../server/db/database'
import type { Category } from '../shared/types/category'
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
  const category = await fetch(`${server.origin}/api/categories`, { method: 'POST', headers, body: JSON.stringify({ name: 'Catégorie jetable' }) }).then(r => r.json()) as Category
  const renamedCategory = { ...category, name: 'Catégorie renommée persistante' }
  assert.equal((await fetch(`${server.origin}/api/categories/${category.id}`, { method: 'PATCH', headers, body: JSON.stringify({ name: renamedCategory.name }) })).status, 200)
  const renamed = { ...created, title: 'Titre modifié persistant', completed: true, categoryId: category.id, priority: 'high', dueDate: '2024-02-29' }
  const patch = await fetch(`${server.origin}/api/tasks/${created.id}`, { method: 'PATCH', headers, body: JSON.stringify({ title: renamed.title, completed: true, categoryId: category.id, priority: 'high', dueDate: '2024-02-29' }) })
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
  assert.deepEqual(await fetch(`${server.origin}/api/categories`).then(r => r.json()), [renamedCategory])
  for (const id of deletedIds) {
    assert.equal((await fetch(`${server.origin}/api/tasks/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ title: 'Tardif' }) })).status, 404)
  }
  assert.deepEqual(await fetch(`${server.origin}/api/tasks`).then(r => r.json()), [renamed])
  const active = await fetch(`${server.origin}/api/tasks`, { method: 'POST', headers, body: JSON.stringify({ title: 'Déclassement actif' }) }).then(r => r.json()) as Task
  assert.equal((await fetch(`${server.origin}/api/tasks/${active.id}`, { method: 'PATCH', headers, body: JSON.stringify({ categoryId: category.id }) })).status, 200)
  assert.equal((await fetch(`${server.origin}/api/categories/${category.id}`, { method: 'DELETE', headers })).status, 204)
  await server.stop()
  server = await startServer(database, 3101)
  assert.deepEqual(await fetch(`${server.origin}/api/categories`).then(r => r.json()), [])
  const final = await fetch(`${server.origin}/api/tasks`).then(r => r.json()) as Task[]
  assert.deepEqual(final.find(task => task.id === renamed.id), { ...renamed, categoryId: null })
  assert.deepEqual(final.find(task => task.id === active.id), active)
  console.log('OK : tâches, catégories renommées et associations persistent après redémarrage ; suppression de catégorie déclasse actives et terminées ; aucune recréation tardive.')
}
finally {
  await server?.stop()
  rmSync(directory, { recursive: true, force: true })
}
