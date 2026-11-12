export type TaskPriority = 'low' | 'normal' | 'high' | null
export type TaskUpdate = Partial<Pick<Task, 'title' | 'completed' | 'categoryId' | 'priority' | 'dueDate'>>

export interface Task {
  id: string
  title: string
  completed: boolean
  categoryId: string | null
  priority: TaskPriority
  dueDate: string | null
  createdAt: number
}
