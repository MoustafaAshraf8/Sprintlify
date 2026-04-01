import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import {
  CreateTicketDtoType,
  TicketFilterDtoType,
  UpdateTicketDtoType,
} from "../dto/ticketDto";
import {
  findTicketsByProjectId,
  findTicketById,
  insertTicket,
  updateTicket,
  deleteTicket,
} from "../model/ticketModel";
import { findProjectById } from "../model/projectModel";
import { findProjectMember } from "../model/projectMemberModel";
import { cacheKeys } from "../cache/cacheKeys";
import { cacheDel, cacheGet, cacheSet } from "../cache/kvCache";
import { KVNamespace } from "@cloudflare/workers-types";
import { insertTicketHistoryEntries } from "../model/ticketHistoryModel";
import { ForbiddenError } from "../error/AppError";

const verifyProjectExists = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  return await findProjectById({ ...params });
};

const verifyMembership = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  userId: string;
}) => {
  return await findProjectMember({ ...params });
};

export const getTickets = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  userId: string;
  filters: TicketFilterDtoType;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, userId, filters } = {
    ...params,
  };

  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: userId,
  });

  const cacheKey = cacheKeys.project_tickets(projectId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const data = await findTicketsByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
    filters,
  });

  await cacheSet({ kv, key: cacheKey, data });
  return data;
};

export const getTicketById = async (params: {
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

  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId,
  });

  const cacheKey = cacheKeys.ticket(ticketId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const ticket = await findTicketById({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });

  await cacheSet({ kv, key: cacheKey, data: ticket });

  return ticket;
};

export const createTicket = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  userId: string;
  data: CreateTicketDtoType;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, userId, data } = {
    ...params,
  };

  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId,
  });

  const ticket = await insertTicket({
    drizzleClient,
    supabaseClient,
    data: { ...data, userId: userId, projectId },
  });

  await cacheDel({ kv, key: cacheKeys.project_tickets(projectId) });
  await cacheSet({ kv, key: cacheKeys.ticket(ticket.ticketId), data: ticket });

  return ticket;
};

export const updateTicketById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  ticketId: string;
  userId: string;
  data: UpdateTicketDtoType;
}) => {
  const {
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    ticketId,
    userId,
    data,
  } = { ...params };

  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: userId,
  });

  const ticket = await findTicketById({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });

  // only assignee, reporter or owner can update
  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  const canUpdate =
    ticket.userId === userId ||
    ticket.assigneeId === userId ||
    project!.ownerId === userId;

  if (!canUpdate) throw new ForbiddenError();

  const TRACKED_FIELDS = [
    "status",
    "priority",
    "label",
    "assigneeId",
    "title",
    "description",
  ];
  const entries = TRACKED_FIELDS.filter(
    (field: string) =>
      Object(data)[field] !== undefined &&
      Object(data)[field] !== Object(ticket)[field],
  ).map((field) => ({
    ticketId,
    changedBy: userId,
    field,
    oldValue:
      Object(ticket)[field] != null ? String(Object(ticket)[field]) : null,
    newValue: Object(data)[field] != null ? String(Object(data)[field]) : null,
  }));

  const updatedTicket = await updateTicket({
    drizzleClient,
    supabaseClient,
    ticketId,
    data,
  });

  await insertTicketHistoryEntries({ drizzleClient, supabaseClient, entries });
  cacheDel({ kv, key: cacheKeys.ticket_state(ticketId) });
  cacheDel({ kv, key: cacheKeys.project_tickets(projectId) });
  cacheSet({ kv, key: cacheKeys.ticket(ticketId), data: updatedTicket });
  cacheSet({ kv, key: cacheKeys.ticket_history(ticketId), data: entries });

  return;
};

export const deleteTicketById = async (params: {
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

  const ticket = await findTicketById({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });

  // only reporter or project owner can delete
  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  const canDelete = ticket.userId === userId || project!.ownerId === userId;

  if (!canDelete) throw new ForbiddenError();

  await cacheDel({ kv, key: cacheKeys.ticket(ticketId) });
  await cacheDel({ kv, key: cacheKeys.ticket_history(ticketId) });
  await cacheDel({ kv, key: cacheKeys.ticket_state(ticketId) });
  await cacheDel({ kv, key: cacheKeys.project_tickets(projectId) });
  await cacheDel({ kv, key: cacheKeys.ticket_comments(ticketId) });

  await deleteTicket({
    drizzleClient,
    supabaseClient,
    ticketId,
  });

  const updatedTickets = await findTicketsByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
    filters: { sortBy: "createdAt", sortOrder: "desc", page: 1, limit: 10 },
  });

  await cacheSet({
    kv,
    key: cacheKeys.project_tickets(projectId),
    data: updatedTickets,
  });
  return;
};
