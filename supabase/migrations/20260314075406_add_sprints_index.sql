CREATE INDEX idx_sprints_project_id
  ON sprints(project_id);

CREATE INDEX idx_sprints_status
  ON sprints(status);

CREATE UNIQUE INDEX idx_sprints_one_active_per_project
  ON sprints(project_id)
  WHERE status = 'active';