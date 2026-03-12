CREATE TABLE IF NOT EXISTS projects (
  project_id  UUID DEFAULT gen_random_uuid() NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT projects_pk PRIMARY KEY (project_id),
  CONSTRAINT projects_owner_fk FOREIGN KEY (owner_id)
    REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);