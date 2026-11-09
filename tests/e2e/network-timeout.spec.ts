import { expect, test } from '@playwright/test'

test('lecture sans réponse : quitte le chargement et permet une reprise explicite', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Actualiser', exact: true })).toBeEnabled()
  await page.clock.install()
  let reads = 0
  await page.route('**/api/tasks', () => {
    // Connexion suspendue : ni réponse HTTP, ni erreur réseau immédiate.
    reads++
  })
  await page.getByRole('button', { name: 'Actualiser', exact: true }).click()
  await expect(page.getByText('Chargement des tâches…')).toBeVisible()
  await page.getByLabel('Nouvelle tâche').fill('Saisie pendant la coupure')
  await page.clock.runFor(10_001)
  await expect(page.getByRole('alert')).toContainText('Impossible de charger', { timeout: 1500 })
  await expect(page.getByText('Chargement des tâches…')).toBeHidden()
  await expect(page.getByLabel('Nouvelle tâche')).toHaveValue('Saisie pendant la coupure')
  expect(reads).toBe(1)
  await page.unroute('**/api/tasks')
  await page.getByRole('button', { name: 'Réessayer le chargement', exact: true }).click()
  await expect(page.getByRole('alert')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Actualiser', exact: true })).toBeEnabled()
})

test('création sans réponse après écriture : délai borné, saisie conservée et aucune répétition', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Actualiser', exact: true })).toBeEnabled()
  await page.clock.install()
  let writes = 0
  await page.route('**/api/tasks', async route => {
    if (route.request().method() !== 'POST') return route.continue()
    await route.fetch()
    writes++
    // Le serveur a écrit ; sa réponse n'est jamais transmise au navigateur.
  })
  const title = `Délai dépassé ${Date.now()}`
  await page.getByLabel('Nouvelle tâche').fill(title)
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await expect.poll(() => writes).toBe(1)
  await page.clock.runFor(10_001)
  await expect(page.getByRole('status')).toContainText('Résultat à vérifier', { timeout: 1500 })
  await expect(page.getByLabel('Nouvelle tâche')).toHaveValue(title)
  await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeDisabled()
  await page.clock.runFor(30_000)
  expect(writes).toBe(1)
  await page.unroute('**/api/tasks')
  await page.getByRole('button', { name: 'Relire la liste avant de réessayer', exact: true }).click()
  await expect(page.getByRole('listitem').filter({ hasText: title })).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeEnabled()
  expect(writes).toBe(1)
})
