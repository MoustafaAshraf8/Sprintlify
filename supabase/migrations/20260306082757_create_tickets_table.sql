CREATE TABLE IF NOT EXISTS tickets (
  ticket_id   UUID DEFAULT gen_random_uuid() NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  priority    TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status      TEXT DEFAULT 'open'   CHECK (status IN ('open', 'in progress', 'review', 'closed')),
  label       TEXT                  CHECK (label IN ('bug', 'feature', 'infra', 'docs', 'security', 'perf')),
  assignee_id UUID,
  reporter_id UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT tickets_pk PRIMARY KEY (ticket_id),

  CONSTRAINT tickets_users_assignee_fk FOREIGN KEY (assignee_id) REFERENCES users(user_id)
  ON UPDATE CASCADE
  ON DELETE SET NULL,

  CONSTRAINT tickets_users_reporter_fk FOREIGN KEY (reporter_id) REFERENCES users(user_id)
  ON UPDATE CASCADE
  ON DELETE SET NULL
);