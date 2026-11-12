import { expect, test, type Page, type APIRequestContext } from '@playwright/test'
import type { Category } from '../../shared/types/category'
import type { Task } from '../../shared/types/task'

const headers = { Origin: 'http://127.0.0.1:3100' }
const unique = (name: string) => `${name} ${Date.now()}-${Math.random().toString(16).slice(2, 7)}`
async function category(request: APIRequestContext, name = unique('Maison')): Promise<Category> {
  return request.post('/api/categories', { headers, data: { name } }).then(r => r.json())
}
async function task(request: APIRequestContext, categoryId: string | null = null, completed = false): Promise<Task> {
  const created = await request.post('/api/tasks', { headers, data: { title: unique('Tâche') } }).then(r => r.json()) as Task
  return request.patch(`/api/tasks/${created.id}`, { headers, data: { categoryId, completed } }).then(r => r.json())
}
async function navigate(page: Page, name: string) {
  const menu = page.getByRole('button', { name: 'Choisir une vue', exact: true })
  if (await menu.isVisible() && await menu.getAttribute('aria-expanded') === 'false') await menu.click()
  await page.getByRole('navigation').getByRole('button', { name, exact: true }).click()
  await expect(page.getByRole('heading', { name, exact: true })).toBeFocused()
}
function row(page: Page, title: string) { return page.getByRole('listitem').filter({ has: page.getByRole('button', { name: title, exact: true }) }) }

test('vues directes, sections, catégorie vide, renommage et suppression confirmée', async ({ page, request }) => {
  const a = await category(request)
  const b = await category(request)
  const inbox = await task(request)
  const active = await task(request, a.id)
  const completed = await task(request, a.id, true)
  await page.goto('/')
  await expect(row(page, inbox.title)).toBeVisible()
  await expect(row(page, active.title)).toBeHidden()
  await navigate(page, b.name)
  await expect(page.getByText('Cette vue ne contient aucune tâche.')).toBeVisible()
  await navigate(page, a.name)
  await expect(row(page, active.title)).toBeVisible()
  await expect(row(page, inbox.title)).toBeHidden()
  await page.getByRole('button', { name: /^Terminées/ }).click()
  await expect(row(page, completed.title)).toBeVisible()
  await page.getByRole('button', { name: completed.title, exact: true }).click()
  await page.getByRole('button', { name: 'Retour à la liste' }).click()
  await expect(page.getByRole('button', { name: /^Terminées/ })).toHaveAttribute('aria-expanded', 'true')
  await navigate(page, b.name)
  await expect(page.getByRole('button', { name: /^Terminées/ })).toHaveAttribute('aria-expanded', 'false')
  await navigate(page, a.name)
  await expect(page.getByRole('button', { name: /^Terminées/ })).toHaveAttribute('aria-expanded', 'true')
  const renamed = unique('Logement')
  await page.getByLabel('Nom de la catégorie').fill(renamed)
  await page.getByRole('button', { name: 'Renommer la catégorie' }).click()
  await expect(page.getByRole('heading', { name: renamed, exact: true })).toBeVisible()
  await expect(row(page, active.title)).toBeVisible()
  await expect(row(page, completed.title)).toBeVisible()
  await page.getByRole('button', { name: 'Supprimer la catégorie' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText(renamed)
  await expect(dialog).toContainText('conservées sans catégorie')
  await expect(dialog.getByRole('button', { name: 'Annuler' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Supprimer', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Supprimer la catégorie' })).toBeFocused()
  await expect(row(page, active.title)).toBeVisible()
  await page.getByRole('button', { name: 'Supprimer la catégorie' }).click()
  await dialog.getByRole('button', { name: 'Supprimer', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Boîte de réception', exact: true })).toBeFocused()
  await expect(page.getByRole('status')).toContainText('a disparu')
  await expect(row(page, active.title)).toBeVisible()
  await page.getByRole('button', { name: /^Terminées/ }).click()
  await expect(row(page, completed.title)).toBeVisible()
  await navigate(page, 'Toutes les tâches')
  await expect(row(page, inbox.title)).toBeVisible()
  await expect(row(page, active.title)).toBeVisible()
  await page.reload()
  await expect(row(page, active.title)).toBeVisible()
})

test('sélecteur au clavier : recherche distincte, création explicite, brouillon et annulation', async ({ page, request }) => {
  const a = await category(request)
  const created = await task(request)
  await page.goto('/')
  await page.getByRole('button', { name: created.title, exact: true }).click()
  const search = page.getByLabel('Rechercher une catégorie')
  await search.fill(a.name.toUpperCase())
  await search.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('.suggestions').getByRole('button', { name: a.name, exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('.category-picker')).toContainText(`Catégorie sélectionnée : ${a.name}`)
  const typedName = unique('Simple saisie')
  await search.fill(typedName)
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Modification enregistrée')
  expect((await request.get('/api/tasks').then(r => r.json())).find((t: Task) => t.id === created.id).categoryId).toBe(a.id)
  expect((await request.get('/api/categories').then(r => r.json())).some((c: Category) => c.name === typedName)).toBe(false)
  await expect(page.locator('aside')).toBeHidden()
  await navigate(page, 'Toutes les tâches')
  await page.getByRole('button', { name: created.title, exact: true }).click()
  await page.getByLabel('Titre de la tâche').fill('Brouillon conservé')
  const name = unique('Nouvelle depuis détail')
  await search.fill(name)
  await page.getByRole('button', { name: /^Créer la catégorie «/ }).click()
  await expect(page.getByRole('status')).toContainText('Le classement de la tâche attend Enregistrer')
  await expect(page.getByLabel('Titre de la tâche')).toHaveValue('Brouillon conservé')
  await expect(page.locator('.category-picker')).toContainText(`Catégorie sélectionnée : ${name}`)
  expect((await request.get('/api/tasks').then(r => r.json())).find((t: Task) => t.id === created.id).categoryId).toBe(a.id)
  await page.getByRole('button', { name: 'Annuler', exact: true }).click()
  expect((await request.get('/api/categories').then(r => r.json())).some((c: Category) => c.name === name)).toBe(true)
  await navigate(page, 'Toutes les tâches')
  await page.getByRole('button', { name: created.title, exact: true }).click()
  await expect(page.getByLabel('Titre de la tâche')).toHaveValue(created.title)
  await expect(page.locator('.category-picker')).toContainText(`Catégorie sélectionnée : ${a.name}`)
  await search.fill(name)
  await page.getByRole('button', { name: /^Créer la catégorie «/ }).click()
  await expect(page.getByRole('status')).toContainText('Ce nom existe déjà')
  await expect(search).toHaveValue(name)
  await page.getByRole('button', { name: 'Actualiser', exact: true }).click()
  await page.locator('.suggestions').getByRole('button', { name: 'Sans catégorie', exact: true }).click()
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Modification enregistrée')
  expect((await request.get('/api/tasks').then(r => r.json())).find((t: Task) => t.id === created.id).categoryId).toBeNull()
})

test('téléphone : capture sans héritage, retour après déplacement, focus et changement de vue', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const a = await category(request)
  const b = await category(request)
  const created = await task(request, a.id)
  await page.goto('/')
  await navigate(page, a.name)
  const capture = unique('Capture boîte')
  await page.getByLabel('Nouvelle tâche').fill(capture)
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('enregistrée dans la Boîte de réception')
  await expect(row(page, capture)).toBeHidden()
  await page.getByRole('button', { name: 'Voir la Boîte de réception' }).click()
  await expect(row(page, capture)).toBeVisible()
  await navigate(page, a.name)
  await page.getByRole('button', { name: created.title, exact: true }).click()
  await expect(page.locator('.list-pane')).toBeHidden()
  await page.getByLabel('Rechercher une catégorie').fill(b.name)
  await page.locator('.suggestions').getByRole('button', { name: b.name, exact: true }).click()
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Modification enregistrée. Cette tâche ne correspond plus à la vue consultée.')
  await expect(page.locator('aside')).toBeHidden()
  await expect(page.locator('.list-pane')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.getByLabel('Nouvelle tâche')).toBeFocused()
  await navigate(page, b.name)
  await page.getByRole('button', { name: created.title, exact: true }).click()
  await page.getByLabel('Titre de la tâche').fill('Abandon volontaire')
  await navigate(page, 'Toutes les tâches')
  await expect(page.locator('aside')).toBeHidden()
  await page.getByRole('button', { name: created.title, exact: true }).click()
  await expect(page.getByLabel('Titre de la tâche')).toHaveValue(created.title)
})

for (const resource of ['tasks', 'categories']) {
  test(`publication commune : GET ${resource} différé, aucune mutation automatique`, async ({ page, request }) => {
    const a = await category(request)
    const created = await task(request)
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    let writes = 0
    await page.route('**/api/categories', async route => {
      if (route.request().method() !== 'GET') writes++
      if (resource === 'categories') await gate
      await route.continue()
    })
    await page.route('**/api/tasks', async route => {
      if (route.request().method() !== 'GET') writes++
      if (resource === 'tasks') await gate
      await route.continue()
    })
    await page.goto('/')
    await expect(page.getByText('Chargement des tâches…')).toBeVisible()
    await expect(page.getByRole('navigation').getByRole('button', { name: a.name, exact: true })).toBeHidden()
    await expect(row(page, created.title)).toBeHidden()
    await page.getByLabel('Nouvelle tâche').fill('Pendant attente')
    await page.getByLabel('Nouvelle tâche').press('Enter')
    await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeDisabled()
    expect(writes).toBe(0)
    release()
    await expect(row(page, created.title)).toBeVisible()
    await expect(page.getByRole('navigation').getByRole('button', { name: a.name, exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeEnabled()
    expect(writes).toBe(0)
  })
}

for (const operation of ['création', 'renommage', 'suppression']) {
  for (const lost of [false, true]) {
    test(`catégorie ${operation} : ${lost ? 'réponse perdue' : 'refus'}, brouillon, relecture des deux ressources`, async ({ page, request }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      const a = await category(request)
      const created = await task(request)
      let writes = 0
      let failRead = false
      await page.route('**/api/categories**', async route => {
        if (route.request().method() === 'GET') {
          if (failRead) return route.fulfill({ status: 503, json: {} })
          return route.continue()
        }
        writes++
        if (lost) { await route.fetch(); await route.abort('failed') }
        else await route.fulfill({ status: 403, json: {} })
      })
      await page.goto('/')
      if (operation !== 'création') await navigate(page, a.name)
      if (operation === 'création') {
        await page.getByRole('button', { name: created.title, exact: true }).click()
        await page.getByLabel('Titre de la tâche').fill('Brouillon préservé')
        await page.getByLabel('Rechercher une catégorie').fill(unique('Réponse catégorie'))
        await page.getByRole('button', { name: /^Créer la catégorie «/ }).click()
      }
      else if (operation === 'renommage') {
        await page.getByLabel('Nom de la catégorie').fill(unique('Renommée'))
        await page.getByRole('button', { name: 'Renommer la catégorie' }).click()
      }
      else {
        await page.getByRole('button', { name: 'Supprimer la catégorie' }).click()
        await page.getByRole('dialog').getByRole('button', { name: 'Supprimer', exact: true }).click()
      }
      await expect(page.getByRole('status')).toContainText(lost ? 'Résultat à vérifier' : 'Modification de catégorie refusée')
      if (operation === 'création') await expect(page.getByLabel('Titre de la tâche')).toHaveValue('Brouillon préservé')
      if (lost) {
        await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeDisabled()
        failRead = true
        await page.getByRole('button', { name: 'Relire la liste avant de réessayer' }).click()
        await expect(page.getByRole('alert').first()).toBeVisible()
        await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeDisabled()
        if (operation === 'création') await expect(page.locator('aside')).toBeVisible()
        failRead = false
        await page.getByRole('button', { name: 'Réessayer le chargement' }).click()
        await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeEnabled()
      }
      expect(writes).toBe(1)
    })
  }
}

test('catégorie disparue : erreur distincte, brouillon conservé, référence indisponible et retour boîte', async ({ page, request }) => {
  const a = await category(request)
  const created = await task(request, a.id)
  await page.goto('/')
  await navigate(page, a.name)
  await page.getByRole('button', { name: created.title, exact: true }).click()
  await page.getByLabel('Titre de la tâche').fill('Brouillon intact')
  const b = await category(request)
  await page.getByRole('button', { name: 'Actualiser', exact: true }).click()
  await page.getByLabel('Rechercher une catégorie').fill(b.name)
  await page.locator('.suggestions').getByRole('button', { name: b.name, exact: true }).click()
  await request.delete(`/api/categories/${b.id}`, { headers })
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('La catégorie choisie est absente')
  await expect(page.getByLabel('Titre de la tâche')).toHaveValue('Brouillon intact')
  await request.delete(`/api/categories/${a.id}`, { headers })
  await page.getByRole('button', { name: 'Actualiser', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Boîte de réception', exact: true })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('Catégorie indisponible')
  await expect(page.getByLabel('Titre de la tâche')).toHaveValue('Brouillon intact')
  await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeDisabled()
  await page.locator('.suggestions').getByRole('button', { name: 'Sans catégorie', exact: true }).click()
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Modification enregistrée')
})

test('double soumission catégorie bloquée pendant une vraie écriture différée', async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  let writes = 0
  await page.route('**/api/categories', async route => {
    if (route.request().method() === 'GET') return route.continue()
    writes++
    const response = await route.fetch()
    await gate
    await route.fulfill({ response })
  })
  await page.goto('/')
  await page.getByLabel('Nouvelle catégorie').fill(unique('Double'))
  await page.getByLabel('Nouvelle catégorie').press('Enter')
  await expect(page.getByRole('button', { name: 'Créer une catégorie', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Actualiser', exact: true })).toBeDisabled()
  await page.getByLabel('Nouvelle catégorie').press('Enter')
  release()
  await expect(page.getByRole('status')).toContainText('Catégorie créée')
  expect(writes).toBe(1)
})

test('PATCH du brouillon conserve les modifications indépendantes relues', async ({ page, request }) => {
  const a = await category(request)
  const b = await category(request)
  const created = await task(request)
  let body: unknown
  await page.route(`**/api/tasks/${created.id}`, async route => {
    body = route.request().postDataJSON()
    await route.continue()
  })
  await page.goto('/')
  await page.getByRole('button', { name: created.title, exact: true }).click()
  await page.getByLabel('Rechercher une catégorie').fill(a.name)
  await page.locator('.suggestions').getByRole('button', { name: a.name, exact: true }).click()
  await request.patch(`/api/tasks/${created.id}`, { headers, data: { title: 'Titre autre appareil' } })
  await page.getByRole('button', { name: 'Actualiser', exact: true }).click()
  await expect(page.getByLabel('Titre de la tâche')).toHaveValue(created.title)
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Modification enregistrée')
  expect(body).toEqual({ categoryId: a.id })
  expect((await request.get('/api/tasks').then(r => r.json())).find((t: Task) => t.id === created.id).title).toBe('Titre autre appareil')
  await expect(page.locator('aside')).toBeHidden()
  await navigate(page, 'Toutes les tâches')
  await page.getByRole('button', { name: 'Titre autre appareil', exact: true }).click()
  await page.getByLabel('Titre de la tâche').fill('Titre de mon brouillon')
  await request.patch(`/api/tasks/${created.id}`, { headers, data: { categoryId: b.id } })
  await page.getByRole('button', { name: 'Actualiser', exact: true }).click()
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Modification enregistrée')
  expect(body).toEqual({ title: 'Titre de mon brouillon' })
  expect((await request.get('/api/tasks').then(r => r.json())).find((t: Task) => t.id === created.id).categoryId).toBe(b.id)
})

test('référence inconnue entre les lectures : jamais présentée Sans catégorie', async ({ page }) => {
  await page.route('**/api/tasks', route => route.fulfill({ json: [{ id: '00000000-0000-4000-8000-000000000000', title: 'Référence entre lectures', categoryId: '00000000-0000-4000-8000-000000000001', completed: false, createdAt: 1, steps: [] }] }))
  await page.route('**/api/categories', route => route.fulfill({ json: [] }))
  await page.goto('/')
  await navigate(page, 'Toutes les tâches')
  await expect(page.getByText('Catégorie indisponible — actualisez')).toBeVisible()
  await page.getByRole('button', { name: 'Référence entre lectures', exact: true }).click()
  await expect(page.locator('.category-picker')).toContainText('Catégorie indisponible :')
  await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeDisabled()
})


test('relecture tâches refusée après perte de réponse : incertitude maintenue', async ({ page, request }) => {
  const created = await task(request)
  await page.goto('/')
  await page.getByRole('button', { name: created.title, exact: true }).click()
  let writes = 0
  await page.route('**/api/categories', async route => {
    if (route.request().method() === 'GET') return route.continue()
    writes++
    await route.fetch()
    await route.abort('failed')
  })
  await page.getByLabel('Rechercher une catégorie').fill(unique('Relire les deux'))
  await page.getByRole('button', { name: /^Créer la catégorie «/ }).click()
  await expect(page.getByRole('status')).toContainText('Résultat à vérifier')
  await page.route('**/api/tasks', route => route.fulfill({ status: 503, json: {} }))
  await page.getByRole('button', { name: 'Relire la liste avant de réessayer' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeDisabled()
  await page.unroute('**/api/tasks')
  await page.getByRole('button', { name: 'Réessayer le chargement' }).click()
  await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeEnabled()
  expect(writes).toBe(1)
})
