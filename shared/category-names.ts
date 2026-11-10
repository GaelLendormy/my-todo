import type { Category } from './types/category'

export function categoryName(value: string): string {
  return value.normalize('NFC').replace(/[\p{White_Space}\uFEFF]+/gu, ' ').trim()
}
export function categoryKey(value: string): string {
  return categoryName(value).toLowerCase().normalize('NFC')
}
export function sortCategories(values: Category[]): Category[] {
  return [...values].sort((a, b) => a.name.localeCompare(b.name, 'fr') || a.id.localeCompare(b.id))
}
