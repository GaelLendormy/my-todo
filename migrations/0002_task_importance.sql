ALTER TABLE tasks ADD COLUMN priority TEXT CHECK (priority IS NULL OR priority IN ('low', 'normal', 'high'));
--> statement-breakpoint
ALTER TABLE tasks ADD COLUMN due_date TEXT CHECK (due_date IS NULL OR (length(due_date) = 10 AND due_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'));
