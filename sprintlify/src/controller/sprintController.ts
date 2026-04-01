import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import {
  CreateSprintDto,
  UpdateSprintDto,
  AddTicketToSprintDto,
} from "../dto/sprintDto";
import * as sprintService from "../service/sprintService";
import { getCtxBind } from "../helper/getCtxBind";
import { getCtxVars } from "../helper/getCtxVars";

export const getSprints = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");

    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.getSprints({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId:user.id,
    });
    return c.json(result, 200);
};

export const getActiveSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.getActiveSprint({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId:user.id,
    });

    return c.json(result ?? { message: "No active sprint" }, 200);
};

export const getSprintById = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.getSprintById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      userId:user.id,
    });

    return c.json(result, 200);
};

export const getBacklog = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.getBacklog({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId:user.id,
    });

    return c.json(result, 200);
};

export const createSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const body = await c.req.json();
  const parsed = CreateSprintDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.createSprint({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId:user.id,
      data: parsed.data,
    });

    return c.json(result, 201);
};

export const updateSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");
  const body = await c.req.json();
  const parsed = UpdateSprintDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.updateSprintById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      userId:user.id,
      data: parsed.data,
    });

    return c.json(result, 200);
};

export const startSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.startSprint({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      userId:user.id,
    });

    return c.json(result, 200);
};

export const completeSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.completeSprint({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      userId:user.id,
    });

    return c.json(result, 200);
};

export const deleteSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    await sprintService.deleteSprintById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      userId:user.id,
    });

    return c.json({ message: "Sprint deleted" }, 200);
};

export const addTicketToSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");
  const body = await c.req.json();
  const parsed = AddTicketToSprintDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.addTicketToSprintById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      ticketId: parsed.data.ticketId,
      userId:user.id,
    });

    return c.json(result, 200);
 
};

export const removeTicketFromSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");
  const ticketId = c.req.param("ticketId");
    const { drizzleClient, supabaseClient, user } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.removeTicketFromSprintById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      ticketId,
      userId:user.id,
    });
    
    return c.json(result, 200);
};
