export default defineEventHandler((event) => {
  const path = event.path.split('?')[0] || ''
  if (/\.(?:sqlite|sqlite3|db)(?:-[a-z]+)?$/i.test(path) || /^\/(?:\.data|server|migrations)(?:\/|$)/.test(path)) {
    throw createError({ statusCode: 404, statusMessage: 'Ressource introuvable' })
  }
})
