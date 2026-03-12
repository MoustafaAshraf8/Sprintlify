import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { CreateTicketDtoType, UpdateTicketDtoType } from "../dto/ticketDto";
import {
  findTicketsByProjectId,
  findTicketById,
  insertTicket,
  updateTicket,
  deleteTicket,
} from "../model/ticketModel";
import { findProjectById } from "../model/projectModel";
import { findProjectMember } from "../model/projectMemberModel";

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
  projectId: string;
  requesterId: string;
}) => {
  const { drizzleClient, supabaseClient, projectId, requesterId } = {
    ...params,
  };

  await verifyProjectExists({ drizzleClient, supabaseClient, projectId });
  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: requesterId,
  });

  return await findTicketsByProjectId({
    drizzleClient,
    supabaseClient,
    projectId,
  });
};

// ─── get by id ────────────────────────────────────────────────────────────────

export const getTicketById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  ticketId: string;
  requesterId: string;
}) => {
  const { drizzleClient, supabaseClient, projectId, ticketId, requesterId } = {
    ...params,
  };

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

  return ticket;
};

// ─── create ───────────────────────────────────────────────────────────────────

export const createTicket = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  requesterId: string;
  data: CreateTicketDtoType;
}) => {
  const { drizzleClient, supabaseClient, projectId, requesterId, data } = {
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

  return await insertTicket({
    drizzleClient,
    supabaseClient,
    data: {
      ...data,
      reporterId: requesterId,
      projectId,
    },
  });
};

// ─── update ───────────────────────────────────────────────────────────────────

export const updateTicketById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  ticketId: string;
  requesterId: string;
  data: UpdateTicketDtoType;
}) => {
  const {
    drizzleClient,
    supabaseClient,
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

  return await updateTicket({
    drizzleClient,
    supabaseClient,
    ticketId,
    data,
  });
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteTicketById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  ticketId: string;
  requesterId: string;
}) => {
  const { drizzleClient, supabaseClient, projectId, ticketId, requesterId } = {
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
};
