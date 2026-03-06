ALTER TABLE users
   DROP COLUMN full_name;

ALTER TABLE users
   DROP COLUMN is_active;

ALTER TABLE users
   ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL;

ALTER TABLE users
   ADD COLUMN IF NOT EXISTS security_level TEXT DEFAULT 'member' CHECK (security_level IN ('admin', 'member'));
