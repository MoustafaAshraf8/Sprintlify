import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import { CreateTicketCommentDto } from "../dto/ticketDto";
import * as ticketCommentService from "../service/ticketCommentService";
import { getCtxVars } from "../helper/getCtxVars";
import { getCtxBind } from "../helper/getCtxBind";

export const getTicketComments = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");
  const { drizzleClient, supabaseClient, user } = getCtxVars(c);
  const { kv } = getCtxBind(c);

  const result = await ticketCommentService.getTicketComments({
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    ticketId,
    userId: user.id,
  });

  return c.json(result, 200);
};

export const createTicketComment = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");
  const body = await c.req.json();
  const parsed = CreateTicketCommentDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);
  const { drizzleClient, supabaseClient, user } = getCtxVars(c);
  const { kv } = getCtxBind(c);

  const result = await ticketCommentService.createTicketComment({
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    ticketId,
    userId: user.id,
    data: parsed.data,
  });

  return c.json(result, 201);
};

export const deleteTicketComment = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");
  const commentId = c.req.param("commentId");
  const { drizzleClient, supabaseClient, user } = getCtxVars(c);
  const { kv } = getCtxBind(c);

  await ticketCommentService.deleteTicketCommentById({
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    ticketId,
    commentId,
    userId: user.id,
  });

  return c.json({ message: "Comment deleted" }, 200);
};
