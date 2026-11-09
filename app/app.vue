<script setup lang="ts">
import type { Task } from '../shared/types/task'

const tasks = ref<Task[]>([])
const title = ref('')
const loading = ref(true)
const loadFailed = ref(false)
const saving = ref(false)
const uncertain = ref(false)
const message = ref('')
const input = useTemplateRef('titleInput')
const selectedId = ref<string | null>(null)
const selected = computed(() => tasks.value.find(task => task.id === selectedId.value))
const draft = ref('')
const completedOpen = ref(false)
const active = computed(() => tasks.value.filter(task => !task.completed))
const completed = computed(() => tasks.value.filter(task => task.completed))
const blocked = computed(() => loading.value || saving.value || uncertain.value)
const detailInput = useTemplateRef('detailInput')
const confirmation = useTemplateRef('confirmation')
const deleteButton = useTemplateRef('deleteButton')
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
  await nextTick()
  detailInput.value?.focus()
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
  deleteButton.value?.focus()
}

async function mutate(task: Task, update?: { title?: string, completed?: boolean }) {
  if (blocked.value) return
  if (update?.title !== undefined && !update.title.trim()) {
    message.value = 'Le titre doit contenir du texte.'
    detailInput.value?.focus()
    return
  }
  saving.value = true
  message.value = 'Enregistrement en cours…'
  let deleted = false
  try {
    if (update) {
      const saved = await $fetch<Task>(`/api/tasks/${task.id}`, { method: 'PATCH', body: update, retry: 0 })
      tasks.value = tasks.value.map(item => item.id === saved.id ? saved : item)
      if (update.title !== undefined) draft.value = saved.title
      message.value = 'Modification enregistrée.'
    }
    else {
      await $fetch(`/api/tasks/${task.id}`, { method: 'DELETE', retry: 0 })
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
      message.value = status === 404
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
      else deleteButton.value?.focus()
    }
    else if (update.title !== undefined) {
      await nextTick()
      detailInput.value?.focus()
    }
    else if (!selectedId.value) await restoreListFocus(task.id)
  }
}

let reading = false
async function reload() {
  if (saving.value || reading) return
  reading = true
  const wasUncertain = uncertain.value
  loading.value = true
  loadFailed.value = false
  try {
    tasks.value = await $fetch<Task[]>('/api/tasks', { retry: 0 })
    uncertain.value = false
    if (wasUncertain) message.value = 'Liste relue. Vérifiez le titre, l’état et la présence de la tâche avant de soumettre à nouveau ; votre saisie est conservée.'
    if (selectedId.value && !selected.value) {
      await closeDetail()
      message.value = 'Liste relue : cette tâche est absente du serveur.'
    }
  }
  catch { loadFailed.value = true }
  finally { loading.value = false; reading = false }
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
      method: 'POST', body: { title: title.value }, retry: 0,
    })
    tasks.value = [created, ...tasks.value].sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id))
    title.value = ''
    message.value = 'Tâche enregistrée.'
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
        <div><p class="eyebrow">Un peu d'espace pour vos idées</p><h1>Boîte de réception</h1></div>
        <button class="secondary" :disabled="loading || saving" @click="reload">Actualiser</button>
      </div>
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
      <div class="workspace" :class="{ 'has-detail': selected }">
        <div class="list-pane">
          <section class="task-section" aria-label="Tâches à faire" :aria-busy="loading">
            <div class="section-heading"><h2>À faire</h2><span v-if="!loadFailed && !loading">{{ active.length }}</span></div>
            <p v-if="loading" role="status" class="empty">Chargement des tâches…</p>
            <div v-else-if="loadFailed" role="alert" class="empty">
              <p>Impossible de charger les tâches. La liste n'est pas disponible.</p>
              <button class="secondary" @click="reload">Réessayer le chargement</button>
            </div>
            <div v-else-if="tasks.length === 0" class="empty"><p class="empty-title">L'esprit un peu plus libre.</p><p>Votre boîte de réception est vide. Ajoutez votre première tâche ci-dessus.</p></div>
            <template v-else>
              <TaskList v-if="active.length" :tasks="active" :disabled="blocked" @open="openDetail" @toggle="task => mutate(task, { completed: !task.completed })" />
              <p v-else class="empty">Aucune tâche à faire.</p>
            </template>
          </section>
          <section v-if="!loading && !loadFailed" class="task-section" aria-label="Tâches terminées">
            <button ref="completedButton" class="secondary" :aria-expanded="completedOpen" aria-controls="completed-list" @click="completedOpen = !completedOpen">Terminées ({{ completed.length }})</button>
            <div v-if="completedOpen" id="completed-list" class="completed-list">
              <TaskList v-if="completed.length" :tasks="completed" :disabled="blocked" @open="openDetail" @toggle="task => mutate(task, { completed: !task.completed })" />
              <p v-else>Aucune tâche terminée.</p>
            </div>
          </section>
        </div>
        <aside v-if="selected" class="detail" aria-labelledby="detail-heading" @keydown.esc="closeDetail">
          <button class="secondary" :disabled="saving" @click="closeDetail">Retour à la liste</button>
          <h2 id="detail-heading">Détail de la tâche</h2>
          <p>{{ selected.completed ? 'Terminée' : 'À faire' }}</p>
          <form @submit.prevent="mutate(selected!, { title: draft })">
            <label for="edit-title">Titre de la tâche</label>
            <input id="edit-title" ref="detailInput" v-model="draft" :readonly="saving" aria-describedby="save-message">
            <div class="detail-actions">
              <button type="submit" :disabled="blocked">Enregistrer</button>
              <button type="button" class="secondary" :disabled="saving" @click="closeDetail">Annuler</button>
            </div>
          </form>
          <button ref="deleteButton" class="danger" :disabled="blocked" @click="askDelete">Supprimer la tâche</button>
        </aside>
      </div>
      <dialog ref="confirmation" aria-labelledby="delete-heading" aria-describedby="delete-title" @keydown.tab.prevent="moveDialogFocus" @cancel.prevent="dismissDelete">
        <h2 id="delete-heading">Supprimer définitivement cette tâche ?</h2>
        <p id="delete-title">{{ selected?.title }}</p>
        <div class="detail-actions">
          <button ref="cancelDelete" class="secondary" :disabled="saving" @click="dismissDelete">Annuler</button>
          <button class="danger" :disabled="blocked" @click="selected && mutate(selected)">{{ saving ? 'Suppression…' : 'Supprimer' }}</button>
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
