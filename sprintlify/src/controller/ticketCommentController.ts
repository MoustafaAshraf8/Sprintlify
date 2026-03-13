import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import { CreateTicketCommentDto } from "../dto/ticketDto";
import * as ticketCommentService from "../service/ticketCommentService";

const getCtxVars = (c: Context<AppContext>) => ({
  drizzleClient: c.get("drizzleClient"),
  supabaseClient: c.get("supabaseClient"),
  userId: c.get("user").id,
});

const getCtxBind = (c: Context<AppContext>) => ({
  kv: c.env.KVCASH,
});

const getStatus = (message: string) =>
  message === "Forbidden"
    ? 403
    : message === "Ticket not found"
      ? 404
      : message === "Comment not found"
        ? 404
        : 400;

// ─── get all ──────────────────────────────────────────────────────────────────

export const getTicketComments = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await ticketCommentService.getTicketComments({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      ticketId,
      userId,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── create ───────────────────────────────────────────────────────────────────

export const createTicketComment = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");
  const body = await c.req.json();
  const parsed = CreateTicketCommentDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await ticketCommentService.createTicketComment({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      ticketId,
      userId,
      data: parsed.data,
    });
    return c.json(result, 201);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteTicketComment = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");
  const commentId = c.req.param("commentId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    await ticketCommentService.deleteTicketCommentById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      ticketId,
      commentId,
      userId,
    });
    return c.json({ message: "Comment deleted" }, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};
