import assert from 'node:assert/strict'
import type { Task } from '../shared/types/task'

// Real HTTP operations on the caller's disposable server only.
export async function exerciseSteps(origin: string, parent: Task) {
  const headers = { 'Content-Type': 'application/json', 'Origin': origin }
  const url = `${origin}/api/tasks/${parent.id}/steps`
  async function write(url: string, method: string, body?: object, status = 200) {
    const response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
    assert.equal(response.status, status)
    return await response.json() as Task
  }
  let current = await write(url, 'POST', { title: 'Première étape jetable' }, 201)
  const first = current.steps[0]!
  current = await write(url, 'POST', { title: 'Étape à supprimer' }, 201)
  const removed = current.steps[1]!
  current = await write(url, 'POST', { title: 'Dernière étape jetable' }, 201)
  const last = current.steps[2]!
  current = await write(`${url}/${first.id}`, 'PATCH', { title: 'Première renommée', completed: true })
  current = await write(`${url}/${removed.id}`, 'DELETE')
  if (parent.completed) current = await write(`${url}/${last.id}`, 'PATCH', { completed: true })
  assert.deepEqual(current, { ...parent, steps: [{ ...first, title: 'Première renommée', completed: true }, { ...last, position: 1, completed: parent.completed }] })
  current = await write(`${url}/order`, 'PATCH', { stepId: last.id, direction: 'up', expectedOrder: current.steps.map(step => step.id) })
  assert.deepEqual(current, { ...parent, steps: [{ ...last, position: 0, completed: parent.completed }, { ...first, title: 'Première renommée', completed: true, position: 1 }] })
  return current
}
