import { sql } from 'drizzle-orm'
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  nameKey: text('name_key').notNull().unique(),
}, table => [
  check('category_name_valid', sql`length(trim(${table.name})) > 0 AND instr(${table.name}, char(0)) = 0`),
  check('category_key_valid', sql`length(${table.nameKey}) > 0`),
])

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  priority: text('priority', { enum: ['low', 'normal', 'high'] }),
  dueDate: text('due_date'),
  createdAt: integer('created_at').notNull(),
}, table => [
  check('title_valid', sql`typeof(${table.title}) = 'text' AND length(trim(${table.title}, char(9,10,11,12,13,32,133,160,5760,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8232,8233,8239,8287,12288,65279))) > 0 AND instr(${table.title}, char(0)) = 0`),
  check('priority_valid', sql`${table.priority} IS NULL OR ${table.priority} IN ('low', 'normal', 'high')`),
  check('due_date_valid', sql`${table.dueDate} IS NULL OR (length(${table.dueDate}) = 10 AND ${table.dueDate} GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')`),
  check('completed_valid', sql`${table.completed} IN (0, 1)`),
])
