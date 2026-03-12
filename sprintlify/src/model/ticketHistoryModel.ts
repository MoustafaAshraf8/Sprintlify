import { eq, desc } from "drizzle-orm";
import { ticketHistory, users } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";

// ─── insert history entries ───────────────────────────────────────────────────

export const insertTicketHistoryEntries = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  entries: {
    ticketId: string;
    changedBy: string;
    field: string;
    oldValue: string | null;
    newValue: string | null;
  }[];
}) => {
  const { drizzleClient, entries } = { ...params };

  if (entries.length === 0) return [];

  return await drizzleClient.insert(ticketHistory).values(entries).returning();
};

// ─── find history by ticket ───────────────────────────────────────────────────

export const findTicketHistory = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
}) => {
  const { drizzleClient, ticketId } = { ...params };

  return await drizzleClient
    .select({
      ticketHistoryId: ticketHistory.ticketHistoryId,
      field: ticketHistory.field,
      oldValue: ticketHistory.oldValue,
      newValue: ticketHistory.newValue,
      changedAt: ticketHistory.changedAt,
      changedBy: {
        userId: users.userId,
        username: users.username,
        avatar: users.avatarUrl,
      },
    })
    .from(ticketHistory)
    .innerJoin(users, eq(ticketHistory.changedBy, users.userId))
    .where(eq(ticketHistory.ticketId, ticketId))
    .orderBy(desc(ticketHistory.changedAt));
};
