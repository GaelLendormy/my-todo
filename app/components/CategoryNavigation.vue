<script setup lang="ts">
import type { Category } from '../../shared/types/category'
defineProps<{ categories: Category[], view: string, disabled: boolean }>()
const emit = defineEmits<{ navigate: [view: string], create: [name: string] }>()
const name = ref('')
const expanded = ref(false)
function navigate(view: string) { emit('navigate', view); expanded.value = false }
</script>
<template>
  <div class="navigation">
    <button class="secondary mobile-menu" :aria-expanded="expanded" aria-controls="views" @click="expanded = !expanded">Choisir une vue</button>
    <nav id="views" aria-label="Vues des tâches" :class="{ expanded }">
      <p class="footnote">Changer de vue ferme le détail et abandonne son brouillon.</p>
      <button class="secondary" :disabled="disabled" :aria-current="view === 'inbox' ? 'page' : undefined" @click="navigate('inbox')">Boîte de réception</button>
      <button class="secondary" :disabled="disabled" :aria-current="view === 'all' ? 'page' : undefined" @click="navigate('all')">Toutes les tâches</button>
      <button v-for="category in categories" :key="category.id" class="secondary" :disabled="disabled" :aria-current="view === category.id ? 'page' : undefined" @click="navigate(category.id)">{{ category.name }}</button>
      <form @submit.prevent="emit('create', name)">
        <label for="new-category">Nouvelle catégorie</label>
        <input id="new-category" v-model="name" :readonly="disabled" autocomplete="off">
        <button type="submit" :disabled="disabled || !name.trim()">Créer une catégorie</button>
      </form>
    </nav>
  </div>
</template>
