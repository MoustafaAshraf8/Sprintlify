CREATE TABLE IF NOT EXISTS ticket_comments (
  ticket_comment_id  UUID DEFAULT gen_random_uuid() NOT NULL,
  ticket_id   UUID NOT NULL REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT ticket_comments_pk PRIMARY KEY (ticket_comment_id),

  CONSTRAINT ticket_comments_ticket_id_fk FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
  ON UPDATE CASCADE
  ON DELETE SET NULL,

  CONSTRAINT ticket_comments_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id)
  ON UPDATE CASCADE
  ON DELETE SET NULL

);