import { pgTable, index, foreignKey, unique, uuid, text, timestamp, uniqueIndex, check, date, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const refreshTokens = pgTable("refresh_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_refresh_tokens_token").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("idx_refresh_tokens_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "refresh_tokens_user_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("refresh_tokens_unique_token_key").on(table.token),
]);

export const projects = pgTable("projects", {
	projectId: uuid("project_id").defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	ownerId: uuid("owner_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index().using("btree", table.ownerId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.userId],
			name: "projects_owner_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const ticketHistory = pgTable("ticket_history", {
	ticketHistoryId: uuid("ticket_history_id").defaultRandom().primaryKey().notNull(),
	ticketId: uuid("ticket_id").notNull(),
	changedBy: uuid("changed_by").notNull(),
	field: text().notNull(),
	oldValue: text("old_value"),
	newValue: text("new_value"),
	changedAt: timestamp("changed_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_ticket_history_changed_by").using("btree", table.changedBy.asc().nullsLast().op("uuid_ops")),
	index("idx_ticket_history_ticket_id").using("btree", table.ticketId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ticketId],
			foreignColumns: [tickets.ticketId],
			name: "ticket_history_ticket_history_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.userId],
			name: "ticket_history_changed_by_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const sprints = pgTable("sprints", {
	sprintId: uuid("sprint_id").defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	sprintName: text("sprint_name").notNull(),
	goal: text(),
	status: text().default('planned').notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_sprints_one_active_per_project").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")).where(sql`(status = 'active'::text)`),
	index("idx_sprints_project_id").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	index("idx_sprints_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.projectId],
			name: "sprints_project_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.userId],
			name: "sprints_created_by_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	check("sprints_status_check", sql`status = ANY (ARRAY['planned'::text, 'active'::text, 'completed'::text])`),
	check("sprints_date_check", sql`end_date > start_date`),
	check("sprints_duration_check", sql`((end_date - start_date) >= 1) AND ((end_date - start_date) <= 30)`),
]);

export const users = pgTable("users", {
	email: text().notNull(),
	username: text().notNull(),
	avatarUrl: text("avatar_url"),
	bio: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	nickname: text(),
	passwordHash: text("password_hash").notNull(),
	securityLevel: text("security_level").default('member'),
	userId: uuid("user_id").defaultRandom().primaryKey().notNull(),
}, (table) => [
	unique("users_email_key").on(table.email),
	unique("users_username_key").on(table.username),
	check("users_security_level_check", sql`security_level = ANY (ARRAY['admin'::text, 'member'::text])`),
]);

export const tickets = pgTable("tickets", {
	ticketId: uuid("ticket_id").defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	priority: text().default('medium'),
	status: text().default('open'),
	label: text(),
	assigneeId: uuid("assignee_id"),
	userId: uuid("user_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	projectId: uuid("project_id"),
	sprintId: uuid("sprint_id"),
}, (table) => [
	index("idx_tickets_project").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	index("idx_tickets_sprint_id").using("btree", table.sprintId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.assigneeId],
			foreignColumns: [users.userId],
			name: "tickets_users_assignee_fk"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "tickets_users_reporter_fk"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.projectId],
			name: "tickets_project_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.sprintId],
			foreignColumns: [sprints.sprintId],
			name: "tickets_sprint_id_fk"
		}).onUpdate("cascade").onDelete("set null"),
	check("tickets_priority_check", sql`priority = ANY (ARRAY['critical'::text, 'high'::text, 'medium'::text, 'low'::text])`),
	check("tickets_status_check", sql`status = ANY (ARRAY['open'::text, 'in progress'::text, 'review'::text, 'closed'::text])`),
	check("tickets_label_check", sql`label = ANY (ARRAY['bug'::text, 'feature'::text, 'infra'::text, 'docs'::text, 'security'::text, 'perf'::text])`),
]);

export const ticketComments = pgTable("ticket_comments", {
	ticketCommentId: uuid("ticket_comment_id").defaultRandom().primaryKey().notNull(),
	ticketId: uuid("ticket_id").notNull(),
	userId: uuid("user_id").notNull(),
	body: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.ticketId],
			foreignColumns: [tickets.ticketId],
			name: "ticket_comments_ticket_id_fk"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "ticket_comments_user_id_fk"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.ticketId],
			foreignColumns: [tickets.ticketId],
			name: "ticket_comments_ticket_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "ticket_comments_user_id_fkey"
		}).onDelete("cascade"),
]);

export const projectMembers = pgTable("project_members", {
	projectId: uuid("project_id").notNull(),
	userId: uuid("user_id").notNull(),
	projectSecurityLevel: text("project_security_level").default('member'),
	joinedAt: timestamp("joined_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_project_members_project").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
	index("idx_project_members_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.projectId],
			name: "project_members_project_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "project_members_user_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	primaryKey({ columns: [table.projectId, table.userId], name: "project_members_pk"}),
	check("project_members_project_security_level_check", sql`project_security_level = ANY (ARRAY['owner'::text, 'member'::text])`),
]);
