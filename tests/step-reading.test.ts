import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, vi } from 'vitest'
import { applyMigrations, openDatabase } from '../server/db/database'
import { readTasks } from '../server/domain/task-reading'
import { stepRepository } from '../server/domain/task-steps'
import { taskRepository } from '../server/domain/tasks'

// Both connections execute real SQLite queries. The first SELECT's return is a
// synchronous barrier: the writer commits before the reader can SELECT parents.
function readAcrossCommit(transactional: boolean) {
  const directory = mkdtempSync(join(tmpdir(), 'mytodo-step-reading-'))
  let reader: ReturnType<typeof openDatabase> | undefined
  let writer: ReturnType<typeof openDatabase> | undefined
  let restorePrepare: (() => void) | undefined
  try {
    reader = openDatabase(join(directory, 'tasks.sqlite'))
    applyMigrations(reader)
    // WAL permits the second connection to commit while the read snapshot lives.
    expect(reader.sqlite.pragma('journal_mode = WAL', { simple: true })).toBe('wal')
    writer = openDatabase(join(directory, 'tasks.sqlite'))
    const repo = taskRepository(reader)
    const task = repo.create({ title: 'Lecture concurrente' })
    const before = stepRepository(reader).create(task.id, { title: 'Dernière étape' })
    const step = before.steps[0]!
    const phases: string[] = []
    let committed: typeof before | undefined
    const prepare = reader.sqlite.prepare.bind(reader.sqlite)
    const writerSteps = stepRepository(writer)
    const interception = vi.spyOn(reader.sqlite, 'prepare').mockImplementation((sql) => {
      const statement = prepare(sql)
      const isSteps = /from "task_steps"/.test(sql)
      const isParents = /from "tasks"/.test(sql)
      if (isSteps || isParents) {
        const all = statement.all.bind(statement)
        const execution = vi.spyOn(statement, 'all').mockImplementation((...parameters) => {
          const rows = all(...parameters)
          execution.mockRestore()
          if (isSteps) {
            phases.push('steps-read')
            committed = writerSteps.update(task.id, step.id, { completed: true })
            phases.push('writer-committed')
          }
          else phases.push('parents-read')
          return rows
        })
      }
      return statement
    })
    restorePrepare = () => interception.mockRestore()
    const during = transactional ? repo.list() : readTasks(reader)
    interception.mockRestore()
    expect(phases).toEqual(['steps-read', 'writer-committed', 'parents-read'])
    expect(committed).toEqual({ ...before, completed: true, steps: [{ ...step, completed: true }] })
    const after = repo.list()
    expect(after).toEqual([committed])
    return { before, during, after }
  }
  finally {
    restorePrepare?.()
    writer?.close()
    reader?.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

it('lit étapes et parent dans un même état confirmé malgré une mutation entre les deux SELECT', () => {
  const { before, during } = readAcrossCommit(true)
  expect(during).toEqual([before])
  expect(during[0]!.completed).toBe(during[0]!.steps.every(step => step.completed))
})

it('contrôle négatif : sans transaction, le même entrelacement mélange étapes anciennes et parent confirmé', () => {
  const { before, during, after } = readAcrossCommit(false)
  expect(during).toEqual([{ ...before, completed: true }])
  expect(during[0]!.steps).toEqual(before.steps)
  expect(during[0]!.completed).toBe(after[0]!.completed)
  expect(() => expect(during[0]!.completed).toBe(during[0]!.steps.every(step => step.completed))).toThrow()
})
