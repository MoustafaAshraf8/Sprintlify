ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS project_id UUID,
  ADD CONSTRAINT tickets_project_id_fk FOREIGN KEY (project_id)
    REFERENCES projects (project_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;