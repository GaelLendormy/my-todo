import { desc, eq } from 'drizzle-orm'
import type { openDatabase } from '../db/database'
import { tasks, taskSteps } from '../db/schema'

export function readTask(connection: ReturnType<typeof openDatabase>, id: string) {
  const task = connection.db.select().from(tasks).where(eq(tasks.id, id)).get()
  if (!task) return undefined
  return { ...task, steps: connection.db.select().from(taskSteps).where(eq(taskSteps.taskId, id)).orderBy(taskSteps.position).all() }
}

// Call inside a read or write transaction so parent and steps share a snapshot.
export function readTasks(connection: ReturnType<typeof openDatabase>) {
  const steps = connection.db.select().from(taskSteps).orderBy(taskSteps.taskId, taskSteps.position).all()
  const byTask = new Map<string, typeof steps>()
  for (const step of steps) {
    const group = byTask.get(step.taskId) ?? []
    group.push(step)
    byTask.set(step.taskId, group)
  }
  return connection.db.select().from(tasks).orderBy(desc(tasks.createdAt), desc(tasks.id)).all()
    .map(task => ({ ...task, steps: byTask.get(task.id) ?? [] }))
}
