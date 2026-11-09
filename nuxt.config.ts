export default defineNuxtConfig({
  compatibilityDate: '2026-11-09',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  typescript: { strict: true },
  app: { head: { htmlAttrs: { lang: 'fr' }, title: 'My To Do' } },
})
