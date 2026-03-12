import { DrizzleClientType } from "../types/drizzleClientType";
import { SupabaseClientType } from "../types/supabaseClientType";
import { CreateTicketCommentDtoType } from "../dto/ticketDto";
import {
  findTicketCommentsByTicketId,
  findTicketCommentById,
  insertTicketComment,
  deleteTicketComment,
} from "../model/ticketCommentModel";
import { findTicketById } from "../model/ticketModel";
import { findProjectById } from "../model/projectModel";
import { findProjectMember } from "../model/projectMemberModel";

// ─── verify helpers ───────────────────────────────────────────────────────────

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

const verifyTicketExists = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
  projectId: string;
}) => {
  const ticket = await findTicketById({ ...params });
  if (!ticket) throw new Error("Ticket not found");
  return ticket;
};

// ─── get all ──────────────────────────────────────────────────────────────────

export const getTicketComments = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  ticketId: string;
  requesterId: string;
}) => {
  const { drizzleClient, supabaseClient, projectId, ticketId, requesterId } = {
    ...params,
  };

  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: requesterId,
  });

  await verifyTicketExists({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });

  return await findTicketCommentsByTicketId({
    drizzleClient,
    supabaseClient,
    ticketId,
  });
};

// ─── create ───────────────────────────────────────────────────────────────────

export const createTicketComment = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  ticketId: string;
  requesterId: string;
  data: CreateTicketCommentDtoType;
}) => {
  const {
    drizzleClient,
    supabaseClient,
    projectId,
    ticketId,
    requesterId,
    data,
  } = { ...params };

  await verifyMembership({
    drizzleClient,
    supabaseClient,
    projectId,
    userId: requesterId,
  });

  await verifyTicketExists({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });

  return await insertTicketComment({
    drizzleClient,
    supabaseClient,
    data: {
      body: data.body,
      ticketId,
      userId: requesterId,
    },
  });
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteTicketCommentById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  ticketId: string;
  commentId: string;
  requesterId: string;
}) => {
  const {
    drizzleClient,
    supabaseClient,
    projectId,
    ticketId,
    commentId,
    requesterId,
  } = { ...params };

  await verifyTicketExists({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });

  const comment = await findTicketCommentById({
    drizzleClient,
    supabaseClient,
    commentId,
    ticketId,
  });
  if (!comment) throw new Error("Comment not found");

  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  const canDelete =
    comment.userId === requesterId || project!.ownerId === requesterId;

  if (!canDelete) throw new Error("Forbidden");

  await deleteTicketComment({
    drizzleClient,
    supabaseClient,
    commentId,
  });
};
