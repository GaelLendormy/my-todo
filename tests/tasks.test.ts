import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { applyMigrations, openDatabase } from '../server/db/database'
import { parseCreation, taskRepository } from '../server/domain/tasks'

let directory: string
let connection: ReturnType<typeof openDatabase>
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'mytodo-domain-'))
  connection = openDatabase(join(directory, 'tasks.sqlite'))
  applyMigrations(connection)
})
afterEach(() => {
  connection.close()
  rmSync(directory, { recursive: true, force: true })
})
it.each([null, [], true, 'Titre', 1, {}, { title: 12 }, { title: null }, { title: 'Titre', completed: false }, { title: '' }, { title: ' \n\t\u2003 ' }, { title: '\0' }])('refuse une création invalide %j sans écriture', (input) => {
  expect(() => taskRepository(connection).create(input)).toThrow()
  expect(taskRepository(connection).list()).toEqual([])
})
it('normalise les espaces Unicode sans altérer le texte interne', () => {
  expect(parseCreation({ title: '\u2003 Acheter  du pain \n' })).toEqual({ title: 'Acheter  du pain' })
})
it('autorise deux créations volontaires de même titre', () => {
  const repository = taskRepository(connection)
  const a = repository.create({ title: 'Pain' })
  const b = repository.create({ title: 'Pain' })
  expect(a.id).not.toBe(b.id)
  expect(repository.list()).toHaveLength(2)
})

it.each([null, [], true, 'Titre', {}, { title: ' ' }, { title: null }, { completed: 1 }, { completed: 'true' }, { completed: null }, { title: 'T', extra: true }, { id: 'id' }])('refuse une modification invalide %j sans écriture', (input) => {
  const repository = taskRepository(connection)
  const task = repository.create({ title: 'Original' })
  expect(() => repository.update(task.id, input)).toThrow()
  expect(repository.list()).toEqual([task])
})
it('modifie seulement les champs soumis avec états cibles idempotents', () => {
  const repository = taskRepository(connection)
  const original = repository.create({ title: 'Original' })
  const completed = repository.update(original.id, { completed: true })
  expect(completed).toEqual({ ...original, completed: true })
  expect(repository.update(original.id, { completed: true })).toEqual(completed)
  const renamed = repository.update(original.id, { title: '  Nouveau  ' })
  expect(renamed).toEqual({ ...completed, title: 'Nouveau' })
  expect(repository.update(original.id, { title: 'Final', completed: false })).toEqual({ ...original, title: 'Final' })
})
it('refuse identifiants invalides et cibles absentes sans recréation', () => {
  const repository = taskRepository(connection)
  for (const id of [null, '', '../tasks', 'id']) {
    expect(() => repository.update(id, { title: 'T' })).toThrow('Identifiant invalide')
    expect(() => repository.remove(id)).toThrow('Identifiant invalide')
  }
  const absent = '00000000-0000-4000-8000-000000000000'
  expect(() => repository.update(absent, { completed: true })).toThrow('absente')
  expect(() => repository.remove(absent)).toThrow('absente')
  expect(repository.list()).toEqual([])
})
it.each([false, true])('persiste les modifications et la suppression (terminée = %j) après réouverture', (completed) => {
  let repository = taskRepository(connection)
  const task = repository.create({ title: 'Original' })
  const saved = repository.update(task.id, { title: 'Modifié', completed })
  connection.close()
  connection = openDatabase(join(directory, 'tasks.sqlite'))
  repository = taskRepository(connection)
  expect(repository.list()).toEqual([saved])
  repository.remove(task.id)
  connection.close()
  connection = openDatabase(join(directory, 'tasks.sqlite'))
  repository = taskRepository(connection)
  expect(repository.list()).toEqual([])
  expect(() => repository.update(task.id, { title: 'Tardif' })).toThrow('absente')
  expect(repository.list()).toEqual([])
})
