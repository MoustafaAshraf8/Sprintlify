import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { findTicketHistory } from "../model/ticketHistoryModel";
import { findTicketById } from "../model/ticketModel";
import { findProjectMember } from "../model/projectMemberModel";

// ─── get history ──────────────────────────────────────────────────────────────

export const getTicketHistory = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  ticketId: string;
  requesterId: string;
}) => {
  const { drizzleClient, supabaseClient, projectId, ticketId, requesterId } = {
    ...params,
  };

  // verify requester is a project member
  const isMember = await findProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: requesterId,
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

  const history = await findTicketHistory({
    drizzleClient,
    supabaseClient,
    ticketId,
  });

  return history;
};

// ─── get state ────────────────────────────────────────────────────────────────

export const getTicketState = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  ticketId: string;
  requesterId: string;
}) => {
  const { drizzleClient, supabaseClient, projectId, ticketId, requesterId } = {
    ...params,
  };

  // verify requester is a project member
  const isMember = await findProjectMember({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: requesterId,
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

  // get only status history entries
  const history = await findTicketHistory({
    drizzleClient,
    supabaseClient,
    ticketId,
  });

  const stateHistory = history.filter((h) => h.field === "status");

  return {
    currentState: ticket.status,
    history: stateHistory,
  };
};
