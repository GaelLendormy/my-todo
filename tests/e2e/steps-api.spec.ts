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

test('API ordre : route distincte, protections, conflits, bornes et refus sans écriture', async ({ request }) => {
  const parent = await request.post('/api/tasks', { headers, data: { title: 'API ordre' } }).then(r => r.json()) as Task
  const other = await request.post('/api/tasks', { headers, data: { title: 'Autre ordre' } }).then(r => r.json()) as Task
  const url = `/api/tasks/${parent.id}/steps`
  await request.post(url, { headers, data: { title: 'A' } })
  const initial = await request.post(url, { headers, data: { title: 'B' } }).then(r => r.json()) as Task
  const ids = initial.steps.map(s => s.id)
  const body = { stepId: ids[1], direction: 'up', expectedOrder: ids }
  const read = async () => (await request.get('/api/tasks').then(r => r.json()) as Task[]).find(t => t.id === parent.id)
  for (const origin of [undefined, 'https://etranger.example']) {
    expect((await request.patch(`${url}/order`, { headers: origin ? { Origin: origin } : {}, data: body })).status()).toBe(403)
  }
  expect((await request.patch(`${url}/order`, { headers: { ...headers, 'Content-Type': 'text/plain' }, data: '{}' })).status()).toBe(415)
  expect((await request.patch(`${url}/order`, { headers, data: '{' })).status()).toBe(400)
  for (const data of [null, [], {}, { ...body, direction: 'left' }, { ...body, expectedOrder: [ids[0], ids[0]] }, { ...body, expectedOrder: [1] }, { ...body, title: 'Interdit' }, { title: 'PATCH étape interdit sur order' }]) {
    expect((await request.patch(`${url}/order`, { headers, data: JSON.stringify(data) })).status()).toBe(400)
    expect(await read()).toEqual(initial)
  }
  expect((await request.patch(`/api/tasks/${other.id}/steps/order`, { headers, data: body })).status()).toBe(404)
  expect((await request.patch(`${url}/order`, { headers, data: { ...body, stepId: other.id } })).status()).toBe(404)
  const boundary = await request.patch(`${url}/order`, { headers, data: { ...body, stepId: ids[0] } })
  expect(boundary.status()).toBe(200)
  expect(await boundary.json()).toEqual(initial)
  const moved = await request.patch(`${url}/order`, { headers, data: body })
  expect(moved.status()).toBe(200)
  expect(moved.headers()['cache-control']).toBe('no-store')
  const saved = await moved.json() as Task
  expect(saved.steps.map(s => s.id)).toEqual([...ids].reverse())
  const stale = await request.patch(`${url}/order`, { headers, data: body })
  expect(stale.status()).toBe(409)
  expect((await stale.json()).data.code).toBe('STEP_ORDER_CHANGED')
  expect(stale.headers()['cache-control']).toBe('no-store')
  expect(await read()).toEqual(saved)
  // Ordinary PATCH remains separate, and a state/title change does not stale order.
  await request.patch(`${url}/${ids[0]}`, { headers, data: { title: 'Renommée', completed: true } })
  const fresh = await request.patch(`${url}/order`, { headers, data: { ...body, direction: 'down', expectedOrder: saved.steps.map(s => s.id) } })
  expect(fresh.status()).toBe(200)
  expect((await fresh.json() as Task).steps[0]).toMatchObject({ id: ids[0], title: 'Renommée', completed: true })
  const added = await request.post(url, { headers, data: { title: 'C' } }).then(r => r.json()) as Task
  expect((await request.patch(`${url}/order`, { headers, data: body })).status()).toBe(409)
  expect(await read()).toEqual(added)
  await request.delete(`${url}/${ids[0]}`, { headers })
  const afterDelete = await read()
  expect((await request.patch(`${url}/order`, { headers, data: { ...body, expectedOrder: added.steps.map(s => s.id) } })).status()).toBe(409)
  expect(await read()).toEqual(afterDelete)
})
