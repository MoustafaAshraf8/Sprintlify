import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import * as ticketHistoryService from "../service/ticketHistoryService";

const getCtxVars = (c: Context<AppContext>) => ({
  drizzleClient: c.get("drizzleClient"),
  supabaseClient: c.get("supabaseClient"),
  requesterId: c.get("user").id,
});

const getStatus = (message: string) =>
  message === "Forbidden" ? 403 : message === "Ticket not found" ? 404 : 400;

// ─── get history ──────────────────────────────────────────────────────────────

export const getTicketHistory = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");

  try {
    const { drizzleClient, supabaseClient, requesterId } = getCtxVars(c);
    const result = await ticketHistoryService.getTicketHistory({
      drizzleClient,
      supabaseClient,
      projectId,
      ticketId,
      requesterId,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── get state ────────────────────────────────────────────────────────────────

export const getTicketState = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");

  try {
    const { drizzleClient, supabaseClient, requesterId } = getCtxVars(c);
    const result = await ticketHistoryService.getTicketState({
      drizzleClient,
      supabaseClient,
      projectId,
      ticketId,
      requesterId,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};
