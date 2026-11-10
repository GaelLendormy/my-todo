<script setup lang="ts">
import type { Task } from '../shared/types/task'

const { requestTimeout, tasks, categories, loading, loadFailed, saving, uncertain, message, blocked, readResources, changeCategory } = useTaskResources()
const title = ref('')
const input = useTemplateRef('titleInput')
const selectedId = ref<string | null>(null)
const selected = computed(() => tasks.value.find(task => task.id === selectedId.value))
const draft = ref('')
const draftCategory = ref<string | null>(null)
const draftBase = ref<{ title: string, categoryId: string | null }>({ title: '', categoryId: null })
const view = ref('inbox')
const completedViews = reactive<Record<string, boolean>>({})
const completedOpen = computed({ get: () => completedViews[view.value] ?? false, set: value => { completedViews[view.value] = value } })
const currentCategory = computed(() => categories.value.find(c => c.id === view.value))
const viewName = computed(() => view.value === 'inbox' ? 'Boîte de réception' : view.value === 'all' ? 'Toutes les tâches' : currentCategory.value?.name ?? 'Catégorie indisponible')
const visibleTasks = computed(() => tasks.value.filter(task => view.value === 'all' || (view.value === 'inbox' ? task.categoryId === null : task.categoryId === view.value)))
const active = computed(() => visibleTasks.value.filter(task => !task.completed))
const completed = computed(() => visibleTasks.value.filter(task => task.completed))
const unavailableCategory = computed(() => draftCategory.value !== null && !categories.value.some(c => c.id === draftCategory.value))
const categoryRename = ref('')
const categoryConfirmation = useTemplateRef('categoryConfirmation')
const cancelCategoryDelete = useTemplateRef('cancelCategoryDelete')
async function navigate(destination: string) {
  if (saving.value) return
  selectedId.value = null
  draft.value = ''
  view.value = destination
  categoryRename.value = currentCategory.value?.name ?? ''
  await nextTick()
  document.getElementById('view-heading')?.focus()
}
async function reconcileView() {
  if (!['inbox', 'all'].includes(view.value) && !currentCategory.value) {
    // Une disparition constatée par relecture conserve le brouillon du détail.
    view.value = 'inbox'
    message.value = 'Cette catégorie a disparu. Retour à la Boîte de réception ; ses tâches sont conservées.'
    await nextTick()
    document.getElementById('view-heading')?.focus()
  }
}
async function createCategory(name: string, select = false) {
  const saved = await changeCategory('POST', undefined, name)
  if (saved && typeof saved === 'object') {
    if (select) draftCategory.value = saved.id
    else message.value = 'Catégorie créée.'
  }
}
async function askCategoryDelete() {
  if (blocked.value) return
  categoryConfirmation.value?.showModal()
  await nextTick()
  cancelCategoryDelete.value?.focus()
}
async function removeCategory() {
  const id = currentCategory.value?.id
  if (!id) return
  const saved = await changeCategory('DELETE', id)
  categoryConfirmation.value?.close()
  if (saved) await reconcileView()
  else if (uncertain.value) rereadButton.value?.focus()
}
function dismissCategoryDelete() {
  if (saving.value) return
  categoryConfirmation.value?.close()
  document.getElementById('delete-category')?.focus()
}
function moveCategoryDialogFocus(event: KeyboardEvent) {
  const buttons = Array.from(categoryConfirmation.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
  buttons[(index + (event.shiftKey ? buttons.length - 1 : 1)) % buttons.length]?.focus()
}
async function saveDetail() {
  if (blocked.value || !selected.value || unavailableCategory.value) return
  const update: { title?: string, categoryId?: string | null } = {}
  if (draft.value !== draftBase.value.title) update.title = draft.value
  if (draftCategory.value !== draftBase.value.categoryId) update.categoryId = draftCategory.value
  if (!Object.keys(update).length) {
    message.value = 'Aucune modification à enregistrer.'
    await closeDetail()
    return
  }
  const task = selected.value
  if (await mutate(task, update)) {
    if (!visibleTasks.value.some(item => item.id === task.id)) {
      message.value = 'Modification enregistrée. Cette tâche ne correspond plus à la vue consultée.'
    }
    await closeDetail()
  }
}
const detailPanel = useTemplateRef('detailPanel')
const confirmation = useTemplateRef('confirmation')
const cancelDelete = useTemplateRef('cancelDelete')
const completedButton = useTemplateRef('completedButton')
const rereadButton = useTemplateRef('rereadButton')

async function restoreListFocus(id: string | null) {
  await nextTick()
  const target = id ? document.getElementById(`task-${id}`) : null
  if (target) target.focus()
  else if (completed.value.length) completedButton.value?.focus()
  else input.value?.focus()
}

async function openDetail(task: Task) {
  if (saving.value) return
  selectedId.value = task.id
  draft.value = task.title
  draftCategory.value = task.categoryId
  draftBase.value = { title: task.title, categoryId: task.categoryId }
  await nextTick()
  detailPanel.value?.focusTitle()
}

async function closeDetail() {
  if (saving.value) return
  const id = selectedId.value
  selectedId.value = null
  draft.value = ''
  await restoreListFocus(id)
}

async function askDelete() {
  if (blocked.value || !selected.value) return
  confirmation.value?.showModal()
  await nextTick()
  cancelDelete.value?.focus()
}

function moveDialogFocus(event: KeyboardEvent) {
  if (saving.value) return
  const buttons = confirmation.value?.querySelectorAll<HTMLButtonElement>('button')
  if (!buttons?.length) return
  const index = Array.from(buttons).indexOf(document.activeElement as HTMLButtonElement)
  buttons[(index + (event.shiftKey ? buttons.length - 1 : 1)) % buttons.length]?.focus()
}

function dismissDelete() {
  if (saving.value) return
  confirmation.value?.close()
  detailPanel.value?.focusDelete()
}

async function mutate(task: Task, update?: { title?: string, completed?: boolean, categoryId?: string | null }) {
  if (blocked.value) return
  if (update?.title !== undefined && !update.title.trim()) {
    message.value = 'Le titre doit contenir du texte.'
    detailPanel.value?.focusTitle()
    return
  }
  saving.value = true
  message.value = 'Enregistrement en cours…'
  let deleted = false
  try {
    if (update) {
      const saved = await $fetch<Task>(`/api/tasks/${task.id}`, { method: 'PATCH', body: update, retry: 0, timeout: requestTimeout })
      tasks.value = tasks.value.map(item => item.id === saved.id ? saved : item)
      if (update.title !== undefined) { draft.value = saved.title; draftBase.value.title = saved.title }
      if (update.categoryId !== undefined) { draftCategory.value = saved.categoryId; draftBase.value.categoryId = saved.categoryId }
      message.value = 'Modification enregistrée.'
      return true
    }
    else {
      await $fetch(`/api/tasks/${task.id}`, { method: 'DELETE', retry: 0, timeout: requestTimeout })
      tasks.value = tasks.value.filter(item => item.id !== task.id)
      selectedId.value = null
      draft.value = ''
      deleted = true
      message.value = 'Tâche supprimée.'
    }
  }
  catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status
    if (status && status >= 400 && status < 500) {
      const code = (error as { data?: { data?: { code?: string } } }).data?.data?.code
      message.value = code === 'CATEGORY_MISSING' ? 'La catégorie choisie est absente. Votre saisie est conservée ; actualisez puis remplacez cette catégorie.' : status === 404
        ? 'Cette tâche est absente du serveur. Votre saisie est conservée ; actualisez la liste.'
        : 'Modification refusée. La tâche reste inchangée et votre saisie est conservée.'
    }
    else {
      uncertain.value = true
      message.value = 'Résultat à vérifier : la modification a peut-être été enregistrée. Relisez la liste avant de réessayer ; votre saisie est conservée.'
    }
  }
  finally {
    saving.value = false
    if (!update) {
      confirmation.value?.close()
      await nextTick()
      if (deleted) await restoreListFocus(null)
      else if (uncertain.value) rereadButton.value?.focus()
      else detailPanel.value?.focusDelete()
    }
    else if (update.title !== undefined) {
      await nextTick()
      detailPanel.value?.focusTitle()
    }
    else if (!selectedId.value) await restoreListFocus(task.id)
  }
}

async function reload() {
  const wasUncertain = uncertain.value
  if (await readResources()) {
    if (wasUncertain) message.value = 'Liste relue. Vérifiez le titre, l’état, le classement et la présence de la tâche avant de soumettre à nouveau ; votre saisie est conservée.'
    await reconcileView()
    if (selectedId.value && !selected.value) {
      await closeDetail()
      message.value = 'Liste relue : cette tâche est absente du serveur.'
    }
  }
}

async function create() {
  // Attendre la lecture pour qu'aucun GET antérieur n'efface l'ajout confirmé.
  if (loading.value || saving.value || uncertain.value) return
  if (!title.value.trim()) {
    message.value = 'Le titre doit contenir du texte.'
    input.value?.focus()
    return
  }
  saving.value = true
  message.value = ''
  try {
    const created = await $fetch<Task>('/api/tasks', {
      method: 'POST', body: { title: title.value }, retry: 0, timeout: requestTimeout,
    })
    tasks.value = [created, ...tasks.value].sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id))
    title.value = ''
    message.value = view.value === 'inbox' || view.value === 'all' ? 'Tâche enregistrée.' : 'Tâche enregistrée dans la Boîte de réception.'
  }
  catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status
    if (status && status >= 400 && status < 500) {
      message.value = 'Ajout refusé. Votre saisie est conservée ; vérifiez le titre ou réessayez.'
    }
    else {
      uncertain.value = true
      message.value = 'Résultat à vérifier : la tâche a peut-être été enregistrée. Relisez la liste avant un nouvel ajout.'
    }
  }
  finally {
    saving.value = false
    await nextTick()
    input.value?.focus()
  }
}

onMounted(reload)
</script>

<template>
  <div class="shell">
    <header class="brand"><span class="brand-icon" aria-hidden="true">✓</span> My To Do</header>
    <main>
      <div class="heading">
        <div><p class="eyebrow">Un peu d'espace pour vos idées</p><h1 id="view-heading" tabindex="-1">{{ viewName }}</h1></div>
        <button class="secondary" :disabled="loading || saving" @click="reload">Actualiser</button>
      </div>
      <CategoryNavigation :categories="categories" :view="view" :disabled="blocked" @navigate="navigate" @create="name => createCategory(name)" />
      <section v-if="currentCategory" class="category-management" aria-label="Gérer la catégorie">
        <form @submit.prevent="changeCategory('PATCH', currentCategory!.id, categoryRename)">
          <label for="rename-category">Nom de la catégorie</label>
          <input id="rename-category" v-model="categoryRename" :readonly="saving">
          <button :disabled="blocked" type="submit">Renommer la catégorie</button>
        </form>
        <button id="delete-category" class="danger" :disabled="blocked" @click="askCategoryDelete">Supprimer la catégorie</button>
      </section>
      <p class="intro">Notez ce que vous avez en tête. Une tâche, un titre, c'est tout.</p>
      <form class="capture" :aria-busy="saving" @submit.prevent="create">
        <label for="new-title">Nouvelle tâche</label>
        <div class="capture-controls">
          <input id="new-title" ref="titleInput" v-model="title" name="title" autocomplete="off" placeholder="Qu'avez-vous en tête ?" :readonly="saving" aria-describedby="save-message">
          <button type="submit" :disabled="loading || saving || uncertain">{{ saving ? 'Enregistrement…' : 'Ajouter' }}</button>
        </div>
        <p id="save-message" class="message" role="status">{{ message }}</p>
        <button v-if="uncertain" ref="rereadButton" type="button" class="secondary" :disabled="loading" @click="reload">Relire la liste avant de réessayer</button>
      </form>
      <button v-if="message === 'Tâche enregistrée dans la Boîte de réception.'" class="secondary" @click="navigate('inbox')">Voir la Boîte de réception</button>
      <p v-if="loading" role="status" class="empty reading-state">Chargement des tâches…</p>
      <div v-else-if="loadFailed" role="alert" class="empty reading-state">
        <p>Impossible de charger les tâches. La liste n'est pas disponible.</p>
        <button class="secondary" @click="reload">Réessayer le chargement</button>
      </div>
      <div class="workspace" :class="{ 'has-detail': selected }">
        <div class="list-pane">
          <section class="task-section" aria-label="Tâches à faire" :aria-busy="loading">
            <div class="section-heading"><h2>À faire</h2><span v-if="!loadFailed && !loading">{{ active.length }}</span></div>
            <template v-if="!loading && !loadFailed">
              <div v-if="visibleTasks.length === 0" class="empty"><p class="empty-title">L'esprit un peu plus libre.</p><p>{{ view === 'inbox' ? 'Votre boîte de réception est vide. Ajoutez votre première tâche ci-dessus.' : 'Cette vue ne contient aucune tâche.' }}</p></div>
              <template v-else>
                <TaskList v-if="active.length" :tasks="active" :categories="categories" :disabled="blocked" @open="openDetail" @toggle="task => mutate(task, { completed: !task.completed })" />
                <p v-else class="empty">Aucune tâche à faire.</p>
              </template>
            </template>
          </section>
          <section v-if="!loading && !loadFailed" class="task-section" aria-label="Tâches terminées">
            <button ref="completedButton" class="secondary" :aria-expanded="completedOpen" aria-controls="completed-list" @click="completedOpen = !completedOpen">Terminées ({{ completed.length }})</button>
            <div v-if="completedOpen" id="completed-list" class="completed-list">
              <TaskList v-if="completed.length" :tasks="completed" :categories="categories" :disabled="blocked" @open="openDetail" @toggle="task => mutate(task, { completed: !task.completed })" />
              <p v-else>Aucune tâche terminée.</p>
            </div>
          </section>
        </div>
        <TaskDetail v-if="selected" ref="detailPanel" v-model:title="draft" v-model:category-id="draftCategory" :task="selected" :categories="categories" :blocked="blocked" :saving="saving" :unavailable="unavailableCategory" :in-view="visibleTasks.some(task => task.id === selected!.id)" @close="closeDetail" @save="saveDetail" @create-category="name => createCategory(name, true)" @delete="askDelete" />
      </div>
      <dialog ref="confirmation" aria-labelledby="delete-heading" aria-describedby="delete-title" @keydown.tab.prevent="moveDialogFocus" @cancel.prevent="dismissDelete">
        <h2 id="delete-heading">Supprimer définitivement cette tâche ?</h2>
        <p id="delete-title">{{ selected?.title }}</p>
        <div class="detail-actions">
          <button ref="cancelDelete" class="secondary" :disabled="saving" @click="dismissDelete">Annuler</button>
          <button class="danger" :disabled="blocked" @click="selected && mutate(selected)">{{ saving ? 'Suppression…' : 'Supprimer' }}</button>
        </div>
      </dialog>
      <dialog ref="categoryConfirmation" aria-labelledby="category-delete-heading" @keydown.tab.prevent="moveCategoryDialogFocus" @cancel.prevent="dismissCategoryDelete">
        <h2 id="category-delete-heading">Supprimer la catégorie « {{ currentCategory?.name }} » ?</h2>
        <p>Ses tâches actives et terminées seront conservées sans catégorie.</p>
        <div class="detail-actions">
          <button ref="cancelCategoryDelete" class="secondary" :disabled="saving" @click="dismissCategoryDelete">Annuler</button>
          <button class="danger" :disabled="blocked" @click="removeCategory">Supprimer</button>
        </div>
      </dialog>
      <p class="footnote">Les tâches sont conservées sur le PC. Actualisez pour retrouver les derniers ajouts.</p>
    </main>
  </div>
</template>

<style>
:root { font-family: system-ui, -apple-system, sans-serif; color: #263244; background: #f8f7f4; font-synthesis: none; }
* { box-sizing: border-box; }
body { margin: 0; }
button, input { font: inherit; }
button { min-height: 44px; padding: .65rem 1.1rem; border: 1px solid transparent; border-radius: .6rem; background: #285cc4; color: white; font-weight: 600; cursor: pointer; }
button:hover { background: #204b9e; }
button:disabled { opacity: .65; cursor: wait; }
.secondary { color: #31435d; background: white; border-color: #d6dce5; }
.secondary:hover { background: #eef2f8; }
:focus-visible { outline: 3px solid #3169d5; outline-offset: 3px; }
.shell { max-width: 1320px; margin: auto; padding: 0 36px 48px; }
.brand { display: flex; align-items: center; gap: 10px; height: 100px; font-weight: 700; color: #35455f; }
.brand-icon { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; color: white; background: #285cc4; }
main { max-width: 1120px; margin: 35px auto 0; }
.heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.eyebrow { font-size: .78rem; letter-spacing: .07em; color: #62718a; text-transform: uppercase; margin: 0 0 10px; }
h1 { margin: 0; font-size: clamp(1.7rem, 4vw, 2.2rem); font-weight: 650; letter-spacing: -.035em; }
.intro { color: #62718a; line-height: 1.6; margin-bottom: 30px; }
.capture { padding: 22px; background: white; border: 1px solid #e0e3e8; border-radius: 14px; box-shadow: 0 4px 16px #25344a05; position: sticky; top: 12px; z-index: 1; }
label { display: block; font-size: .9rem; font-weight: 650; margin-bottom: 10px; }
.capture-controls { display: flex; gap: 10px; }
input { min-width: 0; flex: 1; width: 100%; border: 1px solid #c4cddb; border-radius: .6rem; padding: .7rem .85rem; color: inherit; background: #fff; }
.message { font-size: .9rem; line-height: 1.5; margin: 10px 0 0; overflow-wrap: anywhere; }
.message:empty { display: none; }
.capture > button { margin-top: 12px; }
.task-section { margin-top: 34px; }
.section-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
h2 { font-size: 1rem; margin: 0; }
.section-heading > span { font-size: .8rem; color: #52617a; background: #e9edf4; padding: 2px 8px; border-radius: 20px; }
ul { padding: 0; margin: 0; list-style: none; background: white; border: 1px solid #e0e3e8; border-radius: 12px; overflow: hidden; }
li { padding: 19px 20px; display: flex; align-items: flex-start; gap: 14px; line-height: 1.5; overflow-wrap: anywhere; }
li + li { border-top: 1px solid #edf0f4; }
li > span:last-child { min-width: 0; }
.empty { text-align: center; color: #63718a; border: 1px dashed #d6dce5; border-radius: 12px; padding: 32px 20px; line-height: 1.6; }
.reading-state { margin-top: 24px; }
.empty-title { color: #35455f; font-weight: 600; }
.footnote { color: #69768b; font-size: .8rem; line-height: 1.6; margin-top: 24px; }
@media (max-width: 540px) {
  .shell { padding: 0 18px 32px; }
  .brand { height: 76px; }
  main { margin-top: 18px; }
  .heading { align-items: flex-start; flex-wrap: wrap; }
  .eyebrow { font-size: .7rem; }
  .capture { padding: 16px; }
  .capture-controls { flex-direction: column; }
  input { font-size: 16px; }
}
input[type="checkbox"] { flex: 0 0 24px; width: 24px; height: 24px; margin: 10px 0; accent-color: #285cc4; cursor: pointer; }
.task-title { background: transparent; color: #263244; text-align: left; font-weight: 400; padding: .6rem .3rem; min-width: 0; overflow-wrap: anywhere; }
.task-title:hover { background: #eef2f8; }
.workspace { display: grid; gap: 28px; }
.workspace.has-detail { grid-template-columns: minmax(0, 1fr) minmax(280px, 380px); }
.list-pane { min-width: 0; }
.detail { align-self: start; margin-top: 34px; border: 1px solid #e0e3e8; border-radius: 12px; background: white; padding: 22px; min-width: 0; }
.detail h2 { margin-top: 24px; }
.detail-actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0; }
.danger { color: #9b2435; border-color: #d8a7af; background: #fff; }
.danger:hover { background: #fff0f2; }
.completed-list { margin-top: 14px; }
dialog { width: min(480px, calc(100% - 36px)); border: 1px solid #d6dce5; border-radius: 14px; padding: 24px; color: #263244; }
dialog p { overflow-wrap: anywhere; max-height: 45vh; overflow-y: auto; }
dialog::backdrop { background: #18263e66; }
@media (max-width: 760px) {
  .workspace.has-detail { grid-template-columns: minmax(0, 1fr); }
  .has-detail .list-pane { display: none; }
  .detail { margin-top: 20px; }
}
</style>

<style>
.navigation nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0; align-items: start; }
.navigation nav > p { flex-basis: 100%; margin: 0; }
.navigation form { width: 100%; max-width: 360px; }
.navigation form button, .category-management button { margin-top: 10px; }
[aria-current="page"], [aria-pressed="true"] { border-color: #285cc4; background: #e8effd; }
.mobile-menu { display: none; }
.category-management { padding: 16px; border: 1px solid #d6dce5; border-radius: 12px; }
.category-picker { margin: 20px 0; padding: 14px; min-width: 0; border: 1px solid #d6dce5; border-radius: 10px; }
.suggestions { display: flex; flex-direction: column; align-items: stretch; gap: 6px; max-height: 230px; overflow-y: auto; margin: 10px 0; }
button, h1 { overflow-wrap: anywhere; }
@media (min-width: 1000px) {
  main { position: relative; padding-left: 220px; }
  .navigation { position: absolute; left: 0; top: 0; width: 195px; }
  .navigation nav { flex-direction: column; }
  .navigation nav > button { width: 100%; text-align: left; }
}
@media (max-width: 760px) {
  .mobile-menu { display: block; margin-top: 20px; }
  .navigation nav:not(.expanded) { display: none; }
  .navigation nav { flex-direction: column; align-items: stretch; }
}
</style>
