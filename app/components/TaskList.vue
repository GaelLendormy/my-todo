<script setup lang="ts">
import { priorityLabels, isOverdue, displayCivilDate } from '#shared/task-selection'
import type { Category } from '../../shared/types/category'
import type { Task } from '../../shared/types/task'

defineProps<{ tasks: Task[], categories: Category[], disabled: boolean, today: string }>()
defineEmits<{ open: [task: Task], toggle: [task: Task] }>()
</script>

<template>
  <ul>
    <li v-for="task in tasks" :key="task.id">
      <input v-if="!task.steps.length" type="checkbox" :checked="task.completed" :disabled="disabled" :aria-label="`${task.completed ? 'Rouvrir' : 'Terminer'} : ${task.title}`" @click.prevent="$emit('toggle', task)">
      <div class="task-label">
      <p v-if="task.steps.length" class="task-category">{{ task.steps.filter(step => step.completed).length }} étapes sur {{ task.steps.length }} terminées</p>
      <button :id="`task-${task.id}`" class="task-title" @click="$emit('open', task)">{{ task.title }}</button>
      <p v-if="task.categoryId" class="task-category">{{ categories.find(category => category.id === task.categoryId)?.name ?? 'Catégorie indisponible — actualisez' }}</p>
      <p v-if="task.priority" class="task-category">Priorité {{ priorityLabels[task.priority] }}</p>
      <p v-if="task.dueDate" class="task-category">Date limite : <time :datetime="task.dueDate">{{ displayCivilDate(task.dueDate) }}</time><span v-if="isOverdue(task, today)" class="overdue"> — En retard</span></p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.task-label { min-width: 0; }
.task-category { margin: 0; font-size: .8rem; color: #62718a; overflow-wrap: anywhere; }
</style>
