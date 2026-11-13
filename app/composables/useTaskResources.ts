import type { StepOrder, StepUpdate, Task } from '../../shared/types/task'
import type { Category } from '../../shared/types/category'
import { sortCategories } from '#shared/category-names'

export function useTaskResources() {
  const requestTimeout = 10_000
  const tasks = ref<Task[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(true)
  const loadFailed = ref(false)
  const saving = ref(false)
  const uncertain = ref(false)
  const message = ref('')
  const blocked = computed(() => loading.value || saving.value || uncertain.value)
  let reading = false
  async function readResources() {
    if (saving.value || reading) return false
    reading = true
    loading.value = true
    loadFailed.value = false
    try {
      // Attend les deux fins, même après refus, avant d'autoriser une écriture.
      const [taskResult, categoryResult] = await Promise.allSettled([
        $fetch<Task[]>('/api/tasks', { retry: 0, timeout: requestTimeout }),
        $fetch<Category[]>('/api/categories', { retry: 0, timeout: requestTimeout }),
      ])
      if (taskResult.status === 'rejected' || categoryResult.status === 'rejected') throw new Error('Lecture incomplète')
      tasks.value = taskResult.value
      categories.value = sortCategories(categoryResult.value)
      uncertain.value = false
      return true
    }
    catch { loadFailed.value = true; return false }
    finally { loading.value = false; reading = false }
  }
  async function changeCategory(method: 'POST' | 'PATCH' | 'DELETE', id?: string, name?: string) {
    if (blocked.value) return
    saving.value = true
    message.value = 'Enregistrement en cours…'
    try {
      const url = id ? `/api/categories/${id}` : '/api/categories'
      if (method === 'DELETE') {
        await $fetch(url, { method, retry: 0, timeout: requestTimeout })
        categories.value = categories.value.filter(c => c.id !== id)
        tasks.value = tasks.value.map(task => task.categoryId === id ? { ...task, categoryId: null } : task)
        message.value = 'Catégorie supprimée. Ses tâches sont conservées sans catégorie.'
        return true
      }
      const saved = await $fetch<Category>(url, { method, body: { name }, retry: 0, timeout: requestTimeout })
      categories.value = sortCategories([...categories.value.filter(c => c.id !== saved.id), saved])
      message.value = method === 'POST'
        ? 'Catégorie créée. Le classement de la tâche attend Enregistrer.'
        : 'Catégorie renommée.'
      return saved
    }
    catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status
      if (status && status >= 400 && status < 500) {
        message.value = status === 409 ? 'Ce nom existe déjà. Actualisez puis sélectionnez la catégorie existante ; votre saisie est conservée.'
          : status === 404 ? 'Cette catégorie est absente. Actualisez ; votre saisie est conservée.'
            : 'Modification de catégorie refusée. Votre saisie est conservée.'
      }
      else {
        uncertain.value = true
        message.value = 'Résultat à vérifier : la catégorie a peut-être été modifiée. Relisez la liste avant de réessayer ; votre saisie est conservée.'
      }
    }
    finally { saving.value = false }
  }
  async function changeStep(taskId: string, method: 'POST' | 'PATCH' | 'DELETE', stepId?: string, body?: StepUpdate | StepOrder) {
    if (blocked.value) return false
    saving.value = true
    message.value = 'Enregistrement en cours…'
    try {
      const saved = await $fetch<Task>(`/api/tasks/${taskId}/steps${stepId ? `/${stepId}` : ''}`, {
        method, body, retry: 0, timeout: requestTimeout,
      })
      const previous = tasks.value.find(task => task.id === taskId)
      tasks.value = tasks.value.map(task => task.id === saved.id ? saved : task)
      const moved = body && 'expectedOrder' in body ? saved.steps.find(step => step.id === body.stepId) : undefined
      message.value = moved ? `Étape « ${moved.title} » déplacée en position ${moved.position + 1} sur ${saved.steps.length}.` : saved.completed !== previous?.completed
        ? `Étape enregistrée. La tâche est ${saved.completed ? 'terminée' : 'rouverte'}. Son détail reste ouvert.`
        : 'Étape enregistrée. Son détail reste ouvert.'
      return true
    }
    catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status
      if (status && status >= 400 && status < 500) {
        if (status === 409 && (error as { data?: { data?: { code?: string } } }).data?.data?.code === 'STEP_ORDER_CHANGED') {
          uncertain.value = true
          message.value = 'L’ordre des étapes a changé. Aucun déplacement effectué. Relisez la liste avant de décider d’un nouveau déplacement ; vos saisies sont conservées.'
          return false
        }
        message.value = status === 404
          ? 'Cette tâche ou étape est absente. Actualisez ; votre saisie est conservée.'
          : 'Modification d’étape refusée. Votre saisie est conservée.'
      }
      else {
        uncertain.value = true
        message.value = 'Résultat à vérifier : l’étape a peut-être été modifiée. Relisez la liste avant de réessayer ; votre saisie est conservée.'
      }
      return false
    }
    finally { saving.value = false }
  }
  return { requestTimeout, tasks, categories, loading, loadFailed, saving, uncertain, message, blocked, readResources, changeCategory, changeStep }
}
