<script setup lang="ts">
import type { Task } from '../../shared/types/task'
import type { Category } from '../../shared/types/category'
defineProps<{ task: Task, categories: Category[], blocked: boolean, saving: boolean, unavailable: boolean, inView: boolean }>()
const title = defineModel<string>('title', { required: true })
const categoryId = defineModel<string | null>('categoryId', { required: true })
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
    <form @submit.prevent="$emit('save')">
      <label for="edit-title">Titre de la tâche</label>
      <input id="edit-title" ref="titleInput" v-model="title" :readonly="saving" aria-describedby="save-message">
      <CategoryPicker :key="task.id" v-model="categoryId" :categories="categories" :disabled="blocked" :readonly="saving" @create="name => $emit('createCategory', name)" />
      <p v-if="unavailable" role="alert">Catégorie indisponible. Actualisez ou choisissez une autre catégorie avant d’enregistrer.</p>
      <div class="detail-actions">
        <button type="submit" :disabled="blocked || unavailable">Enregistrer</button>
        <button type="button" class="secondary" :disabled="saving" @click="$emit('close')">Annuler</button>
      </div>
    </form>
    <button ref="deleteButton" class="danger" :disabled="blocked" @click="$emit('delete')">Supprimer la tâche</button>
  </aside>
</template>
