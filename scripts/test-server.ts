import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'

export async function startServer(database: string, port: number) {
  const origin = `http://127.0.0.1:${port}`
  const child = spawn(process.execPath, ['.output/server/index.mjs'], {
    env: { ...process.env, NODE_ENV: 'production', HOST: '127.0.0.1', PORT: String(port), MYTODO_DATA_MODE: 'test', MYTODO_DB_PATH: database, MYTODO_ALLOWED_ORIGINS: origin },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  child.stdout.on('data', chunk => { output += chunk })
  child.stderr.on('data', chunk => { output += chunk })
  async function stop() {
    if (child.exitCode !== null || child.signalCode) return
    const exited = once(child, 'exit')
    child.kill('SIGTERM')
    await exited
  }
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(`Serveur arrêté : ${output}`)
    try {
      if (!output.includes('Listening on')) {
        await delay(100)
        continue
      }
      const response = await fetch(`${origin}/api/tasks`)
      if (response.ok) return { origin, stop }
    }
    catch { /* Le serveur démarre. */ }
    await delay(100)
  }
  await stop()
  throw new Error(`Le serveur ne démarre pas : ${output}`)
}
