import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import {
  CreateTicketDto,
  TicketFilterDto,
  UpdateTicketDto,
} from "../dto/ticketDto";
import * as ticketService from "../service/ticketService";
import { getCtxVars } from "../helper/getCtxVars";
import { getCtxBind } from "../helper/getCtxBind";

export const getTickets = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const query = c.req.query();
  const parsed = TicketFilterDto.safeParse(query);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);
  const { drizzleClient, supabaseClient, user } = getCtxVars(c);
  const { kv } = getCtxBind(c);

  const result = await ticketService.getTickets({
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    userId: user.id,
    filters: parsed.data,
  });

  return c.json(result, 200);
};

export const getTicketById = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");
  const { drizzleClient, supabaseClient, user } = getCtxVars(c);
  const { kv } = getCtxBind(c);

  const result = await ticketService.getTicketById({
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    ticketId,
    userId: user.id,
  });

  return c.json(result, 200);
};

export const createTicket = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const body = await c.req.json();
  const parsed = CreateTicketDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);
  const { drizzleClient, supabaseClient, user } = getCtxVars(c);
  const { kv } = getCtxBind(c);

  const result = await ticketService.createTicket({
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    userId: user.id,
    data: parsed.data,
  });

  return c.json(result, 201);
};

export const updateTicket = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");
  const body = await c.req.json();
  const parsed = UpdateTicketDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);
  const { drizzleClient, supabaseClient, user } = getCtxVars(c);
  const { kv } = getCtxBind(c);

  const result = await ticketService.updateTicketById({
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    ticketId,
    userId: user.id,
    data: parsed.data,
  });

  return c.json(result, 200);
};

export const deleteTicket = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const ticketId = c.req.param("ticketId");
  const { drizzleClient, supabaseClient, user } = getCtxVars(c);
  const { kv } = getCtxBind(c);

  await ticketService.deleteTicketById({
    drizzleClient,
    supabaseClient,
    kv,
    projectId,
    ticketId,
    userId: user.id,
  });

  return c.json({ message: "Ticket deleted" }, 200);
};
