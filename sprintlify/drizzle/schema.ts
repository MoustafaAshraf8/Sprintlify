import { pgTable, foreignKey, unique, check, uuid, text, integer, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const posts = pgTable("posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: text().notNull(),
	content: text(),
	slug: text().notNull(),
	status: text().default('draft'),
	viewsCount: integer("views_count").default(0),
	likesCount: integer("likes_count").default(0),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "posts_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("posts_slug_key").on(table.slug),
	check("posts_status_check", sql`status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])`),
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
	reporterId: uuid("reporter_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.assigneeId],
			foreignColumns: [users.userId],
			name: "tickets_users_assignee_fk"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.reporterId],
			foreignColumns: [users.userId],
			name: "tickets_users_reporter_fk"
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
			name: "ticket_comments_ticket_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userId],
			name: "ticket_comments_user_id_fkey"
		}).onDelete("cascade"),
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
]);
