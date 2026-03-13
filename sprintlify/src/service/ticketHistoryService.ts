import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { findTicketHistory } from "../model/ticketHistoryModel";
import { findTicketById } from "../model/ticketModel";
import { findProjectMember } from "../model/projectMemberModel";
import { cacheKeys } from "../cache/cacheKeys";
import { cacheDel, cacheGet, cacheSet } from "../cache/kvCache";
import { KVNamespace } from "@cloudflare/workers-types";

// ─── get history ──────────────────────────────────────────────────────────────

export const getTicketHistory = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  ticketId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, ticketId, userId } = {
    ...params,
  };

  // verify requester is a project member
  const isMember = await findProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: userId,
  });
  if (!isMember) throw new Error("Forbidden");

  // verify ticket exists in this project
  const ticket = await findTicketById({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });
  if (!ticket) throw new Error("Ticket not found");

  const cacheKey = cacheKeys.ticket_history(ticketId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const history = await findTicketHistory({
    drizzleClient,
    supabaseClient,
    ticketId,
  });

  await cacheSet({ kv, key: cacheKey, data: history });

  return history;
};

// ─── get state ────────────────────────────────────────────────────────────────

export const getTicketState = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  ticketId: string;
  userId: string;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, ticketId, userId } = {
    ...params,
  };

  // verify requester is a project member
  const isMember = await findProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: userId,
  });
  if (!isMember) throw new Error("Forbidden");

  // verify ticket exists in this project
  const ticket = await findTicketById({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });
  if (!ticket) throw new Error("Ticket not found");

  const cacheKey = cacheKeys.ticket_state(ticketId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  // get only status history entries
  const history = await findTicketHistory({
    drizzleClient,
    supabaseClient,
    ticketId,
  });

  const stateHistory = history.filter((h) => h.field === "status");

  const data = { currentState: ticket.status, history: stateHistory };

  await cacheSet({ kv, key: cacheKey, data: data });

  return data;
};
