import { localCivilDate } from '#shared/task-selection'

export function useCivilToday() {
  const today = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined
  function refresh() {
    today.value = localCivilDate()
    clearTimeout(timer)
    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    timer = setTimeout(refresh, Math.max(1, midnight.getTime() - now.getTime()))
  }
  function onVisible() {
    if (document.visibilityState === 'visible') refresh()
  }
  onMounted(() => {
    refresh()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', refresh)
  })
  onBeforeUnmount(() => {
    clearTimeout(timer)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('focus', refresh)
  })
  return today
}
