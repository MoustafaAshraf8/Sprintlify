import sys
import bcrypt
import psycopg2
from psycopg2.extras import execute_values

# ─── config ───────────────────────────────────────────────────────────────────

DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# ─── helpers ──────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")

# ─── seed data ────────────────────────────────────────────────────────────────

USERS = [
    {
        "user_id":        "00000000-0000-0000-0000-000000000001",
        "email":          "admin@sprintlify.com",
        "username":       "admin",
        "nickname":       "The Boss",
        "bio":            "Platform administrator",
        "security_level": "admin",
        "password":       "Admin123!",
    },
    {
        "user_id":        "00000000-0000-0000-0000-000000000002",
        "email":          "alex@sprintlify.com",
        "username":       "alex_dev",
        "nickname":       "Alex",
        "bio":            "Frontend developer who loves React",
        "security_level": "member",
        "password":       "Member123!",
    },
    {
        "user_id":        "00000000-0000-0000-0000-000000000003",
        "email":          "jordan@sprintlify.com",
        "username":       "jordan_dev",
        "nickname":       "Jordan",
        "bio":            "Backend developer, Postgres enthusiast",
        "security_level": "member",
        "password":       "Member123!",
    },
    {
        "user_id":        "00000000-0000-0000-0000-000000000004",
        "email":          "sam@sprintlify.com",
        "username":       "sam_dev",
        "nickname":       "Sam",
        "bio":            "Full stack developer and DevOps",
        "security_level": "member",
        "password":       "Member123!",
    },
    {
        "user_id":        "00000000-0000-0000-0000-000000000005",
        "email":          "riley@sprintlify.com",
        "username":       "riley_dev",
        "nickname":       "Riley",
        "bio":            "Mobile developer, Flutter expert",
        "security_level": "member",
        "password":       "Member123!",
    },
]

PROJECTS = [
    {
        "project_id":  "00000000-0000-0000-0001-000000000001",
        "name":        "Sprintlify",
        "description": "Internal ticket management platform",
        "owner_id":    "00000000-0000-0000-0000-000000000001",
    },
    {
        "project_id":  "00000000-0000-0000-0001-000000000002",
        "name":        "Mobile App",
        "description": "Flutter mobile application",
        "owner_id":    "00000000-0000-0000-0000-000000000002",
    },
    {
        "project_id":  "00000000-0000-0000-0001-000000000003",
        "name":        "Infrastructure",
        "description": "DevOps and cloud infrastructure",
        "owner_id":    "00000000-0000-0000-0000-000000000003",
    },
]

PROJECT_MEMBERS = [
    # Sprintlify
    ("00000000-0000-0000-0001-000000000001", "00000000-0000-0000-0000-000000000001", "owner"),
    ("00000000-0000-0000-0001-000000000001", "00000000-0000-0000-0000-000000000002", "member"),
    ("00000000-0000-0000-0001-000000000001", "00000000-0000-0000-0000-000000000003", "member"),
    ("00000000-0000-0000-0001-000000000001", "00000000-0000-0000-0000-000000000004", "member"),
    ("00000000-0000-0000-0001-000000000001", "00000000-0000-0000-0000-000000000005", "member"),
    # Mobile App
    ("00000000-0000-0000-0001-000000000002", "00000000-0000-0000-0000-000000000002", "owner"),
    ("00000000-0000-0000-0001-000000000002", "00000000-0000-0000-0000-000000000004", "member"),
    ("00000000-0000-0000-0001-000000000002", "00000000-0000-0000-0000-000000000005", "member"),
    # Infrastructure
    ("00000000-0000-0000-0001-000000000003", "00000000-0000-0000-0000-000000000003", "owner"),
    ("00000000-0000-0000-0001-000000000003", "00000000-0000-0000-0000-000000000004", "member"),
]

SPRINTS = [
    # ── Sprintlify ────────────────────────────────────────────────────────────
    {
        "sprint_id":   "00000000-0000-0000-0005-000000000001",
        "project_id":  "00000000-0000-0000-0001-000000000001",
        "sprint_name": "Sprint 1",
        "goal":        "Fix all critical bugs and set up CI pipeline",
        "status":      "completed",
        "start_date":  "2026-01-01",
        "end_date":    "2026-01-14",
        "created_by":  "00000000-0000-0000-0000-000000000001",
    },
    {
        "sprint_id":   "00000000-0000-0000-0005-000000000002",
        "project_id":  "00000000-0000-0000-0001-000000000001",
        "sprint_name": "Sprint 2",
        "goal":        "Performance improvements and security fixes",
        "status":      "active",
        "start_date":  "2026-03-01",
        "end_date":    "2026-03-14",
        "created_by":  "00000000-0000-0000-0000-000000000001",
    },
    {
        "sprint_id":   "00000000-0000-0000-0005-000000000003",
        "project_id":  "00000000-0000-0000-0001-000000000001",
        "sprint_name": "Sprint 3",
        "goal":        "Dark mode and documentation",
        "status":      "planned",
        "start_date":  "2026-03-15",
        "end_date":    "2026-03-28",
        "created_by":  "00000000-0000-0000-0000-000000000001",
    },
    # ── Mobile App ────────────────────────────────────────────────────────────
    {
        "sprint_id":   "00000000-0000-0000-0005-000000000004",
        "project_id":  "00000000-0000-0000-0001-000000000002",
        "sprint_name": "Sprint 1",
        "goal":        "Fix Android bugs and add biometric auth",
        "status":      "active",
        "start_date":  "2026-03-01",
        "end_date":    "2026-03-14",
        "created_by":  "00000000-0000-0000-0000-000000000002",
    },
    {
        "sprint_id":   "00000000-0000-0000-0005-000000000005",
        "project_id":  "00000000-0000-0000-0001-000000000002",
        "sprint_name": "Sprint 2",
        "goal":        "Offline mode support",
        "status":      "planned",
        "start_date":  "2026-03-15",
        "end_date":    "2026-03-28",
        "created_by":  "00000000-0000-0000-0000-000000000002",
    },
    # ── Infrastructure ────────────────────────────────────────────────────────
    {
        "sprint_id":   "00000000-0000-0000-0005-000000000006",
        "project_id":  "00000000-0000-0000-0001-000000000003",
        "sprint_name": "Sprint 1",
        "goal":        "Set up staging environment and automated backups",
        "status":      "active",
        "start_date":  "2026-03-01",
        "end_date":    "2026-03-14",
        "created_by":  "00000000-0000-0000-0000-000000000003",
    },
]

TICKETS = [
    # ── Sprintlify ────────────────────────────────────────────────────────────
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000001",
        "title":       "Auth tokens expire prematurely on mobile",
        "description": "Users on mobile devices get logged out after 5 minutes despite activity",
        "priority":    "critical",
        "status":      "in progress",
        "label":       "bug",
        "assignee_id": "00000000-0000-0000-0000-000000000002",
        "reporter_id": "00000000-0000-0000-0000-000000000001",
        "project_id":  "00000000-0000-0000-0001-000000000001",
        "sprint_id":   "00000000-0000-0000-0005-000000000002",
    },
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000002",
        "title":       "Add dark mode to settings panel",
        "description": "Users have been requesting dark mode support across the dashboard",
        "priority":    "medium",
        "status":      "open",
        "label":       "feature",
        "assignee_id": "00000000-0000-0000-0000-000000000002",
        "reporter_id": "00000000-0000-0000-0000-000000000003",
        "project_id":  "00000000-0000-0000-0001-000000000001",
        "sprint_id":   "00000000-0000-0000-0005-000000000003",
    },
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000003",
        "title":       "SQL injection vector in search endpoint",
        "description": "Search input is not properly sanitized before being passed to the query",
        "priority":    "critical",
        "status":      "open",
        "label":       "security",
        "assignee_id": "00000000-0000-0000-0000-000000000003",
        "reporter_id": "00000000-0000-0000-0000-000000000001",
        "project_id":  "00000000-0000-0000-0001-000000000001",
        "sprint_id":   "00000000-0000-0000-0005-000000000002",
    },
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000004",
        "title":       "Dashboard load time exceeds 3s on slow networks",
        "description": "Initial load is too slow, need to optimize bundle size and API calls",
        "priority":    "high",
        "status":      "open",
        "label":       "perf",
        "assignee_id": "00000000-0000-0000-0000-000000000004",
        "reporter_id": "00000000-0000-0000-0000-000000000002",
        "project_id":  "00000000-0000-0000-0001-000000000001",
        "sprint_id":   "00000000-0000-0000-0005-000000000002",
    },
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000005",
        "title":       "Document API rate limiting behavior",
        "description": "Rate limiting is not documented anywhere, causing confusion for integrators",
        "priority":    "low",
        "status":      "open",
        "label":       "docs",
        "assignee_id": None,
        "reporter_id": "00000000-0000-0000-0000-000000000001",
        "project_id":  "00000000-0000-0000-0001-000000000001",
        "sprint_id":   "00000000-0000-0000-0005-000000000003",
    },
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000006",
        "title":       "Migrate CI pipeline to new runner",
        "description": "Current runner is deprecated and will be removed next month",
        "priority":    "high",
        "status":      "closed",
        "label":       "infra",
        "assignee_id": "00000000-0000-0000-0000-000000000004",
        "reporter_id": "00000000-0000-0000-0000-000000000003",
        "project_id":  "00000000-0000-0000-0001-000000000001",
        "sprint_id":   "00000000-0000-0000-0005-000000000001",
    },
    # ── Mobile App ────────────────────────────────────────────────────────────
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000007",
        "title":       "Push notifications not working on Android 14",
        "description": "FCM tokens are not being registered correctly on Android 14 devices",
        "priority":    "high",
        "status":      "open",
        "label":       "bug",
        "assignee_id": "00000000-0000-0000-0000-000000000005",
        "reporter_id": "00000000-0000-0000-0000-000000000002",
        "project_id":  "00000000-0000-0000-0001-000000000002",
        "sprint_id":   "00000000-0000-0000-0005-000000000004",
    },
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000008",
        "title":       "Add biometric authentication",
        "description": "Support Face ID and fingerprint login on both iOS and Android",
        "priority":    "medium",
        "status":      "open",
        "label":       "feature",
        "assignee_id": "00000000-0000-0000-0000-000000000005",
        "reporter_id": "00000000-0000-0000-0000-000000000002",
        "project_id":  "00000000-0000-0000-0001-000000000002",
        "sprint_id":   "00000000-0000-0000-0005-000000000004",
    },
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000009",
        "title":       "App crashes on image upload over 5MB",
        "description": "Memory exception thrown when uploading large images from gallery",
        "priority":    "high",
        "status":      "in progress",
        "label":       "bug",
        "assignee_id": "00000000-0000-0000-0000-000000000004",
        "reporter_id": "00000000-0000-0000-0000-000000000005",
        "project_id":  "00000000-0000-0000-0001-000000000002",
        "sprint_id":   "00000000-0000-0000-0005-000000000004",
    },
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000010",
        "title":       "Offline mode support",
        "description": "App should cache data locally and sync when connection is restored",
        "priority":    "medium",
        "status":      "open",
        "label":       "feature",
        "assignee_id": None,
        "reporter_id": "00000000-0000-0000-0000-000000000002",
        "project_id":  "00000000-0000-0000-0001-000000000002",
        "sprint_id":   "00000000-0000-0000-0005-000000000005",
    },
    # ── Infrastructure ────────────────────────────────────────────────────────
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000011",
        "title":       "Set up staging environment on Cloudflare",
        "description": "Need a staging environment that mirrors production for testing",
        "priority":    "high",
        "status":      "open",
        "label":       "infra",
        "assignee_id": "00000000-0000-0000-0000-000000000004",
        "reporter_id": "00000000-0000-0000-0000-000000000003",
        "project_id":  "00000000-0000-0000-0001-000000000003",
        "sprint_id":   "00000000-0000-0000-0005-000000000006",
    },
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000012",
        "title":       "Configure automated database backups",
        "description": "Daily backups should be stored in R2 with 30 day retention",
        "priority":    "high",
        "status":      "in progress",
        "label":       "infra",
        "assignee_id": "00000000-0000-0000-0000-000000000003",
        "reporter_id": "00000000-0000-0000-0000-000000000003",
        "project_id":  "00000000-0000-0000-0001-000000000003",
        "sprint_id":   "00000000-0000-0000-0005-000000000006",
    },
    {
        "ticket_id":   "00000000-0000-0000-0002-000000000013",
        "title":       "Add uptime monitoring",
        "description": "Set up alerting for downtime on all production services",
        "priority":    "medium",
        "status":      "open",
        "label":       "infra",
        "assignee_id": "00000000-0000-0000-0000-000000000004",
        "reporter_id": "00000000-0000-0000-0000-000000000003",
        "project_id":  "00000000-0000-0000-0001-000000000003",
        "sprint_id":   None,  # backlog
    },
]

TICKET_COMMENTS = [
    (
        "00000000-0000-0000-0003-000000000001",
        "00000000-0000-0000-0002-000000000001",
        "00000000-0000-0000-0000-000000000002",
        "I can reproduce this on both iOS and Android. Looks like the token refresh logic is not triggering correctly in the background.",
    ),
    (
        "00000000-0000-0000-0003-000000000002",
        "00000000-0000-0000-0002-000000000001",
        "00000000-0000-0000-0000-000000000003",
        "Could be related to the recent change in the refresh middleware. I will take a look.",
    ),
    (
        "00000000-0000-0000-0003-000000000003",
        "00000000-0000-0000-0002-000000000003",
        "00000000-0000-0000-0000-000000000001",
        "This is a critical security issue. Assigning to Jordan for immediate fix.",
    ),
    (
        "00000000-0000-0000-0003-000000000004",
        "00000000-0000-0000-0002-000000000003",
        "00000000-0000-0000-0000-000000000003",
        "Found the issue. The search param is being interpolated directly into the query string. Will fix with parameterized queries.",
    ),
    (
        "00000000-0000-0000-0003-000000000005",
        "00000000-0000-0000-0002-000000000004",
        "00000000-0000-0000-0000-000000000002",
        "Profiled the app — the main bottleneck is the tickets query on load. It is fetching all tickets without pagination.",
    ),
    (
        "00000000-0000-0000-0003-000000000006",
        "00000000-0000-0000-0002-000000000006",
        "00000000-0000-0000-0000-000000000004",
        "Migration is complete on staging. Running final checks before merging to main.",
    ),
    (
        "00000000-0000-0000-0003-000000000007",
        "00000000-0000-0000-0002-000000000009",
        "00000000-0000-0000-0000-000000000005",
        "The crash happens in the image compression step. Working on a fix to chunk large images before upload.",
    ),
    (
        "00000000-0000-0000-0003-000000000008",
        "00000000-0000-0000-0002-000000000012",
        "00000000-0000-0000-0000-000000000003",
        "Backup job is configured and running. First backup completed successfully at 2am UTC.",
    ),
]

TICKET_HISTORY = [
    ("00000000-0000-0000-0004-000000000001", "00000000-0000-0000-0002-000000000001", "00000000-0000-0000-0000-000000000001", "status",     "open",        "in progress"),
    ("00000000-0000-0000-0004-000000000002", "00000000-0000-0000-0002-000000000001", "00000000-0000-0000-0000-000000000001", "assigneeId",  None,          "00000000-0000-0000-0000-000000000002"),
    ("00000000-0000-0000-0004-000000000003", "00000000-0000-0000-0002-000000000006", "00000000-0000-0000-0000-000000000003", "status",      "open",        "in progress"),
    ("00000000-0000-0000-0004-000000000004", "00000000-0000-0000-0002-000000000006", "00000000-0000-0000-0000-000000000004", "status",      "in progress", "review"),
    ("00000000-0000-0000-0004-000000000005", "00000000-0000-0000-0002-000000000006", "00000000-0000-0000-0000-000000000004", "status",      "review",      "closed"),
    ("00000000-0000-0000-0004-000000000006", "00000000-0000-0000-0002-000000000009", "00000000-0000-0000-0000-000000000002", "status",      "open",        "in progress"),
    ("00000000-0000-0000-0004-000000000007", "00000000-0000-0000-0002-000000000012", "00000000-0000-0000-0000-000000000003", "status",      "open",        "in progress"),
    ("00000000-0000-0000-0004-000000000008", "00000000-0000-0000-0002-000000000003", "00000000-0000-0000-0000-000000000001", "priority",    "high",        "critical"),
    ("00000000-0000-0000-0004-000000000009", "00000000-0000-0000-0002-000000000003", "00000000-0000-0000-0000-000000000001", "assigneeId",  None,          "00000000-0000-0000-0000-000000000003"),
]

# ─── seed functions ───────────────────────────────────────────────────────────

def seed_users(cur):
    print("  seeding users...")
    for user in USERS:
        password_hash = hash_password(user["password"])
        cur.execute(
            """
            INSERT INTO users (user_id, email, username, nickname, bio, security_level, password_hash)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (user_id) DO NOTHING
            """,
            (
                user["user_id"],
                user["email"],
                user["username"],
                user["nickname"],
                user["bio"],
                user["security_level"],
                password_hash,
            ),
        )
    print(f"  ✓ {len(USERS)} users seeded")


def seed_projects(cur):
    print("  seeding projects...")
    for project in PROJECTS:
        cur.execute(
            """
            INSERT INTO projects (project_id, name, description, owner_id)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (project_id) DO NOTHING
            """,
            (
                project["project_id"],
                project["name"],
                project["description"],
                project["owner_id"],
            ),
        )
    print(f"  ✓ {len(PROJECTS)} projects seeded")


def seed_project_members(cur):
    print("  seeding project members...")
    execute_values(
        cur,
        """
        INSERT INTO project_members (project_id, user_id, project_security_level)
        VALUES %s
        ON CONFLICT (project_id, user_id) DO NOTHING
        """,
        PROJECT_MEMBERS,
    )
    print(f"  ✓ {len(PROJECT_MEMBERS)} project members seeded")


def seed_sprints(cur):
    print("  seeding sprints...")
    for sprint in SPRINTS:
        cur.execute(
            """
            INSERT INTO sprints (sprint_id, project_id, sprint_name, goal, status, start_date, end_date, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (sprint_id) DO NOTHING
            """,
            (
                sprint["sprint_id"],
                sprint["project_id"],
                sprint["sprint_name"],
                sprint["goal"],
                sprint["status"],
                sprint["start_date"],
                sprint["end_date"],
                sprint["created_by"],
            ),
        )
    print(f"  ✓ {len(SPRINTS)} sprints seeded")


def seed_tickets(cur):
    print("  seeding tickets...")
    for ticket in TICKETS:
        cur.execute(
            """
            INSERT INTO tickets (ticket_id, title, description, priority, status, label, assignee_id, reporter_id, project_id, sprint_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (ticket_id) DO NOTHING
            """,
            (
                ticket["ticket_id"],
                ticket["title"],
                ticket["description"],
                ticket["priority"],
                ticket["status"],
                ticket["label"],
                ticket["assignee_id"],
                ticket["reporter_id"],
                ticket["project_id"],
                ticket["sprint_id"],
            ),
        )
    print(f"  ✓ {len(TICKETS)} tickets seeded")


def seed_comments(cur):
    print("  seeding ticket comments...")
    execute_values(
        cur,
        """
        INSERT INTO ticket_comments (ticket_comment_id, ticket_id, user_id, body)
        VALUES %s
        ON CONFLICT (ticket_comment_id) DO NOTHING
        """,
        TICKET_COMMENTS,
    )
    print(f"  ✓ {len(TICKET_COMMENTS)} ticket comments seeded")


def seed_ticket_history(cur):
    print("  seeding ticket history...")
    execute_values(
        cur,
        """
        INSERT INTO ticket_history (ticket_history_id, ticket_id, changed_by, field, old_value, new_value)
        VALUES %s
        ON CONFLICT (ticket_history_id) DO NOTHING
        """,
        TICKET_HISTORY,
    )
    print(f"  ✓ {len(TICKET_HISTORY)} history entries seeded")


# ─── main ─────────────────────────────────────────────────────────────────────

def main():
    print("\n🌱 Sprintlify seed starting...\n")

    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        cur = conn.cursor()

        seed_users(cur)
        seed_projects(cur)
        seed_project_members(cur)
        seed_sprints(cur)         # ← must run before tickets
        seed_tickets(cur)
        seed_comments(cur)
        seed_ticket_history(cur)

        conn.commit()
        print("\n✅ Seed complete!\n")

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Seed failed: {e}\n")
        sys.exit(1)

    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    main()