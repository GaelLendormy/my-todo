export default defineEventHandler((event) => {
  if (event.path.split('?')[0] !== '/api/tasks' && !event.path.startsWith('/api/tasks/')) return
  setHeader(event, 'Cache-Control', 'no-store')
  if (['GET', 'HEAD'].includes(event.method)) return
  const origins = (process.env.MYTODO_ALLOWED_ORIGINS
    ?? (import.meta.dev ? 'http://127.0.0.1:3000,http://localhost:3000' : ''))
    .split(',').map(value => value.trim()).filter(Boolean)
  const origin = getHeader(event, 'origin')
  if (!origin || !origins.includes(origin)) {
    throw createError({ statusCode: 403, statusMessage: 'Origine refusée', message: 'Cette origine ne peut pas modifier les tâches.' })
  }
  if (['POST', 'PATCH'].includes(event.method)
    && getHeader(event, 'content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') {
    throw createError({ statusCode: 415, statusMessage: 'JSON requis', message: 'Utilisez un corps application/json.' })
  }
})
