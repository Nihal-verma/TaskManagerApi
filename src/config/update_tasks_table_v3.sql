ALTER TABLE tasks
ADD COLUMN dependencies UUID[] DEFAULT '{}';