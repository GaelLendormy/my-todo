import { expect, test, type Page, type APIRequestContext } from '@playwright/test'
import type { Task } from '../../shared/types/task'

const headers = { Origin: 'http://127.0.0.1:3100' }
async function seed(request: APIRequestContext, title = `Gestion ${Date.now()}`): Promise<Task> {
  return request.post('/api/tasks', { headers, data: { title } }).then(r => r.json())
}
function row(page: Page, title: string) {
  return page.getByRole('listitem').filter({ has: page.getByRole('button', { name: title, exact: true }) })
}

test('détail : titre distinct de la case, enregistrement, annulation et focus', async ({ page, request }) => {
  const task = await seed(request)
  await page.goto('/')
  await page.getByRole('button', { name: task.title, exact: true }).click()
  await expect(page.getByLabel('Titre de la tâche')).toBeFocused()
  await expect(row(page, task.title).getByRole('checkbox')).not.toBeChecked()
  const panel = await page.locator('aside').boundingBox()
  const list = await page.locator('.list-pane').boundingBox()
  expect(panel!.x).toBeGreaterThan(list!.x + list!.width)
  await page.getByLabel('Titre de la tâche').fill(' ')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Le titre doit contenir du texte')
  const renamed = `${task.title} modifiée`
  await page.getByLabel('Titre de la tâche').fill(`  ${renamed}  `)
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Modification enregistrée')
  await expect(page.getByLabel('Titre de la tâche')).toHaveValue(renamed)
  await expect(row(page, renamed).getByRole('checkbox')).not.toBeChecked()
  await page.getByLabel('Titre de la tâche').fill('Brouillon abandonné')
  await page.getByRole('button', { name: 'Annuler', exact: true }).click()
  await expect(page.getByRole('button', { name: renamed, exact: true })).toBeFocused()
  await page.getByRole('button', { name: renamed, exact: true }).press('Enter')
  await expect(page.getByLabel('Titre de la tâche')).toHaveValue(renamed)
  await page.getByLabel('Titre de la tâche').fill('Autre brouillon')
  await page.getByLabel('Titre de la tâche').press('Escape')
  await expect(page.locator('aside')).toBeHidden()
  await page.reload()
  await expect(row(page, renamed)).toBeVisible()
})

test('terminer, consulter et rouvrir conserve ordre et section ; vue téléphone dédiée', async ({ page, request }) => {
  const a = await seed(request, `Ordre A ${Date.now()}`)
  const b = await seed(request, `Ordre B ${Date.now()}`)
  const before: Task[] = await request.get('/api/tasks').then(r => r.json())
  const expectedOrder = before.filter(t => [a.id, b.id].includes(t.id)).map(t => t.title)
  await page.goto('/')
  const section = page.getByRole('button', { name: /^Terminées/ })
  await expect(section).toHaveAttribute('aria-expanded', 'false')
  await row(page, a.title).getByRole('checkbox').click()
  await expect(row(page, a.title)).toBeHidden()
  await expect(section).toBeFocused()
  await section.press('Enter')
  await expect(row(page, a.title).getByRole('checkbox')).toBeChecked()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: a.title, exact: true }).click()
  await expect(page.locator('.list-pane')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByLabel('Titre de la tâche').fill('Brouillon téléphone')
  await page.getByRole('button', { name: 'Retour à la liste' }).click()
  await expect(section).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('button', { name: a.title, exact: true })).toBeFocused()
  await page.getByRole('button', { name: a.title, exact: true }).click()
  await expect(page.getByLabel('Titre de la tâche')).toHaveValue(a.title)
  const renamed = `${a.title} terminée`
  await page.getByLabel('Titre de la tâche').fill(renamed)
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Modification enregistrée')
  await expect(page.locator('aside').getByText('Terminée', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Retour à la liste' }).click()
  await expect(row(page, renamed).getByRole('checkbox')).toBeChecked()
  await row(page, renamed).getByRole('checkbox').click()
  await expect(row(page, renamed).getByRole('checkbox')).not.toBeChecked()
  const actual = await page.getByRole('region', { name: 'Tâches à faire', exact: true }).getByRole('button').allTextContents()
  expect(actual.filter(t => [renamed, b.title].includes(t))).toEqual(expectedOrder.map(t => t === a.title ? renamed : t))
  await page.reload()
  await expect(section).toHaveAttribute('aria-expanded', 'false')
  await expect(row(page, renamed).getByRole('checkbox')).not.toBeChecked()
})

for (const completed of [false, true]) {
  test(`confirmation au clavier, annulation et suppression persistante (terminée = ${completed})`, async ({ page, request }) => {
    const task = await seed(request)
    if (completed) await request.patch(`/api/tasks/${task.id}`, { headers, data: { completed: true } })
    await page.goto('/')
    if (completed) await page.getByRole('button', { name: /^Terminées/ }).click()
    await page.getByRole('button', { name: task.title, exact: true }).click()
    const remove = page.getByRole('button', { name: 'Supprimer la tâche', exact: true })
    await remove.focus()
    await remove.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText(task.title)
    await expect(dialog.getByRole('button', { name: 'Annuler' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(dialog.getByRole('button', { name: 'Supprimer', exact: true })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(dialog.getByRole('button', { name: 'Annuler' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(dialog).toBeHidden()
    await expect(remove).toBeFocused()
    await remove.press('Enter')
    await page.keyboard.press('Escape')
    await expect(remove).toBeFocused()
    await remove.press('Enter')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('status')).toContainText('Tâche supprimée')
    await expect(page.locator('aside')).toBeHidden()
    await expect(row(page, task.title)).toBeHidden()
    await page.reload()
    await page.getByRole('button', { name: /^Terminées/ }).click()
    await expect(row(page, task.title)).toBeHidden()
  })
}

for (const operation of ['titre', 'état', 'suppression'] as const) {
  for (const lost of [false, true]) {
    test(`${operation} : ${lost ? 'réponse perdue après écriture réelle' : 'refus certain'}, sans répétition et relecture`, async ({ page, request }) => {
      const task = await seed(request)
      const url = `/api/tasks/${task.id}`
      let writes = 0
      await page.route(`**${url}`, async route => {
        writes++
        if (lost) {
          await route.fetch()
          await route.abort('failed')
        }
        else await route.fulfill({ status: 403, json: { message: 'Refus' } })
      })
      await page.goto('/')
      const changed = `${task.title} changée`
      if (operation === 'état') await row(page, task.title).getByRole('checkbox').click()
      else {
        await page.getByRole('button', { name: task.title, exact: true }).click()
        await page.getByLabel('Titre de la tâche').fill(changed)
        if (operation === 'titre') await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
        else {
          await page.getByRole('button', { name: 'Supprimer la tâche', exact: true }).click()
          await page.getByRole('dialog').getByRole('button', { name: 'Supprimer', exact: true }).click()
          await expect(page.getByRole('button', { name: lost ? 'Relire la liste avant de réessayer' : 'Supprimer la tâche', exact: true })).toBeFocused()
        }
        await expect(page.getByLabel('Titre de la tâche')).toHaveValue(changed)
      }
      await expect(page.getByRole('status')).toContainText(lost ? 'Résultat à vérifier' : 'Modification refusée')
      await expect(row(page, task.title)).toBeVisible()
      await expect(row(page, task.title).getByRole('checkbox')).not.toBeChecked()
      if (lost) {
        await expect(page.getByRole('button', { name: 'Ajouter', exact: true })).toBeDisabled()
        if (operation !== 'état') await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeDisabled()
        await page.getByRole('button', { name: 'Relire la liste avant de réessayer' }).click()
      }
      else await page.getByRole('button', { name: 'Actualiser', exact: true }).click()
      expect(writes).toBe(1)
      if (lost && operation === 'suppression') {
        await expect(page.locator('aside')).toBeHidden()
        await expect(row(page, task.title)).toBeHidden()
      }
      else if (lost && operation === 'état') {
        await page.getByRole('button', { name: /^Terminées/ }).click()
        await expect(row(page, task.title).getByRole('checkbox')).toBeChecked()
      }
      else {
        await expect(row(page, lost ? changed : task.title)).toBeVisible()
        if (operation !== 'état') await expect(page.getByLabel('Titre de la tâche')).toHaveValue(changed)
      }
    })
  }
}

test('sérialise lecture et mutations M2, et bloque les doubles écritures', async ({ page, request }) => {
  const task = await seed(request)
  let releaseRead!: () => void
  let releaseWrite!: () => void
  let reads = 0
  let writes = 0
  const reading = new Promise<void>(r => { releaseRead = r })
  const writing = new Promise<void>(r => { releaseWrite = r })
  await page.route('**/api/tasks', async route => {
    reads++
    if (reads === 2) await reading
    await route.continue()
  })
  await page.route(`**/api/tasks/${task.id}`, async route => {
    writes++
    await writing
    await route.continue()
  })
  await page.goto('/')
  await page.getByRole('button', { name: task.title, exact: true }).click()
  await page.getByRole('button', { name: 'Actualiser' }).click()
  await page.getByLabel('Titre de la tâche').fill('Brouillon pendant lecture')
  await page.getByLabel('Titre de la tâche').press('Enter')
  expect(writes).toBe(0)
  await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeDisabled()
  releaseRead()
  await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeEnabled()
  await page.getByLabel('Titre de la tâche').press('Enter')
  await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Actualiser' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Retour à la liste' })).toBeDisabled()
  await page.getByLabel('Titre de la tâche').press('Enter')
  releaseWrite()
  await expect(page.getByRole('status')).toContainText('Modification enregistrée')
  expect(writes).toBe(1)
})
