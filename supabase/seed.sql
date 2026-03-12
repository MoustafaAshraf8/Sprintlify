-- ─── seed.sql ─────────────────────────────────────────────────────────────────

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── users ────────────────────────────────────────────────────────────────────

INSERT INTO users (user_id, email, username, nickname, bio, security_level, password_hash) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'admin@sprintlify.com',
    'admin',
    'The Boss',
    'Platform administrator',
    'admin',
    crypt('Admin123!', gen_salt('bf', 10))
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'alex@sprintlify.com',
    'alex_dev',
    'Alex',
    'Frontend developer who loves React',
    'member',
    crypt('Member123!', gen_salt('bf', 10))
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'jordan@sprintlify.com',
    'jordan_dev',
    'Jordan',
    'Backend developer, Postgres enthusiast',
    'member',
    crypt('Member123!', gen_salt('bf', 10))
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'sam@sprintlify.com',
    'sam_dev',
    'Sam',
    'Full stack developer and DevOps',
    'member',
    crypt('Member123!', gen_salt('bf', 10))
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'riley@sprintlify.com',
    'riley_dev',
    'Riley',
    'Mobile developer, Flutter expert',
    'member',
    crypt('Member123!', gen_salt('bf', 10))
  );

-- ─── projects ─────────────────────────────────────────────────────────────────

INSERT INTO projects (project_id, name, description, owner_id) VALUES
  (
    '00000000-0000-0000-0001-000000000001',
    'Sprintlify',
    'Internal ticket management platform',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '00000000-0000-0000-0001-000000000002',
    'Mobile App',
    'Flutter mobile application',
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    '00000000-0000-0000-0001-000000000003',
    'Infrastructure',
    'DevOps and cloud infrastructure',
    '00000000-0000-0000-0000-000000000003'
  );

-- ─── project members ──────────────────────────────────────────────────────────
-- project_security_level: 'owner' | 'member'

INSERT INTO project_members (project_id, user_id, project_security_level) VALUES
  -- Sprintlify
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000002', 'member'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000003', 'member'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000004', 'member'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000005', 'member'),

  -- Mobile App
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', 'owner'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000004', 'member'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000005', 'member'),

  -- Infrastructure
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000003', 'owner'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000004', 'member');

-- ─── tickets ──────────────────────────────────────────────────────────────────

INSERT INTO tickets (ticket_id, title, description, priority, status, label, assignee_id, reporter_id, project_id) VALUES

  -- Sprintlify tickets
  (
    '00000000-0000-0000-0002-000000000001',
    'Auth tokens expire prematurely on mobile',
    'Users on mobile devices get logged out after 5 minutes despite activity',
    'critical', 'in progress', 'bug',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0001-000000000001'
  ),
  (
    '00000000-0000-0000-0002-000000000002',
    'Add dark mode to settings panel',
    'Users have been requesting dark mode support across the dashboard',
    'medium', 'open', 'feature',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0001-000000000001'
  ),
  (
    '00000000-0000-0000-0002-000000000003',
    'SQL injection vector in search endpoint',
    'Search input is not properly sanitized before being passed to the query',
    'critical', 'open', 'security',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0001-000000000001'
  ),
  (
    '00000000-0000-0000-0002-000000000004',
    'Dashboard load time exceeds 3s on slow networks',
    'Initial load is too slow, need to optimize bundle size and API calls',
    'high', 'open', 'perf',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0001-000000000001'
  ),
  (
    '00000000-0000-0000-0002-000000000005',
    'Document API rate limiting behavior',
    'Rate limiting is not documented anywhere, causing confusion for integrators',
    'low', 'open', 'docs',
    NULL,
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0001-000000000001'
  ),
  (
    '00000000-0000-0000-0002-000000000006',
    'Migrate CI pipeline to new runner',
    'Current runner is deprecated and will be removed next month',
    'high', 'review', 'infra',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0001-000000000001'
  ),

  -- Mobile App tickets
  (
    '00000000-0000-0000-0002-000000000007',
    'Push notifications not working on Android 14',
    'FCM tokens are not being registered correctly on Android 14 devices',
    'high', 'open', 'bug',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0001-000000000002'
  ),
  (
    '00000000-0000-0000-0002-000000000008',
    'Add biometric authentication',
    'Support Face ID and fingerprint login on both iOS and Android',
    'medium', 'open', 'feature',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0001-000000000002'
  ),
  (
    '00000000-0000-0000-0002-000000000009',
    'App crashes on image upload over 5MB',
    'Memory exception thrown when uploading large images from gallery',
    'high', 'in progress', 'bug',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0001-000000000002'
  ),
  (
    '00000000-0000-0000-0002-000000000010',
    'Offline mode support',
    'App should cache data locally and sync when connection is restored',
    'medium', 'open', 'feature',
    NULL,
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0001-000000000002'
  ),

  -- Infrastructure tickets
  (
    '00000000-0000-0000-0002-000000000011',
    'Set up staging environment on Cloudflare',
    'Need a staging environment that mirrors production for testing',
    'high', 'open', 'infra',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0001-000000000003'
  ),
  (
    '00000000-0000-0000-0002-000000000012',
    'Configure automated database backups',
    'Daily backups should be stored in R2 with 30 day retention',
    'high', 'in progress', 'infra',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0001-000000000003'
  ),
  (
    '00000000-0000-0000-0002-000000000013',
    'Add uptime monitoring',
    'Set up alerting for downtime on all production services',
    'medium', 'open', 'infra',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0001-000000000003'
  );

-- ─── ticket comments ──────────────────────────────────────────────────────────

INSERT INTO ticket_comments (ticket_comment_id, ticket_id, user_id, body) VALUES
  (
    '00000000-0000-0000-0003-000000000001',
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'I can reproduce this on both iOS and Android. Looks like the token refresh logic is not triggering correctly in the background.'
  ),
  (
    '00000000-0000-0000-0003-000000000002',
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'Could be related to the recent change in the refresh middleware. I will take a look.'
  ),
  (
    '00000000-0000-0000-0003-000000000003',
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'This is a critical security issue. Assigning to Jordan for immediate fix.'
  ),
  (
    '00000000-0000-0000-0003-000000000004',
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Found the issue. The search param is being interpolated directly into the query string. Will fix with parameterized queries.'
  ),
  (
    '00000000-0000-0000-0003-000000000005',
    '00000000-0000-0000-0002-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'Profiled the app — the main bottleneck is the tickets query on load. It is fetching all tickets without pagination.'
  ),
  (
    '00000000-0000-0000-0003-000000000006',
    '00000000-0000-0000-0002-000000000006',
    '00000000-0000-0000-0000-000000000004',
    'Migration is complete on staging. Running final checks before merging to main.'
  ),
  (
    '00000000-0000-0000-0003-000000000007',
    '00000000-0000-0000-0002-000000000009',
    '00000000-0000-0000-0000-000000000005',
    'The crash happens in the image compression step. Working on a fix to chunk large images before upload.'
  ),
  (
    '00000000-0000-0000-0003-000000000008',
    '00000000-0000-0000-0002-000000000012',
    '00000000-0000-0000-0000-000000000003',
    'Backup job is configured and running. First backup completed successfully at 2am UTC.'
  );

-- ─── ticket history ───────────────────────────────────────────────────────────

INSERT INTO ticket_history (ticket_history_id, ticket_id, changed_by, field, old_value, new_value) VALUES
  (
    '00000000-0000-0000-0004-000000000001',
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'status', 'open', 'in progress'
  ),
  (
    '00000000-0000-0000-0004-000000000002',
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'assigneeId', NULL, '00000000-0000-0000-0000-000000000002'
  ),
  (
    '00000000-0000-0000-0004-000000000003',
    '00000000-0000-0000-0002-000000000006',
    '00000000-0000-0000-0000-000000000003',
    'status', 'open', 'in progress'
  ),
  (
    '00000000-0000-0000-0004-000000000004',
    '00000000-0000-0000-0002-000000000006',
    '00000000-0000-0000-0000-000000000004',
    'status', 'in progress', 'review'
  ),
  (
    '00000000-0000-0000-0004-000000000005',
    '00000000-0000-0000-0002-000000000009',
    '00000000-0000-0000-0000-000000000002',
    'status', 'open', 'in progress'
  ),
  (
    '00000000-0000-0000-0004-000000000006',
    '00000000-0000-0000-0002-000000000012',
    '00000000-0000-0000-0000-000000000003',
    'status', 'open', 'in progress'
  ),
  (
    '00000000-0000-0000-0004-000000000007',
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'priority', 'high', 'critical'
  ),
  (
    '00000000-0000-0000-0004-000000000008',
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'assigneeId', NULL, '00000000-0000-0000-0000-000000000003'
  );

COMMIT;