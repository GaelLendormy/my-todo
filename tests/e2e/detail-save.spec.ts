import { expect, test } from '@playwright/test'
import type { Task } from '../../shared/types/task'
import type { Category } from '../../shared/types/category'

const headers = { Origin: 'http://127.0.0.1:3100' }

for (const width of [390, 1280]) {
  for (const field of ['titre', 'catégorie'] as const) {
    test(`confirmation ${field} ${width}px : attend le serveur puis revient à la liste`, async ({ page, request }) => {
      await page.setViewportSize({ width, height: 844 })
      const task = await request.post('/api/tasks', { headers, data: { title: `Retour ${field} ${width} ${Date.now()}` } }).then(r => r.json()) as Task
      const category = await request.post('/api/categories', { headers, data: { name: `Classement ${width} ${Date.now()}` } }).then(r => r.json()) as Category
      let release!: () => void
      const gate = new Promise<void>(resolve => { release = resolve })
      let writes = 0
      await page.route(`**/api/tasks/${task.id}`, async route => {
        writes++
        const response = await route.fetch()
        await gate
        await route.fulfill({ response })
      })
      await page.goto('/')
      await page.getByRole('button', { name: task.title, exact: true }).click()
      const renamed = `${task.title} modifié`
      if (field === 'titre') await page.getByLabel('Titre de la tâche').fill(`  ${renamed}  `)
      else {
        await page.getByLabel('Rechercher une catégorie').fill(category.name)
        await page.locator('.suggestions').getByRole('button', { name: category.name, exact: true }).click()
      }
      await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
      await expect(page.getByRole('status')).toContainText('Enregistrement en cours')
      await expect(page.locator('aside')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeDisabled()
      release()
      await expect(page.locator('aside')).toBeHidden()
      await expect(page.getByRole('status')).toContainText('Modification enregistrée')
      await expect(page.locator('.list-pane')).toBeVisible()
      expect(writes).toBe(1)
      if (field === 'titre') {
        await expect(page.getByRole('button', { name: renamed, exact: true })).toBeFocused()
        await page.getByRole('button', { name: renamed, exact: true }).click()
        await expect(page.getByLabel('Titre de la tâche')).toHaveValue(renamed)
      }
      else {
        await expect(page.getByRole('status')).toContainText('ne correspond plus à la vue')
        await expect(page.locator('#new-title:focus, .list-pane button:focus')).toBeVisible()
        const saved = (await request.get('/api/tasks').then(r => r.json()) as Task[]).find(t => t.id === task.id)
        expect(saved).toEqual({ ...task, categoryId: category.id })
      }
    })
  }

  test(`aucun changement ${width}px : retour à la liste sans écriture`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 844 })
    const task = await request.post('/api/tasks', { headers, data: { title: `Sans changement ${width} ${Date.now()}` } }).then(r => r.json()) as Task
    let writes = 0
    await page.route(`**/api/tasks/${task.id}`, route => { writes++; return route.abort('failed') })
    await page.goto('/')
    await page.getByRole('button', { name: task.title, exact: true }).click()
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
    await expect(page.locator('aside')).toBeHidden()
    await expect(page.getByRole('status')).toContainText('Aucune modification')
    await expect(page.getByRole('button', { name: task.title, exact: true })).toBeFocused()
    expect(writes).toBe(0)
  })
}

for (const lost of [false, true]) {
  test(`téléphone : ${lost ? 'réponse perdue' : 'refus'} garde le détail et le brouillon`, async ({ page, request }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const task = await request.post('/api/tasks', { headers, data: { title: `Erreur détail ${Date.now()}` } }).then(r => r.json()) as Task
    let writes = 0
    await page.route(`**/api/tasks/${task.id}`, async route => {
      writes++
      if (lost) { await route.fetch(); await route.abort('failed') }
      else await route.fulfill({ status: 403, json: {} })
    })
    await page.goto('/')
    await page.getByRole('button', { name: task.title, exact: true }).click()
    const draft = `${task.title} brouillon`
    await page.getByLabel('Titre de la tâche').fill(draft)
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
    await expect(page.getByRole('status')).toContainText(lost ? 'Résultat à vérifier' : 'Modification refusée')
    await expect(page.locator('aside')).toBeVisible()
    await expect(page.getByLabel('Titre de la tâche')).toHaveValue(draft)
    expect(writes).toBe(1)
    if (lost) {
      await page.getByRole('button', { name: 'Relire la liste avant de réessayer' }).click()
      await expect(page.locator('#save-message')).toContainText('Liste relue')
      await expect(page.locator('aside')).toBeVisible()
      await expect(page.getByLabel('Titre de la tâche')).toHaveValue(draft)
      expect(writes).toBe(1)
    }
  })
}
