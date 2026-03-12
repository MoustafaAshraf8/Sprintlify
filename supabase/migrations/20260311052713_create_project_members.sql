CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  project_security_level TEXT DEFAULT 'member' CHECK (project_security_level IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT project_members_pk PRIMARY KEY (project_id, user_id),
  CONSTRAINT project_members_project_id_fk FOREIGN KEY (project_id)
    REFERENCES projects(project_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT project_members_user_fk FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);