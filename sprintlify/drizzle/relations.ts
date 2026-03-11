import { relations } from "drizzle-orm/relations";
import { users, refreshTokens, posts, tickets, ticketComments } from "./schema";

export const refreshTokensRelations = relations(refreshTokens, ({one}) => ({
	user: one(users, {
		fields: [refreshTokens.userId],
		references: [users.userId]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	refreshTokens: many(refreshTokens),
	posts: many(posts),
	tickets_assigneeId: many(tickets, {
		relationName: "tickets_assigneeId_users_userId"
	}),
	tickets_reporterId: many(tickets, {
		relationName: "tickets_reporterId_users_userId"
	}),
	ticketComments_userId: many(ticketComments, {
		relationName: "ticketComments_userId_users_userId"
	}),
	ticketComments_userId: many(ticketComments, {
		relationName: "ticketComments_userId_users_userId"
	}),
}));

export const postsRelations = relations(posts, ({one}) => ({
	user: one(users, {
		fields: [posts.userId],
		references: [users.userId]
	}),
}));

export const ticketsRelations = relations(tickets, ({one, many}) => ({
	user_assigneeId: one(users, {
		fields: [tickets.assigneeId],
		references: [users.userId],
		relationName: "tickets_assigneeId_users_userId"
	}),
	user_reporterId: one(users, {
		fields: [tickets.reporterId],
		references: [users.userId],
		relationName: "tickets_reporterId_users_userId"
	}),
	ticketComments_ticketId: many(ticketComments, {
		relationName: "ticketComments_ticketId_tickets_ticketId"
	}),
	ticketComments_ticketId: many(ticketComments, {
		relationName: "ticketComments_ticketId_tickets_ticketId"
	}),
}));

export const ticketCommentsRelations = relations(ticketComments, ({one}) => ({
	ticket_ticketId: one(tickets, {
		fields: [ticketComments.ticketId],
		references: [tickets.ticketId],
		relationName: "ticketComments_ticketId_tickets_ticketId"
	}),
	user_userId: one(users, {
		fields: [ticketComments.userId],
		references: [users.userId],
		relationName: "ticketComments_userId_users_userId"
	}),
	ticket_ticketId: one(tickets, {
		fields: [ticketComments.ticketId],
		references: [tickets.ticketId],
		relationName: "ticketComments_ticketId_tickets_ticketId"
	}),
	user_userId: one(users, {
		fields: [ticketComments.userId],
		references: [users.userId],
		relationName: "ticketComments_userId_users_userId"
	}),
}));