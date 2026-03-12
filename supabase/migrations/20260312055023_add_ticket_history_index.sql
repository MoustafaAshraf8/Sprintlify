CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket_id
  ON ticket_history(ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_history_changed_by
  ON ticket_history(changed_by);