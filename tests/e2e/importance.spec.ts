import { expect, test } from '@playwright/test'
import type { Task } from '../../shared/types/task'
import type { Category } from '../../shared/types/category'
const headers = { Origin: 'http://127.0.0.1:3100' }

for (const width of [390, 1280]) {
  test(`informations et filtres ${width}px : brouillon, confirmation, sortie de filtre et capture`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 844 })
    const task = await request.post('/api/tasks', { headers, data: { title: `Importance ${width} ${Date.now()}` } }).then(r => r.json()) as Task
    const category = await request.post('/api/categories', { headers, data: { name: `M2 ${width} ${Date.now()}` } }).then(r => r.json()) as Category
    await page.goto('/')
    await page.getByRole('button', { name: task.title, exact: true }).click()
    await page.locator('aside').getByLabel('Priorité', { exact: true }).selectOption('low')
    await page.getByLabel('Date limite', { exact: true }).fill('2000-02-29')
    await page.getByRole('button', { name: 'Annuler', exact: true }).click()
    await page.getByRole('button', { name: task.title, exact: true }).click()
    await expect(page.locator('aside').getByLabel('Priorité', { exact: true })).toHaveValue('Sans priorité')
    await expect(page.getByLabel('Date limite', { exact: true })).toHaveValue('')
    await page.locator('aside').getByLabel('Priorité', { exact: true }).selectOption('high')
    await page.getByLabel('Date limite', { exact: true }).fill('2000-02-29')
    await page.getByLabel('Rechercher une catégorie').fill(category.name)
    await page.locator('.suggestions').getByRole('button', { name: category.name, exact: true }).click()
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
    await expect(page.locator('aside')).toBeHidden()
    const saved = (await request.get('/api/tasks').then(r => r.json()) as Task[]).find(t => t.id === task.id)!
    expect(saved).toEqual({ ...task, categoryId: category.id, priority: 'high', dueDate: '2000-02-29' })
    if (width === 390) await page.getByRole('button', { name: 'Choisir une vue' }).click()
    await page.getByRole('button', { name: 'Toutes les tâches', exact: true }).click()
    await page.locator('#filter-category').selectOption(category.id)
    await page.locator('#filter-priority').selectOption('high')
    await page.locator('#filter-due').selectOption('overdue')
    const row = page.locator('li').filter({ has: page.getByRole('button', { name: task.title, exact: true }) })
    await expect(row).toContainText('En retard')
    await expect(row).toContainText('29/02/2000')
    await page.getByRole('button', { name: task.title, exact: true }).click()
    await page.locator('aside').getByLabel('Priorité', { exact: true }).selectOption('normal')
    let body: unknown
    await page.route(`**/api/tasks/${task.id}`, async route => { body = route.request().postDataJSON(); await route.continue() })
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
    await expect(page.locator('aside')).toBeHidden()
    expect(body).toEqual({ priority: 'normal' })
    await expect(page.locator('#filter-priority')).toHaveValue('high')
    await expect(page.getByRole('status')).toContainText('ne correspond plus')
    await expect(page.locator('.empty')).toContainText('Aucun résultat')
    await expect(page.locator('#new-title:focus, .list-pane button:focus')).toBeVisible()
    const capture = `Capture M2 ${width} ${Date.now()}`
    await page.getByLabel('Nouvelle tâche').fill(capture)
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Boîte de réception')
    const created = (await request.get('/api/tasks').then(r => r.json()) as Task[]).find(t => t.title === capture)
    expect(created).toMatchObject({ categoryId: null, priority: null, dueDate: null })
    await page.getByRole('button', { name: 'Réinitialiser les filtres' }).click()
    await page.locator('#filter-category').selectOption(category.id)
    await page.locator('#filter-due').selectOption('exact')
    await page.getByLabel('Date précise', { exact: true }).fill('2000-02-29')
    await expect(page.getByRole('button', { name: task.title, exact: true })).toBeVisible()
    await page.getByRole('button', { name: task.title, exact: true }).click()
    await page.locator('aside').getByLabel('Priorité', { exact: true }).selectOption({ label: 'Sans priorité' })
    await page.getByRole('button', { name: 'Effacer la date limite' }).click()
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
    await expect(page.locator('aside')).toBeHidden()
    await page.locator('#filter-due').selectOption('none')
    await page.locator('#filter-priority').selectOption('none')
    await expect(page.getByRole('button', { name: task.title, exact: true })).toBeVisible()
    if (width === 390) await page.getByRole('button', { name: 'Choisir une vue' }).click()
    await page.getByRole('button', { name: 'Boîte de réception', exact: true }).click()
    if (width === 390) await page.getByRole('button', { name: 'Choisir une vue' }).click()
    await page.getByRole('button', { name: 'Toutes les tâches', exact: true }).click()
    await expect(page.locator('#filter-category')).toHaveValue('all')
    await expect(page.locator('#filter-priority')).toHaveValue('all')
    await expect(page.locator('#filter-due')).toHaveValue('all')
  })
}

for (const lost of [false, true]) {
  test(`brouillon enrichi mobile après ${lost ? 'réponse perdue' : 'refus'} et disparition de catégorie`, async ({ page, request }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const task = await request.post('/api/tasks', { headers, data: { title: `Erreur M2 ${Date.now()}` } }).then(r => r.json()) as Task
    const category = await request.post('/api/categories', { headers, data: { name: `Erreur cat ${Date.now()}` } }).then(r => r.json()) as Category
    await page.goto('/')
    await page.getByRole('button', { name: task.title, exact: true }).click()
    await page.getByLabel('Titre de la tâche').fill(`${task.title} brouillon`)
    await page.locator('aside').getByLabel('Priorité', { exact: true }).selectOption('high')
    await page.getByLabel('Date limite', { exact: true }).fill('2024-02-29')
    await page.getByLabel('Rechercher une catégorie').fill(category.name)
    await page.locator('.suggestions').getByRole('button', { name: category.name, exact: true }).click()
    let writes = 0
    await page.route(`**/api/tasks/${task.id}`, async route => {
      writes++
      if (lost) { await route.fetch(); await route.abort('failed') }
      else await route.fulfill({ status: 403, json: {} })
    })
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
    await expect(page.getByRole('status')).toContainText(lost ? 'Résultat à vérifier' : 'Modification refusée')
    await expect(page.locator('aside')).toBeVisible()
    await expect(page.getByLabel('Titre de la tâche')).toHaveValue(`${task.title} brouillon`)
    await expect(page.locator('aside').getByLabel('Priorité', { exact: true })).toHaveValue('high')
    await expect(page.getByLabel('Date limite', { exact: true })).toHaveValue('2024-02-29')
    const saved = (await request.get('/api/tasks').then(r => r.json()) as Task[]).find(t => t.id === task.id)
    expect(saved).toEqual(lost ? { ...task, title: `${task.title} brouillon`, priority: 'high', dueDate: '2024-02-29', categoryId: category.id } : task)
    await request.delete(`/api/categories/${category.id}`, { headers })
    if (lost) {
      await page.route('**/api/categories', route => route.fulfill({ status: 503, json: {} }))
      await page.getByRole('button', { name: 'Relire la liste avant de réessayer' }).click()
      await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeDisabled()
      await page.unroute('**/api/categories')
      await page.getByRole('button', { name: 'Relire la liste avant de réessayer' }).click()
    }
    else await page.getByRole('button', { name: 'Actualiser', exact: true }).click()
    await expect(page.locator('aside')).toBeVisible()
    await expect(page.locator('aside').getByRole('alert')).toContainText('Catégorie indisponible')
    await expect(page.locator('aside').getByLabel('Priorité', { exact: true })).toHaveValue('high')
    await expect(page.getByLabel('Date limite', { exact: true })).toHaveValue('2024-02-29')
    expect(writes).toBe(1)
  })
}

test('jour local, filtres et réalisation : horloge et retour d’onglet sans écriture ni perte du brouillon', async ({ page, request }) => {
  await page.clock.install({ time: new Date(2026, 10, 10, 23, 59, 50) })
  const task = await request.post('/api/tasks', { headers, data: { title: `Jour M2 ${Date.now()}` } }).then(r => r.json()) as Task
  await request.patch(`/api/tasks/${task.id}`, { headers, data: { dueDate: '2026-11-10', priority: 'low' } })
  await page.goto('/')
  await page.getByRole('button', { name: 'Toutes les tâches', exact: true }).click()
  await page.locator('#filter-due').selectOption('today')
  await page.getByRole('button', { name: task.title, exact: true }).click()
  await page.getByLabel('Titre de la tâche').fill('Brouillon au lendemain')
  let writes = 0
  page.on('request', req => { if (req.method() === 'PATCH') writes++ })
  await page.clock.fastForward(11000)
  await expect(page.locator('aside')).toContainText('En retard')
  await expect(page.locator('aside')).toContainText('ne correspond plus')
  await expect(page.getByLabel('Titre de la tâche')).toHaveValue('Brouillon au lendemain')
  expect(writes).toBe(0)
  await page.getByRole('button', { name: 'Annuler', exact: true }).click()
  await page.locator('#filter-due').selectOption('overdue')
  await page.getByRole('checkbox', { name: `Terminer : ${task.title}`, exact: true }).click()
  await expect(page.getByRole('button', { name: task.title, exact: true })).toBeHidden()
  await page.locator('#filter-due').selectOption('all')
  await page.getByRole('button', { name: /Terminées \(/ }).click()
  const row = page.locator('li').filter({ has: page.getByRole('button', { name: task.title, exact: true }) })
  await expect(row).not.toContainText('En retard')
  await page.getByRole('checkbox', { name: `Rouvrir : ${task.title}`, exact: true }).click()
  await expect(row).toContainText('En retard')
  await page.clock.setSystemTime(new Date(2026, 10, 10, 12))
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(row).not.toContainText('En retard')
  expect(writes).toBe(2)
})

test('API : dates civiles, priorités et refus atomiques conservent les autres champs', async ({ request }) => {
  const task = await request.post('/api/tasks', { headers, data: { title: `API M2 ${Date.now()}` } }).then(r => r.json()) as Task
  expect(task).toMatchObject({ priority: null, dueDate: null })
  for (const data of [{ priority: 'urgent' }, { dueDate: '1900-02-29' }, { dueDate: '2026-02-31' }, { dueDate: 42 }]) {
    expect((await request.patch(`/api/tasks/${task.id}`, { headers, data: { title: 'Partiel interdit', ...data } })).status()).toBe(400)
    expect((await request.get('/api/tasks').then(r => r.json()) as Task[]).find(t => t.id === task.id)).toEqual(task)
  }
  for (const priority of ['low', 'normal', 'high', null]) {
    const response = await request.patch(`/api/tasks/${task.id}`, { headers, data: { priority, dueDate: '2000-02-29' } })
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ ...task, priority, dueDate: '2000-02-29' })
  }
  expect(await request.patch(`/api/tasks/${task.id}`, { headers, data: { dueDate: null } }).then(r => r.json())).toEqual(task)
})

for (const width of [390, 1280]) {
  test(`confirmation priorité/date ${width}px : attente, retour avec filtres et Terminées`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 844 })
    const task = await request.post('/api/tasks', { headers, data: { title: `Confirmation M2 ${width} ${Date.now()}` } }).then(r => r.json()) as Task
    await request.patch(`/api/tasks/${task.id}`, { headers, data: { completed: true, priority: 'high', dueDate: '2000-02-29' } })
    await page.goto('/')
    if (width === 390) await page.getByRole('button', { name: 'Choisir une vue' }).click()
    await page.getByRole('button', { name: 'Toutes les tâches', exact: true }).click()
    await page.locator('#filter-priority').selectOption('high')
    await page.getByRole('button', { name: /Terminées \(/ }).click()
    await page.getByRole('button', { name: task.title, exact: true }).click()
    await page.locator('#edit-due-date').fill('2024-02-29')
    // Une relecture externe ne modifie ni le brouillon ni sa référence de comparaison.
    await request.patch(`/api/tasks/${task.id}`, { headers, data: { title: `${task.title} externe`, priority: 'normal' } })
    await page.getByRole('button', { name: 'Actualiser', exact: true }).click()
    await expect(page.locator('aside')).toContainText('ne correspond plus')
    await expect(page.locator('#edit-priority')).toHaveValue('high')
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    let writes = 0
    let body: unknown
    await page.route(`**/api/tasks/${task.id}`, async route => {
      writes++
      body = route.request().postDataJSON()
      const response = await route.fetch()
      await gate
      await route.fulfill({ response })
    })
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Enregistrement en cours')
    await expect(page.locator('aside')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeDisabled()
    release()
    await expect(page.locator('aside')).toBeHidden()
    await expect(page.getByRole('status')).toContainText('ne correspond plus')
    expect(body).toEqual({ dueDate: '2024-02-29' })
    expect(writes).toBe(1)
    await expect(page.getByRole('button', { name: /Terminées \(/ })).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('#filter-priority')).toHaveValue('high')
    expect((await request.get('/api/tasks').then(r => r.json()) as Task[]).find(t => t.id === task.id)).toEqual({ ...task, title: `${task.title} externe`, completed: true, priority: 'normal', dueDate: '2024-02-29' })
    await page.locator('#filter-priority').selectOption('normal')
    await page.getByRole('button', { name: `${task.title} externe`, exact: true }).click()
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
    await expect(page.locator('aside')).toBeHidden()
    await expect(page.getByRole('status')).toContainText('Aucune modification')
    expect(writes).toBe(1)
  })
}
