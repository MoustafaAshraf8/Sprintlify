CREATE TABLE sprints (
  sprint_id  UUID DEFAULT gen_random_uuid() NOT NULL,
  project_id UUID NOT NULL,
  sprint_name TEXT NOT NULL,
  goal TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT sprints_sprint_id_pk PRIMARY KEY (sprint_id),

  CONSTRAINT sprints_project_fk
    FOREIGN KEY (project_id)
    REFERENCES projects(project_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT sprints_created_by_fk
    FOREIGN KEY (created_by)
    REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  -- end date must be after start date
  CONSTRAINT sprints_date_check
    CHECK (end_date > start_date),

  -- max 90 days, min 1 day
  CONSTRAINT sprints_duration_check
    CHECK ((end_date - start_date) BETWEEN 1 AND 30)
);