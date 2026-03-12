import { and, eq, desc } from "drizzle-orm";
import { ticketComments } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";

export const findTicketCommentsByTicketId = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
}) => {
  const { drizzleClient, ticketId } = { ...params };

  return await drizzleClient
    .select()
    .from(ticketComments)
    .where(eq(ticketComments.ticketId, ticketId))
    .orderBy(desc(ticketComments.createdAt));
};

export const findTicketCommentById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  commentId: string;
  ticketId: string;
}) => {
  const { drizzleClient, commentId, ticketId } = { ...params };

  const result = await drizzleClient
    .select()
    .from(ticketComments)
    .where(
      and(
        eq(ticketComments.ticketCommentId, commentId),
        eq(ticketComments.ticketId, ticketId),
      ),
    )
    .limit(1);

  return result[0] ?? null;
};

export const insertTicketComment = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  data: {
    body: string;
    ticketId: string;
    userId: string;
  };
}) => {
  const { drizzleClient, data } = { ...params };

  const result = await drizzleClient
    .insert(ticketComments)
    .values(data)
    .returning();

  return result[0];
};

export const deleteTicketComment = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  commentId: string;
}) => {
  const { drizzleClient, commentId } = { ...params };

  await drizzleClient
    .delete(ticketComments)
    .where(eq(ticketComments.ticketCommentId, commentId));
};
