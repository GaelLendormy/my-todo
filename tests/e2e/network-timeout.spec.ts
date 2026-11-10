import { expect, test } from '@playwright/test'

for (const width of [390, 1280]) {
  for (const failure of ['503', 'timeout'] as const) {
    test(`détail ${width}px : erreur ${failure} visible, reprise et brouillon conservés`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      const task = { id: '00000000-0000-4000-8000-000000000000', title: 'Détail lecture isolée', completed: false, createdAt: 1 }
      let mode: 'success' | '503' | 'timeout' = 'success'
      let reads = 0
      let writes = 0
      await page.route('**/api/tasks', route => {
        if (route.request().method() !== 'GET') {
          writes++
          return route.abort('failed')
        }
        reads++
        if (mode === 'success') return route.fulfill({ json: [task] })
        if (mode === '503') return route.fulfill({ status: 503, json: {} })
        // La réponse reste suspendue jusqu'au délai applicatif.
      })
      await page.goto('/')
      await page.getByRole('button', { name: task.title, exact: true }).click()
      const draft = 'Brouillon à préserver'
      await page.getByLabel('Titre de la tâche').fill(draft)
      await page.getByLabel('Nouvelle tâche').fill('Capture à préserver')
      await page.clock.install()
      mode = failure
      await page.getByRole('button', { name: 'Actualiser', exact: true }).click()
      let loadingVisible = false
      if (failure === 'timeout') {
        loadingVisible = await page.getByText('Chargement des tâches…').isVisible()
        await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeDisabled()
        await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeDisabled()
        await page.getByLabel('Titre de la tâche').press('Enter')
        await page.getByLabel('Nouvelle tâche').press('Enter')
        await page.clock.runFor(10_001)
      }
      const error = page.getByRole('alert')
      const retry = page.getByRole('button', { name: 'Réessayer le chargement', exact: true })
      await expect(error).toBeVisible()
      await expect(error).toContainText('Impossible de charger les tâches')
      await expect(retry).toBeVisible()
      await expect(error).toHaveCount(1)
      await expect(retry).toHaveCount(1)
      await expect(page.getByText('Chargement des tâches…')).toBeHidden()
      await expect(page.locator('aside')).toBeVisible()
      await expect(page.getByLabel('Titre de la tâche')).toHaveValue(draft)
      await expect(page.getByLabel('Nouvelle tâche')).toHaveValue('Capture à préserver')
      await expect(page.getByText('Votre boîte de réception est vide.', { exact: false })).toBeHidden()
      if (failure === 'timeout') expect(loadingVisible).toBe(true)
      expect(reads).toBe(2)
      expect(writes).toBe(0)
      mode = 'success'
      task.title = 'Titre serveur relu'
      await retry.click()
      await expect(error).toBeHidden()
      await expect(page.locator('aside')).toBeVisible()
      await expect(page.getByLabel('Titre de la tâche')).toHaveValue(draft)
      await expect(page.getByLabel('Nouvelle tâche')).toHaveValue('Capture à préserver')
      await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeEnabled()
      expect(reads).toBe(3)
      expect(writes).toBe(0)
      await page.getByRole('button', { name: 'Retour à la liste', exact: true }).click()
      await expect(page.getByRole('button', { name: task.title, exact: true })).toBeVisible()
    })
  }
}

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
