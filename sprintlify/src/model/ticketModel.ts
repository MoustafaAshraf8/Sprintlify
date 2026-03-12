import { and, eq } from "drizzle-orm";
import { tickets } from "../../drizzle/schema";
import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { CreateTicketDtoType, UpdateTicketDtoType } from "../dto/ticketDto";

// ─── find all by project ──────────────────────────────────────────────────────

export const findTicketsByProjectId = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const { drizzleClient, projectId } = { ...params };

  return await drizzleClient
    .select()
    .from(tickets)
    .where(eq(tickets.projectId, projectId));
};

// ─── find by id ───────────────────────────────────────────────────────────────

export const findTicketById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
  projectId: string;
}) => {
  const { drizzleClient, ticketId, projectId } = { ...params };

  const result = await drizzleClient
    .select()
    .from(tickets)
    .where(
      and(eq(tickets.ticketId, ticketId), eq(tickets.projectId, projectId)),
    )
    .limit(1);

  return result[0] ?? null;
};

// ─── insert ───────────────────────────────────────────────────────────────────

export const insertTicket = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  data: {
    title: string;
    description?: string;
    priority: string;
    label?: string;
    assigneeId?: string;
    reporterId: string;
    projectId: string;
  };
}) => {
  const { drizzleClient, data } = { ...params };

  const result = await drizzleClient.insert(tickets).values(data).returning();

  return result[0];
};

// ─── update ───────────────────────────────────────────────────────────────────

export const updateTicket = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
  data: UpdateTicketDtoType;
}) => {
  const { drizzleClient, ticketId, data } = { ...params };

  const result = await drizzleClient
    .update(tickets)
    .set(data)
    .where(eq(tickets.ticketId, ticketId))
    .returning();

  return result[0] ?? null;
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteTicket = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
}) => {
  const { drizzleClient, ticketId } = { ...params };

  await drizzleClient.delete(tickets).where(eq(tickets.ticketId, ticketId));
};
