ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS sprint_id UUID,
  ADD CONSTRAINT tickets_sprint_id_fk
    FOREIGN KEY (sprint_id)
    REFERENCES sprints (sprint_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;