import { homedir } from 'node:os'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { realpathSync } from 'node:fs'

// Resolve existing ancestors too, so a symlink cannot place data in public assets.
function canonical(path: string): string {
  try { return realpathSync(path) }
  catch {
    const parent = resolve(path, '..')
    if (parent === path) return path
    return resolve(canonical(parent), relative(parent, path))
  }
}

export function databasePath(env: NodeJS.ProcessEnv = process.env, cwd = process.cwd()) {
  const mode = env.MYTODO_DATA_MODE || 'development'
  if (!['development', 'test', 'personal'].includes(mode)) throw new Error('Mode de données invalide')
  const supplied = env.MYTODO_DB_PATH
  if (mode === 'test' && (!supplied || !isAbsolute(supplied))) throw new Error('Les tests exigent un chemin absolu isolé')
  const path = canonical(resolve(cwd, supplied || (mode === 'personal'
    ? resolve(homedir(), '.local/share/my-todo/tasks.sqlite')
    : '.data/development/tasks.sqlite')))
  for (const root of ['public', 'app', '.output/public']) {
    const delta = relative(canonical(resolve(cwd, root)), path)
    if (!delta.startsWith(`..${sep}`) && delta !== '..' && !isAbsolute(delta)) throw new Error('Base interdite dans les ressources HTTP')
  }
  if (mode === 'personal') {
    const delta = relative(canonical(cwd), path)
    if (!delta.startsWith(`..${sep}`) && delta !== '..' && !isAbsolute(delta)) throw new Error('La base personnelle doit rester hors du dépôt')
  }
  return path
}
