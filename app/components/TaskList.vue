<script setup lang="ts">
import type { Task } from '../../shared/types/task'

defineProps<{ tasks: Task[], disabled: boolean }>()
defineEmits<{ open: [task: Task], toggle: [task: Task] }>()
</script>

<template>
  <ul>
    <li v-for="task in tasks" :key="task.id">
      <input type="checkbox" :checked="task.completed" :disabled="disabled" :aria-label="`${task.completed ? 'Rouvrir' : 'Terminer'} : ${task.title}`" @click.prevent="$emit('toggle', task)">
      <button :id="`task-${task.id}`" class="task-title" @click="$emit('open', task)">{{ task.title }}</button>
    </li>
  </ul>
</template>
