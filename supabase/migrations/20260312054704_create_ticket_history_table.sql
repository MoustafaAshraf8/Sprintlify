CREATE TABLE IF NOT EXISTS ticket_history (
  ticket_history_id UUID DEFAULT gen_random_uuid() NOT NULL,
  ticket_id UUID NOT NULL,
  changed_by UUID NOT NULL,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT ticket_history_pk PRIMARY KEY (ticket_history_id),
  CONSTRAINT ticket_history_ticket_history_id_fk FOREIGN KEY (ticket_id)
    REFERENCES tickets(ticket_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT ticket_history_changed_by_fk FOREIGN KEY (changed_by)
    REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);