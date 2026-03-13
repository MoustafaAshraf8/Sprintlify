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
import { cacheKeys } from "../cache/cacheKeys";
import { cacheDel, cacheGet, cacheSet } from "../cache/kvCache";
import { KVNamespace } from "@cloudflare/workers-types";

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
    userId: userId,
  });

  await verifyTicketExists({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });

  const cacheKey = cacheKeys.ticket_comments(ticketId);
  const cached = await cacheGet({ kv, key: cacheKey });
  if (cached) return cached;

  const ticketComments = await findTicketCommentsByTicketId({
    drizzleClient,
    supabaseClient,
    ticketId,
  });

  await cacheSet({ kv, key: cacheKey, data: ticketComments });

  return ticketComments;
};

// ─── create ───────────────────────────────────────────────────────────────────

export const createTicketComment = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  ticketId: string;
  userId: string;
  data: CreateTicketCommentDtoType;
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

  await verifyTicketExists({
    drizzleClient,
    supabaseClient,
    ticketId,
    projectId,
  });

  const ticketComment = await insertTicketComment({
    drizzleClient,
    supabaseClient,
    data: {
      body: data.body,
      ticketId,
      userId: userId,
    },
  });

  const updatedComments = await findTicketCommentsByTicketId({
    drizzleClient,
    supabaseClient,
    ticketId,
  });

  await cacheSet({
    kv,
    key: cacheKeys.ticket_comments(ticketId),
    data: updatedComments,
  });

  return ticketComment;
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteTicketCommentById = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  kv: KVNamespace;
  projectId: string;
  ticketId: string;
  commentId: string;
  userId: string;
}) => {
  const {
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    ticketId,
    commentId,
    userId,
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

  const canDelete = comment.userId === userId || project!.ownerId === userId;

  if (!canDelete) throw new Error("Forbidden");

  await deleteTicketComment({
    drizzleClient,
    supabaseClient,
    commentId,
  });

  const updatedComments = await findTicketCommentsByTicketId({
    drizzleClient,
    supabaseClient,
    ticketId,
  });

  await cacheSet({
    kv,
    key: cacheKeys.ticket_comments(ticketId),
    data: updatedComments,
  });

  return;
};
