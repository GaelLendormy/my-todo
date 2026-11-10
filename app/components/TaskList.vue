<script setup lang="ts">
import type { Category } from '../../shared/types/category'
import type { Task } from '../../shared/types/task'

defineProps<{ tasks: Task[], categories: Category[], disabled: boolean }>()
defineEmits<{ open: [task: Task], toggle: [task: Task] }>()
</script>

<template>
  <ul>
    <li v-for="task in tasks" :key="task.id">
      <input type="checkbox" :checked="task.completed" :disabled="disabled" :aria-label="`${task.completed ? 'Rouvrir' : 'Terminer'} : ${task.title}`" @click.prevent="$emit('toggle', task)">
      <div class="task-label">
      <button :id="`task-${task.id}`" class="task-title" @click="$emit('open', task)">{{ task.title }}</button>
      <p v-if="task.categoryId" class="task-category">{{ categories.find(category => category.id === task.categoryId)?.name ?? 'Catégorie indisponible — actualisez' }}</p>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.task-label { min-width: 0; }
.task-category { margin: 0; font-size: .8rem; color: #62718a; overflow-wrap: anywhere; }
</style>
