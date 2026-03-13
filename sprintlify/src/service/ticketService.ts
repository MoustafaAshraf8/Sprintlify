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

// ─── verify helpers ───────────────────────────────────────────────────────────

const verifyProjectExists = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
}) => {
  const project = await findProjectById({ ...params });
  if (!project) throw new Error("Project not found");
  return project;
};

const verifyMembership = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  userId: string;
}) => {
  const member = await findProjectMember({ ...params });
  if (!member) throw new Error("Forbidden");
  return member;
};

// ─── get all ──────────────────────────────────────────────────────────────────

export const getTickets = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  requesterId: string;
  filters: TicketFilterDtoType;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, requesterId, filters } =
    {
      ...params,
    };

  await verifyProjectExists({ drizzleClient, supabaseClient, projectId });
  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: requesterId,
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
};

// ─── get by id ────────────────────────────────────────────────────────────────

export const getTicketById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  ticketId: string;
  requesterId: string;
}) => {
  const {
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    ticketId,
    requesterId,
  } = {
    ...params,
  };

  await verifyProjectExists({ drizzleClient, supabaseClient, projectId });
  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: requesterId,
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
  if (!ticket) throw new Error("Ticket not found");

  await cacheSet({ kv, key: cacheKey, data: ticket });

  return ticket;
};

// ─── create ───────────────────────────────────────────────────────────────────

export const createTicket = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  requesterId: string;
  data: CreateTicketDtoType;
}) => {
  const { drizzleClient, supabaseClient, kv, projectId, requesterId, data } = {
    ...params,
  };

  await verifyProjectExists({ drizzleClient, supabaseClient, projectId });
  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: requesterId,
  });

  // verify assignee is a member if provided
  if (data.assigneeId) {
    const assigneeMember = await findProjectMember({
      drizzleClient,
      supabaseClient,
      projectId,
      userId: data.assigneeId,
    });
    if (!assigneeMember) throw new Error("Assignee is not a project member");
  }

  const ticket = await insertTicket({
    drizzleClient,
    supabaseClient,
    data: { ...data, reporterId: requesterId, projectId },
  });

  // invalidation: purge + tag-based
  await cacheDel({ kv, key: cacheKeys.project_tickets(projectId) });
  await cacheSet({ kv, key: cacheKeys.ticket(ticket.ticketId), data: ticket });

  return ticket;
};

// ─── update ───────────────────────────────────────────────────────────────────

export const updateTicketById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  ticketId: string;
  requesterId: string;
  data: UpdateTicketDtoType;
}) => {
  const {
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    ticketId,
    requesterId,
    data,
  } = { ...params };

  await verifyProjectExists({ drizzleClient, supabaseClient, projectId });
  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: requesterId,
  });

  const ticket = await findTicketById({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });
  if (!ticket) throw new Error("Ticket not found");

  // only assignee, reporter or owner can update
  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  const canUpdate =
    ticket.reporterId === requesterId ||
    ticket.assigneeId === requesterId ||
    project!.ownerId === requesterId;

  if (!canUpdate) throw new Error("Forbidden");

  // verify new assignee is a member if provided
  if (data.assigneeId) {
    const assigneeMember = await findProjectMember({
      drizzleClient,
      supabaseClient,
      projectId,
      userId: data.assigneeId,
    });
    if (!assigneeMember) throw new Error("Assignee is not a project member");
  }

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
    changedBy: requesterId,
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
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteTicketById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  ticketId: string;
  requesterId: string;
}) => {
  const {
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    ticketId,
    requesterId,
  } = {
    ...params,
  };

  await verifyProjectExists({ drizzleClient, supabaseClient, projectId });

  const ticket = await findTicketById({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });
  if (!ticket) throw new Error("Ticket not found");

  // only reporter or project owner can delete
  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  const canDelete =
    ticket.reporterId === requesterId || project!.ownerId === requesterId;

  if (!canDelete) throw new Error("Forbidden");

  await deleteTicket({
    drizzleClient,
    supabaseClient,
    ticketId,
  });

  await cacheDel({ kv, key: cacheKeys.ticket(ticketId) });
  await cacheDel({ kv, key: cacheKeys.ticket_history(ticketId) });
  await cacheDel({ kv, key: cacheKeys.ticket_state(ticketId) });
  await cacheDel({ kv, key: cacheKeys.project_tickets(projectId) });
  await cacheDel({ kv, key: cacheKeys.ticket_comments(ticketId) });

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
