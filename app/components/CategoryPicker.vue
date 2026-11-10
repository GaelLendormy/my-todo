<script setup lang="ts">
import type { Category } from '../../shared/types/category'
import { categoryKey, sortCategories } from '#shared/category-names'

const props = defineProps<{ categories: Category[], disabled: boolean, readonly: boolean }>()
const selected = defineModel<string | null>({ required: true })
const emit = defineEmits<{ create: [name: string] }>()
const search = ref('')
const suggestions = computed(() => sortCategories(props.categories).filter(c => categoryKey(c.name).includes(categoryKey(search.value))))
const selectedName = computed(() => selected.value === null ? 'Sans catégorie' : props.categories.find(c => c.id === selected.value)?.name ?? 'Catégorie indisponible : choisissez une autre catégorie ou Sans catégorie.')
const suggestionsList = useTemplateRef('suggestionsList')
function firstSuggestion() { suggestionsList.value?.querySelector<HTMLButtonElement>('button')?.focus() }
function move(event: KeyboardEvent) {
  const buttons = Array.from(suggestionsList.value?.querySelectorAll<HTMLButtonElement>('button') ?? [])
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
  buttons[(index + (event.key === 'ArrowUp' ? buttons.length - 1 : 1)) % buttons.length]?.focus()
}
</script>
<template>
  <fieldset class="category-picker">
    <legend>Classement</legend>
    <p>Catégorie sélectionnée : {{ selectedName }}</p>
    <label for="category-search">Rechercher une catégorie</label>
    <input id="category-search" v-model="search" autocomplete="off" :readonly="readonly" aria-controls="category-suggestions" @keydown.down.prevent="firstSuggestion" @keydown.enter.prevent="firstSuggestion">
    <div id="category-suggestions" ref="suggestionsList" class="suggestions" aria-label="Suggestions de catégories" @keydown.down.prevent="move" @keydown.up.prevent="move">
      <button type="button" class="secondary" :disabled="readonly" :aria-pressed="selected === null" @click="selected = null">Sans catégorie</button>
      <button v-for="category in suggestions" :key="category.id" type="button" class="secondary" :disabled="readonly" :aria-pressed="selected === category.id" @click="selected = category.id">{{ category.name }}</button>
    </div>
    <p v-if="!suggestions.length">Aucune catégorie correspondante.</p>
    <button type="button" class="secondary" :disabled="disabled || !categoryKey(search)" @click="emit('create', search)">Créer la catégorie « {{ search.trim() }} »</button>
    <p class="footnote">La saisie seule ne change pas le classement. Créer enregistre une catégorie ; Enregistrer applique le classement à la tâche.</p>
  </fieldset>
</template>
