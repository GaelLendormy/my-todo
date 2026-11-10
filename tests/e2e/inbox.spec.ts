import { expect, test } from '@playwright/test'

async function emptyList(page: import('@playwright/test').Page) {
  await page.route('**/api/tasks', async (route) => {
    if (route.request().method() === 'GET') await route.fulfill({ json: [] })
    else await route.continue()
  })
}

test('ajoute au clavier, persiste après rechargement et refuse un titre vide', async ({ page }) => {
  await page.goto('/')
  const input = page.getByLabel('Nouvelle tâche')
  await input.fill('   ')
  await input.press('Enter')
  await expect(page.getByRole('status')).toContainText('Le titre doit contenir du texte.')
  const title = `Tâche clavier ${Date.now()}`
  await input.fill(title)
  await input.press('Enter')
  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible()
  await expect(input).toHaveValue('')
  await expect(input).toBeFocused()
  await page.reload()
  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible()
})

test('montre chargement, vide et erreur avec reprise explicite', async ({ page }) => {
  let release!: () => void
  const waiting = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/tasks', async route => {
    await waiting
    await route.fulfill({ json: [] })
  })
  await page.goto('/')
  await expect(page.getByText('Chargement des tâches…')).toBeVisible()
  release()
  await expect(page.getByText('Votre boîte de réception est vide.', { exact: false })).toBeVisible()
  await page.unroute('**/api/tasks')
  await page.route('**/api/tasks', route => route.fulfill({ status: 503, json: {} }))
  await page.getByRole('button', { name: 'Actualiser' }).click()
  await expect(page.getByRole('alert')).toContainText('Impossible de charger')
  await expect(page.getByText('Votre boîte de réception est vide.', { exact: false })).toBeHidden()
  await page.unroute('**/api/tasks')
  await emptyList(page)
  await page.getByRole('button', { name: 'Réessayer le chargement' }).click()
  await expect(page.getByText('Votre boîte de réception est vide.', { exact: false })).toBeVisible()
})

test('bloque les doubles soumissions pendant l’enregistrement', async ({ page }) => {
  await emptyList(page)
  let count = 0
  let release!: () => void
  const waiting = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/tasks', async route => {
    if (route.request().method() !== 'POST') return route.fallback()
    count++
    await waiting
    await route.fulfill({ status: 201, json: { id: 'waiting', title: 'En attente', completed: false, categoryId: null, createdAt: 1 } })
  })
  await page.goto('/')
  await page.getByLabel('Nouvelle tâche').fill('En attente')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Enregistrement…' })).toBeDisabled()
  await page.getByLabel('Nouvelle tâche').press('Enter')
  expect(count).toBe(1)
  release()
  await expect(page.getByRole('listitem')).toHaveCount(1)
})

test('conserve la saisie après refus certain et permet une tentative explicite', async ({ page }) => {
  await emptyList(page)
  let count = 0
  await page.route('**/api/tasks', async route => {
    if (route.request().method() !== 'POST') return route.fallback()
    count++
    await route.fulfill({ status: 400, json: { message: 'Refus' } })
  })
  await page.goto('/')
  await page.getByLabel('Nouvelle tâche').fill('Brouillon conservé')
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Ajout refusé')
  await expect(page.getByLabel('Nouvelle tâche')).toHaveValue('Brouillon conservé')
  await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeEnabled()
  expect(count).toBe(1)
  await expect(page.getByRole('listitem')).toHaveCount(0)
})

test('réponse perdue après écriture : aucune répétition, relecture obligatoire', async ({ page }) => {
  let posts = 0
  await page.route('**/api/tasks', async route => {
    if (route.request().method() !== 'POST') return route.continue()
    posts++
    // Le vrai serveur écrit, mais la réponse ne parvient pas au navigateur.
    await route.fetch()
    await route.abort('failed')
  })
  await page.goto('/')
  const title = `Réponse perdue ${Date.now()}`
  await page.getByLabel('Nouvelle tâche').fill(title)
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Résultat à vérifier')
  await expect(page.getByLabel('Nouvelle tâche')).toHaveValue(title)
  await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Relire la liste avant de réessayer' }).click()
  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeEnabled()
  expect(posts).toBe(1)
})

test('rendu mobile sans débordement avec titre long', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route('**/api/tasks', route => route.fulfill({ json: [{ id: 'long', title: 'UnTrèsLongTitre'.repeat(30), completed: false, categoryId: null, createdAt: 1 }] }))
  await page.goto('/')
  await expect(page.getByRole('listitem')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeInViewport()
})

for (const phase of ['ouverture', 'actualisation']) {
  test(`coordonne lecture différée et ajout pendant ${phase}`, async ({ page }) => {
    let reads = 0
    let posts = 0
    let release!: () => void
    const waiting = new Promise<void>(resolve => { release = resolve })
    const deferredRead = phase === 'ouverture' ? 1 : 2
    await page.route('**/api/tasks', async route => {
      if (route.request().method() === 'POST') {
        posts++
        return route.continue()
      }
      reads++
      if (reads === deferredRead) await waiting
      await route.fulfill({ json: [] })
    })
    await page.goto('/')
    if (phase === 'actualisation') {
      await expect(page.getByText('Votre boîte de réception est vide.', { exact: false })).toBeVisible()
      await page.getByRole('button', { name: 'Actualiser' }).click()
    }
    await expect(page.getByText('Chargement des tâches…')).toBeVisible()
    const title = `Capture pendant ${phase}`
    const input = page.getByLabel('Nouvelle tâche')
    await input.fill(title)
    const submit = page.getByRole('button', { name: 'Ajouter', exact: true })
    await expect(submit).toBeDisabled()
    // Entrée doit aussi respecter la coordination, pas seulement le bouton.
    await input.press('Enter')
    expect(posts).toBe(0)
    await expect(input).toHaveValue(title)
    release()
    await expect(submit).toBeEnabled()
    await expect(input).toHaveValue(title)
    await input.press('Enter')
    await expect(page.getByRole('status')).toContainText('Tâche enregistrée.')
    await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible()
    await expect(input).toHaveValue('')
    expect(posts).toBe(1)
  })
}
