import { pgTable, unique, uuid, text, boolean, timestamp, foreignKey, check, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	username: text().notNull(),
	fullName: text("full_name"),
	avatarUrl: text("avatar_url"),
	bio: text(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	nickname: text(),
}, (table) => [
	unique("users_email_key").on(table.email),
	unique("users_username_key").on(table.username),
]);

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
			foreignColumns: [users.id],
			name: "posts_user_id_fkey"
		}).onDelete("cascade"),
	unique("posts_slug_key").on(table.slug),
	check("posts_status_check", sql`status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])`),
]);
