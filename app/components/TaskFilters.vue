<script setup lang="ts">
import type { Category } from '../../shared/types/category'
import type { TaskFilters } from '../../shared/task-selection'
import { emptyFilters, priorityLabels } from '#shared/task-selection'
defineProps<{ categories: Category[], disabled: boolean }>()
const filters = defineModel<TaskFilters>({ required: true })
</script>
<template>
  <fieldset class="task-filters" :disabled="disabled">
    <legend>Filtrer les tâches</legend>
    <div>
      <label for="filter-category">Catégorie</label>
      <select id="filter-category" v-model="filters.category">
        <option value="all">Toutes les catégories</option>
        <option value="none">Sans catégorie</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        <option v-if="!['all', 'none'].includes(filters.category) && !categories.some(c => c.id === filters.category)" :value="filters.category">Catégorie indisponible</option>
      </select>
    </div>
    <div>
      <label for="filter-priority">Priorité</label>
      <select id="filter-priority" v-model="filters.priority">
        <option value="all">Toutes les priorités</option>
        <option value="none">Sans priorité</option>
        <option v-for="(label, value) in priorityLabels" :key="value" :value="value">{{ label }}</option>
      </select>
    </div>
    <div>
      <label for="filter-due">Échéance</label>
      <select id="filter-due" v-model="filters.due">
        <option value="all">Toutes les échéances</option>
        <option value="none">Sans échéance</option>
        <option value="overdue">En retard</option>
        <option value="today">Aujourd’hui</option>
        <option value="exact">Date précise</option>
      </select>
    </div>
    <div v-if="filters.due === 'exact'">
      <label for="filter-date">Date précise</label>
      <input id="filter-date" v-model="filters.date" type="date" min="0001-01-01" max="9999-12-31">
      <p v-if="!filters.date" class="message">Choisissez une date pour afficher les résultats.</p>
    </div>
    <button type="button" class="secondary" @click="filters = emptyFilters()">Réinitialiser les filtres</button>
  </fieldset>
</template>
<style scoped>
.task-filters { margin-top: 24px; padding: 16px; border: 1px solid #d6dce5; border-radius: 12px; display: flex; flex-wrap: wrap; gap: 16px; align-items: end; min-width: 0; }
.task-filters > div { flex: 1 1 180px; min-width: 0; }
legend { font-weight: 650; }
</style>
