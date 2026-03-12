import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import {
  CreateTicketDto,
  TicketFilterDto,
  UpdateTicketDto,
} from "../dto/ticketDto";
import * as ticketService from "../service/ticketService";

const getCtxVars = (c: Context<AppContext>) => ({
  drizzleClient: c.get("drizzleClient"),
  supabaseClient: c.get("supabaseClient"),
  requesterId: c.get("user").id,
});

const getStatus = (message: string) =>
  message === "Forbidden"
    ? 403
    : message === "Project not found"
      ? 404
      : message === "Ticket not found"
        ? 404
        : 400;

// ─── get all ──────────────────────────────────────────────────────────────────

export const getTickets = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");

  // parse query params
  const query = c.req.query();
  const parsed = TicketFilterDto.safeParse(query);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
    const { drizzleClient, supabaseClient, requesterId } = getCtxVars(c);
    const result = await ticketService.getTickets({
      drizzleClient,
      supabaseClient,
      projectId,
      requesterId,
      filters: parsed.data,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── get by id ────────────────────────────────────────────────────────────────

export const getTicketById = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");

  try {
    const { drizzleClient, supabaseClient, requesterId } = getCtxVars(c);
    const result = await ticketService.getTicketById({
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

// ─── create ───────────────────────────────────────────────────────────────────

export const createTicket = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const body = await c.req.json();
  const parsed = CreateTicketDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
    const { drizzleClient, supabaseClient, requesterId } = getCtxVars(c);
    const result = await ticketService.createTicket({
      drizzleClient,
      supabaseClient,
      projectId,
      requesterId,
      data: parsed.data,
    });
    return c.json(result, 201);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── update ───────────────────────────────────────────────────────────────────

export const updateTicket = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");
  const body = await c.req.json();
  const parsed = UpdateTicketDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
    const { drizzleClient, supabaseClient, requesterId } = getCtxVars(c);
    const result = await ticketService.updateTicketById({
      drizzleClient,
      supabaseClient,
      projectId,
      ticketId,
      requesterId,
      data: parsed.data,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── delete ───────────────────────────────────────────────────────────────────

export const deleteTicket = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");

  try {
    const { drizzleClient, supabaseClient, requesterId } = getCtxVars(c);
    await ticketService.deleteTicketById({
      drizzleClient,
      supabaseClient,
      projectId,
      ticketId,
      requesterId,
    });
    return c.json({ message: "Ticket deleted" }, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};
