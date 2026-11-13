<script setup lang="ts">
import type { StepOrder, StepUpdate, Task, TaskStep } from '../../shared/types/task'
const props = defineProps<{
  task: Task
  blocked: boolean
  saving: boolean
  changeStep: (taskId: string, method: 'POST' | 'PATCH' | 'DELETE', stepId?: string, body?: StepUpdate | StepOrder) => Promise<boolean>
}>()
const addition = ref('')
const renameId = ref<string | null>(null)
const renameTitle = ref('')
const deleting = ref<TaskStep | null>(null)
const dialog = useTemplateRef('dialog')
const cancelButton = useTemplateRef('cancelButton')
const addInput = useTemplateRef('addInput')
const missingRename = computed(() => renameId.value !== null && !props.task.steps.some(step => step.id === renameId.value))

async function add() {
  if (props.blocked || !addition.value.trim()) return
  if (await props.changeStep(props.task.id, 'POST', undefined, { title: addition.value })) addition.value = ''
  await nextTick()
  addInput.value?.focus()
}
async function rename(step: TaskStep) {
  renameId.value = step.id
  renameTitle.value = step.title
  await nextTick()
  document.getElementById('step-rename')?.focus()
}
async function finishRename() {
  if (props.blocked || missingRename.value || !renameTitle.value.trim() || !renameId.value) return
  const id = renameId.value
  if (await props.changeStep(props.task.id, 'PATCH', id, { title: renameTitle.value })) {
    renameId.value = null
    await focusStep(id)
  }
}
async function toggle(step: TaskStep) {
  if (props.blocked) return
  await props.changeStep(props.task.id, 'PATCH', step.id, { completed: !step.completed })
  await nextTick()
  document.getElementById(`step-check-${step.id}`)?.focus()
}
async function move(step: TaskStep, direction: 'up' | 'down') {
  if (props.blocked) return
  await props.changeStep(props.task.id, 'PATCH', 'order', {
    stepId: step.id, direction, expectedOrder: props.task.steps.map(item => item.id),
  })
  await nextTick()
  const preferred = document.getElementById(`step-${direction}-${step.id}`) as HTMLButtonElement | null
  const alternate = document.getElementById(`step-${direction === 'up' ? 'down' : 'up'}-${step.id}`) as HTMLButtonElement | null
  if (preferred && !preferred.disabled) preferred.focus()
  else if (alternate && !alternate.disabled) alternate.focus()
  else document.getElementById(`step-title-${step.id}`)?.focus()
}
async function focusStep(id: string) {
  await nextTick()
  const target = document.getElementById(`rename-${id}`)
  if (target) target.focus()
  else addInput.value?.focus()
}
async function cancelRename() {
  if (props.saving) return
  const id = renameId.value
  renameId.value = null
  if (id) await focusStep(id)
}
async function askDelete(step: TaskStep) {
  if (props.blocked) return
  deleting.value = step
  dialog.value?.showModal()
  await nextTick()
  cancelButton.value?.focus()
}
async function dismissDelete() {
  if (props.saving) return
  const id = deleting.value?.id
  dialog.value?.close()
  deleting.value = null
  if (id) await focusStep(id)
}
async function remove() {
  if (props.blocked || !deleting.value) return
  const id = deleting.value.id
  const removed = await props.changeStep(props.task.id, 'DELETE', id)
  dialog.value?.close()
  deleting.value = null
  if (removed) {
    if (renameId.value === id) renameId.value = null
    await nextTick()
    addInput.value?.focus()
  }
  else await focusStep(id)
}
function trapFocus(event: KeyboardEvent) {
  const buttons = Array.from(dialog.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
  buttons[(index + (event.shiftKey ? buttons.length - 1 : 1)) % buttons.length]?.focus()
}
</script>

<template>
  <section class="steps" aria-labelledby="steps-heading">
    <h2 id="steps-heading">Étapes</h2>
    <p v-if="task.steps.length" class="progress">{{ task.steps.filter(step => step.completed).length }} étapes sur {{ task.steps.length }} terminées</p>
    <p class="message">Chaque opération d’étape est enregistrée séparément, sans enregistrer le formulaire de la tâche. Retour et Annuler abandonnent les saisies non soumises, mais conservent les étapes confirmées. Ajouter une étape à faire rouvre une tâche terminée.</p>
    <ul v-if="task.steps.length" class="step-list">
      <li v-for="(step, index) in task.steps" :key="step.id">
        <input :id="`step-check-${step.id}`" type="checkbox" :checked="step.completed" :disabled="blocked" :aria-label="`${step.completed ? 'Rouvrir' : 'Terminer'} l’étape : ${step.title}`" @click.prevent="toggle(step)">
        <div class="step-content">
          <p :id="`step-title-${step.id}`" tabindex="-1">{{ step.title }}</p>
          <div class="detail-actions">
            <button :id="`step-up-${step.id}`" class="secondary" :disabled="blocked || index === 0" :aria-label="`Monter l’étape : ${step.title}`" @click="move(step, 'up')">Monter</button>
            <button :id="`step-down-${step.id}`" class="secondary" :disabled="blocked || index === task.steps.length - 1" :aria-label="`Descendre l’étape : ${step.title}`" @click="move(step, 'down')">Descendre</button>
            <button :id="`rename-${step.id}`" class="secondary" :disabled="blocked" :aria-label="`Renommer l’étape : ${step.title}`" @click="rename(step)">Renommer</button>
            <button class="danger" :disabled="blocked" :aria-label="`Supprimer l’étape : ${step.title}`" @click="askDelete(step)">Supprimer</button>
          </div>
        </div>
      </li>
    </ul>
    <form v-if="renameId" class="step-form" @submit.prevent="finishRename" @keydown.esc.stop.prevent="cancelRename">
      <label for="step-rename">Nouveau titre de l’étape</label>
      <input id="step-rename" v-model="renameTitle" :readonly="saving">
      <p v-if="missingRename" role="alert">Cette étape a disparu. Votre saisie reste disponible comme référence ; elle ne sera pas recréée.</p>
      <div class="detail-actions">
        <button :disabled="blocked || missingRename || !renameTitle.trim()">Enregistrer le titre de l’étape</button>
        <button type="button" class="secondary" :disabled="saving" @click="cancelRename">Annuler le renommage</button>
      </div>
    </form>
    <form class="step-form" @submit.prevent="add">
      <label for="new-step">Nouvelle étape</label>
      <input id="new-step" ref="addInput" v-model="addition" :readonly="saving" autocomplete="off">
      <button :disabled="blocked || !addition.trim()">Ajouter une étape</button>
    </form>
    <dialog ref="dialog" aria-labelledby="step-delete-heading" aria-describedby="step-delete-title" @keydown.esc.stop @keydown.tab.prevent="trapFocus" @cancel.prevent="dismissDelete">
      <h2 id="step-delete-heading">Supprimer définitivement cette étape ?</h2>
      <p id="step-delete-title">{{ deleting?.title }}</p>
      <p>Si c’est la dernière étape, la tâche conserve son état et retrouve sa réalisation manuelle.</p>
      <div class="detail-actions">
        <button ref="cancelButton" class="secondary" :disabled="saving" @click="dismissDelete">Annuler</button>
        <button class="danger" :disabled="blocked" @click="remove">Supprimer</button>
      </div>
    </dialog>
  </section>
</template>

<style scoped>
.steps { margin: 24px 0; border-top: 1px solid #e0e3e8; }
.step-list { margin-top: 16px; }
.step-list li { padding: 12px; }
.step-content { min-width: 0; flex: 1; }
.step-content p { margin: 0; }
.step-content .detail-actions { margin: 6px 0 0; }
.step-form { margin-top: 20px; }
.step-form > button { margin-top: 10px; }
.progress { font-weight: 650; }
</style>
