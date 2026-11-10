CREATE TABLE categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0 AND instr(name, char(0)) = 0),
  name_key TEXT NOT NULL UNIQUE CHECK (length(name_key) > 0)
) STRICT;
--> statement-breakpoint
ALTER TABLE tasks ADD COLUMN category_id TEXT REFERENCES categories(id) ON DELETE SET NULL;
