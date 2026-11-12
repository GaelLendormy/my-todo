import { expect, test } from '@playwright/test'
import type { Task } from '../../shared/types/task'
const headers = { Origin: 'http://127.0.0.1:3100', 'Content-Type': 'application/json' }
test('API étapes : contrats, protections, atomicité et cibles', async ({ request }) => {
  const parent = await request.post('/api/tasks', { headers, data: { title: 'API étapes' } }).then(r => r.json()) as Task
  const other = await request.post('/api/tasks', { headers, data: { title: 'Autre parent' } }).then(r => r.json()) as Task
  const url = `/api/tasks/${parent.id}/steps`
  for (const origin of [undefined, 'https://etranger.example']) {
    const h: Record<string, string> = origin ? { Origin: origin } : {}
    expect((await request.post(url, { headers: h, data: { title: 'Interdit' } })).status()).toBe(403)
  }
  expect((await request.post(url, { headers: { ...headers, 'Content-Type': 'text/plain' }, data: '{}' })).status()).toBe(415)
  expect((await request.post(url, { headers, data: '{' })).status()).toBe(400)
  for (const data of [null, [], {}, { title: ' ' }, { title: 5 }, { title: 'A', completed: true }, { title: 'A', steps: [] }]) {
    expect((await request.post(url, { headers, data: JSON.stringify(data) })).status()).toBe(400)
  }
  expect((await request.get('/api/tasks').then(r => r.json()) as Task[]).find(t => t.id === parent.id)).toEqual(parent)
  const response = await request.post(url, { headers, data: { title: '  Première ' } })
  expect(response.status()).toBe(201)
  expect(response.headers()['cache-control']).toBe('no-store')
  const decomposed = await response.json() as Task
  expect(decomposed.steps).toHaveLength(1)
  expect(decomposed.steps[0]).toMatchObject({ title: 'Première', completed: false, position: 0, taskId: parent.id })
  const stepUrl = `${url}/${decomposed.steps[0]!.id}`
  const conflict = await request.patch(`/api/tasks/${parent.id}`, { headers, data: { completed: false, title: 'Interdit', priority: 'high' } })
  expect(conflict.status()).toBe(409)
  expect((await conflict.json()).data.code).toBe('TASK_HAS_STEPS')
  expect((await request.get('/api/tasks').then(r => r.json()) as Task[]).find(t => t.id === parent.id)).toEqual(decomposed)
  for (const method of ['PATCH', 'DELETE'] as const) {
    for (const origin of [undefined, 'https://etranger.example']) {
      expect((await request.fetch(stepUrl, { method, headers: origin ? { Origin: origin } : {}, data: method === 'PATCH' ? { completed: true } : undefined })).status()).toBe(403)
    }
    expect((await request.fetch(`/api/tasks/${other.id}/steps/${decomposed.steps[0]!.id}`, { method, headers, data: method === 'PATCH' ? { completed: true } : undefined })).status()).toBe(404)
  }
  expect((await request.patch(stepUrl, { headers: { ...headers, 'Content-Type': 'text/plain' }, data: '{}' })).status()).toBe(415)
  expect((await request.patch(stepUrl, { headers, data: '{' })).status()).toBe(400)
  for (const data of [{}, { completed: 1 }, { title: ' ' }, { title: 'Interdit', position: 2 }]) expect((await request.patch(stepUrl, { headers, data })).status()).toBe(400)
  const patch = await request.patch(stepUrl, { headers, data: { completed: true, title: 'Renommée' } })
  expect(patch.status()).toBe(200)
  expect(patch.headers()['cache-control']).toBe('no-store')
  const finished = await patch.json() as Task
  expect(finished.completed).toBe(true)
  expect(finished.steps[0]).toEqual({ ...decomposed.steps[0], completed: true, title: 'Renommée' })
  const removed = await request.delete(stepUrl, { headers })
  expect(removed.status()).toBe(200)
  expect(removed.headers()['cache-control']).toBe('no-store')
  expect(await removed.json()).toEqual({ ...parent, completed: true })
  expect((await request.delete(stepUrl, { headers })).status()).toBe(404)
  await request.post(url, { headers, data: { title: 'Cascade' } })
  expect((await request.delete(`/api/tasks/${parent.id}`, { headers })).status()).toBe(204)
  expect((await request.post(url, { headers, data: { title: 'Tardif' } })).status()).toBe(404)
  expect((await request.patch(stepUrl, { headers, data: { title: 'Tardif' } })).status()).toBe(404)
})
