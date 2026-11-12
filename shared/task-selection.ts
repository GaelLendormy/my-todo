import type { Task, TaskPriority } from './types/task'

export const priorityLabels = { low: 'Basse', normal: 'Normale', high: 'Haute' } as const
export interface TaskFilters {
  category: string
  priority: 'all' | 'none' | Exclude<TaskPriority, null>
  due: 'all' | 'none' | 'overdue' | 'today' | 'exact'
  date: string
}
export function emptyFilters(): TaskFilters {
  return { category: 'all', priority: 'all', due: 'all', date: '' }
}
export function isCivilDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number) as [number, number, number]
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]!
}
export function localCivilDate(date = new Date()): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function isOverdue(task: Task, today: string): boolean {
  return !task.completed && task.dueDate !== null && task.dueDate < today
}
export function selectTasks(tasks: Task[], filters: TaskFilters, today: string): Task[] {
  return tasks.filter(task => (filters.category === 'all' || task.categoryId === (filters.category === 'none' ? null : filters.category))
    && (filters.priority === 'all' || task.priority === (filters.priority === 'none' ? null : filters.priority))
    && (filters.due === 'all' || (filters.due === 'none' ? task.dueDate === null
      : filters.due === 'overdue' ? isOverdue(task, today)
        : filters.due === 'today' ? task.dueDate === today : isCivilDate(filters.date) && task.dueDate === filters.date)))
}
export function displayCivilDate(date: string): string {
  return date.split('-').reverse().join('/')
}
