<script setup lang="ts">
import { priorityLabels, isOverdue } from '#shared/task-selection'
import type { StepOrder, StepUpdate, TaskPriority, Task } from '../../shared/types/task'
import type { Category } from '../../shared/types/category'
defineProps<{ task: Task, categories: Category[], blocked: boolean, saving: boolean, unavailable: boolean, inView: boolean, today: string, changeStep: (taskId: string, method: 'POST' | 'PATCH' | 'DELETE', stepId?: string, body?: StepUpdate | StepOrder) => Promise<boolean> }>()
const title = defineModel<string>('title', { required: true })
const categoryId = defineModel<string | null>('categoryId', { required: true })
const priority = defineModel<TaskPriority>('priority', { required: true })
const dueDate = defineModel<string>('dueDate', { required: true })
defineEmits<{ close: [], save: [], createCategory: [name: string], delete: [] }>()
const titleInput = useTemplateRef('titleInput')
const deleteButton = useTemplateRef('deleteButton')
defineExpose({ focusTitle: () => titleInput.value?.focus(), focusDelete: () => deleteButton.value?.focus() })
</script>
<template>
  <aside class="detail" aria-labelledby="detail-heading" @keydown.esc="$emit('close')">
    <button class="secondary" :disabled="saving" @click="$emit('close')">Retour à la liste</button>
    <h2 id="detail-heading">Détail de la tâche</h2>
    <p>{{ task.completed ? 'Terminée' : 'À faire' }}</p>
    <p v-if="!inView" class="message">Cette tâche ne correspond plus à la vue consultée. Son détail reste ouvert.</p>
    <p v-if="isOverdue(task, today)" class="overdue">En retard</p>
    <form @submit.prevent="$emit('save')">
      <label for="edit-title">Titre de la tâche</label>
      <input id="edit-title" ref="titleInput" v-model="title" :readonly="saving" aria-describedby="save-message">
      <CategoryPicker :key="task.id" v-model="categoryId" :categories="categories" :disabled="blocked" :readonly="saving" @create="name => $emit('createCategory', name)" />
      <p v-if="unavailable" role="alert">Catégorie indisponible. Actualisez ou choisissez une autre catégorie avant d’enregistrer.</p>
      <label for="edit-priority">Priorité</label>
      <select id="edit-priority" v-model="priority" :disabled="saving">
        <option :value="null">Sans priorité</option>
        <option v-for="(label, value) in priorityLabels" :key="value" :value="value">{{ label }}</option>
      </select>
      <label class="date-label" for="edit-due-date">Date limite</label>
      <input id="edit-due-date" v-model="dueDate" type="date" min="0001-01-01" max="9999-12-31" :readonly="saving" aria-describedby="due-date-help">
      <p id="due-date-help" class="message">Facultative, sans heure. Ce n’est pas un jour prévu.</p>
      <button type="button" class="secondary" :disabled="saving || !dueDate" @click="dueDate = ''">Effacer la date limite</button>
      <div class="detail-actions">
        <button type="submit" :disabled="blocked || unavailable">Enregistrer</button>
        <button type="button" class="secondary" :disabled="saving" @click="$emit('close')">Annuler</button>
      </div>
    </form>
    <TaskSteps :task="task" :blocked="blocked" :saving="saving" :change-step="changeStep" />
    <button ref="deleteButton" class="danger" :disabled="blocked" @click="$emit('delete')">Supprimer la tâche</button>
  </aside>
</template>

<style scoped>
.date-label { margin-top: 20px; }
</style>
