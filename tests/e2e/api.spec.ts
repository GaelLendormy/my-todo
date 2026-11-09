import { expect, test } from '@playwright/test'

const origin = 'http://127.0.0.1:3100'

test('API : origines et JSON refusés sans écriture, cache et fichier privé', async ({ request }) => {
  const before = await request.get('/api/tasks').then(response => response.json())
  const refusedHeaders: Record<string, string>[] = [{}, { Origin: 'https://etranger.example' }, { Origin: 'http://localhost:3100' }]
  for (const headers of refusedHeaders) {
    const response = await request.post('/api/tasks', { headers, data: { title: 'Interdit' } })
    expect(response.status()).toBe(403)
  }
  for (const contentType of ['text/plain', 'application/x-www-form-urlencoded']) {
    const response = await request.post('/api/tasks', { headers: { Origin: origin, 'Content-Type': contentType }, data: '{"title":"Interdit"}' })
    expect(response.status()).toBe(415)
  }
  const malformed = await request.post('/api/tasks', { headers: { Origin: origin, 'Content-Type': 'application/json' }, data: '{' })
  expect(malformed.status()).toBe(400)
  for (const data of [{ title: ' ' }, { title: 3 }, { title: 'T', extra: true }, [], null]) {
    const response = await request.post('/api/tasks', { headers: { Origin: origin, 'Content-Type': 'application/json' }, data: JSON.stringify(data) })
    expect(response.status()).toBe(400)
    expect(await response.text()).not.toMatch(/SQLITE|\/home\/|\/tmp\//)
  }
  const after = await request.get('/api/tasks')
  expect(after.headers()['cache-control']).toBe('no-store')
  expect(await after.json()).toEqual(before)
  for (const path of ['/tasks.sqlite', '/.data/development/tasks.sqlite', '/server/db/tasks.sqlite']) {
    const response = await request.get(path)
    expect(response.status()).toBe(404)
    expect((await response.body()).subarray(0, 15).toString()).not.toBe('SQLite format 3')
  }
  const created = await request.post('/api/tasks', { headers: { Origin: origin }, data: { title: '  API normalisée  ' } })
  expect(created.status()).toBe(201)
  expect(created.headers()['cache-control']).toBe('no-store')
  const a = await created.json()
  expect(a).toMatchObject({ title: 'API normalisée', completed: false })
  const second = await request.post('/api/tasks', { headers: { Origin: origin }, data: { title: 'API normalisée' } }).then(response => response.json())
  expect(second.id).not.toBe(a.id)
})

test('API : mises à jour partielles, validation et suppression sans recréation', async ({ request }) => {
  const headers = { Origin: origin }
  const task = await request.post('/api/tasks', { headers, data: { title: 'Cycle API' } }).then(r => r.json())
  const url = `/api/tasks/${task.id}`
  for (const data of [{}, { title: ' ' }, { title: 4 }, { completed: 1 }, { completed: 'false' }, { extra: true }, { createdAt: 0 }, []]) {
    expect((await request.patch(url, { headers, data })).status()).toBe(400)
  }
  expect((await request.patch('/api/tasks/invalide', { headers, data: { title: 'T' } })).status()).toBe(400)
  expect((await request.patch(url, { headers: { ...headers, 'Content-Type': 'application/json' }, data: '{' })).status()).toBe(400)
  expect((await request.patch(url, { headers: { ...headers, 'Content-Type': 'text/plain' }, data: '{}' })).status()).toBe(415)
  for (const method of ['patch', 'delete'] as const) {
    const rejectedHeaders: Record<string, string>[] = [{}, { Origin: 'https://etranger.example' }]
    for (const rejected of rejectedHeaders) {
      expect((await request[method](url, { headers: rejected, data: { completed: true } })).status()).toBe(403)
    }
  }
  expect((await request.get('/api/tasks').then(r => r.json())).find((t: { id: string }) => t.id === task.id)).toEqual(task)
  for (let i = 0; i < 2; i++) {
    const response = await request.patch(url, { headers, data: { completed: true } })
    expect(response.status()).toBe(200)
    expect(response.headers()['cache-control']).toBe('no-store')
    expect(await response.json()).toEqual({ ...task, completed: true })
  }
  expect(await request.patch(url, { headers, data: { title: '  Renommée  ' } }).then(r => r.json())).toEqual({ ...task, title: 'Renommée', completed: true })
  const removed = await request.delete(url, { headers })
  expect(removed.status()).toBe(204)
  expect(removed.headers()['cache-control']).toBe('no-store')
  expect((await request.patch(url, { headers, data: { title: 'Tardif' } })).status()).toBe(404)
  expect((await request.delete(url, { headers })).status()).toBe(404)
  expect((await request.delete('/api/tasks/invalide', { headers })).status()).toBe(400)
  expect((await request.get('/api/tasks').then(r => r.json())).find((t: { id: string }) => t.id === task.id)).toBeUndefined()
})
