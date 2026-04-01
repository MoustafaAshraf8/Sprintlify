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
import { ForbiddenError } from "../error/AppError";

const verifyMembership = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  projectId: string;
  userId: string;
}) => {
  return await findProjectMember({ ...params });
};

const verifyTicketExists = async (params: {
  drizzleClient: DrizzleClientType;
  supabaseClient: SupabaseClientType;
  ticketId: string;
  projectId: string;
}) => {
  return await findTicketById({ ...params });
};

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

  const project = await findProjectById({
    drizzleClient,
    supabaseClient,
    projectId,
  });

  const canDelete = comment.userId === userId || project!.ownerId === userId;

  if (!canDelete) throw new ForbiddenError();

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
