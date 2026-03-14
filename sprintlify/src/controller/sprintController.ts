// src/controller/sprintController.ts
import { Context } from "hono";
import { AppContext } from "../types/AppContext";
import {
  CreateSprintDto,
  UpdateSprintDto,
  AddTicketToSprintDto,
} from "../dto/sprintDto";
import * as sprintService from "../service/sprintService";

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
    : message === "Project not found"
      ? 404
      : message === "Sprint not found"
        ? 404
        : message === "Ticket not found"
          ? 404
          : message === "A sprint is already active for this project"
            ? 409
            : message === "Ticket already in this sprint"
              ? 409
              : 400;

// ─── get all sprints ──────────────────────────────────────────────────────────

export const getSprints = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.getSprints({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── get active sprint ────────────────────────────────────────────────────────

export const getActiveSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.getActiveSprint({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId,
    });
    return c.json(result ?? { message: "No active sprint" }, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── get sprint by id ─────────────────────────────────────────────────────────

export const getSprintById = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.getSprintById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      userId,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── get backlog ──────────────────────────────────────────────────────────────

export const getBacklog = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.getBacklog({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── create sprint ────────────────────────────────────────────────────────────

export const createSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const body = await c.req.json();
  const parsed = CreateSprintDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.createSprint({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      userId,
      data: parsed.data,
    });
    return c.json(result, 201);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── update sprint ────────────────────────────────────────────────────────────

export const updateSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");
  const body = await c.req.json();
  const parsed = UpdateSprintDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.updateSprintById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      userId,
      data: parsed.data,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── start sprint ─────────────────────────────────────────────────────────────

export const startSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.startSprint({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      userId,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── complete sprint ──────────────────────────────────────────────────────────

export const completeSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.completeSprint({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      userId,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── delete sprint ────────────────────────────────────────────────────────────

export const deleteSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    await sprintService.deleteSprintById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      userId,
    });
    return c.json({ message: "Sprint deleted" }, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── add ticket to sprint ─────────────────────────────────────────────────────

export const addTicketToSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");
  const body = await c.req.json();
  const parsed = AddTicketToSprintDto.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.flatten() }, 400);

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.addTicketToSprintById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      ticketId: parsed.data.ticketId,
      userId,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};

// ─── remove ticket from sprint ────────────────────────────────────────────────

export const removeTicketFromSprint = async (c: Context<AppContext>) => {
  const projectId = c.req.param("projectId");
  const sprintId = c.req.param("sprintId");
  const ticketId = c.req.param("ticketId");

  try {
    const { drizzleClient, supabaseClient, userId } = getCtxVars(c);
    const { kv } = getCtxBind(c);
    const result = await sprintService.removeTicketFromSprintById({
      drizzleClient,
      supabaseClient,
      kv,
      projectId,
      sprintId,
      ticketId,
      userId,
    });
    return c.json(result, 200);
  } catch (err: any) {
    return c.json({ message: err.message }, getStatus(err.message));
  }
};
