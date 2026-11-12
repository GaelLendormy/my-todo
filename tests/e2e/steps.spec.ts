import { expect, test } from '@playwright/test'
import type { Task } from '../../shared/types/task'
const headers = { Origin: 'http://127.0.0.1:3100' }

for (const width of [390, 1280]) {
  test(`étapes ${width}px : décomposer, brouillons indépendants, progression et suppression`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 844 })
    const task = await request.post('/api/tasks', { headers, data: { title: `Étapes parcours ${width} ${Date.now()}` } }).then(r => r.json()) as Task
    await page.goto('/')
    await page.getByRole('button', { name: task.title, exact: true }).click()
    await page.getByLabel('Titre de la tâche').fill('Brouillon parent non enregistré')
    await page.getByLabel('Nouvelle étape', { exact: true }).fill('Rassembler')
    await page.getByRole('button', { name: 'Ajouter une étape', exact: true }).click()
    await expect(page.locator('aside')).toBeVisible()
    await expect(page.getByLabel('Titre de la tâche')).toHaveValue('Brouillon parent non enregistré')
    await page.getByLabel('Nouvelle étape', { exact: true }).fill('Envoyer')
    await page.getByRole('button', { name: 'Ajouter une étape', exact: true }).click()
    await expect(page.locator('.steps .progress')).toHaveText('0 étapes sur 2 terminées')
    await expect(page.locator('form form')).toHaveCount(0)
    expect((await request.get('/api/tasks').then(r => r.json()) as Task[]).find(t => t.id === task.id)!.title).toBe(task.title)
    await page.getByRole('button', { name: 'Renommer l’étape : Rassembler', exact: true }).click()
    await page.getByLabel('Nouveau titre de l’étape').fill('Renommage abandonné')
    await page.getByLabel('Nouveau titre de l’étape').press('Escape')
    await expect(page.getByRole('button', { name: 'Renommer l’étape : Rassembler', exact: true })).toBeFocused()
    await page.getByRole('button', { name: 'Renommer l’étape : Rassembler', exact: true }).click()
    await page.getByLabel('Nouveau titre de l’étape').fill('Préparer')
    await page.getByRole('button', { name: 'Enregistrer le titre de l’étape', exact: true }).click()
    await page.getByRole('checkbox', { name: 'Terminer l’étape : Préparer', exact: true }).click()
    await expect(page.locator('.steps .progress')).toHaveText('1 étapes sur 2 terminées')
    await page.getByRole('checkbox', { name: 'Terminer l’étape : Envoyer', exact: true }).click()
    await expect(page.locator('.steps .progress')).toHaveText('2 étapes sur 2 terminées')
    await expect(page.locator('#save-message')).toContainText('La tâche est terminée')
    await page.getByRole('checkbox', { name: 'Rouvrir l’étape : Envoyer', exact: true }).click()
    await expect(page.locator('#save-message')).toContainText('La tâche est rouverte')
    await page.getByRole('button', { name: 'Supprimer l’étape : Envoyer', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Envoyer')
    await expect(dialog.getByRole('button', { name: 'Annuler', exact: true })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page.locator('aside')).toBeVisible()
    await page.getByRole('button', { name: 'Supprimer l’étape : Envoyer', exact: true }).click()
    await dialog.getByRole('button', { name: 'Supprimer', exact: true }).click()
    await expect(page.getByLabel('Nouvelle étape', { exact: true })).toBeFocused()
    await expect(page.locator('.steps .progress')).toHaveText('1 étapes sur 1 terminées')
    await page.getByRole('button', { name: 'Supprimer l’étape : Préparer', exact: true }).click()
    await dialog.getByRole('button', { name: 'Supprimer', exact: true }).click()
    await expect(page.locator('.steps .progress')).toBeHidden()
    await expect(page.locator('aside')).toContainText('Terminée')
    // Adding to a completed simple parent reopens it, without a synthetic step.
    await page.getByLabel('Nouvelle étape', { exact: true }).fill('Encore')
    await page.getByRole('button', { name: 'Ajouter une étape', exact: true }).click()
    await expect(page.locator('.steps .progress')).toHaveText('0 étapes sur 1 terminées')
    await expect(page.locator('#save-message')).toContainText('La tâche est rouverte')
    await page.getByRole('button', { name: 'Supprimer l’étape : Encore', exact: true }).click()
    await dialog.getByRole('button', { name: 'Supprimer', exact: true }).click()
    await page.getByLabel('Nouvelle étape', { exact: true }).fill('Brouillon abandonné')
    await page.getByRole('button', { name: 'Annuler', exact: true }).click()
    await expect(page.getByRole('button', { name: task.title, exact: true })).toBeFocused()
    await page.getByRole('button', { name: task.title, exact: true }).click()
    await expect(page.getByLabel('Titre de la tâche')).toHaveValue(task.title)
    await expect(page.getByLabel('Nouvelle étape', { exact: true })).toHaveValue('')
    await expect(page.locator('aside')).toContainText('À faire')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
}

test('étapes : GET différé, double soumission et refus certain gardent les brouillons', async ({ page, request }) => {
  const task = await request.post('/api/tasks', { headers, data: { title: `Étape attente ${Date.now()}` } }).then(r => r.json()) as Task
  await page.goto('/')
  await page.getByRole('button', { name: task.title, exact: true }).click()
  await page.getByLabel('Titre de la tâche').fill('Parent brouillon')
  await page.getByLabel('Nouvelle étape', { exact: true }).fill('Saisie étape')
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/tasks', async route => { const response = await route.fetch(); await gate; await route.fulfill({ response }) })
  let writes = 0
  await page.route(`**/api/tasks/${task.id}/steps`, async route => {
    writes++
    await gate
    await route.fulfill({ status: 400, json: {} })
  })
  await page.getByRole('button', { name: 'Actualiser', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Ajouter une étape', exact: true })).toBeDisabled()
  await page.getByLabel('Nouvelle étape', { exact: true }).press('Enter')
  expect(writes).toBe(0)
  release()
  await expect(page.getByRole('button', { name: 'Ajouter une étape', exact: true })).toBeEnabled()
  let releaseWrite!: () => void
  const writeGate = new Promise<void>(resolve => { releaseWrite = resolve })
  await page.unroute(`**/api/tasks/${task.id}/steps`)
  await page.route(`**/api/tasks/${task.id}/steps`, async route => { writes++; await writeGate; await route.fulfill({ status: 400, json: {} }) })
  await page.getByRole('button', { name: 'Ajouter une étape', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Ajouter une étape', exact: true })).toBeDisabled()
  await page.getByLabel('Nouvelle étape', { exact: true }).press('Enter')
  releaseWrite()
  await expect(page.locator('#save-message')).toContainText('Modification d’étape refusée')
  expect(writes).toBe(1)
  await expect(page.getByLabel('Nouvelle étape', { exact: true })).toHaveValue('Saisie étape')
  await expect(page.getByLabel('Titre de la tâche')).toHaveValue('Parent brouillon')
})

test('étape : réponse perdue après écriture, relecture partielle, cible disparue et brouillons', async ({ page, request }) => {
  const task = await request.post('/api/tasks', { headers, data: { title: `Étape perdue ${Date.now()}` } }).then(r => r.json()) as Task
  const saved = await request.post(`/api/tasks/${task.id}/steps`, { headers, data: { title: 'Cible' } }).then(r => r.json()) as Task
  const step = saved.steps[0]!
  await page.goto('/')
  await page.getByRole('button', { name: task.title, exact: true }).click()
  await page.getByLabel('Titre de la tâche').fill('Brouillon parent')
  await page.getByRole('button', { name: 'Renommer l’étape : Cible', exact: true }).click()
  await page.getByLabel('Nouveau titre de l’étape').fill('Brouillon renommage')
  await page.getByLabel('Nouvelle étape', { exact: true }).fill('Brouillon ajout')
  await page.clock.install()
  let writes = 0
  await page.route(`**/api/tasks/${task.id}/steps/${step.id}`, async route => { await route.fetch(); writes++ })
  await page.getByRole('button', { name: 'Enregistrer le titre de l’étape', exact: true }).click()
  await expect.poll(() => writes).toBe(1)
  await page.clock.runFor(10_001)
  await expect(page.locator('#save-message')).toContainText('Résultat à vérifier')
  await page.clock.runFor(30_000)
  expect(writes).toBe(1)
  for (const name of ['Ajouter', 'Enregistrer', 'Ajouter une étape', 'Enregistrer le titre de l’étape', 'Supprimer la tâche']) await expect(page.getByRole('button', { name, exact: true })).toBeDisabled()
  await page.route('**/api/categories', route => route.fulfill({ status: 503, json: {} }))
  await page.getByRole('button', { name: 'Relire la liste avant de réessayer', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Impossible de charger')
  await expect(page.getByRole('button', { name: 'Ajouter une étape', exact: true })).toBeDisabled()
  await expect(page.getByLabel('Nouveau titre de l’étape')).toHaveValue('Brouillon renommage')
  await expect(page.getByLabel('Nouvelle étape', { exact: true })).toHaveValue('Brouillon ajout')
  await expect(page.getByLabel('Titre de la tâche')).toHaveValue('Brouillon parent')
  await page.unroute('**/api/categories')
  await request.delete(`/api/tasks/${task.id}/steps/${step.id}`, { headers })
  await page.getByRole('button', { name: 'Relire la liste avant de réessayer', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Cette étape a disparu')
  await expect(page.getByRole('button', { name: 'Enregistrer le titre de l’étape', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ajouter une étape', exact: true })).toBeEnabled()
  await expect(page.getByLabel('Nouveau titre de l’étape')).toHaveValue('Brouillon renommage')
  expect(writes).toBe(1)
  await request.delete(`/api/tasks/${task.id}`, { headers })
  await page.getByRole('button', { name: 'Actualiser', exact: true }).click()
  await expect(page.locator('aside')).toBeHidden()
  await expect(page.locator('#save-message')).toContainText('cette tâche est absente')
})

test('progression : sortie du filtre En retard, détail conservé et focus au retour', async ({ page, request }) => {
  const task = await request.post('/api/tasks', { headers, data: { title: `Étape retard ${Date.now()}` } }).then(r => r.json()) as Task
  await request.patch(`/api/tasks/${task.id}`, { headers, data: { priority: 'high', dueDate: '2000-01-01' } })
  await request.post(`/api/tasks/${task.id}/steps`, { headers, data: { title: 'Finir' } })
  await page.goto('/')
  await page.getByRole('button', { name: 'Toutes les tâches', exact: true }).click()
  await page.getByLabel('Échéance', { exact: true }).selectOption('overdue')
  await page.getByRole('button', { name: task.title, exact: true }).click()
  await page.getByRole('checkbox', { name: 'Terminer l’étape : Finir', exact: true }).click()
  await expect(page.locator('aside')).toContainText('ne correspond plus à la vue')
  await expect(page.locator('aside').getByLabel('Priorité', { exact: true })).toHaveValue('high')
  await expect(page.getByLabel('Date limite', { exact: true })).toHaveValue('2000-01-01')
  await page.getByRole('button', { name: 'Retour à la liste', exact: true }).click()
  await expect(page.getByLabel('Nouvelle tâche')).toBeFocused()
  await expect(page.getByLabel('Échéance', { exact: true })).toHaveValue('overdue')
})

test('Terminées conserve son état, progression sans case globale, ajout au parent décomposé terminé', async ({ page, request }) => {
  const task = await request.post('/api/tasks', { headers, data: { title: `Terminées étapes ${Date.now()}` } }).then(r => r.json()) as Task
  const saved = await request.post(`/api/tasks/${task.id}/steps`, { headers, data: { title: 'Déjà faite' } }).then(r => r.json()) as Task
  await request.patch(`/api/tasks/${task.id}/steps/${saved.steps[0]!.id}`, { headers, data: { completed: true } })
  await page.goto('/')
  const completed = page.getByRole('button', { name: /^Terminées \(/ })
  await completed.click()
  const row = page.locator('.list-pane li').filter({ hasText: task.title })
  await expect(row).toContainText('1 étapes sur 1 terminées')
  await expect(row.getByRole('checkbox')).toHaveCount(0)
  await page.getByRole('button', { name: task.title, exact: true }).click()
  await page.getByLabel('Nouvelle étape', { exact: true }).fill('Nouvelle action')
  await page.getByRole('button', { name: 'Ajouter une étape', exact: true }).click()
  await expect(page.locator('.steps .progress')).toHaveText('1 étapes sur 2 terminées')
  await expect(page.locator('aside')).toBeVisible()
  await expect(page.getByRole('checkbox', { name: 'Rouvrir l’étape : Déjà faite', exact: true })).toBeChecked()
  await page.getByRole('button', { name: 'Retour à la liste', exact: true }).click()
  await expect(completed).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('button', { name: task.title, exact: true })).toBeFocused()
  await page.reload()
  await page.getByRole('button', { name: task.title, exact: true }).click()
  await expect(page.locator('.steps .progress')).toHaveText('1 étapes sur 2 terminées')
  await expect(page.locator('.step-list li').first()).toContainText('Déjà faite')
  await expect(page.locator('.step-list li').last()).toContainText('Nouvelle action')
})

for (const width of [390, 1280]) {
  for (const repetitions of [40, 400]) {
    test(`confirmation titre très long ${width}px (${repetitions} répétitions) : dialogue sans débordement et commandes accessibles`, async ({ page, request }) => {
      await page.setViewportSize({ width, height: 844 })
      const task = await request.post('/api/tasks', { headers, data: { title: `Confirmation longue ${width} ${Date.now()}` } }).then(r => r.json()) as Task
      const title = 'ActionSansEspace'.repeat(repetitions)
      await request.post(`/api/tasks/${task.id}/steps`, { headers, data: { title } })
      await page.goto('/')
      await page.getByRole('button', { name: task.title, exact: true }).click()
      const open = page.getByRole('button', { name: `Supprimer l’étape : ${title}`, exact: true })
      await open.click()
      const dialog = page.getByRole('dialog')
      const cancel = dialog.getByRole('button', { name: 'Annuler', exact: true })
      const remove = dialog.getByRole('button', { name: 'Supprimer', exact: true })
      await expect(cancel).toBeFocused()
      const metrics = await dialog.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        return {
          width: rect.width, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth,
          height: rect.height, viewportHeight: window.innerHeight,
          buttonsAccessible: Array.from(element.querySelectorAll('button')).every((button) => {
            const bounds = button.getBoundingClientRect()
            const x = bounds.left + bounds.width / 2, y = bounds.top + bounds.height / 2
            return bounds.left >= rect.left && bounds.right <= rect.right
              && bounds.top >= 0 && bounds.bottom <= window.innerHeight
              && element.contains(document.elementFromPoint(x, y))
          }),
        }
      })
      console.info(`Confirmation ${width}px (${repetitions} répétitions) : ${JSON.stringify(metrics)}`)
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth)
      expect(metrics.width).toBeLessThan(width)
      expect(metrics.height).toBeLessThanOrEqual(metrics.viewportHeight)
      expect(metrics.buttonsAccessible).toBe(true)
      await expect(dialog).toHaveAttribute('aria-describedby', 'step-delete-title')
      await expect(dialog.locator('#step-delete-title')).toHaveText(title)
      const text = await dialog.locator('#step-delete-title').evaluate((element) => ({
        height: element.clientHeight, scrollHeight: element.scrollHeight,
        maxHeight: Number.parseFloat(getComputedStyle(element).maxHeight),
        overflowWrap: getComputedStyle(element).overflowWrap,
      }))
      expect(text.overflowWrap).toBe('anywhere')
      expect(text.height).toBeLessThanOrEqual(Math.ceil(text.maxHeight))
      if (repetitions === 400) expect(text.scrollHeight).toBeGreaterThan(text.height)
      await cancel.press('Tab')
      await expect(remove).toBeFocused()
      await remove.press('Tab')
      await expect(cancel).toBeFocused()
      await cancel.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(page.getByRole('button', { name: `Renommer l’étape : ${title}`, exact: true })).toBeFocused()
      await open.click()
      await cancel.click()
      await expect(dialog).toBeHidden()
      await expect(open).toBeVisible()
      await open.click()
      await remove.click()
      await expect(dialog).toBeHidden()
      await expect(page.getByLabel('Nouvelle étape', { exact: true })).toBeFocused()
      await expect(open).toHaveCount(0)
      expect((await request.get('/api/tasks').then(r => r.json()) as Task[]).find(t => t.id === task.id)!.steps).toEqual([])
    })
  }
}
